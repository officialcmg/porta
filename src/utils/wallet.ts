export interface TokenBalance {
  address: string;
  symbol: string;
  name: string;
  balance: string;
  decimals: number;
  logoURI?: string;
  balanceRaw?: string;
}

declare global {
  interface Window {
    ethereum?: any;
  }
}

// Switch wallet to a specific chain
export const switchChain = async (chainId: number): Promise<boolean> => {
  if (!window.ethereum) {
    throw new Error('No wallet found');
  }

  const chainIdHex = `0x${chainId.toString(16)}`;
  
  try {
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: chainIdHex }],
    });
    return true;
  } catch (error: any) {
    // Chain not added to wallet
    if (error.code === 4902) {
      throw new Error('Chain not added to wallet. Please add it manually.');
    }
    throw error;
  }
};

// Resolve ENS name to address
export const resolveENS = async (ensName: string): Promise<string | null> => {
  try {
    // Use public ENS resolver
    const response = await fetch(`https://api.ensideas.com/ens/resolve/${ensName}`);
    const data = await response.json();
    return data.address || null;
  } catch (error) {
    console.error('ENS resolution error:', error);
    return null;
  }
};

// Format wei to ether
const formatWei = (wei: string, decimals: number = 18): string => {
  const value = BigInt(wei);
  const divisor = BigInt(10 ** decimals);
  const quotient = value / divisor;
  const remainder = value % divisor;
  
  if (remainder === BigInt(0)) {
    return quotient.toString();
  }
  
  const remainderStr = remainder.toString().padStart(decimals, '0');
  const trimmedRemainder = remainderStr.replace(/0+$/, '');
  return `${quotient}.${trimmedRemainder}`;
};

// Get native token balance
export const getNativeBalance = async (
  address: string
): Promise<string> => {
  if (!window.ethereum) return '0';
  
  try {
    const balance = await window.ethereum.request({
      method: 'eth_getBalance',
      params: [address, 'latest'],
    });
    return formatWei(balance);
  } catch (error) {
    console.error('Error fetching native balance:', error);
    return '0';
  }
};

// Get ERC20 token balance
export const getERC20Balance = async (
  tokenAddress: string,
  walletAddress: string,
  decimals: number = 18
): Promise<string> => {
  if (!window.ethereum) return '0';
  
  // Native token (address 0x0)
  if (tokenAddress === '0x0000000000000000000000000000000000000000') {
    return getNativeBalance(walletAddress);
  }
  
  try {
    // ERC20 balanceOf function signature
    const data = `0x70a08231${walletAddress.slice(2).padStart(64, '0')}`;
    
    const balance = await window.ethereum.request({
      method: 'eth_call',
      params: [{
        to: tokenAddress,
        data: data
      }, 'latest']
    });
    
    if (!balance || balance === '0x' || balance === '0x0') return '0';
    return formatWei(balance, decimals);
  } catch (error) {
    console.error('Error fetching ERC20 balance:', error);
    return '0';
  }
};

// Get balance for a specific token with metadata
export const getTokenBalance = async (
  tokenAddress: string,
  walletAddress: string,
  decimals: number = 18
): Promise<string> => {
  if (tokenAddress === '0x0000000000000000000000000000000000000000') {
    return getNativeBalance(walletAddress);
  }
  return getERC20Balance(tokenAddress, walletAddress, decimals);
};

// Format balance for display
export const formatBalance = (balance: string, decimals: number = 4): string => {
  const num = parseFloat(balance);
  if (num === 0) return '0';
  if (num < 0.0001) return '< 0.0001';
  return num.toFixed(decimals);
};

// Calculate percentage of balance
export const calculatePercentage = (balance: string, percentage: number): string => {
  const num = parseFloat(balance);
  return (num * (percentage / 100)).toString();
};
