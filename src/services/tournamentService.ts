import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { Team, Match, Player, Goal, Assist, ManOfTheMatch } from '../types/tournament';
import { INITIAL_TEAMS, INITIAL_MATCHES } from '../data/initialData';

const STORAGE_KEYS = {
  TEAMS: 'hl26_teams',
  MATCHES: 'hl26_matches',
  PLAYERS: 'hl26_players',
  GOALS: 'hl26_goals',
  ASSISTS: 'hl26_assists',
  MOTM: 'hl26_motm',
};

function generateId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
}

class TournamentService {
  private initLocalStore() {
    if (typeof window === 'undefined') return;

    if (!localStorage.getItem(STORAGE_KEYS.TEAMS)) {
      localStorage.setItem(STORAGE_KEYS.TEAMS, JSON.stringify(INITIAL_TEAMS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.MATCHES)) {
      localStorage.setItem(STORAGE_KEYS.MATCHES, JSON.stringify(INITIAL_MATCHES));
    }
    if (!localStorage.getItem(STORAGE_KEYS.PLAYERS)) {
      localStorage.setItem(STORAGE_KEYS.PLAYERS, JSON.stringify([]));
    }
    if (!localStorage.getItem(STORAGE_KEYS.GOALS)) {
      localStorage.setItem(STORAGE_KEYS.GOALS, JSON.stringify([]));
    }
    if (!localStorage.getItem(STORAGE_KEYS.ASSISTS)) {
      localStorage.setItem(STORAGE_KEYS.ASSISTS, JSON.stringify([]));
    }
    if (!localStorage.getItem(STORAGE_KEYS.MOTM)) {
      localStorage.setItem(STORAGE_KEYS.MOTM, JSON.stringify([]));
    }
  }

  constructor() {
    this.initLocalStore();
  }

  // TEAMS
  async getTeams(): Promise<Team[]> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('teams').select('*').order('name');
      if (!error && data && data.length > 0) return data as Team[];
    }
    this.initLocalStore();
    const stored = localStorage.getItem(STORAGE_KEYS.TEAMS);
    return stored ? JSON.parse(stored) : INITIAL_TEAMS;
  }

  async updateTeamManager(teamId: string, managerName: string): Promise<void> {
    if (isSupabaseConfigured && supabase) {
      await supabase.from('teams').update({ manager_name: managerName }).eq('id', teamId);
    }
    const teams = await this.getTeams();
    const updated = teams.map(t => t.id === teamId ? { ...t, manager_name: managerName } : t);
    localStorage.setItem(STORAGE_KEYS.TEAMS, JSON.stringify(updated));
  }

  // MATCHES
  async getMatches(): Promise<Match[]> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('matches').select('*').order('match_number');
      if (!error && data && data.length > 0) return data as Match[];
    }
    this.initLocalStore();
    const stored = localStorage.getItem(STORAGE_KEYS.MATCHES);
    return stored ? JSON.parse(stored) : INITIAL_MATCHES;
  }

  async updateMatch(match: Match): Promise<void> {
    if (isSupabaseConfigured && supabase) {
      await supabase.from('matches').update({
        scheduled_date: match.scheduled_date,
        scheduled_time: match.scheduled_time,
        venue: match.venue,
        status: match.status,
        home_score: match.home_score,
        away_score: match.away_score,
        updated_at: new Date().toISOString()
      }).eq('id', match.id);
    }
    const matches = await this.getMatches();
    const updated = matches.map(m => m.id === match.id ? match : m);
    localStorage.setItem(STORAGE_KEYS.MATCHES, JSON.stringify(updated));
  }

  // PLAYERS
  async getPlayers(): Promise<Player[]> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('players').select('*').order('name');
      if (!error && data) return data as Player[];
    }
    this.initLocalStore();
    const stored = localStorage.getItem(STORAGE_KEYS.PLAYERS);
    return stored ? JSON.parse(stored) : [];
  }

  async addPlayer(player: Omit<Player, 'id'>): Promise<Player> {
    const newPlayer: Player = {
      ...player,
      id: generateId('player'),
      created_at: new Date().toISOString()
    };
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('players').insert(newPlayer).select().single();
      if (!error && data) return data as Player;
    }
    const players = await this.getPlayers();
    players.push(newPlayer);
    localStorage.setItem(STORAGE_KEYS.PLAYERS, JSON.stringify(players));
    return newPlayer;
  }

  async updatePlayer(player: Player): Promise<void> {
    if (isSupabaseConfigured && supabase) {
      await supabase.from('players').update(player).eq('id', player.id);
    }
    const players = await this.getPlayers();
    const updated = players.map(p => p.id === player.id ? player : p);
    localStorage.setItem(STORAGE_KEYS.PLAYERS, JSON.stringify(updated));
  }

  async deletePlayer(id: string): Promise<void> {
    if (isSupabaseConfigured && supabase) {
      await supabase.from('players').delete().eq('id', id);
    }
    const players = await this.getPlayers();
    const updated = players.filter(p => p.id !== id);
    localStorage.setItem(STORAGE_KEYS.PLAYERS, JSON.stringify(updated));
  }

  // GOALS & ASSISTS & MOTM
  async getGoals(): Promise<Goal[]> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('goals').select('*');
      if (!error && data) return data as Goal[];
    }
    this.initLocalStore();
    const stored = localStorage.getItem(STORAGE_KEYS.GOALS);
    return stored ? JSON.parse(stored) : [];
  }

  async getAssists(): Promise<Assist[]> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('assists').select('*');
      if (!error && data) return data as Assist[];
    }
    this.initLocalStore();
    const stored = localStorage.getItem(STORAGE_KEYS.ASSISTS);
    return stored ? JSON.parse(stored) : [];
  }

  async getManOfTheMatches(): Promise<ManOfTheMatch[]> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('man_of_the_match').select('*');
      if (!error && data) return data as ManOfTheMatch[];
    }
    this.initLocalStore();
    const stored = localStorage.getItem(STORAGE_KEYS.MOTM);
    return stored ? JSON.parse(stored) : [];
  }

  // SAVE MATCH RESULT & EVENTS
  async saveMatchResult(
    matchId: string,
    homeScore: number,
    awayScore: number,
    goals: { player_id: string; team_id: string; minute: number }[],
    assists: { player_id: string; team_id: string; minute?: number }[],
    motmPlayerId?: string
  ): Promise<void> {
    const matches = await this.getMatches();
    const targetMatch = matches.find(m => m.id === matchId);
    if (!targetMatch) return;

    targetMatch.home_score = homeScore;
    targetMatch.away_score = awayScore;
    targetMatch.status = 'COMPLETED';
    targetMatch.updated_at = new Date().toISOString();

    await this.updateMatch(targetMatch);

    // Save Goals
    const newGoals: Goal[] = goals.map(g => ({
      id: generateId('goal'),
      match_id: matchId,
      player_id: g.player_id,
      team_id: g.team_id,
      minute: g.minute,
      created_at: new Date().toISOString(),
    }));

    if (isSupabaseConfigured && supabase) {
      await supabase.from('goals').delete().eq('match_id', matchId);
      if (newGoals.length > 0) {
        await supabase.from('goals').insert(newGoals);
      }
    }
    const allGoals = (await this.getGoals()).filter(g => g.match_id !== matchId);
    allGoals.push(...newGoals);
    localStorage.setItem(STORAGE_KEYS.GOALS, JSON.stringify(allGoals));

    // Save Assists
    const newAssists: Assist[] = assists.map(a => ({
      id: generateId('assist'),
      match_id: matchId,
      player_id: a.player_id,
      team_id: a.team_id,
      minute: a.minute,
      created_at: new Date().toISOString(),
    }));

    if (isSupabaseConfigured && supabase) {
      await supabase.from('assists').delete().eq('match_id', matchId);
      if (newAssists.length > 0) {
        await supabase.from('assists').insert(newAssists);
      }
    }
    const allAssists = (await this.getAssists()).filter(a => a.match_id !== matchId);
    allAssists.push(...newAssists);
    localStorage.setItem(STORAGE_KEYS.ASSISTS, JSON.stringify(allAssists));

    // Save MOTM
    if (motmPlayerId) {
      const motmItem: ManOfTheMatch = {
        id: generateId('motm'),
        match_id: matchId,
        player_id: motmPlayerId,
        created_at: new Date().toISOString(),
      };
      if (isSupabaseConfigured && supabase) {
        await supabase.from('man_of_the_match').delete().eq('match_id', matchId);
        await supabase.from('man_of_the_match').insert(motmItem);
      }
      const allMotm = (await this.getManOfTheMatches()).filter(m => m.match_id !== matchId);
      allMotm.push(motmItem);
      localStorage.setItem(STORAGE_KEYS.MOTM, JSON.stringify(allMotm));
    }
  }

  // Restore pure tournament state
  resetToOfficialFixtures(): void {
    localStorage.setItem(STORAGE_KEYS.TEAMS, JSON.stringify(INITIAL_TEAMS));
    localStorage.setItem(STORAGE_KEYS.MATCHES, JSON.stringify(INITIAL_MATCHES));
    localStorage.setItem(STORAGE_KEYS.PLAYERS, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.GOALS, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.ASSISTS, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.MOTM, JSON.stringify([]));
  }
}

export const tournamentService = new TournamentService();
