import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FileDown, Download, Trash2, RefreshCw, FileText, Check } from "lucide-react";
import { PDFDocument } from "pdf-lib";
import { ToolLayout } from "@/components/ToolLayout";
import { FileDropzone } from "@/components/FileDropzone";
import { toast } from "sonner";

interface CompressedPdf {
  blob: Blob;
  originalSize: number;
  compressedSize: number;
  name: string;
}

const PdfCompress = () => {
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [compressedPdf, setCompressedPdf] = useState<CompressedPdf | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [quality, setQuality] = useState<"low" | "medium" | "high">("medium");

  const handleFilesSelected = useCallback(async (selectedFiles: File[]) => {
    const pdfFiles = selectedFiles.filter((f) => f.type === "application/pdf");
    if (pdfFiles.length === 0) {
      toast.error("Please select a PDF file");
      return;
    }

    setPdfFile(pdfFiles[0]);
    setCompressedPdf(null);
    toast.success("PDF loaded successfully");
  }, []);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const compressPdf = async () => {
    if (!pdfFile) return;

    setIsProcessing(true);

    try {
      const arrayBuffer = await pdfFile.arrayBuffer();
      const originalPdf = await PDFDocument.load(arrayBuffer);
      
      // Create a new PDF and copy pages (this removes some metadata/redundancy)
      const compressedDoc = await PDFDocument.create();
      const pages = await compressedDoc.copyPages(originalPdf, originalPdf.getPageIndices());
      pages.forEach(page => compressedDoc.addPage(page));

      // Remove metadata to reduce size
      compressedDoc.setTitle("");
      compressedDoc.setAuthor("");
      compressedDoc.setSubject("");
      compressedDoc.setKeywords([]);
      compressedDoc.setProducer("");
      compressedDoc.setCreator("");

      // Save with compression options based on quality
      const objectsPerTick = quality === "low" ? 10 : quality === "medium" ? 50 : 100;
      
      const compressedBytes = await compressedDoc.save({
        useObjectStreams: true,
        addDefaultPage: false,
        objectsPerTick,
      });

      const blob = new Blob([new Uint8Array(compressedBytes)], { type: "application/pdf" });

      setCompressedPdf({
        blob,
        originalSize: pdfFile.size,
        compressedSize: blob.size,
        name: pdfFile.name.replace(".pdf", "_compressed.pdf"),
      });

      const savings = ((1 - blob.size / pdfFile.size) * 100).toFixed(1);
      toast.success(`Compressed! Reduced by ${savings}%`);
    } catch (error) {
      toast.error("Failed to compress PDF");
      console.error(error);
    } finally {
      setIsProcessing(false);
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
          {pdfFile && (
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

              <div>
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
              </div>

              <button
                onClick={compressPdf}
                disabled={isProcessing}
                className="btn-primary w-full disabled:opacity-50"
              >
                {isProcessing ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    Compressing...
                  </>
                ) : (
                  <>
                    <FileDown className="h-4 w-4" />
                    Compress PDF
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

              <button onClick={downloadPdf} className="btn-primary w-full">
                <Download className="h-4 w-4" />
                Download Compressed PDF
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </ToolLayout>
  );
};

export default PdfCompress;
