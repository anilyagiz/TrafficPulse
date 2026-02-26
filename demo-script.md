# TrafficPulse Demo Script

## 🎮 Live Demo Instructions

### Prerequisites
1. Install Freighter wallet: https://www.freighter.app/
2. Create a Stellar testnet account
3. Get test XLM from friendbot: https://laboratory.stellar.org/#account-creator?network=test

### Step-by-Step Demo

#### 1. Open the App
```
http://localhost:3000
```

#### 2. Connect Wallet
- Click "Connect Wallet" button (top right)
- Freighter popup will appear
- Click "Allow" to connect

#### 3. View Active Rounds
- After connecting, you'll see "Active Rounds" section
- Round #1 should be displayed
- Shows total pool and bin totals

#### 4. Place a Bet
1. **Select a bin**: Click one of the 5 bins:
   - 0–20 vehicles
   - 21–40 vehicles
   - 41–60 vehicles
   - 61–80 vehicles
   - 81+ vehicles

2. **Enter stake**: Type amount (e.g., 100 PULSE)

3. **Click "Place Bet"**: Confirm in Freighter wallet

#### 5. View Results
- Your bet appears in the bin total
- Total pool updates
- Other users can see all bets (transparent)

### Contract Details

**Address**: `CDTUCJ52DABJ3GWL2N5Y5HOEHXA4IA3RUE6DILYFNHWUH4N67EHCWECC`

**Explorer**: 
https://stellar.expert/explorer/testnet/contract/CDTUCJ52DABJ3GWL2N5Y5HOEHXA4IA3RUE6DILYFNHWUH4N67EHCWECC

**Lab**:
https://lab.stellar.org/r/testnet/contract/CDTUCJ52DABJ3GWL2N5Y5HOEHXA4IA3RUE6DILYFNHWUH4N67EHCWECC

### Game Rules

1. **Round Duration**: 10 minutes
2. **Entry Window**: First 7 minutes only
3. **Bins**: 5 traffic volume ranges
4. **Payout**: Winners share pool (3% house fee)
5. **Fairness**: Commit-reveal + 2/3 multi-sig

### Example Scenario

```
Round #1:
- Alice bets 100 PULSE on "41-60"
- Bob bets 200 PULSE on "21-40"
- Charlie bets 150 PULSE on "41-60"

Total Pool: 450 PULSE
House Fee: 13.5 PULSE (3%)
Net Pool: 436.5 PULSE

If result is 41-60:
- Alice gets: 100/250 * 436.5 = 174.6 PULSE
- Charlie gets: 150/250 * 436.5 = 261.9 PULSE
- Bob gets: 0 PULSE (lost)
```

### Testing Multiple Users

Open multiple browser windows:
```bash
# Window 1 - Alice
http://localhost:3000

# Window 2 - Bob (different Freighter account)
http://localhost:3000
```

Each user can place bets and see the pool update in real-time!

### Troubleshooting

**Wallet not connecting?**
- Make sure Freighter is installed
- Check if testnet is selected in Freighter
- Refresh the page

**Bet failing?**
- Ensure you have test XLM
- Check if round is still open (not in last 3 min)
- Verify stake amount is > 0

**Can't see rounds?**
- Check console for errors
- Verify contract address in .env
- Make sure frontend is running: `npm run dev`

---

**Ready to demo! 🚀**
