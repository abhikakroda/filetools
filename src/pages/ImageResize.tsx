import { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Maximize2, Download, Trash2, RefreshCw, Lock, Unlock } from "lucide-react";
import { ToolLayout } from "@/components/ToolLayout";
import { FileDropzone } from "@/components/FileDropzone";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

interface ImageFile {
  file: File;
  preview: string;
  originalWidth: number;
  originalHeight: number;
}

interface ResizedImage {
  blob: Blob;
  width: number;
  height: number;
}

const ImageResize = () => {
  const [image, setImage] = useState<ImageFile | null>(null);
  const [width, setWidth] = useState<number>(0);
  const [height, setHeight] = useState<number>(0);
  const [lockAspect, setLockAspect] = useState(true);
  const [aspectRatio, setAspectRatio] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [resizedImage, setResizedImage] = useState<ResizedImage | null>(null);

  const handleFilesSelected = useCallback((selectedFiles: File[]) => {
    const file = selectedFiles[0];
    if (!file?.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    const img = new Image();
    const preview = URL.createObjectURL(file);
    
    img.onload = () => {
      setImage({
        file,
        preview,
        originalWidth: img.width,
        originalHeight: img.height,
      });
      setWidth(img.width);
      setHeight(img.height);
      setAspectRatio(img.width / img.height);
      setResizedImage(null);
    };
    
    img.src = preview;
  }, []);

  const handleWidthChange = (newWidth: number) => {
    setWidth(newWidth);
    if (lockAspect) {
      setHeight(Math.round(newWidth / aspectRatio));
    }
    setResizedImage(null);
  };

  const handleHeightChange = (newHeight: number) => {
    setHeight(newHeight);
    if (lockAspect) {
      setWidth(Math.round(newHeight * aspectRatio));
    }
    setResizedImage(null);
  };

  const clearImage = useCallback(() => {
    if (image) {
      URL.revokeObjectURL(image.preview);
    }
    setImage(null);
    setWidth(0);
    setHeight(0);
    setResizedImage(null);
  }, [image]);

  const resizeImage = async () => {
    if (!image || width <= 0 || height <= 0) return;

    setIsProcessing(true);

    try {
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Could not get canvas context");

      const img = new Image();
      img.src = image.preview;
      
      await new Promise((resolve) => {
        img.onload = resolve;
      });

      ctx.drawImage(img, 0, 0, width, height);

      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob(
          (blob) => {
            if (blob) resolve(blob);
            else reject(new Error("Failed to create blob"));
          },
          image.file.type,
          0.9
        );
      });

      setResizedImage({ blob, width, height });
      toast.success("Image resized successfully!");
    } catch (error) {
      toast.error("Failed to resize image");
      console.error(error);
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadImage = () => {
    if (!resizedImage || !image) return;

    const url = URL.createObjectURL(resizedImage.blob);
    const a = document.createElement("a");
    a.href = url;
    const ext = image.file.name.split(".").pop() || "png";
    a.download = `resized-${width}x${height}.${ext}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const presets = [
    { name: "HD", width: 1280, height: 720 },
    { name: "Full HD", width: 1920, height: 1080 },
    { name: "4K", width: 3840, height: 2160 },
    { name: "Instagram", width: 1080, height: 1080 },
    { name: "Twitter", width: 1200, height: 675 },
    { name: "Thumbnail", width: 150, height: 150 },
  ];

  const applyPreset = (preset: { width: number; height: number }) => {
    setLockAspect(false);
    setWidth(preset.width);
    setHeight(preset.height);
    setResizedImage(null);
  };

  return (
    <ToolLayout
      title="Image Resize"
      description="Resize images to custom dimensions with aspect ratio lock."
      icon={Maximize2}
    >
      <div className="space-y-6">
        {!image ? (
          <FileDropzone
            accept="image/*"
            multiple={false}
            onFilesSelected={handleFilesSelected}
            label="Drop an image here"
            description="PNG, JPG, JPEG, WebP supported"
          />
        ) : (
          <AnimatePresence>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-6"
            >
              {/* Image Preview */}
              <div className="flex flex-col md:flex-row gap-6">
                <div className="flex-1">
                  <div className="relative aspect-video bg-muted rounded-xl overflow-hidden flex items-center justify-center">
                    <img
                      src={resizedImage ? URL.createObjectURL(resizedImage.blob) : image.preview}
                      alt="Preview"
                      className="max-w-full max-h-full object-contain"
                    />
                    <button
                      onClick={clearImage}
                      className="absolute top-3 right-3 h-8 w-8 rounded-lg bg-card/90 flex items-center justify-center hover:bg-destructive hover:text-destructive-foreground transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2 text-center">
                    Original: {image.originalWidth} × {image.originalHeight}px
                  </p>
                </div>

                {/* Settings */}
                <div className="w-full md:w-80 space-y-4">
                  <div className="bg-card border border-border rounded-xl p-4 space-y-4">
                    <h3 className="font-semibold">Dimensions</h3>

                    <div className="flex items-center gap-3">
                      <div className="flex-1">
                        <label className="text-xs text-muted-foreground block mb-1">
                          Width (px)
                        </label>
                        <Input
                          type="number"
                          value={width}
                          onChange={(e) =>
                            handleWidthChange(parseInt(e.target.value) || 0)
                          }
                          min={1}
                          max={10000}
                        />
                      </div>

                      <button
                        onClick={() => setLockAspect(!lockAspect)}
                        className={`h-10 w-10 rounded-lg border flex items-center justify-center mt-5 transition-colors ${
                          lockAspect
                            ? "bg-primary text-primary-foreground border-primary"
                            : "bg-card border-border text-muted-foreground hover:bg-muted"
                        }`}
                      >
                        {lockAspect ? (
                          <Lock className="h-4 w-4" />
                        ) : (
                          <Unlock className="h-4 w-4" />
                        )}
                      </button>

                      <div className="flex-1">
                        <label className="text-xs text-muted-foreground block mb-1">
                          Height (px)
                        </label>
                        <Input
                          type="number"
                          value={height}
                          onChange={(e) =>
                            handleHeightChange(parseInt(e.target.value) || 0)
                          }
                          min={1}
                          max={10000}
                        />
                      </div>
                    </div>

                    <p className="text-xs text-muted-foreground">
                      {lockAspect
                        ? "Aspect ratio locked"
                        : "Aspect ratio unlocked"}
                    </p>
                  </div>

                  <div className="bg-card border border-border rounded-xl p-4 space-y-3">
                    <h3 className="font-semibold text-sm">Quick Presets</h3>
                    <div className="grid grid-cols-2 gap-2">
                      {presets.map((preset) => (
                        <button
                          key={preset.name}
                          onClick={() => applyPreset(preset)}
                          className="px-3 py-2 text-xs rounded-lg border border-border hover:border-primary hover:bg-accent transition-colors text-left"
                        >
                          <span className="font-medium">{preset.name}</span>
                          <span className="text-muted-foreground block">
                            {preset.width}×{preset.height}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-card border border-border rounded-xl p-4"
              >
                <div className="text-center sm:text-left">
                  <p className="text-sm text-muted-foreground">
                    Output: {width} × {height}px
                  </p>
                </div>

                <div className="flex gap-3">
                  {resizedImage && (
                    <button onClick={downloadImage} className="btn-secondary">
                      <Download className="h-4 w-4" />
                      Download
                    </button>
                  )}
                  <button
                    onClick={resizeImage}
                    disabled={isProcessing || width <= 0 || height <= 0}
                    className="btn-primary disabled:opacity-50"
                  >
                    {isProcessing ? (
                      <>
                        <RefreshCw className="h-4 w-4 animate-spin" />
                        Resizing...
                      </>
                    ) : (
                      <>
                        <Maximize2 className="h-4 w-4" />
                        {resizedImage ? "Resize Again" : "Resize Image"}
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          </AnimatePresence>
        )}
      </div>
    </ToolLayout>
  );
};

export default ImageResize;
