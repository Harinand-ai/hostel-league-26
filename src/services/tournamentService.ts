import { supabase, isSupabaseConfigured } from '../lib/supabase';
import {
  Team,
  Match,
  Player,
  Goal,
  Assist,
  ManOfTheMatch,
  CommitteeMember,
  POTMPoll,
  POTMCandidate,
  POTMVote,
} from '../types/tournament';
import {
  INITIAL_TEAMS,
  INITIAL_MATCHES,
  INITIAL_PLAYERS,
  INITIAL_COMMITTEE,
} from '../data/initialData';

const STORAGE_KEYS = {
  TEAMS: 'hl26_teams',
  MATCHES: 'hl26_matches',
  PLAYERS: 'hl26_players',
  GOALS: 'hl26_goals',
  ASSISTS: 'hl26_assists',
  MOTM: 'hl26_motm',
  COMMITTEE: 'hl26_committee',
  POLLS: 'hl26_polls',
  CANDIDATES: 'hl26_candidates',
  VOTES: 'hl26_votes',
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
    const storedPlayers = localStorage.getItem(STORAGE_KEYS.PLAYERS);
    if (!storedPlayers || JSON.parse(storedPlayers).length === 0) {
      localStorage.setItem(STORAGE_KEYS.PLAYERS, JSON.stringify(INITIAL_PLAYERS));
    } else {
      try {
        const parsed: Player[] = JSON.parse(storedPlayers);
        let hasChanges = false;
        const initialMap = new Map(INITIAL_PLAYERS.map(p => [p.id, p]));
        const updated = parsed.map(p => {
          const init = initialMap.get(p.id);
          if (init?.photo_url && !p.photo_url) {
            hasChanges = true;
            return { ...p, photo_url: init.photo_url };
          }
          return p;
        });
        if (hasChanges) {
          localStorage.setItem(STORAGE_KEYS.PLAYERS, JSON.stringify(updated));
        }
      } catch (err) {
        console.warn('Error synchronizing stored player photos:', err);
      }
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
    if (!localStorage.getItem(STORAGE_KEYS.COMMITTEE)) {
      localStorage.setItem(STORAGE_KEYS.COMMITTEE, JSON.stringify(INITIAL_COMMITTEE));
    }
    if (!localStorage.getItem(STORAGE_KEYS.POLLS)) {
      localStorage.setItem(STORAGE_KEYS.POLLS, JSON.stringify([]));
    }
    if (!localStorage.getItem(STORAGE_KEYS.CANDIDATES)) {
      localStorage.setItem(STORAGE_KEYS.CANDIDATES, JSON.stringify([]));
    }
    if (!localStorage.getItem(STORAGE_KEYS.VOTES)) {
      localStorage.setItem(STORAGE_KEYS.VOTES, JSON.stringify([]));
    }
  }

  constructor() {
    this.initLocalStore();
  }

  // ================= TEAMS =================
  async getTeams(): Promise<Team[]> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.from('teams').select('*').order('name');
        if (!error && data && data.length > 0) return data as Team[];
      } catch (err) {
        console.warn('Supabase getTeams error, falling back to local storage:', err);
      }
    }
    this.initLocalStore();
    const stored = localStorage.getItem(STORAGE_KEYS.TEAMS);
    return stored ? JSON.parse(stored) : INITIAL_TEAMS;
  }

  async updateTeamManager(teamId: string, managerName: string): Promise<void> {
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('teams').update({ manager_name: managerName }).eq('id', teamId);
      } catch (err) {
        console.warn('Supabase updateTeamManager error:', err);
      }
    }
    const teams = await this.getTeams();
    const updated = teams.map(t => t.id === teamId ? { ...t, manager_name: managerName } : t);
    localStorage.setItem(STORAGE_KEYS.TEAMS, JSON.stringify(updated));
  }

  // ================= MATCHES =================
  async getMatches(): Promise<Match[]> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.from('matches').select('*').order('match_number');
        if (!error && data && data.length > 0) return data as Match[];
      } catch (err) {
        console.warn('Supabase getMatches error, falling back to local storage:', err);
      }
    }
    this.initLocalStore();
    const stored = localStorage.getItem(STORAGE_KEYS.MATCHES);
    return stored ? JSON.parse(stored) : INITIAL_MATCHES;
  }

  async updateMatch(match: Match): Promise<void> {
    const updatedPayload = {
      scheduled_date: match.scheduled_date,
      scheduled_time: match.scheduled_time,
      venue: match.venue,
      referee: match.referee,
      assistant_referee_1: match.assistant_referee_1,
      assistant_referee_2: match.assistant_referee_2,
      status: match.status,
      home_score: match.home_score,
      away_score: match.away_score,
      updated_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('matches').update(updatedPayload).eq('id', match.id);
      } catch (err) {
        console.warn('Supabase updateMatch error:', err);
      }
    }
    const matches = await this.getMatches();
    const updated = matches.map(m => m.id === match.id ? { ...m, ...updatedPayload } : m);
    localStorage.setItem(STORAGE_KEYS.MATCHES, JSON.stringify(updated));
  }

  // ================= PLAYERS =================
  async getPlayers(): Promise<Player[]> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.from('players').select('*').order('name');
        if (!error && data && data.length > 0) return data as Player[];
      } catch (err) {
        console.warn('Supabase getPlayers error, falling back to local storage:', err);
      }
    }
    this.initLocalStore();
    const stored = localStorage.getItem(STORAGE_KEYS.PLAYERS);
    return stored ? JSON.parse(stored) : INITIAL_PLAYERS;
  }

  async addPlayer(player: Omit<Player, 'id'>): Promise<Player> {
    const newPlayer: Player = {
      ...player,
      id: generateId('player'),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.from('players').insert(newPlayer).select().single();
        if (!error && data) return data as Player;
      } catch (err) {
        console.warn('Supabase addPlayer error:', err);
      }
    }
    const players = await this.getPlayers();
    players.push(newPlayer);
    localStorage.setItem(STORAGE_KEYS.PLAYERS, JSON.stringify(players));
    return newPlayer;
  }

  async updatePlayer(player: Player): Promise<void> {
    const updatedPlayer = {
      ...player,
      updated_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('players').update(updatedPlayer).eq('id', player.id);
      } catch (err) {
        console.warn('Supabase updatePlayer error:', err);
      }
    }
    const players = await this.getPlayers();
    const updated = players.map(p => p.id === player.id ? updatedPlayer : p);
    localStorage.setItem(STORAGE_KEYS.PLAYERS, JSON.stringify(updated));
  }

  async deletePlayer(id: string): Promise<void> {
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('players').delete().eq('id', id);
      } catch (err) {
        console.warn('Supabase deletePlayer error:', err);
      }
    }
    const players = await this.getPlayers();
    const updated = players.filter(p => p.id !== id);
    localStorage.setItem(STORAGE_KEYS.PLAYERS, JSON.stringify(updated));
  }

  // ================= GOALS & ASSISTS & MOTM =================
  async getGoals(): Promise<Goal[]> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.from('goals').select('*');
        if (!error && data) return data as Goal[];
      } catch (err) {
        console.warn('Supabase getGoals error:', err);
      }
    }
    this.initLocalStore();
    const stored = localStorage.getItem(STORAGE_KEYS.GOALS);
    return stored ? JSON.parse(stored) : [];
  }

  async getAssists(): Promise<Assist[]> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.from('assists').select('*');
        if (!error && data) return data as Assist[];
      } catch (err) {
        console.warn('Supabase getAssists error:', err);
      }
    }
    this.initLocalStore();
    const stored = localStorage.getItem(STORAGE_KEYS.ASSISTS);
    return stored ? JSON.parse(stored) : [];
  }

  async getManOfTheMatches(): Promise<ManOfTheMatch[]> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.from('man_of_the_match').select('*');
        if (!error && data) return data as ManOfTheMatch[];
      } catch (err) {
        console.warn('Supabase getManOfTheMatches error:', err);
      }
    }
    this.initLocalStore();
    const stored = localStorage.getItem(STORAGE_KEYS.MOTM);
    return stored ? JSON.parse(stored) : [];
  }

  // ================= SAVE MATCH RESULT & EVENTS =================
  async saveMatchResult(
    matchId: string,
    homeScore: number,
    awayScore: number,
    goals: { player_id: string; team_id: string; minute: number; assist_player_id?: string | null }[],
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
      assist_player_id: g.assist_player_id || null,
      created_at: new Date().toISOString(),
    }));

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('goals').delete().eq('match_id', matchId);
        if (newGoals.length > 0) {
          await supabase.from('goals').insert(newGoals);
        }
      } catch (err) {
        console.warn('Supabase goals sync error:', err);
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
      try {
        await supabase.from('assists').delete().eq('match_id', matchId);
        if (newAssists.length > 0) {
          await supabase.from('assists').insert(newAssists);
        }
      } catch (err) {
        console.warn('Supabase assists sync error:', err);
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
        try {
          await supabase.from('man_of_the_match').delete().eq('match_id', matchId);
          await supabase.from('man_of_the_match').insert(motmItem);
        } catch (err) {
          console.warn('Supabase MOTM sync error:', err);
        }
      }
      const allMotm = (await this.getManOfTheMatches()).filter(m => m.match_id !== matchId);
      allMotm.push(motmItem);
      localStorage.setItem(STORAGE_KEYS.MOTM, JSON.stringify(allMotm));
    }
  }

  // ================= COMMITTEE =================
  async getCommitteeMembers(): Promise<CommitteeMember[]> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.from('committee_members').select('*').order('display_order');
        if (!error && data && data.length > 0) return data as CommitteeMember[];
      } catch (err) {
        console.warn('Supabase getCommitteeMembers error:', err);
      }
    }
    this.initLocalStore();
    const stored = localStorage.getItem(STORAGE_KEYS.COMMITTEE);
    return stored ? JSON.parse(stored) : INITIAL_COMMITTEE;
  }

  async updateCommitteeMember(member: CommitteeMember): Promise<void> {
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('committee_members').update(member).eq('id', member.id);
      } catch (err) {
        console.warn('Supabase updateCommitteeMember error:', err);
      }
    }
    const members = await this.getCommitteeMembers();
    const updated = members.map(m => m.id === member.id ? member : m);
    localStorage.setItem(STORAGE_KEYS.COMMITTEE, JSON.stringify(updated));
  }

  // ================= POTM POLLS =================
  async getPolls(): Promise<POTMPoll[]> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.from('potm_polls').select('*').order('created_at', { ascending: false });
        if (!error && data) return data as POTMPoll[];
      } catch (err) {
        console.warn('Supabase getPolls error:', err);
      }
    }
    this.initLocalStore();
    const stored = localStorage.getItem(STORAGE_KEYS.POLLS);
    return stored ? JSON.parse(stored) : [];
  }

  async getPollByMatchId(matchId: string): Promise<POTMPoll | null> {
    const polls = await this.getPolls();
    return polls.find(p => p.match_id === matchId) || null;
  }

  async createPoll(matchId: string, title: string, candidatePlayerIds: string[]): Promise<POTMPoll> {
    const pollId = generateId('poll');
    const newPoll: POTMPoll = {
      id: pollId,
      match_id: matchId,
      title,
      status: 'active',
      opened_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
    };

    const newCandidates: POTMCandidate[] = candidatePlayerIds.map(playerId => ({
      id: generateId('candidate'),
      poll_id: pollId,
      player_id: playerId,
    }));

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('potm_polls').insert(newPoll);
        if (newCandidates.length > 0) {
          await supabase.from('potm_candidates').insert(newCandidates);
        }
      } catch (err) {
        console.warn('Supabase createPoll error:', err);
      }
    }

    const polls = await this.getPolls();
    polls.unshift(newPoll);
    localStorage.setItem(STORAGE_KEYS.POLLS, JSON.stringify(polls));

    const candidates = await this.getCandidates(pollId);
    const storedCandidates = localStorage.getItem(STORAGE_KEYS.CANDIDATES);
    const allCandidates: POTMCandidate[] = storedCandidates ? JSON.parse(storedCandidates) : [];
    allCandidates.push(...newCandidates);
    localStorage.setItem(STORAGE_KEYS.CANDIDATES, JSON.stringify(allCandidates));

    return newPoll;
  }

  async closePoll(pollId: string): Promise<void> {
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('potm_polls').update({
          status: 'closed',
          closed_at: new Date().toISOString(),
        }).eq('id', pollId);
      } catch (err) {
        console.warn('Supabase closePoll error:', err);
      }
    }
    const polls = await this.getPolls();
    const updated = polls.map(p => p.id === pollId ? { ...p, status: 'closed' as const, closed_at: new Date().toISOString() } : p);
    localStorage.setItem(STORAGE_KEYS.POLLS, JSON.stringify(updated));
  }

  async getCandidates(pollId: string): Promise<POTMCandidate[]> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.from('potm_candidates').select('*').eq('poll_id', pollId);
        if (!error && data) return data as POTMCandidate[];
      } catch (err) {
        console.warn('Supabase getCandidates error:', err);
      }
    }
    this.initLocalStore();
    const stored = localStorage.getItem(STORAGE_KEYS.CANDIDATES);
    const all: POTMCandidate[] = stored ? JSON.parse(stored) : [];
    return all.filter(c => c.poll_id === pollId);
  }

  async getVotes(pollId: string): Promise<POTMVote[]> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.from('potm_votes').select('*').eq('poll_id', pollId);
        if (!error && data) return data as POTMVote[];
      } catch (err) {
        console.warn('Supabase getVotes error:', err);
      }
    }
    this.initLocalStore();
    const stored = localStorage.getItem(STORAGE_KEYS.VOTES);
    const all: POTMVote[] = stored ? JSON.parse(stored) : [];
    return all.filter(v => v.poll_id === pollId);
  }

  async submitVote(pollId: string, candidateId: string, userId: string): Promise<{ success: boolean; error?: string }> {
    if (!pollId || !candidateId || !userId) {
      return { success: false, error: 'Poll, candidate, and user identity are required.' };
    }

    if (isSupabaseConfigured && supabase) {
      try {
        const { error } = await supabase.from('potm_votes').insert({
          id: generateId('vote'),
          poll_id: pollId,
          candidate_id: candidateId,
          user_id: userId,
          created_at: new Date().toISOString(),
        });
        if (error) {
          if (error.code === '23505' || error.message.includes('unique')) {
            return { success: false, error: 'You have already voted in this poll.' };
          }
          return { success: false, error: error.message };
        }
      } catch (err: any) {
        console.warn('Supabase submitVote error:', err);
        return { success: false, error: err.message || 'Voting failed.' };
      }
    }

    // Local Storage Fallback
    const storedVotes = localStorage.getItem(STORAGE_KEYS.VOTES);
    const allVotes: POTMVote[] = storedVotes ? JSON.parse(storedVotes) : [];
    const alreadyVoted = allVotes.some(v => v.poll_id === pollId && v.user_id === userId);
    if (alreadyVoted) {
      return { success: false, error: 'You have already voted in this poll.' };
    }

    allVotes.push({
      id: generateId('vote'),
      poll_id: pollId,
      candidate_id: candidateId,
      user_id: userId,
      created_at: new Date().toISOString(),
    });
    localStorage.setItem(STORAGE_KEYS.VOTES, JSON.stringify(allVotes));

    return { success: true };
  }

  // Restore pure official tournament state
  resetToOfficialFixtures(): void {
    localStorage.setItem(STORAGE_KEYS.TEAMS, JSON.stringify(INITIAL_TEAMS));
    localStorage.setItem(STORAGE_KEYS.MATCHES, JSON.stringify(INITIAL_MATCHES));
    localStorage.setItem(STORAGE_KEYS.PLAYERS, JSON.stringify(INITIAL_PLAYERS));
    localStorage.setItem(STORAGE_KEYS.GOALS, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.ASSISTS, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.MOTM, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.COMMITTEE, JSON.stringify(INITIAL_COMMITTEE));
    localStorage.setItem(STORAGE_KEYS.POLLS, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.CANDIDATES, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.VOTES, JSON.stringify([]));
  }
}

export const tournamentService = new TournamentService();
