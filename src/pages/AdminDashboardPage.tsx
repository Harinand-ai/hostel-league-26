import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Team,
  Match,
  Player,
  Goal,
  Assist,
  ManOfTheMatch,
  TeamStanding,
  PlayerStatEntry,
  Position,
  MatchStatus,
  POTMPoll,
  POTMCandidate,
  POTMVote,
  CommitteeMember,
} from '../types/tournament';
import { tournamentService } from '../services/tournamentService';
import { TeamBadge } from '../components/TeamBadge';
import { PlayerAvatar } from '../components/PlayerAvatar';
import { 
  Shield, 
  Calendar, 
  Trophy, 
  Users, 
  Flame, 
  Plus, 
  Edit3, 
  Trash2, 
  X, 
  RotateCcw, 
  LogOut, 
  CheckCircle2, 
  Award,
  Sparkles,
  Vote,
  AlertTriangle,
  Phone,
  UserCheck,
  Check,
  Lock,
  Unlock
} from 'lucide-react';

interface AdminDashboardPageProps {
  teams: Team[];
  matches: Match[];
  players: Player[];
  goals: Goal[];
  assists: Assist[];
  motms: ManOfTheMatch[];
  standings: TeamStanding[];
  topScorers: PlayerStatEntry[];
  onDataChanged: () => void;
  onLogout: () => void;
  onNavigateHome: () => void;
}

export const AdminDashboardPage: React.FC<AdminDashboardPageProps> = ({
  teams,
  matches,
  players,
  goals,
  assists,
  motms,
  standings,
  topScorers,
  onDataChanged,
  onLogout,
  onNavigateHome,
}) => {
  const [activeTab, setActiveTab] = useState<
    'overview' | 'fixtures' | 'results' | 'players' | 'potm' | 'committee' | 'managers' | 'validation'
  >('overview');
  
  // Fixture Edit State
  const [editingFixture, setEditingFixture] = useState<Match | null>(null);

  // Result Entry State
  const [selectedMatchForResult, setSelectedMatchForResult] = useState<Match | null>(null);
  const [homeScoreInput, setHomeScoreInput] = useState<number>(0);
  const [awayScoreInput, setAwayScoreInput] = useState<number>(0);
  const [resultGoals, setResultGoals] = useState<{ player_id: string; team_id: string; minute: number; assist_player_id?: string | null }[]>([]);
  const [resultAssists, setResultAssists] = useState<{ player_id: string; team_id: string; minute?: number }[]>([]);
  const [selectedMotmPlayerId, setSelectedMotmPlayerId] = useState<string>('');

  // Result Saved Success Banner Modal State
  const [savedResultFeedback, setSavedResultFeedback] = useState<{
    homeName: string;
    awayName: string;
    homeScore: number;
    awayScore: number;
  } | null>(null);

  // Player Add/Edit State
  const [playerModalOpen, setPlayerModalOpen] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null);
  const [playerName, setPlayerName] = useState('');
  const [playerTeamId, setPlayerTeamId] = useState(teams[0]?.id || '');
  const [playerPosition, setPlayerPosition] = useState<Position>('MID');
  const [playerIsCaptain, setPlayerIsCaptain] = useState<boolean>(false);
  const [playerPhotoUrl, setPlayerPhotoUrl] = useState<string>('');
  const [playerFilterTeam, setPlayerFilterTeam] = useState<string>('all');

  // Manager Edit State
  const [editingManagerTeamId, setEditingManagerTeamId] = useState<string | null>(null);
  const [managerNameInput, setManagerNameInput] = useState('');

  // Committee State
  const [committee, setCommittee] = useState<CommitteeMember[]>([]);
  const [editingCommitteeMember, setEditingCommitteeMember] = useState<CommitteeMember | null>(null);

  // POTM Poll State
  const [polls, setPolls] = useState<POTMPoll[]>([]);
  const [pollCandidatesMap, setPollCandidatesMap] = useState<Map<string, POTMCandidate[]>>(new Map());
  const [pollVotesMap, setPollVotesMap] = useState<Map<string, POTMVote[]>>(new Map());
  const [createPollModalOpen, setCreatePollModalOpen] = useState(false);
  const [newPollMatchId, setNewPollMatchId] = useState<string>(matches[0]?.id || '');
  const [newPollTitle, setNewPollTitle] = useState<string>('Player of the Match');
  const [selectedCandidateIds, setSelectedCandidateIds] = useState<string[]>([]);

  // Toast feedback
  const [feedbackToast, setFeedbackToast] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setFeedbackToast({ text, type });
    setTimeout(() => setFeedbackToast(null), 3500);
  };

  const teamsMap = new Map(teams.map(t => [t.id, t]));
  const playersMap = new Map(players.map(p => [p.id, p]));
  const completedMatches = matches.filter(m => m.status === 'COMPLETED');
  const upcomingMatches = matches.filter(m => m.status === 'UPCOMING' || m.status === 'LIVE');
  const totalGoalsCount = goals.length;
  const leaderTeam = standings[0];
  const topGoalscorer = topScorers[0];

  // Load committee and polls
  const loadExtraData = useCallback(async () => {
    try {
      const [commData, pollsData] = await Promise.all([
        tournamentService.getCommitteeMembers(),
        tournamentService.getPolls(),
      ]);
      setCommittee(commData);
      setPolls(pollsData);

      // Load candidates & votes for each poll
      const candMap = new Map<string, POTMCandidate[]>();
      const voteMap = new Map<string, POTMVote[]>();
      for (const p of pollsData) {
        const [cList, vList] = await Promise.all([
          tournamentService.getCandidates(p.id),
          tournamentService.getVotes(p.id),
        ]);
        candMap.set(p.id, cList);
        voteMap.set(p.id, vList);
      }
      setPollCandidatesMap(candMap);
      setPollVotesMap(voteMap);
    } catch (err) {
      console.error('Error loading extra admin data:', err);
    }
  }, []);

  useEffect(() => {
    loadExtraData();
  }, [loadExtraData]);

  // FIXTURE HANDLERS
  const handleSaveFixture = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingFixture) return;
    try {
      await tournamentService.updateMatch(editingFixture);
      setEditingFixture(null);
      onDataChanged();
      showToast(`Match #${editingFixture.match_number} schedule & officials updated.`);
    } catch {
      showToast('Failed to update fixture.', 'error');
    }
  };

  // RESULT ENTRY HANDLERS
  const handleOpenResultEntry = (match: Match) => {
    setSelectedMatchForResult(match);
    setHomeScoreInput(match.home_score ?? 0);
    setAwayScoreInput(match.away_score ?? 0);

    const existingGoals = goals
      .filter(g => g.match_id === match.id)
      .map(g => ({
        player_id: g.player_id,
        team_id: g.team_id,
        minute: g.minute,
        assist_player_id: g.assist_player_id || null,
      }));
    setResultGoals(existingGoals);

    const existingAssists = assists
      .filter(a => a.match_id === match.id)
      .map(a => ({ player_id: a.player_id, team_id: a.team_id, minute: a.minute }));
    setResultAssists(existingAssists);

    const existingMotm = motms.find(m => m.match_id === match.id);
    setSelectedMotmPlayerId(existingMotm ? existingMotm.player_id : '');
  };

  const handleAddGoal = () => {
    if (!selectedMatchForResult) return;
    const availablePlayers = players.filter(
      p => p.team_id === selectedMatchForResult.home_team_id || p.team_id === selectedMatchForResult.away_team_id
    );
    const defaultPlayer = availablePlayers[0];
    if (!defaultPlayer) {
      showToast('Please add registered players to the teams in the Players tab first.', 'error');
      return;
    }
    setResultGoals([
      ...resultGoals,
      {
        player_id: defaultPlayer.id,
        team_id: defaultPlayer.team_id,
        minute: 10,
        assist_player_id: null,
      },
    ]);
  };

  const handleRemoveGoal = (index: number) => {
    setResultGoals(resultGoals.filter((_, i) => i !== index));
  };

  const handleAddAssist = () => {
    if (!selectedMatchForResult) return;
    const availablePlayers = players.filter(
      p => p.team_id === selectedMatchForResult.home_team_id || p.team_id === selectedMatchForResult.away_team_id
    );
    const defaultPlayer = availablePlayers[0];
    if (!defaultPlayer) {
      showToast('Please add players to teams first.', 'error');
      return;
    }
    setResultAssists([
      ...resultAssists,
      {
        player_id: defaultPlayer.id,
        team_id: defaultPlayer.team_id,
        minute: 10,
      },
    ]);
  };

  const handleRemoveAssist = (index: number) => {
    setResultAssists(resultAssists.filter((_, i) => i !== index));
  };

  const handleSaveResult = async () => {
    if (!selectedMatchForResult) return;
    try {
      const hTeam = teamsMap.get(selectedMatchForResult.home_team_id);
      const aTeam = teamsMap.get(selectedMatchForResult.away_team_id);

      await tournamentService.saveMatchResult(
        selectedMatchForResult.id,
        homeScoreInput,
        awayScoreInput,
        resultGoals,
        resultAssists,
        selectedMotmPlayerId || undefined
      );

      setSavedResultFeedback({
        homeName: hTeam?.name || 'Home',
        awayName: aTeam?.name || 'Away',
        homeScore: homeScoreInput,
        awayScore: awayScoreInput,
      });

      setSelectedMatchForResult(null);
      onDataChanged();
    } catch {
      showToast('Failed to save match result.', 'error');
    }
  };

  // PLAYER HANDLERS
  const handleOpenAddPlayer = () => {
    setEditingPlayer(null);
    setPlayerName('');
    setPlayerTeamId(teams[0]?.id || '');
    setPlayerPosition('MID');
    setPlayerIsCaptain(false);
    setPlayerPhotoUrl('');
    setPlayerModalOpen(true);
  };

  const handleOpenEditPlayer = (p: Player) => {
    setEditingPlayer(p);
    setPlayerName(p.name);
    setPlayerTeamId(p.team_id);
    setPlayerPosition(p.position);
    setPlayerIsCaptain(Boolean(p.is_captain));
    setPlayerPhotoUrl(p.photo_url || '');
    setPlayerModalOpen(true);
  };

  const handleSavePlayer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!playerName.trim()) return;

    try {
      // If setting this player as captain, clear captain status from other players in the team
      if (playerIsCaptain) {
        const otherCaptains = players.filter(
          p => p.team_id === playerTeamId && p.is_captain && p.id !== editingPlayer?.id
        );
        for (const oc of otherCaptains) {
          await tournamentService.updatePlayer({ ...oc, is_captain: false });
        }
      }

      if (editingPlayer) {
        await tournamentService.updatePlayer({
          ...editingPlayer,
          name: playerName.trim(),
          team_id: playerTeamId,
          position: playerPosition,
          is_captain: playerIsCaptain,
          photo_url: playerPhotoUrl.trim() || undefined,
        });
        showToast(`Player ${playerName} updated.`);
      } else {
        await tournamentService.addPlayer({
          name: playerName.trim(),
          team_id: playerTeamId,
          position: playerPosition,
          is_captain: playerIsCaptain,
          photo_url: playerPhotoUrl.trim() || undefined,
        });
        showToast(`Player ${playerName} registered.`);
      }
      setPlayerModalOpen(false);
      onDataChanged();
    } catch {
      showToast('Failed to save player.', 'error');
    }
  };

  const handleDeletePlayer = async (id: string, name: string) => {
    if (confirm(`Remove ${name} from the official tournament roster?`)) {
      try {
        await tournamentService.deletePlayer(id);
        onDataChanged();
        showToast(`Player ${name} removed.`);
      } catch {
        showToast('Failed to delete player.', 'error');
      }
    }
  };

  // MANAGER HANDLERS
  const handleSaveManager = async (teamId: string) => {
    if (!managerNameInput.trim()) return;
    try {
      await tournamentService.updateTeamManager(teamId, managerNameInput.trim());
      setEditingManagerTeamId(null);
      onDataChanged();
      showToast('Team manager updated.');
    } catch {
      showToast('Failed to update manager.', 'error');
    }
  };

  // COMMITTEE HANDLERS
  const handleSaveCommitteeMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCommitteeMember) return;
    try {
      await tournamentService.updateCommitteeMember(editingCommitteeMember);
      setEditingCommitteeMember(null);
      await loadExtraData();
      showToast('Committee coordinator details saved.');
    } catch {
      showToast('Failed to update committee member.', 'error');
    }
  };

  // POTM POLL HANDLERS
  const handleOpenCreatePoll = () => {
    setNewPollMatchId(matches[0]?.id || '');
    setNewPollTitle('Player of the Match');
    setSelectedCandidateIds([]);
    setCreatePollModalOpen(true);
  };

  const handleToggleCandidate = (playerId: string) => {
    if (selectedCandidateIds.includes(playerId)) {
      setSelectedCandidateIds(selectedCandidateIds.filter(id => id !== playerId));
    } else {
      if (selectedCandidateIds.length >= 4) {
        showToast('Maximum 4 candidates allowed per poll.', 'error');
        return;
      }
      setSelectedCandidateIds([...selectedCandidateIds, playerId]);
    }
  };

  const handleCreatePollSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedCandidateIds.length < 2) {
      showToast('Please select at least 2 candidates for the poll.', 'error');
      return;
    }

    try {
      await tournamentService.createPoll(newPollMatchId, newPollTitle.trim(), selectedCandidateIds);
      setCreatePollModalOpen(false);
      await loadExtraData();
      showToast('Player of the Match poll published!');
    } catch {
      showToast('Failed to create poll.', 'error');
    }
  };

  const handleClosePoll = async (pollId: string) => {
    try {
      await tournamentService.closePoll(pollId);
      await loadExtraData();
      showToast('Poll closed. Final results locked.');
    } catch {
      showToast('Failed to close poll.', 'error');
    }
  };

  // RESET
  const handleResetTournament = () => {
    if (confirm('CAUTION: Reset all scores, goals, and results back to pure initial official fixtures?')) {
      tournamentService.resetToOfficialFixtures();
      onDataChanged();
      loadExtraData();
      showToast('Tournament reset to pure official fixtures.');
    }
  };

  // DATA VALIDATION WARNINGS CALCULATION
  const validationWarnings: { type: 'danger' | 'warning' | 'info'; title: string; desc: string }[] = [];

  // Check 1: Duplicate player names
  const nameOccurrences = new Map<string, Player[]>();
  players.forEach(p => {
    const key = p.name.trim().toLowerCase();
    const list = nameOccurrences.get(key) || [];
    list.push(p);
    nameOccurrences.set(key, list);
  });
  nameOccurrences.forEach((list, key) => {
    if (list.length > 1) {
      const teamNames = list.map(p => teamsMap.get(p.team_id)?.name || p.team_id).join(', ');
      validationWarnings.push({
        type: 'warning',
        title: `Duplicate Player Name: "${list[0].name}"`,
        desc: `Found ${list.length} roster entries with this name across: ${teamNames}. Note: Brighton intentionally has two entries named Adwaith (GK & outfield) pending full names.`,
      });
    }
  });

  // Check 2: Players with Position TBD
  const tbdPlayers = players.filter(p => p.position === 'TBD');
  if (tbdPlayers.length > 0) {
    validationWarnings.push({
      type: 'info',
      title: `${tbdPlayers.length} Player(s) with Position: TBD`,
      desc: `The following confirmed roster players have unverified positions: ${tbdPlayers.map(p => `${p.name} (${teamsMap.get(p.team_id)?.name})`).join(', ')}. Please update positions once confirmed.`,
    });
  }

  // Check 3: Captain status per team
  teams.forEach(t => {
    const teamCaptains = players.filter(p => p.team_id === t.id && p.is_captain);
    if (teamCaptains.length === 0) {
      validationWarnings.push({
        type: 'warning',
        title: `Missing Captain: ${t.name}`,
        desc: `Club ${t.name} currently has no player designated as official Captain.`,
      });
    } else if (teamCaptains.length > 1) {
      validationWarnings.push({
        type: 'danger',
        title: `Multiple Captains: ${t.name}`,
        desc: `Club ${t.name} has ${teamCaptains.length} captains assigned (${teamCaptains.map(p => p.name).join(', ')}). A team should have exactly one captain.`,
      });
    }
  });

  // Check 4: Unmatched position entries from prompt Section 6
  const unmatchedCandidates = [
    { name: 'Niranjan N', originalPos: 'CB' },
    { name: 'Sojin', originalPos: 'MID' },
    { name: 'Aadil Dhath P.K.', originalPos: 'CF' },
    { name: 'Amal Jyothi', originalPos: 'CF (Note: Amal Jyothi is Nottingham Forest Manager)' },
  ];
  validationWarnings.push({
    type: 'info',
    title: 'Unmatched Source Position Data Candidates',
    desc: `The original position list included candidates not directly in the 54-player team rosters: ${unmatchedCandidates.map(c => `${c.name} (${c.originalPos})`).join('; ')}. If any of these replace or clarify existing players, use the Edit Player form.`,
  });

  const filteredPlayers = playerFilterTeam === 'all'
    ? players
    : players.filter(p => p.team_id === playerFilterTeam);

  return (
    <div className="space-y-8 pb-16">
      
      {/* Top Admin Navigation Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-stadium-800">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-gold-500/20 border border-gold-500/40 flex items-center justify-center text-gold-400 shadow-inner">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black font-display uppercase tracking-tight text-white">
                ADMIN CONSOLE
              </h1>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/20 text-gold-400 border border-gold-500/30">
                OFFICIAL MANAGEMENT
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono">Hostel League 26 • Verified Competition Administration</p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 font-mono">
          <button
            onClick={onNavigateHome}
            className="px-3.5 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider text-slate-300 hover:text-white bg-stadium-900 hover:bg-stadium-850 border border-stadium-750 transition-colors"
          >
            Public Site
          </button>
          <button
            onClick={onLogout}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider text-rose-400 hover:text-white hover:bg-rose-500/20 border border-rose-500/30 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            Sign Out
          </button>
        </div>
      </div>

      {/* Toast Feedback */}
      {feedbackToast && (
        <div className={`p-4 rounded-xl text-xs font-bold font-mono flex items-center gap-2.5 transition-all shadow-lg ${
          feedbackToast.type === 'success'
            ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-300'
            : 'bg-rose-500/20 border border-rose-500/40 text-rose-300'
        }`}>
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{feedbackToast.text}</span>
        </div>
      )}

      {/* SECTION 22: POLISHED RESULT SAVED SUCCESS MODAL */}
      <AnimatePresence>
        {savedResultFeedback && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 350, damping: 25 }}
              className="w-full max-w-md p-8 rounded-3xl bg-[#090d16] border border-emerald-500/50 shadow-2xl text-center space-y-6"
            >
              <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 mx-auto flex items-center justify-center text-emerald-400">
                <Sparkles className="w-8 h-8" />
              </div>

              <div>
                <span className="text-[11px] font-mono font-bold tracking-[0.3em] uppercase text-emerald-400 block mb-1">
                  OFFICIAL VERIFICATION
                </span>
                <h3 className="text-2xl font-black font-display uppercase tracking-tight text-white">
                  RESULT SAVED
                </h3>
              </div>

              {/* Match Score Display */}
              <div className="p-4 rounded-2xl bg-stadium-950 border border-stadium-750 font-display font-black text-xl text-white">
                <span className="text-gold-400">{savedResultFeedback.homeName}</span>{' '}
                <span className="text-2xl px-2 text-white font-mono">{savedResultFeedback.homeScore} — {savedResultFeedback.awayScore}</span>{' '}
                <span className="text-gold-400">{savedResultFeedback.awayName}</span>
              </div>

              <div className="grid grid-cols-3 gap-2 text-[10px] font-mono font-bold text-slate-300 uppercase">
                <div className="p-2 rounded-lg bg-stadium-900 border border-stadium-800">
                  TABLE UPDATED
                </div>
                <div className="p-2 rounded-lg bg-stadium-900 border border-stadium-800">
                  STATS UPDATED
                </div>
                <div className="p-2 rounded-lg bg-stadium-900 border border-stadium-800">
                  RESULT SAVED
                </div>
              </div>

              <button
                onClick={() => setSavedResultFeedback(null)}
                className="w-full py-3 rounded-xl bg-gold-500 hover:bg-gold-600 text-stadium-980 font-black font-display uppercase tracking-wider text-xs shadow-lg shadow-gold-500/20 transition-all cursor-pointer"
              >
                Continue Administration
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Admin Tabs */}
      <div className="flex items-center gap-2 p-1 rounded-2xl bg-stadium-900 border border-stadium-750 overflow-x-auto font-mono">
        {[
          { id: 'overview', label: 'Dashboard Stats', icon: Trophy },
          { id: 'fixtures', label: 'Fixtures & Officials (15)', icon: Calendar },
          { id: 'results', label: 'Enter Results', icon: Award },
          { id: 'players', label: `Players Roster (${players.length})`, icon: Users },
          { id: 'potm', label: `POTM Polls (${polls.length})`, icon: Vote },
          { id: 'committee', label: 'Committee (3)', icon: Phone },
          { id: 'managers', label: 'Managers', icon: Shield },
          { 
            id: 'validation', 
            label: `Data Validation`, 
            icon: AlertTriangle,
            badge: validationWarnings.length > 0 ? validationWarnings.length : undefined
          },
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-gold-500 text-stadium-980 shadow-md font-black'
                  : 'text-slate-400 hover:text-white hover:bg-stadium-850'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
              {tab.badge && (
                <span className={`px-1.5 py-0.2 rounded-full text-[9px] font-bold ${
                  isActive ? 'bg-stadium-980 text-gold-400' : 'bg-amber-500/20 text-gold-400'
                }`}>
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-8">
          
          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 font-mono">
            <div className="p-4 rounded-2xl bg-[#090d16] border border-stadium-750 text-center">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block font-sans">
                Total Teams
              </span>
              <span className="font-display font-black text-2xl text-white mt-1 block">
                6
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-[#090d16] border border-stadium-750 text-center">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block font-sans">
                Total Matches
              </span>
              <span className="font-display font-black text-2xl text-white mt-1 block">
                15
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-[#090d16] border border-stadium-750 text-center">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block font-sans">
                Completed
              </span>
              <span className="font-display font-black text-2xl text-emerald-400 mt-1 block">
                {completedMatches.length}
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-[#090d16] border border-stadium-750 text-center">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block font-sans">
                Upcoming
              </span>
              <span className="font-display font-black text-2xl text-sky-400 mt-1 block">
                {upcomingMatches.length}
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-[#090d16] border border-stadium-750 text-center">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block font-sans">
                Total Goals
              </span>
              <span className="font-display font-black text-2xl text-gold-400 mt-1 block">
                {totalGoalsCount}
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-[#090d16] border border-stadium-750 text-center">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block font-sans">
                Registered Players
              </span>
              <span className="font-display font-black text-2xl text-white mt-1 block">
                {players.length}
              </span>
            </div>
          </div>

          {/* Quick Status Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-mono">
            {/* Table Leader */}
            <div className="p-5 rounded-2xl bg-[#090d16] border border-stadium-750 space-y-2">
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-gold-400 block">
                Current Table Leader
              </span>
              {leaderTeam ? (
                <div className="flex items-center gap-3">
                  <TeamBadge team={leaderTeam.team} size="md" />
                  <div>
                    <h4 className="font-display font-bold text-white text-base uppercase">
                      {leaderTeam.team.name}
                    </h4>
                    <p className="text-xs text-slate-400 font-mono">
                      {leaderTeam.points} Pts • GD: {leaderTeam.goal_difference > 0 ? `+${leaderTeam.goal_difference}` : leaderTeam.goal_difference}
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-slate-400">No standings data</p>
              )}
            </div>

            {/* Next Match */}
            <div className="p-5 rounded-2xl bg-[#090d16] border border-stadium-750 space-y-2">
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-sky-400 block">
                Next Match
              </span>
              {upcomingMatches[0] ? (
                <div>
                  <p className="font-display font-bold text-white text-sm uppercase">
                    {teamsMap.get(upcomingMatches[0].home_team_id)?.name} vs {teamsMap.get(upcomingMatches[0].away_team_id)?.name}
                  </p>
                  <p className="text-xs text-slate-400 font-mono mt-0.5">
                    Match #{upcomingMatches[0].match_number} (Round {upcomingMatches[0].round_number})
                  </p>
                </div>
              ) : (
                <p className="text-xs text-slate-400">No upcoming fixtures</p>
              )}
            </div>

            {/* Latest Result */}
            <div className="p-5 rounded-2xl bg-[#090d16] border border-stadium-750 space-y-2">
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-emerald-400 block">
                Latest Result
              </span>
              {completedMatches.length > 0 ? (
                <div>
                  <p className="font-display font-bold text-white text-sm uppercase">
                    {teamsMap.get(completedMatches[completedMatches.length - 1].home_team_id)?.name}{' '}
                    <span className="text-gold-400 font-black">{completedMatches[completedMatches.length - 1].home_score}</span> -{' '}
                    <span className="text-gold-400 font-black">{completedMatches[completedMatches.length - 1].away_score}</span>{' '}
                    {teamsMap.get(completedMatches[completedMatches.length - 1].away_team_id)?.name}
                  </p>
                  <p className="text-xs text-emerald-400 font-mono mt-0.5">Full Time</p>
                </div>
              ) : (
                <p className="text-xs text-slate-400">No results recorded yet</p>
              )}
            </div>
          </div>

          {/* Reset Action */}
          <div className="pt-6 border-t border-stadium-800 flex justify-end">
            <button
              onClick={handleResetTournament}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-bold uppercase tracking-wider text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-colors border border-transparent hover:border-rose-500/30 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset To Initial Official Fixtures & Players
            </button>
          </div>
        </div>
      )}

      {/* TAB 2: FIXTURE & OFFICIALS MANAGEMENT */}
      {activeTab === 'fixtures' && (
        <div className="space-y-6">
          <div>
            <h2 className="text-base font-black font-display uppercase tracking-wider text-white">
              Official Fixtures & Match Officials (15 Matches)
            </h2>
            <p className="text-xs text-slate-400 font-mono">
              Update date, kickoff time, venue, referee, and assistant referees. Official team pairings are preserved.
            </p>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-stadium-750 bg-[#090d16] shadow-broadcast">
            <table className="w-full text-left border-collapse text-xs font-mono">
              <thead>
                <tr className="bg-stadium-950 border-b border-stadium-800 text-slate-400 uppercase text-[11px]">
                  <th className="py-3.5 px-3 text-center">Match #</th>
                  <th className="py-3.5 px-3">Round</th>
                  <th className="py-3.5 px-4 font-sans font-bold">Fixture</th>
                  <th className="py-3.5 px-3">Date</th>
                  <th className="py-3.5 px-3">Time</th>
                  <th className="py-3.5 px-3 font-sans">Venue</th>
                  <th className="py-3.5 px-3 font-sans">Referee</th>
                  <th className="py-3.5 px-3 font-sans">Line Ref 1 / 2</th>
                  <th className="py-3.5 px-3">Status</th>
                  <th className="py-3.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stadium-800/60 font-medium">
                {matches.map(m => {
                  const home = teamsMap.get(m.home_team_id);
                  const away = teamsMap.get(m.away_team_id);
                  return (
                    <tr key={m.id} className="hover:bg-stadium-850/50 transition-colors">
                      <td className="py-3.5 px-3 text-center font-bold text-gold-400">
                        #{String(m.match_number).padStart(2, '0')}
                      </td>
                      <td className="py-3.5 px-3 text-slate-400">
                        Round {m.round_number}
                      </td>
                      <td className="py-3.5 px-4 font-sans font-bold">
                        <span className="text-white">{home?.name}</span>
                        <span className="text-slate-500 mx-1.5 font-mono">vs</span>
                        <span className="text-white">{away?.name}</span>
                      </td>
                      <td className="py-3.5 px-3 text-slate-300">
                        {m.scheduled_date || <span className="text-slate-400">TBA</span>}
                      </td>
                      <td className="py-3.5 px-3 text-slate-300">
                        {m.scheduled_time || <span className="text-slate-400">TBA</span>}
                      </td>
                      <td className="py-3.5 px-3 font-sans text-slate-300">
                        {m.venue || <span className="text-slate-400 font-mono">TBA</span>}
                      </td>
                      <td className="py-3.5 px-3 font-sans text-slate-300">
                        {m.referee || <span className="text-slate-400 font-mono">TBA</span>}
                      </td>
                      <td className="py-3.5 px-3 font-sans text-slate-300">
                        <span className="block truncate max-w-[120px]">{m.assistant_referee_1 || 'TBA'} / {m.assistant_referee_2 || 'TBA'}</span>
                      </td>
                      <td className="py-3.5 px-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                          m.status === 'COMPLETED'
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : m.status === 'LIVE'
                            ? 'bg-rose-500/20 text-rose-400'
                            : m.status === 'POSTPONED'
                            ? 'bg-amber-500/20 text-amber-400'
                            : 'bg-stadium-850 text-slate-400'
                        }`}>
                          {m.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-3 text-right font-sans">
                        <button
                          onClick={() => setEditingFixture(m)}
                          className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-stadium-800 hover:bg-gold-500 hover:text-stadium-980 font-bold text-[11px] uppercase transition-colors cursor-pointer"
                        >
                          <Edit3 className="w-3 h-3" />
                          Edit
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Edit Fixture Modal */}
          {editingFixture && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
              <div className="w-full max-w-lg rounded-3xl bg-[#090d16] border border-stadium-750 p-6 sm:p-8 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between pb-3 border-b border-stadium-800">
                  <h3 className="font-display font-black text-lg text-white uppercase">
                    Edit Match #{editingFixture.match_number} & Officials
                  </h3>
                  <button
                    onClick={() => setEditingFixture(null)}
                    className="p-1 text-slate-400 hover:text-white cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="p-3.5 rounded-xl bg-stadium-950 border border-stadium-800 text-xs font-mono">
                  <p className="font-bold text-white font-sans text-sm">
                    {teamsMap.get(editingFixture.home_team_id)?.name} vs {teamsMap.get(editingFixture.away_team_id)?.name}
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5">Round {editingFixture.round_number}</p>
                </div>

                <form onSubmit={handleSaveFixture} className="space-y-4 text-xs font-mono">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-300 mb-1 font-sans">
                        Date (or blank for TBA)
                      </label>
                      <input
                        type="text"
                        value={editingFixture.scheduled_date || ''}
                        onChange={e => setEditingFixture({ ...editingFixture, scheduled_date: e.target.value || null })}
                        placeholder="e.g. 10 Oct 2026"
                        className="w-full bg-stadium-950 border border-stadium-750 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-gold-500 font-sans"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-300 mb-1 font-sans">
                        Kickoff Time (or blank for TBA)
                      </label>
                      <input
                        type="text"
                        value={editingFixture.scheduled_time || ''}
                        onChange={e => setEditingFixture({ ...editingFixture, scheduled_time: e.target.value || null })}
                        placeholder="e.g. 16:30"
                        className="w-full bg-stadium-950 border border-stadium-750 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-gold-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-300 mb-1 font-sans">
                      Venue (or blank for TBA)
                    </label>
                    <input
                      type="text"
                      value={editingFixture.venue || ''}
                      onChange={e => setEditingFixture({ ...editingFixture, venue: e.target.value || null })}
                      placeholder="e.g. Main Hostel Football Ground"
                      className="w-full bg-stadium-950 border border-stadium-750 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-gold-500 font-sans"
                    />
                  </div>

                  {/* Match Officials Section */}
                  <div className="pt-2 border-t border-stadium-800">
                    <span className="text-[10px] uppercase font-bold text-gold-400 tracking-wider block mb-2 font-mono">
                      MATCH OFFICIALS
                    </span>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-300 mb-1 font-sans">
                          Main Referee
                        </label>
                        <input
                          type="text"
                          value={editingFixture.referee || ''}
                          onChange={e => setEditingFixture({ ...editingFixture, referee: e.target.value || null })}
                          placeholder="e.g. Official Name (or TBA)"
                          className="w-full bg-stadium-950 border border-stadium-750 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-gold-500 font-sans"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-300 mb-1 font-sans">
                            Assistant / Line Referee 1
                          </label>
                          <input
                            type="text"
                            value={editingFixture.assistant_referee_1 || ''}
                            onChange={e => setEditingFixture({ ...editingFixture, assistant_referee_1: e.target.value || null })}
                            placeholder="Line Official 1"
                            className="w-full bg-stadium-950 border border-stadium-750 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-gold-500 font-sans"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-300 mb-1 font-sans">
                            Assistant / Line Referee 2
                          </label>
                          <input
                            type="text"
                            value={editingFixture.assistant_referee_2 || ''}
                            onChange={e => setEditingFixture({ ...editingFixture, assistant_referee_2: e.target.value || null })}
                            placeholder="Line Official 2"
                            className="w-full bg-stadium-950 border border-stadium-750 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-gold-500 font-sans"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-300 mb-1 font-sans">
                      Match Status
                    </label>
                    <select
                      value={editingFixture.status}
                      onChange={e => setEditingFixture({ ...editingFixture, status: e.target.value as MatchStatus })}
                      className="w-full bg-stadium-950 border border-stadium-750 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-gold-500 font-sans"
                    >
                      <option value="UPCOMING">UPCOMING</option>
                      <option value="LIVE">LIVE</option>
                      <option value="COMPLETED">COMPLETED</option>
                      <option value="POSTPONED">POSTPONED</option>
                      <option value="CANCELLED">CANCELLED</option>
                    </select>
                  </div>

                  <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-stadium-800 font-sans">
                    <button
                      type="button"
                      onClick={() => setEditingFixture(null)}
                      className="px-4 py-2 rounded-xl text-slate-400 hover:text-white cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2.5 rounded-xl bg-gold-500 hover:bg-gold-600 text-stadium-980 font-black uppercase tracking-wider shadow cursor-pointer"
                    >
                      Save Changes
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: ENTER RESULTS & EVENTS */}
      {activeTab === 'results' && (
        <div className="space-y-6">
          <div>
            <h2 className="text-base font-black font-display uppercase tracking-wider text-white">
              Official Match Results & Goal Events Recording
            </h2>
            <p className="text-xs text-slate-400 font-mono">
              Entering scores and goals automatically computes the League Table, Goal Difference, Top Scorers, Playmakers, and MOTM stats.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {matches.map(m => {
              const home = teamsMap.get(m.home_team_id);
              const away = teamsMap.get(m.away_team_id);
              const isComp = m.status === 'COMPLETED';

              return (
                <div
                  key={m.id}
                  className="p-5 rounded-2xl bg-[#090d16] border border-stadium-750 flex flex-col justify-between space-y-4 shadow-broadcast"
                >
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="font-bold text-gold-400">Match #{m.match_number}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      isComp ? 'bg-emerald-500/20 text-emerald-400' : 'bg-stadium-850 text-slate-400'
                    }`}>
                      {m.status}
                    </span>
                  </div>

                  <div className="flex items-center justify-between font-display font-black text-sm">
                    <div className="flex items-center gap-2">
                      {home && <TeamBadge team={home} size="sm" />}
                      <span className="text-white uppercase">{home?.name}</span>
                    </div>
                    <div className="font-mono text-base px-2 py-1 bg-stadium-950 rounded-lg text-gold-400">
                      {m.home_score !== null ? `${m.home_score} - ${m.away_score}` : 'vs'}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-white uppercase">{away?.name}</span>
                      {away && <TeamBadge team={away} size="sm" />}
                    </div>
                  </div>

                  <button
                    onClick={() => handleOpenResultEntry(m)}
                    className="w-full py-2 rounded-xl bg-stadium-850 hover:bg-gold-500 text-white hover:text-stadium-980 font-bold text-xs font-mono uppercase tracking-wider transition-colors cursor-pointer"
                  >
                    {isComp ? 'Edit Result & Events' : 'Enter Official Result'}
                  </button>
                </div>
              );
            })}
          </div>

          {/* Result Entry Modal */}
          {selectedMatchForResult && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
              <div className="w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-3xl bg-[#090d16] border border-stadium-750 p-6 sm:p-8 shadow-2xl space-y-5">
                <div className="flex items-center justify-between pb-3 border-b border-stadium-800">
                  <h3 className="font-display font-black text-lg text-white uppercase">
                    Record Match #{selectedMatchForResult.match_number} Result
                  </h3>
                  <button
                    onClick={() => setSelectedMatchForResult(null)}
                    className="p-1 text-slate-400 hover:text-white cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Score Input Row */}
                <div className="grid grid-cols-7 items-center gap-2 text-center font-display font-black p-4 rounded-2xl bg-stadium-950 border border-stadium-800">
                  <div className="col-span-3">
                    <span className="text-xs uppercase text-slate-400 block mb-1 font-mono">Home</span>
                    <span className="text-sm text-white uppercase">{teamsMap.get(selectedMatchForResult.home_team_id)?.name}</span>
                    <input
                      type="number"
                      min="0"
                      value={homeScoreInput}
                      onChange={e => setHomeScoreInput(Math.max(0, parseInt(e.target.value) || 0))}
                      className="mt-2 w-16 mx-auto text-center bg-stadium-900 border border-stadium-700 rounded-xl py-1.5 text-2xl text-gold-400 focus:outline-none focus:border-gold-500 font-mono"
                    />
                  </div>

                  <div className="col-span-1 text-slate-500 font-mono text-xl">-</div>

                  <div className="col-span-3">
                    <span className="text-xs uppercase text-slate-400 block mb-1 font-mono">Away</span>
                    <span className="text-sm text-white uppercase">{teamsMap.get(selectedMatchForResult.away_team_id)?.name}</span>
                    <input
                      type="number"
                      min="0"
                      value={awayScoreInput}
                      onChange={e => setAwayScoreInput(Math.max(0, parseInt(e.target.value) || 0))}
                      className="mt-2 w-16 mx-auto text-center bg-stadium-900 border border-stadium-700 rounded-xl py-1.5 text-2xl text-gold-400 focus:outline-none focus:border-gold-500 font-mono"
                    />
                  </div>
                </div>

                {/* Goals timeline input */}
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300">
                      Goalscorers ({resultGoals.length})
                    </span>
                    <button
                      type="button"
                      onClick={handleAddGoal}
                      className="inline-flex items-center gap-1 text-[11px] font-mono text-emerald-400 hover:text-emerald-300 uppercase cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add Goal
                    </button>
                  </div>

                  {resultGoals.map((g, idx) => {
                    const matchPlayers = players.filter(
                      p => p.team_id === selectedMatchForResult.home_team_id || p.team_id === selectedMatchForResult.away_team_id
                    );

                    return (
                      <div key={idx} className="flex items-center gap-2 p-2.5 rounded-xl bg-stadium-950 border border-stadium-800 text-xs font-mono">
                        <select
                          value={g.player_id}
                          onChange={e => {
                            const pl = playersMap.get(e.target.value);
                            const updated = [...resultGoals];
                            updated[idx].player_id = e.target.value;
                            if (pl) updated[idx].team_id = pl.team_id;
                            setResultGoals(updated);
                          }}
                          className="flex-1 bg-stadium-900 border border-stadium-750 rounded-lg p-1.5 text-white"
                        >
                          {matchPlayers.map(p => (
                            <option key={p.id} value={p.id}>
                              {p.name} ({teamsMap.get(p.team_id)?.name})
                            </option>
                          ))}
                        </select>

                        <div className="flex items-center gap-1">
                          <input
                            type="number"
                            min="1"
                            max="60"
                            value={g.minute}
                            onChange={e => {
                              const updated = [...resultGoals];
                              updated[idx].minute = parseInt(e.target.value) || 1;
                              setResultGoals(updated);
                            }}
                            className="w-14 bg-stadium-900 border border-stadium-750 rounded-lg p-1.5 text-center text-white"
                          />
                          <span className="text-slate-500 font-bold">'</span>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleRemoveGoal(idx)}
                          className="p-1.5 text-slate-400 hover:text-rose-400 cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    );
                  })}
                </div>

                {/* Assists input */}
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300">
                      Assists ({resultAssists.length})
                    </span>
                    <button
                      type="button"
                      onClick={handleAddAssist}
                      className="inline-flex items-center gap-1 text-[11px] font-mono text-sky-400 hover:text-sky-300 uppercase cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add Assist
                    </button>
                  </div>

                  {resultAssists.map((a, idx) => {
                    const matchPlayers = players.filter(
                      p => p.team_id === selectedMatchForResult.home_team_id || p.team_id === selectedMatchForResult.away_team_id
                    );

                    return (
                      <div key={idx} className="flex items-center gap-2 p-2.5 rounded-xl bg-stadium-950 border border-stadium-800 text-xs font-mono">
                        <select
                          value={a.player_id}
                          onChange={e => {
                            const pl = playersMap.get(e.target.value);
                            const updated = [...resultAssists];
                            updated[idx].player_id = e.target.value;
                            if (pl) updated[idx].team_id = pl.team_id;
                            setResultAssists(updated);
                          }}
                          className="flex-1 bg-stadium-900 border border-stadium-750 rounded-lg p-1.5 text-white"
                        >
                          {matchPlayers.map(p => (
                            <option key={p.id} value={p.id}>
                              {p.name} ({teamsMap.get(p.team_id)?.name})
                            </option>
                          ))}
                        </select>

                        <button
                          type="button"
                          onClick={() => handleRemoveAssist(idx)}
                          className="p-1.5 text-slate-400 hover:text-rose-400 cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    );
                  })}
                </div>

                {/* MOTM input */}
                <div className="pt-2 border-t border-stadium-800">
                  <label className="block text-xs font-mono font-bold uppercase tracking-wider text-gold-400 mb-1">
                    Official Man of the Match
                  </label>
                  <select
                    value={selectedMotmPlayerId}
                    onChange={e => setSelectedMotmPlayerId(e.target.value)}
                    className="w-full bg-stadium-950 border border-stadium-750 rounded-xl p-2.5 text-xs font-mono text-white"
                  >
                    <option value="">-- Select Man of the Match --</option>
                    {players
                      .filter(p => p.team_id === selectedMatchForResult.home_team_id || p.team_id === selectedMatchForResult.away_team_id)
                      .map(p => (
                        <option key={p.id} value={p.id}>
                          {p.name} ({teamsMap.get(p.team_id)?.name} - {p.position})
                        </option>
                      ))}
                  </select>
                </div>

                <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-stadium-800">
                  <button
                    type="button"
                    onClick={() => setSelectedMatchForResult(null)}
                    className="px-4 py-2 rounded-xl text-xs font-mono uppercase text-slate-400 hover:text-white cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveResult}
                    className="px-6 py-2.5 rounded-xl bg-gold-500 hover:bg-gold-600 text-stadium-980 font-display font-black text-xs uppercase tracking-wider shadow cursor-pointer"
                  >
                    Save & Update Standings
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 4: PLAYERS ROSTER */}
      {activeTab === 'players' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-black font-display uppercase tracking-wider text-white">
                Official Squad Rosters ({players.length} Players)
              </h2>
              <p className="text-xs text-slate-400 font-mono">
                Controlled positions (GK, CB, MID, CF, TBD) and verified team assignments with official Captain status.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <select
                value={playerFilterTeam}
                onChange={e => setPlayerFilterTeam(e.target.value)}
                className="bg-stadium-900 border border-stadium-750 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-gold-500"
              >
                <option value="all">All Clubs (6)</option>
                {teams.map(t => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>

              <button
                onClick={handleOpenAddPlayer}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gold-500 hover:bg-gold-600 text-stadium-980 font-black font-display text-xs uppercase tracking-wider shadow transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Player
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {filteredPlayers.map(p => {
              const team = teamsMap.get(p.team_id);
              return (
                <div
                  key={p.id}
                  className="flex items-center justify-between p-3.5 rounded-2xl bg-[#090d16] border border-stadium-750 hover:border-stadium-700 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <PlayerAvatar
                      player={p}
                      team={team}
                      size="sm"
                    />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h4 className="font-bold text-xs text-white uppercase">{p.name}</h4>
                        <span className={`px-1 py-0.2 rounded text-[8px] font-mono font-bold uppercase border ${
                          p.position === 'GK' ? 'text-amber-300 border-amber-500/30' :
                          p.position === 'CB' ? 'text-sky-300 border-sky-500/30' :
                          p.position === 'CF' ? 'text-rose-300 border-rose-500/30' :
                          p.position === 'MID' ? 'text-emerald-300 border-emerald-500/30' :
                          'text-slate-400 border-stadium-700'
                        }`}>
                          {p.position}
                        </span>
                        {p.is_captain && (
                          <span className="px-1 py-0.2 rounded text-[8px] font-mono font-black uppercase bg-gold-400 text-stadium-980">
                            CAPTAIN
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {team?.name || 'Unassigned'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEditPlayer(p)}
                      className="p-1.5 text-slate-400 hover:text-white cursor-pointer"
                      title="Edit Player"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeletePlayer(p.id, p.name)}
                      className="p-1.5 text-slate-400 hover:text-rose-400 cursor-pointer"
                      title="Delete Player"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Add / Edit Player Modal */}
          {playerModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
              <div className="w-full max-w-md rounded-3xl bg-[#090d16] border border-stadium-750 p-6 sm:p-8 shadow-2xl space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-stadium-800">
                  <h3 className="font-display font-black text-base text-white uppercase">
                    {editingPlayer ? 'Edit Player' : 'Register New Player'}
                  </h3>
                  <button
                    onClick={() => setPlayerModalOpen(false)}
                    className="p-1 text-slate-400 hover:text-white cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleSavePlayer} className="space-y-4 text-xs font-mono">
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-300 mb-1 font-sans">
                      Player Name
                    </label>
                    <input
                      type="text"
                      required
                      value={playerName}
                      onChange={e => setPlayerName(e.target.value)}
                      placeholder="e.g. Sriraj"
                      className="w-full bg-stadium-950 border border-stadium-750 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-gold-500 font-sans"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-300 mb-1 font-sans">
                      Team
                    </label>
                    <select
                      value={playerTeamId}
                      onChange={e => setPlayerTeamId(e.target.value)}
                      className="w-full bg-stadium-950 border border-stadium-750 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-gold-500 font-sans"
                    >
                      {teams.map(t => (
                        <option key={t.id} value={t.id}>
                          {t.name} (Manager: {t.manager_name})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-300 mb-1 font-sans">
                      Position
                    </label>
                    <select
                      value={playerPosition}
                      onChange={e => setPlayerPosition(e.target.value as Position)}
                      className="w-full bg-stadium-950 border border-stadium-750 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-gold-500 font-sans"
                    >
                      <option value="GK">GK - Goalkeeper</option>
                      <option value="CB">CB - Center Back</option>
                      <option value="MID">MID - Midfielder</option>
                      <option value="CF">CF - Center Forward</option>
                      <option value="TBD">TBD - To Be Determined</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-300 mb-1 font-sans">
                      Player Photograph (Path or URL)
                    </label>
                    <input
                      type="text"
                      value={playerPhotoUrl}
                      onChange={e => setPlayerPhotoUrl(e.target.value)}
                      placeholder="e.g. /photos/Adithyan Tp.jpg or https://...supabase.co/..."
                      className="w-full bg-stadium-950 border border-stadium-750 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-gold-500 font-sans text-xs"
                    />
                    <div className="flex items-center justify-between mt-1 text-[10px] text-slate-400 font-mono">
                      <span>Development: /photos/... • Production: Supabase Storage</span>
                      {playerPhotoUrl && (
                        <button
                          type="button"
                          onClick={() => setPlayerPhotoUrl('')}
                          className="text-rose-400 hover:text-rose-300 underline cursor-pointer"
                        >
                          Remove Photo
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-2">
                    <input
                      type="checkbox"
                      id="isCaptainCheck"
                      checked={playerIsCaptain}
                      onChange={e => setPlayerIsCaptain(e.target.checked)}
                      className="w-4 h-4 rounded text-gold-500 focus:ring-0 bg-stadium-950 border-stadium-750"
                    />
                    <label htmlFor="isCaptainCheck" className="text-xs text-white font-mono font-bold cursor-pointer">
                      Official Team Captain
                    </label>
                  </div>

                  <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-stadium-800 font-sans">
                    <button
                      type="button"
                      onClick={() => setPlayerModalOpen(false)}
                      className="px-4 py-2 text-slate-400 hover:text-white font-bold uppercase cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2.5 rounded-xl bg-gold-500 hover:bg-gold-600 text-stadium-980 font-black uppercase tracking-wider shadow cursor-pointer"
                    >
                      Save Player
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 5: POTM POLLS */}
      {activeTab === 'potm' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-black font-display uppercase tracking-wider text-white">
                Player of the Match (POTM) Poll Management
              </h2>
              <p className="text-xs text-slate-400 font-mono">
                Create fan polls with 3-4 candidates, monitor live votes, and close voting to freeze official honors.
              </p>
            </div>

            <button
              onClick={handleOpenCreatePoll}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gold-500 hover:bg-gold-600 text-stadium-980 font-black font-display text-xs uppercase tracking-wider shadow transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              Create Poll
            </button>
          </div>

          {polls.length === 0 ? (
            <div className="p-8 rounded-2xl bg-[#090d16] border border-stadium-750 text-center font-mono text-xs text-slate-400">
              No POTM polls created yet. Click "Create Poll" to start fan voting for any match.
            </div>
          ) : (
            <div className="space-y-4">
              {polls.map(p => {
                const matchObj = matches.find(m => m.id === p.match_id);
                const hTeam = matchObj ? teamsMap.get(matchObj.home_team_id) : null;
                const aTeam = matchObj ? teamsMap.get(matchObj.away_team_id) : null;
                const candList = pollCandidatesMap.get(p.id) || [];
                const voteList = pollVotesMap.get(p.id) || [];
                const totalVotes = voteList.length;

                return (
                  <div
                    key={p.id}
                    className="p-5 rounded-2xl bg-[#090d16] border border-stadium-750 space-y-4 shadow-broadcast"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-stadium-800">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-display font-black text-base text-white uppercase">
                            {p.title}
                          </h3>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                            p.status === 'active'
                              ? 'bg-pitch-500/20 text-pitch-400 border border-pitch-500/30'
                              : 'bg-stadium-850 text-slate-400 border border-stadium-750'
                          }`}>
                            {p.status}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 font-mono mt-0.5">
                          Match #{matchObj?.match_number}: {hTeam?.name} vs {aTeam?.name} • Total Votes: <strong className="text-gold-400">{totalVotes}</strong>
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        {p.status === 'active' ? (
                          <button
                            onClick={() => handleClosePoll(p.id)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 font-mono text-xs font-bold uppercase transition-colors cursor-pointer"
                          >
                            <Lock className="w-3.5 h-3.5" />
                            Close Poll
                          </button>
                        ) : (
                          <span className="text-xs font-mono text-slate-500 flex items-center gap-1">
                            <Lock className="w-3.5 h-3.5" /> Poll Closed
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Candidates voting results */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                      {candList.map(c => {
                        const player = playersMap.get(c.player_id);
                        const team = player ? teamsMap.get(player.team_id) : null;
                        const cVotes = voteList.filter(v => v.candidate_id === c.id).length;
                        const pct = totalVotes > 0 ? Math.round((cVotes / totalVotes) * 100) : 0;

                        return (
                          <div key={c.id} className="p-3.5 rounded-xl bg-stadium-950 border border-stadium-800 text-xs font-mono">
                            <div className="flex items-center justify-between mb-1.5">
                              <span className="font-bold text-white uppercase truncate">{player?.name || 'Player'}</span>
                              <span className="text-[10px] text-slate-400">{player?.position}</span>
                            </div>
                            <div className="text-[11px] text-slate-400 mb-2">{team?.name}</div>
                            <div className="w-full h-1.5 rounded-full bg-stadium-850 overflow-hidden mb-1">
                              <div className="h-full bg-gold-400 rounded-full" style={{ width: `${pct}%` }} />
                            </div>
                            <div className="flex items-center justify-between text-[11px]">
                              <span className="text-gold-400 font-bold">{pct}%</span>
                              <span className="text-slate-400">{cVotes} votes</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Create Poll Modal */}
          {createPollModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
              <div className="w-full max-w-lg rounded-3xl bg-[#090d16] border border-stadium-750 p-6 sm:p-8 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between pb-3 border-b border-stadium-800">
                  <h3 className="font-display font-black text-base text-white uppercase">
                    Create Player of the Match Poll
                  </h3>
                  <button
                    onClick={() => setCreatePollModalOpen(false)}
                    className="p-1 text-slate-400 hover:text-white cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleCreatePollSubmit} className="space-y-4 text-xs font-mono">
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-300 mb-1 font-sans">
                      Select Match
                    </label>
                    <select
                      value={newPollMatchId}
                      onChange={e => {
                        setNewPollMatchId(e.target.value);
                        setSelectedCandidateIds([]);
                      }}
                      className="w-full bg-stadium-950 border border-stadium-750 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-gold-500 font-sans"
                    >
                      {matches.map(m => {
                        const h = teamsMap.get(m.home_team_id);
                        const a = teamsMap.get(m.away_team_id);
                        return (
                          <option key={m.id} value={m.id}>
                            Match #{m.match_number} (Round {m.round_number}): {h?.name} vs {a?.name} [{m.status}]
                          </option>
                        );
                      })}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-300 mb-1 font-sans">
                      Poll Title
                    </label>
                    <input
                      type="text"
                      required
                      value={newPollTitle}
                      onChange={e => setNewPollTitle(e.target.value)}
                      placeholder="Player of the Match"
                      className="w-full bg-stadium-950 border border-stadium-750 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-gold-500 font-sans"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-300 font-sans">
                        Select 3 to 4 Candidates ({selectedCandidateIds.length}/4 selected)
                      </label>
                    </div>

                    <div className="max-h-48 overflow-y-auto space-y-1.5 p-2 rounded-xl bg-stadium-950 border border-stadium-750">
                      {(() => {
                        const matchObj = matches.find(m => m.id === newPollMatchId);
                        if (!matchObj) return null;
                        const matchPlayers = players.filter(
                          p => p.team_id === matchObj.home_team_id || p.team_id === matchObj.away_team_id
                        );

                        return matchPlayers.map(p => {
                          const isSel = selectedCandidateIds.includes(p.id);
                          return (
                            <div
                              key={p.id}
                              onClick={() => handleToggleCandidate(p.id)}
                              className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-colors ${
                                isSel
                                  ? 'bg-gold-500/20 border border-gold-500/40 text-gold-400'
                                  : 'hover:bg-stadium-900 text-slate-300'
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                <span className={`w-4 h-4 rounded flex items-center justify-center border text-[10px] ${
                                  isSel ? 'bg-gold-400 text-stadium-980 border-gold-400 font-bold' : 'border-stadium-700'
                                }`}>
                                  {isSel ? '✓' : ''}
                                </span>
                                <span className="font-bold">{p.name}</span>
                                <span className="text-[10px] text-slate-400">({teamsMap.get(p.team_id)?.name})</span>
                              </div>
                              <span className="text-[10px] text-slate-400 font-mono">{p.position}</span>
                            </div>
                          );
                        });
                      })()}
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-stadium-800 font-sans">
                    <button
                      type="button"
                      onClick={() => setCreatePollModalOpen(false)}
                      className="px-4 py-2 text-slate-400 hover:text-white font-bold uppercase cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2.5 rounded-xl bg-gold-500 hover:bg-gold-600 text-stadium-980 font-black uppercase tracking-wider shadow cursor-pointer"
                    >
                      Publish Poll
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 6: COMMITTEE */}
      {activeTab === 'committee' && (
        <div className="space-y-6">
          <div>
            <h2 className="text-base font-black font-display uppercase tracking-wider text-white">
              Tournament Committee Management
            </h2>
            <p className="text-xs text-slate-400 font-mono">
              Official Tournament Coordinators. Contact details appear on the public website with direct mobile callable links.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {committee.map(member => (
              <div
                key={member.id}
                className="p-6 rounded-2xl bg-[#090d16] border border-stadium-750 flex flex-col justify-between space-y-4 shadow-broadcast"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 rounded-xl bg-gold-500/20 border border-gold-500/40 flex items-center justify-center text-gold-400">
                      <Users className="w-5 h-5" />
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-stadium-850 text-gold-400 border border-gold-500/30">
                      {member.role}
                    </span>
                  </div>

                  <h3 className="font-display font-black text-lg text-white uppercase">
                    {member.name}
                  </h3>
                  <p className="text-xs text-slate-400 font-mono mt-1">
                    Phone: <strong className="text-white">{member.phone}</strong>
                  </p>
                </div>

                <button
                  onClick={() => setEditingCommitteeMember(member)}
                  className="w-full py-2 rounded-xl bg-stadium-850 hover:bg-gold-500 text-white hover:text-stadium-980 font-bold text-xs font-mono uppercase tracking-wider transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  Edit Coordinator
                </button>
              </div>
            ))}
          </div>

          {/* Edit Committee Modal */}
          {editingCommitteeMember && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
              <div className="w-full max-w-md rounded-3xl bg-[#090d16] border border-stadium-750 p-6 sm:p-8 shadow-2xl space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-stadium-800">
                  <h3 className="font-display font-black text-base text-white uppercase">
                    Edit Coordinator Details
                  </h3>
                  <button
                    onClick={() => setEditingCommitteeMember(null)}
                    className="p-1 text-slate-400 hover:text-white cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleSaveCommitteeMember} className="space-y-4 text-xs font-mono">
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-300 mb-1 font-sans">
                      Coordinator Name
                    </label>
                    <input
                      type="text"
                      required
                      value={editingCommitteeMember.name}
                      onChange={e => setEditingCommitteeMember({ ...editingCommitteeMember, name: e.target.value })}
                      className="w-full bg-stadium-950 border border-stadium-750 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-gold-500 font-sans"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-300 mb-1 font-sans">
                      Role
                    </label>
                    <input
                      type="text"
                      required
                      value={editingCommitteeMember.role}
                      onChange={e => setEditingCommitteeMember({ ...editingCommitteeMember, role: e.target.value })}
                      className="w-full bg-stadium-950 border border-stadium-750 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-gold-500 font-sans"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-300 mb-1 font-sans">
                      Phone Number (Clickable tel: link)
                    </label>
                    <input
                      type="text"
                      required
                      value={editingCommitteeMember.phone}
                      onChange={e => setEditingCommitteeMember({ ...editingCommitteeMember, phone: e.target.value })}
                      placeholder="e.g. 9605729219"
                      className="w-full bg-stadium-950 border border-stadium-750 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-gold-500"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-stadium-800 font-sans">
                    <button
                      type="button"
                      onClick={() => setEditingCommitteeMember(null)}
                      className="px-4 py-2 text-slate-400 hover:text-white font-bold uppercase cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2.5 rounded-xl bg-gold-500 hover:bg-gold-600 text-stadium-980 font-black uppercase tracking-wider shadow cursor-pointer"
                    >
                      Save Coordinator
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 7: MANAGERS */}
      {activeTab === 'managers' && (
        <div className="space-y-6">
          <div>
            <h2 className="text-base font-black font-display uppercase tracking-wider text-white">
              Team Managers Management
            </h2>
            <p className="text-xs text-slate-400 font-mono">
              Managers oversee their squads. Updates here will reflect across match cards, team pages, and standings.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {teams.map(team => {
              const isEditing = editingManagerTeamId === team.id;

              return (
                <div
                  key={team.id}
                  className="p-6 rounded-2xl bg-[#090d16] border border-stadium-750 space-y-4 shadow-broadcast"
                >
                  <div className="flex items-center gap-3.5">
                    <TeamBadge team={team} size="md" />
                    <div>
                      <h3 className="font-display font-black text-base text-white uppercase">{team.name}</h3>
                      <span className="text-[11px] text-slate-400 font-mono">{team.short_name}</span>
                    </div>
                  </div>

                  {isEditing ? (
                    <div className="space-y-2 text-xs font-mono">
                      <label className="text-[10px] uppercase font-bold text-slate-400 font-sans">Manager Name</label>
                      <input
                        type="text"
                        value={managerNameInput}
                        onChange={e => setManagerNameInput(e.target.value)}
                        placeholder="e.g. Hari"
                        className="w-full bg-stadium-950 border border-stadium-750 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-gold-500 font-sans"
                      />
                      <div className="flex items-center justify-end gap-2 pt-2 font-sans">
                        <button
                          onClick={() => setEditingManagerTeamId(null)}
                          className="px-3 py-1.5 text-slate-400 hover:text-white uppercase font-bold cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handleSaveManager(team.id)}
                          className="px-4 py-1.5 rounded-lg bg-gold-500 hover:bg-gold-600 text-stadium-980 font-black uppercase tracking-wider shadow cursor-pointer"
                        >
                          Save
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between pt-2 border-t border-stadium-800 text-xs font-mono">
                      <div>
                        <span className="text-slate-400 text-[10px] uppercase block">Official Manager</span>
                        <strong className="text-white text-sm uppercase">{team.manager_name}</strong>
                      </div>
                      <button
                        onClick={() => {
                          setEditingManagerTeamId(team.id);
                          setManagerNameInput(team.manager_name);
                        }}
                        className="p-2 rounded-lg bg-stadium-850 hover:bg-stadium-800 text-slate-300 hover:text-white cursor-pointer"
                        title="Edit Manager"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 8: DATA VALIDATION WARNINGS */}
      {activeTab === 'validation' && (
        <div className="space-y-6">
          <div>
            <h2 className="text-base font-black font-display uppercase tracking-wider text-white">
              Roster & Tournament Data Validation Warnings
            </h2>
            <p className="text-xs text-slate-400 font-mono">
              System automated audit checking for duplicate player names, unmapped positions, missing captains, and unassigned candidates.
            </p>
          </div>

          <div className="space-y-4">
            {validationWarnings.map((warn, idx) => (
              <div
                key={idx}
                className={`p-5 rounded-2xl border text-xs font-mono space-y-1.5 ${
                  warn.type === 'danger'
                    ? 'bg-rose-950/20 border-rose-500/40 text-rose-300'
                    : warn.type === 'warning'
                    ? 'bg-amber-950/20 border-amber-500/40 text-amber-300'
                    : 'bg-sky-950/20 border-sky-500/40 text-sky-300'
                }`}
              >
                <div className="flex items-center gap-2 font-display font-black text-sm uppercase tracking-wide">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{warn.title}</span>
                </div>
                <p className="text-slate-300 font-sans text-xs leading-relaxed">
                  {warn.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
