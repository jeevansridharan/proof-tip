// src/components/SubmissionCard.tsx
// Renders a single submission with upvote, approve/reject, AI evaluate, and reward status.

import React, { useState } from 'react';
import {
    ThumbsUp, CheckCircle, XCircle, Brain, Wallet, Trophy, Clock,
    ChevronDown, ChevronUp,
} from 'lucide-react';
import type { Submission } from '../types';
import { upvoteSubmission, setApproval, setAIScore } from '../services/submissionService';
import { evaluateSubmission } from '../services/aiService';
import { calculateReward } from '../agent/rewardAgent';

interface Props {
    submission: Submission;
    isAdmin: boolean;
    onUpdate: () => void; // refresh parent list
}

const SubmissionCard: React.FC<Props> = ({ submission, isAdmin, onUpdate }) => {
    const [upvoting, setUpvoting] = useState(false);
    const [approving, setApproving] = useState(false);
    const [evaluating, setEvaluating] = useState(false);
    const [expanded, setExpanded] = useState(false);

    // ── Upvote ───────────────────────────────────────────────────────────────────
    async function handleUpvote() {
        if (upvoting) return;
        setUpvoting(true);
        try {
            await upvoteSubmission(submission.id, submission.upvotes);
            onUpdate();
        } catch (err) {
            console.error('Upvote failed:', err);
        } finally {
            setUpvoting(false);
        }
    }

    // ── Approve / Reject ─────────────────────────────────────────────────────────
    async function handleApproval(approved: boolean) {
        if (approving) return;
        setApproving(true);
        try {
            await setApproval(submission.id, approved);
            onUpdate();
        } catch (err) {
            console.error('Approval failed:', err);
        } finally {
            setApproving(false);
        }
    }

    // ── AI Evaluate ──────────────────────────────────────────────────────────────
    async function handleEvaluate() {
        if (evaluating) return;
        setEvaluating(true);
        try {
            const score = await evaluateSubmission(submission.title, submission.description);
            await setAIScore(submission.id, score);
            onUpdate();
        } catch (err) {
            console.error('AI evaluation failed:', err);
        } finally {
            setEvaluating(false);
        }
    }

    // ── Computed helpers ─────────────────────────────────────────────────────────
    const rewardAmount = submission.ai_score !== null ? calculateReward(submission.ai_score) : null;

    const isEligible =
        submission.upvotes >= 5 &&
        submission.isApproved &&
        (submission.ai_score ?? 0) >= 7 &&
        !submission.reward_sent;

    function scoreColor(score: number): string {
        if (score >= 8) return 'text-emerald-400';
        if (score >= 6) return 'text-yellow-400';
        return 'text-red-400';
    }

    // ── Render ───────────────────────────────────────────────────────────────────
    return (
        <article className="glass-card p-5 hover:border-indigo-500/20 transition-all duration-300 group">

            {/* Top row: title + reward badge */}
            <div className="flex items-start justify-between gap-3">
                <h3 className="font-semibold text-white text-base leading-snug group-hover:text-indigo-300 transition-colors">
                    {submission.title}
                </h3>
                {submission.reward_sent ? (
                    <span className="badge bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 whitespace-nowrap">
                        <Trophy className="w-3 h-3" /> Rewarded
                    </span>
                ) : isEligible ? (
                    <span className="badge bg-indigo-500/15 text-indigo-400 border border-indigo-500/30 whitespace-nowrap animate-pulse">
                        <Clock className="w-3 h-3" /> Pending
                    </span>
                ) : null}
            </div>

            {/* Description (collapsible) */}
            <div className="mt-2">
                <p className={`text-sm text-white/50 leading-relaxed ${expanded ? '' : 'line-clamp-2'}`}>
                    {submission.description}
                </p>
                {submission.description.length > 120 && (
                    <button
                        onClick={() => setExpanded(!expanded)}
                        className="mt-1 text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-0.5 transition-colors"
                    >
                        {expanded ? <><ChevronUp className="w-3 h-3" /> Less</> : <><ChevronDown className="w-3 h-3" /> More</>}
                    </button>
                )}
            </div>

            {/* Wallet */}
            <div className="flex items-center gap-1.5 mt-3 text-xs text-white/30 font-mono">
                <Wallet className="w-3 h-3" />
                <span className="truncate max-w-[220px]">{submission.wallet_address}</span>
            </div>

            {/* Stats row */}
            <div className="flex flex-wrap items-center gap-3 mt-4">

                {/* Upvote button */}
                <button
                    id={`upvote-${submission.id}`}
                    onClick={handleUpvote}
                    disabled={upvoting}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-indigo-500/20 border border-white/10 hover:border-indigo-500/40 text-white/70 hover:text-indigo-300 text-sm font-medium transition-all duration-200 disabled:opacity-50"
                >
                    <ThumbsUp className={`w-3.5 h-3.5 ${upvoting ? 'animate-bounce' : ''}`} />
                    {submission.upvotes}
                    {submission.upvotes >= 5 && <span className="text-xs text-emerald-400 ml-1">✓</span>}
                </button>

                {/* Approval status */}
                <span className={`badge ${submission.isApproved
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/25'
                        : 'bg-white/5 text-white/40 border border-white/10'
                    }`}>
                    {submission.isApproved
                        ? <><CheckCircle className="w-3 h-3" /> Approved</>
                        : 'Pending review'}
                </span>

                {/* AI score */}
                {submission.ai_score !== null ? (
                    <span className={`badge bg-white/5 border border-white/10 ${scoreColor(submission.ai_score)}`}>
                        <Brain className="w-3 h-3" />
                        {submission.ai_score}/10
                        {rewardAmount !== null && (
                            <span className="ml-1 text-white/40">→ {rewardAmount} USDT</span>
                        )}
                    </span>
                ) : (
                    <span className="badge bg-white/5 text-white/30 border border-white/10">
                        <Brain className="w-3 h-3" /> Not scored
                    </span>
                )}
            </div>

            {/* Admin controls */}
            {isAdmin && (
                <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-white/5">

                    {/* Approve / Reject */}
                    {!submission.isApproved ? (
                        <button
                            id={`approve-${submission.id}`}
                            onClick={() => handleApproval(true)}
                            disabled={approving}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/30 text-emerald-400 text-xs font-medium transition-all disabled:opacity-50"
                        >
                            <CheckCircle className="w-3.5 h-3.5" />
                            {approving ? 'Processing…' : 'Approve'}
                        </button>
                    ) : (
                        <button
                            id={`reject-${submission.id}`}
                            onClick={() => handleApproval(false)}
                            disabled={approving}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-600/20 hover:bg-red-600/30 border border-red-500/30 text-red-400 text-xs font-medium transition-all disabled:opacity-50"
                        >
                            <XCircle className="w-3.5 h-3.5" />
                            {approving ? 'Processing…' : 'Revoke'}
                        </button>
                    )}

                    {/* AI Evaluate */}
                    {submission.ai_score === null && (
                        <button
                            id={`evaluate-${submission.id}`}
                            onClick={handleEvaluate}
                            disabled={evaluating}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-violet-600/20 hover:bg-violet-600/30 border border-violet-500/30 text-violet-400 text-xs font-medium transition-all disabled:opacity-50"
                        >
                            <Brain className={`w-3.5 h-3.5 ${evaluating ? 'animate-pulse' : ''}`} />
                            {evaluating ? 'Evaluating…' : 'AI Evaluate'}
                        </button>
                    )}
                </div>
            )}
        </article>
    );
};

export default SubmissionCard;
