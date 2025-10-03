# 🚀 TinyPay - Quick Start Guide

Get TinyPay up and running in 5 minutes!

## ✅ Prerequisites

Before you begin, ensure you have:

- **Node.js 18+** installed ([Download](https://nodejs.org/))
- **Aptos CLI** installed ([Install Guide](https://aptos.dev/tools/aptos-cli/))
  - Mac: `brew install aptos`
  - Other: See [official docs](https://aptos.dev/tools/install-cli/)

## 📦 Installation

### Step 1: Clone and Setup

```bash
# Navigate to the TinyPay directory
cd TinyPay

# Run setup script (installs all dependencies)
# On Windows PowerShell:
powershell -ExecutionPolicy Bypass -File scripts/setup.ps1

# On Mac/Linux:
bash scripts/setup.sh

# Or manually:
npm run setup
```

This will install dependencies for:
- Root package
- Backend (Node.js + Aptos SDK)
- Frontend (React + Vite + TailwindCSS)

### Step 2: Contract is Already Deployed! ✅

The smart contract has been deployed to Aptos Devnet:

**📍 Contract Address:** `0xe23bceaed51c4268300174ad8cd4d4f27750b53a5ef41277defa9f28898b5ebd`

**🔗 Explorer:**
- [View Account](https://explorer.aptoslabs.com/account/0xe23bceaed51c4268300174ad8cd4d4f27750b53a5ef41277defa9f28898b5ebd?network=devnet)
- [Deployment TX](https://explorer.aptoslabs.com/txn/0x7cb89847ed02c27022ef1bcd417f6687719bb574ddb99c516c54cfea4bbcab40?network=devnet)

## 🎮 Running TinyPay

Launch the complete TinyPay application with visual interface:

#### Step 1: Start the Backend Server
```bash
cd backend
npm run server
```
This starts the API server that handles transaction processing.

#### Step 2: Start the Frontend (Open New Terminal)
```bash
cd frontend
npm run dev
```
This starts the React development server.

#### Step 3: Open Your Browser
Navigate to [http://localhost:5173](http://localhost:5173) (or the port shown in terminal)

**GUI Controls:**
- Click **"▶️ Start Payment Flow"** to see the animated simulation
- Click **"🚫 Attempt Double-Spend"** to see prevention in action
- Click **"🔄 Reset"** to start over

## 🔧 Advanced Features

### Web Interface Controls

- **Start Payment Flow**: Initiates the complete offline-to-online payment simulation
- **Attempt Double-Spend**: Demonstrates the nonce-based double-spend prevention
- **Reset**: Clears the current state and allows you to start over
- **View Explorer**: Links to Aptos blockchain explorer for transaction verification

### Backend API Endpoints

The backend server provides REST API endpoints for:
- Transaction signing and verification
- Payment flow simulation
- Blockchain interaction
- Real-time status updates

## 📊 What to Expect

### Web Application

You'll see:
- **4 animated boxes** representing User → Merchant1 → Merchant2 → Merchant3
- **Flowing arrows** showing transaction movement
- **Status updates** at each step
- **Explorer links** for on-chain verification
- **Double-spend rejection** demonstration

## 🐛 Troubleshooting

### "Aptos CLI not found"

Install Aptos CLI:
```bash
# Mac
brew install aptos

# Linux/Windows - see https://aptos.dev/tools/install-cli/
```

### "Module not found" errors

Make sure you've installed all dependencies:
```bash
npm run setup
```

### "Port 3000 already in use"

Change the port in `frontend/vite.config.ts`:
```typescript
server: {
  port: 3001, // Change this
}
```

### Contract deployment issues

The contract is already deployed! Check `deployment.json` for details.

If you need to redeploy:
```bash
cd backend
npm run deploy
```

## 🎯 Next Steps

1. **Explore the web interface** - Use the GUI to understand the payment flow
2. **Try custom transactions** - Create your own test payments through the web interface
3. **Read the code** - Explore Move contract, backend API, React components
4. **Customize** - Add features, improve UI, extend functionality

## 📚 Documentation

- **Full README**: [README.md](README.md)
- **Move Contract**: [move_contracts/sources/tinypay.move](move_contracts/sources/tinypay.move)
- **Backend Scripts**: [backend/src/](backend/src/)
- **Frontend Components**: [frontend/src/components/](frontend/src/components/)

## 🔗 Useful Links

- **GitHub Repository**: https://github.com/MrTimonM/TinyPay
- **Aptos Devnet Faucet**: https://faucet.devnet.aptoslabs.com/
- **Aptos Explorer**: https://explorer.aptoslabs.com/?network=devnet
- **Move Language Docs**: https://aptos.dev/move/move-on-aptos/
- **Aptos SDK**: https://aptos.dev/sdks/ts-sdk/

## 💬 Need Help?

- Check [README.md](README.md) for detailed architecture
- Review code comments in source files
- Open an issue on GitHub

---

**Ready to go offline with crypto payments? Let's build! 🚀**



