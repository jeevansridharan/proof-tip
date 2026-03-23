// src/components/Leaderboard.tsx
// Top contributors leaderboard ranked by total rewards earned.

import React, { useEffect, useState, useCallback } from 'react';
import { Trophy, Medal, Wallet, Brain, ThumbsUp, TrendingUp, RefreshCw, Star, Zap } from 'lucide-react';
import { fetchSubmissions } from '../services/submissionService';
import { calculateTrustScore, calculateReward } from '../agent/rewardAgent';
import type { Submission } from '../types';

interface ContributorStats {
    wallet: string;
    submissions: number;
    rewarded: number;
    totalReward: number;
    avgScore: number;
    totalUpvotes: number;
    trustScore: number;
}

const Leaderboard: React.FC = () => {
    const [contributors, setContributors] = useState<ContributorStats[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [topIdeas, setTopIdeas] = useState<Submission[]>([]);

    const load = useCallback(async () => {
        try {
            const subs = await fetchSubmissions();

            // Group by wallet
            const walletMap = new Map<string, Submission[]>();
            for (const s of subs) {
                const key = s.wallet_address;
                if (!walletMap.has(key)) walletMap.set(key, []);
                walletMap.get(key)!.push(s);
            }

            const stats: ContributorStats[] = [];
            for (const [wallet, history] of walletMap.entries()) {
                const rewarded = history.filter(s => s.reward_sent);
                const trustScore = calculateTrustScore(history);
                const totalReward = rewarded.reduce((sum, s) => {
                    return sum + calculateReward(s, trustScore);
                }, 0);
                const scored = history.filter(s => s.ai_score !== null);
                const avgScore = scored.length > 0
                    ? scored.reduce((sum, s) => sum + (s.ai_score ?? 0), 0) / scored.length
                    : 0;
                const totalUpvotes = history.reduce((sum, s) => sum + s.upvotes, 0);

                stats.push({
                    wallet,
                    submissions: history.length,
                    rewarded: rewarded.length,
                    totalReward: Math.round(totalReward * 100) / 100,
                    avgScore: Math.round(avgScore * 10) / 10,
                    totalUpvotes,
                    trustScore: Math.round(trustScore * 100),
                });
            }

            // Sort by total reward earned
            stats.sort((a, b) => b.totalReward - a.totalReward || b.trustScore - a.trustScore);
            setContributors(stats);

            // Top ideas by AI score
            const topSubs = [...subs]
                .filter(s => s.ai_score !== null)
                .sort((a, b) => (b.ai_score ?? 0) - (a.ai_score ?? 0))
                .slice(0, 5);
            setTopIdeas(topSubs);
        } catch (err) {
            console.error('Leaderboard load failed:', err);
        }
    }, []);

    useEffect(() => {
        load().finally(() => setLoading(false));
    }, [load]);

    async function handleRefresh() {
        setRefreshing(true);
        await load();
        setRefreshing(false);
    }

    function shortWallet(addr: string) {
        return addr.length > 16
            ? `${addr.slice(0, 8)}…${addr.slice(-6)}`
            : addr;
    }

    const medalColors = ['text-amber-400', 'text-slate-300', 'text-amber-600'];
    const medalBg = [
        'from-amber-500/20 to-orange-500/10 border-amber-500/30',
        'from-slate-500/20 to-slate-600/10 border-slate-500/25',
        'from-amber-700/20 to-orange-700/10 border-amber-700/30',
    ];

    if (loading) {
        return (
            <div className="space-y-3 max-w-4xl mx-auto">
                {[1, 2, 3].map(i => (
                    <div key={i} className="glass-card p-5 shimmer h-20 rounded-[1.25rem]" />
                ))}
            </div>
        );
    }

    return (
        <section className="max-w-4xl mx-auto space-y-8">

            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/20 flex items-center justify-center">
                        <Trophy className="w-4.5 h-4.5 text-amber-400" />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-white leading-none">Leaderboard</h2>
                        <p className="text-xs text-white/30 mt-0.5">Ranked by total USDT earned</p>
                    </div>
                </div>
                <button
                    onClick={handleRefresh}
                    disabled={refreshing}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-white/40 hover:text-white/70 text-xs font-medium transition-all disabled:opacity-50"
                >
                    <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
                    Refresh
                </button>
            </div>

            {contributors.length === 0 ? (
                <div className="glass-card p-16 text-center">
                    <Trophy className="w-10 h-10 text-white/10 mx-auto mb-3" />
                    <p className="text-white/30 text-sm">No rewards distributed yet. Be the first! 🏆</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* Left: contributor ranking */}
                    <div className="lg:col-span-2 space-y-3">
                        {contributors.map((c, i) => (
                            <div
                                key={c.wallet}
                                className={`glass-card p-4 hover-lift transition-all relative overflow-hidden ${i < 3 ? `bg-gradient-to-r ${medalBg[i]}` : ''
                                    }`}
                                style={{ animationDelay: `${i * 60}ms` }}
                            >
                                {/* Rank number */}
                                <div className="flex items-center gap-4">
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 font-black text-lg ${i < 3
                                            ? `bg-gradient-to-br from-white/10 to-white/[0.04] ${medalColors[i]}`
                                            : 'bg-white/[0.04] text-white/30'
                                        }`}>
                                        {i < 3 ? <Medal className="w-5 h-5" /> : `#${i + 1}`}
                                    </div>

                                    {/* Info */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="font-mono text-sm text-white/70 font-semibold truncate">
                                                {shortWallet(c.wallet)}
                                            </span>
                                            <span className="tag-chip">
                                                Trust {c.trustScore}%
                                            </span>
                                        </div>
                                        <div className="flex flex-wrap gap-3 text-xs text-white/35">
                                            <span className="flex items-center gap-1">
                                                <Zap className="w-3 h-3 text-indigo-400/70" />
                                                {c.submissions} idea{c.submissions !== 1 ? 's' : ''}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <ThumbsUp className="w-3 h-3 text-indigo-400/70" />
                                                {c.totalUpvotes} upvotes
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Brain className="w-3 h-3 text-violet-400/70" />
                                                avg {c.avgScore}/10
                                            </span>
                                        </div>
                                    </div>

                                    {/* Reward earned */}
                                    <div className="text-right flex-shrink-0">
                                        <div className={`text-lg font-black ${c.totalReward > 0 ? (i < 3 ? medalColors[i] : 'text-white/70') : 'text-white/20'}`}>
                                            {c.totalReward > 0 ? `${c.totalReward}` : '—'}
                                        </div>
                                        <div className="text-[10px] text-white/25 font-semibold uppercase tracking-wide">USDT</div>
                                        <div className="text-[10px] text-white/20">{c.rewarded} rewarded</div>
                                    </div>
                                </div>

                                {/* Trust bar */}
                                <div className="mt-3 h-0.5 rounded-full bg-white/[0.04] overflow-hidden">
                                    <div
                                        className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-all duration-1000"
                                        style={{ width: `${c.trustScore}%` }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Right: top ideas */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 mb-2">
                            <Star className="w-4 h-4 text-amber-400" />
                            <h3 className="text-sm font-bold text-white/70">Top Rated Ideas</h3>
                        </div>
                        {topIdeas.length === 0 ? (
                            <div className="glass-card p-6 text-center">
                                <p className="text-white/25 text-xs">No scored ideas yet</p>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {topIdeas.map((idea, i) => (
                                    <div key={idea.id} className="glass-card p-3 hover-lift">
                                        <div className="flex items-start gap-2.5">
                                            <div className={`text-xs font-black w-5 h-5 rounded-lg flex items-center justify-center flex-shrink-0 ${i === 0 ? 'bg-amber-500/20 text-amber-400' : 'bg-white/[0.04] text-white/30'
                                                }`}>
                                                {i + 1}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-xs font-semibold text-white/75 line-clamp-1">{idea.title}</p>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <div className="flex-1 h-1 rounded-full bg-white/[0.05] overflow-hidden">
                                                        <div
                                                            className="h-full rounded-full bg-gradient-to-r from-violet-500 to-indigo-500"
                                                            style={{ width: `${((idea.ai_score ?? 0) / 10) * 100}%` }}
                                                        />
                                                    </div>
                                                    <span className={`text-[11px] font-bold ${(idea.ai_score ?? 0) >= 8 ? 'text-emerald-400' :
                                                            (idea.ai_score ?? 0) >= 6 ? 'text-yellow-400' : 'text-red-400'
                                                        }`}>
                                                        {idea.ai_score}/10
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Summary stats */}
                        <div className="glass-card p-4 mt-4">
                            <div className="text-xs font-bold text-white/40 uppercase tracking-widest mb-3">Platform Stats</div>
                            <div className="space-y-2.5">
                                {[
                                    { label: 'Contributors', value: contributors.length, icon: Wallet },
                                    { label: 'Total Rewarded', value: contributors.reduce((a, c) => a + c.rewarded, 0), icon: Trophy },
                                    { label: 'Total Upvotes', value: contributors.reduce((a, c) => a + c.totalUpvotes, 0), icon: ThumbsUp },
                                    { label: 'USDT Distributed', value: `${contributors.reduce((a, c) => a + c.totalReward, 0).toFixed(1)}`, icon: TrendingUp },
                                ].map(({ label, value, icon: Icon }) => (
                                    <div key={label} className="flex items-center justify-between text-xs">
                                        <span className="flex items-center gap-1.5 text-white/35">
                                            <Icon className="w-3 h-3 text-indigo-400/60" />
                                            {label}
                                        </span>
                                        <span className="font-bold text-white/70">{value}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
};

export default Leaderboard;
