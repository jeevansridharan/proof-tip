// src/types/index.ts
// Shared TypeScript types for the ProofTip application.

/**
 * Represents a single idea submission stored in Supabase.
 */
export interface Submission {
    id: string;
    title: string;
    description: string;
    wallet_address: string;
    upvotes: number;
    isApproved: boolean;
    ai_score: number | null;
    reward_sent: boolean;
    created_at?: string;
}

/**
 * Form data used by the Submit Idea form.
 */
export interface SubmitFormData {
    title: string;
    description: string;
    wallet_address: string;
}

/**
 * Result returned after the AI evaluates a submission.
 */
export interface AIEvaluationResult {
    score: number;
    raw: string;
}
