import * as fs from "fs";
import * as path from "path";

/**
 * Forwards a signed transaction blob from one merchant to another
 * This simulates the offline handoff between merchants
 */
export function forwardTransactionBlob(
    sourceFile: string,
    destinationFile: string,
    merchantName: string
): boolean {
    try {
        const sourcePath = path.join(__dirname, "../../data", sourceFile);
        const destPath = path.join(__dirname, "../../data", destinationFile);

        if (!fs.existsSync(sourcePath)) {
            console.error(`[FORWARD] ❌ Source file not found: ${sourcePath}`);
            return false;
        }

        // Load transaction data
        const txData = JSON.parse(fs.readFileSync(sourcePath, 'utf-8'));

        // Add forwarding metadata
        if (!txData.forwardingChain) {
            txData.forwardingChain = [];
        }
        
        txData.forwardingChain.push({
            merchant: merchantName,
            timestamp: new Date().toISOString(),
        });

        // Save to destination
        fs.writeFileSync(destPath, JSON.stringify(txData, null, 2));

        console.log(`[FORWARD] ✅ Transaction forwarded by ${merchantName}`);
        console.log(`[FORWARD] From: ${sourceFile} → To: ${destinationFile}`);
        console.log(`[FORWARD] Forwarding chain length: ${txData.forwardingChain.length}`);

        return true;
    } catch (error: any) {
        console.error("[FORWARD] ❌ Error forwarding transaction:", error.message);
        return false;
    }
}

/**
 * Display the forwarding chain
 */
export function displayForwardingChain(filename: string) {
    const filepath = path.join(__dirname, "../../data", filename);
    
    if (!fs.existsSync(filepath)) {
        console.error(`[FORWARD] ❌ File not found: ${filepath}`);
        return;
    }

    const txData = JSON.parse(fs.readFileSync(filepath, 'utf-8'));
    
    console.log("\n📦 Transaction Forwarding Chain:");
    console.log(`   Original Sender: ${txData.txDetails.sender}`);
    console.log(`   Final Recipient: ${txData.txDetails.recipient}`);
    console.log(`   Amount: ${txData.txDetails.amount} APT`);
    console.log(`   Nonce: ${txData.txDetails.nonce}`);
    console.log("\n   Forwarding Path:");
    
    if (txData.forwardingChain && txData.forwardingChain.length > 0) {
        txData.forwardingChain.forEach((hop: any, index: number) => {
            console.log(`     ${index + 1}. ${hop.merchant} at ${hop.timestamp}`);
        });
    } else {
        console.log("     (No forwarding yet)");
    }
}

// CLI usage
if (require.main === module) {
    const args = process.argv.slice(2);
    
    if (args[0] === "display") {
        const filename = args[1] || "signed_tx.json";
        displayForwardingChain(filename);
    } else {
        if (args.length < 3) {
            console.log("Usage:");
            console.log("  Forward: ts-node forward_blob.ts <sourceFile> <destFile> <merchantName>");
            console.log("  Display: ts-node forward_blob.ts display <filename>");
            process.exit(1);
        }

        const [sourceFile, destFile, merchantName] = args;
        forwardTransactionBlob(sourceFile, destFile, merchantName);
    }
}


