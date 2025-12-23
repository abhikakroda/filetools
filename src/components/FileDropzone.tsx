import { useCallback, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, Image, FileText, X } from "lucide-react";

interface FileDropzoneProps {
  accept: string;
  multiple?: boolean;
  onFilesSelected: (files: File[]) => void;
  label?: string;
  description?: string;
  maxFiles?: number;
}

export const FileDropzone = ({
  accept,
  multiple = true,
  onFilesSelected,
  label = "Drop files here",
  description = "or click to browse",
  maxFiles = 50,
}: FileDropzoneProps) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDragIn = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragOut = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      const files = Array.from(e.dataTransfer.files).slice(0, maxFiles);
      if (files.length > 0) {
        onFilesSelected(files);
      }
    },
    [onFilesSelected, maxFiles]
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files
        ? Array.from(e.target.files).slice(0, maxFiles)
        : [];
      if (files.length > 0) {
        onFilesSelected(files);
      }
    },
    [onFilesSelected, maxFiles]
  );

  const isImageAccept = accept.includes("image");
  const Icon = isImageAccept ? Image : FileText;

  return (
    <motion.div
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      className={`dropzone cursor-pointer ${isDragging ? "active" : ""}`}
      onDragEnter={handleDragIn}
      onDragLeave={handleDragOut}
      onDragOver={handleDrag}
      onDrop={handleDrop}
    >
      <input
        type="file"
        accept={accept}
        multiple={multiple}
        onChange={handleChange}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
      />

      <AnimatePresence mode="wait">
        {isDragging ? (
          <motion.div
            key="dragging"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="flex flex-col items-center gap-3"
          >
            <div className="h-16 w-16 rounded-2xl bg-primary/20 flex items-center justify-center">
              <Upload className="h-8 w-8 text-primary animate-bounce-soft" />
            </div>
            <p className="font-semibold text-primary">Release to upload</p>
          </motion.div>
        ) : (
          <motion.div
            key="default"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="flex flex-col items-center gap-3"
          >
            <div className="h-16 w-16 rounded-2xl bg-muted flex items-center justify-center">
              <Icon className="h-8 w-8 text-muted-foreground" />
            </div>
            <div className="text-center">
              <p className="font-semibold text-foreground">{label}</p>
              <p className="text-sm text-muted-foreground mt-1">{description}</p>
            </div>
            <button className="btn-secondary mt-2">
              <Upload className="h-4 w-4" />
              Browse Files
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

interface FilePreviewProps {
  file: File;
  onRemove: () => void;
  progress?: number;
  status?: "pending" | "processing" | "done" | "error";
}

export const FilePreview = ({
  file,
  onRemove,
  progress,
  status = "pending",
}: FilePreviewProps) => {
  const [preview, setPreview] = useState<string | null>(null);

  useState(() => {
    if (file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (e) => setPreview(e.target?.result as string);
      reader.readAsDataURL(file);
    }
  });

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="relative flex items-center gap-3 p-3 bg-card border border-border rounded-xl"
    >
      <div className="h-12 w-12 rounded-lg bg-muted flex items-center justify-center overflow-hidden flex-shrink-0">
        {preview ? (
          <img
            src={preview}
            alt={file.name}
            className="h-full w-full object-cover"
          />
        ) : (
          <FileText className="h-5 w-5 text-muted-foreground" />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm truncate">{file.name}</p>
        <p className="text-xs text-muted-foreground">{formatSize(file.size)}</p>
        {progress !== undefined && status === "processing" && (
          <div className="mt-1 h-1 bg-muted rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-primary"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
            />
          </div>
        )}
      </div>

      {status === "done" && (
        <div className="h-6 w-6 rounded-full bg-success/20 text-success flex items-center justify-center">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
      )}

      <button
        onClick={onRemove}
        className="h-8 w-8 rounded-lg hover:bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
      >
        <X className="h-4 w-4" />
      </button>
    </motion.div>
  );
};
