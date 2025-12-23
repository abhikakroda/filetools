import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";

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
      transition={{ duration: 0.4, delay: delay * 0.1 }}
    >
      <Link to={href} className="block">
        <motion.div
          whileHover={{ y: -4 }}
          whileTap={{ scale: 0.98 }}
          className="tool-card group"
        >
          <div className="tool-card-icon group-hover:scale-110 transition-transform duration-300">
            <Icon className="h-6 w-6" />
          </div>
          <h3 className="font-semibold text-foreground mb-1">{title}</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {description}
          </p>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-primary to-primary/50 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 rounded-b-xl" />
        </motion.div>
      </Link>
    </motion.div>
  );
};
