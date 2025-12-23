import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { LucideIcon, ArrowUpRight } from "lucide-react";

interface ToolCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  href: string;
  delay?: number;
}

export const ToolCard = ({
  title,
  description,
  icon: Icon,
  href,
  delay = 0,
}: ToolCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: delay * 0.08, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      <Link to={href} className="block group">
        <motion.div
          whileHover={{ y: -6, scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
          className="relative overflow-hidden rounded-xl sm:rounded-2xl p-4 sm:p-6 bg-card border border-border/60 hover:border-primary/40 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 h-full"
        >
          {/* Gradient overlay on hover */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.03] via-transparent to-[hsl(var(--gradient-end))]/[0.02] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          
          {/* Icon container */}
          <div className="relative mb-3 sm:mb-4 w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent flex items-center justify-center group-hover:scale-110 group-hover:rotate-[-4deg] transition-all duration-300">
            <Icon className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
          </div>
          
          {/* Content */}
          <div className="relative">
            <div className="flex items-start justify-between mb-1 sm:mb-1.5 gap-1">
              <h3 className="font-bold text-sm sm:text-base text-foreground tracking-tight leading-tight">{title}</h3>
              <ArrowUpRight className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all duration-300 flex-shrink-0 mt-0.5" />
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed line-clamp-2">
              {description}
            </p>
          </div>
          
          {/* Bottom accent line */}
          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-primary via-[hsl(var(--gradient-end))] to-primary/50 transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />
        </motion.div>
      </Link>
    </motion.div>
  );
};
