import { Link } from "react-router-dom";
import { Shield, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

export const Header = () => {
  return (
    <header className="sticky top-0 z-50 w-full bg-background/80 backdrop-blur-xl border-b border-border/40">
      <div className="container px-4 flex h-14 sm:h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2 sm:gap-3 group">
          <motion.div
            whileHover={{ scale: 1.08, rotate: -5 }}
            whileTap={{ scale: 0.95 }}
            className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-lg sm:rounded-xl bg-gradient-to-br from-primary via-primary to-[hsl(var(--gradient-end))] text-primary-foreground shadow-lg shadow-primary/30"
          >
            <Sparkles className="h-4 w-4 sm:h-5 sm:w-5" />
          </motion.div>
          <div className="flex flex-col">
            <span className="font-extrabold text-base sm:text-lg leading-tight tracking-tight group-hover:text-primary transition-colors">FileTools</span>
            <span className="text-[10px] sm:text-[11px] text-muted-foreground font-medium hidden sm:block">
              Private & Lightning Fast
            </span>
          </div>
        </Link>

        <motion.div 
          whileHover={{ scale: 1.02 }}
          className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-full bg-gradient-to-r from-success/10 to-success/5 border border-success/20 text-success text-xs sm:text-sm font-medium"
        >
          <Shield className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
          <span>Private</span>
        </motion.div>
      </div>
    </header>
  );
};
