import { Account, Ed25519PrivateKey } from "@aptos-labs/ts-sdk";
import { aptos } from "./config";
import { createSignedTransaction, saveSignedTxToFile } from "./sign_offline";
import { verifySignedTransaction, loadAndVerifyFromFile } from "./verify_offline";
import { forwardTransactionBlob, displayForwardingChain } from "./forward_blob";
import { broadcastTransaction, loadAndBroadcast } from "./broadcast_online";
import * as fs from "fs";
import * as path from "path";

/**
 * Complete demo flow showing offline-to-online payment
 */
export async function runDemoFlow() {
    console.log("╔══════════════════════════════════════════════════════════╗");
    console.log("║        TinyPay - Offline Payment Demo Flow              ║");
    console.log("║   Crypto Payments Without Internet Connection 📱💸       ║");
    console.log("╚══════════════════════════════════════════════════════════╝\n");

    // Load deployment info
    const deploymentPath = path.join(__dirname, "../../deployment.json");
    if (!fs.existsSync(deploymentPath)) {
        console.error("❌ Deployment info not found. Please run deploy.ts first.");
        return;
    }

    const deployment = JSON.parse(fs.readFileSync(deploymentPath, "utf-8"));
    const registryAddress = deployment.contractAddress;

    console.log(`📍 Using contract at: ${registryAddress}\n`);

    // Generate test accounts
    console.log("👤 Generating test accounts...");
    const user = Account.generate();
    const merchant1 = Account.generate();
    const merchant2 = Account.generate();
    const merchant3 = Account.generate();

    console.log(`   User:      ${user.accountAddress.toString()}`);
    console.log(`   Merchant1: ${merchant1.accountAddress.toString()}`);
    console.log(`   Merchant2: ${merchant2.accountAddress.toString()}`);
    console.log(`   Merchant3: ${merchant3.accountAddress.toString()}\n`);

    // Fund accounts
    console.log("💰 Funding test accounts from faucet...");
    await aptos.fundAccount({ accountAddress: user.accountAddress, amount: 500_000_000 }); // 5 APT
    await aptos.fundAccount({ accountAddress: merchant1.accountAddress, amount: 100_000_000 });
    await aptos.fundAccount({ accountAddress: merchant2.accountAddress, amount: 100_000_000 });
    await aptos.fundAccount({ accountAddress: merchant3.accountAddress, amount: 100_000_000 });
    console.log("✅ All accounts funded!\n");

    await sleep(2000);

    // Step 1: User creates offline payment
    console.log("═══════════════════════════════════════════════════════════");
    console.log("STEP 1: User creates offline payment 📱❌📡");
    console.log("═══════════════════════════════════════════════════════════");
    
    const amount = 2.5; // APT
    const nonce = Date.now();
    
    const { signedTxHex, txDetails } = await createSignedTransaction(
        user.privateKey.toString(),
        merchant3.accountAddress.toString(),
        amount,
        nonce,
        registryAddress
    );

    saveSignedTxToFile(signedTxHex, txDetails, "user_payment.json");
    console.log("📱 QR Code generated (simulated)");
    
    await sleep(2000);

    // Step 2: Merchant1 verifies offline
    console.log("\n═══════════════════════════════════════════════════════════");
    console.log("STEP 2: Merchant1 scans & verifies (offline) 🏪❌📡");
    console.log("═══════════════════════════════════════════════════════════");
    
    const isValid = loadAndVerifyFromFile("user_payment.json");
    if (!isValid) {
        console.error("❌ Verification failed! Stopping demo.");
        return;
    }

    await sleep(2000);

    // Step 3: Forward to Merchant2
    console.log("\n═══════════════════════════════════════════════════════════");
    console.log("STEP 3: Merchant1 forwards to Merchant2 (offline) 🏪➡️🏪");
    console.log("═══════════════════════════════════════════════════════════");
    
    forwardTransactionBlob("user_payment.json", "merchant2_payment.json", "Merchant1");
    
    await sleep(2000);

    // Step 4: Forward to Merchant3
    console.log("\n═══════════════════════════════════════════════════════════");
    console.log("STEP 4: Merchant2 forwards to Merchant3 (offline) 🏪➡️🏪");
    console.log("═══════════════════════════════════════════════════════════");
    
    forwardTransactionBlob("merchant2_payment.json", "merchant3_payment.json", "Merchant2");
    displayForwardingChain("merchant3_payment.json");
    
    await sleep(2000);

    // Step 5: Merchant3 broadcasts online
    console.log("\n═══════════════════════════════════════════════════════════");
    console.log("STEP 5: Merchant3 broadcasts to blockchain (online) 🏪✅📡");
    console.log("═══════════════════════════════════════════════════════════");
    
    const result = await loadAndBroadcast("merchant3_payment.json");
    
    if (!result?.success) {
        console.error("❌ Broadcast failed!");
        return;
    }

    await sleep(3000);

    // Step 6: Double-spend prevention demo
    console.log("\n═══════════════════════════════════════════════════════════");
    console.log("STEP 6: Double-spend prevention demo 🚫");
    console.log("═══════════════════════════════════════════════════════════");
    
    console.log("🔄 Attempting to reuse the same signed transaction (same nonce)...");
    
    const doubleSpendResult = await broadcastTransaction(signedTxHex);
    
    if (!doubleSpendResult.success) {
        console.log("\n✅ SUCCESS: Double-spend prevented by smart contract!");
        console.log("   The same nonce cannot be used twice.");
        console.log("   Error: " + doubleSpendResult.error);
    } else {
        console.log("\n⚠️  WARNING: Double-spend was not prevented (unexpected)");
    }

    console.log("\n╔══════════════════════════════════════════════════════════╗");
    console.log("║              Demo Complete! 🎉                           ║");
    console.log("╚══════════════════════════════════════════════════════════╝");
    console.log("\n✅ Demonstrated:");
    console.log("   1. Offline transaction creation (User)");
    console.log("   2. Offline signature verification (Merchant1)");
    console.log("   3. Offline transaction forwarding (Merchant1→2→3)");
    console.log("   4. Online broadcast to blockchain (Merchant3)");
    console.log("   5. Double-spend prevention (Contract)");
    console.log(`\n🔗 View on Explorer: ${result.explorerUrl}\n`);
}

function sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// CLI usage
if (require.main === module) {
    runDemoFlow().catch(console.error);
}


