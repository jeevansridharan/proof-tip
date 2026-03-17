// src/App.tsx
// Root application component.
// Mounts the agent loop on startup and renders the full UI.

import { useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import Header from './components/Header';
import SubmitForm from './components/SubmitForm';
import Dashboard from './components/Dashboard';
import { startAgentLoop } from './agent/rewardAgent';
import { supabaseConfigured } from './lib/supabase';
import { AlertTriangle, ExternalLink } from 'lucide-react';

function App() {
  // ── Start the reward agent loop when the app mounts ─────────────────────────
  // Only run if Supabase is configured; otherwise the DB calls will fail silently.
  useEffect(() => {
    if (!supabaseConfigured) return;
    const stopAgent = startAgentLoop(30_000);
    return stopAgent;
  }, []);

  return (
    <div className="min-h-screen hero-gradient">
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

      <Header />

      {/* ── Setup required banner ── */}
      {!supabaseConfigured && (
        <div className="max-w-5xl mx-auto px-4 mt-6">
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

      <main className="px-4 py-12 space-y-16">

        {/* ── Hero section ── */}
        <section className="text-center max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-medium mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
            AI-Powered · Community-Driven · Auto-Rewarded
          </div>

          <h1 className="text-4xl sm:text-5xl font-extrabold text-white leading-tight mb-4">
            Reward Great Ideas{' '}
            <span className="gradient-text">Automatically</span>
          </h1>

          <p className="text-white/50 text-lg leading-relaxed">
            Submit your idea, get community upvotes, earn mentor approval, and let the AI
            agent evaluate and send your crypto reward — all without a single manual step.
          </p>

          {/* Flow steps */}
          <div className="flex flex-wrap justify-center gap-2 mt-8 text-sm text-white/40">
            {['Submit', '→', 'Upvote', '→', 'Approve', '→', 'AI Score', '→', '💰 Reward'].map(
              (step, i) => (
                <span
                  key={i}
                  className={step === '→' ? 'text-white/20' : 'font-medium text-white/60'}
                >
                  {step}
                </span>
              )
            )}
          </div>
        </section>

        {/* ── Submit form ── */}
        <section id="submit-section" className="max-w-2xl mx-auto">
          <SubmitForm />
        </section>

        {/* ── Dashboard ── */}
        <section id="dashboard-section">
          <Dashboard />
        </section>

      </main>

      {/* Footer */}
      <footer className="mt-20 py-8 border-t border-white/5 text-center text-white/20 text-xs">
        ProofTip — Hackathon Demo &nbsp;·&nbsp; Built with React, Tailwind, Supabase & OpenAI
      </footer>
    </div>
  );
}

export default App;
