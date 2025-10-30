import { createConfig, getQuote, ChainId, executeRoute, getTokens, Token, EVM } from '@lifi/sdk';

// Initialize Li.Fi SDK
export const initializeLiFi = () => {
  const apiKey = import.meta.env.VITE_LIFI_API_KEY;
  
  createConfig({
    integrator: 'porta-app',
    apiKey: apiKey && apiKey !== 'your_api_key_here' ? apiKey : undefined,
  });
};

// Configure EVM provider for execution
export const configureEVMProvider = (getWalletClientFn: any, switchChainFn: any) => {
  const apiKey = import.meta.env.VITE_LIFI_API_KEY;
  
  createConfig({
    integrator: 'porta-app',
    apiKey: apiKey && apiKey !== 'your_api_key_here' ? apiKey : undefined,
    providers: [
      EVM({
        getWalletClient: getWalletClientFn,
        switchChain: switchChainFn,
      }),
    ],
  });
};

export interface TransferParams {
  fromAddress: string;
  toAddress: string;
  fromChain: ChainId;
  toChain: ChainId;
  fromToken: string;
  toToken: string;
  fromAmount: string;
}

export const getLiFiQuote = async (params: TransferParams) => {
  try {
    // Use higher slippage for cross-chain swaps (different tokens)
    // 0.01 = 1% slippage to handle price volatility during cross-chain execution
    const slippage = 0.01;
    
    const quote = await getQuote({
      fromAddress: params.fromAddress,
      toAddress: params.toAddress,
      fromChain: params.fromChain,
      toChain: params.toChain,
      fromToken: params.fromToken,
      toToken: params.toToken,
      fromAmount: params.fromAmount,
      slippage: slippage,
      order: 'CHEAPEST', // Use cheapest route to minimize fees
    });
    
    return quote;
  } catch (error) {
    console.error('Error fetching Li.Fi quote:', error);
    throw error;
  }
};

export const executeLiFiTransfer = async (route: any, updateRouteHook?: (route: any) => void) => {
  try {
    const result = await executeRoute(route, {
      updateRouteHook: updateRouteHook || (() => {}),
    });
    return result;
  } catch (error) {
    console.error('Error executing Li.Fi transfer:', error);
    throw error;
  }
};

// Get available tokens for a specific chain
export const getChainTokens = async (chainId: number): Promise<Token[]> => {
  try {
    const tokens = await getTokens({ chains: [chainId] });
    return tokens.tokens[chainId] || [];
  } catch (error) {
    console.error('Error fetching tokens:', error);
    return [];
  }
};
