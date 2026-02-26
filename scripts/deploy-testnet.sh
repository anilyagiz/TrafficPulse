#!/bin/bash
set -e

echo "=== Deploying to Stellar Testnet ==="

# Check if stellar CLI is installed
if ! command -v stellar &> /dev/null; then
    echo "❌ Stellar CLI not found. Install with: cargo install stellar-cli --locked"
    exit 1
fi

# Configure testnet
echo "Configuring testnet..."
stellar network add testnet \
    --rpc-url https://soroban-testnet.stellar.org:443 \
    --network-passphrase "Test SDF Network ; September 2015"

# Deploy PULSE Token
echo ""
echo "Deploying PULSE Token..."
cd contracts/pulse-token
TOKEN_ID=$(stellar contract deploy \
    --wasm target/wasm32v1-none/release/pulse_token.wasm \
    --source alice \
    --network testnet)
echo "✅ PULSE Token deployed: $TOKEN_ID"

# Deploy TrafficPulse Contract
echo ""
echo "Deploying TrafficPulse Contract..."
cd ../traffic-pulse
CONTRACT_ID=$(stellar contract deploy \
    --wasm target/wasm32v1-none/release/traffic_pulse.wasm \
    --source alice \
    --network testnet)
echo "✅ TrafficPulse deployed: $CONTRACT_ID"

# Save to .env
echo ""
echo "Saving to .env..."
cat > ../../.env << EOF
CONTRACT_ID=$CONTRACT_ID
TOKEN_ID=$TOKEN_ID
NETWORK_PASSPHRASE="Test SDF Network ; September 2015"
EOF

echo ""
echo "=== Deployment Complete ==="
echo "Contract ID: $CONTRACT_ID"
echo "Token ID: $TOKEN_ID"
