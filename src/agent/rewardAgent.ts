// src/agent/rewardAgent.ts
// The ProofTip AI Reward Agent.
// Periodically (or on-demand) checks eligible submissions and dispatches rewards automatically.
// No manual reward button — the agent drives everything.

import { fetchEligibleSubmissions, markRewardSent } from '../services/submissionService';
import { wallet } from '../services/walletService';
import type { Submission } from '../types';

/**
 * Calculate the token reward from the AI score.
 * Formula: reward = ai_score * 5 (USDT / test tokens)
 */
export function calculateReward(aiScore: number): number {
    return Math.round(aiScore * 5 * 100) / 100; // round to 2 decimals
}

/**
 * Process a single eligible submission:
 * 1. Calculate reward amount
 * 2. Send tokens via wallet.send()
 * 3. Mark reward_sent = true in the database
 */
async function processSubmission(submission: Submission): Promise<void> {
    const aiScore = submission.ai_score ?? 0;
    const amount = calculateReward(aiScore);

    console.log(`🤖 Agent: Processing reward for "${submission.title}"`);
    console.log(`   Wallet: ${submission.wallet_address}`);
    console.log(`   Score:  ${aiScore} → Reward: ${amount} USDT`);

    const result = await wallet.send({
        toAddress: submission.wallet_address,
        amount,
        memo: `ProofTip reward for: ${submission.title}`,
    });

    if (result.success) {
        console.log(`   ✅ Sent! TX: ${result.txHash}`);
        await markRewardSent(submission.id);
    } else {
        console.error(`   ❌ Transaction failed: ${result.error}`);
        throw new Error(result.error ?? 'wallet.send failed');
    }
}

/**
 * checkAndReward — Core agent loop.
 * Fetches all eligible (upvotes >= 5, approved, ai_score >= 7, not yet rewarded)
 * submissions and dispatches rewards automatically.
 *
 * Call this function:
 *  • on a timer (setInterval)
 *  • when any DB update occurs (Supabase realtime subscription)
 *  • on page load after fetching data
 */
export async function checkAndReward(): Promise<{ processed: number; errors: number }> {
    console.log('🔍 Agent: Scanning for eligible submissions…');

    let processed = 0;
    let errors = 0;

    try {
        const eligible = await fetchEligibleSubmissions();

        if (eligible.length === 0) {
            console.log('   No eligible submissions found.');
            return { processed, errors };
        }

        console.log(`   Found ${eligible.length} eligible submission(s).`);

        // Process rewards sequentially to avoid tx nonce conflicts
        for (const submission of eligible) {
            try {
                await processSubmission(submission);
                processed++;
            } catch (err) {
                console.error(`   Error processing submission ${submission.id}:`, err);
                errors++;
            }
        }
    } catch (err) {
        console.error('Agent: Failed to fetch eligible submissions:', err);
        errors++;
    }

    console.log(`🤖 Agent run complete — processed: ${processed}, errors: ${errors}`);
    return { processed, errors };
}

/**
 * startAgentLoop — Starts the periodic agent check.
 * @param intervalMs  Check interval in milliseconds (default: 30 seconds)
 * @returns A cleanup function that stops the loop when called.
 */
export function startAgentLoop(intervalMs = 30_000): () => void {
    console.log(`🤖 Agent loop started (every ${intervalMs / 1000}s)`);

    // Run immediately on start
    checkAndReward();

    const id = setInterval(checkAndReward, intervalMs);

    // Return cleanup function
    return () => {
        clearInterval(id);
        console.log('🤖 Agent loop stopped.');
    };
}
