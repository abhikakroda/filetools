import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import ImageCompress from "./pages/ImageCompress";
import ImageToPdf from "./pages/ImageToPdf";
import ImageResize from "./pages/ImageResize";
import ImageConvert from "./pages/ImageConvert";
import PdfMerge from "./pages/PdfMerge";
import ComingSoon from "./pages/ComingSoon";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner position="top-center" />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/image-compress" element={<ImageCompress />} />
          <Route path="/image-to-pdf" element={<ImageToPdf />} />
          <Route path="/images-to-pdf" element={<ImageToPdf />} />
          <Route path="/image-resize" element={<ImageResize />} />
          <Route path="/image-to-png" element={<ImageConvert />} />
          <Route path="/image-to-jpeg" element={<ImageConvert />} />
          <Route path="/pdf-merge" element={<PdfMerge />} />
          <Route path="/pdf-compress" element={<ComingSoon />} />
          <Route path="/pdf-to-image" element={<ComingSoon />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
