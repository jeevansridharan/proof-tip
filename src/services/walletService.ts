// src/services/walletService.ts
// Tether Wallet Development Kit (WDK) integration for sending USDT.
// This module provides a non-custodial wallet manager to send real transactions.

import WalletManagerEvm from '@tetherto/wdk-wallet-evm';
import { Wallet } from 'ethers';

// --- ENVIRONMENT CONFIGURATION ---
const MNEMONIC = import.meta.env.VITE_WDK_MNEMONIC || process.env.VITE_WDK_MNEMONIC;
const RPC_URL = import.meta.env.VITE_WDK_RPC_URL || process.env.VITE_WDK_RPC_URL;
const USDT_CONTRACT = import.meta.env.VITE_WDK_USDT_ADDRESS || process.env.VITE_WDK_USDT_ADDRESS;
const USDT_DECIMALS = parseInt(import.meta.env.VITE_WDK_USDT_DECIMALS || process.env.VITE_WDK_USDT_DECIMALS || '6', 10);

/**
 * Validates that all required environment variables are present.
 */
function validateEnv() {
    if (!MNEMONIC) throw new Error('VITE_WDK_MNEMONIC is missing from environment variables.');
    if (!RPC_URL) throw new Error('VITE_WDK_RPC_URL is missing from environment variables.');
    if (!USDT_CONTRACT) throw new Error('VITE_WDK_USDT_ADDRESS is missing from environment variables.');
}

export interface WalletSendParams {
    /** Recipient's blockchain address (e.g., 0x...) */
    toAddress: string;
    /** Amount in USDT (e.g., 1.5) */
    amount: number;
    /** Optional memo / note (note: not all EVM chains natively show this in tx) */
    memo?: string;
}

export interface WalletSendResult {
    success: boolean;
    txHash?: string;
    error?: string;
}

/**
 * Real WDK Integration
 */
let manager: WalletManagerEvm | null = null;

/**
 * Initializes the WDK manager if not already initialized.
 */
export function initWallet() {
    if (manager) return manager;

    validateEnv();

    manager = new WalletManagerEvm(MNEMONIC!, {
        provider: RPC_URL!,
    });

    console.log('💎 Tether WDK Wallet initialized.');
    return manager;
}

/**
 * Retrieves the public address of the default account (index 0).
 */
export async function getWalletAddress(): Promise<string> {
    const mgr = initWallet();
    const account = await mgr.getAccount(0);
    return await account.getAddress();
}

/**
 * Executes a real USDT transfer using the WDK.
 */
export async function sendUSDT(params: WalletSendParams): Promise<WalletSendResult> {
    const { toAddress, amount } = params;

    try {
        const mgr = initWallet();
        const account = await mgr.getAccount(0);
        const fromAddr = await account.getAddress();

        console.log(`💸 WDK: Sending ${amount} USDT from ${fromAddr} to ${toAddress}...`);

        // Convert human-readable amount (e.g., 1.5) to base units (e.g., 1,500,000)
        const baseAmount = BigInt(Math.floor(amount * Math.pow(10, USDT_DECIMALS)));

        // Execute the transfer via WDK
        const transferResult = await account.transfer({
            token: USDT_CONTRACT!,
            recipient: toAddress,
            amount: baseAmount,
        });

        console.log(`   ✅ Transaction Hash: ${transferResult.hash}`);
        return {
            success: true,
            txHash: transferResult.hash
        };

    } catch (err: any) {
        console.error('   ❌ WDK Transaction Failed:', err.message || err);
        return {
            success: false,
            error: err.message || 'Unknown WDK error'
        };
    }
}

/**
 * Generates a completely new, secure EVM wallet with a 12-word mnemonic.
 */
export async function createNewUserWallet() {
    const w = Wallet.createRandom();
    return {
        address: w.address,
        mnemonic: w.mnemonic?.phrase || '',
        privateKey: w.privateKey,
    };
}

/**
 * Legacy compatibility object (for existing rewardAgent references)
 */
export const wallet = {
    send: sendUSDT,
    generate: createNewUserWallet
};
