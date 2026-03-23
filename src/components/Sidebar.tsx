// src/components/Sidebar.tsx
import React, { useEffect, useState } from 'react';
import { Zap, Home, PlusCircle, LayoutDashboard, Trophy, Activity, ChevronRight } from 'lucide-react';

type Tab = 'home' | 'submit' | 'dashboard' | 'leaderboard';

interface SidebarProps {
    activeTab: Tab;
    onTabChange: (tab: Tab) => void;
    agentRunning?: boolean;
    lastRun?: string | null;
}

const navItems = [
    { id: 'home' as const, label: 'Overview', icon: Home, desc: 'Platform intro' },
    { id: 'submit' as const, label: 'Submit Idea', icon: PlusCircle, desc: 'New contribution' },
    { id: 'dashboard' as const, label: 'Live Feed', icon: LayoutDashboard, desc: 'All submissions' },
    { id: 'leaderboard' as const, label: 'Leaderboard', icon: Trophy, desc: 'Top contributors' },
];

const Sidebar: React.FC<SidebarProps> = ({ activeTab, onTabChange, agentRunning, lastRun }) => {
    const [tick, setTick] = useState(0);

    // Pulse the agent indicator
    useEffect(() => {
        const id = setInterval(() => setTick(t => t + 1), 1000);
        return () => clearInterval(id);
    }, []);

    return (
        <aside className="w-64 fixed inset-y-0 left-0 z-50 flex flex-col bg-[#080814] border-r border-white/[0.06]">

            {/* ── Logo ──────────────────────────────────────────────────────── */}
            <div className="p-6 pb-6 border-b border-white/[0.06]">
                <div className="flex items-center gap-3">
                    <div className="relative w-11 h-11 rounded-2xl bg-gradient-to-br from-indigo-500 via-violet-600 to-pink-600 flex items-center justify-center shadow-lg shadow-indigo-500/30 flex-shrink-0">
                        <Zap className="w-5 h-5 text-white" fill="white" />
                        <div className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-400 border-2 border-[#080814]" />
                    </div>
                    <div>
                        <div className="font-black text-white text-lg tracking-tight leading-none">ProofTip</div>
                        <div className="text-[10px] font-semibold text-indigo-400/70 uppercase tracking-widest mt-0.5">AI Reward Agent</div>
                    </div>
                </div>
            </div>

            {/* ── Navigation ────────────────────────────────────────────────── */}
            <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
                <div className="text-[10px] font-bold text-white/20 uppercase tracking-widest px-3 py-2">Navigation</div>

                {navItems.map(({ id, label, icon: Icon, desc }) => (
                    <button
                        key={id}
                        onClick={() => onTabChange(id)}
                        className={`nav-item group ${activeTab === id ? 'active' : ''}`}
                    >
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-200 ${activeTab === id
                                ? 'bg-indigo-500/20 text-indigo-400'
                                : 'bg-white/[0.04] text-white/30 group-hover:bg-white/[0.08] group-hover:text-white/60'
                            }`}>
                            <Icon className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0 text-left">
                            <div className="text-sm font-semibold leading-none">{label}</div>
                            <div className={`text-[11px] mt-0.5 transition-colors ${activeTab === id ? 'text-indigo-400/60' : 'text-white/20'}`}>{desc}</div>
                        </div>
                        {activeTab === id && (
                            <ChevronRight className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0" />
                        )}
                    </button>
                ))}
            </nav>

            {/* ── Agent Status Card ──────────────────────────────────────────── */}
            <div className="p-3 border-t border-white/[0.06]">
                <div className="rounded-2xl bg-gradient-to-br from-indigo-950/60 to-violet-950/40 border border-indigo-500/15 p-4">
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                            <div className="relative flex items-center justify-center w-7 h-7">
                                <span className={`absolute w-full h-full rounded-full ${agentRunning ? 'bg-violet-500/20 animate-ping' : 'bg-emerald-500/20'}`} />
                                <span className={`relative w-2 h-2 rounded-full ${agentRunning ? 'bg-violet-400 animate-pulse' : 'bg-emerald-400'}`} />
                            </div>
                            <div>
                                <div className="text-xs font-semibold text-white/80">Agent</div>
                                <div className={`text-[10px] font-medium ${agentRunning ? 'text-violet-400' : 'text-emerald-400'}`}>
                                    {agentRunning ? 'Processing…' : 'Listening'}
                                </div>
                            </div>
                        </div>
                        <Activity className={`w-4 h-4 ${agentRunning ? 'text-violet-400 animate-pulse' : 'text-emerald-400/60'}`} />
                    </div>
                    {lastRun && (
                        <div className="text-[10px] text-white/25 font-mono">
                            Last run: {lastRun}
                        </div>
                    )}
                    <div className="mt-2 h-0.5 rounded-full bg-white/5 overflow-hidden">
                        <div
                            className={`h-full rounded-full transition-all duration-500 ${agentRunning
                                ? 'bg-gradient-to-r from-violet-500 to-pink-500 animate-pulse'
                                : 'bg-gradient-to-r from-emerald-500 to-cyan-500'
                                }`}
                            style={{ width: agentRunning ? '70%' : '100%' }}
                        />
                    </div>
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;
