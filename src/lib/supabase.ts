// src/lib/supabase.ts
// Supabase client initialised from Vite env variables.
// Make sure to fill in VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file.

import { createClient } from '@supabase/supabase-js';

const supabaseUrl  = import.meta.env.VITE_SUPABASE_URL  as string | undefined;
const supabaseAnon = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

// Check if the values look like real URLs (not placeholders)
const isValidUrl = (url: string | undefined): boolean => {
  if (!url) return false;
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
};

export const supabaseConfigured =
  isValidUrl(supabaseUrl) && !!supabaseAnon && supabaseAnon !== 'your_supabase_anon_key';

// Only create a real client if config is valid; otherwise use a safe dummy
// so the app renders without crashing.
export const supabase = supabaseConfigured
  ? createClient(supabaseUrl!, supabaseAnon!)
  : createClient('https://placeholder.supabase.co', 'placeholder-anon-key');
