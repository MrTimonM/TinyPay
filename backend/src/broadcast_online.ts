import { aptos } from "./config";
import * as fs from "fs";
import * as path from "path";

/**
 * Broadcasts a signed transaction to the Aptos network
 * This is done by the final merchant who has internet connectivity
 */
export async function broadcastTransaction(signedTxHex: string): Promise<{
    success: boolean;
    txHash?: string;
    explorerUrl?: string;
    error?: string;
}> {
    try {
        console.log(`[BROADCAST] 🌐 Broadcasting transaction to Aptos Devnet...`);
        
        // Decode the signed transaction
        const txBytes = Buffer.from(signedTxHex, 'hex');
        
        // Submit to network
        const pendingTxn = await aptos.transaction.submit.simple({
            transaction: txBytes as any,
            senderAuthenticator: undefined as any, // Already included in bytes
        });

        console.log(`[BROADCAST] ⏳ Transaction submitted: ${pendingTxn.hash}`);
        console.log(`[BROADCAST] Waiting for confirmation...`);

        // Wait for transaction to be confirmed
        const executedTxn = await aptos.waitForTransaction({
            transactionHash: pendingTxn.hash,
        });

        const explorerUrl = `https://explorer.aptoslabs.com/txn/${pendingTxn.hash}?network=devnet`;

        console.log(`[BROADCAST] ✅ Transaction confirmed!`);
        console.log(`[BROADCAST] Transaction Hash: ${pendingTxn.hash}`);
        console.log(`[BROADCAST] Explorer: ${explorerUrl}`);
        console.log(`[BROADCAST] Status: ${executedTxn.success ? "SUCCESS" : "FAILED"}`);

        return {
            success: executedTxn.success,
            txHash: pendingTxn.hash,
            explorerUrl,
        };
    } catch (error: any) {
        console.error("[BROADCAST] ❌ Error broadcasting transaction:", error.message);
        return {
            success: false,
            error: error.message,
        };
    }
}

/**
 * Load signed transaction from file and broadcast
 */
export async function loadAndBroadcast(filename: string = "signed_tx.json") {
    const filepath = path.join(__dirname, "../../data", filename);
    
    if (!fs.existsSync(filepath)) {
        console.error(`[BROADCAST] ❌ File not found: ${filepath}`);
        return null;
    }

    const data = JSON.parse(fs.readFileSync(filepath, 'utf-8'));
    const { signedTxHex, txDetails } = data;

    console.log("\n[BROADCAST] Transaction to broadcast:");
    console.log(`  Sender: ${txDetails.sender}`);
    console.log(`  Recipient: ${txDetails.recipient}`);
    console.log(`  Amount: ${txDetails.amount} APT`);
    console.log(`  Nonce: ${txDetails.nonce}`);

    if (data.forwardingChain) {
        console.log(`  Forwarded through: ${data.forwardingChain.length} merchant(s)`);
    }

    const result = await broadcastTransaction(signedTxHex);
    
    if (result.success) {
        // Save broadcast result
        data.broadcast = {
            txHash: result.txHash,
            explorerUrl: result.explorerUrl,
            timestamp: new Date().toISOString(),
        };
        fs.writeFileSync(filepath, JSON.stringify(data, null, 2));
        console.log("\n✅ Payment settled on-chain!");
    }

    return result;
}

// CLI usage
if (require.main === module) {
    const args = process.argv.slice(2);
    const filename = args[0] || "signed_tx.json";
    
    loadAndBroadcast(filename).catch(console.error);
}


