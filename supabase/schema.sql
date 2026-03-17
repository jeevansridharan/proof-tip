-- ============================================================
-- ProofTip – Supabase Database Schema
-- Run this SQL in your Supabase project: SQL Editor → New query
-- ============================================================

-- Enable UUID generation (already enabled in Supabase by default)
-- create extension if not exists "pgcrypto";

create table if not exists public.submissions (
  id              uuid primary key default gen_random_uuid(),
  title           text             not null,
  description     text             not null,
  wallet_address  text             not null,
  upvotes         integer          not null default 0,
  "isApproved"    boolean          not null default false,
  ai_score        float            null,
  reward_sent     boolean          not null default false,
  created_at      timestamptz      not null default now()
);

-- ── Row-Level Security ────────────────────────────────────────
-- Allow anyone (anon role) to read all submissions
alter table public.submissions enable row level security;

create policy "Public read submissions"
  on public.submissions for select
  using (true);

-- Allow anyone (anon) to insert a new submission
create policy "Public insert submissions"
  on public.submissions for insert
  with check (true);

-- Allow anyone (anon) to update submissions (upvotes, approvals, etc.)
-- In production, restrict this to authenticated users / service role only!
create policy "Public update submissions"
  on public.submissions for update
  using (true);

-- ── Indexes ───────────────────────────────────────────────────
create index if not exists idx_submissions_created_at
  on public.submissions (created_at desc);

create index if not exists idx_submissions_reward_eligible
  on public.submissions (upvotes, "isApproved", ai_score, reward_sent);
