# TrafficPulse - Project Knowledge Base

**Generated**: 2026-02-27
**Stack**: Next.js 14 + TypeScript + Stellar/Soroban + Rust

## Overview

Decentralized traffic prediction game on Stellar testnet. Users bet PULSE tokens on traffic volume bins (0-20, 21-40, 41-60, 61-80, 81+). Winners share pool via pari-mutuel payouts (3% fee).

## Structure

```
TrafficPulse/
├── app/                    # Next.js frontend
│   ├── app/               # Next.js 14 app directory
│   ├── components/        # React components (Hero, StatsCards, PredictionBins, etc.)
│   ├── contexts/          # React contexts (WalletContext)
│   ├── lib/               # Contract client (Stellar SDK integration)
│   └── tests/             # Playwright E2E tests
├── contracts/              # Soroban smart contracts
│   ├── traffic-pulse/     # Main game logic
│   └── pulse-token/       # PULSE token contract
├── docs/                   # Documentation
└── scripts/                # Build/deploy scripts
```

## Where To Look

| Task | Location | Notes |
|------|----------|-------|
| Frontend pages | `app/app/` | Next.js 14 app router |
| UI components | `app/components/` | Modular React components |
| Blockchain client | `app/lib/contract.ts` | TrafficPulseClient class |
| Wallet integration | `app/contexts/WalletContext.tsx` | Freighter wallet |
| Smart contracts | `contracts/*/src/lib.rs` | Soroban SDK |
| E2E tests | `app/tests/` | Playwright |
| Contract docs | `docs/CONTRACTS.md` | Function reference |

## Code Map

| Symbol | Type | Location | Role |
|--------|------|----------|------|
| `TrafficPulseClient` | Class | `app/lib/contract.ts` | Stellar contract interaction |
| `place_bet()` | Method | `app/lib/contract.ts` | Submit bet transaction |
| `getRound()` | Method | `app/lib/contract.ts` | Query round data |
| `WalletProvider` | Context | `app/contexts/WalletContext.tsx` | Wallet state management |
| `Hero` | Component | `app/components/Hero.tsx` | Landing page |
| `PredictionBins` | Component | `app/components/PredictionBins.tsx` | 5 bin selection UI |
| `TrafficPulseContract` | Contract | `contracts/traffic-pulse/src/lib.rs` | Soroban contract |

## Conventions

### TypeScript
- Strict mode enabled
- No `any` types (use proper typing)
- Interface naming: PascalCase
- File naming: PascalCase for components, camelCase for utilities

### React
- All components use `'use client'` directive
- Functional components with hooks only
- Props interfaces defined separately
- Tailwind CSS v4 for styling

### Rust (Soroban)
- `#![no_std]` for contract size optimization
- `#[contracttype]` for serializable types
- Storage keys as enum (`DataKey`)
- Admin functions require `admin.require_auth()`

## Anti-Patterns (This Project)

- **NEVER** use `as any` or `@ts-ignore` in TypeScript
- **NEVER** commit `.env` files (use `.env.example`)
- **NEVER** suppress type errors
- **DO NOT** modify target/ directory (build artifacts)
- **AVOID** inline styles (use Tailwind classes)
- **AVOID** direct DOM manipulation (use React refs)

## Unique Styles

### Contract Client Pattern
```typescript
// All contract calls follow: getAccount → build → prepare → sign → send → poll
async placeBet(userAddress: string, roundId: number, binId: number, amount: bigint) {
  const account = await this.server.getAccount(userAddress);
  let tx = new TransactionBuilder(account, { fee: BASE_FEE })
    .addOperation(this.contract.call("place_bet", ...))
    .build();
  tx = await this.server.prepareTransaction(tx);
  const { signedTxXdr } = await signTransaction(tx.toXDR(), { networkPassphrase });
  const sendResponse = await this.server.sendTransaction(...);
  return await this.pollTransaction(sendResponse.hash);
}
```

### Component Structure
```typescript
'use client';
import { useState } from 'react';

interface Props { /* typed props */ }

export function ComponentName({ prop }: Props) {
  return (/* JSX */);
}
```

### Error Handling
- Silent failures in `getRound()` (return mock data for dev)
- Throw errors in write operations (`placeBet`, `claim`)
- Toast notifications for user feedback

## Commands

```bash
# Frontend development
cd app && npm run dev -- -p 3001

# Build production
cd app && npm run build

# Run Playwright tests
cd app && npm run test

# Build contracts
cd contracts/traffic-pulse && cargo build --target wasm32-unknown-unknown --release

# Deploy contract
soroban contract deploy --wasm target/wasm32-unknown-unknown/release/traffic_pulse.wasm
```

## Environment Variables

```bash
NEXT_PUBLIC_CONTRACT_ID=CDTUCJ52DABJ3GWL2N5Y5HOEHXA4IA3RUE6DILYFNHWUH4N67EHCWECC
NEXT_PUBLIC_SOROBAN_RPC_URL=https://soroban-testnet.stellar.org
```

## Notes

- **Contract deployed on Stellar Testnet** - Use testnet Lumens (XLM)
- **Freighter wallet required** - Users must install browser extension
- **10-minute rounds** - Bets close before round end timestamp
- **Commit-reveal scheme** - Result hidden until admin reveals seed
- **2/3 multi-sig** - Committee approval prevents manipulation
- **Port flexibility** - Frontend runs on any port (default: 3001-3006)
