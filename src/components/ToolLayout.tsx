import { ReactNode } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, LucideIcon } from "lucide-react";
import { Header } from "./Header";
import { Footer } from "./Footer";

interface ToolLayoutProps {
  title: string;
  description: string;
  icon: LucideIcon;
  children: ReactNode;
}

export const ToolLayout = ({
  title,
  description,
  icon: Icon,
  children,
}: ToolLayoutProps) => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">
        <div className="container py-6 md:py-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-4"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="text-sm">Back to tools</span>
            </Link>

            <div className="flex items-start gap-4">
              <div className="h-14 w-14 rounded-xl bg-accent flex items-center justify-center text-primary flex-shrink-0">
                <Icon className="h-7 w-7" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-foreground">
                  {title}
                </h1>
                <p className="text-muted-foreground mt-1">{description}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            {children}
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
};
