import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Minimize2, Download, Settings2, Trash2, RefreshCw } from "lucide-react";
import imageCompression from "browser-image-compression";
import { ToolLayout } from "@/components/ToolLayout";
import { FileDropzone, FilePreview } from "@/components/FileDropzone";
import { Slider } from "@/components/ui/slider";
import { toast } from "sonner";

interface ProcessedFile {
  original: File;
  compressed: Blob | null;
  originalSize: number;
  compressedSize: number;
  status: "pending" | "processing" | "done" | "error";
  progress: number;
}

const ImageCompress = () => {
  const [files, setFiles] = useState<ProcessedFile[]>([]);
  const [quality, setQuality] = useState([80]);
  const [maxWidth, setMaxWidth] = useState([1920]);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFilesSelected = useCallback((selectedFiles: File[]) => {
    const imageFiles = selectedFiles.filter((f) =>
      f.type.startsWith("image/")
    );
    
    if (imageFiles.length !== selectedFiles.length) {
      toast.error("Some files were skipped. Only images are accepted.");
    }

    const newFiles: ProcessedFile[] = imageFiles.map((file) => ({
      original: file,
      compressed: null,
      originalSize: file.size,
      compressedSize: 0,
      status: "pending",
      progress: 0,
    }));

    setFiles((prev) => [...prev, ...newFiles]);
  }, []);

  const removeFile = useCallback((index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const clearAll = useCallback(() => {
    setFiles([]);
  }, []);

  const processFiles = async () => {
    if (files.length === 0) return;

    setIsProcessing(true);

    for (let i = 0; i < files.length; i++) {
      if (files[i].status === "done") continue;

      setFiles((prev) =>
        prev.map((f, idx) =>
          idx === i ? { ...f, status: "processing", progress: 0 } : f
        )
      );

      try {
        const options = {
          maxSizeMB: 10,
          maxWidthOrHeight: maxWidth[0],
          useWebWorker: true,
          initialQuality: quality[0] / 100,
          onProgress: (progress: number) => {
            setFiles((prev) =>
              prev.map((f, idx) =>
                idx === i ? { ...f, progress: Math.round(progress) } : f
              )
            );
          },
        };

        const compressedBlob = await imageCompression(files[i].original, options);

        setFiles((prev) =>
          prev.map((f, idx) =>
            idx === i
              ? {
                  ...f,
                  compressed: compressedBlob,
                  compressedSize: compressedBlob.size,
                  status: "done",
                  progress: 100,
                }
              : f
          )
        );
      } catch (error) {
        setFiles((prev) =>
          prev.map((f, idx) =>
            idx === i ? { ...f, status: "error", progress: 0 } : f
          )
        );
        toast.error(`Failed to compress ${files[i].original.name}`);
      }
    }

    setIsProcessing(false);
    toast.success("Compression complete!");
  };

  const downloadFile = (file: ProcessedFile) => {
    if (!file.compressed) return;

    const url = URL.createObjectURL(file.compressed);
    const a = document.createElement("a");
    a.href = url;
    a.download = `compressed-${file.original.name}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const downloadAll = () => {
    files.forEach((file) => {
      if (file.compressed) {
        downloadFile(file);
      }
    });
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const totalOriginal = files.reduce((sum, f) => sum + f.originalSize, 0);
  const totalCompressed = files.reduce((sum, f) => sum + f.compressedSize, 0);
  const savedPercentage =
    totalOriginal > 0
      ? Math.round(((totalOriginal - totalCompressed) / totalOriginal) * 100)
      : 0;

  return (
    <ToolLayout
      title="Image Compress"
      description="Reduce image file size while maintaining quality. Perfect for web optimization."
      icon={Minimize2}
    >
      <div className="space-y-6">
        {/* Dropzone */}
        <FileDropzone
          accept="image/*"
          onFilesSelected={handleFilesSelected}
          label="Drop images here"
          description="PNG, JPG, JPEG, WebP supported"
        />

        {/* Settings */}
        {files.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="bg-card border border-border rounded-xl p-6"
          >
            <div className="flex items-center gap-2 mb-6">
              <Settings2 className="h-5 w-5 text-primary" />
              <h3 className="font-semibold">Compression Settings</h3>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="text-sm font-medium">Quality</label>
                  <span className="text-sm text-muted-foreground">
                    {quality[0]}%
                  </span>
                </div>
                <Slider
                  value={quality}
                  onValueChange={setQuality}
                  min={10}
                  max={100}
                  step={5}
                  className="w-full"
                />
                <p className="text-xs text-muted-foreground mt-2">
                  Higher quality = larger file size
                </p>
              </div>

              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="text-sm font-medium">Max Width</label>
                  <span className="text-sm text-muted-foreground">
                    {maxWidth[0]}px
                  </span>
                </div>
                <Slider
                  value={maxWidth}
                  onValueChange={setMaxWidth}
                  min={320}
                  max={4096}
                  step={64}
                  className="w-full"
                />
                <p className="text-xs text-muted-foreground mt-2">
                  Images wider than this will be resized
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* File List */}
        <AnimatePresence>
          {files.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-3"
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

              <div className="space-y-2 max-h-64 overflow-y-auto">
                {files.map((file, index) => (
                  <div
                    key={`${file.original.name}-${index}`}
                    className="flex items-center gap-3 p-3 bg-card border border-border rounded-xl"
                  >
                    <FilePreview
                      file={file.original}
                      onRemove={() => removeFile(index)}
                      progress={file.progress}
                      status={file.status}
                    />
                    {file.status === "done" && file.compressed && (
                      <div className="ml-auto flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-xs text-muted-foreground">
                            {formatSize(file.originalSize)} →{" "}
                            <span className="text-success font-medium">
                              {formatSize(file.compressedSize)}
                            </span>
                          </p>
                          <p className="text-xs text-success">
                            -
                            {Math.round(
                              ((file.originalSize - file.compressedSize) /
                                file.originalSize) *
                                100
                            )}
                            % smaller
                          </p>
                        </div>
                        <button
                          onClick={() => downloadFile(file)}
                          className="btn-secondary py-2 px-3"
                        >
                          <Download className="h-4 w-4" />
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Actions */}
        {files.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-card border border-border rounded-xl p-4"
          >
            <div className="text-center sm:text-left">
              {totalCompressed > 0 && (
                <p className="text-sm">
                  <span className="text-muted-foreground">Total saved: </span>
                  <span className="font-semibold text-success">
                    {formatSize(totalOriginal - totalCompressed)} ({savedPercentage}
                    %)
                  </span>
                </p>
              )}
            </div>

            <div className="flex gap-3">
              {files.some((f) => f.status === "done") && (
                <button onClick={downloadAll} className="btn-secondary">
                  <Download className="h-4 w-4" />
                  Download All
                </button>
              )}
              <button
                onClick={processFiles}
                disabled={isProcessing || files.every((f) => f.status === "done")}
                className="btn-primary disabled:opacity-50"
              >
                {isProcessing ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    Compressing...
                  </>
                ) : (
                  <>
                    <Minimize2 className="h-4 w-4" />
                    Compress Images
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

export default ImageCompress;
