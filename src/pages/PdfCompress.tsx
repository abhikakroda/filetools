import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FileDown, Download, Trash2, RefreshCw, FileText, Check, Target, Settings2 } from "lucide-react";
import { PDFDocument } from "pdf-lib";
import * as pdfjsLib from "pdfjs-dist";
import { ToolLayout } from "@/components/ToolLayout";
import { FileDropzone } from "@/components/FileDropzone";
import { toast } from "sonner";

// Set the worker source
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

interface CompressedPdf {
  blob: Blob;
  originalSize: number;
  compressedSize: number;
  name: string;
}

const targetSizeOptions = [
  { value: 0.1, label: "100 KB" },
  { value: 0.25, label: "250 KB" },
  { value: 0.5, label: "500 KB" },
  { value: 1, label: "1 MB" },
  { value: 2, label: "2 MB" },
  { value: 5, label: "5 MB" },
];

const PdfCompress = () => {
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [compressedPdf, setCompressedPdf] = useState<CompressedPdf | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [compressionMode, setCompressionMode] = useState<"target" | "level">("target");
  const [targetSize, setTargetSize] = useState(1); // MB
  const [quality, setQuality] = useState<"low" | "medium" | "high">("medium");
  const [progress, setProgress] = useState(0);

  const handleFilesSelected = useCallback(async (selectedFiles: File[]) => {
    const pdfFiles = selectedFiles.filter((f) => f.type === "application/pdf");
    if (pdfFiles.length === 0) {
      toast.error("Please select a PDF file");
      return;
    }

    setPdfFile(pdfFiles[0]);
    setCompressedPdf(null);
    setProgress(0);
    toast.success("PDF loaded successfully");
  }, []);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const renderPageToImage = async (
    pdfDoc: pdfjsLib.PDFDocumentProxy,
    pageNum: number,
    scale: number,
    jpegQuality: number
  ): Promise<Blob> => {
    const page = await pdfDoc.getPage(pageNum);
    const viewport = page.getViewport({ scale });
    
    const canvas = document.createElement("canvas");
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    
    const context = canvas.getContext("2d")!;
    context.fillStyle = "white";
    context.fillRect(0, 0, canvas.width, canvas.height);
    
    await page.render({ canvasContext: context, viewport }).promise;
    
    return new Promise((resolve) => {
      canvas.toBlob(
        (blob) => resolve(blob!),
        "image/jpeg",
        jpegQuality
      );
    });
  };

  const compressPdfWithImages = async (
    arrayBuffer: ArrayBuffer,
    targetBytes: number
  ): Promise<Blob> => {
    const pdfDoc = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    const numPages = pdfDoc.numPages;
    
    // Binary search for the right quality/scale combination
    let minQuality = 0.1;
    let maxQuality = 0.95;
    let bestBlob: Blob | null = null;
    let scale = 1.5;
    
    // Adjust initial scale based on target size
    if (targetBytes < 500 * 1024) {
      scale = 0.8;
    } else if (targetBytes < 1024 * 1024) {
      scale = 1.0;
    }
    
    // Try different quality levels to find the best fit
    for (let attempt = 0; attempt < 5; attempt++) {
      const testQuality = (minQuality + maxQuality) / 2;
      
      const newPdf = await PDFDocument.create();
      
      for (let i = 1; i <= numPages; i++) {
        setProgress(Math.round((i / numPages) * 80 + attempt * 4));
        
        const imageBlob = await renderPageToImage(pdfDoc, i, scale, testQuality);
        const imageBytes = await imageBlob.arrayBuffer();
        const image = await newPdf.embedJpg(new Uint8Array(imageBytes));
        
        const page = newPdf.addPage([image.width, image.height]);
        page.drawImage(image, {
          x: 0,
          y: 0,
          width: image.width,
          height: image.height,
        });
      }
      
      const pdfBytes = await newPdf.save();
      const blob = new Blob([new Uint8Array(pdfBytes)], { type: "application/pdf" });
      
      if (blob.size <= targetBytes) {
        bestBlob = blob;
        minQuality = testQuality;
      } else {
        maxQuality = testQuality;
        if (!bestBlob || blob.size < bestBlob.size) {
          bestBlob = blob;
        }
      }
      
      // If we're close enough to target, stop
      if (blob.size <= targetBytes && blob.size >= targetBytes * 0.7) {
        break;
      }
      
      // Reduce scale if still too large
      if (blob.size > targetBytes * 2 && scale > 0.5) {
        scale *= 0.8;
      }
    }
    
    setProgress(100);
    return bestBlob!;
  };

  const compressPdf = async () => {
    if (!pdfFile) return;

    setIsProcessing(true);
    setProgress(0);

    try {
      const arrayBuffer = await pdfFile.arrayBuffer();
      
      let blob: Blob;
      
      if (compressionMode === "target") {
        const targetBytes = targetSize * 1024 * 1024;
        
        // If file is already smaller than target, just optimize it
        if (pdfFile.size <= targetBytes) {
          const originalPdf = await PDFDocument.load(arrayBuffer);
          const compressedDoc = await PDFDocument.create();
          const pages = await compressedDoc.copyPages(originalPdf, originalPdf.getPageIndices());
          pages.forEach(page => compressedDoc.addPage(page));
          const pdfBytes = await compressedDoc.save({ useObjectStreams: true });
          blob = new Blob([new Uint8Array(pdfBytes)], { type: "application/pdf" });
        } else {
          blob = await compressPdfWithImages(arrayBuffer, targetBytes);
        }
      } else {
        // Level-based compression using image conversion
        const qualityMap = { low: 0.3, medium: 0.6, high: 0.85 };
        const scaleMap = { low: 0.7, medium: 1.0, high: 1.2 };
        
        const pdfDoc = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        const numPages = pdfDoc.numPages;
        const newPdf = await PDFDocument.create();
        
        for (let i = 1; i <= numPages; i++) {
          setProgress(Math.round((i / numPages) * 100));
          
          const imageBlob = await renderPageToImage(
            pdfDoc, 
            i, 
            scaleMap[quality], 
            qualityMap[quality]
          );
          const imageBytes = await imageBlob.arrayBuffer();
          const image = await newPdf.embedJpg(new Uint8Array(imageBytes));
          
          const page = newPdf.addPage([image.width, image.height]);
          page.drawImage(image, {
            x: 0,
            y: 0,
            width: image.width,
            height: image.height,
          });
        }
        
        const pdfBytes = await newPdf.save();
        blob = new Blob([new Uint8Array(pdfBytes)], { type: "application/pdf" });
      }

      setCompressedPdf({
        blob,
        originalSize: pdfFile.size,
        compressedSize: blob.size,
        name: pdfFile.name.replace(".pdf", "_compressed.pdf"),
      });

      const savings = ((1 - blob.size / pdfFile.size) * 100).toFixed(1);
      if (parseFloat(savings) > 0) {
        toast.success(`Compressed! Reduced by ${savings}%`);
      } else {
        toast.info("PDF is already optimized, minimal compression possible");
      }
    } catch (error) {
      toast.error("Failed to compress PDF");
      console.error(error);
    } finally {
      setIsProcessing(false);
      setProgress(0);
    }
  };

  const downloadPdf = () => {
    if (!compressedPdf) return;

    const url = URL.createObjectURL(compressedPdf.blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = compressedPdf.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const clearAll = () => {
    setPdfFile(null);
    setCompressedPdf(null);
  };

  const savingsPercent = compressedPdf
    ? ((1 - compressedPdf.compressedSize / compressedPdf.originalSize) * 100).toFixed(1)
    : 0;

  return (
    <ToolLayout
      title="PDF Compress"
      description="Reduce PDF file size for easier sharing. All processing happens locally."
      icon={FileDown}
    >
      <div className="space-y-6">
        <FileDropzone
          accept="application/pdf"
          onFilesSelected={handleFilesSelected}
          label="Drop PDF file here"
          description="Select a PDF to compress"
        />

        <AnimatePresence>
          {pdfFile && !compressedPdf && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="settings-panel space-y-6"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-xl bg-accent flex items-center justify-center">
                    <FileText className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium truncate max-w-[200px] sm:max-w-none">
                      {pdfFile.name}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {formatFileSize(pdfFile.size)}
                    </p>
                  </div>
                </div>
                <button
                  onClick={clearAll}
                  className="p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-destructive transition-colors"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>

              {/* Compression Mode Toggle */}
              <div>
                <label className="block text-sm font-medium mb-3">Compression Mode</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setCompressionMode("target")}
                    className={`py-3 px-4 rounded-xl font-medium transition-all duration-300 flex items-center justify-center gap-2 ${
                      compressionMode === "target"
                        ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25"
                        : "bg-muted hover:bg-muted/80"
                    }`}
                  >
                    <Target className="h-4 w-4" />
                    Target Size
                  </button>
                  <button
                    onClick={() => setCompressionMode("level")}
                    className={`py-3 px-4 rounded-xl font-medium transition-all duration-300 flex items-center justify-center gap-2 ${
                      compressionMode === "level"
                        ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25"
                        : "bg-muted hover:bg-muted/80"
                    }`}
                  >
                    <Settings2 className="h-4 w-4" />
                    Compression Level
                  </button>
                </div>
              </div>

              <AnimatePresence mode="wait">
                {compressionMode === "target" ? (
                  <motion.div
                    key="target"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                  >
                    <label className="block text-sm font-medium mb-3">
                      Target File Size
                    </label>
                    <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                      {targetSizeOptions.map((option) => (
                        <button
                          key={option.value}
                          onClick={() => setTargetSize(option.value)}
                          className={`py-2.5 px-3 rounded-xl font-medium text-sm transition-all duration-300 ${
                            targetSize === option.value
                              ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25"
                              : "bg-muted hover:bg-muted/80"
                          }`}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      PDF will be compressed to approximately {targetSize < 1 ? `${targetSize * 1000} KB` : `${targetSize} MB`} or smaller
                    </p>
                  </motion.div>
                ) : (
                  <motion.div
                    key="level"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                  >
                    <label className="block text-sm font-medium mb-3">
                      Compression Level
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { value: "low", label: "Maximum", desc: "Smallest size" },
                        { value: "medium", label: "Balanced", desc: "Recommended" },
                        { value: "high", label: "Minimum", desc: "Best quality" },
                      ].map((q) => (
                        <button
                          key={q.value}
                          onClick={() => setQuality(q.value as typeof quality)}
                          className={`py-3 px-4 rounded-xl font-medium transition-all duration-300 text-left ${
                            quality === q.value
                              ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25"
                              : "bg-muted hover:bg-muted/80"
                          }`}
                        >
                          <span className="block text-sm">{q.label}</span>
                          <span
                            className={`block text-xs mt-0.5 ${
                              quality === q.value
                                ? "text-primary-foreground/70"
                                : "text-muted-foreground"
                            }`}
                          >
                            {q.desc}
                          </span>
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {isProcessing && progress > 0 && (
                <div className="mb-4">
                  <div className="flex justify-between text-sm text-muted-foreground mb-2">
                    <span>Compressing...</span>
                    <span>{progress}%</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-primary"
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                </div>
              )}

              <button
                onClick={compressPdf}
                disabled={isProcessing}
                className="btn-primary w-full disabled:opacity-50"
              >
                {isProcessing ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    Compressing... {progress}%
                  </>
                ) : (
                  <>
                    <FileDown className="h-4 w-4" />
                    {compressionMode === "target"
                      ? `Compress to ${targetSize < 1 ? `${targetSize * 1000} KB` : `${targetSize} MB`}`
                      : "Compress PDF"
                    }
                  </>
                )}
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {compressedPdf && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="settings-panel"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="h-12 w-12 rounded-xl bg-success/20 flex items-center justify-center">
                  <Check className="h-6 w-6 text-success" />
                </div>
                <div>
                  <p className="font-semibold text-lg">Compression Complete!</p>
                  <p className="text-sm text-muted-foreground">
                    Your PDF is ready to download
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="text-center p-4 rounded-xl bg-muted">
                  <p className="text-sm text-muted-foreground mb-1">Original</p>
                  <p className="font-semibold">
                    {formatFileSize(compressedPdf.originalSize)}
                  </p>
                </div>
                <div className="text-center p-4 rounded-xl bg-muted">
                  <p className="text-sm text-muted-foreground mb-1">Compressed</p>
                  <p className="font-semibold">
                    {formatFileSize(compressedPdf.compressedSize)}
                  </p>
                </div>
                <div className="text-center p-4 rounded-xl bg-success/10">
                  <p className="text-sm text-muted-foreground mb-1">Saved</p>
                  <p className="font-semibold text-success">{savingsPercent}%</p>
                </div>
              </div>

              <div className="flex gap-3">
                <button onClick={clearAll} className="btn-secondary flex-1">
                  <Trash2 className="h-4 w-4" />
                  New PDF
                </button>
                <button onClick={downloadPdf} className="btn-primary flex-1">
                  <Download className="h-4 w-4" />
                  Download PDF
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </ToolLayout>
  );
};

export default PdfCompress;
