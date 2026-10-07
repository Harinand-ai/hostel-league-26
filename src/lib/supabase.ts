import { createClient } from '@supabase/supabase-js';

const env: Record<string, string | undefined> = 
  (typeof import.meta !== 'undefined' && import.meta.env) 
    ? (import.meta.env as any) 
    : (typeof globalThis !== 'undefined' && (globalThis as any).process?.env ? (globalThis as any).process.env : {});

const supabaseUrl = 
  env.VITE_SUPABASE_URL || 
  env.NEXT_PUBLIC_SUPABASE_URL || 
  '';

const supabaseAnonKey = 
  env.VITE_SUPABASE_ANON_KEY || 
  env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || 
  env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 
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

// Helper to get or initialize an authenticated or anonymous Supabase voter ID
export async function getOrInitSupabaseVoterId(): Promise<string> {
  if (isSupabaseConfigured && supabase) {
    try {
      // 1. Check existing session (authenticated admin or existing anonymous user)
      const { data: sessionData } = await supabase.auth.getSession();
      if (sessionData?.session?.user?.id) {
        return sessionData.session.user.id;
      }

      // 2. Attempt Supabase anonymous sign-in if no active session
      const { data: anonData, error } = await supabase.auth.signInAnonymously();
      if (!error && anonData?.user?.id) {
        return anonData.user.id;
      }
    } catch (err) {
      console.warn('Supabase voter session resolution notice:', err);
    }
  }

  // 3. Fallback to unique persistent device voter ID
  return getOrCreateAnonymousVoterId();
}

