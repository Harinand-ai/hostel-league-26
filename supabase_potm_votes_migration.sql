-- =========================================================================
-- HOSTEL LEAGUE 26: POTM VOTES RLS & ANONYMOUS VOTING MIGRATION
-- Run this script in your Supabase Project: Dashboard -> SQL Editor -> Run
-- =========================================================================

-- 1. Ensure Table Structure & Unique Constraint (1 vote per user per poll)
CREATE TABLE IF NOT EXISTS potm_votes (
  id TEXT PRIMARY KEY,
  poll_id TEXT NOT NULL REFERENCES potm_polls(id) ON DELETE CASCADE,
  candidate_id TEXT NOT NULL REFERENCES potm_candidates(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_user_vote UNIQUE (poll_id, user_id)
);

-- Ensure UNIQUE(poll_id, user_id) constraint is active
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'unique_user_vote'
  ) THEN
    ALTER TABLE potm_votes ADD CONSTRAINT unique_user_vote UNIQUE (poll_id, user_id);
  END IF;
END $$;

-- 2. Enable Row Level Security (RLS)
ALTER TABLE potm_votes ENABLE ROW LEVEL SECURITY;

-- 3. Public Read Policy (Everyone can view all votes in a poll)
DROP POLICY IF EXISTS "Public votes viewable" ON potm_votes;
CREATE POLICY "Public votes viewable" ON potm_votes 
  FOR SELECT 
  USING (true);

-- 4. Public Vote Insert Policy
-- Allows public/anonymous and authenticated users to submit exactly one vote.
-- If auth.uid() is available (Supabase anonymous auth or login), ensures user_id = auth.uid() to prevent impersonation.
-- If unauthenticated anon client, allows inserting with their unique client device identifier.
DROP POLICY IF EXISTS "Authenticated users can vote once" ON potm_votes;
DROP POLICY IF EXISTS "Public can vote once" ON potm_votes;

CREATE POLICY "Public can vote once" ON potm_votes 
  FOR INSERT TO anon, authenticated 
  WITH CHECK (
    (auth.uid() IS NOT NULL AND auth.uid()::text = user_id)
    OR
    (auth.uid() IS NULL AND user_id IS NOT NULL AND length(trim(user_id)) > 0)
  );

-- 5. Admin Full Access Policy
DROP POLICY IF EXISTS "Admin full access votes" ON potm_votes;
CREATE POLICY "Admin full access votes" ON potm_votes 
  FOR ALL TO authenticated 
  USING (true) 
  WITH CHECK (true);

-- 6. SECURITY DEFINER RPC (High-reliability voting endpoint)
-- Handles vote submission directly in Postgres, safely handling unique duplicate violations.
CREATE OR REPLACE FUNCTION submit_potm_vote(
  p_poll_id TEXT,
  p_candidate_id TEXT,
  p_user_id TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_vote_id TEXT;
  v_user_id TEXT;
BEGIN
  -- Determine effective voter ID: use Supabase auth.uid() if authenticated, otherwise p_user_id
  IF auth.uid() IS NOT NULL THEN
    v_user_id := auth.uid()::text;
  ELSE
    v_user_id := COALESCE(NULLIF(trim(p_user_id), ''), 'anon-' || gen_random_uuid()::text);
  END IF;

  v_vote_id := 'vote-' || extract(epoch from now())::bigint || '-' || substr(md5(random()::text), 1, 6);

  INSERT INTO potm_votes (id, poll_id, candidate_id, user_id, created_at)
  VALUES (v_vote_id, p_poll_id, p_candidate_id, v_user_id, NOW());

  RETURN jsonb_build_object('success', true, 'vote_id', v_vote_id, 'user_id', v_user_id);
EXCEPTION
  WHEN unique_violation THEN
    RETURN jsonb_build_object('success', false, 'error', 'You have already voted in this poll.');
  WHEN OTHERS THEN
    RETURN jsonb_build_object('success', false, 'error', SQLERRM);
END;
$$;

GRANT EXECUTE ON FUNCTION submit_potm_vote(TEXT, TEXT, TEXT) TO anon, authenticated;
