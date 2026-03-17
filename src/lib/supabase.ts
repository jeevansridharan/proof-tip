// src/lib/supabase.ts
// Supabase client initialised from Vite env variables.
// Make sure to fill in VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file.

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnon = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

if (!supabaseUrl || !supabaseAnon) {
    console.warn(
        '⚠️  Supabase env vars are missing. ' +
        'Copy .env.example → .env and fill in your credentials.'
    );
}

export const supabase = createClient(supabaseUrl || '', supabaseAnon || '');
