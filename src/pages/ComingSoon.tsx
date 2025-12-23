import { useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Construction, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

const ComingSoon = () => {
  const { tool } = useParams();
  const toolName = tool?.split("-").map(word => 
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(" ") || "This Tool";

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 flex items-center justify-center">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-md mx-auto text-center"
          >
            <div className="h-20 w-20 rounded-2xl bg-accent flex items-center justify-center mx-auto mb-6">
              <Construction className="h-10 w-10 text-primary" />
            </div>
            
            <h1 className="text-2xl font-bold text-foreground mb-3">
              {toolName}
            </h1>
            <p className="text-muted-foreground mb-8">
              This tool is coming soon! We're working hard to bring you more 
              privacy-focused file tools.
            </p>

            <Link to="/" className="btn-primary inline-flex">
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Link>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ComingSoon;
