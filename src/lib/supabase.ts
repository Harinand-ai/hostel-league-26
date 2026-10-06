import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 
  import.meta.env.VITE_SUPABASE_URL || 
  import.meta.env.NEXT_PUBLIC_SUPABASE_URL || 
  '';

const supabaseAnonKey = 
  import.meta.env.VITE_SUPABASE_ANON_KEY || 
  import.meta.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || 
  import.meta.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 
  '';

export const isSupabaseConfigured = Boolean(
  supabaseUrl && 
  supabaseAnonKey && 
  supabaseUrl !== 'https://your-project.supabase.co' &&
  !supabaseUrl.includes('placeholder')
);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    })
  : null;

// Helper to get or generate a persistent anonymous client voter ID
export function getOrCreateAnonymousVoterId(): string {
  if (typeof window === 'undefined') return 'anon-server';
  let voterId = localStorage.getItem('hl26_anon_voter_id');
  if (!voterId) {
    voterId = 'voter-' + Date.now().toString(36) + '-' + Math.random().toString(36).substring(2, 9);
    localStorage.setItem('hl26_anon_voter_id', voterId);
  }
  return voterId;
}
