-- HOSTEL LEAGUE 26
-- Supabase PostgreSQL Production Schema & Official Seed Data
-- Identity: SIX CLUBS • FIVE ROUNDS • FIFTEEN MATCHES • ONE CHAMPION

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. TEAMS TABLE
CREATE TABLE IF NOT EXISTS teams (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  short_name TEXT NOT NULL,
  manager_name TEXT NOT NULL,
  logo_url TEXT,
  primary_color TEXT DEFAULT '#1e293b',
  secondary_color TEXT DEFAULT '#ffffff',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. PLAYERS TABLE
CREATE TABLE IF NOT EXISTS players (
  id TEXT PRIMARY KEY,
  team_id TEXT NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  position TEXT NOT NULL CHECK (position IN ('GK', 'CB', 'MID', 'CF', 'TBD')),
  is_captain BOOLEAN NOT NULL DEFAULT FALSE,
  photo_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. MATCHES TABLE
CREATE TABLE IF NOT EXISTS matches (
  id TEXT PRIMARY KEY,
  match_number INT NOT NULL,
  round_number INT NOT NULL,
  home_team_id TEXT NOT NULL REFERENCES teams(id),
  away_team_id TEXT NOT NULL REFERENCES teams(id),
  scheduled_date TEXT,
  scheduled_time TEXT,
  venue TEXT,
  referee TEXT,
  assistant_referee_1 TEXT,
  assistant_referee_2 TEXT,
  status TEXT NOT NULL DEFAULT 'UPCOMING' CHECK (status IN ('UPCOMING', 'LIVE', 'COMPLETED', 'POSTPONED', 'CANCELLED')),
  home_score INT,
  away_score INT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. GOALS TABLE
CREATE TABLE IF NOT EXISTS goals (
  id TEXT PRIMARY KEY,
  match_id TEXT NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
  player_id TEXT NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  team_id TEXT NOT NULL REFERENCES teams(id),
  minute INT NOT NULL,
  assist_player_id TEXT REFERENCES players(id) ON DELETE SET NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. ASSISTS TABLE
CREATE TABLE IF NOT EXISTS assists (
  id TEXT PRIMARY KEY,
  match_id TEXT NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
  player_id TEXT NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  team_id TEXT NOT NULL REFERENCES teams(id),
  minute INT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. MAN OF THE MATCH TABLE
CREATE TABLE IF NOT EXISTS man_of_the_match (
  id TEXT PRIMARY KEY,
  match_id TEXT NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
  player_id TEXT NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. COMMITTEE MEMBERS TABLE
CREATE TABLE IF NOT EXISTS committee_members (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'Coordinator',
  phone TEXT NOT NULL,
  display_order INT NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. POTM POLLS TABLE
CREATE TABLE IF NOT EXISTS potm_polls (
  id TEXT PRIMARY KEY,
  match_id TEXT NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
  title TEXT NOT NULL DEFAULT 'Player of the Match',
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('draft', 'active', 'closed')),
  opened_at TIMESTAMPTZ DEFAULT NOW(),
  closed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. POTM CANDIDATES TABLE
CREATE TABLE IF NOT EXISTS potm_candidates (
  id TEXT PRIMARY KEY,
  poll_id TEXT NOT NULL REFERENCES potm_polls(id) ON DELETE CASCADE,
  player_id TEXT NOT NULL REFERENCES players(id) ON DELETE CASCADE
);

-- 10. POTM VOTES TABLE (ENFORCING ONE VOTE PER AUTHENTICATED USER PER POLL)
CREATE TABLE IF NOT EXISTS potm_votes (
  id TEXT PRIMARY KEY,
  poll_id TEXT NOT NULL REFERENCES potm_polls(id) ON DELETE CASCADE,
  candidate_id TEXT NOT NULL REFERENCES potm_candidates(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_user_vote UNIQUE (poll_id, user_id)
);

-- =========================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =========================================================================

ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE assists ENABLE ROW LEVEL SECURITY;
ALTER TABLE man_of_the_match ENABLE ROW LEVEL SECURITY;
ALTER TABLE committee_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE potm_polls ENABLE ROW LEVEL SECURITY;
ALTER TABLE potm_candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE potm_votes ENABLE ROW LEVEL SECURITY;

-- PUBLIC READ-ONLY POLICIES
DROP POLICY IF EXISTS "Public teams viewable" ON teams;
CREATE POLICY "Public teams viewable" ON teams FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public players viewable" ON players;
CREATE POLICY "Public players viewable" ON players FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public matches viewable" ON matches;
CREATE POLICY "Public matches viewable" ON matches FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public goals viewable" ON goals;
CREATE POLICY "Public goals viewable" ON goals FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public assists viewable" ON assists;
CREATE POLICY "Public assists viewable" ON assists FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public motm viewable" ON man_of_the_match;
CREATE POLICY "Public motm viewable" ON man_of_the_match FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public committee viewable" ON committee_members;
CREATE POLICY "Public committee viewable" ON committee_members FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public polls viewable" ON potm_polls;
CREATE POLICY "Public polls viewable" ON potm_polls FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public candidates viewable" ON potm_candidates;
CREATE POLICY "Public candidates viewable" ON potm_candidates FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public votes viewable" ON potm_votes;
CREATE POLICY "Public votes viewable" ON potm_votes FOR SELECT USING (true);

-- AUTHENTICATED USER VOTING POLICY
DROP POLICY IF EXISTS "Authenticated users can vote once" ON potm_votes;
CREATE POLICY "Authenticated users can vote once" ON potm_votes 
  FOR INSERT TO authenticated 
  WITH CHECK (auth.uid()::text = user_id);

-- ADMIN FULL ACCESS (Authenticated)
DROP POLICY IF EXISTS "Admin full access teams" ON teams;
CREATE POLICY "Admin full access teams" ON teams FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Admin full access players" ON players;
CREATE POLICY "Admin full access players" ON players FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Admin full access matches" ON matches;
CREATE POLICY "Admin full access matches" ON matches FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Admin full access goals" ON goals;
CREATE POLICY "Admin full access goals" ON goals FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Admin full access assists" ON assists;
CREATE POLICY "Admin full access assists" ON assists FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Admin full access motm" ON man_of_the_match;
CREATE POLICY "Admin full access motm" ON man_of_the_match FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Admin full access committee" ON committee_members;
CREATE POLICY "Admin full access committee" ON committee_members FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Admin full access polls" ON potm_polls;
CREATE POLICY "Admin full access polls" ON potm_polls FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Admin full access candidates" ON potm_candidates;
CREATE POLICY "Admin full access candidates" ON potm_candidates FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Admin full access votes" ON potm_votes;
CREATE POLICY "Admin full access votes" ON potm_votes FOR ALL TO authenticated USING (true) WITH CHECK (true);


-- =========================================================================
-- SEED DATA
-- =========================================================================

-- 1. SEED THE 6 OFFICIAL TEAMS
INSERT INTO teams (id, name, short_name, manager_name, primary_color, secondary_color) VALUES
  ('team-crystal-palace', 'Crystal Palace', 'CRY', 'Prayag', '#1b458f', '#c4122d'),
  ('team-spurs', 'Spurs', 'TOT', 'Hari', '#132257', '#ffffff'),
  ('team-aston-villa', 'Aston Villa', 'AVL', 'Sinan', '#670e36', '#95bfe5'),
  ('team-brighton', 'Brighton', 'BHA', 'Anirudh', '#0057b8', '#ffcd00'),
  ('team-fulham', 'Fulham', 'FUL', 'Syam', '#000000', '#cc0000'),
  ('team-nottingham-forest', 'Nottingham Forest', 'NFO', 'Amal Jyothy', '#dd0000', '#ffffff')
ON CONFLICT (id) DO UPDATE 
SET name = EXCLUDED.name,
    manager_name = EXCLUDED.manager_name,
    primary_color = EXCLUDED.primary_color,
    secondary_color = EXCLUDED.secondary_color;

-- 2. SEED THE 15 OFFICIAL FIXTURES (DATE TBA, TIME TBA, VENUE TBA, OFFICIALS TBA, STATUS UPCOMING)
INSERT INTO matches (id, match_number, round_number, home_team_id, away_team_id, scheduled_date, scheduled_time, venue, referee, assistant_referee_1, assistant_referee_2, status) VALUES
  ('match-01', 1, 1, 'team-fulham', 'team-aston-villa', NULL, NULL, NULL, NULL, NULL, NULL, 'UPCOMING'),
  ('match-02', 2, 1, 'team-spurs', 'team-crystal-palace', NULL, NULL, NULL, NULL, NULL, NULL, 'UPCOMING'),
  ('match-03', 3, 1, 'team-nottingham-forest', 'team-brighton', NULL, NULL, NULL, NULL, NULL, NULL, 'UPCOMING'),
  ('match-04', 4, 2, 'team-crystal-palace', 'team-fulham', NULL, NULL, NULL, NULL, NULL, NULL, 'UPCOMING'),
  ('match-05', 5, 2, 'team-brighton', 'team-aston-villa', NULL, NULL, NULL, NULL, NULL, NULL, 'UPCOMING'),
  ('match-06', 6, 2, 'team-nottingham-forest', 'team-spurs', NULL, NULL, NULL, NULL, NULL, NULL, 'UPCOMING'),
  ('match-07', 7, 3, 'team-fulham', 'team-brighton', NULL, NULL, NULL, NULL, NULL, NULL, 'UPCOMING'),
  ('match-08', 8, 3, 'team-crystal-palace', 'team-nottingham-forest', NULL, NULL, NULL, NULL, NULL, NULL, 'UPCOMING'),
  ('match-09', 9, 3, 'team-aston-villa', 'team-spurs', NULL, NULL, NULL, NULL, NULL, NULL, 'UPCOMING'),
  ('match-10', 10, 4, 'team-nottingham-forest', 'team-fulham', NULL, NULL, NULL, NULL, NULL, NULL, 'UPCOMING'),
  ('match-11', 11, 4, 'team-spurs', 'team-brighton', NULL, NULL, NULL, NULL, NULL, NULL, 'UPCOMING'),
  ('match-12', 12, 4, 'team-aston-villa', 'team-crystal-palace', NULL, NULL, NULL, NULL, NULL, NULL, 'UPCOMING'),
  ('match-13', 13, 5, 'team-fulham', 'team-spurs', NULL, NULL, NULL, NULL, NULL, NULL, 'UPCOMING'),
  ('match-14', 14, 5, 'team-nottingham-forest', 'team-aston-villa', NULL, NULL, NULL, NULL, NULL, NULL, 'UPCOMING'),
  ('match-15', 15, 5, 'team-brighton', 'team-crystal-palace', NULL, NULL, NULL, NULL, NULL, NULL, 'UPCOMING')
ON CONFLICT (id) DO NOTHING;

-- 3. SEED THE 54 OFFICIAL CONFIRMED PLAYERS
INSERT INTO players (id, team_id, name, position, is_captain, photo_url) VALUES
  -- SPURS
  ('player-spurs-01', 'team-spurs', 'Adithyan', 'CB', TRUE, '/photos/Adithyan Tp.jpg'),
  ('player-spurs-02', 'team-spurs', 'Adithya', 'GK', FALSE, '/photos/Adithya Venugopalan.jpg'),
  ('player-spurs-03', 'team-spurs', 'Famil', 'CF', FALSE, '/photos/Famil V.jpeg'),
  ('player-spurs-04', 'team-spurs', 'Surya Kiran', 'CF', FALSE, '/photos/Suryakiran.jpeg'),
  ('player-spurs-05', 'team-spurs', 'Ashin', 'MID', FALSE, '/photos/Ashink.png'),
  ('player-spurs-06', 'team-spurs', 'Aswadev', 'CB', FALSE, '/photos/ASWADEV T.jpeg'),
  ('player-spurs-07', 'team-spurs', 'Shiva', 'CF', FALSE, '/photos/Shiva.png'),
  ('player-spurs-08', 'team-spurs', 'Abhinav Ravi', 'CF', FALSE, '/photos/Abhinav Ravi.jpg'),
  ('player-spurs-09', 'team-spurs', 'Aghosh', 'CB', FALSE, '/photos/Aghosh VK.jpg'),

  -- CRYSTAL PALACE
  ('player-crystal-01', 'team-crystal-palace', 'Sriraj', 'MID', TRUE, '/photos/Sriraj C.jpg'),
  ('player-crystal-02', 'team-crystal-palace', 'Hrithesh', 'GK', FALSE, '/photos/Hrithesh k.jpg'),
  ('player-crystal-03', 'team-crystal-palace', 'Dhruv', 'CB', FALSE, '/photos/Dhruvnand T.jpg'),
  ('player-crystal-04', 'team-crystal-palace', 'Abhijith PP', 'CB', FALSE, '/photos/Abhijith P P.jpeg'),
  ('player-crystal-05', 'team-crystal-palace', 'Mihal', 'MID', FALSE, '/photos/Mihal Ali.jpg'),
  ('player-crystal-06', 'team-crystal-palace', 'Siddarth', 'CF', FALSE, '/photos/Sidharth K S.jpg'),
  ('player-crystal-07', 'team-crystal-palace', 'Rishyaj', 'CB', FALSE, '/photos/Rishyaj Sumesh.jpg'),
  ('player-crystal-08', 'team-crystal-palace', 'Abhinand', 'CB', FALSE, '/photos/Abhinand.jpeg'),
  ('player-crystal-09', 'team-crystal-palace', 'Amay', 'TBD', FALSE, NULL),

  -- NOTTINGHAM FOREST
  ('player-forest-01', 'team-nottingham-forest', 'Yannis', 'MID', TRUE, '/photos/Mohammed yannis.jpeg'),
  ('player-forest-02', 'team-nottingham-forest', 'Mishal', 'GK', FALSE, '/photos/Mishal Ramachandran.jpg'),
  ('player-forest-03', 'team-nottingham-forest', 'Shammaz', 'MID', FALSE, '/photos/MUHAMMED SHAMMAS.jpeg'),
  ('player-forest-04', 'team-nottingham-forest', 'Adwaith', 'CB', FALSE, NULL),
  ('player-forest-05', 'team-nottingham-forest', 'Tharun', 'MID', FALSE, '/photos/Tharun Gk.jpeg'),
  ('player-forest-06', 'team-nottingham-forest', 'Roshith', 'MID', FALSE, '/photos/Roshith K.jpg'),
  ('player-forest-07', 'team-nottingham-forest', 'Alan', 'MID', FALSE, '/photos/alen arjup.jpeg'),
  ('player-forest-08', 'team-nottingham-forest', 'Razi', 'MID', FALSE, '/photos/Razi.jpg'),
  ('player-forest-09', 'team-nottingham-forest', 'Harshith', 'CB', FALSE, '/photos/Harshith HK.jpg'),

  -- FULHAM
  ('player-fulham-01', 'team-fulham', 'Ameen', 'CB', TRUE, '/photos/Ameen.jpeg'),
  ('player-fulham-02', 'team-fulham', 'Vaishnav', 'GK', FALSE, NULL),
  ('player-fulham-03', 'team-fulham', 'Rabeeh', 'MID', FALSE, '/photos/Rabeeh Naufel.jpeg'),
  ('player-fulham-04', 'team-fulham', 'Adhil', 'CF', FALSE, NULL),
  ('player-fulham-05', 'team-fulham', 'Anay', 'MID', FALSE, '/photos/Anay M.jpg'),
  ('player-fulham-06', 'team-fulham', 'Jaseen', 'CF', FALSE, '/photos/Jaseem.jpg'),
  ('player-fulham-07', 'team-fulham', 'Shamil', 'CB', FALSE, '/photos/Shamil Shaffi.jpeg'),
  ('player-fulham-08', 'team-fulham', 'Kashi', 'MID', FALSE, '/photos/Kasi Viswanath.jpg'),
  ('player-fulham-09', 'team-fulham', 'Abhinjith', 'MID', FALSE, NULL),

  -- BRIGHTON
  ('player-brighton-01', 'team-brighton', 'Dheeraj', 'TBD', TRUE, NULL),
  ('player-brighton-02', 'team-brighton', 'Adwaith', 'GK', FALSE, NULL),
  ('player-brighton-03', 'team-brighton', 'Prayag Babu', 'CB', FALSE, '/photos/Prayag babu.jpg'),
  ('player-brighton-04', 'team-brighton', 'Anand', 'MID', FALSE, '/photos/ANAND Ek.jpg'),
  ('player-brighton-05', 'team-brighton', 'Adwaith', 'CB', FALSE, NULL),
  ('player-brighton-06', 'team-brighton', 'Sinan', 'CF', FALSE, '/photos/Muhammed Sinan P.jpeg'),
  ('player-brighton-07', 'team-brighton', 'Mrinal', 'CF', FALSE, '/photos/Mrinal Ramachandran.jpg'),
  ('player-brighton-08', 'team-brighton', 'Jagath', 'MID', FALSE, '/photos/Jagath Sanjay.jpg'),
  ('player-brighton-09', 'team-brighton', 'Abhiram', 'CB', FALSE, '/photos/Abhiram.jpeg'),

  -- ASTON VILLA
  ('player-villa-01', 'team-aston-villa', 'Ashik', 'MID', TRUE, '/photos/Ashik Krishnan.jpg'),
  ('player-villa-02', 'team-aston-villa', 'Abdu', 'MID', FALSE, '/photos/Abdu Rahman.JPG'),
  ('player-villa-03', 'team-aston-villa', 'Tahsin', 'CB', FALSE, '/photos/Md Tahsin.jpg'),
  ('player-villa-04', 'team-aston-villa', 'Yedhukrishna', 'GK', FALSE, '/photos/Yadhukrishna.jpg'),
  ('player-villa-05', 'team-aston-villa', 'Adhith Anil', 'CF', FALSE, '/photos/Adith Anil.jpeg'),
  ('player-villa-06', 'team-aston-villa', 'Ahdal', 'CB', FALSE, '/photos/UHM AHDAL RAHMAN.jpeg'),
  ('player-villa-07', 'team-aston-villa', 'Shehzad', 'MID', FALSE, '/photos/muhammed shahzad.jpeg'),
  ('player-villa-08', 'team-aston-villa', 'Hijan Saidu', 'CB', FALSE, '/photos/Hijan Saidu.jpeg'),
  ('player-villa-09', 'team-aston-villa', 'Nijad', 'CF', FALSE, '/photos/Nijad Nijad.jpg')
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    team_id = EXCLUDED.team_id,
    position = EXCLUDED.position,
    is_captain = EXCLUDED.is_captain,
    photo_url = EXCLUDED.photo_url;

-- 4. SEED OFFICIAL TOURNAMENT COMMITTEE COORDINATORS
INSERT INTO committee_members (id, name, role, phone, display_order) VALUES
  ('committee-01', 'Devnand SR', 'Coordinator', '9605729219', 1),
  ('committee-02', 'Famil V', 'Coordinator', '9400860394', 2),
  ('committee-03', 'Abdu Rahman', 'Coordinator', '9562491337', 3)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    role = EXCLUDED.role,
    phone = EXCLUDED.phone,
    display_order = EXCLUDED.display_order;
