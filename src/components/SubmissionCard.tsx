// src/components/SubmissionCard.tsx
// Renders a single submission with upvote, approve/reject, AI evaluate, and reward status.

import React, { useState } from 'react';
import {
    ThumbsUp, CheckCircle, XCircle, Brain, Wallet, Trophy, Clock,
    ChevronDown, ChevronUp, Sparkles, TrendingUp, Shield, AlertTriangle,
} from 'lucide-react';
import type { Submission } from '../types';
import { upvoteSubmission, setApproval, setAIScore } from '../services/submissionService';
import { evaluateSubmission } from '../services/aiService';
import { calculateReward, calculateTrustScore, calculateRiskScore } from '../agent/rewardAgent';

interface Props {
    submission: Submission;
    isAdmin: boolean;
    onUpdate: () => void;
}

const SubmissionCard: React.FC<Props> = ({ submission, isAdmin, onUpdate }) => {
    const [upvoting, setUpvoting] = useState(false);
    const [approving, setApproving] = useState(false);
    const [evaluating, setEvaluating] = useState(false);
    const [expanded, setExpanded] = useState(false);
    const [justUpvoted, setJustUpvoted] = useState(false);

    async function handleUpvote() {
        if (upvoting) return;
        setUpvoting(true);
        setJustUpvoted(true);
        try {
            await upvoteSubmission(submission.id, submission.upvotes);
            onUpdate();
        } catch (err) { console.error('Upvote failed:', err); }
        finally {
            setUpvoting(false);
            setTimeout(() => setJustUpvoted(false), 600);
        }
    }

    async function handleApproval(approved: boolean) {
        if (approving) return;
        setApproving(true);
        try { await setApproval(submission.id, approved); onUpdate(); }
        catch (err) { console.error('Approval failed:', err); }
        finally { setApproving(false); }
    }

    async function handleEvaluate() {
        if (evaluating) return;
        setEvaluating(true);
        try {
            const score = await evaluateSubmission(submission.title, submission.description);
            await setAIScore(submission.id, score);
            onUpdate();
        } catch (err) { console.error('AI evaluation failed:', err); }
        finally { setEvaluating(false); }
    }

    // ── Computed metrics ───────────────────────────────────────────────────────
    // Trust/risk are computed from single submission for display
    const mockHistory = [submission];
    const trustScore = calculateTrustScore(mockHistory);
    const riskScore = calculateRiskScore(mockHistory, trustScore);
    const rewardAmount = submission.ai_score !== null
        ? calculateReward(submission, trustScore)
        : null;

    const isEligible = submission.upvotes >= 5 && submission.isApproved
        && (submission.ai_score ?? 0) >= 7 && !submission.reward_sent;

    function scoreColor(score: number) {
        if (score >= 8) return 'text-emerald-400';
        if (score >= 6) return 'text-yellow-400';
        return 'text-red-400';
    }

    function scoreGradient(score: number) {
        if (score >= 8) return 'from-emerald-500 to-cyan-500';
        if (score >= 6) return 'from-yellow-500 to-amber-500';
        return 'from-red-500 to-pink-500';
    }

    const riskLabel = riskScore < 0.3 ? 'Low' : riskScore < 0.6 ? 'Medium' : 'High';
    const riskColor = riskScore < 0.3 ? 'text-emerald-400' : riskScore < 0.6 ? 'text-amber-400' : 'text-red-400';

    // Short wallet display
    const shortWallet = submission.wallet_address.length > 16
        ? `${submission.wallet_address.slice(0, 8)}…${submission.wallet_address.slice(-6)}`
        : submission.wallet_address;

    return (
        <article className="glass-card p-5 hover-lift hover:border-indigo-500/20 transition-all duration-300 group relative overflow-hidden">
            {/* Reward glow overlay */}
            {submission.reward_sent && (
                <div className="absolute inset-0 pointer-events-none rounded-[1.25rem] border border-emerald-500/30 bg-gradient-to-br from-emerald-500/[0.04] to-transparent" />
            )}

            {/* ── Top row ──────────────────────────────────────────────── */}
            <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-white text-base leading-snug group-hover:text-indigo-300 transition-colors line-clamp-1">
                        {submission.title}
                    </h3>
                    <div className="flex items-center gap-1.5 mt-1">
                        <Wallet className="w-2.5 h-2.5 text-white/20 flex-shrink-0" />
                        <span className="text-[11px] text-white/25 font-mono">{shortWallet}</span>
                    </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                    {submission.reward_sent ? (
                        <span className="badge bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                            <Trophy className="w-2.5 h-2.5" /> Rewarded
                        </span>
                    ) : isEligible ? (
                        <span className="badge bg-indigo-500/15 text-indigo-400 border border-indigo-500/30 animate-pulse">
                            <Clock className="w-2.5 h-2.5" /> Pending
                        </span>
                    ) : null}
                </div>
            </div>

            {/* ── Description ─────────────────────────────────────────── */}
            <div className="mt-3">
                <p className={`text-sm text-white/45 leading-relaxed ${expanded ? '' : 'line-clamp-2'}`}>
                    {submission.description}
                </p>
                {submission.description.length > 120 && (
                    <button
                        onClick={() => setExpanded(!expanded)}
                        className="mt-1.5 text-xs text-indigo-400/70 hover:text-indigo-300 flex items-center gap-0.5 transition-colors"
                    >
                        {expanded ? <><ChevronUp className="w-3 h-3" /> Show less</> : <><ChevronDown className="w-3 h-3" /> Read more</>}
                    </button>
                )}
            </div>

            {/* ── Metrics row ──────────────────────────────────────────── */}
            <div className="flex flex-wrap items-center gap-2 mt-4">

                {/* Upvote */}
                <button
                    id={`upvote-${submission.id}`}
                    onClick={handleUpvote}
                    disabled={upvoting}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-sm font-semibold transition-all duration-200 disabled:opacity-50 ${justUpvoted
                            ? 'bg-indigo-500/25 border-indigo-400/40 text-indigo-300 scale-105'
                            : submission.upvotes >= 5
                                ? 'bg-emerald-500/10 border-emerald-500/25 text-emerald-400 hover:bg-emerald-500/20'
                                : 'bg-white/5 border-white/10 text-white/60 hover:bg-indigo-500/15 hover:border-indigo-500/30 hover:text-indigo-300'
                        }`}
                >
                    <ThumbsUp className={`w-3.5 h-3.5 ${upvoting ? 'animate-bounce' : ''}`} />
                    {submission.upvotes}
                    {submission.upvotes >= 5 && <span className="text-xs text-emerald-400">✓</span>}
                </button>

                {/* Approval */}
                <span className={`badge ${submission.isApproved
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/25'
                        : 'bg-white/[0.04] text-white/30 border border-white/[0.08]'
                    }`}>
                    {submission.isApproved ? <><CheckCircle className="w-2.5 h-2.5" /> Approved</> : 'Awaiting review'}
                </span>

                {/* AI Score */}
                {submission.ai_score !== null ? (
                    <span className={`badge bg-white/[0.04] border border-white/[0.08] ${scoreColor(submission.ai_score)}`}>
                        <Brain className="w-2.5 h-2.5" />
                        {submission.ai_score}/10
                        {rewardAmount !== null && rewardAmount > 0 && (
                            <span className="ml-1 text-white/30">· {rewardAmount} USDT</span>
                        )}
                    </span>
                ) : (
                    <span className="badge bg-white/[0.04] text-white/20 border border-white/[0.06]">
                        <Brain className="w-2.5 h-2.5" /> Not scored
                    </span>
                )}

                {/* Risk indicator */}
                <span className={`badge bg-white/[0.04] border border-white/[0.06] ${riskColor} text-[10px]`}>
                    {riskScore < 0.3
                        ? <Shield className="w-2.5 h-2.5" />
                        : <AlertTriangle className="w-2.5 h-2.5" />}
                    Risk: {riskLabel}
                </span>
            </div>

            {/* ── Score bar (if scored) ──────────────────────────────── */}
            {submission.ai_score !== null && (
                <div className="mt-3">
                    <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] text-white/25 font-medium">AI Quality Score</span>
                        <span className={`text-[11px] font-bold ${scoreColor(submission.ai_score)}`}>{submission.ai_score}/10</span>
                    </div>
                    <div className="h-1 rounded-full bg-white/[0.05] overflow-hidden">
                        <div
                            className={`h-full rounded-full bg-gradient-to-r ${scoreGradient(submission.ai_score)} transition-all duration-1000`}
                            style={{ width: `${(submission.ai_score / 10) * 100}%` }}
                        />
                    </div>
                </div>
            )}

            {/* ── Admin controls ────────────────────────────────────── */}
            {isAdmin && (
                <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-white/[0.05]">
                    {!submission.isApproved ? (
                        <button
                            id={`approve-${submission.id}`}
                            onClick={() => handleApproval(true)}
                            disabled={approving}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600/15 hover:bg-emerald-600/25 border border-emerald-500/25 text-emerald-400 text-xs font-semibold transition-all disabled:opacity-50"
                        >
                            <CheckCircle className="w-3 h-3" />
                            {approving ? 'Processing…' : 'Approve'}
                        </button>
                    ) : (
                        <button
                            id={`reject-${submission.id}`}
                            onClick={() => handleApproval(false)}
                            disabled={approving}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-600/15 hover:bg-red-600/25 border border-red-500/25 text-red-400 text-xs font-semibold transition-all disabled:opacity-50"
                        >
                            <XCircle className="w-3 h-3" />
                            {approving ? 'Processing…' : 'Revoke'}
                        </button>
                    )}

                    {submission.ai_score === null && (
                        <button
                            id={`evaluate-${submission.id}`}
                            onClick={handleEvaluate}
                            disabled={evaluating}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-violet-600/15 hover:bg-violet-600/25 border border-violet-500/25 text-violet-400 text-xs font-semibold transition-all disabled:opacity-50"
                        >
                            <Sparkles className={`w-3 h-3 ${evaluating ? 'animate-spin' : ''}`} />
                            {evaluating ? 'Evaluating…' : 'AI Evaluate'}
                        </button>
                    )}

                    {/* Reward preview */}
                    {rewardAmount !== null && rewardAmount > 0 && (
                        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold ml-auto">
                            <TrendingUp className="w-3 h-3" />
                            Est. {rewardAmount} USDT
                        </div>
                    )}
                </div>
            )}
        </article>
    );
};

export default SubmissionCard;
