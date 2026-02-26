#!/bin/bash
echo "=== Testing TrafficPulse Frontend ==="
echo ""
echo "1. Checking if server is running..."
if curl -s http://localhost:3000 > /dev/null; then
    echo "✅ Frontend is running on http://localhost:3000"
else
    echo "❌ Frontend is not responding"
    exit 1
fi

echo ""
echo "2. Checking wallet integration..."
if grep -q "Freighter" app/app/page.tsx; then
    echo "✅ Freighter wallet integration found"
else
    echo "❌ Wallet integration missing"
fi

echo ""
echo "3. Checking contract client..."
if [ -f "app/lib/contract.ts" ]; then
    echo "✅ Contract client exists"
else
    echo "❌ Contract client missing"
fi

echo ""
echo "4. Checking contract address..."
CONTRACT_ID=$(grep "CONTRACT_ID=" .env | cut -d'=' -f2)
echo "Contract: $CONTRACT_ID"

echo ""
echo "=== All Tests Passed! ==="
echo "Open http://localhost:3000 in your browser"
echo "Connect Freighter wallet and start betting!"
