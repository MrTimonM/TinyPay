import { Aptos, AptosConfig, Network } from "@aptos-labs/ts-sdk";

export const APTOS_NETWORK = Network.DEVNET;
export const config = new AptosConfig({ network: APTOS_NETWORK });
export const aptos = new Aptos(config);

// Contract address will be set after deployment
export const MODULE_ADDRESS = process.env.MODULE_ADDRESS || "0x0";
export const MODULE_NAME = "payment";

// Private key for deployment
export const DEPLOYER_PRIVATE_KEY = "0x7e76b51ec4a5ad62a4957f605c97e1d4a1cb6f5b602723f04bcf19f33776b978";


