import { useState, useEffect, useMemo, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useToast } from '@/hooks/use-toast';
import { usePrivy } from '@privy-io/react-auth';
import { LIFI_CHAINS, NATIVE_TOKEN_ADDRESS, SOLANA_CHAIN_ID } from '@/lib/constants';
import { getLiFiQuote, getChainTokens, executeLiFiTransfer, configureEVMProvider } from '@/utils/lifi';
import { convertQuoteToRoute } from '@lifi/sdk';
import { createWalletClient, custom } from 'viem';
import { mainnet } from 'viem/chains';
import { switchChain, getTokenBalance, formatBalance, calculatePercentage, resolveENS } from '@/utils/wallet';
import { ArrowDown, Loader2, Sparkles, ArrowLeftRight, Check, ChevronsUpDown, Percent } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import SuccessModal from './SuccessModal';
import type { Token } from '@lifi/sdk';

const SCROLL_CHAIN_ID = '534352';

const TransferForm = () => {
  const { user, authenticated, login, ready } = usePrivy();
  const [providerConfigured, setProviderConfigured] = useState(false);
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [executionData, setExecutionData] = useState<{sourceTx?: string, destTx?: string, sourceChainId?: number, destChainId?: number}>({});
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
  const [currentQuote, setCurrentQuote] = useState<any>(null);
  const [usdAmounts, setUsdAmounts] = useState<{fromAmountUSD?: string, toAmountUSD?: string}>({});
  
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

  // Configure LiFi provider when wallet is ready
  useEffect(() => {
    if (ready && user?.wallet && window.ethereum && !providerConfigured) {
      const getWalletClientFn = async () => {
        try {
          const walletClient = createWalletClient({
            account: user.wallet!.address as `0x${string}`,
            chain: mainnet,
            transport: custom(window.ethereum),
          });
          return walletClient;
        } catch (error) {
          console.error('Error creating wallet client:', error);
          throw error;
        }
      };

      const switchChainFn = async (chainId: number) => {
        try {
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: `0x${chainId.toString(16)}` }],
          });
          const walletClient = createWalletClient({
            account: user.wallet!.address as `0x${string}`,
            chain: mainnet,
            transport: custom(window.ethereum),
          });
          return walletClient;
        } catch (error) {
          console.error('Error switching chain:', error);
          throw error;
        }
      };

      configureEVMProvider(getWalletClientFn, switchChainFn);
      setProviderConfigured(true);
      console.log('LiFi EVM provider configured!');
    }
  }, [ready, user?.wallet, providerConfigured]);

  // Fetch token balances when tokens or wallet changes
  useEffect(() => {
    if (fromTokens.length > 0 && user?.wallet?.address) {
      fetchTokenBalances();
    }
  }, [fromTokens, user?.wallet?.address]);

  // Fetch quote when all required fields are filled
  useEffect(() => {
    // Clear old quote when any parameter changes
    setCurrentQuote(null);
    setFormData(prev => ({ ...prev, destAmount: '' }));
    setUsdAmounts({});
    
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
      setFromTokens(tokens);
      // Auto-select native token based on chain type
      if (tokens.length > 0 && !formData.fromToken) {
        const chainId = parseInt(formData.fromChain);
        const isSolana = chainId === SOLANA_CHAIN_ID;
        
        const nativeToken = isSolana 
          ? tokens.find(t => t.address === NATIVE_TOKEN_ADDRESS.SOLANA || t.address === NATIVE_TOKEN_ADDRESS.WRAPPED_SOLANA)
          : tokens.find(t => t.address === NATIVE_TOKEN_ADDRESS.EVM);
        
        if (nativeToken) {
          setFormData(prev => ({ ...prev, fromToken: nativeToken.address }));
        } else if (tokens.length > 0) {
          // Fallback: select first token if native not found
          setFormData(prev => ({ ...prev, fromToken: tokens[0].address }));
        }
      }
    } catch (error) {
      console.error('Error fetching from tokens:', error);
    }
  };

  const fetchToTokens = async () => {
    try {
      const tokens = await getChainTokens(parseInt(formData.toChain));
      setToTokens(tokens);
      // Auto-select native token based on chain type
      if (tokens.length > 0 && !formData.toToken) {
        const chainId = parseInt(formData.toChain);
        const isSolana = chainId === SOLANA_CHAIN_ID;
        
        const nativeToken = isSolana 
          ? tokens.find(t => t.address === NATIVE_TOKEN_ADDRESS.SOLANA || t.address === NATIVE_TOKEN_ADDRESS.WRAPPED_SOLANA)
          : tokens.find(t => t.address === NATIVE_TOKEN_ADDRESS.EVM);
        
        if (nativeToken) {
          setFormData(prev => ({ ...prev, toToken: nativeToken.address }));
        } else if (tokens.length > 0) {
          // Fallback: select first token if native not found
          setFormData(prev => ({ ...prev, toToken: tokens[0].address }));
        }
      }
    } catch (error) {
      console.error('Error fetching to tokens:', error);
    }
  };

  const fetchTokenBalances = async () => {
    if (!user?.wallet?.address || fromTokens.length === 0) return;
    
    // Only fetch balances for EVM chains (Solana balance fetching needs different approach)
    const chainId = parseInt(formData.fromChain);
    const isSolana = chainId === SOLANA_CHAIN_ID;
    
    if (isSolana) {
      // For Solana, we'll skip balance fetching for now
      // LiFi will handle balance checks during quote
      setLoadingBalances(false);
      return;
    }
    
    setLoadingBalances(true);
    try {
      const balances: Record<string, string> = {};
      
      // Only check top 100 tokens to avoid rate limiting
      const tokensToCheck = fromTokens.slice(0, 100);
      
      // Fetch balances for tokens
      await Promise.all(
        tokensToCheck.map(async (token) => {
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
      const tokensWithBalance = tokensToCheck.filter(token => {
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
      
      // Store the quote for execution later
      setCurrentQuote(quote);
      
      // Extract USD amounts from quote
      const fromUSD = quote.estimate?.fromAmountUSD;
      const toUSD = quote.estimate?.toAmountUSD;
      setUsdAmounts({
        fromAmountUSD: fromUSD ? `$${parseFloat(fromUSD).toFixed(2)}` : undefined,
        toAmountUSD: toUSD ? `$${parseFloat(toUSD).toFixed(2)}` : undefined,
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
      
      // Provide user-friendly error messages
      let errorMessage = 'Failed to get quote';
      const amount = parseFloat(formData.amount);
      
      if (error.message?.includes('No available quotes') || error.message?.includes('404')) {
        // Check if amount might be too small
        // if (amount > 0 && amount < 5) {
        //   errorMessage = 'Amount too small. Bridges require $5+ due to gas costs. Try $10+';
        // } else {
        //   errorMessage = 'No bridge supports this token pair. Try same token (e.g. USDC → USDC) or ETH → SOL';
        // }
      } else if (error.message?.includes('Invalid toAddress')) {
        errorMessage = 'Invalid recipient address for destination chain';
      } else if (error.message?.includes('422')) {
        errorMessage = 'Route unavailable. Try different tokens or chains';
      }
      
      setQuoteError(errorMessage);
      setFormData(prev => ({ ...prev, destAmount: '' }));
      setCurrentQuote(null);
      setUsdAmounts({});
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
    setFormData({ ...formData, fromChain: chainId, fromToken: '', amount: '' });
    await handleChainSwitch(parseInt(chainId));
  };

  const handleSwapChains = async () => {
    const newFromChain = formData.toChain;
    const newToChain = formData.fromChain;
    
    // Update form data: swap chains and clear tokens/amount
    setFormData({ 
      ...formData, 
      fromChain: newFromChain, 
      toChain: newToChain,
      fromToken: '',
      toToken: '',
      amount: '',
    });
    
    // Switch wallet to the new source chain
    if (newFromChain) {
      await handleChainSwitch(parseInt(newFromChain));
    }
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
    // Filter out Superfluid tokens (USDCx, DAIx, etc.) - bridges don't support them
    const supportedTokens = fromTokens.filter(token => 
      !token.symbol.endsWith('x') || token.symbol === 'AVAX' || token.symbol === 'WBTC' // Keep AVAX, WBTC
    );
    
    // For balance filtering, limit to top 100 tokens to check
    const tokensToCheck = supportedTokens.slice(0, 100);
    const tokensWithBalanceFiltered = tokensToCheck.filter(token => {
      const balance = parseFloat(tokenBalances[token.address] || '0');
      return balance > 0;
    });
    
    const tokensToFilter = tokensWithBalanceFiltered.length > 0 ? tokensWithBalanceFiltered : supportedTokens;
    if (!fromTokenSearch) return tokensToFilter;
    return tokensToFilter.filter(token => 
      token.name.toLowerCase().includes(fromTokenSearch.toLowerCase()) ||
      token.symbol.toLowerCase().includes(fromTokenSearch.toLowerCase())
    );
  }, [fromTokens, tokenBalances, fromTokenSearch]);

  const filteredToTokens = useMemo(() => {
    // Filter out Superfluid tokens (USDCx, DAIx, etc.) - bridges don't support them
    const supportedTokens = toTokens.filter(token => 
      !token.symbol.endsWith('x') || token.symbol === 'AVAX' || token.symbol === 'WBTC' // Keep AVAX, WBTC
    );
    
    if (!toTokenSearch) return supportedTokens;
    return supportedTokens.filter(token => 
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

    // Check if provider is configured
    if (!providerConfigured) {
      toast({
        title: "Wallet not ready",
        description: "Please wait for wallet to initialize",
        variant: "destructive",
      });
      return;
    }

    // Check if we have a quote
    if (!currentQuote) {
      toast({
        title: "No quote available",
        description: "Please wait for quote to load",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    
    try {
      console.log('Executing with quote:', currentQuote);
      
      // Convert quote to route
      const route = convertQuoteToRoute(currentQuote);
      
      const txHashes: string[] = [];
      
      // Execute the route with updateRouteHook to track txs
      const result = await executeLiFiTransfer(route, (updatedRoute) => {
        // Log detailed status for debugging stuck transactions
        updatedRoute.steps.forEach((step, idx) => {
          console.log(`Step ${idx + 1}:`, step.execution?.status, step.action.fromToken.symbol, '→', step.action.toToken.symbol);
          
          step.execution?.process.forEach((process) => {
            console.log(`  Process status: ${process.status}, type: ${process.type}`);
            if (process.txHash && !txHashes.includes(process.txHash)) {
              txHashes.push(process.txHash);
              console.log('  ✅ Transaction hash:', process.txHash);
            }
          });
        });
      });
      
      console.log('Transfer result:', result);
      console.log('All transaction hashes:', txHashes);
      
      // Store execution data
      setExecutionData({
        sourceTx: txHashes[0], // First tx is source chain
        destTx: txHashes[1], // Second tx is destination chain (if exists)
        sourceChainId: parseInt(formData.fromChain),
        destChainId: parseInt(formData.toChain),
      });

      toast({
        title: "Transfer successful!",
        description: `Sent ${formData.amount} tokens`,
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
              <div className="space-y-1">
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
                      {selectedFromToken ? (
                        <>
                          <img 
                            src={selectedFromToken.logoURI || `https://api.dicebear.com/9.x/initials/svg?seed=${selectedFromToken.symbol}&radius=50&backgroundColor=a855f7`} 
                            alt={selectedFromToken.symbol} 
                            className="w-5 h-5 mr-2 rounded-full" 
                            onError={(e) => {
                              e.currentTarget.src = `https://api.dicebear.com/9.x/initials/svg?seed=${selectedFromToken.symbol}&radius=50&backgroundColor=a855f7`;
                            }} 
                          />
                          <span>{selectedFromToken.symbol}</span>
                        </>
                      ) : "Token"}
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
                                <img 
                                  src={token.logoURI || `https://api.dicebear.com/9.x/initials/svg?seed=${token.symbol}&radius=50&backgroundColor=a855f7`} 
                                  alt={token.symbol} 
                                  className="w-5 h-5 mr-2 rounded-full" 
                                  onError={(e) => {
                                    e.currentTarget.src = `https://api.dicebear.com/9.x/initials/svg?seed=${token.symbol}&radius=50&backgroundColor=a855f7`;
                                  }} 
                                />
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
              {usdAmounts.fromAmountUSD && (
                <p className="text-sm text-muted-foreground pl-1">
                  ≈ {usdAmounts.fromAmountUSD}
                </p>
              )}
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
              {/* Warning for small amounts
              {formData.amount && parseFloat(formData.amount) > 0 && parseFloat(formData.amount) < 5 && (
                <p className="text-xs text-amber-600 dark:text-amber-500 mt-2 flex items-center gap-1">
                  <span>⚠️</span>
                  <span>Small amounts may have high fees due to gas costs. Recommended: $1+ for best rates</span>
                </p>
              )} */}
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
                      <img src={selectedFromChain.logoURI} alt={selectedFromChain.name} className="w-5 h-5" onError={(e) => e.currentTarget.style.display = 'none'} />
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
                        <img src={chain.logoURI} alt={chain.name} className="w-5 h-5 mr-2" onError={(e) => e.currentTarget.style.display = 'none'} />
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
              onClick={handleSwapChains}
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
                      <img src={selectedToChain.logoURI} alt={selectedToChain.name} className="w-5 h-5" onError={(e) => e.currentTarget.style.display = 'none'} />
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
                        <img src={chain.logoURI} alt={chain.name} className="w-5 h-5 mr-2" onError={(e) => e.currentTarget.style.display = 'none'} />
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
            <div className="space-y-2">
              <Label className="text-sm font-semibold block">Amount</Label>
              <div className="flex items-start gap-3 relative">
                <div className="relative flex-1">
                  <Input
                    type="text"
                    placeholder="~0.0"
                    value={fetchingQuote ? '' : formData.destAmount}
                    readOnly
                    className="w-full h-14 border-2 text-2xl font-bold bg-muted/30"
                  />
                  {fetchingQuote && (
                    <div className="absolute top-0 left-0 right-0 h-14 flex items-center justify-center">
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
                    {selectedToToken ? (
                      <>
                        <img 
                          src={selectedToToken.logoURI || `https://api.dicebear.com/9.x/initials/svg?seed=${selectedToToken.symbol}&radius=50&backgroundColor=a855f7`} 
                          alt={selectedToToken.symbol} 
                          className="w-5 h-5 mr-2 rounded-full" 
                          onError={(e) => {
                            e.currentTarget.src = `https://api.dicebear.com/9.x/initials/svg?seed=${selectedToToken.symbol}&radius=50&backgroundColor=a855f7`;
                          }} 
                        />
                        <span>{selectedToToken.symbol}</span>
                      </>
                    ) : "Token"}
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
                          <img 
                                  src={token.logoURI || `https://api.dicebear.com/9.x/initials/svg?seed=${token.symbol}&radius=50&backgroundColor=a855f7`} 
                                  alt={token.symbol} 
                                  className="w-5 h-5 mr-2 rounded-full" 
                                  onError={(e) => {
                                    e.currentTarget.src = `https://api.dicebear.com/9.x/initials/svg?seed=${token.symbol}&radius=50&backgroundColor=a855f7`;
                                  }} 
                                />
                          <span className="font-medium">{token.symbol}</span>
                          <span className="ml-2 text-xs text-muted-foreground">{token.name}</span>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </Command>
                </PopoverContent>
              </Popover>
              </div>
              {usdAmounts.toAmountUSD && formData.destAmount && (
                <p className="text-sm text-muted-foreground pl-1">
                  ≈ {usdAmounts.toAmountUSD}
                </p>
              )}
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
        sourceTx={executionData.sourceTx}
        destTx={executionData.destTx}
        sourceChainId={executionData.sourceChainId}
        destChainId={executionData.destChainId}
      />
    </>
  );
};

export default TransferForm;
