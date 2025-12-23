import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FileImage, Download, Trash2, RefreshCw } from "lucide-react";
import { useParams } from "react-router-dom";
import { ToolLayout } from "@/components/ToolLayout";
import { FileDropzone } from "@/components/FileDropzone";
import { toast } from "sonner";

interface ConvertedFile {
  original: File;
  converted: Blob | null;
  status: "pending" | "processing" | "done" | "error";
}

const ImageConvert = () => {
  const { format } = useParams<{ format: string }>();
  const targetFormat = format?.toUpperCase() || "PNG";
  const mimeType = format === "jpeg" ? "image/jpeg" : "image/png";

  const [files, setFiles] = useState<ConvertedFile[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFilesSelected = useCallback((selectedFiles: File[]) => {
    const imageFiles = selectedFiles.filter((f) =>
      f.type.startsWith("image/")
    );

    if (imageFiles.length !== selectedFiles.length) {
      toast.error("Some files were skipped. Only images are accepted.");
    }

    const newFiles: ConvertedFile[] = imageFiles.map((file) => ({
      original: file,
      converted: null,
      status: "pending",
    }));

    setFiles((prev) => [...prev, ...newFiles]);
  }, []);

  const removeFile = useCallback((index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const clearAll = useCallback(() => {
    setFiles([]);
  }, []);

  const convertFiles = async () => {
    if (files.length === 0) return;

    setIsProcessing(true);

    for (let i = 0; i < files.length; i++) {
      if (files[i].status === "done") continue;

      setFiles((prev) =>
        prev.map((f, idx) =>
          idx === i ? { ...f, status: "processing" } : f
        )
      );

      try {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        if (!ctx) throw new Error("Could not get canvas context");

        const img = new Image();
        img.src = URL.createObjectURL(files[i].original);

        await new Promise((resolve) => {
          img.onload = resolve;
        });

        canvas.width = img.width;
        canvas.height = img.height;

        // For PNG, preserve transparency
        if (format === "png") {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
        } else {
          // For JPEG, fill with white background
          ctx.fillStyle = "#FFFFFF";
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        }

        ctx.drawImage(img, 0, 0);

        const blob = await new Promise<Blob>((resolve, reject) => {
          canvas.toBlob(
            (blob) => {
              if (blob) resolve(blob);
              else reject(new Error("Failed to convert"));
            },
            mimeType,
            0.9
          );
        });

        setFiles((prev) =>
          prev.map((f, idx) =>
            idx === i ? { ...f, converted: blob, status: "done" } : f
          )
        );

        URL.revokeObjectURL(img.src);
      } catch (error) {
        setFiles((prev) =>
          prev.map((f, idx) =>
            idx === i ? { ...f, status: "error" } : f
          )
        );
        toast.error(`Failed to convert ${files[i].original.name}`);
      }
    }

    setIsProcessing(false);
    toast.success("Conversion complete!");
  };

  const downloadFile = (file: ConvertedFile) => {
    if (!file.converted) return;

    const url = URL.createObjectURL(file.converted);
    const a = document.createElement("a");
    a.href = url;
    const originalName = file.original.name.replace(/\.[^/.]+$/, "");
    a.download = `${originalName}.${format}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const downloadAll = () => {
    files.forEach((file) => {
      if (file.converted) {
        downloadFile(file);
      }
    });
  };

  return (
    <ToolLayout
      title={`Image to ${targetFormat}`}
      description={`Convert any image format to ${targetFormat}. Fast and private.`}
      icon={FileImage}
    >
      <div className="space-y-6">
        <FileDropzone
          accept="image/*"
          onFilesSelected={handleFilesSelected}
          label="Drop images here"
          description={`Convert to ${targetFormat} format`}
        />

        <AnimatePresence>
          {files.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">
                  {files.length} file{files.length !== 1 ? "s" : ""} selected
                </span>
                <button
                  onClick={clearAll}
                  className="text-sm text-muted-foreground hover:text-destructive transition-colors flex items-center gap-1"
                >
                  <Trash2 className="h-4 w-4" />
                  Clear all
                </button>
              </div>

              <div className="space-y-2">
                {files.map((file, index) => (
                  <motion.div
                    key={`${file.original.name}-${index}`}
                    layout
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="flex items-center gap-4 p-4 bg-card border border-border rounded-xl"
                  >
                    <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                      <FileImage className="h-5 w-5 text-muted-foreground" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{file.original.name}</p>
                      <p className="text-xs text-muted-foreground">
                        → {file.original.name.replace(/\.[^/.]+$/, "")}.{format}
                      </p>
                    </div>

                    {file.status === "done" && (
                      <button
                        onClick={() => downloadFile(file)}
                        className="btn-secondary py-2 px-3"
                      >
                        <Download className="h-4 w-4" />
                      </button>
                    )}

                    {file.status === "processing" && (
                      <RefreshCw className="h-5 w-5 animate-spin text-primary" />
                    )}

                    <button
                      onClick={() => removeFile(index)}
                      className="h-8 w-8 rounded-lg hover:bg-muted flex items-center justify-center text-muted-foreground hover:text-destructive transition-colors"
                    >
                      ×
                    </button>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {files.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-card border border-border rounded-xl p-4"
          >
            <div className="text-center sm:text-left">
              <p className="text-sm text-muted-foreground">
                Convert {files.length} image{files.length !== 1 ? "s" : ""} to{" "}
                {targetFormat}
              </p>
            </div>

            <div className="flex gap-3">
              {files.some((f) => f.status === "done") && (
                <button onClick={downloadAll} className="btn-secondary">
                  <Download className="h-4 w-4" />
                  Download All
                </button>
              )}
              <button
                onClick={convertFiles}
                disabled={isProcessing || files.every((f) => f.status === "done")}
                className="btn-primary disabled:opacity-50"
              >
                {isProcessing ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    Converting...
                  </>
                ) : (
                  <>
                    <FileImage className="h-4 w-4" />
                    Convert to {targetFormat}
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

export default ImageConvert;
