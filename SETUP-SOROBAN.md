# Soroban CLI Kurulum Rehberi (Windows)

## Yöntem 1: Scoop ile (ÖNERİLEN)

PowerShell'i **Yönetici olarak** açıp şunları çalıştır:

```powershell
# 1. Scoop kurulu değilse kur
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
Invoke-RestMethod -Uri https://get.scoop.sh | Invoke-Expression

# 2. Stellar bucket ekle
scoop bucket add stellar https://github.com/StellarCN/scoop-stellar.git

# 3. Soroban kur
scoop install soroban-dev

# 4. Kontrol et
soroban --version
```

## Yöntem 2: Manuel İndirme

1. **İndir**: https://github.com/stellar/stellar-cli/releases
   - En son sürümü bul
   - `soroban-cli-x86_64-pc-windows-msvc.zip` dosyasını indir

2. **Kur**:
   ```
   C:\Users\anıl\.cargo\bin\ klasörüne çıkar
   ```

3. **PATH'e ekle** (zaten .cargo\bin PATH'te olmalı):
   ```powershell
   $env:Path += ";$env:USERPROFILE\.cargo\bin"
   ```

4. **Kontrol et**:
   ```powershell
   soroban --version
   ```

## Yöntem 3: Cargo ile (En Kolay)

Zaten Rust kurulu olduğu için:

```powershell
cargo install soroban-cli
```

Bu en kolay yöntem! 5-10 dakika sürebilir.

---

## Kurulum Sonrası

### 1. Testnet Account Oluştur

```powershell
# Key pair oluştur
soroban keys generate alice --network testnet

# Address'i göster
soroban keys address alice --network testnet
```

### 2. Testnet XLM Al (ÜCRETSİZ)

Çıkan address'i kopyala ve şu URL'ye yapıştır:
```
https://laboratory.stellar.org/#account-creator?network=testnet
```

"Submit" butonuna bas. ~10,000 XLM alacaksın.

### 3. Deploy Et

```powershell
cd C:\Users\anıl\Desktop\TrafficPulse

# Build
cd contracts\traffic-pulse
cargo build --target wasm32-unknown-unknown --release

# Deploy
cd ..\..
soroban contract deploy `
  --wasm contracts\traffic-pulse\target\wasm32-unknown-unknown\release\traffic_pulse.wasm `
  --network testnet `
  --source alice
```

Çıkan **Contract ID**'yi kopyala!

### 4. Frontend'i Güncelle

`app\.env` dosyasını oluştur:
```env
NEXT_PUBLIC_CONTRACT_ID=AZMAN_CONTRACT_ID_BURAYA
NEXT_PUBLIC_SOROBAN_RPC_URL=https://soroban-testnet.stellar.org
```

### 5. Frontend'i Yeniden Başlat

```powershell
cd app
npm run dev -- -p 3006
```

---

## Hata Çözümleme

### "soroban: command not found"
```powershell
$env:Path += ";$env:USERPROFILE\.cargo\bin"
```

### "Insufficient balance"
- Friendbot'tan XLM al: https://laboratory.stellar.org/#account-creator

### "WASM file not found"
```powershell
cd contracts\traffic-pulse
cargo build --target wasm32-unknown-unknown --release
```

---

## En Kolay Yol (ÖZET)

```powershell
# 1. Soroban kur
cargo install soroban-cli

# 2. Key oluştur
soroban keys generate alice --network testnet

# 3. XLM al (tarayıcıda)
# https://laboratory.stellar.org/#account-creator

# 4. Deploy et
cd C:\Users\anıl\Desktop\TrafficPulse
soroban contract deploy --wasm contracts\traffic-pulse\target\wasm32-unknown-unknown\release\traffic_pulse.wasm --network testnet --source alice

# 5. .env güncelle
# Contract ID'yi kopyala ve app\.env dosyasına yapıştır
```

Bu kadar! 🚀
