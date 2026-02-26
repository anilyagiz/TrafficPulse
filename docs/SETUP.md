# TrafficPulse Setup Guide

## Prerequisites

### 1. Rust Installation

```bash
# Install Rust
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# Add WASM target
rustup target add wasm32v1-none
```

### 2. Stellar CLI

```bash
cargo install stellar-cli --locked
```

### 3. Node.js (for frontend)

Requires Node.js 18+

## Quick Start

### 1. Install Dependencies

```bash
# Frontend
cd app
npm install

# This installs:
# - @stellar/freighter-api
# - @stellar/stellar-sdk
# - @creit.tech/stellar-wallets-kit
```

### 2. Environment Setup

```bash
# Copy example
cp .env.example .env

# Edit .env with your values:
# - CONTRACT_ID (after deployment)
# - TOKEN_ID (after deployment)
# - SUPABASE_URL
# - SUPABASE_ANON_KEY
```

### 3. Build Contracts

```bash
./scripts/build-contract.sh
```

### 4. Run Tests

```bash
./scripts/test-contract.sh
```

### 5. Deploy to Testnet

```bash
# Create Stellar account
stellar keys generate alice

# Fund from friendbot
stellar friendbot --network testnet <YOUR_ADDRESS>

# Deploy
./scripts/deploy-testnet.sh
```

### 6. Run Frontend

```bash
cd app
npm run dev
```

Open http://localhost:3000

## Supabase Setup

1. Go to https://app.supabase.com
2. Create new project: `traffic-pulse-testnet`
3. Copy URL and anon key to `.env`
4. Run migrations:

```bash
supabase db push
```

## Troubleshooting

### "stellar: command not found"

Install Stellar CLI:
```bash
cargo install stellar-cli --locked
```

### "wasm32v1-none target not found"

Add WASM target:
```bash
rustup target add wasm32v1-none
```

### Frontend build errors

Clear cache and reinstall:
```bash
cd app
rm -rf node_modules package-lock.json
npm install
```

## Next Steps

1. Deploy contracts to testnet
2. Initialize contract with committee addresses
3. Create first round
4. Test betting flow with Freighter wallet
