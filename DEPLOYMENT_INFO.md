# 🚀 TinyPay - Deployment Information

## ✅ Deployment Status: SUCCESS

TinyPay smart contract has been successfully deployed to **Aptos Devnet**.

---

## 📍 Contract Details

| Field | Value |
|-------|-------|
| **Contract Address** | `0xe23bceaed51c4268300174ad8cd4d4f27750b53a5ef41277defa9f28898b5ebd` |
| **Network** | Aptos Devnet |
| **Module Name** | `payment` |
| **Deployment Time** | October 2, 2025 |
| **Status** | ✅ Active & Initialized |

---

## 🔗 Explorer Links

### Contract Account
```
https://explorer.aptoslabs.com/account/0xe23bceaed51c4268300174ad8cd4d4f27750b53a5ef41277defa9f28898b5ebd?network=devnet
```

### Deployment Transaction
```
https://explorer.aptoslabs.com/txn/0x7cb89847ed02c27022ef1bcd417f6687719bb574ddb99c516c54cfea4bbcab40?network=devnet
```

---

## 📦 Available Functions

### `initialize(admin: &signer)`
Initializes the payment registry for nonce tracking. Already called during deployment.

**Status:** ✅ Initialized

---

### `pay(sender, recipient, amount, nonce, registry_addr)`
Main payment function with double-spend prevention.

**Parameters:**
- `sender: &signer` - The account making the payment
- `recipient: address` - The account receiving funds
- `amount: u64` - Amount in octas (1 APT = 100,000,000 octas)
- `nonce: u64` - Unique nonce for this sender (prevents replay)
- `registry_addr: address` - Address where registry is stored (`0xe23b...`)

**Features:**
- ✅ Validates amount > 0
- ✅ Checks sender balance
- ✅ Prevents nonce reuse (double-spend protection)
- ✅ Transfers APT coins
- ✅ Emits PaymentSettledEvent

---

### `is_nonce_used(registry_addr, sender, nonce): bool`
Check if a nonce has been used for a given sender.

**View function** - Does not modify state.

---

### `direct_pay(sender, recipient, amount)`
Direct payment without nonce checking (for testing).

---

## 🔐 Security Features

| Feature | Status | Description |
|---------|--------|-------------|
| **Nonce-Based Protection** | ✅ Active | Each transaction requires unique nonce |
| **Double-Spend Prevention** | ✅ Enforced | Contract rejects reused nonces |
| **Balance Validation** | ✅ Active | Checks sufficient funds before transfer |
| **Event Logging** | ✅ Active | All payments emit on-chain events |

---

## 💡 Usage Examples

### Call from CLI (Aptos CLI)

```bash
aptos move run \
  --function-id 0xe23bceaed51c4268300174ad8cd4d4f27750b53a5ef41277defa9f28898b5ebd::payment::pay \
  --args address:0xRECIPIENT_ADDRESS u64:250000000 u64:1696800000 address:0xe23bceaed51c4268300174ad8cd4d4f27750b53a5ef41277defa9f28898b5ebd \
  --profile your-profile \
  --assume-yes
```

### Call from TypeScript SDK

```typescript
import { Aptos, AptosConfig, Network } from "@aptos-labs/ts-sdk";

const aptos = new Aptos(new AptosConfig({ network: Network.DEVNET }));

const transaction = await aptos.transaction.build.simple({
  sender: senderAccount.accountAddress,
  data: {
    function: "0xe23bceaed51c4268300174ad8cd4d4f27750b53a5ef41277defa9f28898b5ebd::payment::pay",
    functionArguments: [
      recipientAddress,
      250000000, // 2.5 APT in octas
      Date.now(), // unique nonce
      "0xe23bceaed51c4268300174ad8cd4d4f27750b53a5ef41277defa9f28898b5ebd"
    ],
  },
});
```

---

## 📊 Gas Costs

| Operation | Gas Used | Cost (APT) |
|-----------|----------|------------|
| **initialize** | ~1,500 | ~0.00015 |
| **pay (first time)** | ~2,000-3,000 | ~0.0002-0.0003 |
| **pay (subsequent)** | ~1,500-2,500 | ~0.00015-0.00025 |

*Note: Costs may vary based on network congestion*

---

## 🧪 Testing the Contract

### Test Payment (with funded accounts)

```bash
cd backend

# Create and broadcast a test payment
npm run demo
```

This will:
1. Create test accounts
2. Fund them from faucet
3. Create signed transaction with unique nonce
4. Verify offline
5. Broadcast to chain
6. Attempt double-spend (will fail)

---

## 🔄 Contract Upgrade Path

The contract is deployed at a **deterministic address** derived from the deployer's private key.

To upgrade:
1. Update code in `move_contracts/sources/tinypay.move`
2. Run `cd backend && npm run deploy` (will publish new version)
3. Update `deployment.json` with new details

---

## 📈 Monitoring

### View Recent Transactions
```
https://explorer.aptoslabs.com/account/0xe23bceaed51c4268300174ad8cd4d4f27750b53a5ef41277defa9f28898b5ebd/transactions?network=devnet
```

### View Module Code
```
https://explorer.aptoslabs.com/account/0xe23bceaed51c4268300174ad8cd4d4f27750b53a5ef41277defa9f28898b5ebd/modules/code/payment?network=devnet
```

---

## 🎯 For Hackathon Judges

**Key Highlights:**

1. ✅ **Fully Deployed & Working** on Aptos Devnet
2. ✅ **Double-Spend Protection** via nonce tracking in Move contract
3. ✅ **Offline Capabilities** demonstrated in both CLI and GUI
4. ✅ **Production-Ready Code** with error handling and events
5. ✅ **Complete Documentation** with examples and guides

**Live Demo:**
- Run `npm run demo` for CLI demo
- Run `npm run dev` for GUI demo
- All transactions verifiable on Aptos Explorer

---

## 📞 Support

For issues or questions:
- Check `QUICKSTART.md` for setup help
- Review `README.md` for architecture details
- Examine code comments in source files

---

**Built for Aptos Hackathon** 🚀

*Last Updated: October 2, 2025*



