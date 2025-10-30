import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { CheckCircle2, ExternalLink, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { LIFI_CHAINS } from '@/lib/constants';

interface SuccessModalProps {
  open: boolean;
  onClose: () => void;
  sourceTx?: string;
  destTx?: string;
  sourceChainId?: number;
  destChainId?: number;
}

const getExplorerUrl = (chainId: number, txHash: string) => {
  // Chain-specific explorer patterns (in same order as LIFI_CHAINS)
  const explorers: Record<number, string> = {
    // Ethereum
    1: `https://etherscan.io/tx/${txHash}`,
    // BSC
    56: `https://bscscan.com/tx/${txHash}`,
    // Arbitrum
    42161: `https://arbiscan.io/tx/${txHash}`,
    // Base
    8453: `https://basescan.org/tx/${txHash}`,
    // Blast
    81457: `https://blastscan.io/tx/${txHash}`,
    // Avalanche
    43114: `https://snowtrace.io/tx/${txHash}`,
    // Polygon
    137: `https://polygonscan.com/tx/${txHash}`,
    // Scroll
    534352: `https://scrollscan.com/tx/${txHash}`,
    // Optimism
    10: `https://optimistic.etherscan.io/tx/${txHash}`,
    // Linea
    59144: `https://lineascan.build/tx/${txHash}`,
    // zkSync
    324: `https://explorer.zksync.io/tx/${txHash}`,
    // Polygon zkEVM
    1101: `https://zkevm.polygonscan.com/tx/${txHash}`,
    // Gnosis
    100: `https://gnosisscan.io/tx/${txHash}`,
    // Fantom
    250: `https://ftmscan.com/tx/${txHash}`,
    // Moonriver
    1285: `https://moonriver.moonscan.io/tx/${txHash}`,
    // Moonbeam
    1284: `https://moonscan.io/tx/${txHash}`,
    // FUSE
    122: `https://explorer.fuse.io/tx/${txHash}`,
    // Boba
    288: `https://bobascan.com/tx/${txHash}`,
    // Mode
    34443: `https://explorer.mode.network/tx/${txHash}`,
    // Metis
    1088: `https://explorer.metis.io/tx/${txHash}`,
    // Lisk
    1135: `https://blockscout.lisk.com/tx/${txHash}`,
    // Unichain
    130: `https://unichain-sepolia.blockscout.com/tx/${txHash}`,
    // Aurora
    1313161554: `https://explorer.aurora.dev/tx/${txHash}`,
    // Sei
    1329: `https://seitrace.com/tx/${txHash}`,
    // Immutable zkEVM
    13371: `https://explorer.immutable.com/tx/${txHash}`,
    // Flare
    14: `https://flare-explorer.flare.network/tx/${txHash}`,
    // Sonic
    146: `https://sonicscan.org/tx/${txHash}`,
    // Vana
    1480: `https://vanascan.io/tx/${txHash}`,
    // Gravity
    1625: `https://explorer.gravity.xyz/tx/${txHash}`,
    // Taiko
    167000: `https://taikoscan.io/tx/${txHash}`,
    // Soneium
    1868: `https://explorer.soneium.org/tx/${txHash}`,
    // Swellchain
    1923: `https://explorer.swellnetwork.io/tx/${txHash}`,
    // Ronin
    2020: `https://app.roninchain.com/tx/${txHash}`,
    // opBNB
    204: `https://opbnbscan.com/tx/${txHash}`,
    // Corn
    21000000: `https://cornscan.io/tx/${txHash}`,
    // Lens
    232: `https://block-explorer.lens.dev/tx/${txHash}`,
    // Cronos
    25: `https://cronoscan.com/tx/${txHash}`,
    // Fraxtal
    252: `https://fraxscan.com/tx/${txHash}`,
    // Abstract
    2741: `https://explorer.abstract.xyz/tx/${txHash}`,
    // Rootstock
    30: `https://rootstock.blockscout.com/tx/${txHash}`,
    // Apechain
    33139: `https://apescan.io/tx/${txHash}`,
    // Celo
    42220: `https://celoscan.io/tx/${txHash}`,
    // Etherlink
    42793: `https://explorer.etherlink.com/tx/${txHash}`,
    // Hemi
    43111: `https://explorer.hemi.xyz/tx/${txHash}`,
    // World Chain
    480: `https://worldscan.org/tx/${txHash}`,
    // XDC
    50: `https://xdcscan.io/tx/${txHash}`,
    // Mantle
    5000: `https://mantlescan.xyz/tx/${txHash}`,
    // Sophon
    50104: `https://explorer.sophon.xyz/tx/${txHash}`,
    // Superposition
    55244: `https://explorer.superposition.so/tx/${txHash}`,
    // Ink
    57073: `https://explorer.inkonchain.com/tx/${txHash}`,
    // BOB
    60808: `https://explorer.gobob.xyz/tx/${txHash}`,
    // Flow
    747: `https://evm.flowscan.io/tx/${txHash}`,
    // Katana
    747474: `https://katana.roninchain.com/tx/${txHash}`,
    // Berachain
    80094: `https://bartio.beratrail.io/tx/${txHash}`,
    // Kaia
    8217: `https://kaiascan.io/tx/${txHash}`,
    // Plasma
    9745: `https://plasmascan.com/tx/${txHash}`,
    // Plume
    98866: `https://plumescan.com/tx/${txHash}`,
    // HyperEVM
    999: `https://explorer.hyperliquid.xyz/tx/${txHash}`,
    // Solana
    1151111081099710: `https://solscan.io/tx/${txHash}`,
  };
  
  return explorers[chainId] || `https://etherscan.io/tx/${txHash}`;
};

const SuccessModal = ({ open, onClose, sourceTx, destTx, sourceChainId, destChainId }: SuccessModalProps) => {
  const sourceChain = LIFI_CHAINS.find(c => c.id === sourceChainId);
  const destChain = LIFI_CHAINS.find(c => c.id === destChainId);
  
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg border-0 bg-gradient-to-br from-background via-background to-primary/5 backdrop-blur-xl">
        <DialogHeader className="space-y-4">
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", duration: 0.6, bounce: 0.4 }}
            className="flex justify-center"
          >
            <div className="relative">
              <CheckCircle2 className="w-20 h-20 text-primary" />
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 1, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute inset-0 rounded-full bg-primary/20 blur-xl"
              />
            </div>
          </motion.div>
          
          <DialogTitle className="text-3xl text-center font-bold bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent">
            Transfer Successful! 🎉
          </DialogTitle>
          
          <DialogDescription className="text-center space-y-6 pt-2">
            <motion.p 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-base text-foreground/70"
            >
              Your cross-chain transfer has been executed successfully.
            </motion.p>
            
            {/* Transaction Links */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="space-y-3"
            >
              {/* Source Transaction */}
              {sourceTx && sourceChain && (
                <div className="glass-card p-4 rounded-xl border border-primary/10 hover:border-primary/30 transition-all group">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {sourceChain.logoURI && <img src={sourceChain.logoURI} alt={sourceChain.name} className="w-5 h-5" onError={(e) => e.currentTarget.style.display = 'none'} />}
                      <p className="text-sm font-semibold text-foreground">Source: {sourceChain.name}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 gap-2 text-primary hover:text-primary/80"
                      onClick={() => window.open(getExplorerUrl(sourceChainId!, sourceTx), '_blank')}
                    >
                      View TX
                      <ExternalLink className="w-3 h-3" />
                    </Button>
                  </div>
                  <p className="text-xs font-mono text-muted-foreground break-all opacity-60 group-hover:opacity-100 transition-opacity">
                    {sourceTx.slice(0, 20)}...{sourceTx.slice(-20)}
                  </p>
                </div>
              )}
              
              {/* Arrow if both transactions exist */}
              {sourceTx && destTx && (
                <div className="flex justify-center">
                  <motion.div
                    animate={{ y: [0, 5, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    <ArrowRight className="w-5 h-5 text-primary/50 rotate-90" />
                  </motion.div>
                </div>
              )}
              
              {/* Destination Transaction */}
              {destTx && destChain && (
                <div className="glass-card p-4 rounded-xl border border-secondary/10 hover:border-secondary/30 transition-all group">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {destChain.logoURI && <img src={destChain.logoURI} alt={destChain.name} className="w-5 h-5" onError={(e) => e.currentTarget.style.display = 'none'} />}
                      <p className="text-sm font-semibold text-foreground">Destination: {destChain.name}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 gap-2 text-secondary hover:text-secondary/80"
                      onClick={() => window.open(getExplorerUrl(destChainId!, destTx), '_blank')}
                    >
                      View TX
                      <ExternalLink className="w-3 h-3" />
                    </Button>
                  </div>
                  <p className="text-xs font-mono text-muted-foreground break-all opacity-60 group-hover:opacity-100 transition-opacity">
                    {destTx.slice(0, 20)}...{destTx.slice(-20)}
                  </p>
                </div>
              )}
            </motion.div>
            
            {/* Close Button */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="pt-2"
            >
              <Button 
                onClick={onClose} 
                className="w-full h-12 bg-gradient-to-r from-primary via-secondary to-primary bg-[length:200%_100%] hover:bg-[position:100%_0] transition-all duration-500 font-semibold text-base"
              >
                Done
              </Button>
            </motion.div>
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
};

export default SuccessModal;
