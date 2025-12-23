import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Scissors, Download, Trash2, RefreshCw, FileText } from "lucide-react";
import { PDFDocument } from "pdf-lib";
import { ToolLayout } from "@/components/ToolLayout";
import { FileDropzone } from "@/components/FileDropzone";
import { toast } from "sonner";

interface SplitPdf {
  blob: Blob;
  name: string;
  pageCount: number;
}

const PdfSplit = () => {
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState(0);
  const [splitMode, setSplitMode] = useState<"single" | "range" | "custom">("single");
  const [rangeStart, setRangeStart] = useState(1);
  const [rangeEnd, setRangeEnd] = useState(1);
  const [customPages, setCustomPages] = useState("");
  const [splitPdfs, setSplitPdfs] = useState<SplitPdf[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFilesSelected = useCallback(async (selectedFiles: File[]) => {
    const pdfFiles = selectedFiles.filter((f) => f.type === "application/pdf");
    if (pdfFiles.length === 0) {
      toast.error("Please select a PDF file");
      return;
    }

    const file = pdfFiles[0];
    setPdfFile(file);
    setSplitPdfs([]);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await PDFDocument.load(arrayBuffer);
      const pages = pdf.getPageCount();
      setPageCount(pages);
      setRangeEnd(pages);
      toast.success(`PDF loaded: ${pages} pages`);
    } catch (error) {
      toast.error("Failed to load PDF");
      console.error(error);
    }
  }, []);

  const parseCustomPages = (input: string): number[] => {
    const pages: number[] = [];
    const parts = input.split(",").map((s) => s.trim());

    for (const part of parts) {
      if (part.includes("-")) {
        const [start, end] = part.split("-").map(Number);
        if (!isNaN(start) && !isNaN(end)) {
          for (let i = start; i <= end; i++) {
            if (i >= 1 && i <= pageCount && !pages.includes(i)) {
              pages.push(i);
            }
          }
        }
      } else {
        const num = parseInt(part);
        if (!isNaN(num) && num >= 1 && num <= pageCount && !pages.includes(num)) {
          pages.push(num);
        }
      }
    }

    return pages.sort((a, b) => a - b);
  };

  const splitPdf = async () => {
    if (!pdfFile) return;

    setIsProcessing(true);
    setSplitPdfs([]);

    try {
      const arrayBuffer = await pdfFile.arrayBuffer();
      const pdf = await PDFDocument.load(arrayBuffer);
      const results: SplitPdf[] = [];
      const baseName = pdfFile.name.replace(".pdf", "");

      if (splitMode === "single") {
        // Split into individual pages
        for (let i = 0; i < pdf.getPageCount(); i++) {
          const newPdf = await PDFDocument.create();
          const [copiedPage] = await newPdf.copyPages(pdf, [i]);
          newPdf.addPage(copiedPage);

          const bytes = await newPdf.save();
          const blob = new Blob([new Uint8Array(bytes)], { type: "application/pdf" });

          results.push({
            blob,
            name: `${baseName}_page_${i + 1}.pdf`,
            pageCount: 1,
          });
        }
      } else if (splitMode === "range") {
        // Extract page range
        const newPdf = await PDFDocument.create();
        const pageIndices = [];
        for (let i = rangeStart - 1; i < rangeEnd; i++) {
          pageIndices.push(i);
        }
        const copiedPages = await newPdf.copyPages(pdf, pageIndices);
        copiedPages.forEach((page) => newPdf.addPage(page));

        const bytes = await newPdf.save();
        const blob = new Blob([new Uint8Array(bytes)], { type: "application/pdf" });

        results.push({
          blob,
          name: `${baseName}_pages_${rangeStart}-${rangeEnd}.pdf`,
          pageCount: pageIndices.length,
        });
      } else if (splitMode === "custom") {
        // Extract custom pages
        const pages = parseCustomPages(customPages);
        if (pages.length === 0) {
          toast.error("No valid pages specified");
          setIsProcessing(false);
          return;
        }

        const newPdf = await PDFDocument.create();
        const pageIndices = pages.map((p) => p - 1);
        const copiedPages = await newPdf.copyPages(pdf, pageIndices);
        copiedPages.forEach((page) => newPdf.addPage(page));

        const bytes = await newPdf.save();
        const blob = new Blob([new Uint8Array(bytes)], { type: "application/pdf" });

        results.push({
          blob,
          name: `${baseName}_custom.pdf`,
          pageCount: pages.length,
        });
      }

      setSplitPdfs(results);
      toast.success(
        `Created ${results.length} PDF${results.length !== 1 ? "s" : ""}!`
      );
    } catch (error) {
      toast.error("Failed to split PDF");
      console.error(error);
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadPdf = (pdf: SplitPdf) => {
    const url = URL.createObjectURL(pdf.blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = pdf.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const downloadAll = () => {
    splitPdfs.forEach((pdf, index) => {
      setTimeout(() => downloadPdf(pdf), index * 200);
    });
  };

  const clearAll = () => {
    setPdfFile(null);
    setSplitPdfs([]);
    setPageCount(0);
  };

  return (
    <ToolLayout
      title="PDF Split"
      description="Extract pages or split PDF into multiple files. All processing happens locally."
      icon={Scissors}
    >
      <div className="space-y-6">
        <FileDropzone
          accept="application/pdf"
          onFilesSelected={handleFilesSelected}
          label="Drop PDF file here"
          description="Select a PDF to split"
        />

        <AnimatePresence>
          {pdfFile && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="settings-panel space-y-6"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-xl bg-accent flex items-center justify-center">
                    <FileText className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium truncate max-w-[200px] sm:max-w-none">
                      {pdfFile.name}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {pageCount} page{pageCount !== 1 ? "s" : ""}
                    </p>
                  </div>
                </div>
                <button
                  onClick={clearAll}
                  className="p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-destructive transition-colors"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>

              <div>
                <label className="block text-sm font-medium mb-3">
                  Split Mode
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { value: "single", label: "All Pages" },
                    { value: "range", label: "Page Range" },
                    { value: "custom", label: "Custom" },
                  ].map((mode) => (
                    <button
                      key={mode.value}
                      onClick={() => setSplitMode(mode.value as typeof splitMode)}
                      className={`py-2.5 px-4 rounded-xl font-medium transition-all duration-300 text-sm ${
                        splitMode === mode.value
                          ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25"
                          : "bg-muted hover:bg-muted/80"
                      }`}
                    >
                      {mode.label}
                    </button>
                  ))}
                </div>
              </div>

              {splitMode === "range" && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="grid grid-cols-2 gap-4"
                >
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      From Page
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={pageCount}
                      value={rangeStart}
                      onChange={(e) =>
                        setRangeStart(
                          Math.min(
                            Math.max(1, parseInt(e.target.value) || 1),
                            rangeEnd
                          )
                        )
                      }
                      className="w-full px-4 py-2.5 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      To Page
                    </label>
                    <input
                      type="number"
                      min={rangeStart}
                      max={pageCount}
                      value={rangeEnd}
                      onChange={(e) =>
                        setRangeEnd(
                          Math.max(
                            rangeStart,
                            Math.min(parseInt(e.target.value) || pageCount, pageCount)
                          )
                        )
                      }
                      className="w-full px-4 py-2.5 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                  </div>
                </motion.div>
              )}

              {splitMode === "custom" && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <label className="block text-sm font-medium mb-2">
                    Page Numbers
                  </label>
                  <input
                    type="text"
                    value={customPages}
                    onChange={(e) => setCustomPages(e.target.value)}
                    placeholder="e.g., 1, 3, 5-8, 12"
                    className="w-full px-4 py-2.5 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                  <p className="text-xs text-muted-foreground mt-2">
                    Use commas to separate pages and hyphens for ranges
                  </p>
                </motion.div>
              )}

              <button
                onClick={splitPdf}
                disabled={isProcessing}
                className="btn-primary w-full disabled:opacity-50"
              >
                {isProcessing ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    Splitting...
                  </>
                ) : (
                  <>
                    <Scissors className="h-4 w-4" />
                    {splitMode === "single"
                      ? "Split All Pages"
                      : splitMode === "range"
                      ? `Extract Pages ${rangeStart}-${rangeEnd}`
                      : "Extract Custom Pages"}
                  </>
                )}
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {splitPdfs.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4"
            >
              <div className="flex items-center justify-between">
                <span className="font-medium">
                  {splitPdfs.length} PDF{splitPdfs.length !== 1 ? "s" : ""} Ready
                </span>
                {splitPdfs.length > 1 && (
                  <button onClick={downloadAll} className="btn-secondary">
                    <Download className="h-4 w-4" />
                    Download All
                  </button>
                )}
              </div>

              <div className="space-y-2">
                {splitPdfs.map((pdf, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="file-item group"
                  >
                    <div className="h-10 w-10 rounded-lg bg-accent flex items-center justify-center flex-shrink-0">
                      <FileText className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{pdf.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {pdf.pageCount} page{pdf.pageCount !== 1 ? "s" : ""}
                      </p>
                    </div>
                    <button
                      onClick={() => downloadPdf(pdf)}
                      className="btn-secondary py-2 px-4 text-sm opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Download className="h-4 w-4" />
                      Download
                    </button>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </ToolLayout>
  );
};

export default PdfSplit;
