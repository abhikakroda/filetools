import { Link } from "react-router-dom";
import { Shield, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

export const Header = () => {
  return (
    <header className="sticky top-0 z-50 w-full bg-background/80 backdrop-blur-xl border-b border-border/40">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-3 group">
          <motion.div
            whileHover={{ scale: 1.08, rotate: -5 }}
            whileTap={{ scale: 0.95 }}
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary via-primary to-[hsl(var(--gradient-end))] text-primary-foreground shadow-lg shadow-primary/30"
          >
            <Sparkles className="h-5 w-5" />
          </motion.div>
          <div className="flex flex-col">
            <span className="font-extrabold text-lg leading-tight tracking-tight group-hover:text-primary transition-colors">FileTools</span>
            <span className="text-[11px] text-muted-foreground font-medium hidden sm:block">
              Private & Lightning Fast
            </span>
          </div>
        </Link>

        <motion.div 
          whileHover={{ scale: 1.02 }}
          className="flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-success/10 to-success/5 border border-success/20 text-success text-sm font-medium"
        >
          <Shield className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">100% Private</span>
          <span className="sm:hidden">Private</span>
        </motion.div>
      </div>
    </header>
  );
};
