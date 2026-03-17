// src/services/walletService.ts
// Non-custodial wallet integration stub.
// Replace the body of wallet.send() with your actual blockchain SDK call
// (e.g., ethers.js, web3.js, BCH library, etc.)
// Private keys are NEVER stored in the database — the user must sign via their wallet.

export interface WalletSendParams {
    /** Recipient's blockchain address */
    toAddress: string;
    /** Amount in USDT (or test tokens) */
    amount: number;
    /** Optional memo / note */
    memo?: string;
}

export interface WalletSendResult {
    success: boolean;
    txHash?: string;
    error?: string;
}

/**
 * wallet.send — Dispatch tokens to a wallet address.
 *
 * 🔒 SECURITY NOTE: This is a non-custodial flow.
 * The agent does NOT hold a private key; the signing happens via the
 * connected browser wallet (MetaMask, WalletConnect, etc.).
 *
 * For the hackathon demo this simulates a successful send.
 * Swap the implementation for your real wallet SDK call.
 */
export const wallet = {
    async send(params: WalletSendParams): Promise<WalletSendResult> {
        const { toAddress, amount, memo } = params;

        console.log(`💸 Sending ${amount} USDT to ${toAddress}${memo ? ` | memo: ${memo}` : ''}`);

        /* ─── REPLACE THIS BLOCK WITH YOUR REAL WALLET LOGIC ───────────────────
         *
         * Example (ethers.js):
         *   const provider = new ethers.BrowserProvider(window.ethereum);
         *   const signer   = await provider.getSigner();
         *   const contract = new ethers.Contract(USDT_ADDRESS, ERC20_ABI, signer);
         *   const tx       = await contract.transfer(toAddress, ethers.parseUnits(amount.toString(), 6));
         *   await tx.wait();
         *   return { success: true, txHash: tx.hash };
         *
         * ─────────────────────────────────────────────────────────────────────── */

        // DEMO: simulate network latency then return a fake tx hash
        await new Promise((r) => setTimeout(r, 1200));
        const fakeTxHash = '0x' + Math.random().toString(16).slice(2, 66).padEnd(64, '0');

        return { success: true, txHash: fakeTxHash };
    },
};
