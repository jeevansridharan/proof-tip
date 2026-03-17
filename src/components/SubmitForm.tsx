// src/components/SubmitForm.tsx
// "Submit Your Idea" form — validates fields, logs to console, and inserts into Supabase.

import React, { useState } from 'react';
import { Lightbulb, Wallet, FileText, Send, CheckCircle, AlertCircle } from 'lucide-react';
import { createSubmission } from '../services/submissionService';
import type { SubmitFormData } from '../types';

interface FieldError {
    title?: string;
    description?: string;
    wallet_address?: string;
}

interface Props {
    /** Called after a successful submission so the parent can refresh the list */
    onSuccess?: () => void;
}

const SubmitForm: React.FC<Props> = ({ onSuccess }) => {
    // ── Form state ──────────────────────────────────────────────────────────────
    const [form, setForm] = useState<SubmitFormData>({
        title: '',
        description: '',
        wallet_address: '',
    });

    const [errors, setErrors] = useState<FieldError>({});
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [apiError, setApiError] = useState<string | null>(null);

    // ── Validation ───────────────────────────────────────────────────────────────
    function validate(): boolean {
        const newErrors: FieldError = {};

        if (!form.title.trim()) {
            newErrors.title = 'Project title is required.';
        } else if (form.title.trim().length < 3) {
            newErrors.title = 'Title must be at least 3 characters.';
        }

        if (!form.description.trim()) {
            newErrors.description = 'Description is required.';
        } else if (form.description.trim().length < 20) {
            newErrors.description = 'Please write at least 20 characters.';
        }

        if (!form.wallet_address.trim()) {
            newErrors.wallet_address = 'Wallet address is required.';
        } else if (form.wallet_address.trim().length < 10) {
            newErrors.wallet_address = 'Enter a valid wallet address.';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    }

    // ── Submit handler ────────────────────────────────────────────────────────────
    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setApiError(null);

        if (!validate()) return;

        // Log to console (requirement)
        console.log('📝 Submitting idea:', {
            title: form.title.trim(),
            description: form.description.trim(),
            wallet_address: form.wallet_address.trim(),
        });

        setLoading(true);

        try {
            const created = await createSubmission(form);
            console.log('✅ Submission created:', created);

            setSuccess(true);
            setForm({ title: '', description: '', wallet_address: '' });
            setErrors({});

            // Notify parent to refresh dashboard
            onSuccess?.();

            // Reset success banner after 4 seconds
            setTimeout(() => setSuccess(false), 4000);
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Submission failed. Please try again.';
            console.error('❌ Submission error:', err);
            setApiError(message);
        } finally {
            setLoading(false);
        }
    }

    // ── Change handler ────────────────────────────────────────────────────────────
    function handleChange(field: keyof SubmitFormData) {
        return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
            setForm((prev) => ({ ...prev, [field]: e.target.value }));
            // Clear the field error as the user types
            if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
        };
    }

    // ── Render ────────────────────────────────────────────────────────────────────
    return (
        <div className="glass-card p-8 w-full max-w-2xl mx-auto">
            {/* Header */}
            <div className="flex items-center gap-3 mb-8">
                <div className="relative w-12 h-12 flex items-center justify-center rounded-full bg-indigo-600/20 border border-indigo-500/30">
                    <Lightbulb className="w-6 h-6 text-indigo-400" />
                    <span className="pulse-ring absolute inset-0 rounded-full" />
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-white">Submit Your Idea</h2>
                    <p className="text-sm text-white/40 mt-0.5">
                        Great ideas get upvoted, approved, scored — and rewarded automatically.
                    </p>
                </div>
            </div>

            {/* Success banner */}
            {success && (
                <div className="flex items-center gap-2 mb-6 px-4 py-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm animate-pulse">
                    <CheckCircle className="w-4 h-4 flex-shrink-0" />
                    <span>Your idea was submitted! The community can now vote on it. 🎉</span>
                </div>
            )}

            {/* API error banner */}
            {apiError && (
                <div className="flex items-start gap-2 mb-6 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
                    <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <span>{apiError}</span>
                </div>
            )}

            <form onSubmit={handleSubmit} noValidate className="space-y-5">

                {/* ── Title field ── */}
                <div>
                    <label htmlFor="title" className="block text-sm font-medium text-white/70 mb-1.5">
                        <span className="flex items-center gap-1.5">
                            <FileText className="w-3.5 h-3.5" />
                            Project Title
                        </span>
                    </label>
                    <input
                        id="title"
                        type="text"
                        value={form.title}
                        onChange={handleChange('title')}
                        placeholder="e.g. ProofTip – AI Community Reward Agent"
                        className={`input-field ${errors.title ? 'border-red-500/60 focus:ring-red-500/40' : ''}`}
                        disabled={loading}
                        aria-describedby={errors.title ? 'title-error' : undefined}
                    />
                    {errors.title && (
                        <p id="title-error" className="mt-1.5 text-xs text-red-400 flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" /> {errors.title}
                        </p>
                    )}
                </div>

                {/* ── Description field ── */}
                <div>
                    <label htmlFor="description" className="block text-sm font-medium text-white/70 mb-1.5">
                        <span className="flex items-center gap-1.5">
                            <FileText className="w-3.5 h-3.5" />
                            Description
                        </span>
                    </label>
                    <textarea
                        id="description"
                        rows={5}
                        value={form.description}
                        onChange={handleChange('description')}
                        placeholder="Describe your idea — the problem it solves, how it works, and what makes it special…"
                        className={`input-field resize-none leading-relaxed ${errors.description ? 'border-red-500/60 focus:ring-red-500/40' : ''
                            }`}
                        disabled={loading}
                        aria-describedby={errors.description ? 'desc-error' : undefined}
                    />
                    {errors.description && (
                        <p id="desc-error" className="mt-1.5 text-xs text-red-400 flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" /> {errors.description}
                        </p>
                    )}
                    {/* Character counter */}
                    <p className="mt-1 text-right text-xs text-white/20">
                        {form.description.length} characters
                    </p>
                </div>

                {/* ── Wallet address field ── */}
                <div>
                    <label htmlFor="wallet" className="block text-sm font-medium text-white/70 mb-1.5">
                        <span className="flex items-center gap-1.5">
                            <Wallet className="w-3.5 h-3.5" />
                            Wallet Address
                        </span>
                    </label>
                    <input
                        id="wallet"
                        type="text"
                        value={form.wallet_address}
                        onChange={handleChange('wallet_address')}
                        placeholder="0x… or your blockchain address"
                        className={`input-field font-mono text-sm ${errors.wallet_address ? 'border-red-500/60 focus:ring-red-500/40' : ''
                            }`}
                        disabled={loading}
                        aria-describedby={errors.wallet_address ? 'wallet-error' : undefined}
                    />
                    {errors.wallet_address && (
                        <p id="wallet-error" className="mt-1.5 text-xs text-red-400 flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" /> {errors.wallet_address}
                        </p>
                    )}
                    <p className="mt-1.5 text-xs text-white/25">
                        🔒 Stored for non-custodial reward sending only. Your keys stay yours.
                    </p>
                </div>

                {/* ── Submit button ── */}
                <button
                    id="submit-idea-btn"
                    type="submit"
                    disabled={loading}
                    className="btn-primary w-full flex items-center justify-center gap-2 mt-2"
                >
                    {loading ? (
                        <>
                            {/* Spinner */}
                            <svg
                                className="animate-spin w-4 h-4"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                            >
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path
                                    className="opacity-75"
                                    fill="currentColor"
                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                                />
                            </svg>
                            Submitting…
                        </>
                    ) : (
                        <>
                            <Send className="w-4 h-4" />
                            Submit Idea
                        </>
                    )}
                </button>
            </form>
        </div>
    );
};

export default SubmitForm;
