// src/App.tsx
// Root application component.
// Mounts the agent loop on startup and renders the full UI.

import { useEffect, useState } from 'react';
import { Toaster } from 'react-hot-toast';
import Sidebar from './components/Sidebar';
import SubmitForm from './components/SubmitForm';
import Dashboard from './components/Dashboard';
import { startAgentLoop } from './agent/rewardAgent';
import { supabaseConfigured } from './lib/supabase';
import { AlertTriangle, ExternalLink } from 'lucide-react';

function App() {
  const [activeTab, setActiveTab] = useState<'home' | 'submit' | 'dashboard'>('home');

  // ── Start the reward agent loop when the app mounts ─────────────────────────
  // Only run if Supabase is configured; otherwise the DB calls will fail silently.
  useEffect(() => {
    if (!supabaseConfigured) return;
    const stopAgent = startAgentLoop(30_000);
    return stopAgent;
  }, []);

  return (
    <div className="flex min-h-screen bg-[#0a0a14]">
      {/* Toast notifications */}
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#1a1a2e',
            color: '#f0f0f8',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '12px',
          },
        }}
      />

      {/* Sidebar Navigation */}
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Main Content Area */}
      <main className="flex-1 ml-64 min-h-screen relative overflow-y-auto hero-gradient">

        {/* Setup required banner */}
        {!supabaseConfigured && (
          <div className="max-w-5xl mx-auto px-8 mt-8">
            <div className="flex items-start gap-3 px-5 py-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-sm">
              <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-semibold">Supabase credentials not configured</p>
                <p className="text-amber-400/70">
                  Open your <code className="bg-black/30 px-1 py-0.5 rounded text-amber-300">.env</code> file
                  and fill in your <strong>VITE_SUPABASE_URL</strong> and <strong>VITE_SUPABASE_ANON_KEY</strong>.
                  {' '}Then restart the dev server.
                </p>
                <a
                  href="https://supabase.com/dashboard"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 mt-1 text-amber-400 hover:text-amber-300 underline underline-offset-2 transition-colors"
                >
                  Open Supabase Dashboard <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          </div>
        )}

        <div className="max-w-6xl mx-auto px-8 py-12 pb-32">

          {/* ── Home Tab ── */}
          {activeTab === 'home' && (
            <div className="space-y-16 animate-in fade-in zoom-in-95 duration-500">
              <section className="text-center max-w-3xl mx-auto py-20">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-medium mb-8">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
                  AI-Powered · Community-Driven · Auto-Rewarded
                </div>

                <h1 className="text-5xl sm:text-7xl font-extrabold text-white leading-tight mb-8">
                  Reward Great Ideas{' '}
                  <span className="gradient-text block mt-2">Automatically</span>
                </h1>

                <p className="text-white/50 text-xl leading-relaxed max-w-2xl mx-auto">
                  Submit your idea, get community upvotes, earn mentor approval, and let the AI
                  agent evaluate and send your crypto reward — all without a single manual step.
                </p>

                {/* Flow steps */}
                <div className="flex flex-wrap justify-center items-center gap-4 mt-12 text-sm text-white/40 bg-white/5 border border-white/10 p-6 rounded-2xl max-w-max mx-auto">
                  {['Submit Idea', '→', 'Community Upvote', '→', 'Mentor Approve', '→', 'AI Evaluate', '→', '💰 Crypto Reward'].map(
                    (step, i) => (
                      <span
                        key={i}
                        className={step === '→' ? 'text-white/20 font-light' : 'font-semibold text-white/80'}
                      >
                        {step}
                      </span>
                    )
                  )}
                </div>

                <div className="mt-16 flex items-center justify-center gap-6">
                  <button onClick={() => setActiveTab('submit')} className="btn-primary text-lg px-8 py-4 hero-glow shadow-indigo-500/40 shadow-xl">
                    Start Your Submission
                  </button>
                  <button onClick={() => setActiveTab('dashboard')} className="px-8 py-4 rounded-xl font-semibold bg-white/5 text-white/70 hover:bg-white/10 hover:text-white transition-all border border-white/10 hover:border-white/20 text-lg">
                    View Dashboard
                  </button>
                </div>
              </section>
            </div>
          )}

          {/* ── Submit Idea Tab ── */}
          {activeTab === 'submit' && (
            <div className="animate-in fade-in slide-in-from-bottom-8 duration-500 max-w-3xl mx-auto">
              <div className="mb-10 space-y-2">
                <h2 className="text-3xl font-bold text-white tracking-tight">Post Your Idea</h2>
                <p className="text-white/50 text-lg">Fill out all the details carefully to maximize your AI grading score.</p>
              </div>
              <SubmitForm />
            </div>
          )}

          {/* ── Dashboard Tab ── */}
          {activeTab === 'dashboard' && (
            <div className="animate-in fade-in slide-in-from-bottom-8 duration-500">
              <div className="mb-10 space-y-2 flex justify-between items-end">
                <div>
                  <h2 className="text-3xl font-bold text-white tracking-tight">Community Dashboard</h2>
                  <p className="text-white/50 text-lg">Explore and manage current submissions.</p>
                </div>
              </div>
              <Dashboard />
            </div>
          )}

        </div>

        {/* Footer */}
        <footer className="absolute bottom-0 w-full py-6 border-t border-white/5 text-center text-white/20 text-xs bg-black/50 backdrop-blur-sm">
          ProofTip — Hackathon Demo &nbsp;·&nbsp; Built with React, Tailwind, Supabase & OpenAI
        </footer>
      </main>
    </div>
  );
}

export default App;
