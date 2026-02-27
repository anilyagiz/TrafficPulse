# TrafficPulse Frontend - AGENTS.md

**Scope**: Next.js 14 application with Stellar blockchain integration

## Overview

Frontend application for TrafficPulse - a decentralized traffic prediction game. Built with Next.js 14 app router, TypeScript, and Stellar SDK for Soroban contract interaction.

## Structure

```
app/
├── app/                  # Next.js 14 app router pages
│   ├── page.tsx         # Main game page (orchestrates components)
│   ├── layout.tsx       # Root layout with providers
│   └── leaderboard/     # Leaderboard page
├── components/           # Reusable React components
│   ├── Hero.tsx         # Landing page hero section
│   ├── StatsCards.tsx   # Timer, pool, status cards
│   ├── PredictionBins.tsx # 5 betting bin grid
│   ├── StakeInput.tsx   # Stake amount input + bet button
│   ├── ClaimRewards.tsx # Claim winnings UI
│   └── AdminControls.tsx # Admin-only round management
├── contexts/             # React context providers
│   └── WalletContext.tsx # Freighter wallet state
├── lib/                  # Utilities and clients
│   ├── contract.ts      # TrafficPulseClient (Stellar SDK)
│   └── wallet.ts        # Wallet utilities
├── tests/                # Playwright E2E tests
│   └── e2e.spec.ts      # E2E test suite
└── package.json          # Dependencies + scripts
```

## Where To Look

| Task | Location | Notes |
|------|----------|-------|
| Main game logic | `app/page.tsx` | Component orchestration |
| Contract calls | `app/lib/contract.ts` | TrafficPulseClient class |
| Wallet state | `app/contexts/WalletContext.tsx` | useWallet hook |
| UI components | `app/components/` | Modular, typed props |
| E2E tests | `app/tests/e2e.spec.ts` | Playwright 24+ tests |

## Conventions

### Component Pattern
- All components: `'use client'` directive
- Props: Separate interface, PascalCase naming
- Styling: Tailwind CSS v4 only (no inline styles)
- State: React hooks (useState, useEffect, useCallback)

### Contract Integration
- Silent errors in read operations (`getRound`)
- Throw errors in write operations (`placeBet`, `claim`)
- Toast notifications for user feedback
- Mock data fallback for development

### File Organization
- Components: One component per file
- Pages: Next.js app router (`app/page.tsx`)
- Utilities: CamelCase filenames
- Tests: `.spec.ts` suffix for Playwright

## Anti-Patterns (This Project)

- **NEVER** use `as any` or `@ts-ignore` in TypeScript
- **NEVER** commit `.env` file (use `.env.example`)
- **AVOID** direct DOM manipulation (use React refs)
- **AVOID** inline styles (use Tailwind classes)
- **DO NOT** suppress console errors in production code

## Unique Styles

### Contract Call Pattern
```typescript
async placeBet(userAddress: string, roundId: number, binId: number, amount: bigint) {
  try {
    const account = await this.server.getAccount(userAddress);
    let tx = new TransactionBuilder(account, { fee: BASE_FEE })
      .addOperation(this.contract.call("place_bet", ...))
      .build();
    tx = await this.server.prepareTransaction(tx);
    const { signedTxXdr } = await signTransaction(tx.toXDR(), { networkPassphrase });
    const sendResponse = await this.server.sendTransaction(...);
    return await this.pollTransaction(sendResponse.hash);
  } catch (err) {
    console.error("placeBet error:", err);
    throw err;
  }
}
```

### Component Orchestration
```typescript
// page.tsx orchestrates, components render
<StatsCards timeLeft={timeLeft} totalPool={totalPool} />
<PredictionBins selectedBin={selectedBin} onSelect={setSelectedBin} />
{selectedBin && <StakeInput onPlaceBet={handlePlaceBet} />}
```

## Commands

```bash
# Development (port 3001-3006)
npm run dev -- -p 3001

# Production build
npm run build

# Playwright E2E tests
npm run test

# Test with UI
npm run test:ui

# Debug tests
npm run test:debug
```

## Testing

- **Framework**: Playwright
- **Tests**: 24 E2E tests (landing page, bins, stats, responsive)
- **Coverage**: Landing page, navigation, UI components, performance
- **Artifacts**: Screenshots on failure, HTML reports

## Notes

- **Port flexibility**: Runs on any port via `-p` flag
- **Wallet**: Freighter browser extension required
- **Network**: Stellar testnet by default
- **Mock data**: Returns mock data if contract calls fail (dev mode)
