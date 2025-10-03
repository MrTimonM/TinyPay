#!/bin/bash

echo "╔════════════════════════════════════════════════════════╗"
echo "║         TinyPay Setup Script                           ║"
echo "║   Offline-First Payment System on Aptos                ║"
echo "╚════════════════════════════════════════════════════════╝"
echo ""

# Check for Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

echo "✅ Node.js found: $(node --version)"

# Check for Aptos CLI
if ! command -v aptos &> /dev/null; then
    echo "⚠️  Aptos CLI is not installed."
    echo "   Please install it from: https://aptos.dev/tools/aptos-cli/"
    echo "   On macOS: brew install aptos"
    echo "   On Linux: Follow instructions at https://aptos.dev/tools/install-cli/"
    echo ""
    read -p "Do you want to continue without Aptos CLI? (y/n) " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
else
    echo "✅ Aptos CLI found: $(aptos --version)"
fi

# Install dependencies
echo ""
echo "📦 Installing dependencies..."
echo ""

# Root dependencies
echo "Installing root dependencies..."
npm install

# Backend dependencies
echo "Installing backend dependencies..."
cd backend
npm install
cd ..

# Frontend dependencies
echo "Installing frontend dependencies..."
cd frontend
npm install
cd ..

echo ""
echo "✅ All dependencies installed!"
echo ""
echo "╔════════════════════════════════════════════════════════╗"
echo "║         Next Steps                                     ║"
echo "╚════════════════════════════════════════════════════════╝"
echo ""
echo "1. Deploy the smart contract:"
echo "   cd backend && npm run deploy"
echo ""
echo "2. Run the CLI demo:"
echo "   npm run demo"
echo ""
echo "3. Start the frontend GUI:"
echo "   npm run dev"
echo ""
echo "📖 See README.md for more details"
echo ""



