import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Image,
  FileImage,
  Minimize2,
  FileType2,
  Maximize2,
  Files,
  FileDown,
  Layers,
  Scissors,
  Crop,
  FileText,
} from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ToolCard } from "@/components/ToolCard";

const imageTools = [
  {
    title: "Image Compress",
    description: "Reduce image file size to target size",
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
    description: "Reduce PDF file size to target size",
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
  const [activeCategory, setActiveCategory] = useState<"all" | "image" | "pdf">("all");

  const showImageTools = activeCategory === "all" || activeCategory === "image";
  const showPdfTools = activeCategory === "all" || activeCategory === "pdf";

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden py-12 px-4 md:py-24">
          {/* Background effects */}
          <div className="absolute inset-0">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,hsl(var(--primary)/0.08),transparent_60%)]" />
            <div className="absolute top-1/4 -left-16 md:-left-32 w-48 md:w-96 h-48 md:h-96 bg-primary/10 rounded-full blur-[80px] md:blur-[100px]" />
            <div className="absolute bottom-0 right-0 w-64 md:w-[500px] h-64 md:h-[500px] bg-[hsl(var(--gradient-end)/0.08)] rounded-full blur-[80px] md:blur-[120px]" />
          </div>
          
          <div className="container relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="max-w-3xl mx-auto text-center"
            >
              {/* Badge */}
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.1, duration: 0.5 }}
                className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 mb-6 sm:mb-8 rounded-full bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border border-primary/20 text-xs sm:text-sm font-medium text-primary"
              >
                <span className="relative flex h-1.5 w-1.5 sm:h-2 sm:w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 sm:h-2 sm:w-2 bg-primary"></span>
                </span>
                <span className="hidden xs:inline">100% Private • Browser-Based</span>
                <span className="xs:hidden">100% Private</span>
              </motion.div>

              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-foreground mb-4 sm:mb-6 leading-[1.1] tracking-tight">
                Transform files{" "}
                <span className="bg-gradient-to-r from-primary via-[hsl(var(--gradient-end))] to-primary bg-clip-text text-transparent">
                  instantly
                </span>
              </h1>

              <p className="text-base sm:text-lg md:text-xl text-muted-foreground mb-6 sm:mb-10 max-w-xl mx-auto leading-relaxed px-2">
                Process your images and PDFs directly in your browser. 
                No uploads, no servers, completely private.
              </p>

              <div className="flex flex-wrap justify-center gap-2 sm:gap-4">
                {[
                  { label: "Free Forever", icon: "✨" },
                  { label: "No Account", icon: "🔓" },
                  { label: "Works Offline", icon: "📡" },
                ].map((item, i) => (
                  <motion.div
                    key={item.label}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + i * 0.1 }}
                    className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-muted-foreground bg-card/50 backdrop-blur-sm border border-border/50 px-2.5 sm:px-4 py-2 sm:py-2.5 rounded-full"
                  >
                    <span>{item.icon}</span>
                    <span className="font-medium">{item.label}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        {/* Category Switcher */}
        <section className="sticky top-16 z-40 py-3 sm:py-4 bg-background/80 backdrop-blur-xl border-b border-border/40">
          <div className="container px-3 sm:px-4">
            <div className="flex justify-center">
              <div className="inline-flex p-1 sm:p-1.5 rounded-full bg-muted/60 border border-border/50 w-full max-w-md sm:w-auto">
                {[
                  { value: "all", label: "All", fullLabel: "All Tools", icon: null },
                  { value: "image", label: "Image", fullLabel: "Image", icon: Image },
                  { value: "pdf", label: "PDF", fullLabel: "PDF", icon: FileText },
                ].map((category) => (
                  <button
                    key={category.value}
                    onClick={() => setActiveCategory(category.value as typeof activeCategory)}
                    className={`relative flex-1 sm:flex-none px-3 sm:px-5 py-2 sm:py-2.5 rounded-full font-semibold text-xs sm:text-sm transition-all duration-300 flex items-center justify-center gap-1.5 sm:gap-2 ${
                      activeCategory === category.value
                        ? "text-primary-foreground"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {activeCategory === category.value && (
                      <motion.div
                        layoutId="activeCategory"
                        className="absolute inset-0 bg-gradient-to-r from-primary to-[hsl(var(--gradient-end))] rounded-full shadow-lg shadow-primary/30"
                        transition={{ type: "spring", bounce: 0.15, duration: 0.5 }}
                      />
                    )}
                    <span className="relative z-10 flex items-center gap-1.5 sm:gap-2">
                      {category.icon && <category.icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />}
                      <span className="sm:hidden">{category.label}</span>
                      <span className="hidden sm:inline">{category.fullLabel}</span>
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Tools Sections */}
        <AnimatePresence mode="wait">
          {showImageTools && (
            <motion.section
              key="image-tools"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="py-10 md:py-20"
            >
              <div className="container px-4">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="mb-6 sm:mb-10"
                >
                  <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                    <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-lg sm:rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                      <Image className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                    </div>
                    <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-foreground tracking-tight">
                      Image Tools
                    </h2>
                  </div>
                  <p className="text-sm sm:text-base text-muted-foreground ml-10 sm:ml-[52px]">
                    Compress, convert, and resize your images
                  </p>
                </motion.div>

                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-5">
                  {imageTools.map((tool, index) => (
                    <ToolCard key={tool.href} {...tool} delay={index} />
                  ))}
                </div>
              </div>
            </motion.section>
          )}
        </AnimatePresence>

        <AnimatePresence mode="wait">
          {showPdfTools && (
            <motion.section
              key="pdf-tools"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="py-10 md:py-20 relative"
            >
              {showImageTools && (
                <div className="absolute inset-0 bg-gradient-to-b from-muted/30 to-transparent" />
              )}
              <div className="container relative z-10 px-4">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="mb-6 sm:mb-10"
                >
                  <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                    <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-lg sm:rounded-xl bg-gradient-to-br from-[hsl(var(--gradient-end))]/20 to-[hsl(var(--gradient-end))]/5 flex items-center justify-center">
                      <Layers className="h-4 w-4 sm:h-5 sm:w-5 text-[hsl(var(--gradient-end))]" />
                    </div>
                    <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-foreground tracking-tight">
                      PDF Tools
                    </h2>
                  </div>
                  <p className="text-sm sm:text-base text-muted-foreground ml-10 sm:ml-[52px]">
                    Merge, compress, and convert PDF documents
                  </p>
                </motion.div>

                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-5">
                  {pdfTools.map((tool, index) => (
                    <ToolCard key={tool.href} {...tool} delay={index} />
                  ))}
                </div>
              </div>
            </motion.section>
          )}
        </AnimatePresence>
      </main>

      <Footer />
    </div>
  );
};

export default Index;
