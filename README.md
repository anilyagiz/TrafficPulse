# TrafficPulse - Traffic Prediction Game on Stellar

Predict traffic volume and win PULSE tokens!

## Live Demo

- **Contract**: `CDTUCJ52DABJ3GWL2N5Y5HOEHXA4IA3RUE6DILYFNHWUH4N67EHCWECC` (Testnet)
- **Frontend**: http://localhost:3001
- **Explorer**: https://stellar.expert/explorer/testnet/contract/CDTUCJ52DABJ3GWL2N5Y5HOEHXA4IA3RUE6DILYFNHWUH4N67EHCWECC

## Quick Start

```bash
# Install dependencies
cd app && npm install

# Run frontend on port 3001
PORT=3001 npm run dev
```

## How to Play

1. Connect Freighter wallet
2. Select traffic bin (0-20, 21-40, 41-60, 61-80, 81+)
3. Enter stake amount
4. Place bet before round closes
5. Winners share the pool!

## Features

✅ Freighter wallet integration
✅ 5 prediction bins
✅ Real-time pool tracking
✅ Pari-mutuel payouts (3% fee)
✅ Commit-reveal fairness
✅ 2/3 multi-sig approval

## Tech Stack

- **Blockchain**: Stellar / Soroban
- **Frontend**: Next.js 14 + TypeScript
- **Wallet**: Freighter
- **Contract**: Rust (Soroban SDK)

## Contract Functions

- `initialize(admin)` - Setup contract
- `create_round(id, end_ts)` - Create new round
- `place_bet(round, bin, amount)` - Place your bet
- `get_round(id)` - Get round info

## Environment

```
CONTRACT_ID=CDTUCJ52DABJ3GWL2N5Y5HOEHXA4IA3RUE6DILYFNHWUH4N67EHCWECC
NETWORK_PASSPHRASE=Test SDF Network ; September 2015
PORT=3001
```

## Testing

```bash
# Run tests
./test-frontend.sh

# Check status
curl http://localhost:3001
```

## License

MIT
