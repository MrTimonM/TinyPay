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

## 🎮 Running the Demo

### Option 1: CLI Demo (Recommended First)

See the complete offline-to-online flow in your terminal:

```bash
# From project root
npm run demo

# Or from backend directory
cd backend
npm run demo
```

This will simulate:
1. ✅ User creating offline signed transaction
2. ✅ Merchant1 verifying signature offline
3. ✅ Merchant2 forwarding transaction
4. ✅ Merchant3 broadcasting to Aptos Devnet
5. ✅ Double-spend prevention demonstration

### Option 2: GUI Demo (Visual)

Launch the beautiful React interface:

```bash
# From project root
npm run dev

# Or from frontend directory
cd frontend
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000)

**GUI Controls:**
- Click **"▶️ Start Payment Flow"** to see the animated simulation
- Click **"🚫 Attempt Double-Spend"** to see prevention in action
- Click **"🔄 Reset"** to start over

## 🔧 Manual Testing (Advanced)

### Create a Custom Offline Payment

```bash
cd backend

# Sign a transaction offline
npm run sign -- \
  <PRIVATE_KEY> \
  <RECIPIENT_ADDRESS> \
  <AMOUNT_IN_APT> \
  <NONCE> \
  0xe23bceaed51c4268300174ad8cd4d4f27750b53a5ef41277defa9f28898b5ebd

# Example:
npm run sign -- \
  0x123abc... \
  0xdef456... \
  2.5 \
  1696800000 \
  0xe23bceaed51c4268300174ad8cd4d4f27750b53a5ef41277defa9f28898b5ebd
```

### Verify the Transaction Offline

```bash
npm run verify -- signed_tx.json
```

### Forward Between Merchants

```bash
npm run forward -- signed_tx.json merchant2_tx.json "Merchant1"
npm run forward -- merchant2_tx.json merchant3_tx.json "Merchant2"
```

### Broadcast to Blockchain

```bash
npm run broadcast -- merchant3_tx.json
```

## 📊 What to Expect

### CLI Demo Output

```
╔══════════════════════════════════════════════════════════╗
║        TinyPay - Offline Payment Demo Flow              ║
║   Crypto Payments Without Internet Connection 📱💸       ║
╚══════════════════════════════════════════════════════════╝

👤 Generating test accounts...
💰 Funding test accounts from faucet...

═══════════════════════════════════════════════════════════
STEP 1: User creates offline payment 📱❌📡
═══════════════════════════════════════════════════════════
[OFFLINE] Creating signed transaction...
  Sender: 0xabc...
  Recipient: 0xdef...
  Amount: 2.5 APT
  Nonce: 1696800000

[... and so on ...]
```

### GUI Demo

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

1. **Watch the demo** - Run both CLI and GUI versions
2. **Try custom transactions** - Create your own test payments
3. **Read the code** - Explore Move contract, backend scripts, React components
4. **Customize** - Add features, improve UI, extend functionality

## 📚 Documentation

- **Full README**: [README.md](README.md)
- **Move Contract**: [move_contracts/sources/tinypay.move](move_contracts/sources/tinypay.move)
- **Backend Scripts**: [backend/src/](backend/src/)
- **Frontend Components**: [frontend/src/components/](frontend/src/components/)

## 🔗 Useful Links

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



