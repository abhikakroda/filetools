import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FileType2, Download, Trash2, RefreshCw, GripVertical } from "lucide-react";
import { jsPDF } from "jspdf";
import { ToolLayout } from "@/components/ToolLayout";
import { FileDropzone } from "@/components/FileDropzone";
import { toast } from "sonner";

interface ImageFile {
  file: File;
  preview: string;
}

const ImageToPdf = () => {
  const [images, setImages] = useState<ImageFile[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [pdfBlob, setPdfBlob] = useState<Blob | null>(null);

  const handleFilesSelected = useCallback((selectedFiles: File[]) => {
    const imageFiles = selectedFiles.filter((f) => f.type.startsWith("image/"));

    if (imageFiles.length !== selectedFiles.length) {
      toast.error("Some files were skipped. Only images are accepted.");
    }

    const newImages: ImageFile[] = imageFiles.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
    }));

    setImages((prev) => [...prev, ...newImages]);
    setPdfBlob(null);
  }, []);

  const removeImage = useCallback((index: number) => {
    setImages((prev) => {
      URL.revokeObjectURL(prev[index].preview);
      return prev.filter((_, i) => i !== index);
    });
    setPdfBlob(null);
  }, []);

  const clearAll = useCallback(() => {
    images.forEach((img) => URL.revokeObjectURL(img.preview));
    setImages([]);
    setPdfBlob(null);
  }, [images]);

  const moveImage = (from: number, to: number) => {
    if (to < 0 || to >= images.length) return;
    const newImages = [...images];
    const [removed] = newImages.splice(from, 1);
    newImages.splice(to, 0, removed);
    setImages(newImages);
    setPdfBlob(null);
  };

  const generatePdf = async () => {
    if (images.length === 0) return;

    setIsProcessing(true);

    try {
      const pdf = new jsPDF();
      let isFirstPage = true;

      for (const image of images) {
        const img = new Image();
        img.src = image.preview;

        await new Promise((resolve) => {
          img.onload = resolve;
        });

        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();

        const imgRatio = img.width / img.height;
        const pageRatio = pageWidth / pageHeight;

        let imgWidth, imgHeight;

        if (imgRatio > pageRatio) {
          imgWidth = pageWidth - 20;
          imgHeight = imgWidth / imgRatio;
        } else {
          imgHeight = pageHeight - 20;
          imgWidth = imgHeight * imgRatio;
        }

        const x = (pageWidth - imgWidth) / 2;
        const y = (pageHeight - imgHeight) / 2;

        if (!isFirstPage) {
          pdf.addPage();
        }

        pdf.addImage(image.preview, "JPEG", x, y, imgWidth, imgHeight);
        isFirstPage = false;
      }

      const blob = pdf.output("blob");
      setPdfBlob(blob);
      toast.success("PDF generated successfully!");
    } catch (error) {
      toast.error("Failed to generate PDF");
      console.error(error);
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadPdf = () => {
    if (!pdfBlob) return;

    const url = URL.createObjectURL(pdfBlob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "images.pdf";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <ToolLayout
      title="Image to PDF"
      description="Convert one or multiple images into a PDF document. Drag to reorder pages."
      icon={FileType2}
    >
      <div className="space-y-6">
        <FileDropzone
          accept="image/*"
          onFilesSelected={handleFilesSelected}
          label="Drop images here"
          description="PNG, JPG, JPEG, WebP supported. Add multiple for multi-page PDF."
        />

        <AnimatePresence>
          {images.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">
                  {images.length} image{images.length !== 1 ? "s" : ""} • Drag to
                  reorder
                </span>
                <button
                  onClick={clearAll}
                  className="text-sm text-muted-foreground hover:text-destructive transition-colors flex items-center gap-1"
                >
                  <Trash2 className="h-4 w-4" />
                  Clear all
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {images.map((image, index) => (
                  <motion.div
                    key={image.preview}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="relative group aspect-[3/4] bg-card border border-border rounded-xl overflow-hidden"
                  >
                    <img
                      src={image.preview}
                      alt={image.file.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/50 transition-colors">
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="flex gap-2">
                          <button
                            onClick={() => moveImage(index, index - 1)}
                            disabled={index === 0}
                            className="h-8 w-8 rounded-lg bg-card/90 flex items-center justify-center disabled:opacity-50"
                          >
                            ←
                          </button>
                          <button
                            onClick={() => moveImage(index, index + 1)}
                            disabled={index === images.length - 1}
                            className="h-8 w-8 rounded-lg bg-card/90 flex items-center justify-center disabled:opacity-50"
                          >
                            →
                          </button>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => removeImage(index)}
                      className="absolute top-2 right-2 h-6 w-6 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      ×
                    </button>
                    <div className="absolute bottom-2 left-2 px-2 py-1 rounded bg-card/90 text-xs font-medium">
                      {index + 1}
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {images.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-card border border-border rounded-xl p-4"
          >
            <div className="text-center sm:text-left">
              <p className="text-sm text-muted-foreground">
                {images.length} page{images.length !== 1 ? "s" : ""} in PDF
              </p>
            </div>

            <div className="flex gap-3">
              {pdfBlob && (
                <button onClick={downloadPdf} className="btn-secondary">
                  <Download className="h-4 w-4" />
                  Download PDF
                </button>
              )}
              <button
                onClick={generatePdf}
                disabled={isProcessing}
                className="btn-primary disabled:opacity-50"
              >
                {isProcessing ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <FileType2 className="h-4 w-4" />
                    {pdfBlob ? "Regenerate PDF" : "Generate PDF"}
                  </>
                )}
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </ToolLayout>
  );
};

export default ImageToPdf;
