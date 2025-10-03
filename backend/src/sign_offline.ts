import { Account, Ed25519PrivateKey, RawTransaction, AccountAddress, U64 } from "@aptos-labs/ts-sdk";
import { aptos, MODULE_ADDRESS } from "./config";
import * as fs from "fs";
import * as path from "path";

/**
 * Creates a signed transaction offline (without internet)
 * This simulates a user creating a payment on their phone without connectivity
 */
export async function createSignedTransaction(
    senderPrivateKey: string,
    recipientAddress: string,
    amount: number,
    nonce: number,
    registryAddress: string
): Promise<{
    signedTxHex: string;
    txDetails: any;
}> {
    try {
        // Create sender account from private key
        const privateKey = new Ed25519PrivateKey(senderPrivateKey);
        const sender = Account.fromPrivateKey({ privateKey });

        console.log(`[OFFLINE] Creating signed transaction...`);
        console.log(`  Sender: ${sender.accountAddress.toString()}`);
        console.log(`  Recipient: ${recipientAddress}`);
        console.log(`  Amount: ${amount} APT (octas: ${amount * 100_000_000})`);
        console.log(`  Nonce: ${nonce}`);

        // Build the transaction
        const transaction = await aptos.transaction.build.simple({
            sender: sender.accountAddress,
            data: {
                function: `${MODULE_ADDRESS}::payment::pay`,
                functionArguments: [
                    recipientAddress,
                    amount * 100_000_000, // Convert to octas
                    nonce,
                    registryAddress
                ],
            },
        });

        // Sign the transaction offline
        const senderAuthenticator = aptos.transaction.sign({
            signer: sender,
            transaction,
        });

        // Serialize to hex for transmission
        const signedTxBytes = new Uint8Array([
            ...transaction.bcsToBytes(),
            ...senderAuthenticator.bcsToBytes(),
        ]);
        
        const signedTxHex = Buffer.from(signedTxBytes).toString('hex');

        const txDetails = {
            sender: sender.accountAddress.toString(),
            recipient: recipientAddress,
            amount: amount,
            nonce: nonce,
            timestamp: new Date().toISOString(),
        };

        console.log(`[OFFLINE] ✅ Transaction signed successfully!`);
        console.log(`[OFFLINE] Signed TX size: ${signedTxHex.length / 2} bytes`);

        return {
            signedTxHex,
            txDetails,
        };
    } catch (error) {
        console.error("[OFFLINE] ❌ Error creating signed transaction:", error);
        throw error;
    }
}

/**
 * Save signed transaction to file (simulates QR code generation)
 */
export function saveSignedTxToFile(signedTxHex: string, txDetails: any, filename: string = "signed_tx.json") {
    const data = {
        signedTxHex,
        txDetails,
        createdAt: new Date().toISOString(),
    };

    const outputDir = path.join(__dirname, "../../data");
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }

    const filepath = path.join(outputDir, filename);
    fs.writeFileSync(filepath, JSON.stringify(data, null, 2));
    
    console.log(`[OFFLINE] 💾 Signed transaction saved to: ${filepath}`);
    return filepath;
}

// CLI usage
if (require.main === module) {
    const args = process.argv.slice(2);
    if (args.length < 5) {
        console.log("Usage: ts-node sign_offline.ts <senderPrivateKey> <recipientAddress> <amount> <nonce> <registryAddress>");
        process.exit(1);
    }

    const [senderPrivateKey, recipientAddress, amount, nonce, registryAddress] = args;

    createSignedTransaction(
        senderPrivateKey,
        recipientAddress,
        parseFloat(amount),
        parseInt(nonce),
        registryAddress
    ).then(({ signedTxHex, txDetails }) => {
        saveSignedTxToFile(signedTxHex, txDetails);
        console.log("\n✅ Offline transaction created successfully!");
        console.log("📱 Ready to be scanned as QR code or transmitted via Bluetooth/NFC");
    }).catch(console.error);
}


