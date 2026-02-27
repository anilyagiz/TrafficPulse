@echo off
echo ========================================
echo   TrafficPulse Testnet Deployment
echo ========================================
echo.

REM Check if cargo is installed
where cargo >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Rust/Cargo not found!
    echo Install from: https://rustup.rs/
    pause
    exit /b 1
)

echo [1/4] Building smart contract...
cd contracts\traffic-pulse
cargo build --target wasm32-unknown-unknown --release
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Build failed!
    cd ..\..
    pause
    exit /b 1
)
cd ..\..

echo.
echo [2/4] Checking Soroban CLI...
where soroban >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Soroban CLI not found!
    echo.
    echo Install with:
    echo   scoop bucket add stellar https://github.com/StellarCN/scoop-stellar.git
    echo   scoop install soroban-dev
    echo.
    echo Or download from: https://github.com/StellarCN/soroban-tools/releases
    pause
    exit /b 1
)

echo.
echo [3/4] Deploying to testnet...
echo Make sure you have a funded testnet account!
echo.
soroban contract deploy ^
    --wasm contracts\traffic-pulse\target\wasm32-unknown-unknown\release\traffic_pulse.wasm ^
    --network testnet ^
    --source alice

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo [ERROR] Deployment failed!
    echo Make sure you have:
    echo   1. Generated a key: soroban keys generate alice --network testnet
    echo   2. Funded account: Visit https://laboratory.stellar.org/#account-creator
    echo.
    pause
    exit /b 1
)

echo.
echo [4/4] Deployment complete!
echo.
echo Next steps:
echo   1. Copy the Contract ID above
echo   2. Update app\.env with: NEXT_PUBLIC_CONTRACT_ID=YOUR_ID
echo   3. Restart frontend: npm run dev
echo.
pause
