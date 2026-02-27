# TrafficPulse - Deployment Guide

## Prerequisites

### 1. Install Soroban CLI

**Windows (PowerShell as Administrator):**
```powershell
# Install via Scoop
scoop bucket add stellar https://github.com/StellarCN/scoop-stellar.git
scoop install soroban-dev
```

**Manual Install (All Platforms):**
```bash
# Download latest release
curl -L https://github.com/StellarCN/soroban-tools/releases/download/latest/soroban-cli-x86_64-windows.exe -o soroban.exe
# Move to PATH
mv soroban.exe /usr/local/bin/soroban
```

**Verify Installation:**
```bash
soroban --version
```

### 2. Install Rust (if not already installed)

```bash
# Windows: Download from https://rustup.rs/
# Or use winget
winget install Rustlang.Rustup

# Verify
rustc --version
cargo --version
```

### 3. Add WASM Target

```bash
rustup target add wasm32-unknown-unknown
```

---

## Quick Deploy Script

Save this as `deploy-testnet.sh` (Linux/Mac) or `deploy-testnet.ps1` (Windows):

### Bash Version (deploy-testnet.sh)
```bash
#!/bin/bash
set -e

echo "🚀 Deploying TrafficPulse to Stellar Testnet"

# Configuration
NETWORK="testnet"
CONTRACT_DIR="contracts/traffic-pulse"
WASM_FILE="$CONTRACT_DIR/target/wasm32-unknown-unknown/release/traffic_pulse.wasm"

# 1. Build contract
echo "🔨 Building contract..."
cd $CONTRACT_DIR
cargo build --target wasm32-unknown-unknown --release
cd ../..

# 2. Deploy to testnet
echo "📤 Deploying to testnet..."
CONTRACT_ID=$(soroban contract deploy \
  --wasm $WASM_FILE \
  --network $NETWORK \
  --source alice)

echo "✅ Contract deployed: $CONTRACT_ID"

# 3. Save to .env
echo "NEXT_PUBLIC_CONTRACT_ID=$CONTRACT_ID" > app/.env
echo "NEXT_PUBLIC_SOROBAN_RPC_URL=https://soroban-testnet.stellar.org" >> app/.env

echo "🎉 Deployment complete!"
echo "Contract ID: $CONTRACT_ID"
echo "Explorer: https://stellar.expert/explorer/testnet/contract/$CONTRACT_ID"
```

### PowerShell Version (deploy-testnet.ps1)
```powershell
$ErrorActionPreference = "Stop"

Write-Host "🚀 Deploying TrafficPulse to Stellar Testnet" -ForegroundColor Cyan

# Configuration
$NETWORK = "testnet"
$CONTRACT_DIR = "contracts/traffic-pulse"
$WASM_FILE = "$CONTRACT_DIR/target/wasm32-unknown-unknown/release/traffic_pulse.wasm"

# 1. Build contract
Write-Host "🔨 Building contract..." -ForegroundColor Yellow
Set-Location $CONTRACT_DIR
cargo build --target wasm32-unknown-unknown --release
Set-Location ../..

# 2. Deploy to testnet
Write-Host "📤 Deploying to testnet..." -ForegroundColor Yellow
$CONTRACT_ID = soroban contract deploy `
  --wasm $WASM_FILE `
  --network $NETWORK `
  --source alice

Write-Host "✅ Contract deployed: $CONTRACT_ID" -ForegroundColor Green

# 3. Save to .env
@"
NEXT_PUBLIC_CONTRACT_ID=$CONTRACT_ID
NEXT_PUBLIC_SOROBAN_RPC_URL=https://soroban-testnet.stellar.org
"@ | Out-File -FilePath "app/.env" -Encoding utf8

Write-Host "🎉 Deployment complete!" -ForegroundColor Green
Write-Host "Contract ID: $CONTRACT_ID"
Write-Host "Explorer: https://stellar.expert/explorer/testnet/contract/$CONTRACT_ID"
```

---

## Manual Deployment Steps

### Step 1: Build Contract

```bash
cd contracts/traffic-pulse
cargo build --target wasm32-unknown-unknown --release
```

Output: `target/wasm32-unknown-unknown/release/traffic_pulse.wasm`

### Step 2: Setup Testnet Account

```bash
# Generate new keypair
soroban keys generate alice --network testnet

# Fund with Friendbot (get ~10,000 XLM)
curl -X POST "https://friendbot.stellar.org?addr=$(soroban keys address alice --network testnet)"
```

### Step 3: Deploy Contract

```bash
soroban contract deploy \
  --wasm target/wasm32-unknown-unknown/release/traffic_pulse.wasm \
  --network testnet \
  --source alice
```

Save the Contract ID!

### Step 4: Initialize Contract

```bash
# You need a token contract first (use existing SAC or deploy pulse-token)
TOKEN_CONTRACT_ID="CDTUCJ52DABJ3GWL2N5Y5HOEHXA4IA3RUE6DILYFNHWUH4N67EHCWECC"

soroban contract invoke \
  --id YOUR_CONTRACT_ID \
  --network testnet \
  --source alice \
  -- \
  initialize \
  --admin $(soroban keys address alice --network testnet) \
  --token $TOKEN_CONTRACT_ID
```

### Step 5: Update Frontend

Create `app/.env`:
```env
NEXT_PUBLIC_CONTRACT_ID=YOUR_CONTRACT_ID_HERE
NEXT_PUBLIC_SOROBAN_RPC_URL=https://soroban-testnet.stellar.org
```

### Step 6: Restart Frontend

```bash
cd app
npm run dev -- -p 3006
```

---

## Quick Start (Recommended)

For fastest deployment, use the **Stellar CLI Deployer**:

```bash
# Install
npm install -g @stellar/cli

# Login
stellar login

# Deploy
stellar contract deploy \
  --wasm contracts/traffic-pulse/target/wasm32-unknown-unknown/release/traffic_pulse.wasm \
  --network testnet
```

---

## Verification

After deployment, verify at:
- **Stellar Expert**: https://stellar.expert/explorer/testnet/contract/YOUR_CONTRACT_ID
- **Stellar Dashboard**: https://dashboard.stellar.org/testnet/contract/YOUR_CONTRACT_ID

---

## Troubleshooting

### "Command not found: soroban"
- Add Soroban to PATH: `export PATH=$PATH:~/.cargo/bin`

### "Insufficient balance"
- Fund account: `curl -X POST "https://friendbot.stellar.org?addr=YOUR_ADDRESS"`

### "WASM file not found"
- Build first: `cargo build --target wasm32-unknown-unknown --release`

### "Network error"
- Check RPC: `soroban network add testnet --rpc-url https://soroban-testnet.stellar.org`

---

## Next Steps

1. ✅ Deploy contract
2. ✅ Update `.env`
3. ✅ Initialize contract
4. ✅ Create first round
5. ✅ Start betting!
