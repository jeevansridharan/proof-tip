// src/services/submissionService.ts
// All database operations for the "submissions" table via Supabase.

import { supabase } from '../lib/supabase';
import type { Submission, SubmitFormData } from '../types';

/**
 * Insert a new submission into the database.
 * Returns the created submission or throws on error.
 */
export async function createSubmission(data: SubmitFormData): Promise<Submission> {
    const { data: row, error } = await supabase
        .from('submissions')
        .insert([
            {
                title: data.title.trim(),
                description: data.description.trim(),
                wallet_address: data.wallet_address.trim(),
                upvotes: 0,
                isApproved: false,
                ai_score: null,
                reward_sent: false,
            },
        ])
        .select()
        .single();

    if (error) throw error;
    return row as Submission;
}

/**
 * Fetch all submissions ordered by most recent first.
 */
export async function fetchSubmissions(): Promise<Submission[]> {
    const { data, error } = await supabase
        .from('submissions')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) throw error;
    return (data ?? []) as Submission[];
}

/**
 * Increment the upvote count for a submission by 1.
 */
export async function upvoteSubmission(id: string, currentUpvotes: number): Promise<void> {
    const { error } = await supabase
        .from('submissions')
        .update({ upvotes: currentUpvotes + 1 })
        .eq('id', id);

    if (error) throw error;
}

/**
 * Approve or reject a submission (mentor action).
 */
export async function setApproval(id: string, approved: boolean): Promise<void> {
    const { error } = await supabase
        .from('submissions')
        .update({ isApproved: approved })
        .eq('id', id);

    if (error) throw error;
}

/**
 * Store the AI score returned from evaluation.
 */
export async function setAIScore(id: string, score: number): Promise<void> {
    const { error } = await supabase
        .from('submissions')
        .update({ ai_score: score })
        .eq('id', id);

    if (error) throw error;
}

/**
 * Mark a submission's reward as sent.
 */
export async function markRewardSent(id: string): Promise<void> {
    const { error } = await supabase
        .from('submissions')
        .update({ reward_sent: true })
        .eq('id', id);

    if (error) throw error;
}

/**
 * Fetch submissions that are eligible for reward:
 *  upvotes >= 5, isApproved, ai_score >= 7, reward not yet sent.
 */
export async function fetchEligibleSubmissions(): Promise<Submission[]> {
    const { data, error } = await supabase
        .from('submissions')
        .select('*')
        .gte('upvotes', 5)
        .eq('isApproved', true)
        .gte('ai_score', 7)
        .eq('reward_sent', false);

    if (error) throw error;
    return (data ?? []) as Submission[];
}
