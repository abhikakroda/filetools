import { motion } from "framer-motion";
import {
  Image,
  FileImage,
  Minimize2,
  FileType2,
  Maximize2,
  Files,
  FileDown,
  FilePlus,
  Layers,
  Shield,
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
];

const pdfTools = [
  {
    title: "PDF Merge",
    description: "Combine multiple PDF files into one document",
    icon: Files,
    href: "/pdf-merge",
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
    icon: FilePlus,
    href: "/images-to-pdf",
  },
];

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden py-12 md:py-20">
          <div className="absolute inset-0 bg-gradient-to-br from-accent/50 to-background" />
          <div className="container relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-2xl mx-auto text-center"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="inline-flex items-center gap-2 rounded-full bg-card border border-border px-4 py-2 mb-6"
              >
                <Shield className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">
                  Private, Fast, Browser-Only File Tools
                </span>
              </motion.div>

              <h1 className="text-3xl md:text-5xl font-bold text-foreground mb-4 leading-tight">
                Transform your files{" "}
                <span className="text-gradient">privately</span>
              </h1>

              <p className="text-lg text-muted-foreground mb-8 max-w-lg mx-auto">
                All processing happens locally in your browser. No uploads, no
                servers, no data collection. Your files never leave your device.
              </p>

              <div className="flex flex-wrap justify-center gap-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <div className="h-2 w-2 rounded-full bg-success" />
                  <span>100% Free</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <div className="h-2 w-2 rounded-full bg-success" />
                  <span>No Sign Up</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <div className="h-2 w-2 rounded-full bg-success" />
                  <span>Works Offline</span>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Image Tools Section */}
        <section className="py-10 md:py-16">
          <div className="container">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mb-8"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="h-8 w-8 rounded-lg bg-accent flex items-center justify-center">
                  <Image className="h-4 w-4 text-primary" />
                </div>
                <h2 className="text-xl md:text-2xl font-bold text-foreground">
                  Image Tools
                </h2>
              </div>
              <p className="text-muted-foreground">
                Compress, convert, and resize images instantly
              </p>
            </motion.div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {imageTools.map((tool, index) => (
                <ToolCard key={tool.href} {...tool} delay={index} />
              ))}
            </div>
          </div>
        </section>

        {/* PDF Tools Section */}
        <section className="py-10 md:py-16 bg-secondary/30">
          <div className="container">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mb-8"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="h-8 w-8 rounded-lg bg-accent flex items-center justify-center">
                  <Layers className="h-4 w-4 text-primary" />
                </div>
                <h2 className="text-xl md:text-2xl font-bold text-foreground">
                  PDF Tools
                </h2>
              </div>
              <p className="text-muted-foreground">
                Merge, compress, and convert PDF documents
              </p>
            </motion.div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
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
