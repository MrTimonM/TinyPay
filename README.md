# 💸 TinyPay - Offline-First Crypto Payments on Aptos

![TinyPay Banner](https://i.ibb.co/3yHfdv4k/Chat-GPT-Image-Oct-4-2025-12-18-41-AM.png) 


### Running the Full Application (GUI + Backend)

1. **Start Backend Server** (Terminal 1):in-blue) ![License](https://img.shields.io/badge/license-MIT-green) ![Status](https://img.shields.io/badge/status-hackathon-orange)

**TinyPay** is an innovative offline-first payment system built on the Aptos blockchain. It enables users to create, verify, and settle cryptocurrency payments even without internet connectivity, with robust double-spend prevention.

## 🎯 Problem Statement

In many parts of the world, internet connectivity is unreliable or unavailable. Traditional blockchain transactions require constant online access, making crypto payments impractical in:
- Rural areas with poor connectivity
- During natural disasters or network outages
- Merchant networks in developing regions
- Peer-to-peer transactions in offline environments

## 💡 Solution

TinyPay solves this by enabling:
1. **Offline Transaction Creation**: Users sign transactions locally without internet
2. **Offline Verification**: Merchants verify signatures cryptographically offline
3. **Transaction Forwarding**: Payments hop between merchants in an offline mesh
4. **Final Settlement**: Last merchant with internet broadcasts to blockchain
5. **Double-Spend Prevention**: Smart contract enforces nonce-based protection

## 🏗️ Architecture

```
┌─────────────┐         ┌──────────────┐         ┌──────────────┐         ┌──────────────┐
│   User      │  QR/BT  │  Merchant 1  │  Blob   │  Merchant 2  │  Blob   │  Merchant 3  │
│  (Offline)  ├────────>│  (Offline)   ├────────>│  (Offline)   ├────────>│   (Online)   │
│             │         │              │         │              │         │              │
└─────────────┘         └──────────────┘         └──────────────┘         └──────┬───────┘
                                                                                   │
                                                                                   │ Broadcast
                                                                                   ▼
                                                                          ┌─────────────────┐
                                                                          │  Aptos Testnet  │
                                                                          │  Smart Contract │
                                                                          └─────────────────┘
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ ([Download](https://nodejs.org/))
- Aptos CLI ([Install Guide](https://aptos.dev/tools/aptos-cli/))
- Git

### Installation

```bash
# Clone the repository
git clone https://github.com/MrTimonM/TinyPay.git
cd TinyPay

# Run setup script
# On Unix/Mac:
bash scripts/setup.sh

# On Windows:
powershell -ExecutionPolicy Bypass -File scripts/setup.ps1

# Or manually:
npm run setup
```

### Deploy Smart Contract

```bash
cd backend
npm run deploy
```

This will:
- Deploy the TinyPay Move contract to Aptos Devnet
- Initialize the payment registry
- Save deployment info to `deployment.json`

### Launch GUI Application

#### Start the Backend Server
```bash
cd backend
npm run server
```

#### Start the Frontend (in a separate terminal)
```bash
cd frontend
npm run dev
```

Then open [http://localhost:5173](http://localhost:5173) (or the port shown in terminal) in your browser.

## � How to Run TinyPay

### Method 1: Quick Demo (CLI)
```bash
# Run the complete demo simulation
npm run demo
```

### Method 2: Full Application (GUI + Backend)

1. **Start Backend Server** (Terminal 1):
   ```bash
   cd backend
   npm run server
   ```

2. **Start Frontend** (Terminal 2):
   ```bash
   cd frontend  
   npm run dev
   ```

3. **Open Browser**: Navigate to [http://localhost:5173](http://localhost:5173)

## �📁 Project Structure

```
TinyPay/
├── move_contracts/              # Aptos Move smart contracts
│   ├── Move.toml
│   └── sources/
│       └── tinypay.move        # Payment contract with nonce protection
│
├── backend/                     # Node.js backend
│   ├── src/
│   │   ├── config.ts           # Aptos SDK configuration
│   │   ├── deploy.ts           # Contract deployment script
│   │   ├── sign_offline.ts     # Offline transaction signing
│   │   ├── verify_offline.ts   # Offline signature verification
│   │   ├── forward_blob.ts     # Transaction forwarding between merchants
│   │   ├── broadcast_online.ts # Online broadcast to blockchain
│   │   └── demo_flow.ts        # Complete demo simulation
│   └── package.json
│
├── frontend/                    # React GUI application
│   ├── src/
│   │   ├── components/
│   │   │   ├── Header.tsx
│   │   │   ├── FlowVisualization.tsx
│   │   │   ├── ParticipantBox.tsx
│   │   │   ├── FlowArrow.tsx
│   │   │   └── ControlPanel.tsx
│   │   ├── App.tsx
│   │   └── main.tsx
│   └── package.json
│
├── scripts/                     # Setup and utility scripts
│   ├── setup.sh
│   └── setup.ps1
│
└── README.md
```

## 🔧 Smart Contract Details

### Module: `tinypay::payment`

**Key Functions:**

```move
public entry fun initialize(admin: &signer)
```
Initializes the payment registry for nonce tracking.

```move
public entry fun pay(
    sender: &signer,
    recipient: address,
    amount: u64,
    nonce: u64,
    registry_addr: address,
)
```
Processes a payment with double-spend prevention:
- Validates amount
- Checks nonce hasn't been used
- Marks nonce as used
- Transfers funds
- Emits `PaymentSettledEvent`

**Double-Spend Prevention:**
- Uses `Table<address, SimpleMap<u64, bool>>` to track used nonces
- Each sender has their own nonce space
- Once a nonce is used, it cannot be reused
- Prevents replay attacks

## 💻 Backend Scripts

### Sign Transaction Offline

```bash
cd backend
npm run sign -- <privateKey> <recipient> <amount> <nonce> <registryAddr>
```

Example:
```bash
npm run sign -- 0x123... 0xabc... 2.5 1696800000 0xdef...
```

### Verify Transaction Offline

```bash
npm run verify -- signed_tx.json
```

### Forward Transaction

```bash
npm run forward -- source.json dest.json "Merchant1"
```

### Broadcast Transaction

```bash
npm run broadcast -- signed_tx.json
```

## 🎨 Frontend Features

### Visual Flow Simulation
- **4 Interactive Boxes**: User, Merchant1, Merchant2, Merchant3
- **Animated Arrows**: Show transaction flow between participants
- **Status Updates**: Real-time status for each participant
- **Online/Offline Indicators**: Visual connectivity status

### Demo Controls
- **Start Payment Flow**: Run complete offline-to-online simulation
- **Attempt Double-Spend**: Demonstrate nonce-based prevention
- **Reset**: Clear state and restart

### Styling
- Built with **TailwindCSS** for modern UI
- **Framer Motion** for smooth animations
- **Responsive design** for all screen sizes
- **Dark theme** with gradient backgrounds

## 🔐 Security Features

1. **Cryptographic Signatures**: Ed25519 signatures verified offline
2. **Nonce-Based Protection**: Prevents transaction replay
3. **On-Chain Validation**: Smart contract enforces all rules
4. **Immutable Transaction History**: All settlements recorded on-chain

## 🎬 Demo Flow (Web Interface)

1. **Introduction**
   - Open TinyPay web application
   - View the clean, intuitive interface

2. **Payment Flow Visualization**
   - Click "Start Payment Flow" button
   - Watch animated transaction flow between participants
   - See real-time status updates

3. **Transaction Settlement**
   - Observe automatic blockchain broadcasting
   - Click explorer links for verification
   - View settlement confirmation

4. **Double-Spend Prevention**
   - Click "Attempt Double-Spend" button
   - See rejection message and explanation
   - Understand nonce-based protection

5. **Reset and Replay**
   - Use reset button to start over
   - Experiment with different scenarios

## 🌐 Deployed Contracts

After running `npm run deploy`, check `deployment.json` for:
- Contract address
- Deployment transaction hash
- Aptos Explorer links

Example Explorer URL:
```
https://explorer.aptoslabs.com/account/<CONTRACT_ADDRESS>?network=devnet
```

## 🧪 Testing

### Testing the Application

1. **Start Backend**: `cd backend && npm run server`
2. **Start Frontend**: `cd frontend && npm run dev`
3. **Open Browser**: Navigate to http://localhost:5173
4. **Test Payment Flow**: Click "Start Payment Flow" button
5. **Test Double-Spend Prevention**: Click "Attempt Double-Spend" button
6. **Verify Results**: Check transaction status and explorer links

## 📊 Performance Metrics

- **Offline Signature Creation**: < 100ms
- **Offline Verification**: < 50ms
- **Transaction Size**: ~500 bytes
- **On-Chain Settlement**: ~2-5 seconds (Aptos Devnet)

## 🔗 Repository

**GitHub**: [https://github.com/MrTimonM/TinyPay](https://github.com/MrTimonM/TinyPay)

## 🤝 Contributing

This is a hackathon project! Contributions welcome:

1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open Pull Request

## 📝 License

MIT License - see [LICENSE](LICENSE) file for details

## 🙏 Acknowledgments

- **Aptos Foundation** for the blockchain infrastructure
- **Move Language** for safe smart contract development
- **Hackathon Organizers** for the opportunity





---

**Built with ❤️ for Aptos Hackathon** | **Enabling Crypto Payments Without Internet** 🚀



