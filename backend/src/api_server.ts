import express, { Request, Response } from 'express';
import cors from 'cors';
import { Account, Ed25519PrivateKey } from "@aptos-labs/ts-sdk";
import { aptos } from "./config";
import * as fs from "fs";
import * as path from "path";

const app = express();
app.use(cors());
app.use(express.json());

// In-memory storage for transaction state
interface TransactionData {
    signedTxHex?: string;
    txDetails?: any;
    currentNode?: string;
    forwardingChain?: Array<{ node: string; timestamp: string }>;
    broadcastResult?: any;
}

// Store the actual transaction and authenticator objects
interface StoredTransaction {
    rawTransaction: any;
    authenticator: any;
    txDetails: any;
}

let currentTransaction: TransactionData = {};
let storedTxData: StoredTransaction | null = null;

// Get deployment info
function getDeploymentInfo() {
    const deploymentPath = path.join(__dirname, "../../deployment.json");
    if (fs.existsSync(deploymentPath)) {
        return JSON.parse(fs.readFileSync(deploymentPath, "utf-8"));
    }
    throw new Error("Deployment info not found");
}

// Create a new signed transaction
app.post('/api/create-transaction', async (req: Request, res: Response) => {
    try {
        const { privateKey, recipientAddress, amount } = req.body;

        if (!privateKey || !recipientAddress || !amount) {
            return res.status(400).json({ error: "Missing required fields" });
        }

        console.log(`[API] Creating transaction...`);
        console.log(`  Recipient: ${recipientAddress}`);
        console.log(`  Amount: ${amount} APT`);

        const deployment = getDeploymentInfo();
        const registryAddress = deployment.contractAddress;

        // Create sender account from private key
        const pk = new Ed25519PrivateKey(privateKey);
        const sender = Account.fromPrivateKey({ privateKey: pk });

        const nonce = Date.now();
        const amountInOctas = Math.floor(amount * 100_000_000);

        console.log(`  Sender: ${sender.accountAddress.toString()}`);
        console.log(`  Nonce: ${nonce}`);
        console.log(`  Registry: ${registryAddress}`);

        // Build the transaction
        const transaction = await aptos.transaction.build.simple({
            sender: sender.accountAddress,
            data: {
                function: `${registryAddress}::payment::pay`,
                functionArguments: [
                    recipientAddress,
                    amountInOctas,
                    nonce,
                    registryAddress
                ],
            },
        });

        // Sign the transaction
        const senderAuthenticator = aptos.transaction.sign({
            signer: sender,
            transaction,
        });

        const txDetails = {
            sender: sender.accountAddress.toString(),
            recipient: recipientAddress,
            amount: amount,
            nonce: nonce,
            timestamp: new Date().toISOString(),
        };

        // Store the actual transaction objects for later broadcast
        storedTxData = {
            rawTransaction: transaction,
            authenticator: senderAuthenticator,
            txDetails,
        };

        // Also store in currentTransaction for compatibility
        currentTransaction = {
            signedTxHex: 'stored', // placeholder
            txDetails,
            currentNode: 'user',
            forwardingChain: [
                { node: 'user', timestamp: new Date().toISOString() }
            ],
        };

        console.log(`[API] ✅ Transaction created and signed!`);

        res.json({
            success: true,
            transaction: currentTransaction,
            message: "Transaction signed successfully"
        });
    } catch (error: any) {
        console.error("[API] ❌ Error creating transaction:", error);
        res.status(500).json({ error: error.message });
    }
});

// Forward transaction to next node
app.post('/api/forward', async (req: Request, res: Response) => {
    try {
        const { toNode } = req.body;

        if (!currentTransaction.signedTxHex) {
            return res.status(400).json({ error: "No transaction to forward" });
        }

        console.log(`[API] Forwarding transaction to ${toNode}...`);

        currentTransaction.currentNode = toNode;
        currentTransaction.forwardingChain = currentTransaction.forwardingChain || [];
        currentTransaction.forwardingChain.push({
            node: toNode,
            timestamp: new Date().toISOString()
        });

        console.log(`[API] ✅ Transaction forwarded to ${toNode}`);

        res.json({
            success: true,
            transaction: currentTransaction,
            message: `Transaction forwarded to ${toNode}`
        });
    } catch (error: any) {
        console.error("[API] ❌ Error forwarding:", error);
        res.status(500).json({ error: error.message });
    }
});

// Broadcast transaction to Aptos network
app.post('/api/broadcast', async (req: Request, res: Response) => {
    try {
        if (!storedTxData) {
            return res.status(400).json({ error: "No transaction to broadcast" });
        }

        console.log(`[API] 🌐 Broadcasting transaction to Aptos Devnet...`);

        // Submit the transaction using the SDK
        const committedTxn = await aptos.transaction.submit.simple({
            transaction: storedTxData.rawTransaction,
            senderAuthenticator: storedTxData.authenticator,
        });

        const txHash = committedTxn.hash;
        console.log(`[API] ⏳ Transaction submitted: ${txHash}`);

        // Wait for confirmation
        const executedTxn = await aptos.waitForTransaction({
            transactionHash: txHash,
        });

        const explorerUrl = `https://explorer.aptoslabs.com/txn/${txHash}?network=devnet`;

        currentTransaction.broadcastResult = {
            success: executedTxn.success,
            txHash: txHash,
            explorerUrl,
            timestamp: new Date().toISOString(),
        };

        console.log(`[API] ✅ Transaction confirmed!`);
        console.log(`[API] TX Hash: ${txHash}`);
        console.log(`[API] Explorer: ${explorerUrl}`);

        res.json({
            success: true,
            transaction: currentTransaction,
            txHash: txHash,
            explorerUrl,
            message: "Transaction broadcasted successfully!"
        });
    } catch (error: any) {
        console.error("[API] ❌ Error broadcasting:", error);
        res.status(500).json({ error: error.message });
    }
});

// Get current transaction state
app.get('/api/transaction', (req: Request, res: Response) => {
    res.json({
        success: true,
        transaction: currentTransaction
    });
});

// Reset transaction state
app.post('/api/reset', (req: Request, res: Response) => {
    currentTransaction = {};
    storedTxData = null;
    console.log("[API] Transaction state reset");
    res.json({ success: true, message: "Transaction reset" });
});

// Create a test account for double-spend demo
app.get('/api/test-account', async (req: Request, res: Response) => {
    try {
        const { Account } = await import("@aptos-labs/ts-sdk");
        const testAccount = Account.generate();
        
        // Fund the account
        await aptos.fundAccount({ 
            accountAddress: testAccount.accountAddress, 
            amount: 100_000_000 // 1 APT
        });
        
        res.json({
            success: true,
            address: testAccount.accountAddress.toString(),
            privateKey: testAccount.privateKey.toString(),
        });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// Get account balance
app.get('/api/balance/:address', async (req: Request, res: Response) => {
    try {
        const { address } = req.params;
        const balance = await aptos.getAccountAPTAmount({ accountAddress: address });
        res.json({
            success: true,
            address,
            balance: balance / 100_000_000,
            balanceOctas: balance
        });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
    console.log(`\n🚀 TinyPay API Server running on http://localhost:${PORT}`);
    console.log(`\n📡 Available endpoints:`);
    console.log(`   POST /api/create-transaction - Create signed transaction`);
    console.log(`   POST /api/forward - Forward transaction to next node`);
    console.log(`   POST /api/broadcast - Broadcast transaction to Aptos`);
    console.log(`   GET  /api/transaction - Get current transaction state`);
    console.log(`   POST /api/reset - Reset transaction state`);
    console.log(`   GET  /api/balance/:address - Get account balance`);
    console.log(`\n✅ Ready for real transactions!\n`);
});

