import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Minimize2, Download, Settings2, Trash2, RefreshCw, Target } from "lucide-react";
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

const targetSizeOptions = [
  { value: 0.1, label: "100 KB" },
  { value: 0.25, label: "250 KB" },
  { value: 0.5, label: "500 KB" },
  { value: 1, label: "1 MB" },
  { value: 2, label: "2 MB" },
  { value: 5, label: "5 MB" },
];

const ImageCompress = () => {
  const [files, setFiles] = useState<ProcessedFile[]>([]);
  const [compressionMode, setCompressionMode] = useState<"quality" | "target">("target");
  const [quality, setQuality] = useState([80]);
  const [maxWidth, setMaxWidth] = useState([1920]);
  const [targetSize, setTargetSize] = useState(1); // MB
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
          maxSizeMB: compressionMode === "target" ? targetSize : 10,
          maxWidthOrHeight: maxWidth[0],
          useWebWorker: true,
          initialQuality: compressionMode === "quality" ? quality[0] / 100 : undefined,
          alwaysKeepResolution: compressionMode === "target",
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
            className="settings-panel space-y-6"
          >
            <div className="flex items-center gap-2 mb-2">
              <Settings2 className="h-5 w-5 text-primary" />
              <h3 className="font-semibold">Compression Settings</h3>
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
                  onClick={() => setCompressionMode("quality")}
                  className={`py-3 px-4 rounded-xl font-medium transition-all duration-300 flex items-center justify-center gap-2 ${
                    compressionMode === "quality"
                      ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25"
                      : "bg-muted hover:bg-muted/80"
                  }`}
                >
                  <Settings2 className="h-4 w-4" />
                  Quality Based
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
                    Images will be compressed to approximately {targetSize < 1 ? `${targetSize * 1000} KB` : `${targetSize} MB`} or smaller
                  </p>
                </motion.div>
              ) : (
                <motion.div
                  key="quality"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="grid gap-6 md:grid-cols-2"
                >
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
                </motion.div>
              )}
            </AnimatePresence>
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
            className="flex flex-col sm:flex-row gap-4 items-center justify-between settings-panel"
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
                    {compressionMode === "target" 
                      ? `Compress to ${targetSize < 1 ? `${targetSize * 1000} KB` : `${targetSize} MB`}`
                      : "Compress Images"
                    }
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
