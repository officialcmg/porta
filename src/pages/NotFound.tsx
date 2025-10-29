import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Home, Zap } from "lucide-react";
import { motion } from "framer-motion";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="text-center space-y-8 glass-card p-12 rounded-3xl max-w-md"
      >
        <div className="space-y-4">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
          >
            <Zap className="w-20 h-20 mx-auto text-primary animate-glow" />
          </motion.div>
          <h1 className="text-6xl font-bold gradient-text">404</h1>
          <p className="text-xl text-muted-foreground">Oops! Page not found</p>
          <p className="text-sm text-muted-foreground">
            The page you're looking for doesn't exist or has been moved.
          </p>
        </div>
        <Button 
          asChild
          className="bg-gradient-to-r from-primary to-secondary hover:opacity-90 glow-primary"
        >
          <a href="/" className="flex items-center gap-2">
            <Home className="w-4 h-4" />
            Return to Home
          </a>
        </Button>
      </motion.div>
    </div>
  );
};

export default NotFound;
