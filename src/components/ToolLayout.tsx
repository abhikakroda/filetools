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
        <div className="container px-4 py-4 sm:py-6 md:py-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 sm:mb-8"
          >
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-3 sm:mb-4"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="text-sm">Back to tools</span>
            </Link>

            <div className="flex items-start gap-3 sm:gap-4">
              <div className="h-11 w-11 sm:h-14 sm:w-14 rounded-lg sm:rounded-xl bg-accent flex items-center justify-center text-primary flex-shrink-0">
                <Icon className="h-5 w-5 sm:h-7 sm:w-7" />
              </div>
              <div className="min-w-0">
                <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground">
                  {title}
                </h1>
                <p className="text-sm sm:text-base text-muted-foreground mt-0.5 sm:mt-1">{description}</p>
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
