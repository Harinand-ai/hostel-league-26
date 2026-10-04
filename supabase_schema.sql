-- HOSTEL LEAGUE 26
-- Supabase PostgreSQL Schema & Initial Fixtures Seed

-- Enable UUID extension if needed
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
  position TEXT NOT NULL CHECK (position IN ('GK', 'DEF', 'MID', 'FWD')),
  photo_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
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
  status TEXT NOT NULL DEFAULT 'UPCOMING' CHECK (status IN ('UPCOMING', 'LIVE', 'COMPLETED', 'POSTPONED')),
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

-- ROW LEVEL SECURITY (RLS)
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE assists ENABLE ROW LEVEL SECURITY;
ALTER TABLE man_of_the_match ENABLE ROW LEVEL SECURITY;

-- PUBLIC READ-ONLY POLICIES
CREATE POLICY "Public teams are viewable by everyone" ON teams FOR SELECT USING (true);
CREATE POLICY "Public players are viewable by everyone" ON players FOR SELECT USING (true);
CREATE POLICY "Public matches are viewable by everyone" ON matches FOR SELECT USING (true);
CREATE POLICY "Public goals are viewable by everyone" ON goals FOR SELECT USING (true);
CREATE POLICY "Public assists are viewable by everyone" ON assists FOR SELECT USING (true);
CREATE POLICY "Public motm are viewable by everyone" ON man_of_the_match FOR SELECT USING (true);

-- AUTHENTICATED ADMIN FULL ACCESS POLICIES
CREATE POLICY "Admin full access to teams" ON teams FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin full access to players" ON players FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin full access to matches" ON matches FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin full access to goals" ON goals FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin full access to assists" ON assists FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin full access to motm" ON man_of_the_match FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- SEED THE 6 OFFICIAL TEAMS
INSERT INTO teams (id, name, short_name, manager_name, primary_color, secondary_color) VALUES
  ('team-fulham', 'Fulham', 'FUL', 'Syam', '#000000', '#cc0000'),
  ('team-aston-villa', 'Aston Villa', 'AVL', 'Sinan', '#670e36', '#95bfe5'),
  ('team-spurs', 'Spurs', 'TOT', 'Hari', '#132257', '#ffffff'),
  ('team-crystal-palace', 'Crystal Palace', 'CRY', 'Prayag', '#1b458f', '#c4122d'),
  ('team-nottingham-forest', 'Nottingham Forest', 'NFO', 'Amal Jyothy', '#dd0000', '#ffffff'),
  ('team-brighton', 'Brighton', 'BHA', 'Anirudh', '#0057b8', '#ffcd00')
ON CONFLICT (id) DO UPDATE 
SET manager_name = EXCLUDED.manager_name,
    primary_color = EXCLUDED.primary_color,
    secondary_color = EXCLUDED.secondary_color;

-- SEED THE 15 OFFICIAL FIXTURES (DATE TBA, TIME TBA, VENUE TBA, STATUS UPCOMING)
INSERT INTO matches (id, match_number, round_number, home_team_id, away_team_id, scheduled_date, scheduled_time, venue, status) VALUES
  ('match-01', 1, 1, 'team-fulham', 'team-aston-villa', NULL, NULL, NULL, 'UPCOMING'),
  ('match-02', 2, 1, 'team-spurs', 'team-crystal-palace', NULL, NULL, NULL, 'UPCOMING'),
  ('match-03', 3, 1, 'team-nottingham-forest', 'team-brighton', NULL, NULL, NULL, 'UPCOMING'),
  ('match-04', 4, 2, 'team-crystal-palace', 'team-fulham', NULL, NULL, NULL, 'UPCOMING'),
  ('match-05', 5, 2, 'team-brighton', 'team-aston-villa', NULL, NULL, NULL, 'UPCOMING'),
  ('match-06', 6, 2, 'team-nottingham-forest', 'team-spurs', NULL, NULL, NULL, 'UPCOMING'),
  ('match-07', 7, 3, 'team-fulham', 'team-brighton', NULL, NULL, NULL, 'UPCOMING'),
  ('match-08', 8, 3, 'team-crystal-palace', 'team-nottingham-forest', NULL, NULL, NULL, 'UPCOMING'),
  ('match-09', 9, 3, 'team-aston-villa', 'team-spurs', NULL, NULL, NULL, 'UPCOMING'),
  ('match-10', 10, 4, 'team-nottingham-forest', 'team-fulham', NULL, NULL, NULL, 'UPCOMING'),
  ('match-11', 11, 4, 'team-spurs', 'team-brighton', NULL, NULL, NULL, 'UPCOMING'),
  ('match-12', 12, 4, 'team-aston-villa', 'team-crystal-palace', NULL, NULL, NULL, 'UPCOMING'),
  ('match-13', 13, 5, 'team-fulham', 'team-spurs', NULL, NULL, NULL, 'UPCOMING'),
  ('match-14', 14, 5, 'team-nottingham-forest', 'team-aston-villa', NULL, NULL, NULL, 'UPCOMING'),
  ('match-15', 15, 5, 'team-brighton', 'team-crystal-palace', NULL, NULL, NULL, 'UPCOMING')
ON CONFLICT (id) DO NOTHING;
