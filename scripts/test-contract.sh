#!/bin/bash
set -e

echo "=== Testing TrafficPulse Contract ==="
cd contracts/traffic-pulse
cargo test --lib
echo "✅ TrafficPulse tests passed"

echo ""
echo "=== Testing PULSE Token Contract ==="
cd ../pulse-token
cargo test --lib
echo "✅ PULSE Token tests passed"

echo ""
echo "=== All Tests Passed ==="
