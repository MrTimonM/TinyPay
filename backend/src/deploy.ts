import { Account, Ed25519PrivateKey } from "@aptos-labs/ts-sdk";
import { aptos, DEPLOYER_PRIVATE_KEY } from "./config";
import * as fs from "fs";
import * as path from "path";
import { execSync } from "child_process";

/**
 * Deploy the TinyPay Move contract to Aptos Devnet
 */
export async function deployContract() {
    try {
        console.log("🚀 Deploying TinyPay Move Contract to Aptos Devnet...\n");

        // Create deployer account from private key
        const privateKey = new Ed25519PrivateKey(DEPLOYER_PRIVATE_KEY);
        const deployer = Account.fromPrivateKey({ privateKey });
        const deployerAddress = deployer.accountAddress.toString();

        console.log(`📍 Deployer Address: ${deployerAddress}`);

        // Fund the account if needed
        console.log("💰 Checking account balance...");
        try {
            const balance = await aptos.getAccountAPTAmount({ accountAddress: deployer.accountAddress });
            console.log(`   Current balance: ${balance / 100_000_000} APT`);
            
            if (balance < 100_000_000) { // Less than 1 APT
                console.log("   Funding account from faucet...");
                await aptos.fundAccount({ accountAddress: deployer.accountAddress, amount: 100_000_000 });
                console.log("   ✅ Account funded!");
            }
        } catch (error) {
            console.log("   Account not found, funding from faucet...");
            await aptos.fundAccount({ accountAddress: deployer.accountAddress, amount: 100_000_000 });
            console.log("   ✅ Account funded!");
        }

        // Update Move.toml with deployer address
        const moveTomlPath = path.join(__dirname, "../../move_contracts/Move.toml");
        let moveToml = fs.readFileSync(moveTomlPath, "utf-8");
        moveToml = moveToml.replace(/tinypay = "_"/, `tinypay = "${deployerAddress}"`);
        fs.writeFileSync(moveTomlPath, moveToml);
        console.log("✅ Updated Move.toml with deployer address\n");

        // Compile the Move module
        console.log("🔨 Compiling Move module...");
        const moveDir = path.join(__dirname, "../../move_contracts");
        
        try {
            execSync("aptos move compile --skip-fetch-latest-git-deps", {
                cwd: moveDir,
                stdio: "inherit",
            });
            console.log("✅ Move module compiled successfully!\n");
        } catch (error) {
            console.error("❌ Compilation failed. Make sure Aptos CLI is installed.");
            throw error;
        }

        // Publish the module using Aptos CLI
        console.log("📦 Publishing module to Aptos Devnet...");
        
        // Create a temporary named profile for this deployment
        const profileName = `tinypay-deployer-${Date.now()}`;
        
        // Configure the profile with our private key
        execSync(`aptos init --profile ${profileName} --private-key ${DEPLOYER_PRIVATE_KEY} --network devnet --skip-faucet --assume-yes`, {
            cwd: moveDir,
            stdio: "inherit",
        });

        // Publish using Aptos CLI
        const publishOutput = execSync(`aptos move publish --profile ${profileName} --assume-yes`, {
            cwd: moveDir,
            encoding: 'utf-8',
        });

        console.log(publishOutput);

        // Extract transaction hash from JSON output
        let txHash = 'unknown';
        try {
            const txHashMatch = publishOutput.match(/"transaction_hash":\s*"(0x[a-fA-F0-9]+)"/);
            if (txHashMatch) {
                txHash = txHashMatch[1];
            }
        } catch (e) {
            console.log("Could not extract transaction hash from output");
        }
        const pendingTxn = { hash: txHash };

        console.log(`⏳ Transaction submitted: ${pendingTxn.hash}`);
        
        // Wait for confirmation
        if (txHashMatch) {
            const executedTxn = await aptos.waitForTransaction({
                transactionHash: pendingTxn.hash,
            });
            console.log(`✅ Transaction confirmed!`);
        }

        console.log(`✅ Contract deployed successfully!`);
        console.log(`\n📍 Contract Address: ${deployerAddress}`);
        console.log(`🔗 Explorer: https://explorer.aptoslabs.com/account/${deployerAddress}?network=devnet`);
        console.log(`📝 Transaction: https://explorer.aptoslabs.com/txn/${pendingTxn.hash}?network=devnet`);

        // Initialize the payment registry
        console.log("\n🔧 Initializing payment registry...");
        const initTx = await aptos.transaction.build.simple({
            sender: deployer.accountAddress,
            data: {
                function: `${deployerAddress}::payment::initialize`,
                functionArguments: [],
            },
        });

        const initPendingTxn = await aptos.signAndSubmitTransaction({
            signer: deployer,
            transaction: initTx,
        });

        await aptos.waitForTransaction({ transactionHash: initPendingTxn.hash });
        console.log("✅ Payment registry initialized!");

        // Save deployment info
        const deploymentInfo = {
            contractAddress: deployerAddress,
            deployerAddress: deployerAddress,
            network: "devnet",
            deployedAt: new Date().toISOString(),
            txHash: pendingTxn.hash,
            explorerUrl: `https://explorer.aptoslabs.com/account/${deployerAddress}?network=devnet`,
        };

        const outputPath = path.join(__dirname, "../../deployment.json");
        fs.writeFileSync(outputPath, JSON.stringify(deploymentInfo, null, 2));
        console.log(`\n💾 Deployment info saved to: ${outputPath}`);

        // Update .env file
        const envPath = path.join(__dirname, "../../.env");
        const envContent = `MODULE_ADDRESS=${deployerAddress}\n`;
        fs.writeFileSync(envPath, envContent);
        console.log(`💾 Updated .env with MODULE_ADDRESS\n`);

        return deploymentInfo;
    } catch (error) {
        console.error("❌ Deployment failed:", error);
        throw error;
    }
}

// CLI usage
if (require.main === module) {
    deployContract().catch(console.error);
}

