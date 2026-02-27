# TrafficPulse - Complete Setup Script (PowerShell)

$ErrorActionPreference = "Stop"
$STELLAR_CLI = "C:\Users\anıl\.cargo\bin\stellar.exe"
$CONTRACT_ID = "CAOFBJ5C7F6OMXGJR3XW6QTXPFIHITGQC6AFW7K673GYGWKELHM33XEO"
$ADMIN_ADDRESS = "GDBLUIMXTGNKDTSUXMF2UY3OC4I4TBJLMKJCQMLF5HYPN7RFGSIHLX6J"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  TrafficPulse - Complete Setup" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Deploy PULSE Token
Write-Host "[1/4] Deploying PULSE token contract..." -ForegroundColor Yellow

$TOKEN_WASM = "contracts\pulse-token\target\wasm32v1-none\release\pulse_token.wasm"
if (-not (Test-Path $TOKEN_WASM)) {
    Write-Host "Building pulse-token contract..." -ForegroundColor Yellow
    Set-Location "contracts\pulse-token"
    cargo build --release --target wasm32v1-none
    Set-Location "..\.."
}

$TOKEN_ID = & $STELLAR_CLI contract deploy `
    --wasm $TOKEN_WASM `
    --network testnet `
    --source alice

Write-Host "PULSE Token Deployed: $TOKEN_ID" -ForegroundColor Green
Write-Host ""

# Step 2: Initialize TrafficPulse with token
Write-Host "[2/4] Initializing TrafficPulse contract..." -ForegroundColor Yellow

& $STELLAR_CLI contract invoke `
    --id $CONTRACT_ID `
    --network testnet `
    --source alice `
    -- initialize `
    --admin $ADMIN_ADDRESS `
    --token $TOKEN_ID

Write-Host "Contract initialized!" -ForegroundColor Green
Write-Host ""

# Step 3: Mint tokens for testing
Write-Host "[3/4] Minting 1000 PULSE tokens for testing..." -ForegroundColor Yellow

& $STELLAR_CLI contract invoke `
    --id $TOKEN_ID `
    --network testnet `
    --source alice `
    -- mint `
    --to $ADMIN_ADDRESS `
    --amount 1000000000

Write-Host "Tokens minted!" -ForegroundColor Green
Write-Host ""

# Step 4: Update .env
Write-Host "[4/4] Updating frontend configuration..." -ForegroundColor Yellow

@"
NEXT_PUBLIC_CONTRACT_ID=$CONTRACT_ID
NEXT_PUBLIC_TOKEN_ID=$TOKEN_ID
NEXT_PUBLIC_SOROBAN_RPC_URL=https://soroban-testnet.stellar.org
"@ | Out-File -FilePath "app\.env" -Encoding utf8

Write-Host "Updated app\.env" -ForegroundColor Green
Write-Host ""

Write-Host "========================================" -ForegroundColor Green
Write-Host "  Setup Complete! 🎉" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Contract ID: $CONTRACT_ID"
Write-Host "Token ID: $TOKEN_ID"
Write-Host ""
Write-Host "Next steps:"
Write-Host "1. Restart frontend: cd app && npm run dev"
Write-Host "2. Connect wallet at http://localhost:3006"
Write-Host "3. Place your bet!"
Write-Host ""
