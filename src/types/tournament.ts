export type Position = 'GK' | 'DEF' | 'MID' | 'FWD';

export type MatchStatus = 'UPCOMING' | 'LIVE' | 'COMPLETED' | 'POSTPONED';

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
  photo_url?: string;
  created_at?: string;
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
