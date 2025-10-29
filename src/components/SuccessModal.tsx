import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { CheckCircle2, ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';

interface SuccessModalProps {
  open: boolean;
  onClose: () => void;
  txHash?: string;
  explorerUrl?: string;
}

const SuccessModal = ({ open, onClose, txHash, explorerUrl }: SuccessModalProps) => {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="glass-card border-primary/20">
        <DialogHeader>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="flex justify-center mb-4"
          >
            <CheckCircle2 className="w-20 h-20 text-primary animate-glow" />
          </motion.div>
          <DialogTitle className="text-2xl text-center gradient-text">
            Transfer Successful! 🎉
          </DialogTitle>
          <DialogDescription className="text-center space-y-4 pt-4">
            <p className="text-foreground/80">
              Your cross-chain transfer has been completed successfully.
            </p>
            {txHash && (
              <div className="glass-card p-4 rounded-lg">
                <p className="text-xs text-muted-foreground mb-2">Transaction Hash</p>
                <p className="text-sm font-mono break-all text-foreground">{txHash}</p>
              </div>
            )}
            <div className="flex gap-3 justify-center pt-4">
              {explorerUrl && (
                <Button
                  variant="outline"
                  className="gap-2"
                  onClick={() => window.open(explorerUrl, '_blank')}
                >
                  View on Explorer
                  <ExternalLink className="w-4 h-4" />
                </Button>
              )}
              <Button onClick={onClose} className="bg-gradient-to-r from-primary to-secondary">
                Done
              </Button>
            </div>
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
};

export default SuccessModal;
