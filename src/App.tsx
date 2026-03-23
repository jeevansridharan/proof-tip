// src/App.tsx
// Root application component — mounts agent loop and renders the full UI.

import { useEffect, useState } from 'react';
import { Toaster } from 'react-hot-toast';
import Sidebar from './components/Sidebar';
import SubmitForm from './components/SubmitForm';
import Dashboard from './components/Dashboard';
import Leaderboard from './components/Leaderboard';
import { startAgentLoop } from './agent/rewardAgent';
import { supabaseConfigured } from './lib/supabase';
import {
  AlertTriangle, ExternalLink, Zap, Brain, Shield, TrendingUp,
  ArrowRight, Users, Award, Clock, ChevronRight, Sparkles,
} from 'lucide-react';

type Tab = 'home' | 'submit' | 'dashboard' | 'leaderboard';

// ── Animated counter ──────────────────────────────────────────────────────────
function AnimatedStat({ value, label, icon: Icon, color }: {
  value: string; label: string; icon: React.FC<{ className?: string }>; color: string;
}) {
  const [visible, setVisible] = useState(false);
  useEffect(() => { const t = setTimeout(() => setVisible(true), 200); return () => clearTimeout(t); }, []);
  return (
    <div className={`glass-card p-5 text-center transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
      <div className={`w-10 h-10 rounded-xl mx-auto mb-3 flex items-center justify-center ${color}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div className="text-2xl font-black text-white">{value}</div>
      <div className="text-xs text-white/35 mt-0.5 font-medium">{label}</div>
    </div>
  );
}

// ── Feature card ──────────────────────────────────────────────────────────────
function FeatureCard({ icon, title, desc, color, delay }: {
  icon: string; title: string; desc: string; color: string; delay: number;
}) {
  return (
    <div
      className="glass-card p-5 hover-lift group"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className={`text-2xl mb-3 w-11 h-11 rounded-2xl flex items-center justify-center ${color} group-hover:scale-110 transition-transform duration-300`}>
        {icon}
      </div>
      <h3 className="text-base font-bold text-white/90 mb-1.5 group-hover:text-white transition-colors">{title}</h3>
      <p className="text-sm text-white/40 leading-relaxed">{desc}</p>
    </div>
  );
}

// ── Flow step ─────────────────────────────────────────────────────────────────
function FlowStep({ num, label, sub, last }: { num: string; label: string; sub: string; last?: boolean }) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex flex-col items-center">
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white font-black text-sm shadow-lg shadow-indigo-500/30 flex-shrink-0">
          {num}
        </div>
        {!last && <div className="w-0.5 h-8 bg-gradient-to-b from-indigo-500/40 to-transparent mt-1" />}
      </div>
      <div className="mb-4">
        <div className="text-sm font-semibold text-white/85">{label}</div>
        <div className="text-xs text-white/30">{sub}</div>
      </div>
    </div>
  );
}

function App() {
  const [activeTab, setActiveTab] = useState<Tab>('home');
  const [agentRunning, setAgentRunning] = useState(false);
  const [lastRun, setLastRun] = useState<string | null>(null);

  useEffect(() => {
    if (!supabaseConfigured) return;
    const stop = startAgentLoop(30_000);
    return stop;
  }, []);

  return (
    <div className="flex min-h-screen bg-[#060612] bg-grid">
      {/* Floating orbs */}
      <div className="orb orb-1" />
      <div className="orb orb-2" />
      <div className="orb orb-3" />

      {/* Toast notifications */}
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#141428',
            color: '#f0f0f8',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '14px',
            fontSize: '14px',
          },
        }}
      />

      {/* Sidebar */}
      <Sidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        agentRunning={agentRunning}
        lastRun={lastRun}
      />

      {/* Main */}
      <main className="flex-1 ml-64 min-h-screen relative overflow-y-auto">
        <div className="relative z-10">

          {/* ── Setup banner ─────────────────────────────── */}
          {!supabaseConfigured && (
            <div className="px-8 pt-6">
              <div className="flex items-start gap-3 px-5 py-4 rounded-2xl bg-amber-500/[0.08] border border-amber-500/25 text-amber-300 text-sm">
                <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5 text-amber-400" />
                <div className="space-y-1">
                  <p className="font-bold">Supabase not configured</p>
                  <p className="text-amber-400/65 text-xs">
                    Add <code className="bg-black/30 px-1.5 py-0.5 rounded text-amber-300 font-mono">VITE_SUPABASE_URL</code> and <code className="bg-black/30 px-1.5 py-0.5 rounded text-amber-300 font-mono">VITE_SUPABASE_ANON_KEY</code> to your .env file.
                  </p>
                  <a href="https://supabase.com/dashboard" target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 mt-1 text-amber-400 hover:text-amber-300 text-xs underline underline-offset-2 transition-colors">
                    Open Supabase Dashboard <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </div>
          )}

          <div className="max-w-6xl mx-auto px-8 py-10 pb-24">

            {/* ══════════════════════════════════════════════════════
                            HOME TAB
                        ══════════════════════════════════════════════════════ */}
            {activeTab === 'home' && (
              <div className="space-y-20 fade-in-up">

                {/* Hero */}
                <section className="text-center max-w-3xl mx-auto pt-12">
                  <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold mb-8">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
                    AI-Powered · Trust-Scored · Auto-Rewarded · On-Chain
                  </div>

                  <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black text-white leading-[1.05] mb-6 tracking-tight">
                    Reward Great Ideas
                    <span className="gradient-text block mt-2">Automatically</span>
                  </h1>

                  <p className="text-white/45 text-lg leading-relaxed max-w-xl mx-auto mb-10">
                    Submit your idea, earn community votes and mentor approval,
                    let the AI agent evaluate quality — and receive USDT
                    rewards on-chain without lifting a finger.
                  </p>

                  <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <button
                      onClick={() => setActiveTab('submit')}
                      className="btn-primary text-base px-8 py-4 hero-glow flex items-center gap-2 w-full sm:w-auto justify-center"
                    >
                      <Sparkles className="w-4 h-4" />
                      Submit Your Idea
                      <ArrowRight className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setActiveTab('dashboard')}
                      className="btn-secondary text-base px-8 py-4 flex items-center gap-2 w-full sm:w-auto justify-center"
                    >
                      <Zap className="w-4 h-4" />
                      Live Dashboard
                    </button>
                  </div>
                </section>

                {/* Stats row */}
                <section className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <AnimatedStat value="∞" label="Auto-Reward Rounds" icon={Zap} color="bg-indigo-500/15 text-indigo-400" />
                  <AnimatedStat value="100%" label="Non-Custodial" icon={Shield} color="bg-emerald-500/15 text-emerald-400" />
                  <AnimatedStat value="USDT" label="Reward Currency" icon={Award} color="bg-amber-500/15 text-amber-400" />
                  <AnimatedStat value="30s" label="Agent Check Interval" icon={Clock} color="bg-violet-500/15 text-violet-400" />
                </section>

                {/* How it works — split layout */}
                <section className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
                  <div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.04] border border-white/[0.08] text-white/40 text-xs font-semibold uppercase tracking-widest mb-5">
                      How It Works
                    </div>
                    <h2 className="text-3xl font-black text-white mb-8 leading-tight">
                      A fully autonomous
                      <span className="gradient-text block">reward pipeline</span>
                    </h2>
                    <div className="space-y-0">
                      <FlowStep num="1" label="Submit Your Idea" sub="Title, description, and wallet address" />
                      <FlowStep num="2" label="Community Upvotes" sub="Minimum 5 upvotes required" />
                      <FlowStep num="3" label="Mentor Approval" sub="Required only for high-risk submissions" />
                      <FlowStep num="4" label="AI Evaluation" sub="LLaMA 3.3 70B scores quality 0-10" />
                      <FlowStep num="5" label="Trust & Risk Check" sub="Dynamic scoring prevents abuse" />
                      <FlowStep num="6" label="USDT Reward Sent" sub="WDK wallet signs on-chain transaction" last />
                    </div>
                  </div>

                  {/* Feature grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <FeatureCard
                      icon="🤖" delay={0}
                      title="Autonomous AI Agent"
                      desc="Evaluates, decides, and executes rewards without any human intervention."
                      color="bg-violet-500/15"
                    />
                    <FeatureCard
                      icon="💰" delay={100}
                      title="Agent-Driven Payments"
                      desc="Conditional, on-chain USDT payments based on real contribution value."
                      color="bg-amber-500/15"
                    />
                    <FeatureCard
                      icon="🔐" delay={200}
                      title="WDK Wallets"
                      desc="Secure, self-custodial wallet integration ensures safe transactions."
                      color="bg-emerald-500/15"
                    />
                    <FeatureCard
                      icon="📊" delay={300}
                      title="Trust & Risk System"
                      desc="Prevents spam and ensures economically sound reward distribution."
                      color="bg-indigo-500/15"
                    />
                    <FeatureCard
                      icon="⚡" delay={400}
                      title="Real-Time Processing"
                      desc="Agent loop runs every 30 seconds to detect and reward eligible ideas."
                      color="bg-cyan-500/15"
                    />
                    <FeatureCard
                      icon="🏆" delay={500}
                      title="Leaderboard"
                      desc="Top contributors ranked by trust score and total USDT earned."
                      color="bg-pink-500/15"
                    />
                  </div>
                </section>

                {/* Reward formula pill */}
                <section className="max-w-2xl mx-auto">
                  <div className="glass-card-glow p-6 text-center">
                    <div className="flex items-center justify-center gap-2 mb-3">
                      <Brain className="w-4 h-4 text-indigo-400" />
                      <span className="text-xs font-bold text-white/40 uppercase tracking-widest">Dynamic Reward Formula</span>
                    </div>
                    <div className="font-mono text-indigo-300 text-sm sm:text-base bg-black/30 rounded-xl px-6 py-3 border border-indigo-500/15">
                      reward = base × AI_score × (1 + log(upvotes+1)) × trust_score
                    </div>
                    <p className="text-xs text-white/30 mt-3">
                      More upvotes · higher AI score · stronger trust = larger reward
                    </p>
                  </div>
                </section>

                {/* CTA banner */}
                <section>
                  <div className="glass-card p-8 text-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/[0.06] via-violet-500/[0.04] to-pink-500/[0.03] pointer-events-none" />
                    <div className="relative z-10">
                      <TrendingUp className="w-8 h-8 text-indigo-400 mx-auto mb-3" />
                      <h2 className="text-2xl font-black text-white mb-2">Ready to earn your first USDT?</h2>
                      <p className="text-white/40 text-sm mb-6 max-w-sm mx-auto">
                        Join the community, share your ideas, and let the agent handle the rest.
                      </p>
                      <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        <button onClick={() => setActiveTab('submit')} className="btn-primary flex items-center gap-2 justify-center">
                          <Sparkles className="w-4 h-4" /> Get Started
                        </button>
                        <button onClick={() => setActiveTab('leaderboard')} className="btn-secondary flex items-center gap-2 justify-center">
                          <Users className="w-4 h-4" /> View Leaderboard <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </section>
              </div>
            )}

            {/* ══════════════════════════════════════════════════════
                            SUBMIT TAB
                        ══════════════════════════════════════════════════════ */}
            {activeTab === 'submit' && (
              <div className="fade-in-up">
                <div className="mb-8">
                  <h2 className="text-3xl font-black text-white tracking-tight">Post Your Idea</h2>
                  <p className="text-white/40 text-base mt-1">
                    Every field matters — thoughtful descriptions earn higher AI scores and larger rewards.
                  </p>
                </div>
                <SubmitForm onSuccess={() => setActiveTab('dashboard')} />
              </div>
            )}

            {/* ══════════════════════════════════════════════════════
                            DASHBOARD TAB
                        ══════════════════════════════════════════════════════ */}
            {activeTab === 'dashboard' && (
              <div className="fade-in-up">
                <div className="mb-8">
                  <h2 className="text-3xl font-black text-white tracking-tight">Community Dashboard</h2>
                  <p className="text-white/40 text-base mt-1">
                    Explore submissions, upvote great ideas, and watch the agent in action.
                  </p>
                </div>
                <Dashboard />
              </div>
            )}

            {/* ══════════════════════════════════════════════════════
                            LEADERBOARD TAB
                        ══════════════════════════════════════════════════════ */}
            {activeTab === 'leaderboard' && (
              <div className="fade-in-up">
                <div className="mb-8">
                  <h2 className="text-3xl font-black text-white tracking-tight">Leaderboard</h2>
                  <p className="text-white/40 text-base mt-1">
                    Top contributors ranked by trust score and total USDT earned.
                  </p>
                </div>
                <Leaderboard />
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <footer className="border-t border-white/[0.04] py-6 text-center text-white/15 text-xs bg-black/20 backdrop-blur-sm relative z-10">
          ProofTip — AI Reward Agent &nbsp;·&nbsp; Built with React, Tailwind, Supabase &amp; Groq &nbsp;·&nbsp;
          <span className="text-indigo-400/50">Powered by LLaMA 3.3 70B</span>
        </footer>
      </main>
    </div>
  );
}

export default App;
