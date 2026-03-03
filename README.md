# 🚦 TrafficPulse

Decentralized traffic prediction game on Stellar. Predict traffic volume, stake PULSE tokens, and win rewards through pari-mutuel payouts.

## 🌐 Live Demo

- **Network**: Stellar Testnet
- **Contract**: [`CDTUCJ52DABJ3GWL2N5Y5HOEHXA4IA3RUE6DILYFNHWUH4N67EHCWECC`](https://stellar.expert/explorer/testnet/contract/CDTUCJ52DABJ3GWL2N5Y5HOEHXA4IA3RUE6DILYFNHWUH4N67EHCWECC)

## Quick Start

```bash
# Install dependencies
cd app && npm install

# Copy environment config
cp .env.example .env
# Edit .env with your contract IDs

# Start development server
npm run dev
```

## How It Works

1. **Connect** — Link your Freighter wallet
2. **Predict** — Choose a traffic volume bin (0-20, 21-40, 41-60, 61-80, 81+)
3. **Stake** — Enter PULSE token amount
4. **Wait** — Round resolves after 10 minutes
5. **Win** — Correct predictions share the pool (3% protocol fee)

## Architecture

| Layer | Technology |
|-------|-----------|
| Blockchain | Stellar / Soroban |
| Smart Contracts | Rust (Soroban SDK) |
| Frontend | Next.js 14 + TypeScript |
| Styling | Tailwind CSS v4 |
| Wallet | Freighter |

## Features

- ✅ Pari-mutuel betting with 5 prediction bins
- ✅ Commit-reveal scheme for fair results
- ✅ Sniping prevention (no bets in last 3 minutes)
- ✅ On-chain claim with double-claim protection
- ✅ Real-time pool tracking
- ✅ Responsive design with dark theme
- ✅ Freighter wallet integration

## Contract Functions

| Function | Access | Description |
|----------|--------|-------------|
| `initialize(admin, token)` | Admin | Set up contract |
| `create_round(id, end_time, commit)` | Admin | Create prediction round |
| `place_bet(user, round, bin, amount)` | User | Place a bet |
| `finalize_round(round_id, seed)` | Admin | Reveal seed & determine winner |
| `claim(user, round_id)` | User | Claim winnings |
| `get_round(id)` | Public | Query round data |
| `get_user_bet(round, bin, user)` | Public | Query user's bet |

## Project Structure

```
TrafficPulse/
├── app/                    # Next.js frontend
│   ├── app/               # Pages (app router)
│   ├── components/        # React components
│   ├── contexts/          # WalletContext
│   └── lib/               # Contract client
├── contracts/
│   └── traffic-pulse/     # Soroban smart contract
└── docs/                  # Documentation
```

## Development

```bash
# Frontend
cd app && npm run dev

# Build for production
cd app && npm run build

# Run E2E tests
cd app && npm run test

# Build contract
cd contracts/traffic-pulse && cargo build --target wasm32-unknown-unknown --release
```

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_CONTRACT_ID` | Yes | Traffic Pulse contract address |
| `NEXT_PUBLIC_TOKEN_ID` | No | PULSE token contract address |
| `NEXT_PUBLIC_SOROBAN_RPC_URL` | No | Soroban RPC (default: testnet) |
| `NEXT_PUBLIC_APP_URL` | No | App URL for SEO |
| `NEXT_PUBLIC_ADMIN_ADDRESS` | No | Admin UI visibility |

## License

MIT
