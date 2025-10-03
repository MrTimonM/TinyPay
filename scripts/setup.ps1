# TinyPay Setup Script for Windows PowerShell

Write-Host "╔════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║         TinyPay Setup Script                           ║" -ForegroundColor Cyan
Write-Host "║   Offline-First Payment System on Aptos                ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# Check for Node.js
$nodeVersion = node --version 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Node.js is not installed. Please install Node.js 18+ first." -ForegroundColor Red
    exit 1
}

Write-Host "✅ Node.js found: $nodeVersion" -ForegroundColor Green

# Check for Aptos CLI
$aptosVersion = aptos --version 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "⚠️  Aptos CLI is not installed." -ForegroundColor Yellow
    Write-Host "   Please install it from: https://aptos.dev/tools/aptos-cli/" -ForegroundColor Yellow
    Write-Host ""
    $continue = Read-Host "Do you want to continue without Aptos CLI? (y/n)"
    if ($continue -ne "y") {
        exit 1
    }
} else {
    Write-Host "✅ Aptos CLI found: $aptosVersion" -ForegroundColor Green
}

# Install dependencies
Write-Host ""
Write-Host "📦 Installing dependencies..." -ForegroundColor Cyan
Write-Host ""

# Root dependencies
Write-Host "Installing root dependencies..." -ForegroundColor Yellow
npm install

# Backend dependencies
Write-Host "Installing backend dependencies..." -ForegroundColor Yellow
Set-Location backend
npm install
Set-Location ..

# Frontend dependencies
Write-Host "Installing frontend dependencies..." -ForegroundColor Yellow
Set-Location frontend
npm install
Set-Location ..

Write-Host ""
Write-Host "✅ All dependencies installed!" -ForegroundColor Green
Write-Host ""
Write-Host "╔════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║         Next Steps                                     ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Deploy the smart contract:" -ForegroundColor White
Write-Host "   cd backend && npm run deploy" -ForegroundColor Yellow
Write-Host ""
Write-Host "2. Run the CLI demo:" -ForegroundColor White
Write-Host "   npm run demo" -ForegroundColor Yellow
Write-Host ""
Write-Host "3. Start the frontend GUI:" -ForegroundColor White
Write-Host "   npm run dev" -ForegroundColor Yellow
Write-Host ""
Write-Host "📖 See README.md for more details" -ForegroundColor Cyan
Write-Host ""



