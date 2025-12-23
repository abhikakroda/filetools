import { forwardRef } from "react";
import { Link } from "react-router-dom";
import { Shield, Zap } from "lucide-react";
import { motion } from "framer-motion";

export const Header = forwardRef<HTMLElement>((_, ref) => {
  return (
    <header ref={ref} className="sticky top-0 z-50 w-full glass-strong border-b border-border/50">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-3">
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/70 text-primary-foreground shadow-lg shadow-primary/20"
          >
            <Zap className="h-5 w-5" />
          </motion.div>
          <div className="flex flex-col">
            <span className="font-bold text-lg leading-tight">FileTools</span>
            <span className="text-xs text-muted-foreground hidden sm:block">
              Private & Fast
            </span>
          </div>
        </Link>

        <div className="privacy-badge">
          <Shield className="h-4 w-4" />
          <span className="hidden sm:inline">100% Browser-Based</span>
          <span className="sm:hidden">Private</span>
        </div>
      </div>
    </header>
  );
});

Header.displayName = "Header";
