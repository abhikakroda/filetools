import { motion } from "framer-motion";
import {
  Image,
  FileImage,
  Minimize2,
  FileType2,
  Maximize2,
  Files,
  FileDown,
  Layers,
  Shield,
  Scissors,
  Crop,
} from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ToolCard } from "@/components/ToolCard";

const imageTools = [
  {
    title: "Image Compress",
    description: "Reduce image file size while maintaining quality",
    icon: Minimize2,
    href: "/image-compress",
  },
  {
    title: "Image to PDF",
    description: "Convert one or multiple images into a PDF document",
    icon: FileType2,
    href: "/image-to-pdf",
  },
  {
    title: "Image to PNG",
    description: "Convert any image format to PNG",
    icon: FileImage,
    href: "/image-to-png",
  },
  {
    title: "Image to JPEG",
    description: "Convert any image format to JPEG",
    icon: FileImage,
    href: "/image-to-jpeg",
  },
  {
    title: "Image Resize",
    description: "Resize images with custom dimensions",
    icon: Maximize2,
    href: "/image-resize",
  },
  {
    title: "Image Crop",
    description: "Crop, rotate, and flip your images",
    icon: Crop,
    href: "/image-crop",
  },
];

const pdfTools = [
  {
    title: "PDF Merge",
    description: "Combine multiple PDF files into one document",
    icon: Files,
    href: "/pdf-merge",
  },
  {
    title: "PDF Split",
    description: "Extract pages or split PDF into multiple files",
    icon: Scissors,
    href: "/pdf-split",
  },
  {
    title: "PDF Compress",
    description: "Reduce PDF file size for easier sharing",
    icon: FileDown,
    href: "/pdf-compress",
  },
  {
    title: "PDF to Image",
    description: "Convert PDF pages to image files",
    icon: Image,
    href: "/pdf-to-image",
  },
  {
    title: "Images to PDF",
    description: "Create a single PDF from multiple images",
    icon: Layers,
    href: "/images-to-pdf",
  },
  {
    title: "PDF Rotate",
    description: "Rotate PDF pages to any angle",
    icon: FileType2,
    href: "/pdf-rotate",
  },
];

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden py-16 md:py-24">
          <div className="absolute inset-0 bg-gradient-to-br from-accent/60 via-background to-background" />
          <div className="absolute inset-0 opacity-30">
            <div className="absolute top-20 left-1/4 w-72 h-72 bg-primary/20 rounded-full blur-3xl animate-float" />
            <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-float" style={{ animationDelay: "1s" }} />
          </div>
          
          <div className="container relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.34, 1.56, 0.64, 1] }}
              className="max-w-2xl mx-auto text-center"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="privacy-badge mb-8"
              >
                <Shield className="h-4 w-4 text-primary" />
                <span>Private, Fast, Browser-Only File Tools</span>
              </motion.div>

              <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6 leading-tight tracking-tight">
                Transform your files{" "}
                <span className="text-gradient">privately</span>
              </h1>

              <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-lg mx-auto leading-relaxed">
                All processing happens locally in your browser. No uploads, no
                servers, no data collection.
              </p>

              <div className="flex flex-wrap justify-center gap-4">
                {[
                  { label: "100% Free", color: "bg-success" },
                  { label: "No Sign Up", color: "bg-success" },
                  { label: "Works Offline", color: "bg-success" },
                ].map((item, i) => (
                  <motion.div
                    key={item.label}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 + i * 0.1 }}
                    className="flex items-center gap-2 text-sm text-muted-foreground glass-card px-4 py-2 rounded-full"
                  >
                    <div className={`h-2 w-2 rounded-full ${item.color}`} />
                    <span>{item.label}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        {/* Image Tools Section */}
        <section className="py-12 md:py-20">
          <div className="container">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mb-10"
            >
              <div className="flex items-center gap-4 mb-3">
                <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-accent to-primary/20 flex items-center justify-center shadow-lg shadow-primary/10">
                  <Image className="h-5 w-5 text-primary" />
                </div>
                <h2 className="text-2xl md:text-3xl font-bold text-foreground">
                  Image Tools
                </h2>
              </div>
              <p className="text-muted-foreground text-lg">
                Compress, convert, and resize images instantly
              </p>
            </motion.div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {imageTools.map((tool, index) => (
                <ToolCard key={tool.href} {...tool} delay={index} />
              ))}
            </div>
          </div>
        </section>

        {/* PDF Tools Section */}
        <section className="py-12 md:py-20 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-secondary/50 to-background" />
          <div className="container relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mb-10"
            >
              <div className="flex items-center gap-4 mb-3">
                <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-accent to-primary/20 flex items-center justify-center shadow-lg shadow-primary/10">
                  <Layers className="h-5 w-5 text-primary" />
                </div>
                <h2 className="text-2xl md:text-3xl font-bold text-foreground">
                  PDF Tools
                </h2>
              </div>
              <p className="text-muted-foreground text-lg">
                Merge, compress, and convert PDF documents
              </p>
            </motion.div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {pdfTools.map((tool, index) => (
                <ToolCard key={tool.href} {...tool} delay={index} />
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Index;
