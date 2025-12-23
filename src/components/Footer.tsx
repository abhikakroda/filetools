import { Shield, Lock, Wifi, Heart } from "lucide-react";

export const Footer = () => {
  return (
    <footer className="mt-auto border-t border-border/40 bg-muted/30">
      <div className="container py-10">
        <div className="flex flex-col items-center gap-6 text-center">
          <div className="flex flex-wrap justify-center items-center gap-6 text-muted-foreground">
            {[
              { icon: Lock, label: "No uploads" },
              { icon: Shield, label: "No tracking" },
              { icon: Wifi, label: "Works offline" },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-2 text-sm">
                <item.icon className="h-4 w-4 text-primary/60" />
                <span>{item.label}</span>
              </div>
            ))}
          </div>
          
          <p className="text-sm text-muted-foreground max-w-lg leading-relaxed">
            Your files never leave your device. All processing happens locally
            in your browser using JavaScript.
          </p>
          
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground/60">
            <span>© {new Date().getFullYear()} FileTools</span>
            <span>•</span>
            <span className="flex items-center gap-1">
              Made with <Heart className="h-3 w-3 text-destructive/60" /> for privacy
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
