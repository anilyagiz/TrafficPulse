# TrafficPulse - Quick Deploy Script (PowerShell)
# Usage: .\deploy.ps1

$ErrorActionPreference = "Stop"
$STELLAR_CLI = "C:\Users\anıl\.cargo\bin\stellar.exe"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  TrafficPulse Testnet Deployment" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if WASM exists
$WASM_PATH = "target\wasm32v1-none\release\traffic_pulse.wasm"
if (-not (Test-Path $WASM_PATH)) {
    Write-Host "[ERROR] WASM file not found!" -ForegroundColor Red
    Write-Host "Building contract..." -ForegroundColor Yellow
    Set-Location "contracts\traffic-pulse"
    cargo build --release --target wasm32v1-none
    Set-Location "..\.."
}

Write-Host "[1/3] Checking account..." -ForegroundColor Yellow
try {
    $ADDRESS = & $STELLAR_CLI keys address alice --network testnet 2>&1
    Write-Host "Found account: $ADDRESS" -ForegroundColor Green
} catch {
    Write-Host "No account found. Creating..." -ForegroundColor Yellow
    & $STELLAR_CLI keys generate alice --network testnet
    $ADDRESS = & $STELLAR_CLI keys address alice --network testnet
    Write-Host "Account created: $ADDRESS" -ForegroundColor Green
    Write-Host ""
    Write-Host "IMPORTANT: Fund this account first!" -ForegroundColor Red
    Write-Host "Visit: https://laboratory.stellar.org/#account-creator?network=testnet" -ForegroundColor Yellow
    Write-Host "Then press any key to continue..." -ForegroundColor Yellow
    pause
}

Write-Host ""
Write-Host "[2/3] Deploying contract..." -ForegroundColor Yellow
$CONTRACT_ID = & $STELLAR_CLI contract deploy `
    --wasm $WASM_PATH `
    --network testnet `
    --source alice

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "  Contract Deployed Successfully!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host "Contract ID: $CONTRACT_ID" -ForegroundColor Cyan
Write-Host "Explorer: https://stellar.expert/explorer/testnet/contract/$CONTRACT_ID" -ForegroundColor Cyan
Write-Host ""

# Update .env
Write-Host "[3/3] Updating frontend configuration..." -ForegroundColor Yellow
$ENV_CONTENT = @"
NEXT_PUBLIC_CONTRACT_ID=$CONTRACT_ID
NEXT_PUBLIC_SOROBAN_RPC_URL=https://soroban-testnet.stellar.org
"@

$ENV_CONTENT | Out-File -FilePath "app\.env" -Encoding utf8
Write-Host "Updated app\.env" -ForegroundColor Green

Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. cd app" -ForegroundColor White
Write-Host "2. npm run dev -- -p 3006" -ForegroundColor White
Write-Host "3. Initialize contract from Admin Dashboard" -ForegroundColor White
Write-Host ""
Write-Host "Done! 🎉" -ForegroundColor Green
