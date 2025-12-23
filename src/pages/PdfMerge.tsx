import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Files, Download, Trash2, RefreshCw, FileText } from "lucide-react";
import { PDFDocument } from "pdf-lib";
import { ToolLayout } from "@/components/ToolLayout";
import { FileDropzone } from "@/components/FileDropzone";
import { toast } from "sonner";

interface PdfFile {
  file: File;
  pageCount: number;
}

const PdfMerge = () => {
  const [pdfs, setPdfs] = useState<PdfFile[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [mergedPdf, setMergedPdf] = useState<Blob | null>(null);

  const handleFilesSelected = useCallback(async (selectedFiles: File[]) => {
    const pdfFiles = selectedFiles.filter(
      (f) => f.type === "application/pdf"
    );

    if (pdfFiles.length !== selectedFiles.length) {
      toast.error("Some files were skipped. Only PDF files are accepted.");
    }

    const newPdfs: PdfFile[] = [];

    for (const file of pdfFiles) {
      try {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await PDFDocument.load(arrayBuffer);
        newPdfs.push({
          file,
          pageCount: pdf.getPageCount(),
        });
      } catch (error) {
        toast.error(`Failed to load ${file.name}`);
      }
    }

    setPdfs((prev) => [...prev, ...newPdfs]);
    setMergedPdf(null);
  }, []);

  const removePdf = useCallback((index: number) => {
    setPdfs((prev) => prev.filter((_, i) => i !== index));
    setMergedPdf(null);
  }, []);

  const clearAll = useCallback(() => {
    setPdfs([]);
    setMergedPdf(null);
  }, []);

  const movePdf = (from: number, to: number) => {
    if (to < 0 || to >= pdfs.length) return;
    const newPdfs = [...pdfs];
    const [removed] = newPdfs.splice(from, 1);
    newPdfs.splice(to, 0, removed);
    setPdfs(newPdfs);
    setMergedPdf(null);
  };

  const mergePdfs = async () => {
    if (pdfs.length < 2) {
      toast.error("Please add at least 2 PDF files to merge");
      return;
    }

    setIsProcessing(true);

    try {
      const mergedDoc = await PDFDocument.create();

      for (const pdf of pdfs) {
        const arrayBuffer = await pdf.file.arrayBuffer();
        const pdfDoc = await PDFDocument.load(arrayBuffer);
        const pages = await mergedDoc.copyPages(
          pdfDoc,
          pdfDoc.getPageIndices()
        );
        pages.forEach((page) => mergedDoc.addPage(page));
      }

      const mergedBytes = await mergedDoc.save();
      const blob = new Blob([new Uint8Array(mergedBytes)], { type: "application/pdf" });
      setMergedPdf(blob);
      toast.success("PDFs merged successfully!");
    } catch (error) {
      toast.error("Failed to merge PDFs");
      console.error(error);
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadPdf = () => {
    if (!mergedPdf) return;

    const url = URL.createObjectURL(mergedPdf);
    const a = document.createElement("a");
    a.href = url;
    a.download = "merged.pdf";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const totalPages = pdfs.reduce((sum, pdf) => sum + pdf.pageCount, 0);

  return (
    <ToolLayout
      title="PDF Merge"
      description="Combine multiple PDF files into a single document. Drag to reorder."
      icon={Files}
    >
      <div className="space-y-6">
        <FileDropzone
          accept="application/pdf"
          onFilesSelected={handleFilesSelected}
          label="Drop PDF files here"
          description="Add multiple PDF files to merge into one"
        />

        <AnimatePresence>
          {pdfs.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">
                  {pdfs.length} PDF{pdfs.length !== 1 ? "s" : ""} • {totalPages}{" "}
                  total pages
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
                {pdfs.map((pdf, index) => (
                  <motion.div
                    key={`${pdf.file.name}-${index}`}
                    layout
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="flex items-center gap-4 p-4 bg-card border border-border rounded-xl group"
                  >
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <button
                        onClick={() => movePdf(index, index - 1)}
                        disabled={index === 0}
                        className="h-6 w-6 rounded hover:bg-muted flex items-center justify-center disabled:opacity-30"
                      >
                        ↑
                      </button>
                      <button
                        onClick={() => movePdf(index, index + 1)}
                        disabled={index === pdfs.length - 1}
                        className="h-6 w-6 rounded hover:bg-muted flex items-center justify-center disabled:opacity-30"
                      >
                        ↓
                      </button>
                    </div>

                    <div className="h-10 w-10 rounded-lg bg-accent flex items-center justify-center">
                      <FileText className="h-5 w-5 text-primary" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{pdf.file.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {pdf.pageCount} page{pdf.pageCount !== 1 ? "s" : ""}
                      </p>
                    </div>

                    <div className="px-3 py-1 rounded-full bg-muted text-xs font-medium">
                      #{index + 1}
                    </div>

                    <button
                      onClick={() => removePdf(index)}
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

        {pdfs.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-card border border-border rounded-xl p-4"
          >
            <div className="text-center sm:text-left">
              <p className="text-sm text-muted-foreground">
                Merged PDF will have {totalPages} page
                {totalPages !== 1 ? "s" : ""}
              </p>
            </div>

            <div className="flex gap-3">
              {mergedPdf && (
                <button onClick={downloadPdf} className="btn-secondary">
                  <Download className="h-4 w-4" />
                  Download PDF
                </button>
              )}
              <button
                onClick={mergePdfs}
                disabled={isProcessing || pdfs.length < 2}
                className="btn-primary disabled:opacity-50"
              >
                {isProcessing ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    Merging...
                  </>
                ) : (
                  <>
                    <Files className="h-4 w-4" />
                    {mergedPdf ? "Merge Again" : "Merge PDFs"}
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

export default PdfMerge;
