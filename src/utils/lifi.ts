import { createConfig, getQuote, ChainId, executeRoute, getTokens, Token } from '@lifi/sdk';

// Initialize Li.Fi SDK
export const initializeLiFi = () => {
  createConfig({
    integrator: 'porta-app',
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
    const quote = await getQuote({
      fromAddress: params.fromAddress,
      toAddress: params.toAddress,
      fromChain: params.fromChain,
      toChain: params.toChain,
      fromToken: params.fromToken,
      toToken: params.toToken,
      fromAmount: params.fromAmount,
      order: 'FASTEST',
    });
    
    return quote;
  } catch (error) {
    console.error('Error fetching Li.Fi quote:', error);
    throw error;
  }
};

export const executeLiFiTransfer = async (route: any) => {
  try {
    const result = await executeRoute(route);
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
