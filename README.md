# Porta

Send crypto anywhere across chains in one tap.

## About

Porta is a beautiful cross-chain crypto transfer application that makes sending cryptocurrency across 56+ blockchains magical. Built with Li.Fi for cross-chain transfers and Privy for seamless authentication.

## Features

- ⚡ **Instant Transfers** - Send crypto across chains in seconds
- 🔍 **Smart Search** - Find any chain with intelligent search
- 🎨 **Beautiful UI** - Modern, playful interface with smooth animations
- 🔐 **Secure** - Powered by industry-leading Privy authentication
- 🌐 **56+ Chains** - Support for Ethereum, Arbitrum, Base, Scroll, and many more
- 🪙 **Multi-Token** - Choose from your wallet's token balances

## Getting Started

Follow these steps to run the project locally:

```sh
# Step 1: Clone the repository
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory
cd porta

# Step 3: Install dependencies
npm install

# Step 4: Create a .env file with your Privy App ID
# (Get your Privy App ID from https://dashboard.privy.io/)
echo "VITE_PRIVY_APP_ID=your_privy_app_id" > .env

# Step 5: Start the development server
npm run dev
```

The application will be available at `http://localhost:8080`

## Technologies

This project is built with modern web3 technologies:

- **Vite** - Fast build tool and dev server
- **TypeScript** - Type-safe JavaScript
- **React** - UI library
- **shadcn/ui** - Beautiful UI components
- **Tailwind CSS** - Utility-first CSS framework
- **Privy** - Web3 authentication and wallet management
- **Li.Fi SDK** - Cross-chain transfer aggregation
- **Framer Motion** - Animation library

## Configuration

### Environment Variables

Create a `.env` file in the root directory with the following:

```env
VITE_PRIVY_APP_ID=your_privy_app_id_here
```

Get your Privy App ID from the [Privy Dashboard](https://dashboard.privy.io/).

## Deployment

Build the project for production:

```sh
npm run build
```

The optimized build will be in the `dist` folder, ready to deploy to any static hosting service like Vercel, Netlify, or Cloudflare Pages.

## License

MIT
