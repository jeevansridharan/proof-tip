// src/agent/rewardAgent.ts
// The ProofTip AI Reward Agent.
// Upgraded Intelligent Decision-Making System

import { markRewardSent } from '../services/submissionService';
import { wallet } from '../services/walletService';
import type { Submission } from '../types';
import { supabase } from '../lib/supabase';

/**
 * calculateTrustScore
 * Evaluates the reliability of the user based on their historical performance.
 * Formula: (number of successful rewarded submissions) / (total submissions).
 * Range: 0 to 1. 
 * A minimum of 0.1 is returned to prevent absolute zeroing of rewards for users 
 * who are rebuilding trust or making their first submission.
 * 
 * @param userHistory - Array of all past submissions by this wallet.
 */
export function calculateTrustScore(userHistory: Submission[]): number {
    const totalSubmissions = userHistory.length;
    
    // Default trust for brand new users with no history whatsoever
    if (totalSubmissions === 0) return 0.5;

    const successful = userHistory.filter(s => s.reward_sent).length;
    
    // Default baseline for the very first submission to prevent multiplying by zero
    if (successful === 0 && totalSubmissions === 1) return 0.5;

    const rawTrust = successful / totalSubmissions;
    
    // Ensure trust score is strictly between 0 and 1, but at least 0.1 to allow rebuilding
    return Math.max(0.1, Math.min(rawTrust, 1));
}

/**
 * calculateRiskScore
 * Determines the likelihood of spam or abuse for the current submission.
 * High risk if there is a burst of activity in a short time, or low trust.
 * Range: 0 to 1.
 * 
 * @param userHistory - Array of all past submissions by this wallet.
 * @param trustScore - The trust score previously computed for this user.
 */
export function calculateRiskScore(userHistory: Submission[], trustScore: number): number {
    // 1. Volume Risk: Count how many submissions were created in the last 24 hours
    const now = Date.now();
    const recentSubmissions = userHistory.filter(s => {
        if (!s.created_at) return false;
        const submitTime = new Date(s.created_at).getTime();
        return (now - submitTime) < 24 * 60 * 60 * 1000;
    });

    // Submitting >= 5 ideas in 24 hours maxes out the volume risk (1.0)
    const volumeRisk = Math.min(recentSubmissions.length / 5, 1);
    
    // 2. Trust Risk: Inversely proportional to trust score
    const trustRisk = 1 - trustScore;

    // Combine volume and trust risks (50/50 weighting)
    const riskScore = (volumeRisk * 0.5) + (trustRisk * 0.5);

    // Keep it clamped between 0 and 1
    return Math.max(0, Math.min(riskScore, 1));
}

/**
 * calculateReward
 * Dynamic AI-driven reward formula.
 * Formula: baseReward * aiScore * (1 + log(upvotes + 1)) * trustScore
 * 
 * @param submission - The current submission being evaluated.
 * @param trustScore - The user's trust score.
 * @param baseReward - The foundational token constant (default: 5).
 */
export function calculateReward(submission: Submission, trustScore: number, baseReward: number = 5): number {
    const aiScore = submission.ai_score ?? 0;
    const upvotes = submission.upvotes ?? 0;

    // Log function adds a diminishing returns multiplier to high upvote counts
    const rawReward = baseReward * aiScore * (1 + Math.log(upvotes + 1)) * trustScore;

    // Round to 2 decimal places (USDT/token format)
    return Math.round(rawReward * 100) / 100;
}

/**
 * shouldAutoPay
 * Logic to dynamically skip manual mentor approval for low-risk submissions.
 * 
 * @param riskScore - The user's risk score (0 to 1).
 */
export function shouldAutoPay(riskScore: number): boolean {
    return riskScore < 0.3;
}

/**
 * Helper: Fetch the complete submission history for a given wallet address.
 */
async function fetchUserHistory(walletAddress: string): Promise<Submission[]> {
    const { data, error } = await supabase
        .from('submissions')
        .select('*')
        .eq('wallet_address', walletAddress);

    if (error) throw error;
    return (data ?? []) as Submission[];
}

/**
 * Helper: Fetch all unrewarded submissions that meet the basic threshold requirements. 
 * We check mentor approval conditionally inside processSubmission.
 */
async function fetchPendingSubmissions(): Promise<Submission[]> {
    const { data, error } = await supabase
        .from('submissions')
        .select('*')
        .gte('upvotes', 5)
        .gte('ai_score', 7)
        .eq('reward_sent', false);

    if (error) throw error;
    return (data ?? []) as Submission[];
}

/**
 * Core Logic: Evaluate and process a single submission with intelligence.
 */
async function processSubmission(submission: Submission): Promise<void> {
    const aiScore = submission.ai_score ?? 0;

    // 1. Gather historical context for the user
    const history = await fetchUserHistory(submission.wallet_address);

    // 2. Intelligence Module: Calculate Trust and Risk
    const trustScore = calculateTrustScore(history);
    const riskScore = calculateRiskScore(history, trustScore);

    console.log(`🤖 Agent: Analyzing "${submission.title}"`);
    console.log(`   └─ Wallet: ${submission.wallet_address}`);
    console.log(`   └─ Trust Score: ${trustScore.toFixed(2)} | Risk Score: ${riskScore.toFixed(2)}`);

    // 3. Conditional Payment Logic
    const isApproved = Boolean(submission.isApproved);
    const autoPayEnabled = shouldAutoPay(riskScore);

    if (autoPayEnabled) {
        console.log(`   └─ 🟢 Low Risk. Auto-Pay Enabled (No mentor approval required)`);
    } else {
        if (!isApproved) {
            console.log(`   └─ ⚠️ High Risk (${riskScore.toFixed(2)} >= 0.3). Requires Mentor Approval. Skipping payment for now.`);
            return; // Exit and wait for a mentor to flip isApproved to true
        } else {
            console.log(`   └─ 🛡️ Mentor Override: Submission explicitly approved despite risk.`);
        }
    }

    // 4. Calculate Dynamic Reward
    const amount = calculateReward(submission, trustScore);

    if (amount <= 0) {
        console.log(`   └─ 💸 Calculated reward is 0. Skipping transaction.`);
        return;
    }

    console.log(`   └─ 💎 AI Score: ${aiScore} | Upvotes: ${submission.upvotes} → Reward: ${amount} USDT`);

    // 5. Execute Transaction
    const result = await wallet.send({
        toAddress: submission.wallet_address,
        amount,
        memo: `ProofTip reward for: ${submission.title}`,
    });

    if (result.success) {
        console.log(`   ✅ Sent! TX: ${result.txHash}\n`);
        await markRewardSent(submission.id);
    } else {
        console.error(`   ❌ Transaction failed: ${result.error}\n`);
        throw new Error(result.error ?? 'wallet.send failed');
    }
}

/**
 * checkAndReward — Main agent loop.
 * Upgraded from rule-based to a dynamic, intelligent decision-making engine.
 */
export async function checkAndReward(): Promise<{ processed: number; errors: number }> {
    console.log('🔍 Agent: Scanning for pending submissions…');

    let processed = 0;
    let errors = 0;

    try {
        const pending = await fetchPendingSubmissions();

        if (pending.length === 0) {
            console.log('   No pending submissions found.');
            return { processed, errors };
        }

        console.log(`   Found ${pending.length} pending submission(s) for intelligent analysis.`);

        // Process rewards sequentially to prevent nonce collision
        for (const submission of pending) {
            try {
                await processSubmission(submission);
                processed++;
            } catch (err) {
                console.error(`   Error processing submission ${submission.id}:`, err);
                errors++;
            }
        }
    } catch (err) {
        console.error('Agent: Failed to fetch pending submissions:', err);
        errors++;
    }

    console.log(`🤖 Agent loop complete — processed: ${processed}, errors: ${errors}`);
    return { processed, errors };
}

/**
 * startAgentLoop — Kicks off the continuous agent execution.
 */
export function startAgentLoop(intervalMs = 30_000): () => void {
    console.log(`🤖 Intelligent Agent loop started (every ${intervalMs / 1000}s)`);

    // Fire immediately upon startup
    checkAndReward();

    const id = setInterval(checkAndReward, intervalMs);

    return () => {
        clearInterval(id);
        console.log('🤖 Intelligent Agent loop stopped.');
    };
}
