# TrafficPulse - Stellar/Soroban Trafik Tahmin Oyunu

## TL;DR

> **Özet**: Kullanıcılar 10 dakikalık round'larda trafik yoğunluğunu tahmin eder, PULSE token stake eder, doğru bilenler havuzdan ödeme alır. Stellar/Soroban blockchain üzerinde commit-reveal + 2/3 multi-sig ile güvenli sonuç üretimi.

> **Deliverables**:
> - Soroban Smart Contract (Rust) - round, bet, claim, multi-sig approval
> - Next.js Frontend - wallet connect, round listesi, bet UI, leaderboard
> - Supabase Database - indexer, analytics, user history
> - Admin Panel - committee için sonuç onaylama
> - Test Suite - TDD ile tüm contract ve frontend fonksiyonları

> **Estimated Effort**: Medium-Large (1-2 hafta)
> **Parallel Execution**: YES - 5 waves
> **Critical Path**: Contract Core → Frontend Integration → Multi-sig → E2E Test

---

## Context

### Original Request
TrafficPulse - Stellar blockchain üzerinde trafik tahmin oyunu. Kullanıcılar kameradan/şeritten 10 dakikada kaç araç geçeceğini tahmin eder (5 aralık: 0-20, 21-40, 41-60, 61-80, 81+). Pari-mutuel ödeme sistemi, commit-reveal ile manipülasyon önleme, 2/3 multi-sig committee onayı.

### Interview Summary
**Key Decisions**:
- **Scope**: MVP - Core loop only (round, bet, claim, basic UI)
- **Network**: Stellar Testnet (Black Belt demo için)
- **Test Strategy**: TDD - Test Driven Development
- **Timeline**: 1-2 Hafta
- **Backend**: Next.js API Routes
- **Database**: Supabase (PostgreSQL)
- **Wallet**: Freighter (@stellar/freighter-api)
- **House Fee**: %3
- **Committee**: 3 kişi, 2/3 onay

**Research Findings**:
- Soroban contract yapısı: `#![no_std]`, `#[contract]`, `#[contractimpl]`
- Storage: `env.storage().instance()` (persistent), `env.storage().temporary()` (ephemeral)
- Events: `env.events().publish()` for indexer
- Freighter integration: `@stellar/freighter-api` + HTTPS localhost
- Commit-reveal pattern: hash(seed) commit, seed reveal, verify
- OpenZeppelin Stellar: access control, ownable patterns

### Metis Review
**Identified Gaps** (addressed in plan):
- PULSE token deployment strategy → Task 2'de Stellar Asset Contract (SAC) deploy
- Committee member auth → Task 3'te `require_auth()` ile address verification
- Frontend contract ID management → Task 8'de `.env` config + exported ABI
- Database schema design → Task 12'de Supabase migration dosyaları
- Error handling strategy → Her task'ta negative scenario eklendi

---

## Work Objectives

### Core Objective
Stellar testnet üzerinde çalışan, kullanıcıların trafik tahmini yapabildiği, güvenli sonuç üretimi yapan ve otomatik ödeme dağıtan bir prediction game.

### Concrete Deliverables
1. `contracts/traffic-pulse/` - Soroban smart contract (lib.rs + test.rs)
2. `contracts/pulse-token/` - PULSE token (SAC - Stellar Asset Contract)
3. `app/` - Next.js frontend (App Router)
4. `lib/` - Contract client wrappers, utilities
5. `supabase/migrations/` - Database schema
6. `scripts/` - Deployment ve setup scriptleri

### Definition of Done
- [ ] `stellar contract deploy` ile testnet'e deploy
- [ ] `npm run test` → 100% test pass (contract + frontend)
- [ ] 20+ farklı wallet ile bet yapılmış
- [ ] 3+ round tamamlanmış, payout dağıtılmış
- [ ] Committee multi-sig onayı çalışıyor
- [ ] Leaderboard gerçek zamanlı güncelleniyor
- [ ] Sentry + monitoring aktif

### Must Have
- ✅ Commit-reveal ile sonuç gizliliği
- ✅ 2/3 multi-sig committee approval
- ✅ Pari-mutuel ödeme (3% house fee)
- ✅ 5 bins: 0-20, 21-40, 41-60, 61-80, 81+
- ✅ Round: 10 dakika (7 dk giriş, 3 dk kapalı)
- ✅ Freighter wallet integration
- ✅ Live counter + sentiment bar
- ✅ Claim rewards (tek seferlik)

### Must NOT Have (Guardrails)
- ❌ Power-ups (Early Bird, Contrarian Bonus) - MVP sonrası
- ❌ Sezon/rozet sistemi - MVP sonrası
- ❌ Traffic mode switching - MVP sonrası
- ❌ Real camera integration - Simülasyon yeterli
- ❌ Advanced analytics - Basit leaderboard yeterli
- ❌ Mobile app - Web only
- ❌ `as any` / `@ts-ignore` - Type-safe code
- ❌ Hardcoded contract IDs - Environment variables kullan
- ❌ Console.log production'da - Logger kullan

---

## Verification Strategy

### Test Decision
- **Infrastructure exists**: NO (greenfield)
- **Automated tests**: YES (TDD)
- **Framework**: 
  - Contract: `soroban-sdk` test utils (Rust)
  - Frontend: Vitest + React Testing Library
  - E2E: Playwright
- **TDD Flow**: RED (failing test) → GREEN (minimal impl) → REFACTOR

### QA Policy
Her task MUST include agent-executed QA scenarios:
- **Frontend/UI**: Playwright - navigate, click, fill, assert DOM, screenshot
- **Contract**: `cargo test` - unit tests, integration tests
- **API**: curl - POST/GET requests, assert JSON response
- **Database**: SQL queries - verify data integrity

Evidence saved to `.sisyphus/evidence/task-{N}-{scenario-slug}.{ext}`

---

## Execution Strategy

### Parallel Execution Waves

```
Wave 1 (Start Immediately - Foundation + Token):
├── Task 1: Proje scaffolding + tooling setup [quick]
├── Task 2: PULSE token contract (SAC) [quick]
├── Task 3: Supabase setup + migrations [quick]
├── Task 4: Contract temel yapı + Round struct [quick]
└── Task 5: Freighter wallet integration [quick]

Wave 2 (After Wave 1 - Core Contract Logic):
├── Task 6: create_round + place_bet fonksiyonları [deep]
├── Task 7: Commit-reveal implementation [unspecified-high]
├── Task 8: Multi-sig committee approval [deep]
├── Task 9: finalize_result + payout calculation [deep]
└── Task 10: claim fonksiyonu [quick]

Wave 3 (After Wave 2 - Frontend Core):
├── Task 11: Contract client wrappers + TypeScript bindings [quick]
├── Task 12: Round listesi + detay sayfası [visual-engineering]
├── Task 13: Bet placement UI + sentiment bar [visual-engineering]
├── Task 14: Live counter + timer [visual-engineering]
└── Task 15: Leaderboard + profile sayfası [visual-engineering]

Wave 4 (After Wave 3 - Admin + Integration):
├── Task 16: Admin panel - committee approval UI [visual-engineering]
├── Task 17: API routes - indexer + analytics [unspecified-high]
├── Task 18: Traffic simulation backend [unspecified-high]
├── Task 19: Deployment scripts + .env config [quick]
└── Task 20: E2E test suite (Playwright) [deep]

Wave 5 (After Wave 4 - Verification):
├── Task 21: Contract audit + security check [oracle]
├── Task 22: Frontend QA - Playwright scenarios [unspecified-high]
├── Task 23: Load test - 20+ concurrent users [deep]
└── Task 24: Documentation + Black Belt checklist [writing]

Critical Path: Task 1 → Task 2 → Task 4 → Task 6 → Task 9 → Task 11 → Task 20 → Task 22
Parallel Speedup: ~65% faster than sequential
Max Concurrent: 5 (Waves 1-3)
```

### Dependency Matrix
| Task | Depends On | Blocks |
|------|------------|--------|
| 1 | - | 2, 3, 4, 5 |
| 2 | 1 | 6, 9 |
| 3 | 1 | 12, 15, 17 |
| 4 | 1 | 6, 7, 8 |
| 5 | 1 | 12, 13 |
| 6 | 2, 4 | 9, 11 |
| 7 | 4 | 8 |
| 8 | 6, 7 | 9 |
| 9 | 6, 8 | 10, 11 |
| 10 | 9 | 11 |
| 11 | 6, 9, 10 | 12, 13, 14, 16 |
| 12 | 3, 5, 11 | - |
| 13 | 5, 11 | - |
| 14 | 11 | - |
| 15 | 3, 11 | - |
| 16 | 11 | - |
| 17 | 3 | 12, 15 |
| 18 | - | 14 |
| 19 | 2, 4 | 20 |
| 20 | 19 | 22, 23 |
| 21 | 6, 7, 8, 9 | - |
| 22 | 20 | - |
| 23 | 20 | - |
| 24 | 21, 22, 23 | - |

### Agent Dispatch Summary
- **Wave 1**: 5 task - `quick` × 5
- **Wave 2**: 5 task - `deep` × 3, `unspecified-high` × 1, `quick` × 1
- **Wave 3**: 5 task - `visual-engineering` × 4, `quick` × 1
- **Wave 4**: 5 task - `visual-engineering` × 1, `unspecified-high` × 2, `quick` × 1, `deep` × 1
- **Wave 5**: 4 task - `oracle` × 1, `unspecified-high` × 1, `deep` × 2, `writing` × 1

---

## TODOs

- [ ] 1. Proje Scaffolding + Tooling Setup

  **What to do**:
  - Stellar CLI ile Soroban workspace oluştur: `stellar contract init traffic-pulse`
  - Next.js 14 App Router projesi kur: `npx create-next-app@latest`
  - Supabase CLI kur ve proje initialize et
  - Package.json dependencies ekle:
    - Contract: `soroban-sdk`, `stellar-xdr`
    - Frontend: `@stellar/freighter-api`, `@stellar/stellar-sdk`, `@creit.tech/stellar-wallets-kit`
    - Dev: `vitest`, `@testing-library/react`, `playwright`
  - TypeScript config, ESLint, Prettier setup
  - .env.example oluştur (CONTRACT_ID, SUPABASE_URL, NETWORK_PASSPHRASE)

  **Must NOT do**:
  - Hardcoded values ekleme
  - Production .env dosyası commit etme

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: [`modern-python`, `typescript`]
  - **Reason**: Standard project setup, no complex logic

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 2, 3, 4, 5)
  - **Blocks**: Tasks 2, 3, 4, 5
  - **Blocked By**: None

  **References**:
  - `https://developers.stellar.org/docs/build/smart-contracts/getting-started/hello-world` - Soroban project init
  - `https://github.com/stellar/soroban-example-dapp` - Full-stack reference structure

  **Acceptance Criteria**:
  - [ ] `cargo test` çalışıyor (empty test suite)
  - [ ] `npm run dev` → localhost:3000 açılıyor
  - [ ] `npx supabase init` başarılı

  **QA Scenarios**:
  ```
  Scenario: Contract build verification
    Tool: Bash
    Steps:
      1. `cd contracts/traffic-pulse && cargo test`
      2. Assert: "test result: ok" output
    Evidence: .sisyphus/evidence/task-1-contract-build.txt

  Scenario: Frontend dev server
    Tool: Bash
    Steps:
      1. `npm run dev &`
      2. `curl http://localhost:3000`
      3. Assert: HTTP 200 + HTML contains "Next.js"
    Evidence: .sisyphus/evidence/task-1-frontend-curl.txt
  ```

  **Commit**: YES (groups with 2, 3, 4, 5)
  - Message: `chore: initial project scaffolding`
  - Pre-commit: `cargo test && npm run test`

---

- [ ] 2. PULSE Token Contract (SAC - Stellar Asset Contract)

  **What to do**:
  - OpenZeppelin Stellar Contracts'tan SAC template al
  - `contracts/pulse-token/src/lib.rs` oluştur
  - Token metadata: name="PULSE", symbol="PLS", decimals=18
  - Initial supply: 1,000,000 PULSE (admin wallet'a)
  - Functions: `mint`, `transfer`, `balance`, `approve`, `allowance`
  - Admin-only minting (committee wallet)
  - Test: mint, transfer, balance queries

  **Must NOT do**:
  - Unlimited minting (cap koy)
  - Admin dışında mint yapamaz

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
  - **Skills**: [`rust`, `property-based-testing`]
  - **Reason**: Smart contract development, token standards

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 1, 3, 4, 5)
  - **Blocks**: Tasks 6, 9
  - **Blocked By**: Task 1

  **References**:
  - `https://github.com/OpenZeppelin/stellar-contracts/tree/main/packages/tokens` - SAC reference
  - `https://developers.stellar.org/docs/build/smart-contracts/tokens` - Token standards

  **Acceptance Criteria**:
  - [ ] Token deploy edilebilir
  - [ ] `mint(admin, 1000000)` çalışıyor
  - [ ] `transfer(alice, bob, 100)` çalışıyor
  - [ ] `balance(alice)` doğru dönüyor
  - [ ] Admin olmayan mint yapamıyor (revert)

  **QA Scenarios**:
  ```
  Scenario: Mint ve transfer happy path
    Tool: Bash (stellar CLI)
    Steps:
      1. `stellar contract invoke --id TOKEN_ID -- mint --to ADMIN --amount 1000000`
      2. `stellar contract invoke --id TOKEN_ID -- --transfer --from ADMIN --to ALICE --amount 100`
      3. `stellar contract invoke --id TOKEN_ID -- --balance --of ALICE`
      4. Assert: balance = 100
    Evidence: .sisyphus/evidence/task-2-token-transfer.txt

  Scenario: Unauthorized mint rejection
    Tool: Bash
    Steps:
      1. Non-admin wallet ile mint dene
      2. Assert: "Transaction failed" + "Unauthorized"
    Evidence: .sisyphus/evidence/task-2-unauthorized-mint.txt
  ```

  **Commit**: YES (groups with 1, 3, 4, 5)
  - Message: `feat(token): PULSE token contract (SAC)`
  - Pre-commit: `cargo test -p pulse-token`

---

- [ ] 3. Supabase Setup + Database Migrations

  **What to do**:
  - Supabase projesi oluştur (testnet)
  - Migration dosyaları yaz:
    - `rounds` (id, start_ts, end_ts, status, commit_hash, reveal_seed, result_bin, created_at)
    - `bets` (id, round_id, wallet, bin_id, amount, tx_hash, ts)
    - `claims` (id, round_id, wallet, payout, tx_hash, ts)
    - `users` (wallet, created_at, last_active_at)
    - `events` (wallet, event_name, round_id, ts)
  - Indexes: `bets(round_id)`, `bets(wallet)`, `rounds(status)`
  - RLS policies (read public, write authenticated)
  - Seed data: test users, test rounds

  **Must NOT do**:
  - Hardcoded credentials
  - Production DB'ye test data

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: [`modern-python`]
  - **Reason**: Database schema design, SQL migrations

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 1, 2, 4, 5)
  - **Blocks**: Tasks 12, 15, 17
  - **Blocked By**: Task 1

  **References**:
  - `https://supabase.com/docs/guides/database/migrations` - Migration best practices
  - TrafficPulse draft - Schema design

  **Acceptance Criteria**:
  - [ ] `npx supabase db push` başarılı
  - [ ] Tüm tablolar oluşturuldu
  - [ ] Foreign keys çalışıyor
  - [ ] RLS policies aktif

  **QA Scenarios**:
  ```
  Scenario: Insert round + bet + query
    Tool: Bash (psql)
    Steps:
      1. `INSERT INTO rounds (...) VALUES (...)`
      2. `INSERT INTO bets (round_id, wallet, bin_id, amount) VALUES (1, 'GABC...', 2, 100)`
      3. `SELECT * FROM bets WHERE round_id = 1`
      4. Assert: 1 row returned
    Evidence: .sisyphus/evidence/task-3-db-insert.txt

  Scenario: RLS policy test
    Tool: Bash
    Steps:
      1. Auth olmadan INSERT dene
      2. Assert: "permission denied"
    Evidence: .sisyphus/evidence/task-3-rls-test.txt
  ```

  **Commit**: YES (groups with 1, 2, 4, 5)
  - Message: `feat(db): Supabase schema + migrations`
  - Pre-commit: `npx supabase db lint`

---

- [ ] 4. Contract Temel Yapı + Round Struct

  **What to do**:
  - `contracts/traffic-pulse/src/lib.rs` oluştur
  - Struct'lar:
    - `Round` (id, start_ts, end_ts, status, commit_hash, bins[5], total_pool, bin_totals[5])
    - `Bet` (round_id, wallet, bin_id, amount)
    - `Committee` (members[3], approvals Map)
  - Enum: `RoundStatus` (OPEN, CLOSED, RESOLVED, FINALIZED)
  - Storage keys: `rounds`, `bets`, `committee`, `pulse_token`
  - Init fonksiyonu: committee addresses + token contract ID
  - Test: struct serialization, storage get/set

  **Must NOT do**:
  - Business logic ekleme (sadece data structures)
  - Hardcoded addresses

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: [`rust`]
  - **Reason**: Soroban contract data structures

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 1, 2, 3, 5)
  - **Blocks**: Tasks 6, 7, 8
  - **Blocked By**: Task 1

  **References**:
  - `https://github.com/stellar/soroban-examples` - Soroban struct patterns
  - Draft - Technical decisions

  **Acceptance Criteria**:
  - [ ] `cargo test` → tüm struct testleri pass
  - [ ] Storage get/set çalışıyor
  - [ ] Serialization/deserialization doğru

  **QA Scenarios**:
  ```
  Scenario: Round storage test
    Tool: Bash (cargo test)
    Steps:
      1. `cargo test test_round_storage -- --nocapture`
      2. Assert: "test result: ok" + round data persisted
    Evidence: .sisyphus/evidence/task-4-round-storage.txt
  ```

  **Commit**: YES (groups with 1, 2, 3, 5)
  - Message: `feat(contract): Round struct + storage setup`
  - Pre-commit: `cargo test -p traffic-pulse`

---

- [ ] 5. Freighter Wallet Integration

  **What to do**:
  - `@stellar/freighter-api` kurulum
  - `lib/wallet.ts` oluştur:
    - `connectWallet()` - Freighter modal aç
    - `disconnectWallet()` - localStorage temizle
    - `getWalletAddress()` - publicKey dön
    - `signTransaction(xdr)` - Transaction imzala
    - `checkNetwork()` - Testnet doğrula
  - React context: `WalletProvider` + `useWallet()` hook
  - UI: Connect/Disconnect button (header'da)
  - HTTPS localhost setup (mkcert veya Next.js config)

  **Must NOT do**:
  - Private key management (Freighter hallediyor)
  - Mainnet support (sadece testnet)

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: [`typescript`, `react-dev`]
  - **Reason**: React wallet integration, TypeScript typing

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 1 (with Tasks 1, 2, 3, 4)
  - **Blocks**: Tasks 12, 13
  - **Blocked By**: Task 1

  **References**:
  - `https://developers.stellar.org/docs/build/guides/freighter/integrate-freighter-react` - Official guide
  - `https://github.com/stellar/soroban-example-dapp` - Reference implementation

  **Acceptance Criteria**:
  - [ ] Connect button → Freighter modal açılıyor
  - [ ] Bağlantı sonrası wallet address görünüyor
  - [ ] Disconnect → localStorage temizleniyor
  - [ ] Transaction signing çalışıyor (test XDR)

  **QA Scenarios**:
  ```
  Scenario: Wallet connect flow
    Tool: Playwright
    Steps:
      1. Navigate to localhost:3000
      2. Click "Connect Wallet"
      3. Freighter modal opens (assert visible)
      4. Mock: setAllowed(true), getAddress() returns "GABC..."
      5. Assert: Button shows "GABC...1234"
    Evidence: .sisyphus/evidence/task-5-wallet-connect.png

  Scenario: Wallet disconnect
    Tool: Playwright
    Steps:
      1. Connect wallet (previous scenario)
      2. Click "Disconnect"
      3. Assert: Button shows "Connect Wallet"
      4. Assert: localStorage empty
    Evidence: .sisyphus/evidence/task-5-wallet-disconnect.png
  ```

  **Commit**: YES (groups with 1, 2, 3, 4)
  - Message: `feat(wallet): Freighter integration + React context`
  - Pre-commit: `npm run test -- wallet`

---

- [ ] 6. create_round + place_bet Fonksiyonları

  **What to do**:
  - `create_round(commit_hash: BytesN<32>, start_ts: u64, duration_minutes: u32)`:
    - Validate: caller in committee (require_auth)
    - Generate round_id (incremental counter)
    - Create Round struct: status=OPEN, bins=[0;5], bin_totals=[0;5]
    - Store: `env.storage().instance().set(&round_id, &round)`
    - Emit event: `env.events().publish((symbol_short!("round_new"), round_id, start_ts, start_ts + duration*60))`
  - `place_bet(env: Env, round_id: u32, bin_id: u32, amount: i128)`:
    - Validate: round.status == OPEN
    - Validate: current_ts < end_ts - 180 (3 min sniping prevention)
    - Validate: bin_id < 5
    - require_auth() on bettor address
    - Token transfer: `pulse_token.transfer(bettor, contract_address, amount)`
    - Update: `round.bin_totals[bin_id] += amount`, `round.total_pool += amount`
    - Store bet: `bets.push_back(Bet { round_id, wallet: bettor, bin_id, amount })`
    - Emit event: `(symbol_short!("bet"), round_id, bettor, bin_id, amount)`
  - Test: create round, place bet, entry window closed, invalid bin, insufficient balance

  **Must NOT do**:
  - Closed round'a bet kabul etme
  - Son 3 dakika içinde bet kabul etme
  - Invalid bin_id kabul etme

  **Recommended Agent Profile**:
  - **Category**: `deep`
  - **Skills**: [`property-based-testing`]
  - **Reason**: Smart contract business logic, edge cases

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with 7, 8, 9, 10)
  - **Blocks**: 9, 11
  - **Blocked By**: 2, 4

  **References**:
  - Task 2: PULSE token contract (transfer function)
  - Task 4: Round struct definition

  **Acceptance Criteria**:
  - [ ] create_round → round persisted in storage
  - [ ] place_bet → token transferred, bin_totals updated
  - [ ] Closed round → panic "Round not open"
  - [ ] Last 3 minutes → panic "Entry window closed"
  - [ ] Invalid bin → panic "Invalid bin"
  - [ ] Insufficient balance → panic (from token transfer)

  **QA Scenarios**:
  ```
  Scenario: Create round + place bet (happy path)
    Tool: Bash (cargo test)
    Steps:
      1. env = Env::default(), commit_hash = [0x42; 32]
      2. TrafficPulseContract::create_round(&env, commit_hash, now, 10)
      3. TrafficPulseContract::place_bet(&env, 1, 2, 100)
      4. let round = env.storage().instance().get(&1)
      5. assert_eq!(round.bin_totals[2], 100)
      6. assert_eq!(round.total_pool, 100)
    Evidence: .sisyphus/evidence/task-6-happy-path.txt

  Scenario: Entry window closed (sniping prevention)
    Tool: Bash (cargo test)
    Steps:
      1. create_round with end_ts = now + 120 (2 minutes)
      2. place_bet(round_id=1, bin_id=2, amount=100)
      3. Assert: panic with "Entry window closed"
    Evidence: .sisyphus/evidence/task-6-entry-closed.txt
  ```

  **Commit**: YES (groups with 7)
  - Message: `feat(contract): create_round + place_bet`
  - Pre-commit: `cargo test -p traffic-pulse -- create_round place_bet`

---

- [ ] 7. Commit-Reveal Implementation

  **What to do**:
  - Commit phase (in create_round):
    - Generate: `seed = random_bytes(32)` (off-chain backend)
    - Compute: `commit_hash = sha256(seed || round_id_bytes)`
    - Store in Round: `round.commit_hash = commit_hash`
  - `reveal_seed(env: Env, round_id: u32, seed: BytesN<32>)`:
    - Validate: caller in committee (require_auth)
    - Validate: round.status == CLOSED (betting ended)
    - Verify: `sha256(seed || round_id_bytes) == round.commit_hash`
    - Compute: `result_bin = sha256(seed)[0] % 5`
    - Update: `round.reveal_seed = seed`, `round.result_bin = result_bin`, `round.status = RESOLVED`
    - Emit event: `(symbol_short!("reveal"), round_id, result_bin)`
  - Test: valid reveal, invalid hash, early reveal

  **Must NOT do**:
  - Seed'i round bitmeden reveal etme
  - Invalid hash kabul etme
  - Result'ı seed olmadan hesaplama

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
  - **Skills**: [`property-based-testing`]
  - **Reason**: Cryptographic verification, security-critical

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with 6, 8, 9, 10)
  - **Blocks**: 8
  - **Blocked By**: 4

  **References**:
  - `https://developers.stellar.org/docs/build/smart-contracts/getting-started/storing-data` - Soroban storage
  - Commit-reveal pattern research

  **Acceptance Criteria**:
  - [ ] commit_hash stored in round
  - [ ] reveal_seed → hash verification passes
  - [ ] Invalid seed → panic "Hash mismatch"
  - [ ] result_bin in [0..4]
  - [ ] Event emitted correctly

  **QA Scenarios**:
  ```
  Scenario: Valid commit-reveal flow
    Tool: Bash (cargo test)
    Steps:
      1. seed = BytesN::from_array(&env, [0x42; 32])
      2. commit_hash = sha256(seed || round_id.to_bytes())
      3. create_round(commit_hash, ...)
      4. reveal_seed(round_id=1, seed)
      5. let round = storage.get(&1)
      6. assert_eq!(round.reveal_seed, seed)
      7. assert_eq!(round.result_bin, computed_bin)
    Evidence: .sisyphus/evidence/task-7-commit-reveal.txt

  Scenario: Invalid seed rejection
    Tool: Bash (cargo test)
    Steps:
      1. create_round with commit_hash = sha256(real_seed)
      2. reveal_seed(round_id=1, fake_seed)
      3. Assert: panic "Hash mismatch"
    Evidence: .sisyphus/evidence/task-7-invalid-seed.txt
  ```

  **Commit**: YES (groups with 6)
  - Message: `feat(contract): commit-reveal pattern`
  - Pre-commit: `cargo test -p traffic-pulse -- reveal`

---

- [ ] 8. Multi-sig Committee Approval

  **What to do**:
  - Init: `set_committee(env: Env, members: Vec<Address>)` (owner only)
  - Storage: `approvals: Map<(u32, u32), Map<Address, bool>>` (round_id, result_bin) → (member → approved)
  - `approve_result(env: Env, round_id: u32, result_bin: u32)`:
    - Validate: caller in committee (require_auth)
    - Validate: round.status == RESOLVED
    - Set: `approvals[(round_id, result_bin)][caller] = true`
    - Emit event: `(symbol_short!("approve"), round_id, result_bin, caller)`
  - `get_approval_count(env: Env, round_id: u32, result_bin: u32) -> u32`
  - Test: approval, duplicate approval (idempotent), non-member rejection

  **Must NOT do**:
  - Committee dışı onay kabul etme
  - Aynı üye 2. onayı (idempotent olmalı)
  - RESOLVED olmayan round'u approve etme

  **Recommended Agent Profile**:
  - **Category**: `deep`
  - **Skills**: [`property-based-testing`]
  - **Reason**: Multi-party coordination, state machine

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with 6, 7, 9, 10)
  - **Blocks**: 9
  - **Blocked By**: 6, 7

  **References**:
  - Task 4: Committee struct
  - `https://developers.stellar.org/docs/learn/fundamentals/transactions/signatures-multisig`

  **Acceptance Criteria**:
  - [ ] Committee member can approve
  - [ ] Non-member → panic "Not authorized"
  - [ ] Duplicate approval → no-op (count still 1)
  - [ ] get_approval_count returns correct count
  - [ ] Event emitted

  **QA Scenarios**:
  ```
  Scenario: 2/3 approvals
    Tool: Bash (cargo test)
    Steps:
      1. committee = [A, B, C]
      2. A.approve_result(round_id=1, result_bin=2)
      3. B.approve_result(round_id=1, result_bin=2)
      4. count = get_approval_count(1, 2)
      5. assert_eq!(count, 2)
    Evidence: .sisyphus/evidence/task-8-approvals.txt

  Scenario: Unauthorized approval
    Tool: Bash (cargo test)
    Steps:
      1. D (non-committee).approve_result(1, 2)
      2. Assert: panic "Not authorized"
    Evidence: .sisyphus/evidence/task-8-unauthorized.txt
  ```

  **Commit**: YES (groups with 9)
  - Message: `feat(contract): multi-sig committee approval`
  - Pre-commit: `cargo test -p traffic-pulse -- approve`

---

- [ ] 9. finalize_result + Payout Calculation

  **What to do**:
  - `finalize_result(env: Env, round_id: u32)`:
    - Validate: get_approval_count(round_id, result_bin) >= 2
    - Validate: round.status == RESOLVED
    - Update: round.status = FINALIZED
    - Calculate:
      - `net_pool = round.total_pool * 97 / 100` (3% house fee)
      - `winning_total = round.bin_totals[round.result_bin]`
      - For each bet in winning bin:
        - `payout = bet.amount * net_pool / winning_total`
        - `claimable[(round_id, bettor)] += payout`
    - Emit event: `(symbol_short!("finalize"), round_id, result_bin, net_pool)`
  - Test: payout calculation, house fee, zero winning bets

  **Must NOT do**:
  - 2 approvals olmadan finalize
  - Double finalize (idempotent check)
  - House fee hesaplama hatası

  **Recommended Agent Profile**:
  - **Category**: `deep`
  - **Skills**: [`property-based-testing`]
  - **Reason**: Financial calculations, precision critical

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with 6, 7, 8, 10)
  - **Blocks**: 10, 11
  - **Blocked By**: 6, 8

  **References**:
  - Task 2: PULSE token
  - Task 6: Bet storage

  **Acceptance Criteria**:
  - [ ] 2 approvals → finalize successful
  - [ ] 1 approval → panic "Insufficient approvals"
  - [ ] House fee = 3% correctly calculated
  - [ ] Winning bets have claimable balance
  - [ ] Losing bets have 0 claimable

  **QA Scenarios**:
  ```
  Scenario: Payout distribution
    Tool: Bash (cargo test)
    Steps:
      1. Setup: total_pool=1000, bin_totals[2]=500 (winning)
      2. Bets: Alice=200, Bob=300 in bin 2
      3. net_pool = 1000 * 97 / 100 = 970
      4. finalize_result(1)
      5. assert_eq!(claimable[(1, Alice)], 200 * 970 / 500 = 388)
      6. assert_eq!(claimable[(1, Bob)], 300 * 970 / 500 = 582)
    Evidence: .sisyphus/evidence/task-9-payout.txt

  Scenario: Insufficient approvals
    Tool: Bash (cargo test)
    Steps:
      1. Only 1 approval for round 1
      2. finalize_result(1)
      3. Assert: panic "Insufficient approvals"
    Evidence: .sisyphus/evidence/task-9-insufficient.txt
  ```

  **Commit**: YES (groups with 8)
  - Message: `feat(contract): finalize_result + payout`
  - Pre-commit: `cargo test -p traffic-pulse -- finalize`

---

- [ ] 10. claim Fonksiyonu

  **What to do**:
  - `claim(env: Env, round_id: u32)`:
    - Validate: round.status == FINALIZED
    - Lookup: `amount = claimable[(round_id, caller)]`
    - Validate: amount > 0
    - Transfer: `pulse_token.transfer(contract_address, caller, amount)`
    - Update: `claimable[(round_id, caller)] = 0` (double-claim prevention)
    - Store: `claims.push_back(Claim { round_id, wallet: caller, payout: amount })`
    - Emit event: `(symbol_short!("claim"), round_id, caller, amount)`
  - Test: claim success, double-claim, no balance, not finalized

  **Must NOT do**:
  - FINALIZED olmayan round'dan claim
  - Double claim (aynı round'dan 2. claim)
  - 0 balance claim

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: [`property-based-testing`]
  - **Reason**: Simple transfer logic

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 2 (with 6, 7, 8, 9)
  - **Blocks**: 11
  - **Blocked By**: 9

  **References**:
  - Task 2: PULSE token transfer
  - Task 9: Claimable balance

  **Acceptance Criteria**:
  - [ ] Claim successful, tokens transferred
  - [ ] Double claim → panic "Already claimed"
  - [ ] 0 balance → panic "No claimable balance"
  - [ ] Not finalized → panic "Round not finalized"
  - [ ] Claim record stored

  **QA Scenarios**:
  ```
  Scenario: Happy path claim
    Tool: Bash (cargo test)
    Steps:
      1. finalize_result(round_id=1)
      2. Alice.claim(1)
      3. assert_eq!(alice_balance, initial + 388)
      4. assert_eq!(claimable[(1, Alice)], 0)
    Evidence: .sisyphus/evidence/task-10-claim.txt

  Scenario: Double claim prevention
    Tool: Bash (cargo test)
    Steps:
      1. Alice.claim(1) (first time) → success
      2. Alice.claim(1) (second time)
      3. Assert: panic "Already claimed"
    Evidence: .sisyphus/evidence/task-10-double-claim.txt
  ```

  **Commit**: YES (groups with 6, 7, 8, 9)
  - Message: `feat(contract): claim rewards`
  - Pre-commit: `cargo test -p traffic-pulse -- claim`

---

- [ ] 11. Contract Client Wrappers + TypeScript Bindings

  **What to do**:
  - `stellar contract bindings typescript` ile ABI generate et:
    - `--contract-id CONTRACT_ID`
    - `--output-dir lib/contracts`
    - `--network testnet`
  - `lib/contracts/` altında generated types:
    - `TrafficPulseClient` - Contract method wrappers
    - Type definitions for Round, Bet, etc.
  - `lib/contract-client.ts` oluştur:
    - `createRound(commitHash, startTime, duration)` wrapper
    - `placeBet(roundId, binId, amount)` wrapper
    - `claim(roundId)` wrapper
    - `getRound(roundId)` - read-only query
    - `getClaimable(roundId, wallet)` - read-only query
  - Error handling: Contract error → User-friendly message mapping
  - Test: contract calls with mocked responses

  **Must NOT do**:
  - Hardcoded contract IDs (use .env)
  - Direct SDK calls in components (use wrappers)

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: [`typescript`]
  - **Reason**: TypeScript type generation, wrapper functions

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3 (with 12, 13, 14, 15)
  - **Blocks**: 12, 13, 14, 16
  - **Blocked By**: 6, 9, 10

  **References**:
  - `https://developers.stellar.org/docs/build/tools/soroban-cli/contract-bindings` - TypeScript bindings
  - Task 6-10: Contract functions

  **Acceptance Criteria**:
  - [ ] `stellar contract bindings typescript` successful
  - [ ] Generated types compile without errors
  - [ ] Wrapper functions work with test contract
  - [ ] Error messages user-friendly

  **QA Scenarios**:
  ```
  Scenario: placeBet wrapper function
    Tool: Bash (vitest)
    Steps:
      1. const client = new TrafficPulseClient(CONTRACT_ID, network)
      2. await client.placeBet({ roundId: 1, binId: 2, amount: 100n })
      3. Assert: transaction submitted successfully
    Evidence: .sisyphus/evidence/task-11-wrapper.txt
  ```

  **Commit**: YES (groups with 12)
  - Message: `feat(client): TypeScript contract bindings`
  - Pre-commit: `npm run test -- contract-client`

---

- [ ] 12. Round Listesi + Detay Sayfası

  **What to do**:
  - `app/rounds/page.tsx` - Round listesi:
    - Fetch active rounds from Supabase (`SELECT * FROM rounds WHERE status = 'OPEN'`)
    - Grid layout: her round bir card
    - Card info: round ID, time remaining, total pool, bet count
    - Filter: Active / Closed / My Rounds
  - `app/rounds/[id]/page.tsx` - Round detay:
    - Fetch round details + bets from Supabase
    - Display: bins (0-20, 21-40, etc.), current stakes per bin
    - "Place Bet" button (opens modal)
    - Sentiment bar (Task 13)
    - Live countdown timer (Task 14)
  - Polling: 30 saniyede bir rounds'u refresh et
  - Loading states: Skeleton loaders
  - Error states: Retry button

  **Must NOT do**:
  - Direct contract calls (use wrappers)
  - Hardcoded round data

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
  - **Skills**: [`react-dev`, `typescript`]
  - **Reason**: Next.js pages, data fetching, UI components

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3 (with 11, 13, 14, 15)
  - **Blocks**: -
  - **Blocked By**: 3, 11

  **References**:
  - `https://github.com/stellar/soroban-example-dapp` - Reference UI
  - Task 3: Supabase schema

  **Acceptance Criteria**:
  - [ ] Round listesi görünüyor
  - [ ] Round detay sayfası çalışıyor
  - [ ] Polling her 30 saniyede refresh ediyor
  - [ ] Loading skeleton görünüyor
  - [ ] Error state'de retry button var

  **QA Scenarios**:
  ```
  Scenario: Round listesi renders
    Tool: Playwright
    Steps:
      1. Navigate to /rounds
      2. Wait for network idle
      3. Assert: At least 1 round card visible
      4. Assert: Card shows round ID, pool size, timer
    Evidence: .sisyphus/evidence/task-12-round-list.png

  Scenario: Round detail page
    Tool: Playwright
    Steps:
      1. Navigate to /rounds/1
      2. Assert: Round details visible
      3. Assert: 5 bins displayed
      4. Assert: "Place Bet" button enabled
    Evidence: .sisyphus/evidence/task-12-round-detail.png
  ```

  **Commit**: YES (groups with 11)
  - Message: `feat(ui): round list + detail pages`
  - Pre-commit: `npm run test -- rounds`

---

- [ ] 13. Bet Placement UI + Sentiment Bar

  **What to do**:
  - `components/BetModal.tsx`:
    - Bin selection: 5 buttons (0-20, 21-40, 41-60, 61-80, 81+)
    - Stake input: Number input with min/max validation
    - "Confirm Bet" button (triggers wallet sign)
    - Success/error toast notifications
  - `components/SentimentBar.tsx`:
    - Horizontal bar, 5 segments (color-coded)
    - Width proportional to stake percentage
    - Tooltip: bin range + stake amount + percentage
    - Colors: Blue (0-20), Green (21-40), Yellow (41-60), Orange (61-80), Red (81+)
  - Real-time updates: WebSocket veya 10 saniye polling
  - Wallet connection check: Connect wallet before betting

  **Must NOT do**:
  - Invalid stake amounts kabul etme
  - Wallet bağlı değilken bet etmeye izin verme

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
  - **Skills**: [`react-dev`, `typescript`]
  - **Reason**: Interactive UI components, real-time updates

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3 (with 11, 12, 14, 15)
  - **Blocks**: -
  - **Blocked By**: 5, 11

  **References**:
  - Task 5: Wallet integration
  - `https://github.com/stellar/soroban-example-dapp` - UI reference

  **Acceptance Criteria**:
  - [ ] Bin selection working
  - [ ] Stake input validation (min 1, max balance)
  - [ ] Sentiment bar renders with correct proportions
  - [ ] Wallet not connected → show connect prompt
  - [ ] Bet successful → toast notification

  **QA Scenarios**:
  ```
  Scenario: Place bet flow
    Tool: Playwright
    Steps:
      1. Navigate to /rounds/1
      2. Click "Place Bet"
      3. Select bin "41-60"
      4. Enter stake: 100
      5. Click "Confirm Bet"
      6. Mock: wallet.signTransaction() resolves
      7. Assert: Success toast "Bet placed!"
      8. Assert: Sentiment bar updates
    Evidence: .sisyphus/evidence/task-13-place-bet.png

  Scenario: Wallet not connected
    Tool: Playwright
    Steps:
      1. Navigate to /rounds/1 (wallet disconnected)
      2. Click "Place Bet"
      3. Assert: Modal shows "Connect wallet first"
      4. Click "Connect Wallet"
      5. Assert: Redirects to wallet connection
    Evidence: .sisyphus/evidence/task-13-wallet-prompt.png
  ```

  **Commit**: YES (groups with 12)
  - Message: `feat(ui): bet modal + sentiment bar`
  - Pre-commit: `npm run test -- bet`

---

- [ ] 14. Live Counter + Timer

  **What to do**:
  - `components/LiveCounter.tsx`:
    - Display: "X vehicles passed" (simulated count)
    - Increment animation: her 2-5 saniye +1
    - Traffic simulation: Poisson process (lambda = intensity)
    - Intensity modes: Morning (low), Rush (high), Night (very low)
  - `components/CountdownTimer.tsx`:
    - Display: "Entry closes in: 07:23" (MM:SS)
    - Update: her saniye
    - Color change: Last 3 minutes → red
    - Expiry: "Entry closed" message
  - Backend API: `GET /api/rounds/:id/simulation` - current count
  - Polling: 5 saniyede bir count fetch

  **Must NOT do**:
  - Hardcoded count values
  - Client-side only timer (server time kullan)

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
  - **Skills**: [`react-dev`]
  - **Reason**: Real-time UI, animations

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3 (with 11, 12, 13, 15)
  - **Blocks**: -
  - **Blocked By**: 11

  **References**:
  - Task 18: Traffic simulation backend

  **Acceptance Criteria**:
  - [ ] Counter increments realistically
  - [ ] Timer counts down correctly
  - [ ] Last 3 minutes → red color
  - [ ] Entry closed → disabled betting

  **QA Scenarios**:
  ```
  Scenario: Timer countdown
    Tool: Playwright
    Steps:
      1. Navigate to /rounds/1
      2. Record timer: "07:00"
      3. Wait 10 seconds
      4. Assert: Timer shows "06:50" (±1s)
    Evidence: .sisyphus/evidence/task-14-timer.gif

  Scenario: Last 3 minutes warning
    Tool: Playwright
    Steps:
      1. Mock: round ends in 180 seconds
      2. Assert: Timer turns red
      3. Assert: "Closing soon" warning visible
    Evidence: .sisyphus/evidence/task-14-warning.png
  ```

  **Commit**: YES (groups with 12)
  - Message: `feat(ui): live counter + countdown timer`
  - Pre-commit: `npm run test -- timer`

---

- [ ] 15. Leaderboard + Profile Sayfası

  **What to do**:
  - `app/leaderboard/page.tsx`:
    - Query: `SELECT wallet, SUM(payout) as total_earned FROM claims GROUP BY wallet ORDER BY total_earned DESC LIMIT 50`
    - Table: Rank, Wallet (shortened), Total Earned, Wins, Win Rate
    - Highlight: Current user row (if in top 50)
  - `app/profile/[wallet]/page.tsx`:
    - Query: User stats (total staked, total earned, win rate, streak)
    - Bet history: Table with round ID, bin, amount, result (win/loss), payout
    - Badge placeholders: "Rush Prophet", "Contrarian" (MVP sonrası için disabled)
  - Wallet shortening: `GABC...1234` format
  - Copy to clipboard: Click wallet → copy full address

  **Must NOT do**:
  - Real-time leaderboard (cache 1 dakika)
  - Badge logic (MVP'de sadece UI placeholder)

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
  - **Skills**: [`react-dev`, `typescript`]
  - **Reason**: Data tables, profile UI

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 3 (with 11, 12, 13, 14)
  - **Blocks**: -
  - **Blocked By**: 3, 11

  **References**:
  - Task 3: Supabase schema

  **Acceptance Criteria**:
  - [ ] Leaderboard shows top 50 users
  - [ ] Profile page shows user stats
  - [ ] Bet history table renders correctly
  - [ ] Wallet shortening works
  - [ ] Copy to clipboard functional

  **QA Scenarios**:
  ```
  Scenario: Leaderboard renders
    Tool: Playwright
    Steps:
      1. Navigate to /leaderboard
      2. Wait for data load
      3. Assert: Table with 50 rows visible
      4. Assert: Columns: Rank, Wallet, Earned, Wins, Win Rate
    Evidence: .sisyphus/evidence/task-15-leaderboard.png

  Scenario: Profile page
    Tool: Playwright
    Steps:
      1. Navigate to /profile/GABC...1234
      2. Assert: User stats visible (staked, earned, win rate)
      3. Assert: Bet history table populated
    Evidence: .sisyphus/evidence/task-15-profile.png
  ```

  **Commit**: YES (groups with 12)
  - Message: `feat(ui): leaderboard + profile`
  - Pre-commit: `npm run test -- leaderboard`

---

- [ ] 16. Admin Panel - Committee Approval UI

  **What to do**:
  - `app/admin/page.tsx` - Admin dashboard:
    - Auth check: Only committee wallets can access
    - List: Rounds awaiting approval (status = RESOLVED)
    - Actions: Approve button per round
  - `components/ApproveRoundModal.tsx`:
    - Display: Round ID, revealed seed, result_bin
    - Verify: `sha256(seed || round_id) == commit_hash` (auto-verify)
    - "Approve Result" button
    - Show: Current approval count (X/2 needed)
  - `lib/admin-auth.ts`:
    - Check: connected wallet in committee list
    - Redirect: non-committee to 403 page
  - API: `POST /api/admin/approve` - Submit approval

  **Must NOT do**:
  - Non-committee access
  - Approve without seed verification

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
  - **Skills**: [`react-dev`, `typescript`]
  - **Reason**: Admin UI, auth checks

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 4 (with 17, 18, 19, 20)
  - **Blocks**: -
  - **Blocked By**: 8, 11

  **References**:
  - Task 8: Multi-sig approval
  - Task 5: Wallet auth

  **Acceptance Criteria**:
  - [ ] Only committee can access /admin
  - [ ] Rounds awaiting approval listed
  - [ ] Approve button works
  - [ ] Approval count updates

  **QA Scenarios**:
  ```
  Scenario: Committee member approves
    Tool: Playwright
    Steps:
      1. Connect wallet (committee member A)
      2. Navigate to /admin
      3. Click "Approve" on round 1
      4. Assert: Success "Approval submitted"
      5. Assert: Count shows "1/2 approvals"
    Evidence: .sisyphus/evidence/task-16-approve.png

  Scenario: Non-committee access denied
    Tool: Playwright
    Steps:
      1. Connect wallet (non-committee)
      2. Navigate to /admin
      3. Assert: Redirected to 403 page
    Evidence: .sisyphus/evidence/task-16-denied.png
  ```

  **Commit**: YES (groups with 17)
  - Message: `feat(admin): committee approval panel`
  - Pre-commit: `npm run test -- admin`

---

- [ ] 17. API Routes - Indexer + Analytics

  **What to do**:
  - `app/api/rounds/route.ts` - GET all rounds:
    - Query Supabase: `SELECT * FROM rounds ORDER BY start_ts DESC`
    - Include: bet_count, total_pool (aggregated)
  - `app/api/rounds/[id]/route.ts` - GET round details:
    - Query: Round + all bets
    - Include: bin_totals, claimable per user
  - `app/api/leaderboard/route.ts` - GET leaderboard:
    - Query: Aggregated user stats
    - Cache: 60 seconds (revalidate)
  - `app/api/indexer/sync/route.ts` - Contract event indexer:
    - Poll Soroban RPC for new events
    - Insert: bets, claims into Supabase
    - Run: Every 30 seconds (cron)
  - Rate limiting: 100 requests/minute per IP

  **Must NOT do**:
  - Direct contract queries in frontend (use API)
  - Uncached leaderboard queries

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
  - **Skills**: [`typescript`]
  - **Reason**: Next.js API routes, data aggregation

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 4 (with 16, 18, 19, 20)
  - **Blocks**: 12, 15
  - **Blocked By**: 3

  **References**:
  - Task 3: Supabase schema
  - `https://developers.stellar.org/docs/build/data/indexing-events` - Event indexing

  **Acceptance Criteria**:
  - [ ] GET /api/rounds returns data
  - [ ] GET /api/rounds/1 includes bets
  - [ ] GET /api/leaderboard cached
  - [ ] Indexer syncs events every 30s

  **QA Scenarios**:
  ```
  Scenario: API rounds endpoint
    Tool: Bash (curl)
    Steps:
      1. curl http://localhost:3000/api/rounds
      2. Assert: HTTP 200
      3. Assert: JSON array with rounds
    Evidence: .sisyphus/evidence/task-17-api-rounds.json

  Scenario: Rate limiting
    Tool: Bash
    Steps:
      1. Send 101 requests in 1 minute
      2. Assert: 101st request returns 429
    Evidence: .sisyphus/evidence/task-17-rate-limit.txt
  ```

  **Commit**: YES (groups with 16)
  - Message: `feat(api): indexer + analytics routes`
  - Pre-commit: `npm run test -- api`

---

- [ ] 18. Traffic Simulation Backend

  **What to do**:
  - `lib/simulation/poisson.ts` - Poisson process:
    - Input: intensity (lambda), duration_seconds
    - Output: Array of timestamps when vehicles pass
    - Formula: `P(k events in t) = (lambda*t)^k * e^(-lambda*t) / k!`
  - Intensity modes:
    - Morning: lambda = 2 vehicles/minute
    - Rush: lambda = 8 vehicles/minute
    - Night: lambda = 0.5 vehicles/minute
  - `app/api/simulation/[roundId]/route.ts`:
    - GET: current vehicle count
    - Store: generated timestamps in Redis/Supabase
    - Commit-reveal: hash of simulation seed at round start
  - Reveal: After round ends, publish seed for verification

  **Must NOT do**:
  - Predictable patterns (must be random)
  - Post-round manipulation (commit first)

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
  - **Skills**: [`property-based-testing`]
  - **Reason**: Random number generation, statistical distributions

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 4 (with 16, 17, 19, 20)
  - **Blocks**: 14
  - **Blocked By**: -

  **References**:
  - Poisson process theory
  - Task 7: Commit-reveal pattern

  **Acceptance Criteria**:
  - [ ] Poisson distribution correct (chi-square test)
  - [ ] Different intensities produce different rates
  - [ ] Commit hash published before round starts
  - [ ] Seed revealed after round ends

  **QA Scenarios**:
  ```
  Scenario: Poisson simulation
    Tool: Bash (vitest)
    Steps:
      1. generateSimulation(lambda=5, duration=600)
      2. Count events in 10 intervals
      3. Assert: Mean ≈ 50, Variance ≈ 50
    Evidence: .sisyphus/evidence/task-18-poisson.txt

  Scenario: Commit-reveal simulation
    Tool: Bash
    Steps:
      1. Generate seed, publish hash
      2. Run simulation
      3. Reveal seed
      4. Verify: hash matches, simulation reproducible
    Evidence: .sisyphus/evidence/task-18-commit-reveal.txt
  ```

  **Commit**: YES (groups with 19)
  - Message: `feat(simulation): traffic Poisson process`
  - Pre-commit: `npm run test -- simulation`

---

- [ ] 19. Deployment Scripts + .env Config

  **What to do**:
  - `scripts/deploy-contract.sh`:
    - Build: `cargo build --target wasm32v1-none --release`
    - Deploy: `stellar contract deploy --wasm target/wasm32v1-none/release/traffic_pulse.wasm`
    - Save: Contract ID to `.env.local`
  - `scripts/init-token.sh`:
    - Deploy PULSE token
    - Mint initial supply to admin
    - Set contract address in TrafficPulse contract
  - `scripts/setup-committee.sh`:
    - Call `set_committee([A, B, C])`
    - Verify on-chain
  - `.env.example`:
    - CONTRACT_ID=
    - TOKEN_ID=
    - SUPABASE_URL=
    - SUPABASE_KEY=
    - NETWORK_PASSPHRASE="Test SDF Network ; September 2015"
  - `README.md`: Setup instructions

  **Must NOT do**:
  - .env dosyasını commit etme
  - Mainnet credentials

  **Recommended Agent Profile**:
  - **Category**: `quick`
  - **Skills**: [`modern-python`]
  - **Reason**: Shell scripts, deployment automation

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 4 (with 16, 17, 18, 20)
  - **Blocks**: 20
  - **Blocked By**: 2, 4, 8

  **References**:
  - `https://developers.stellar.org/docs/build/tools/soroban-cli/deploy` - Contract deployment
  - Task 2, 4, 8: Contract setup

  **Acceptance Criteria**:
  - [ ] deploy-contract.sh successful
  - [ ] init-token.sh mints tokens
  - [ ] setup-committee.sh sets members
  - [ ] .env.example has all variables

  **QA Scenarios**:
  ```
  Scenario: Full deployment
    Tool: Bash
    Steps:
      1. ./scripts/deploy-contract.sh
      2. ./scripts/init-token.sh
      3. ./scripts/setup-committee.sh
      4. Verify: Contract deployed, committee set
    Evidence: .sisyphus/evidence/task-19-deploy.txt
  ```

  **Commit**: YES (groups with 20)
  - Message: `chore: deployment scripts + config`
  - Pre-commit: `bash scripts/deploy-contract.sh --dry-run`

---

- [ ] 20. E2E Test Suite (Playwright)

  **What to do**:
  - `e2e/full-flow.spec.ts` - Complete user journey:
    - Connect wallet
    - Place bet on round
    - Wait for round end (mocked time)
    - Committee approves (mocked)
    - Claim rewards
    - Verify balance increased
  - `e2e/admin-flow.spec.ts` - Admin actions:
    - Create round
    - Reveal seed
    - Approve result
  - `e2e/leaderboard.spec.ts` - Leaderboard updates:
    - Multiple bets → leaderboard updates
  - Mocking:
    - Time acceleration (skip 10 min wait)
    - Contract responses (deterministic)
  - Screenshots: Her önemli adımda
  - Video: Full test run

  **Must NOT do**:
  - Flaky tests (network timeouts)
  - Hardcoded wallet addresses (use test accounts)

  **Recommended Agent Profile**:
  - **Category**: `deep`
  - **Skills**: [`e2e-testing-patterns`]
  - **Reason**: E2E testing, Playwright

  **Parallelization**:
  - **Can Run In Parallel**: YES
  - **Parallel Group**: Wave 4 (with 16, 17, 18, 19)
  - **Blocks**: 22, 23
  - **Blocked By**: 12, 13, 15, 16, 19

  **References**:
  - `https://playwright.dev/docs/intro` - Playwright docs
  - Task 12-16: UI components

  **Acceptance Criteria**:
  - [ ] full-flow.spec.ts passes
  - [ ] admin-flow.spec.ts passes
  - [ ] leaderboard.spec.ts passes
  - [ ] No flaky tests (3/3 passes)
  - [ ] Screenshots captured

  **QA Scenarios**:
  ```
  Scenario: Complete user journey
    Tool: Playwright
    Steps:
      1. Run: npx playwright test e2e/full-flow.spec.ts
      2. Assert: All steps pass
      3. Assert: Video recorded
      4. Assert: 5+ screenshots captured
    Evidence: .sisyphus/evidence/task-20-e2e-video.mp4
  ```

  **Commit**: YES (groups with 19)
  - Message: `test: E2E test suite`
  - Pre-commit: `npx playwright test --reporter=list`

---

## Final Verification Wave

- [ ] F1. **Plan Compliance Audit** — `oracle`

  Read the plan end-to-end. For each "Must Have": verify implementation exists (read file, curl endpoint, run command). For each "Must NOT Have": search codebase for forbidden patterns — reject with file:line if found. Check evidence files exist in .sisyphus/evidence/. Compare deliverables against plan.

  Output: `Must Have [8/8] | Must NOT Have [8/8] | Tasks [24/24] | VERDICT: APPROVE/REJECT`

- [ ] F2. **Code Quality Review** — `unspecified-high`

  Run `tsc --noEmit` + linter + `npm test`. Review all changed files for: `as any`/`@ts-ignore`, empty catches, console.log in prod, commented-out code, unused imports. Check AI slop: excessive comments, over-abstraction, generic names (data/result/item/temp).

  Output: `Build [PASS/FAIL] | Lint [PASS/FAIL] | Tests [N pass/N fail] | Files [N clean/N issues] | VERDICT`

- [ ] F3. **Real Manual QA** — `unspecified-high` (+ `playwright` skill if UI)

  Start from clean state. Execute EVERY QA scenario from EVERY task — follow exact steps, capture evidence. Test cross-task integration (features working together, not isolation). Test edge cases: empty state, invalid input, rapid actions. Save to `.sisyphus/evidence/final-qa/`.

  Output: `Scenarios [N/N pass] | Integration [N/N] | Edge Cases [N tested] | VERDICT`

- [ ] F4. **Scope Fidelity Check** — `deep`

  For each task: read "What to do", read actual diff (git log/diff). Verify 1:1 — everything in spec was built (no missing), nothing beyond spec was built (no creep). Check "Must NOT do" compliance. Detect cross-task contamination: Task N touching Task M's files. Flag unaccounted changes.

  Output: `Tasks [24/24 compliant] | Contamination [CLEAN/N issues] | Unaccounted [CLEAN/N files] | VERDICT`

---

## Commit Strategy

- **Wave 1** (Tasks 1-5): `chore: initial project setup` — contracts/, app/, supabase/, lib/wallet.ts
- **Wave 2** (Tasks 6-10): `feat(contract): core business logic` — contracts/traffic-pulse/src/lib.rs
- **Wave 3** (Tasks 11-15): `feat(ui): betting interface` — app/rounds/, components/, lib/contracts/
- **Wave 4** (Tasks 16-20): `feat(admin): admin panel + E2E` — app/admin/, app/api/, e2e/, scripts/
- **Wave 5** (F1-F4): `chore: final verification` — .sisyphus/evidence/

---

## Success Criteria

### Verification Commands
```bash
cargo test -p traffic-pulse        # Expected: all contract tests pass
npm run test                       # Expected: all frontend tests pass
npx playwright test                # Expected: all E2E tests pass
stellar contract invoke --id CONTRACT_ID -- get_round --round-id 1  # Expected: round data
curl http://localhost:3000/api/rounds  # Expected: JSON array
```

### Final Checklist
- [ ] All "Must Have" features implemented
- [ ] All "Must NOT Have" patterns absent
- [ ] All tests pass (contract + frontend + E2E)
- [ ] Contract deployed to testnet
- [ ] 20+ wallets placed bets
- [ ] 3+ rounds completed with payouts
- [ ] Committee multi-sig working
- [ ] Leaderboard updating in real-time
- [ ] Sentry monitoring active
- [ ] Black Belt checklist complete

