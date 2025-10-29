import { useState, useEffect, useMemo, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useToast } from '@/hooks/use-toast';
import { usePrivy } from '@privy-io/react-auth';
import { LIFI_CHAINS } from '@/lib/constants';
import { getLiFiQuote, getChainTokens } from '@/utils/lifi';
import { switchChain, getTokenBalance, formatBalance, calculatePercentage, resolveENS } from '@/utils/wallet';
import { ArrowDown, Loader2, Sparkles, ArrowLeftRight, Check, ChevronsUpDown, Percent } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import SuccessModal from './SuccessModal';
import type { Token } from '@lifi/sdk';

const SCROLL_CHAIN_ID = '534352';

const TransferForm = () => {
  const { user, authenticated, login } = usePrivy();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [openFromChain, setOpenFromChain] = useState(false);
  const [openToChain, setOpenToChain] = useState(false);
  const [openFromToken, setOpenFromToken] = useState(false);
  const [openToToken, setOpenToToken] = useState(false);
  const [fromChainSearch, setFromChainSearch] = useState('');
  const [toChainSearch, setToChainSearch] = useState('');
  const [fromTokenSearch, setFromTokenSearch] = useState('');
  const [toTokenSearch, setToTokenSearch] = useState('');
  const [fromTokens, setFromTokens] = useState<Token[]>([]);
  const [toTokens, setToTokens] = useState<Token[]>([]);
  const [fromTokensWithBalance, setFromTokensWithBalance] = useState<Token[]>([]);
  const [tokenBalances, setTokenBalances] = useState<Record<string, string>>({});
  const [loadingBalances, setLoadingBalances] = useState(false);
  const [resolvingENS, setResolvingENS] = useState(false);
  const [fetchingQuote, setFetchingQuote] = useState(false);
  const [quoteError, setQuoteError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    fromChain: SCROLL_CHAIN_ID,
    toChain: '',
    fromToken: '',
    toToken: '',
    amount: '',
    recipient: '',
    destAmount: '',
  });

  // Set to Scroll chain on login and switch wallet
  useEffect(() => {
    if (authenticated && formData.fromChain !== SCROLL_CHAIN_ID) {
      setFormData(prev => ({ ...prev, fromChain: SCROLL_CHAIN_ID }));
      handleChainSwitch(parseInt(SCROLL_CHAIN_ID));
    }
  }, [authenticated]);

  // Fetch tokens when from chain changes
  useEffect(() => {
    if (formData.fromChain) {
      fetchFromTokens();
    }
  }, [formData.fromChain]);

  // Fetch tokens when to chain changes
  useEffect(() => {
    if (formData.toChain) {
      fetchToTokens();
    }
  }, [formData.toChain]);

  // Fetch token balances when tokens or wallet changes
  useEffect(() => {
    if (fromTokens.length > 0 && user?.wallet?.address) {
      fetchTokenBalances();
    }
  }, [fromTokens, user?.wallet?.address]);

  // Fetch quote when all required fields are filled
  useEffect(() => {
    const timer = setTimeout(() => {
      if (
        formData.fromChain &&
        formData.toChain &&
        formData.fromToken &&
        formData.toToken &&
        formData.amount &&
        formData.recipient && // 
        parseFloat(formData.amount) > 0 &&
        user?.wallet?.address
      ) {
        fetchQuote();
      }
    }, 500); // Debounce by 500ms

    return () => clearTimeout(timer);
  }, [formData.fromChain, formData.toChain, formData.fromToken, formData.toToken, formData.amount, formData.recipient, user?.wallet?.address]);

  const fetchFromTokens = async () => {
    try {
      const tokens = await getChainTokens(parseInt(formData.fromChain));
      // Limit to top 50 tokens to avoid overwhelming
      const limitedTokens = tokens.slice(0, 50);
      setFromTokens(limitedTokens);
      // Auto-select native token
      if (limitedTokens.length > 0 && !formData.fromToken) {
        const nativeToken = limitedTokens.find(t => t.address === '0x0000000000000000000000000000000000000000');
        if (nativeToken) {
          setFormData(prev => ({ ...prev, fromToken: nativeToken.address }));
        }
      }
    } catch (error) {
      console.error('Error fetching from tokens:', error);
    }
  };

  const fetchToTokens = async () => {
    try {
      const tokens = await getChainTokens(parseInt(formData.toChain));
      // Limit to top 50 tokens
      const limitedTokens = tokens.slice(0, 50);
      setToTokens(limitedTokens);
      // Auto-select native token
      if (limitedTokens.length > 0 && !formData.toToken) {
        const nativeToken = limitedTokens.find(t => t.address === '0x0000000000000000000000000000000000000000');
        if (nativeToken) {
          setFormData(prev => ({ ...prev, toToken: nativeToken.address }));
        }
      }
    } catch (error) {
      console.error('Error fetching to tokens:', error);
    }
  };

  const fetchTokenBalances = async () => {
    if (!user?.wallet?.address || fromTokens.length === 0) return;
    
    setLoadingBalances(true);
    try {
      const balances: Record<string, string> = {};
      
      // Fetch balances for all tokens
      await Promise.all(
        fromTokens.map(async (token) => {
          try {
            const balance = await getTokenBalance(
              token.address,
              user.wallet!.address,
              token.decimals
            );
            balances[token.address] = balance;
          } catch (error) {
            balances[token.address] = '0';
          }
        })
      );
      
      setTokenBalances(balances);
      
      // Filter to only show tokens with balance > 0
      const tokensWithBalance = fromTokens.filter(token => {
        const balance = parseFloat(balances[token.address] || '0');
        return balance > 0;
      });
      
      setFromTokensWithBalance(tokensWithBalance);
      
      // If current token has no balance, switch to first token with balance
      if (formData.fromToken && parseFloat(balances[formData.fromToken] || '0') === 0) {
        if (tokensWithBalance.length > 0) {
          setFormData(prev => ({ ...prev, fromToken: tokensWithBalance[0].address }));
        }
      }
    } catch (error) {
      console.error('Error fetching balances:', error);
    } finally {
      setLoadingBalances(false);
    }
  };

  const fetchQuote = async () => {
    if (!user?.wallet?.address || !formData.recipient) return;
    
    setFetchingQuote(true);
    setQuoteError(null);
    
    try {
      const fromToken = fromTokens.find(t => t.address === formData.fromToken);
      if (!fromToken) return;
      
      // Convert amount to smallest unit
      const amountInSmallestUnit = (
        parseFloat(formData.amount) * Math.pow(10, fromToken.decimals)
      ).toFixed(0);
      
      const quote = await getLiFiQuote({
        fromAddress: user.wallet.address,
        toAddress: formData.recipient, // ← Use recipient address (supports EVM & Solana!)
        fromChain: parseInt(formData.fromChain),
        toChain: parseInt(formData.toChain),
        fromToken: formData.fromToken,
        toToken: formData.toToken,
        fromAmount: amountInSmallestUnit,
      });
      
      // Get destination token to format the amount correctly
      const toToken = toTokens.find(t => t.address === formData.toToken);
      if (toToken && quote.estimate?.toAmount) {
        const destAmount = (
          parseInt(quote.estimate.toAmount) / Math.pow(10, toToken.decimals)
        ).toFixed(6);
        setFormData(prev => ({ ...prev, destAmount }));
      }
    } catch (error: any) {
      console.error('Error fetching quote:', error);
      setQuoteError(error.message || 'Failed to get quote');
      setFormData(prev => ({ ...prev, destAmount: '' }));
    } finally {
      setFetchingQuote(false);
    }
  };

  const handleChainSwitch = async (chainId: number) => {
    try {
      await switchChain(chainId);
      toast({
        title: "Chain switched",
        description: `Successfully switched to chain ${chainId}`,
      });
    } catch (error: any) {
      toast({
        title: "Chain switch failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleFromChainChange = async (chainId: string) => {
    setFormData({ ...formData, fromChain: chainId, fromToken: '' });
    await handleChainSwitch(parseInt(chainId));
  };

  const handleENSResolution = useCallback(async (input: string) => {
    if (input.endsWith('.eth')) {
      setResolvingENS(true);
      try {
        const address = await resolveENS(input);
        if (address) {
          setFormData(prev => ({ ...prev, recipient: address }));
          toast({
            title: "ENS Resolved",
            description: `${input} → ${address.slice(0, 6)}...${address.slice(-4)}`,
          });
        } else {
          toast({
            title: "ENS not found",
            description: `Could not resolve ${input}`,
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error('ENS resolution error:', error);
      } finally {
        setResolvingENS(false);
      }
    }
  }, [toast]);

  const setPercentage = (percentage: number) => {
    // Get the balance of the SELECTED token, not just native
    const balance = tokenBalances[formData.fromToken] || '0';
    const newAmount = calculatePercentage(balance, percentage);
    setFormData({ ...formData, amount: newAmount });
  };

  // Filtered chains for search
  const filteredFromChains = useMemo(() => {
    return LIFI_CHAINS.filter(chain => 
      chain.name.toLowerCase().includes(fromChainSearch.toLowerCase()) ||
      chain.coin.toLowerCase().includes(fromChainSearch.toLowerCase())
    );
  }, [fromChainSearch]);

  const filteredToChains = useMemo(() => {
    return LIFI_CHAINS.filter(chain => 
      chain.name.toLowerCase().includes(toChainSearch.toLowerCase()) ||
      chain.coin.toLowerCase().includes(toChainSearch.toLowerCase())
    );
  }, [toChainSearch]);

  const filteredFromTokens = useMemo(() => {
    const tokensToFilter = fromTokensWithBalance.length > 0 ? fromTokensWithBalance : fromTokens;
    if (!fromTokenSearch) return tokensToFilter;
    return tokensToFilter.filter(token => 
      token.name.toLowerCase().includes(fromTokenSearch.toLowerCase()) ||
      token.symbol.toLowerCase().includes(fromTokenSearch.toLowerCase())
    );
  }, [fromTokens, fromTokensWithBalance, fromTokenSearch]);

  const filteredToTokens = useMemo(() => {
    if (!toTokenSearch) return toTokens;
    return toTokens.filter(token => 
      token.name.toLowerCase().includes(toTokenSearch.toLowerCase()) ||
      token.symbol.toLowerCase().includes(toTokenSearch.toLowerCase())
    );
  }, [toTokens, toTokenSearch]);

  // Get selected chain details
  const selectedFromChain = LIFI_CHAINS.find(c => c.id.toString() === formData.fromChain);
  const selectedToChain = LIFI_CHAINS.find(c => c.id.toString() === formData.toChain);
  const selectedFromToken = fromTokens.find(t => t.address === formData.fromToken);
  const selectedToToken = toTokens.find(t => t.address === formData.toToken);
  
  // Get current token balance
  const currentTokenBalance = tokenBalances[formData.fromToken] || '0';

  const handleTransfer = async () => {
    const hasValidPrivyAppId = import.meta.env.VITE_PRIVY_APP_ID && !import.meta.env.VITE_PRIVY_APP_ID.startsWith('clxxx');
    
    if (!hasValidPrivyAppId) {
      toast({
        title: "Privy Not Configured",
        description: "Add your VITE_PRIVY_APP_ID environment variable",
        variant: "destructive",
      });
      return;
    }

    if (!authenticated || !user) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet",
        variant: "destructive",
      });
      return;
    }

    if (!formData.fromChain || !formData.toChain || !formData.amount || !formData.recipient) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    
    try {
      const fromAddress = user.wallet?.address || '';
      const amountInWei = (parseFloat(formData.amount) * 1e18).toString();
      
      const quote = await getLiFiQuote({
        fromAddress,
        toAddress: formData.recipient,
        fromChain: parseInt(formData.fromChain),
        toChain: parseInt(formData.toChain),
        fromToken: formData.fromToken || '0x0000000000000000000000000000000000000000',
        toToken: formData.toToken || '0x0000000000000000000000000000000000000000',
        fromAmount: amountInWei,
      });

      toast({
        title: "Quote received!",
        description: `Estimated time: ${quote.estimate?.executionDuration || 'N/A'}`,
      });
      
      setShowSuccess(true);
    } catch (error) {
      toast({
        title: "Transfer failed",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="glass-card rounded-3xl p-8 md:p-10 max-w-xl mx-auto border border-black/5 shadow-xl relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-primary/3 via-transparent to-secondary/3 pointer-events-none" />
        
        <div className="relative z-10 space-y-5">
          {/* Amount - AT THE TOP */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="amount" className="text-sm font-semibold">You Send</Label>
              {selectedFromToken && (
                <span className="text-xs text-muted-foreground">
                  {loadingBalances ? (
                    'Loading balance...'
                  ) : (
                    `Balance: ${formatBalance(currentTokenBalance)} ${selectedFromToken.symbol}`
                  )}
                </span>
              )}
            </div>
            <div className="space-y-2">
              <div className="flex gap-3">
                <Input
                  id="amount"
                  type="number"
                  placeholder="0.0"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  className="flex-1 h-14 border-2 hover:border-primary/30 transition-colors text-2xl font-bold"
                />
                <Popover open={openFromToken} onOpenChange={setOpenFromToken}>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-40 h-14 border-2 font-semibold">
                      {selectedFromToken ? selectedFromToken.symbol : "Token"}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-80 p-0">
                    <Command>
                      <CommandInput placeholder="Search tokens..." value={fromTokenSearch} onValueChange={setFromTokenSearch} />
                      <CommandEmpty>No token found.</CommandEmpty>
                      <CommandGroup className="max-h-64 overflow-auto">
                        {filteredFromTokens.length === 0 ? (
                          <div className="py-6 text-center text-sm text-muted-foreground">
                            No tokens with balance found
                          </div>
                        ) : (
                          filteredFromTokens.map((token) => {
                            const balance = tokenBalances[token.address] || '0';
                            return (
                              <CommandItem
                                key={token.address}
                                value={`${token.symbol} ${token.name}`.toLowerCase()}
                                onSelect={() => {
                                  setFormData({ ...formData, fromToken: token.address });
                                  setOpenFromToken(false);
                                }}
                              >
                                <Check className={cn("mr-2 h-4 w-4", formData.fromToken === token.address ? "opacity-100" : "opacity-0")} />
                                {token.logoURI && <img src={token.logoURI} alt={token.symbol} className="w-5 h-5 mr-2" />}
                                <div className="flex flex-col flex-1">
                                  <div className="flex items-center justify-between">
                                    <span className="font-medium">{token.symbol}</span>
                                    <span className="text-xs text-muted-foreground ml-2">{formatBalance(balance)}</span>
                                  </div>
                                  <span className="text-xs text-muted-foreground">{token.name}</span>
                                </div>
                              </CommandItem>
                            );
                          })
                        )}
                      </CommandGroup>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>
              {/* 50% / Max buttons */}
              {parseFloat(currentTokenBalance) > 0 && (
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setPercentage(50)}
                    className="flex-1 text-xs"
                    disabled={loadingBalances}
                  >
                    <Percent className="w-3 h-3 mr-1" />
                    50%
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setPercentage(100)}
                    className="flex-1 text-xs"
                    disabled={loadingBalances}
                  >
                    MAX
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* From Chain with Search */}
          <div className="space-y-3">
            <Label className="text-sm font-semibold">From Chain</Label>
            <Popover open={openFromChain} onOpenChange={setOpenFromChain}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={openFromChain}
                  className="w-full h-14 justify-between border-2 font-semibold"
                >
                  {selectedFromChain ? (
                    <div className="flex items-center gap-2">
                      <img src={selectedFromChain.logoURI} alt={selectedFromChain.name} className="w-5 h-5" />
                      <span>{selectedFromChain.name}</span>
                    </div>
                  ) : (
                    "Select chain..."
                  )}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[400px] p-0">
                <Command>
                  <CommandInput placeholder="Search chains..." value={fromChainSearch} onValueChange={setFromChainSearch} />
                  <CommandEmpty>No chain found.</CommandEmpty>
                  <CommandGroup className="max-h-64 overflow-auto">
                    {filteredFromChains.map((chain) => (
                      <CommandItem
                        key={chain.id}
                        value={`${chain.name} ${chain.coin}`.toLowerCase()}
                        onSelect={() => {
                          handleFromChainChange(chain.id.toString());
                          setOpenFromChain(false);
                        }}
                      >
                        <Check className={cn("mr-2 h-4 w-4", formData.fromChain === chain.id.toString() ? "opacity-100" : "opacity-0")} />
                        <img src={chain.logoURI} alt={chain.name} className="w-5 h-5 mr-2" />
                        <span className="font-medium">{chain.name}</span>
                        <span className="ml-auto text-xs text-muted-foreground">{chain.coin}</span>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          {/* Swap Direction Button */}
          <div className="flex justify-center -my-2">
            <motion.button
              whileHover={{ scale: 1.1, rotate: 180 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setFormData({ ...formData, fromChain: formData.toChain, toChain: formData.fromChain })}
              className="w-10 h-10 rounded-full bg-white border-2 border-black/10 flex items-center justify-center text-primary hover:border-primary/50 transition-all shadow-md"
            >
              <ArrowLeftRight className="w-4 h-4" />
            </motion.button>
          </div>

          {/* To Chain with Search */}
          <div className="space-y-3">
            <Label className="text-sm font-semibold">To Chain</Label>
            <Popover open={openToChain} onOpenChange={setOpenToChain}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={openToChain}
                  className="w-full h-14 justify-between border-2 font-semibold"
                >
                  {selectedToChain ? (
                    <div className="flex items-center gap-2">
                      <img src={selectedToChain.logoURI} alt={selectedToChain.name} className="w-5 h-5" />
                      <span>{selectedToChain.name}</span>
                    </div>
                  ) : (
                    "Select chain..."
                  )}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[400px] p-0">
                <Command>
                  <CommandInput placeholder="Search chains..." value={toChainSearch} onValueChange={setToChainSearch} />
                  <CommandEmpty>No chain found.</CommandEmpty>
                  <CommandGroup className="max-h-64 overflow-auto">
                    {filteredToChains.map((chain) => (
                      <CommandItem
                        key={chain.id}
                        value={`${chain.name} ${chain.coin}`.toLowerCase()}
                        onSelect={() => {
                          setFormData({ ...formData, toChain: chain.id.toString(), toToken: '' });
                          setOpenToChain(false);
                        }}
                      >
                        <Check className={cn("mr-2 h-4 w-4", formData.toChain === chain.id.toString() ? "opacity-100" : "opacity-0")} />
                        <img src={chain.logoURI} alt={chain.name} className="w-5 h-5 mr-2" />
                        <span className="font-medium">{chain.name}</span>
                        <span className="ml-auto text-xs text-muted-foreground">{chain.coin}</span>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          {/* Recipient Receives */}
          <div className="space-y-3 pt-2 border-t-2 border-black/5">
            <Label className="text-sm font-semibold">Recipient Receives</Label>
            <div className="flex gap-3">
              <div className="relative flex-1">
                <Input
                  type="text"
                  placeholder="~0.0"
                  value={fetchingQuote ? '' : formData.destAmount}
                  readOnly
                  className="flex-1 h-14 border-2 text-2xl font-bold bg-muted/30"
                />
                {fetchingQuote && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    >
                      <Loader2 className="w-6 h-6 text-primary" />
                    </motion.div>
                  </div>
                )}
                {quoteError && !fetchingQuote && (
                  <p className="absolute -bottom-5 left-0 text-xs text-destructive">
                    {quoteError}
                  </p>
                )}
              </div>
              <Popover open={openToToken} onOpenChange={setOpenToToken}>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-40 h-14 border-2 font-semibold">
                    {selectedToToken ? selectedToToken.symbol : "Token"}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80 p-0">
                  <Command>
                    <CommandInput placeholder="Search tokens..." value={toTokenSearch} onValueChange={setToTokenSearch} />
                    <CommandEmpty>No token found.</CommandEmpty>
                    <CommandGroup className="max-h-64 overflow-auto">
                      {filteredToTokens.map((token) => (
                        <CommandItem
                          key={token.address}
                          value={`${token.symbol} ${token.name}`.toLowerCase()}
                          onSelect={() => {
                            setFormData({ ...formData, toToken: token.address });
                            setOpenToToken(false);
                          }}
                        >
                          <Check className={cn("mr-2 h-4 w-4", formData.toToken === token.address ? "opacity-100" : "opacity-0")} />
                          {token.logoURI && <img src={token.logoURI} alt={token.symbol} className="w-5 h-5 mr-2" />}
                          <span className="font-medium">{token.symbol}</span>
                          <span className="ml-2 text-xs text-muted-foreground">{token.name}</span>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Recipient Address */}
          <div className="space-y-3">
            <Label htmlFor="recipient" className="text-sm font-semibold">Recipient Address</Label>
            <Input
              id="recipient"
              placeholder="0x... or name.eth"
              value={formData.recipient}
              onChange={(e) => setFormData({ ...formData, recipient: e.target.value })}
              onBlur={(e) => handleENSResolution(e.target.value)}
              className="h-12 border-2 hover:border-secondary/30 transition-colors font-mono text-sm"
              disabled={resolvingENS}
            />
            {resolvingENS && <p className="text-xs text-muted-foreground">Resolving ENS...</p>}
          </div>

          {/* Send/Sign In Button */}
          <motion.div
            whileHover={{ scale: loading ? 1 : 1.01 }}
            whileTap={{ scale: loading ? 1 : 0.99 }}
            className="pt-2"
          >
            <Button
              onClick={authenticated ? handleTransfer : login}
              disabled={loading}
              className="w-full h-16 text-lg font-bold bg-gradient-to-r from-primary via-secondary to-primary bg-[length:200%_100%] hover:bg-[position:100%_0] transition-all duration-500 shadow-lg shadow-primary/20"
            >
              <AnimatePresence mode="wait">
                {loading ? (
                  <motion.div
                    key="loading"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center"
                  >
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Processing...
                  </motion.div>
                ) : !authenticated ? (
                  <motion.div
                    key="signin"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center"
                  >
                    <Sparkles className="mr-2 h-5 w-5" />
                    Sign In
                  </motion.div>
                ) : (
                  <motion.div
                    key="send"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center"
                  >
                    <Sparkles className="mr-2 h-5 w-5" />
                    Send Instantly
                    <ArrowDown className="ml-2 h-5 w-5" />
                  </motion.div>
                )}
              </AnimatePresence>
            </Button>
          </motion.div>
        </div>
      </motion.div>

      <SuccessModal
        open={showSuccess}
        onClose={() => setShowSuccess(false)}
        txHash="0x1234...5678"
        explorerUrl="https://etherscan.io"
      />
    </>
  );
};

export default TransferForm;
