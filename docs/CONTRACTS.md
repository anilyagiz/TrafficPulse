# TrafficPulse Smart Contracts

## Overview

TrafficPulse consists of two Soroban smart contracts:

1. **PULSE Token** - ERC20-like token for betting
2. **TrafficPulse** - Main game logic contract

## PULSE Token

**Contract**: `contracts/pulse-token/`

### Functions

- `mint(to: Address, amount: i128)` - Mint tokens (admin only)
- `transfer(from: Address, to: Address, amount: i128) -> bool` - Transfer tokens
- `balance(id: Address) -> i128` - Get balance
- `approve(owner: Address, spender: Address, amount: i128)` - Approve spending
- `allowance(owner: Address, spender: Address) -> i128` - Get allowance

### Metadata

- Name: PULSE
- Symbol: PLS
- Decimals: 18

## TrafficPulse

**Contract**: `contracts/traffic-pulse/`

### Game Flow

1. **Initialize** - Set committee and token address
2. **Create Round** - Create new 10-minute round with commit-hash
3. **Place Bet** - Users bet on bins (0-20, 21-40, 41-60, 61-80, 81+)
4. **Close Round** - After 10 minutes, entry closes
5. **Reveal Seed** - Committee reveals seed, result computed
6. **Approve Result** - 2/3 committee members must approve
7. **Finalize** - Payouts calculated (3% house fee)
8. **Claim** - Winners claim rewards

### Functions

- `initialize(committee: Vec<Address>, pulse_token: Address)` - Setup
- `create_round(commit_hash: BytesN<32>, start_ts: u64, duration: u32) -> u32` - New round
- `place_bet(round_id: u32, bin_id: u32, amount: i128)` - Place bet
- `reveal_seed(round_id: u32, seed: BytesN<32>)` - Reveal and compute result
- `approve_result(round_id: u32, result_bin: u32)` - Committee approval
- `get_approval_count(round_id: u32, result_bin: u32) -> u32` - Check approvals
- `finalize_result(round_id: u32)` - Calculate payouts
- `claim(round_id: u32)` - Claim rewards
- `get_round(round_id: u32) -> Option<Round>` - Query round
- `get_claimable(round_id: u32, wallet: Address) -> i128` - Check claimable

### Key Features

- **Commit-Reveal**: Result hidden until round ends
- **Multi-sig**: 2/3 committee approval required
- **Sniping Prevention**: No bets in last 3 minutes
- **Pari-mutuel**: Winners share pool (minus 3% fee)
- **Double-claim Prevention**: Can only claim once per round

## Testing

```bash
# Run all tests
./scripts/test-contract.sh

# Run specific test
cd contracts/traffic-pulse
cargo test test_place_bet -- --nocapture
```

## Deployment

```bash
# Build contracts
./scripts/build-contract.sh

# Deploy to testnet
./scripts/deploy-testnet.sh
```

## Security Considerations

1. Committee addresses must be trusted
2. Token transfer requires actual SAC integration
3. Commit-hash prevents result manipulation
4. Multi-sig prevents single-point compromise
