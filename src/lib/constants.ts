// Privy Configuration
// Get your Privy App ID from: https://dashboard.privy.io/
// This is a publishable key and safe to commit
export const PRIVY_APP_ID = import.meta.env.VITE_PRIVY_APP_ID || 'clxxx0000000000000000000';

// LiFi Supported Chains - Full list from their API
export const LIFI_CHAINS = [
  { key: "eth", name: "Ethereum", coin: "ETH", id: 1, logoURI: "https://raw.githubusercontent.com/lifinance/types/main/src/assets/icons/chains/ethereum.svg" },
  { key: "bsc", name: "BSC", coin: "BNB", id: 56, logoURI: "https://raw.githubusercontent.com/lifinance/types/main/src/assets/icons/chains/bsc.svg" },
  { key: "arb", name: "Arbitrum", coin: "ETH", id: 42161, logoURI: "https://raw.githubusercontent.com/lifinance/types/main/src/assets/icons/chains/arbitrum.svg" },
  { key: "bas", name: "Base", coin: "ETH", id: 8453, logoURI: "https://raw.githubusercontent.com/lifinance/types/main/src/assets/icons/chains/base.svg" },
  { key: "bls", name: "Blast", coin: "ETH", id: 81457, logoURI: "https://raw.githubusercontent.com/lifinance/types/main/src/assets/icons/chains/blast.svg" },
  { key: "ava", name: "Avalanche", coin: "AVAX", id: 43114, logoURI: "https://raw.githubusercontent.com/lifinance/types/main/src/assets/icons/chains/avalanche.svg" },
  { key: "pol", name: "Polygon", coin: "POL", id: 137, logoURI: "https://raw.githubusercontent.com/lifinance/types/main/src/assets/icons/chains/polygon.svg" },
  { key: "scl", name: "Scroll", coin: "ETH", id: 534352, logoURI: "https://raw.githubusercontent.com/lifinance/types/main/src/assets/icons/chains/scroll.svg" },
  { key: "opt", name: "Optimism", coin: "ETH", id: 10, logoURI: "https://raw.githubusercontent.com/lifinance/types/main/src/assets/icons/chains/optimism.svg" },
  { key: "lna", name: "Linea", coin: "ETH", id: 59144, logoURI: "https://raw.githubusercontent.com/lifinance/types/main/src/assets/icons/chains/linea.svg" },
  { key: "era", name: "zkSync", coin: "ETH", id: 324, logoURI: "https://raw.githubusercontent.com/lifinance/types/main/src/assets/icons/chains/zksync.svg" },
  { key: "pze", name: "Polygon zkEVM", coin: "ETH", id: 1101, logoURI: "https://raw.githubusercontent.com/lifinance/types/main/src/assets/icons/chains/zkevm.svg" },
  { key: "dai", name: "Gnosis", coin: "DAI", id: 100, logoURI: "https://raw.githubusercontent.com/lifinance/types/main/src/assets/icons/chains/gnosis.svg" },
  { key: "ftm", name: "Fantom", coin: "FTM", id: 250, logoURI: "https://raw.githubusercontent.com/lifinance/types/main/src/assets/icons/chains/fantom.svg" },
  { key: "mor", name: "Moonriver", coin: "MOVR", id: 1285, logoURI: "https://raw.githubusercontent.com/lifinance/types/main/src/assets/icons/chains/moonriver.svg" },
  { key: "moo", name: "Moonbeam", coin: "GLMR", id: 1284, logoURI: "https://raw.githubusercontent.com/lifinance/types/main/src/assets/icons/chains/moonbeam.svg" },
  { key: "fus", name: "FUSE", coin: "FUSE", id: 122, logoURI: "https://raw.githubusercontent.com/lifinance/types/main/src/assets/icons/chains/fuse.svg" },
  { key: "bob", name: "Boba", coin: "ETH", id: 288, logoURI: "https://raw.githubusercontent.com/lifinance/types/main/src/assets/icons/chains/boba.svg" },
  { key: "mod", name: "Mode", coin: "ETH", id: 34443, logoURI: "https://raw.githubusercontent.com/lifinance/types/main/src/assets/icons/chains/mode.svg" },
  { key: "mam", name: "Metis", coin: "METIS", id: 1088, logoURI: "https://raw.githubusercontent.com/lifinance/types/main/src/assets/icons/chains/metis.svg" },
  { key: "lsk", name: "Lisk", coin: "ETH", id: 1135, logoURI: "https://raw.githubusercontent.com/lifinance/types/main/src/assets/icons/chains/lisk.svg" },
  { key: "uni", name: "Unichain", coin: "ETH", id: 130, logoURI: "https://raw.githubusercontent.com/lifinance/types/main/src/assets/icons/chains/unichain.svg" },
  { key: "aur", name: "Aurora", coin: "ETH", id: 1313161554, logoURI: "https://raw.githubusercontent.com/lifinance/types/main/src/assets/icons/chains/aurora.svg" },
  { key: "sei", name: "Sei", coin: "SEI", id: 1329, logoURI: "https://raw.githubusercontent.com/lifinance/types/main/src/assets/icons/chains/sei.svg" },
  { key: "imx", name: "Immutable zkEVM", coin: "IMX", id: 13371, logoURI: "https://raw.githubusercontent.com/lifinance/types/main/src/assets/icons/chains/imx.svg" },
  { key: "flr", name: "Flare", coin: "FLR", id: 14, logoURI: "https://raw.githubusercontent.com/lifinance/types/main/src/assets/icons/chains/flare.svg" },
  { key: "son", name: "Sonic", coin: "S", id: 146, logoURI: "https://raw.githubusercontent.com/lifinance/types/main/src/assets/icons/chains/sonic.svg" },
  { key: "van", name: "Vana", coin: "VAN", id: 1480, logoURI: "https://raw.githubusercontent.com/lifinance/types/main/src/assets/icons/chains/vana.svg" },
  { key: "gra", name: "Gravity", coin: "G", id: 1625, logoURI: "https://raw.githubusercontent.com/lifinance/types/main/src/assets/icons/chains/gravity.svg" },
  { key: "tai", name: "Taiko", coin: "ETH", id: 167000, logoURI: "https://raw.githubusercontent.com/lifinance/types/main/src/assets/icons/chains/taiko.svg" },
  { key: "soe", name: "Soneium", coin: "ETH", id: 1868, logoURI: "https://raw.githubusercontent.com/lifinance/types/main/src/assets/icons/chains/soneium.svg" },
  { key: "swl", name: "Swellchain", coin: "ETH", id: 1923, logoURI: "https://raw.githubusercontent.com/lifinance/types/main/src/assets/icons/chains/swell.svg" },
  { key: "ron", name: "Ronin", coin: "RON", id: 2020, logoURI: "https://raw.githubusercontent.com/lifinance/types/main/src/assets/icons/chains/ronin.svg" },
  { key: "opb", name: "opBNB", coin: "BNB", id: 204, logoURI: "https://raw.githubusercontent.com/lifinance/types/main/src/assets/icons/chains/opbnb.svg" },
  { key: "crn", name: "Corn", coin: "BTCN", id: 21000000, logoURI: "https://raw.githubusercontent.com/lifinance/types/main/src/assets/icons/chains/corn.svg" },
  { key: "lns", name: "Lens", coin: "GHO", id: 232, logoURI: "https://raw.githubusercontent.com/lifinance/types/main/src/assets/icons/chains/lens.svg" },
  { key: "cro", name: "Cronos", coin: "CRO", id: 25, logoURI: "https://raw.githubusercontent.com/lifinance/types/main/src/assets/icons/chains/cronos.svg" },
  { key: "fra", name: "Fraxtal", coin: "FRAX", id: 252, logoURI: "https://raw.githubusercontent.com/lifinance/types/main/src/assets/icons/chains/fraxtal.svg" },
  { key: "abs", name: "Abstract", coin: "ETH", id: 2741, logoURI: "https://raw.githubusercontent.com/lifinance/types/main/src/assets/icons/chains/abstract.svg" },
  { key: "rsk", name: "Rootstock", coin: "RBTC", id: 30, logoURI: "https://raw.githubusercontent.com/lifinance/types/main/src/assets/icons/chains/rootstock.svg" },
  { key: "ape", name: "Apechain", coin: "APE", id: 33139, logoURI: "https://raw.githubusercontent.com/lifinance/types/main/src/assets/icons/chains/apechain.svg" },
  { key: "cel", name: "Celo", coin: "CELO", id: 42220, logoURI: "https://raw.githubusercontent.com/lifinance/types/main/src/assets/icons/chains/celo.svg" },
  { key: "etl", name: "Etherlink", coin: "XTZ", id: 42793, logoURI: "https://raw.githubusercontent.com/lifinance/types/main/src/assets/icons/chains/etherlink.svg" },
  { key: "hmi", name: "Hemi", coin: "ETH", id: 43111, logoURI: "https://raw.githubusercontent.com/lifinance/types/main/src/assets/icons/chains/hemi.svg" },
  { key: "wcc", name: "World Chain", coin: "ETH", id: 480, logoURI: "https://raw.githubusercontent.com/lifinance/types/main/src/assets/icons/chains/world.svg" },
  { key: "xdc", name: "XDC", coin: "XDC", id: 50, logoURI: "https://raw.githubusercontent.com/lifinance/types/main/src/assets/icons/chains/xdc.svg" },
  { key: "mnt", name: "Mantle", coin: "MNT", id: 5000, logoURI: "https://raw.githubusercontent.com/lifinance/types/main/src/assets/icons/chains/mantle.svg" },
  { key: "sop", name: "Sophon", coin: "SOPH", id: 50104, logoURI: "https://raw.githubusercontent.com/lifinance/types/main/src/assets/icons/chains/sophon.svg" },
  { key: "sup", name: "Superposition", coin: "ETH", id: 55244, logoURI: "https://raw.githubusercontent.com/lifinance/types/main/src/assets/icons/chains/superposition.svg" },
  { key: "ink", name: "Ink", coin: "ETH", id: 57073, logoURI: "https://raw.githubusercontent.com/lifinance/types/main/src/assets/icons/chains/ink.svg" },
  { key: "boc", name: "BOB", coin: "ETH", id: 60808, logoURI: "https://raw.githubusercontent.com/lifinance/types/main/src/assets/icons/chains/bob.svg" },
  { key: "flw", name: "Flow", coin: "FLOW", id: 747, logoURI: "https://raw.githubusercontent.com/lifinance/types/main/src/assets/icons/chains/flow.svg" },
  { key: "kat", name: "Katana", coin: "ETH", id: 747474, logoURI: "https://raw.githubusercontent.com/lifinance/types/main/src/assets/icons/chains/katana.svg" },
  { key: "ber", name: "Berachain", coin: "BERA", id: 80094, logoURI: "https://raw.githubusercontent.com/lifinance/types/main/src/assets/icons/chains/bera.svg" },
  { key: "kai", name: "Kaia", coin: "KAIA", id: 8217, logoURI: "https://raw.githubusercontent.com/lifinance/types/main/src/assets/icons/chains/kaia.svg" },
  { key: "pla", name: "Plasma", coin: "XPL", id: 9745, logoURI: "https://raw.githubusercontent.com/lifinance/types/main/src/assets/icons/chains/plasma.svg" },
  { key: "plu", name: "Plume", coin: "PLUME", id: 98866, logoURI: "https://raw.githubusercontent.com/lifinance/types/main/src/assets/icons/chains/plume.svg" },
  { key: "hyp", name: "HyperEVM", coin: "HYPE", id: 999, logoURI: "https://raw.githubusercontent.com/lifinance/types/main/src/assets/icons/chains/hyperevm.svg" },
  { key: "sol", name: "Solana", coin: "SOL", id: 1151111081099710, logoURI: "https://raw.githubusercontent.com/lifinance/types/main/src/assets/icons/chains/solana.svg" },
];

// Featured chains for hero display 
export const FEATURED_CHAINS = [
  ...LIFI_CHAINS.slice(0, 1),  // Ethereum
  LIFI_CHAINS[LIFI_CHAINS.length - 1], // Solana (last in array)
  ...LIFI_CHAINS.slice(2, 12),  // Rest of the featured chains
];

export const POPULAR_TOKENS = [
  { symbol: 'ETH', name: 'Ethereum', address: '0x0000000000000000000000000000000000000000' },
  { symbol: 'USDC', name: 'USD Coin', address: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48' },
  { symbol: 'USDT', name: 'Tether', address: '0xdac17f958d2ee523a2206206994597c13d831ec7' },
  { symbol: 'WBTC', name: 'Wrapped Bitcoin', address: '0x2260fac5e5542a773aa44fbcfedf7c193bc2c599' },
];

// Native token addresses for different chain types
export const NATIVE_TOKEN_ADDRESS = {
  EVM: '0x0000000000000000000000000000000000000000',
  SOLANA: '11111111111111111111111111111111', // Native SOL
  WRAPPED_SOLANA: 'So11111111111111111111111111111111111111112', // wSOL
};

// Solana chain ID
export const SOLANA_CHAIN_ID = 1151111081099710;
