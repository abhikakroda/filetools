import { Shield, Lock, Globe } from "lucide-react";

export const Footer = () => {
  return (
    <footer className="mt-auto border-t border-border bg-card/50">
      <div className="container py-8">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="flex items-center gap-6 text-muted-foreground">
            <div className="flex items-center gap-2">
              <Lock className="h-4 w-4" />
              <span className="text-sm">No uploads</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              <span className="text-sm">No tracking</span>
            </div>
            <div className="flex items-center gap-2">
              <Globe className="h-4 w-4" />
              <span className="text-sm">Works offline</span>
            </div>
          </div>
          <p className="text-sm text-muted-foreground max-w-md">
            Your files never leave your device. All processing happens locally
            in your browser using JavaScript.
          </p>
          <p className="text-xs text-muted-foreground/70">
            © {new Date().getFullYear()} FileTools. Built with privacy in mind.
          </p>
        </div>
      </div>
    </footer>
  );
};
