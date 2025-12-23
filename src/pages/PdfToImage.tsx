import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Image, Download, Trash2, RefreshCw, FileText, ImageIcon } from "lucide-react";
import * as pdfjsLib from "pdfjs-dist";
import { ToolLayout } from "@/components/ToolLayout";
import { FileDropzone } from "@/components/FileDropzone";
import { toast } from "sonner";

// Set the worker source
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

interface ConvertedImage {
  dataUrl: string;
  pageNumber: number;
  width: number;
  height: number;
}

const PdfToImage = () => {
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [images, setImages] = useState<ConvertedImage[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [scale, setScale] = useState(2);
  const [format, setFormat] = useState<"png" | "jpeg">("png");
  const [pageCount, setPageCount] = useState(0);

  const handleFilesSelected = useCallback(async (selectedFiles: File[]) => {
    const pdfFiles = selectedFiles.filter((f) => f.type === "application/pdf");
    if (pdfFiles.length === 0) {
      toast.error("Please select a PDF file");
      return;
    }

    const file = pdfFiles[0];
    setPdfFile(file);
    setImages([]);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      setPageCount(pdf.numPages);
      toast.success(`PDF loaded: ${pdf.numPages} pages`);
    } catch (error) {
      toast.error("Failed to load PDF");
      console.error(error);
    }
  }, []);

  const convertToImages = async () => {
    if (!pdfFile) return;

    setIsProcessing(true);
    setImages([]);

    try {
      const arrayBuffer = await pdfFile.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      const convertedImages: ConvertedImage[] = [];

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale });

        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d")!;
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        await page.render({
          canvasContext: context,
          viewport: viewport,
        }).promise;

        const mimeType = format === "png" ? "image/png" : "image/jpeg";
        const quality = format === "jpeg" ? 0.92 : undefined;
        const dataUrl = canvas.toDataURL(mimeType, quality);

        convertedImages.push({
          dataUrl,
          pageNumber: i,
          width: viewport.width,
          height: viewport.height,
        });
      }

      setImages(convertedImages);
      toast.success(`Converted ${convertedImages.length} pages to images!`);
    } catch (error) {
      toast.error("Failed to convert PDF");
      console.error(error);
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadImage = (image: ConvertedImage) => {
    const link = document.createElement("a");
    link.href = image.dataUrl;
    link.download = `page-${image.pageNumber}.${format}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const downloadAll = () => {
    images.forEach((image, index) => {
      setTimeout(() => downloadImage(image), index * 200);
    });
  };

  const clearAll = () => {
    setPdfFile(null);
    setImages([]);
    setPageCount(0);
  };

  return (
    <ToolLayout
      title="PDF to Image"
      description="Convert PDF pages to high-quality images. All processing happens locally."
      icon={Image}
    >
      <div className="space-y-6">
        <FileDropzone
          accept="application/pdf"
          onFilesSelected={handleFilesSelected}
          label="Drop PDF file here"
          description="Select a PDF to convert to images"
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
                      {pageCount} page{pageCount !== 1 ? "s" : ""}
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

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Output Format
                  </label>
                  <div className="flex gap-2">
                    {(["png", "jpeg"] as const).map((f) => (
                      <button
                        key={f}
                        onClick={() => setFormat(f)}
                        className={`flex-1 py-2.5 px-4 rounded-xl font-medium transition-all duration-300 ${
                          format === f
                            ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25"
                            : "bg-muted hover:bg-muted/80"
                        }`}
                      >
                        {f.toUpperCase()}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Quality Scale: {scale}x
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="4"
                    step="0.5"
                    value={scale}
                    onChange={(e) => setScale(parseFloat(e.target.value))}
                    className="w-full accent-primary h-2 rounded-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>1x (Fast)</span>
                    <span>4x (High Quality)</span>
                  </div>
                </div>
              </div>

              <button
                onClick={convertToImages}
                disabled={isProcessing}
                className="btn-primary w-full disabled:opacity-50"
              >
                {isProcessing ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    Converting...
                  </>
                ) : (
                  <>
                    <ImageIcon className="h-4 w-4" />
                    Convert to Images
                  </>
                )}
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {images.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4"
            >
              <div className="flex items-center justify-between">
                <span className="font-medium">
                  {images.length} Image{images.length !== 1 ? "s" : ""} Ready
                </span>
                <button onClick={downloadAll} className="btn-secondary">
                  <Download className="h-4 w-4" />
                  Download All
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {images.map((image, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.05 }}
                    className="group relative rounded-xl overflow-hidden border border-border bg-card"
                  >
                    <img
                      src={image.dataUrl}
                      alt={`Page ${image.pageNumber}`}
                      className="w-full aspect-[3/4] object-cover"
                    />
                    <div className="absolute inset-0 bg-foreground/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <button
                        onClick={() => downloadImage(image)}
                        className="btn-primary py-2 px-4 text-sm"
                      >
                        <Download className="h-4 w-4" />
                        Download
                      </button>
                    </div>
                    <div className="absolute bottom-2 left-2 px-2 py-1 rounded-lg bg-card/90 text-xs font-medium">
                      Page {image.pageNumber}
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </ToolLayout>
  );
};

export default PdfToImage;
