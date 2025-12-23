import { useState, useCallback, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Crop, Download, Trash2, RefreshCw, RotateCw, FlipHorizontal } from "lucide-react";
import { ToolLayout } from "@/components/ToolLayout";
import { FileDropzone } from "@/components/FileDropzone";
import { toast } from "sonner";

interface CropArea {
  x: number;
  y: number;
  width: number;
  height: number;
}

const ImageCrop = () => {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [croppedImage, setCroppedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [flipH, setFlipH] = useState(false);
  const [cropArea, setCropArea] = useState<CropArea>({ x: 0, y: 0, width: 100, height: 100 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });
  
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  const handleFilesSelected = useCallback(async (selectedFiles: File[]) => {
    const imageFiles = selectedFiles.filter((f) => f.type.startsWith("image/"));
    if (imageFiles.length === 0) {
      toast.error("Please select an image file");
      return;
    }

    const file = imageFiles[0];
    setImageFile(file);
    setCroppedImage(null);
    setRotation(0);
    setFlipH(false);

    const reader = new FileReader();
    reader.onload = (e) => {
      const src = e.target?.result as string;
      setImageSrc(src);
      
      const img = new Image();
      img.onload = () => {
        setImageSize({ width: img.width, height: img.height });
        setCropArea({ x: 0, y: 0, width: 100, height: 100 });
      };
      img.src = src;
    };
    reader.readAsDataURL(file);

    toast.success("Image loaded successfully");
  }, []);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    setIsDragging(true);
    const rect = containerRef.current.getBoundingClientRect();
    setDragStart({
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const currentX = ((e.clientX - rect.left) / rect.width) * 100;
    const currentY = ((e.clientY - rect.top) / rect.height) * 100;

    const x = Math.min(dragStart.x, currentX);
    const y = Math.min(dragStart.y, currentY);
    const width = Math.abs(currentX - dragStart.x);
    const height = Math.abs(currentY - dragStart.y);

    setCropArea({
      x: Math.max(0, x),
      y: Math.max(0, y),
      width: Math.min(100 - x, width),
      height: Math.min(100 - y, height),
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    const handleGlobalMouseUp = () => setIsDragging(false);
    window.addEventListener("mouseup", handleGlobalMouseUp);
    return () => window.removeEventListener("mouseup", handleGlobalMouseUp);
  }, []);

  const processCrop = async () => {
    if (!imageSrc) return;

    setIsProcessing(true);

    try {
      const img = new Image();
      img.src = imageSrc;
      await new Promise((resolve) => (img.onload = resolve));

      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d")!;

      // Calculate actual pixel values
      const cropX = (cropArea.x / 100) * img.width;
      const cropY = (cropArea.y / 100) * img.height;
      const cropWidth = (cropArea.width / 100) * img.width;
      const cropHeight = (cropArea.height / 100) * img.height;

      // Handle rotation
      const isRotated90or270 = rotation === 90 || rotation === 270;
      canvas.width = isRotated90or270 ? cropHeight : cropWidth;
      canvas.height = isRotated90or270 ? cropWidth : cropHeight;

      ctx.save();
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate((rotation * Math.PI) / 180);
      if (flipH) ctx.scale(-1, 1);

      const drawWidth = isRotated90or270 ? cropHeight : cropWidth;
      const drawHeight = isRotated90or270 ? cropWidth : cropHeight;

      ctx.drawImage(
        img,
        cropX,
        cropY,
        cropWidth,
        cropHeight,
        -drawWidth / 2,
        -drawHeight / 2,
        drawWidth,
        drawHeight
      );

      ctx.restore();

      const dataUrl = canvas.toDataURL("image/png");
      setCroppedImage(dataUrl);
      toast.success("Image cropped successfully!");
    } catch (error) {
      toast.error("Failed to crop image");
      console.error(error);
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadImage = () => {
    if (!croppedImage || !imageFile) return;

    const link = document.createElement("a");
    link.href = croppedImage;
    link.download = imageFile.name.replace(/\.[^.]+$/, "_cropped.png");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const clearAll = () => {
    setImageFile(null);
    setImageSrc(null);
    setCroppedImage(null);
    setRotation(0);
    setFlipH(false);
  };

  const rotate90 = () => setRotation((r) => (r + 90) % 360);
  const toggleFlip = () => setFlipH((f) => !f);

  return (
    <ToolLayout
      title="Image Crop"
      description="Crop, rotate, and flip images. All processing happens locally."
      icon={Crop}
    >
      <div className="space-y-6">
        {!imageSrc && (
          <FileDropzone
            accept="image/*"
            onFilesSelected={handleFilesSelected}
            label="Drop image here"
            description="Select an image to crop"
          />
        )}

        <AnimatePresence>
          {imageSrc && !croppedImage && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="settings-panel space-y-6"
            >
              <div className="flex items-center justify-between">
                <p className="font-medium">{imageFile?.name}</p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={rotate90}
                    className="p-2 rounded-lg hover:bg-muted transition-colors"
                    title="Rotate 90°"
                  >
                    <RotateCw className="h-5 w-5" />
                  </button>
                  <button
                    onClick={toggleFlip}
                    className={`p-2 rounded-lg transition-colors ${
                      flipH ? "bg-primary text-primary-foreground" : "hover:bg-muted"
                    }`}
                    title="Flip Horizontal"
                  >
                    <FlipHorizontal className="h-5 w-5" />
                  </button>
                  <button
                    onClick={clearAll}
                    className="p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-destructive transition-colors"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              </div>

              <div
                ref={containerRef}
                className="relative aspect-video rounded-xl overflow-hidden bg-muted cursor-crosshair select-none"
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
              >
                <img
                  ref={imageRef}
                  src={imageSrc}
                  alt="Preview"
                  className="w-full h-full object-contain"
                  style={{
                    transform: `rotate(${rotation}deg) scaleX(${flipH ? -1 : 1})`,
                  }}
                  draggable={false}
                />
                
                {/* Crop overlay */}
                <div className="absolute inset-0 pointer-events-none">
                  {/* Dark overlay outside crop area */}
                  <div
                    className="absolute bg-foreground/50"
                    style={{
                      top: 0,
                      left: 0,
                      right: 0,
                      height: `${cropArea.y}%`,
                    }}
                  />
                  <div
                    className="absolute bg-foreground/50"
                    style={{
                      top: `${cropArea.y + cropArea.height}%`,
                      left: 0,
                      right: 0,
                      bottom: 0,
                    }}
                  />
                  <div
                    className="absolute bg-foreground/50"
                    style={{
                      top: `${cropArea.y}%`,
                      left: 0,
                      width: `${cropArea.x}%`,
                      height: `${cropArea.height}%`,
                    }}
                  />
                  <div
                    className="absolute bg-foreground/50"
                    style={{
                      top: `${cropArea.y}%`,
                      left: `${cropArea.x + cropArea.width}%`,
                      right: 0,
                      height: `${cropArea.height}%`,
                    }}
                  />
                  
                  {/* Crop border */}
                  <div
                    className="absolute border-2 border-primary"
                    style={{
                      top: `${cropArea.y}%`,
                      left: `${cropArea.x}%`,
                      width: `${cropArea.width}%`,
                      height: `${cropArea.height}%`,
                    }}
                  />
                </div>
              </div>

              <p className="text-sm text-muted-foreground text-center">
                Click and drag to select crop area
              </p>

              <button
                onClick={processCrop}
                disabled={isProcessing || cropArea.width < 5 || cropArea.height < 5}
                className="btn-primary w-full disabled:opacity-50"
              >
                {isProcessing ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Crop className="h-4 w-4" />
                    Crop Image
                  </>
                )}
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {croppedImage && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="settings-panel space-y-6"
            >
              <div className="flex items-center justify-between">
                <p className="font-semibold">Cropped Result</p>
                <button
                  onClick={() => {
                    setCroppedImage(null);
                    setCropArea({ x: 0, y: 0, width: 100, height: 100 });
                  }}
                  className="text-sm text-primary hover:underline"
                >
                  Edit Again
                </button>
              </div>

              <div className="rounded-xl overflow-hidden bg-muted">
                <img
                  src={croppedImage}
                  alt="Cropped"
                  className="max-w-full max-h-[400px] mx-auto object-contain"
                />
              </div>

              <div className="flex gap-3">
                <button onClick={clearAll} className="btn-secondary flex-1">
                  <Trash2 className="h-4 w-4" />
                  New Image
                </button>
                <button onClick={downloadImage} className="btn-primary flex-1">
                  <Download className="h-4 w-4" />
                  Download
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </ToolLayout>
  );
};

export default ImageCrop;
