import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { usePrivy } from '@privy-io/react-auth';
import { Button } from '@/components/ui/button';
import { Zap, Sparkles, ArrowRightLeft } from 'lucide-react';
import TransferForm from '@/components/TransferForm';
import ChainIcons from '@/components/ChainIcons';
import { initializeLiFi } from '@/utils/lifi';
import { FlickeringGrid } from '@/components/ui/flickering-grid';

const Index = () => {
  const { login, authenticated, logout, user } = usePrivy();

  useEffect(() => {
    // Initialize Li.Fi SDK on mount
    initializeLiFi();
  }, []);

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 -z-10">
        <FlickeringGrid
          className="absolute inset-0"
          squareSize={4}
          gridGap={6}
          color="rgb(168, 85, 247)"
          maxOpacity={0.05}
          flickerChance={0.08}
        />
      </div>

      {/* Navigation */}
      <motion.nav 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 100, damping: 20 }}
        className="fixed top-0 w-full z-50 backdrop-blur-xl bg-white/70 border-b border-black/5"
      >
        <div className="container mx-auto px-6 py-5">
          <div className="flex items-center justify-between">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="flex items-center gap-3 cursor-pointer"
            >
              <div className="relative">
                <Zap className="w-9 h-9 text-primary drop-shadow-glow" />
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-0 rounded-full border-2 border-primary/20 border-t-primary"
                />
              </div>
              <h1 className="text-3xl font-bold gradient-text">Porta</h1>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
            >
              {authenticated ? (
                <div className="flex items-center gap-3">
                  <div className="hidden md:flex items-center gap-2 glass-card px-5 py-2.5 rounded-full border border-black/10">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-sm font-mono font-semibold text-foreground">
                      {user?.wallet?.address?.slice(0, 6)}...{user?.wallet?.address?.slice(-4)}
                    </span>
                  </div>
                  <Button 
                    onClick={logout} 
                    variant="ghost" 
                    className="rounded-full hover:bg-black/5"
                  >
                    Disconnect
                  </Button>
                </div>
              ) : (
                <Button 
                  onClick={login} 
                  size="lg"
                  className="rounded-full px-8 bg-gradient-to-r from-primary via-secondary to-primary bg-[length:200%_100%] hover:bg-[position:100%_0] transition-all duration-500 font-semibold shadow-lg shadow-primary/25"
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  Connect Wallet
                </Button>
              )}
            </motion.div>
          </div>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <section className="pt-48 pb-24 px-6">
        <div className="container mx-auto max-w-7xl">
          {/* Hero Headline */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-center mb-20"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card border border-primary/30 mb-8"
            >
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-muted-foreground">56+ Chains • Instant Transfers</span>
            </motion.div>
            
            <h1 className="text-6xl md:text-8xl font-bold leading-[1.1] mb-6 tracking-tight">
              <span className="gradient-text block">Send crypto anywhere</span>
              <span className="text-foreground/90 block">in one tap</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Cross-chain transfers made <span className="text-primary font-semibold">magical</span>.
            </p>
          </motion.div>

          {/* Transfer Form */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="mb-32"
          >
            <TransferForm />
          </motion.div>

          {/* Features Grid */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="grid md:grid-cols-3 gap-6 mb-32"
          >
            {[
              {
                icon: <Zap className="w-8 h-8" />,
                title: "Lightning Fast",
                desc: "Transfer across chains in seconds",
                gradient: "from-primary/20 to-primary/5"
              },
              {
                icon: <ArrowRightLeft className="w-8 h-8" />,
                title: "Universal Bridge",
                desc: "Connect any chain to any chain",
                gradient: "from-secondary/20 to-secondary/5"
              },
              {
                icon: <Sparkles className="w-8 h-8" />,
                title: "Zero Hassle",
                desc: "No bridges, no complexity",
                gradient: "from-primary/20 to-secondary/5"
              }
            ].map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 + i * 0.1 }}
                whileHover={{ y: -5, scale: 1.02 }}
                className="group relative overflow-hidden glass-card rounded-3xl p-8 border border-white/5 hover:border-primary/30 transition-all duration-300"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                <div className="relative z-10">
                  <div className="mb-4 text-primary">
                    {feature.icon}
                  </div>
                  <h3 className="text-2xl font-bold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.desc}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Supported Chains */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
            className="text-center"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4 gradient-text">
              All Your Favorite Chains
            </h2>
            <p className="text-xl text-muted-foreground mb-12">
              Seamlessly transfer between 56+ supported blockchains
            </p>
            <ChainIcons />
          </motion.div>
        </div>
      </section>

    </div>
  );
};

export default Index;
