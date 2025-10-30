# Working Routes Guide - Quick Reference

## ✅ Guaranteed to Work

### Stablecoin Bridges (Highest Success Rate)
```
Any EVM → Solana
USDC → USDC  ✅ (via Mayan CCTP + AllBridge)
USDT → USDT  ✅ (via Mayan + AllBridge)

Example:
Base USDC → Solana USDC ✅✅✅
Arbitrum USDT → Solana USDT ✅✅✅
```

### Native Token Bridges
```
Any EVM → Solana
ETH → SOL   ✅ (via Mayan)
ETH → wSOL  ✅ (via Mayan)

Example:
Arbitrum ETH → Solana SOL ✅✅
Base ETH → Solana SOL ✅✅
```

### EVM to EVM (Always Works)
```
Any token between supported EVM chains ✅✅✅
Base USDC → Polygon USDC ✅
Arbitrum ETH → Optimism ETH ✅
```

## ❌ Won't Work (No Bridge Support)

### Cross-Chain Token Swaps
```
USDC → SOL  ❌ (different token types)
SOL → USDC  ❌ (swap + bridge not supported)
ETH → USDC  ❌ (on Solana destination)
USDT → SOL  ❌ (different token types)
```

**Why**: Bridges transfer SAME tokens across chains. They don't swap between different tokens cross-chain.

## 🎯 Demo Strategy

### For Your Hackathon Demo:

**Option 1: Stablecoin Bridge** (Most Reliable)
```
From: Base
Token: USDC
To: Solana
Token: USDC  ← Same token!
Amount: 10
Result: ✅ Instant quote
```

**Option 2: Native Bridge** (More Impressive)
```
From: Arbitrum  
Token: ETH
To: Solana
Token: SOL  ← Different native tokens work!
Amount: 0.01
Result: ✅ Shows true cross-VM capability
```

**Option 3: Reverse Direction** (Proof of Bidirectional)
```
From: Solana
Token: USDC or SOL
To: Base
Token: USDC or ETH
Amount: 5
Result: ✅ Solana → EVM works too!
```

## 💡 Key Insight

**Bridges transfer tokens, they don't swap them cross-chain.**

Think of it like this:
- ✅ "Send USDC from Base, receive USDC on Solana" = Bridge
- ❌ "Send USDC from Base, receive SOL on Solana" = Swap + Bridge (not supported by most bridges)

To achieve USDC → SOL:
1. Bridge: Base USDC → Solana USDC ✅
2. Then swap on Solana: USDC → SOL (via Jupiter/Raydium)

But LiFi doesn't currently route this as one transaction for all pairs.

## 🔧 Supported Chains & Bridges

### Mayan (Primary for Solana)
- Chains: ETH, BSC, POL, AVA, ARB, **SOL**, OPT, BAS
- Tokens: SOL, USDC, USDT, WETH, WBTC, wSOL, MSOL, JUP, BONK, etc.
- Special: Includes native USDC bridge (CCTP)

### AllBridge (Stablecoins)
- Chains: ETH, BSC, POL, ARB, **SOL**
- Tokens: USDC, USDT only

### Jupiter (Solana Only)
- On-chain Solana swaps
- Not for cross-chain

## 📱 Quick Test Checklist

Before your demo, test these:
1. ✅ Base USDC → Solana USDC (should show quote)
2. ✅ Arbitrum ETH → Solana SOL (should show quote)
3. ❌ Base USDC → Solana SOL (should show helpful error)
4. ✅ Solana USDC → Base USDC (reverse direction)

## 🎤 Demo Script

When you get the error:
> "See that error? It's because USDC to SOL isn't supported by bridges - they transfer same tokens, not swap between them. Let me show you what DOES work..."

Then switch to USDC → USDC:
> "Now watch this - Base USDC to Solana USDC. Boom! Instant quote using Mayan's bridge. That's real cross-VM transfers!"

This shows you understand the tech and handle edge cases gracefully! 🎯
