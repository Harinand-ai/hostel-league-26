import { supabase, isSupabaseConfigured, getOrCreateAnonymousVoterId } from '../lib/supabase';
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
  INITIAL_GOALS,
  INITIAL_MOTM,
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

    // Matches initialization: ensure historical Match 1 and Match 2 are preserved
    const storedMatches = localStorage.getItem(STORAGE_KEYS.MATCHES);
    if (!storedMatches) {
      localStorage.setItem(STORAGE_KEYS.MATCHES, JSON.stringify(INITIAL_MATCHES));
    } else {
      try {
        const parsed: Match[] = JSON.parse(storedMatches);
        // Ensure Match 1 and Match 2 have their finalized historical result
        let updated = false;
        const mapped = parsed.map(m => {
          if (m.id === 'match-01' && m.status !== 'COMPLETED') {
            updated = true;
            return { ...m, status: 'COMPLETED' as const, home_score: 1, away_score: 1 };
          }
          if (m.id === 'match-02' && m.status !== 'COMPLETED') {
            updated = true;
            return { ...m, status: 'COMPLETED' as const, home_score: 2, away_score: 0 };
          }
          return m;
        });
        if (updated) {
          localStorage.setItem(STORAGE_KEYS.MATCHES, JSON.stringify(mapped));
        }
      } catch (e) {
        localStorage.setItem(STORAGE_KEYS.MATCHES, JSON.stringify(INITIAL_MATCHES));
      }
    }

    // Players initialization
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

    // Goals: ensure Match 1 & Match 2 historical goals are present
    const storedGoals = localStorage.getItem(STORAGE_KEYS.GOALS);
    if (!storedGoals || JSON.parse(storedGoals).length === 0) {
      localStorage.setItem(STORAGE_KEYS.GOALS, JSON.stringify(INITIAL_GOALS));
    } else {
      try {
        const parsed: Goal[] = JSON.parse(storedGoals);
        const hasM1Goal = parsed.some(g => g.match_id === 'match-01');
        const hasM2Goal = parsed.some(g => g.match_id === 'match-02');
        if (!hasM1Goal || !hasM2Goal) {
          const merged = [...parsed];
          if (!hasM1Goal) merged.push(...INITIAL_GOALS.filter(g => g.match_id === 'match-01'));
          if (!hasM2Goal) merged.push(...INITIAL_GOALS.filter(g => g.match_id === 'match-02'));
          localStorage.setItem(STORAGE_KEYS.GOALS, JSON.stringify(merged));
        }
      } catch (e) {
        localStorage.setItem(STORAGE_KEYS.GOALS, JSON.stringify(INITIAL_GOALS));
      }
    }

    // MOTM: ensure Match 1 & Match 2 historical MOTMs are present
    const storedMotm = localStorage.getItem(STORAGE_KEYS.MOTM);
    if (!storedMotm || JSON.parse(storedMotm).length === 0) {
      localStorage.setItem(STORAGE_KEYS.MOTM, JSON.stringify(INITIAL_MOTM));
    } else {
      try {
        const parsed: ManOfTheMatch[] = JSON.parse(storedMotm);
        const hasM1Motm = parsed.some(m => m.match_id === 'match-01');
        const hasM2Motm = parsed.some(m => m.match_id === 'match-02');
        if (!hasM1Motm || !hasM2Motm) {
          const merged = [...parsed];
          if (!hasM1Motm) merged.push(...INITIAL_MOTM.filter(m => m.match_id === 'match-01'));
          if (!hasM2Motm) merged.push(...INITIAL_MOTM.filter(m => m.match_id === 'match-02'));
          localStorage.setItem(STORAGE_KEYS.MOTM, JSON.stringify(merged));
        }
      } catch (e) {
        localStorage.setItem(STORAGE_KEYS.MOTM, JSON.stringify(INITIAL_MOTM));
      }
    }

    if (!localStorage.getItem(STORAGE_KEYS.ASSISTS)) {
      localStorage.setItem(STORAGE_KEYS.ASSISTS, JSON.stringify([]));
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
    const updated = teams.map(t => (t.id === teamId ? { ...t, manager_name: managerName } : t));
    localStorage.setItem(STORAGE_KEYS.TEAMS, JSON.stringify(updated));
  }

  // ================= MATCHES =================
  async getMatches(): Promise<Match[]> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.from('matches').select('*').order('match_number');
        if (!error && data && data.length > 0) {
          // Guard historical Match 1 and Match 2 results
          const safeData = (data as Match[]).map(m => {
            if (m.id === 'match-01' && m.status !== 'COMPLETED') {
              return { ...m, status: 'COMPLETED' as const, home_score: 1, away_score: 1 };
            }
            if (m.id === 'match-02' && m.status !== 'COMPLETED') {
              return { ...m, status: 'COMPLETED' as const, home_score: 2, away_score: 0 };
            }
            return m;
          });
          return safeData;
        }
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
    const updated = matches.map(m => (m.id === match.id ? { ...m, ...updatedPayload } : m));
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
    const updated = players.map(p => (p.id === player.id ? updatedPlayer : p));
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

  // ================= GOALS & MOTM =================
  async getGoals(): Promise<Goal[]> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.from('goals').select('*');
        if (!error && data && data.length > 0) {
          // Ensure historical goals for Match 1 and Match 2 are never lost
          const list = [...(data as Goal[])];
          INITIAL_GOALS.forEach(ig => {
            if (!list.some(g => g.id === ig.id || (g.match_id === ig.match_id && g.player_id === ig.player_id))) {
              list.push(ig);
            }
          });
          return list;
        }
      } catch (err) {
        console.warn('Supabase getGoals error, falling back to local storage:', err);
      }
    }
    this.initLocalStore();
    const stored = localStorage.getItem(STORAGE_KEYS.GOALS);
    return stored ? JSON.parse(stored) : INITIAL_GOALS;
  }

  async getAssists(): Promise<Assist[]> {
    return []; // Assists removed from active product
  }

  async getManOfTheMatches(): Promise<ManOfTheMatch[]> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.from('man_of_the_match').select('*');
        if (!error && data && data.length > 0) {
          const list = [...(data as ManOfTheMatch[])];
          INITIAL_MOTM.forEach(im => {
            if (!list.some(m => m.match_id === im.match_id)) {
              list.push(im);
            }
          });
          return list;
        }
      } catch (err) {
        console.warn('Supabase getManOfTheMatches error:', err);
      }
    }
    this.initLocalStore();
    const stored = localStorage.getItem(STORAGE_KEYS.MOTM);
    return stored ? JSON.parse(stored) : INITIAL_MOTM;
  }

  // ================= SAVE MATCH EDIT (SIMPLIFIED ADMIN WORKFLOW) =================
  async saveSimplifiedMatch(
    matchId: string,
    status: Match['status'],
    fixtureDetails: {
      scheduled_date: string | null;
      scheduled_time: string | null;
      venue: string | null;
      referee: string | null;
      assistant_referee_1: string | null;
      assistant_referee_2: string | null;
    },
    homeScore: number | null,
    awayScore: number | null,
    goals: { player_id: string; team_id: string }[],
    motmPlayerId?: string
  ): Promise<void> {
    const matches = await this.getMatches();
    const targetMatch = matches.find(m => m.id === matchId);
    if (!targetMatch) return;

    targetMatch.status = status;
    targetMatch.scheduled_date = fixtureDetails.scheduled_date;
    targetMatch.scheduled_time = fixtureDetails.scheduled_time;
    targetMatch.venue = fixtureDetails.venue;
    targetMatch.referee = fixtureDetails.referee;
    targetMatch.assistant_referee_1 = fixtureDetails.assistant_referee_1;
    targetMatch.assistant_referee_2 = fixtureDetails.assistant_referee_2;
    targetMatch.home_score = status === 'COMPLETED' ? (homeScore ?? goals.filter(g => g.team_id === targetMatch.home_team_id).length) : homeScore;
    targetMatch.away_score = status === 'COMPLETED' ? (awayScore ?? goals.filter(g => g.team_id === targetMatch.away_team_id).length) : awayScore;
    targetMatch.updated_at = new Date().toISOString();

    await this.updateMatch(targetMatch);

    // Prepare goals
    const newGoals: Goal[] = goals.map(g => ({
      id: generateId('goal'),
      match_id: matchId,
      player_id: g.player_id,
      team_id: g.team_id,
      minute: 0,
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

    // Prepare MOTM
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

  // Legacy helper signature kept for backwards compatibility
  async saveMatchResult(
    matchId: string,
    homeScore: number,
    awayScore: number,
    goals: { player_id: string; team_id: string; minute: number; assist_player_id?: string | null }[],
    _assists: { player_id: string; team_id: string; minute?: number }[],
    motmPlayerId?: string
  ): Promise<void> {
    const matches = await this.getMatches();
    const targetMatch = matches.find(m => m.id === matchId);
    if (!targetMatch) return;

    await this.saveSimplifiedMatch(
      matchId,
      'COMPLETED',
      {
        scheduled_date: targetMatch.scheduled_date,
        scheduled_time: targetMatch.scheduled_time,
        venue: targetMatch.venue,
        referee: targetMatch.referee,
        assistant_referee_1: targetMatch.assistant_referee_1,
        assistant_referee_2: targetMatch.assistant_referee_2,
      },
      homeScore,
      awayScore,
      goals.map(g => ({ player_id: g.player_id, team_id: g.team_id })),
      motmPlayerId
    );
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
    const updated = members.map(m => (m.id === member.id ? member : m));
    localStorage.setItem(STORAGE_KEYS.COMMITTEE, JSON.stringify(updated));
  }

  // ================= POTM POLLS & FAST ANONYMOUS VOTING =================
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
    const updated = polls.map(p => (p.id === pollId ? { ...p, status: 'closed' as const, closed_at: new Date().toISOString() } : p));
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

  // Fast, frictionless anonymous public voting: NO email, NO password, NO OTP
  async submitVote(pollId: string, candidateId: string, customUserId?: string): Promise<{ success: boolean; error?: string }> {
    if (!pollId || !candidateId) {
      return { success: false, error: 'Poll and candidate selection are required.' };
    }

    const voterId = customUserId || getOrCreateAnonymousVoterId();

    // Check local storage duplicate prevention first
    const storedVotes = localStorage.getItem(STORAGE_KEYS.VOTES);
    const allVotes: POTMVote[] = storedVotes ? JSON.parse(storedVotes) : [];
    const alreadyVotedLocally = allVotes.some(v => v.poll_id === pollId && v.user_id === voterId);
    if (alreadyVotedLocally) {
      return { success: false, error: 'You have already voted in this poll.' };
    }

    const newVote: POTMVote = {
      id: generateId('vote'),
      poll_id: pollId,
      candidate_id: candidateId,
      user_id: voterId,
      created_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured && supabase) {
      try {
        // Try to get existing auth user or attempt anonymous sign in
        let effectiveUserId = voterId;
        const { data: sessionData } = await supabase.auth.getSession();
        if (sessionData?.session?.user) {
          effectiveUserId = sessionData.session.user.id;
        } else {
          try {
            const { data: anonData } = await supabase.auth.signInAnonymously();
            if (anonData?.user) {
              effectiveUserId = anonData.user.id;
            }
          } catch {
            // Anonymous sign-in not enabled in remote Supabase dashboard; proceed with voterId
          }
        }

        const { error } = await supabase.from('potm_votes').insert({
          id: newVote.id,
          poll_id: pollId,
          candidate_id: candidateId,
          user_id: effectiveUserId,
          created_at: newVote.created_at,
        });

        if (error) {
          if (error.code === '23505' || error.message.includes('unique')) {
            return { success: false, error: 'You have already voted in this poll.' };
          }
          console.warn('Supabase vote insert notice (storing vote locally):', error.message);
        }
      } catch (err: any) {
        console.warn('Supabase vote notice (storing locally):', err);
      }
    }

    // Always record locally so vote is never lost
    allVotes.push(newVote);
    localStorage.setItem(STORAGE_KEYS.VOTES, JSON.stringify(allVotes));

    return { success: true };
  }

  // Restore pure official tournament state
  resetToOfficialFixtures(): void {
    localStorage.setItem(STORAGE_KEYS.TEAMS, JSON.stringify(INITIAL_TEAMS));
    localStorage.setItem(STORAGE_KEYS.MATCHES, JSON.stringify(INITIAL_MATCHES));
    localStorage.setItem(STORAGE_KEYS.PLAYERS, JSON.stringify(INITIAL_PLAYERS));
    localStorage.setItem(STORAGE_KEYS.GOALS, JSON.stringify(INITIAL_GOALS));
    localStorage.setItem(STORAGE_KEYS.ASSISTS, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.MOTM, JSON.stringify(INITIAL_MOTM));
    localStorage.setItem(STORAGE_KEYS.COMMITTEE, JSON.stringify(INITIAL_COMMITTEE));
    localStorage.setItem(STORAGE_KEYS.POLLS, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.CANDIDATES, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.VOTES, JSON.stringify([]));
  }
}

export const tournamentService = new TournamentService();
