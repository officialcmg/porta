import { motion } from 'framer-motion';
import { FEATURED_CHAINS } from '@/lib/constants';
import { Sparkles } from 'lucide-react';
import { useState } from 'react';

const ChainIcons = () => {
  const [imageErrors, setImageErrors] = useState<Set<number>>(new Set());

  const handleImageError = (chainId: number) => {
    setImageErrors(prev => new Set(prev).add(chainId));
  };

  return (
    <div className="relative">
      {/* Main chain grid */}
      <div className="flex items-center justify-center gap-4 flex-wrap max-w-5xl mx-auto">
        {FEATURED_CHAINS.map((chain, index) => (
          <motion.div
            key={chain.id}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.05, type: "spring", stiffness: 200, damping: 20 }}
            whileHover={{ scale: 1.1, y: -8 }}
            className="group relative"
          >
            <div className="glass-card rounded-2xl p-5 cursor-pointer transition-all border border-black/5 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/10 w-28 h-28 flex flex-col items-center justify-center gap-3">
              {/* Chain Logo */}
              {!imageErrors.has(chain.id) ? (
                <img 
                  src={chain.logoURI} 
                  alt={chain.name}
                  onError={() => handleImageError(chain.id)}
                  className="w-10 h-10 object-contain"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold text-sm">
                  {chain.name.substring(0, 2).toUpperCase()}
                </div>
              )}
              
              {/* Chain Name */}
              <span className="text-xs font-semibold text-center leading-tight group-hover:text-primary transition-colors">
                {chain.name}
              </span>
            </div>
            
            {/* Hover glow effect */}
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/0 to-secondary/0 group-hover:from-primary/10 group-hover:to-secondary/10 transition-all duration-300 -z-10 blur-xl" />
          </motion.div>
        ))}
        
        {/* More chains indicator */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: FEATURED_CHAINS.length * 0.05, type: "spring", stiffness: 200, damping: 20 }}
          whileHover={{ scale: 1.1, y: -8 }}
          className="group relative"
        >
          <div className="glass-card rounded-2xl p-5 cursor-pointer transition-all border border-black/5 hover:border-secondary/30 hover:shadow-lg hover:shadow-secondary/10 w-28 h-28 flex flex-col items-center justify-center gap-3">
            <Sparkles className="w-10 h-10 text-secondary" />
            <span className="text-xs font-semibold text-center leading-tight group-hover:text-secondary transition-colors">
              44+ more
            </span>
          </div>
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-secondary/0 to-primary/0 group-hover:from-secondary/10 group-hover:to-primary/10 transition-all duration-300 -z-10 blur-xl" />
        </motion.div>
      </div>
    </div>
  );
};

export default ChainIcons;
