# 🚀 TinyPay - REAL MODE Guide

## ⚡ Quick Start - REAL Transactions

This is the **REAL MODE** where you can actually create and broadcast transactions to Aptos Devnet!

---

## 🔧 Setup (2 Steps)

### Step 1: Install Backend Dependencies
```bash
cd backend
npm install
```

This will install the new dependencies:
- `express` - REST API server
- `cors` - Cross-origin support
- `@types/express` & `@types/cors` - TypeScript types

### Step 2: Start the Backend API Server
```bash
npm run server
```

You should see:
```
🚀 TinyPay API Server running on http://localhost:3001

📡 Available endpoints:
   POST /api/create-transaction - Create signed transaction
   POST /api/forward - Forward transaction to next node
   POST /api/broadcast - Broadcast transaction to Aptos
   ...

✅ Ready for real transactions!
```

**Keep this terminal running!**

---

## 🌐 Step 3: Start the Frontend

In a **NEW terminal**:

```bash
cd frontend
npm run dev
```

Then open: **http://localhost:3000**

---

## 🎮 How to Use - REAL MODE

### 1️⃣ Create Transaction (User Node)
1. Enter a recipient address (e.g., another test account or the contract address)
2. Click **"🔐 Create Signed Transaction"**
3. Wait ~1 second for the transaction to be signed with your private key
4. You'll see: ✅ Transaction signed and ready!

**What happens:**
- Uses your private key: `0x7e76b51...`
- Creates a REAL signed transaction for **0.1 APT**
- Transaction is cryptographically signed offline
- No blockchain interaction yet

---

### 2️⃣ Forward to Merchant 1 (Offline)
1. Click the **🏪 Merchant 1** box
2. Transaction moves to Merchant 1
3. See "✅ Complete" on User node
4. See "📦 Transaction Here" on Merchant 1

**What happens:**
- Transaction blob is forwarded (simulates QR/Bluetooth/NFC)
- Original signature preserved
- Still offline - no blockchain interaction

---

### 3️⃣ Forward to Merchant 2 (Offline)
1. Click the **🏬 Merchant 2** box
2. Transaction moves to Merchant 2
3. Forwarding chain tracks the path

**What happens:**
- Another offline hop
- Metadata added to forwarding chain
- Still no internet needed

---

### 4️⃣ **BROADCAST TO APTOS!** (Merchant 3 - Online)
1. Click the **🏦 Merchant 3** box
2. Wait ~2-5 seconds for blockchain confirmation
3. See: 🎉 Transaction Confirmed On-Chain!
4. Click **"🔗 View on Explorer"** link

**What happens:**
- 🌐 **REAL broadcast to Aptos Devnet**
- 💸 **0.1 APT actually transferred**
- ⛓️ **Transaction recorded on blockchain**
- 📊 **Visible on Aptos Explorer**

---

## 📋 Configuration

### Your Private Key
Located in `frontend/src/App_Real.tsx`:
```typescript
const USER_PRIVATE_KEY = '0x7e76b51ec4a5ad62a4957f605c97e1d4a1cb6f5b602723f04bcf19f33776b978';
```

This is the key you provided - it's hardcoded for the demo.

### Amount
Fixed at **0.1 APT** as you requested.

### Contract Address
Automatically loaded from `deployment.json`:
```
0xe23bceaed51c4268300174ad8cd4d4f27750b53a5ef41277defa9f28898b5ebd
```

---

## 🔍 What You'll See

### Before Broadcasting:
- User balance shows at top
- Transaction flows through offline nodes
- No blockchain activity

### After Broadcasting (Merchant 3):
- ✅ Transaction confirmed
- 💰 Balance updated
- 🔗 Explorer link appears
- Transaction hash visible

---

## 🧪 Testing

### Test Transaction Flow:
1. **Get test recipient address:**
   - Use contract address: `0xe23bceaed51c4268300174ad8cd4d4f27750b53a5ef41277defa9f28898b5ebd`
   - Or create another test account

2. **Check your balance:**
   - Should show in top-right of UI
   - Need at least 0.15 APT (0.1 + gas)

3. **Create and forward:**
   - Click through all nodes
   - Watch transaction move
   - Click Merchant 3 to broadcast

4. **Verify on Explorer:**
   - Click the Explorer link
   - See your transaction on-chain
   - Verify amount transferred

---

## 🛠️ API Endpoints (for reference)

The backend server exposes these endpoints:

### POST /api/create-transaction
**Body:**
```json
{
  "privateKey": "0x7e76...",
  "recipientAddress": "0xabc...",
  "amount": 0.1
}
```

**Response:**
```json
{
  "success": true,
  "transaction": {
    "signedTxHex": "0x...",
    "txDetails": { ... },
    "currentNode": "user"
  }
}
```

### POST /api/forward
**Body:**
```json
{
  "toNode": "merchant1"
}
```

### POST /api/broadcast
Broadcasts the current transaction to Aptos.

### GET /api/transaction
Get current transaction state.

### POST /api/reset
Reset everything.

---

## ⚠️ Important Notes

### 1. REAL Money (Devnet APT)
- This uses REAL transactions on Aptos Devnet
- APT will actually be transferred
- Make sure you have enough balance

### 2. Private Key Security
- Your private key is hardcoded for demo purposes
- **DO NOT use this private key for mainnet**
- **DO NOT commit private keys to GitHub**

### 3. Nonce Management
- Each transaction uses `Date.now()` as nonce
- Nonces must be unique per sender
- Contract prevents reuse (double-spend protection)

### 4. Network Requirements
- Needs connection to Aptos Devnet
- Backend must be able to reach RPC endpoint
- Frontend must connect to backend API

---

## 🐛 Troubleshooting

### "Failed to create transaction"
- Check your private key is correct
- Ensure you have enough balance
- Verify recipient address format

### "Failed to broadcast"
- Check internet connection
- Verify Aptos Devnet is accessible
- Check account has enough APT for gas

### "CORS error"
- Make sure backend is running on port 3001
- Make sure frontend is running on port 3000
- Check `cors` is enabled in backend

### "Connection refused"
- Backend server not running
- Run `cd backend && npm run server`
- Check port 3001 is not in use

---

## 🔄 Reset and Try Again

Click the **"🔄 Reset & Create New Transaction"** button to:
- Clear current transaction
- Reset all nodes
- Create a new transaction with new nonce

---

## 📊 Monitoring

### Check Balance
- Displays in top-right corner
- Updates after broadcast
- Shows real APT amount

### View Transaction History
Visit your account on Explorer:
```
https://explorer.aptoslabs.com/account/YOUR_ADDRESS?network=devnet
```

### Transaction Details
Each transaction shows:
- Sender address
- Recipient address
- Amount (0.1 APT)
- Nonce (unique timestamp)
- Gas used
- Success status

---

## 🎯 Example Workflow

```bash
# Terminal 1: Start backend
cd backend
npm install
npm run server

# Terminal 2: Start frontend
cd frontend
npm run dev

# Browser:
# 1. Open http://localhost:3000
# 2. Enter recipient: 0xe23bceaed51c4268300174ad8cd4d4f27750b53a5ef41277defa9f28898b5ebd
# 3. Click "Create Signed Transaction"
# 4. Click Merchant 1 → Click Merchant 2 → Click Merchant 3
# 5. Wait for confirmation
# 6. Click "View on Explorer"
# 7. See your real transaction on Aptos! 🎉
```

---

## 🏆 What Makes This REAL

✅ **Real Cryptographic Signing** - Ed25519 signatures with your key

✅ **Real Transaction Serialization** - Proper BCS encoding

✅ **Real Aptos RPC Calls** - Actual network interaction

✅ **Real Blockchain Settlement** - APT actually transferred

✅ **Real Explorer Verification** - Visible on aptoslabs.com

✅ **Real Double-Spend Prevention** - Contract enforces nonces

---

## 📞 Need Help?

- Check backend terminal for logs
- Check browser console for errors
- Verify both servers are running
- Ensure you have Devnet APT

---

**Enjoy sending REAL offline-to-online payments! 🚀💸**

*Remember: This is Devnet - safe to experiment!*


