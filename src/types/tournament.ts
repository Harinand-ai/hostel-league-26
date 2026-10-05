export type Position = 'GK' | 'CB' | 'MID' | 'CF' | 'TBD';

export type MatchStatus = 'UPCOMING' | 'LIVE' | 'COMPLETED' | 'POSTPONED' | 'CANCELLED';

export interface Team {
  id: string;
  name: string;
  short_name: string;
  manager_name: string;
  logo_url?: string;
  primary_color: string;
  secondary_color: string;
  created_at?: string;
}

export interface Player {
  id: string;
  team_id: string;
  name: string;
  position: Position;
  is_captain: boolean;
  photo_url?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Match {
  id: string;
  match_number: number;
  round_number: number;
  home_team_id: string;
  away_team_id: string;
  scheduled_date: string | null;
  scheduled_time: string | null;
  venue: string | null;
  referee: string | null;
  assistant_referee_1: string | null;
  assistant_referee_2: string | null;
  status: MatchStatus;
  home_score: number | null;
  away_score: number | null;
  created_at?: string;
  updated_at?: string;
}

export interface Goal {
  id: string;
  match_id: string;
  player_id: string;
  team_id: string;
  minute: number;
  assist_player_id?: string | null;
  description?: string | null;
  created_at?: string;
}

export interface Assist {
  id: string;
  match_id: string;
  player_id: string;
  team_id: string;
  minute?: number;
  created_at?: string;
}

export interface ManOfTheMatch {
  id: string;
  match_id: string;
  player_id: string;
  created_at?: string;
}

export interface CommitteeMember {
  id: string;
  name: string;
  role: string;
  phone: string;
  display_order: number;
  created_at?: string;
}

export interface TournamentRule {
  id: number;
  title: string;
  description: string;
  subrules?: string[];
}

export interface POTMPoll {
  id: string;
  match_id: string;
  title: string;
  status: 'draft' | 'active' | 'closed';
  opened_at?: string | null;
  closed_at?: string | null;
  created_at?: string;
}

export interface POTMCandidate {
  id: string;
  poll_id: string;
  player_id: string;
}

export interface POTMVote {
  id: string;
  poll_id: string;
  candidate_id: string;
  user_id: string;
  created_at?: string;
}

export interface TeamStanding {
  position: number;
  team: Team;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goals_for: number;
  goals_against: number;
  goal_difference: number;
  points: number;
  form: ('W' | 'D' | 'L')[];
}

export interface PlayerStatEntry {
  player_id: string;
  player_name: string;
  team: Team;
  value: number;
}

