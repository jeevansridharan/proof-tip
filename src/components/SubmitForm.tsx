// src/components/SubmitForm.tsx
// "Submit Your Idea" form — beautiful multi-step experience.

import React, { useState, useRef } from 'react';
import {
    Lightbulb, Wallet, FileText, Send, CheckCircle, AlertCircle,
    Sparkles, ChevronRight, Info, Zap,
} from 'lucide-react';
import { createSubmission } from '../services/submissionService';
import type { SubmitFormData } from '../types';

interface FieldError {
    title?: string;
    description?: string;
    wallet_address?: string;
}

interface Props {
    onSuccess?: () => void;
}

const tips = [
    'Be specific about the problem you are solving.',
    'Describe your technical approach clearly.',
    'Explain what makes your idea unique.',
    'Include potential impact and use cases.',
    'Mention any existing solutions and how yours differs.',
];

const SubmitForm: React.FC<Props> = ({ onSuccess }) => {
    const [form, setForm] = useState<SubmitFormData>({
        title: '',
        description: '',
        wallet_address: '',
    });
    const [errors, setErrors] = useState<FieldError>({});
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [apiError, setApiError] = useState<string | null>(null);
    const [activeTip] = useState(() => Math.floor(Math.random() * tips.length));
    const descRef = useRef<HTMLTextAreaElement>(null);

    // ── Validation ────────────────────────────────────────────────────────────
    function validate(): boolean {
        const e: FieldError = {};
        if (!form.title.trim()) e.title = 'Project title is required.';
        else if (form.title.trim().length < 3) e.title = 'Title must be at least 3 characters.';

        if (!form.description.trim()) e.description = 'Description is required.';
        else if (form.description.trim().length < 20) e.description = 'Please write at least 20 characters.';

        if (!form.wallet_address.trim()) e.wallet_address = 'Wallet address is required.';
        else if (form.wallet_address.trim().length < 10) e.wallet_address = 'Enter a valid wallet address.';

        setErrors(e);
        return Object.keys(e).length === 0;
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setApiError(null);
        if (!validate()) return;

        console.log('📝 Submitting idea:', form);
        setLoading(true);

        try {
            const created = await createSubmission(form);
            console.log('✅ Submission created:', created);
            setSuccess(true);
            setForm({ title: '', description: '', wallet_address: '' });
            setErrors({});
            onSuccess?.();
            setTimeout(() => setSuccess(false), 5000);
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : 'Submission failed. Please try again.';
            console.error('❌ Submission error:', err);
            setApiError(msg);
        } finally {
            setLoading(false);
        }
    }

    function handleChange(field: keyof SubmitFormData) {
        return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
            setForm(prev => ({ ...prev, [field]: e.target.value }));
            if (errors[field]) setErrors(prev => ({ ...prev, [field]: undefined }));
        };
    }

    // Character limits / progress
    const descLen = form.description.length;
    const descTarget = 200;
    const descPct = Math.min(descLen / descTarget, 1) * 100;

    const completionPct = [
        form.title.trim().length >= 3,
        form.description.trim().length >= 20,
        form.wallet_address.trim().length >= 10,
    ].filter(Boolean).length / 3 * 100;

    if (success) {
        return (
            <div className="glass-card-glow p-10 max-w-2xl mx-auto text-center fade-in-up">
                <div className="relative w-20 h-20 mx-auto mb-6">
                    <div className="absolute inset-0 rounded-full bg-emerald-500/15 animate-ping" />
                    <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center shadow-xl shadow-emerald-500/30">
                        <CheckCircle className="w-9 h-9 text-white" />
                    </div>
                </div>
                <h3 className="text-2xl font-black text-white mb-2">Idea Submitted! 🎉</h3>
                <p className="text-white/50 text-base max-w-sm mx-auto mb-6">
                    Your idea is now live. The community can upvote it, mentors can review it, and the AI agent will evaluate and reward it automatically.
                </p>
                <div className="flex flex-wrap justify-center gap-2 text-sm">
                    {['🗳️ Community Voting', '🤝 Mentor Review', '🤖 AI Scoring', '💰 Auto Reward'].map(s => (
                        <span key={s} className="tag-chip">{s}</span>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto space-y-4">

            {/* ── Tip card ──────────────────────────────────────────── */}
            <div className="flex items-start gap-3 px-4 py-3 rounded-xl bg-indigo-500/[0.07] border border-indigo-500/[0.15]">
                <Info className="w-4 h-4 text-indigo-400 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-indigo-300/70">{tips[activeTip]}</p>
            </div>

            {/* ── Card ──────────────────────────────────────────────── */}
            <div className="glass-card p-8">

                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                        <div className="relative w-12 h-12 flex items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500/20 to-violet-500/20 border border-indigo-500/25">
                            <Lightbulb className="w-5 h-5 text-indigo-400" />
                            <span className="pulse-ring absolute inset-0 rounded-2xl" />
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-white leading-none">Submit Idea</h2>
                            <p className="text-xs text-white/35 mt-0.5">Great ideas get rewarded automatically</p>
                        </div>
                    </div>

                    {/* Completion indicator */}
                    <div className="flex flex-col items-end gap-1">
                        <span className="text-xs text-white/30 font-medium">Completion</span>
                        <div className="flex items-center gap-2">
                            <div className="w-24 h-1.5 rounded-full bg-white/[0.05] overflow-hidden">
                                <div
                                    className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-all duration-500"
                                    style={{ width: `${completionPct}%` }}
                                />
                            </div>
                            <span className="text-xs font-bold text-indigo-400">{Math.round(completionPct)}%</span>
                        </div>
                    </div>
                </div>

                {/* ── API error ─────────────────────────────────────── */}
                {apiError && (
                    <div className="flex items-start gap-2 mb-6 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/25 text-red-400 text-sm fade-in-up">
                        <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                        <span>{apiError}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit} noValidate className="space-y-5">

                    {/* ── Title ──────────────────────────────────────── */}
                    <div>
                        <label htmlFor="title" className="flex items-center gap-1.5 text-sm font-semibold text-white/60 mb-2">
                            <FileText className="w-3.5 h-3.5 text-indigo-400" />
                            Project Title
                            <span className="text-red-400 ml-0.5">*</span>
                        </label>
                        <input
                            id="title"
                            type="text"
                            value={form.title}
                            onChange={handleChange('title')}
                            placeholder="e.g. ProofTip — AI Community Reward Agent"
                            className={`input-field ${errors.title ? 'error' : ''}`}
                            disabled={loading}
                            aria-describedby={errors.title ? 'title-error' : undefined}
                            maxLength={120}
                        />
                        <div className="flex justify-between mt-1.5">
                            {errors.title ? (
                                <p id="title-error" className="text-xs text-red-400 flex items-center gap-1">
                                    <AlertCircle className="w-3 h-3" /> {errors.title}
                                </p>
                            ) : <span />}
                            <span className="text-[10px] text-white/20 text-right">{form.title.length}/120</span>
                        </div>
                    </div>

                    {/* ── Description ────────────────────────────────── */}
                    <div>
                        <label htmlFor="description" className="flex items-center gap-1.5 text-sm font-semibold text-white/60 mb-2">
                            <Sparkles className="w-3.5 h-3.5 text-violet-400" />
                            Description
                            <span className="text-red-400 ml-0.5">*</span>
                        </label>
                        <textarea
                            id="description"
                            ref={descRef}
                            rows={6}
                            value={form.description}
                            onChange={handleChange('description')}
                            placeholder="Describe your idea — the problem it solves, how it works, the technical approach, and what makes it special…"
                            className={`input-field resize-none leading-relaxed ${errors.description ? 'error' : ''}`}
                            disabled={loading}
                            aria-describedby={errors.description ? 'desc-error' : undefined}
                        />
                        {/* Progress bar for description length */}
                        <div className="mt-2">
                            <div className="h-0.5 rounded-full bg-white/[0.04] overflow-hidden">
                                <div
                                    className="h-full rounded-full bg-gradient-to-r from-violet-500 to-indigo-500 transition-all duration-300"
                                    style={{ width: `${descPct}%` }}
                                />
                            </div>
                        </div>
                        <div className="flex justify-between mt-1.5">
                            {errors.description ? (
                                <p id="desc-error" className="text-xs text-red-400 flex items-center gap-1">
                                    <AlertCircle className="w-3 h-3" /> {errors.description}
                                </p>
                            ) : (
                                <span className="text-[10px] text-white/25">
                                    {descLen < 20 ? `${20 - descLen} more chars needed` : '✓ Minimum met'}
                                </span>
                            )}
                            <span className="text-[10px] text-white/20 tabular-nums">{descLen} chars</span>
                        </div>
                    </div>

                    {/* ── Wallet ─────────────────────────────────────── */}
                    <div>
                        <label htmlFor="wallet" className="flex items-center gap-1.5 text-sm font-semibold text-white/60 mb-2">
                            <Wallet className="w-3.5 h-3.5 text-cyan-400" />
                            Wallet Address
                            <span className="text-red-400 ml-0.5">*</span>
                        </label>
                        <input
                            id="wallet"
                            type="text"
                            value={form.wallet_address}
                            onChange={handleChange('wallet_address')}
                            placeholder="0x… or your EVM wallet address"
                            className={`input-field font-mono text-sm ${errors.wallet_address ? 'error' : ''}`}
                            disabled={loading}
                            aria-describedby={errors.wallet_address ? 'wallet-error' : undefined}
                        />
                        {errors.wallet_address ? (
                            <p id="wallet-error" className="mt-1.5 text-xs text-red-400 flex items-center gap-1">
                                <AlertCircle className="w-3 h-3" /> {errors.wallet_address}
                            </p>
                        ) : (
                            <p className="mt-1.5 text-xs text-white/20 flex items-center gap-1">
                                🔒 Used only for non-custodial USDT reward delivery
                            </p>
                        )}
                    </div>

                    {/* ── Submit ─────────────────────────────────────── */}
                    <button
                        id="submit-idea-btn"
                        type="submit"
                        disabled={loading}
                        className="btn-primary w-full flex items-center justify-center gap-2.5 mt-2 hero-glow"
                    >
                        {loading ? (
                            <>
                                <svg className="animate-spin w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                </svg>
                                Submitting to chain…
                            </>
                        ) : (
                            <>
                                <Send className="w-4 h-4" />
                                Submit Idea
                                <ChevronRight className="w-4 h-4" />
                            </>
                        )}
                    </button>
                </form>
            </div>

            {/* ── Process steps preview ──────────────────────────── */}
            <div className="glass-card p-4">
                <div className="flex items-center gap-2 mb-3">
                    <Zap className="w-3.5 h-3.5 text-indigo-400" />
                    <span className="text-xs font-bold text-white/50 uppercase tracking-wider">What happens next</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[
                        { step: '1', label: 'Community votes', color: 'text-indigo-400', icon: '🗳️' },
                        { step: '2', label: 'Mentor reviews', color: 'text-violet-400', icon: '🤝' },
                        { step: '3', label: 'AI evaluates', color: 'text-cyan-400', icon: '🤖' },
                        { step: '4', label: 'USDT sent', color: 'text-emerald-400', icon: '💰' },
                    ].map(({ step, label, color, icon }) => (
                        <div key={step} className="flex flex-col items-center text-center gap-1 p-2 rounded-xl bg-white/[0.02]">
                            <span className="text-xl">{icon}</span>
                            <span className="text-[10px] text-white/35 font-medium leading-tight">{label}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default SubmitForm;
