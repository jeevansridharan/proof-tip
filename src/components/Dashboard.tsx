// src/components/Dashboard.tsx
// Displays the live submission feed, stats bar, and admin toggle.

import React, { useEffect, useState, useCallback } from 'react';
import { RefreshCw, LayoutDashboard, Shield, ShieldOff, Zap } from 'lucide-react';
import { fetchSubmissions } from '../services/submissionService';
import { checkAndReward } from '../agent/rewardAgent';
import type { Submission } from '../types';
import SubmissionCard from './SubmissionCard';

const Dashboard: React.FC = () => {
    const [submissions, setSubmissions] = useState<Submission[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);
    const [agentRunning, setAgentRunning] = useState(false);
    const [agentResult, setAgentResult] = useState<string | null>(null);

    // ── Fetch data ───────────────────────────────────────────────────────────────
    const loadSubmissions = useCallback(async () => {
        try {
            const data = await fetchSubmissions();
            setSubmissions(data);
        } catch (err) {
            console.error('Failed to load submissions:', err);
        }
    }, []);

    useEffect(() => {
        loadSubmissions().finally(() => setLoading(false));
    }, [loadSubmissions]);

    async function handleRefresh() {
        setRefreshing(true);
        await loadSubmissions();
        setRefreshing(false);
    }

    // ── Manual agent trigger (for demo) ─────────────────────────────────────────
    async function handleRunAgent() {
        setAgentRunning(true);
        setAgentResult(null);
        try {
            const result = await checkAndReward();
            setAgentResult(`✅ Agent ran: ${result.processed} rewarded, ${result.errors} errors.`);
            await loadSubmissions();
        } catch {
            setAgentResult('❌ Agent run failed.');
        } finally {
            setAgentRunning(false);
            setTimeout(() => setAgentResult(null), 5000);
        }
    }

    // ── Stats ────────────────────────────────────────────────────────────────────
    const stats = {
        total: submissions.length,
        approved: submissions.filter((s) => s.isApproved).length,
        rewarded: submissions.filter((s) => s.reward_sent).length,
        pending: submissions.filter(
            (s) => s.upvotes >= 5 && s.isApproved && (s.ai_score ?? 0) >= 7 && !s.reward_sent
        ).length,
    };

    // ── Render ───────────────────────────────────────────────────────────────────
    return (
        <section className="w-full max-w-5xl mx-auto px-4">

            {/* Section header */}
            <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
                <div className="flex items-center gap-2">
                    <LayoutDashboard className="w-5 h-5 text-indigo-400" />
                    <h2 className="text-xl font-bold text-white">Live Dashboard</h2>
                    <span className="badge bg-indigo-500/15 text-indigo-400 border border-indigo-500/25 ml-1">
                        {stats.total} ideas
                    </span>
                </div>

                <div className="flex items-center gap-2">
                    {/* Admin toggle */}
                    <button
                        id="toggle-admin-btn"
                        onClick={() => setIsAdmin(!isAdmin)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${isAdmin
                                ? 'bg-amber-500/20 border-amber-500/40 text-amber-400 hover:bg-amber-500/30'
                                : 'bg-white/5 border-white/10 text-white/50 hover:bg-white/10'
                            }`}
                    >
                        {isAdmin ? <Shield className="w-3.5 h-3.5" /> : <ShieldOff className="w-3.5 h-3.5" />}
                        {isAdmin ? 'Admin ON' : 'Admin OFF'}
                    </button>

                    {/* Run agent (demo trigger) */}
                    <button
                        id="run-agent-btn"
                        onClick={handleRunAgent}
                        disabled={agentRunning}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-violet-600/20 hover:bg-violet-600/30 border border-violet-500/30 text-violet-400 text-xs font-medium transition-all disabled:opacity-50"
                    >
                        <Zap className={`w-3.5 h-3.5 ${agentRunning ? 'animate-pulse' : ''}`} />
                        {agentRunning ? 'Running…' : 'Run Agent'}
                    </button>

                    {/* Refresh */}
                    <button
                        id="refresh-btn"
                        onClick={handleRefresh}
                        disabled={refreshing}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-white/50 text-xs font-medium transition-all disabled:opacity-50"
                    >
                        <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
                        Refresh
                    </button>
                </div>
            </div>

            {/* Agent result message */}
            {agentResult && (
                <div className="mb-4 px-4 py-2 rounded-lg bg-violet-500/10 border border-violet-500/25 text-violet-300 text-sm">
                    {agentResult}
                </div>
            )}

            {/* Stats bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                {[
                    { label: 'Total', value: stats.total, color: 'text-white' },
                    { label: 'Approved', value: stats.approved, color: 'text-emerald-400' },
                    { label: 'Pending', value: stats.pending, color: 'text-indigo-400' },
                    { label: 'Rewarded', value: stats.rewarded, color: 'text-yellow-400' },
                ].map(({ label, value, color }) => (
                    <div key={label} className="glass-card px-4 py-3 text-center">
                        <p className={`text-2xl font-bold ${color}`}>{value}</p>
                        <p className="text-xs text-white/40 mt-0.5">{label}</p>
                    </div>
                ))}
            </div>

            {/* Submission list */}
            {loading ? (
                <div className="grid gap-3">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="glass-card p-5 shimmer h-36 rounded-2xl" />
                    ))}
                </div>
            ) : submissions.length === 0 ? (
                <div className="glass-card p-12 text-center">
                    <p className="text-white/40 text-sm">No submissions yet. Be the first to submit your idea! 🚀</p>
                </div>
            ) : (
                <div className="grid gap-3">
                    {submissions.map((s) => (
                        <SubmissionCard
                            key={s.id}
                            submission={s}
                            isAdmin={isAdmin}
                            onUpdate={loadSubmissions}
                        />
                    ))}
                </div>
            )}
        </section>
    );
};

export default Dashboard;
