#!/bin/bash
set -e

echo "=== Building TrafficPulse Contract ==="
cd contracts/traffic-pulse
cargo build --target wasm32v1-none --release
echo "✅ TrafficPulse contract built"
echo "Output: target/wasm32v1-none/release/traffic_pulse.wasm"

echo ""
echo "=== Building PULSE Token Contract ==="
cd ../pulse-token
cargo build --target wasm32v1-none --release
echo "✅ PULSE Token contract built"
echo "Output: target/wasm32v1-none/release/pulse_token.wasm"

echo ""
echo "=== Build Complete ==="
