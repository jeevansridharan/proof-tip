// src/components/Dashboard.tsx
// Live community dashboard with stats, agent log, and submission feed.

import React, { useEffect, useState, useCallback } from 'react';
import {
    RefreshCw, LayoutDashboard, Shield, ShieldOff, Zap,
    TrendingUp, Users, Award, Clock, Activity, CheckCircle,
    Terminal, ChevronRight,
} from 'lucide-react';
import { fetchSubmissions } from '../services/submissionService';
import { checkAndReward } from '../agent/rewardAgent';
import type { Submission } from '../types';
import SubmissionCard from './SubmissionCard';

interface AgentLog {
    id: number;
    time: string;
    type: 'info' | 'success' | 'warn' | 'error';
    message: string;
}

const Dashboard: React.FC = () => {
    const [submissions, setSubmissions] = useState<Submission[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);
    const [agentRunning, setAgentRunning] = useState(false);
    const [agentLogs, setAgentLogs] = useState<AgentLog[]>([
        { id: 0, time: 'now', type: 'info', message: '🤖 Agent initialized and listening…' }
    ]);
    const [filter, setFilter] = useState<'all' | 'pending' | 'rewarded'>('all');
    const [logCounter, setLogCounter] = useState(1);

    // ── Fetch data ──────────────────────────────────────────────────────────────────
    const loadSubmissions = useCallback(async () => {
        try {
            const data = await fetchSubmissions();
            setSubmissions(data);
        } catch (err) { console.error('Failed to load submissions:', err); }
    }, []);

    useEffect(() => {
        loadSubmissions().finally(() => setLoading(false));
    }, [loadSubmissions]);

    async function handleRefresh() {
        setRefreshing(true);
        await loadSubmissions();
        setRefreshing(false);
    }

    function addLog(type: AgentLog['type'], message: string) {
        const now = new Date().toLocaleTimeString('en-US', { hour12: false });
        setAgentLogs(prev => [{ id: logCounter, time: now, type, message }, ...prev].slice(0, 20));
        setLogCounter(c => c + 1);
    }

    // ── Manual agent trigger ─────────────────────────────────────────────────────────
    async function handleRunAgent() {
        setAgentRunning(true);
        addLog('info', '🔍 Scanning for eligible submissions…');
        try {
            const result = await checkAndReward();
            addLog('success', `✅ Agent complete — rewarded: ${result.processed}, errors: ${result.errors}`);
            await loadSubmissions();
        } catch {
            addLog('error', '❌ Agent run failed');
        } finally {
            setAgentRunning(false);
        }
    }

    // ── Stats ──────────────────────────────────────────────────────────────────────────
    const stats = {
        total: submissions.length,
        approved: submissions.filter(s => s.isApproved).length,
        rewarded: submissions.filter(s => s.reward_sent).length,
        pending: submissions.filter(s => s.upvotes >= 5 && s.isApproved && (s.ai_score ?? 0) >= 7 && !s.reward_sent).length,
    };

    const totalUSDT = submissions
        .filter(s => s.reward_sent && s.ai_score !== null)
        .reduce((acc, s) => acc + (s.ai_score ?? 0) * 2, 0)
        .toFixed(1);

    // ── Filtered list ──────────────────────────────────────────────────────────────────
    const filtered = submissions.filter(s => {
        if (filter === 'pending') return !s.reward_sent;
        if (filter === 'rewarded') return s.reward_sent;
        return true;
    });

    // ── Log type styles ────────────────────────────────────────────────────────────────
    const logStyles: Record<AgentLog['type'], string> = {
        info: 'text-indigo-400',
        success: 'text-emerald-400',
        warn: 'text-amber-400',
        error: 'text-red-400',
    };

    return (
        <section className="w-full max-w-5xl mx-auto">

            {/* ── Section header ───────────────────────────────────────── */}
            <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
                <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-indigo-500/15 border border-indigo-500/20 flex items-center justify-center">
                        <LayoutDashboard className="w-4.5 h-4.5 text-indigo-400" />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-white leading-none">Live Feed</h2>
                        <p className="text-xs text-white/30 mt-0.5">{stats.total} total submissions</p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    {/* Admin toggle */}
                    <button
                        id="toggle-admin-btn"
                        onClick={() => setIsAdmin(!isAdmin)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all ${isAdmin
                                ? 'bg-amber-500/15 border-amber-500/30 text-amber-400 hover:bg-amber-500/25'
                                : 'bg-white/[0.04] border-white/[0.08] text-white/40 hover:bg-white/[0.08] hover:text-white/70'
                            }`}
                    >
                        {isAdmin ? <Shield className="w-3.5 h-3.5" /> : <ShieldOff className="w-3.5 h-3.5" />}
                        {isAdmin ? 'Admin ON' : 'Admin'}
                    </button>

                    {/* Run agent */}
                    <button
                        id="run-agent-btn"
                        onClick={handleRunAgent}
                        disabled={agentRunning}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-violet-600/15 hover:bg-violet-600/25 border border-violet-500/25 text-violet-400 text-xs font-semibold transition-all disabled:opacity-50"
                    >
                        <Zap className={`w-3.5 h-3.5 ${agentRunning ? 'animate-pulse' : ''}`} />
                        {agentRunning ? 'Running…' : 'Run Agent'}
                    </button>

                    {/* Refresh */}
                    <button
                        id="refresh-btn"
                        onClick={handleRefresh}
                        disabled={refreshing}
                        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-white/40 hover:text-white/70 text-xs font-medium transition-all disabled:opacity-50"
                    >
                        <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
                    </button>
                </div>
            </div>

            {/* ── Stats grid ───────────────────────────────────────────── */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                {[
                    { label: 'Total Ideas', value: stats.total, color: 'text-white', icon: Users, glow: 'shadow-white/5' },
                    { label: 'Approved', value: stats.approved, color: 'text-emerald-400', icon: CheckCircle, glow: 'shadow-emerald-500/10' },
                    { label: 'Eligible', value: stats.pending, color: 'text-indigo-400', icon: Clock, glow: 'shadow-indigo-500/10' },
                    { label: 'Rewarded', value: stats.rewarded, color: 'text-amber-400', icon: Award, glow: 'shadow-amber-500/10' },
                ].map(({ label, value, color, icon: Icon, glow }) => (
                    <div key={label} className={`glass-card px-4 py-4 text-center shadow-lg ${glow}`}>
                        <Icon className={`w-4 h-4 ${color} mx-auto mb-2 opacity-70`} />
                        <p className={`text-2xl font-black ${color} count-up`}>{value}</p>
                        <p className="text-[11px] text-white/30 mt-0.5 font-medium">{label}</p>
                    </div>
                ))}
            </div>

            {/* ── Total USDT distributed banner ──────────────────────── */}
            {stats.rewarded > 0 && (
                <div className="mb-5 px-5 py-3 rounded-2xl bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20 flex items-center gap-3">
                    <TrendingUp className="w-4 h-4 text-amber-400 flex-shrink-0" />
                    <p className="text-sm text-amber-300/80 font-medium">
                        <span className="font-black text-amber-300">{totalUSDT} USDT</span> distributed to {stats.rewarded} contributor{stats.rewarded !== 1 ? 's' : ''}
                    </p>
                </div>
            )}

            {/* ── Two-column layout ────────────────────────────────────── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

                {/* Left: submission list (2/3 width) */}
                <div className="lg:col-span-2 space-y-3">
                    {/* Filter tabs */}
                    <div className="flex gap-1.5 mb-4 p-1 rounded-xl bg-white/[0.03] border border-white/[0.06] w-fit">
                        {['all', 'pending', 'rewarded'].map(f => (
                            <button
                                key={f}
                                onClick={() => setFilter(f as typeof filter)}
                                className={`px-4 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${filter === f
                                        ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/20'
                                        : 'text-white/35 hover:text-white/60'
                                    }`}
                            >
                                {f}
                            </button>
                        ))}
                    </div>

                    {loading ? (
                        <div className="space-y-3">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="glass-card p-5 shimmer h-40 rounded-[1.25rem]" />
                            ))}
                        </div>
                    ) : filtered.length === 0 ? (
                        <div className="glass-card p-12 text-center">
                            <div className="w-12 h-12 rounded-2xl bg-white/[0.04] flex items-center justify-center mx-auto mb-3">
                                <LayoutDashboard className="w-5 h-5 text-white/20" />
                            </div>
                            <p className="text-white/30 text-sm">No submissions yet. Be the first! 🚀</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {filtered.map(s => (
                                <SubmissionCard
                                    key={s.id}
                                    submission={s}
                                    isAdmin={isAdmin}
                                    onUpdate={loadSubmissions}
                                />
                            ))}
                        </div>
                    )}
                </div>

                {/* Right: Agent activity log (1/3 width) */}
                <div className="lg:col-span-1">
                    <div className="glass-card p-4 sticky top-4 max-h-[600px] overflow-hidden flex flex-col">
                        <div className="flex items-center gap-2 mb-3">
                            <div className="w-7 h-7 rounded-lg bg-violet-500/15 border border-violet-500/20 flex items-center justify-center">
                                <Terminal className="w-3.5 h-3.5 text-violet-400" />
                            </div>
                            <span className="text-sm font-bold text-white/80">Agent Log</span>
                            <Activity className="w-3 h-3 text-violet-400 ml-auto animate-pulse" />
                        </div>

                        <div className="flex-1 overflow-y-auto space-y-2 pr-1 font-mono">
                            {agentLogs.map(log => (
                                <div key={log.id} className="log-entry text-[11px] flex gap-2 items-start">
                                    <span className="text-white/20 flex-shrink-0 mt-0.5 tabular-nums">{log.time}</span>
                                    <span className={logStyles[log.type]}>{log.message}</span>
                                </div>
                            ))}
                        </div>

                        {/* Quick action */}
                        <button
                            onClick={handleRunAgent}
                            disabled={agentRunning}
                            className="mt-3 w-full flex items-center justify-center gap-1.5 py-2 rounded-xl bg-violet-600/15 hover:bg-violet-600/25 border border-violet-500/20 text-violet-400 text-xs font-semibold transition-all disabled:opacity-50"
                        >
                            <Zap className={`w-3 h-3 ${agentRunning ? 'animate-spin' : ''}`} />
                            {agentRunning ? 'Running agent…' : 'Trigger Agent Run'}
                            {!agentRunning && <ChevronRight className="w-3 h-3" />}
                        </button>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Dashboard;
