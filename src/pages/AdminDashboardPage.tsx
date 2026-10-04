import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Team, Match, Player, Goal, Assist, ManOfTheMatch, TeamStanding, PlayerStatEntry, Position, MatchStatus } from '../types/tournament';
import { tournamentService } from '../services/tournamentService';
import { TeamBadge } from '../components/TeamBadge';
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
  Sparkles
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
  const [activeTab, setActiveTab] = useState<'overview' | 'fixtures' | 'results' | 'players' | 'managers'>('overview');
  
  // Fixture Edit State
  const [editingFixture, setEditingFixture] = useState<Match | null>(null);

  // Result Entry State
  const [selectedMatchForResult, setSelectedMatchForResult] = useState<Match | null>(null);
  const [homeScoreInput, setHomeScoreInput] = useState<number>(0);
  const [awayScoreInput, setAwayScoreInput] = useState<number>(0);
  const [resultGoals, setResultGoals] = useState<{ player_id: string; team_id: string; minute: number }[]>([]);
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

  // Manager Edit State
  const [editingManagerTeamId, setEditingManagerTeamId] = useState<string | null>(null);
  const [managerNameInput, setManagerNameInput] = useState('');

  // Toast feedback
  const [feedbackToast, setFeedbackToast] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setFeedbackToast({ text, type });
    setTimeout(() => setFeedbackToast(null), 3500);
  };

  const teamsMap = new Map(teams.map(t => [t.id, t]));
  const completedMatches = matches.filter(m => m.status === 'COMPLETED');
  const upcomingMatches = matches.filter(m => m.status === 'UPCOMING' || m.status === 'LIVE');
  const totalGoalsCount = goals.length;
  const leaderTeam = standings[0];
  const topGoalscorer = topScorers[0];

  // FIXTURE HANDLERS
  const handleSaveFixture = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingFixture) return;
    try {
      await tournamentService.updateMatch(editingFixture);
      setEditingFixture(null);
      onDataChanged();
      showToast(`Match #${editingFixture.match_number} schedule updated.`);
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
      .map(g => ({ player_id: g.player_id, team_id: g.team_id, minute: g.minute }));
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

      // Trigger the polished Result Saved Feedback requested in Section 22
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
    setPlayerModalOpen(true);
  };

  const handleOpenEditPlayer = (p: Player) => {
    setEditingPlayer(p);
    setPlayerName(p.name);
    setPlayerTeamId(p.team_id);
    setPlayerPosition(p.position);
    setPlayerModalOpen(true);
  };

  const handleSavePlayer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!playerName.trim()) return;

    try {
      if (editingPlayer) {
        await tournamentService.updatePlayer({
          ...editingPlayer,
          name: playerName.trim(),
          team_id: playerTeamId,
          position: playerPosition,
        });
        showToast(`Player ${playerName} updated.`);
      } else {
        await tournamentService.addPlayer({
          name: playerName.trim(),
          team_id: playerTeamId,
          position: playerPosition,
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
    if (confirm(`Are you sure you want to remove ${name}?`)) {
      await tournamentService.deletePlayer(id);
      onDataChanged();
      showToast(`Player ${name} removed.`);
    }
  };

  // MANAGER HANDLERS
  const handleSaveManager = async (teamId: string) => {
    if (!managerNameInput.trim()) return;
    await tournamentService.updateTeamManager(teamId, managerNameInput.trim());
    setEditingManagerTeamId(null);
    onDataChanged();
    showToast('Manager updated.');
  };

  // RESET
  const handleResetTournament = () => {
    if (confirm('CAUTION: Reset all scores, goals, and results back to pure initial official fixtures?')) {
      tournamentService.resetToOfficialFixtures();
      onDataChanged();
      showToast('Tournament reset to pure official fixtures.');
    }
  };

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
                className="w-full py-3 rounded-xl bg-gold-500 hover:bg-gold-600 text-stadium-980 font-black font-display uppercase tracking-wider text-xs shadow-lg shadow-gold-500/20 transition-all"
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
          { id: 'fixtures', label: 'Manage Fixtures (15)', icon: Calendar },
          { id: 'results', label: 'Enter Results', icon: Award },
          { id: 'players', label: 'Players Roster', icon: Users },
          { id: 'managers', label: 'Team Managers', icon: Shield },
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-gold-500 text-stadium-980 shadow-md font-black'
                  : 'text-slate-400 hover:text-white hover:bg-stadium-850'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
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
              <span className="font-display font-black text-2xl text-purple-400 mt-1 block">
                {players.length}
              </span>
            </div>
          </div>

          {/* Quick Snapshot Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* Current Leader */}
            <div className="p-5 rounded-2xl bg-[#090d16] border border-stadium-750 space-y-2">
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-gold-400 block">
                Current League Leader
              </span>
              {leaderTeam ? (
                <div className="flex items-center gap-3">
                  <TeamBadge team={leaderTeam.team} size="md" />
                  <div>
                    <h4 className="font-display font-black text-white text-base uppercase">
                      {leaderTeam.team.name}
                    </h4>
                    <p className="text-xs text-slate-400 font-mono">
                      {leaderTeam.points} PTS • GD: {leaderTeam.goal_difference > 0 ? `+${leaderTeam.goal_difference}` : leaderTeam.goal_difference}
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-slate-400">Standings pending</p>
              )}
            </div>

            {/* Top Scorer */}
            <div className="p-5 rounded-2xl bg-[#090d16] border border-stadium-750 space-y-2">
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-gold-400 block">
                Golden Boot Leader
              </span>
              {topGoalscorer ? (
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gold-500/20 flex items-center justify-center text-gold-400">
                    <Flame className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-display font-black text-white text-base uppercase">
                      {topGoalscorer.player_name}
                    </h4>
                    <p className="text-xs text-slate-400 font-mono">
                      {topGoalscorer.value} Goals ({topGoalscorer.team.name})
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-slate-400">No goals recorded yet</p>
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
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-bold uppercase tracking-wider text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-colors border border-transparent hover:border-rose-500/30"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset To Initial Official Fixtures
            </button>
          </div>
        </div>
      )}

      {/* TAB 2: FIXTURE MANAGEMENT */}
      {activeTab === 'fixtures' && (
        <div className="space-y-6">
          <div>
            <h2 className="text-base font-black font-display uppercase tracking-wider text-white">
              Official Fixtures Management (15 Matches)
            </h2>
            <p className="text-xs text-slate-400 font-mono">
              Update date, kickoff time, venue, or match status. Official team pairings are preserved.
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
                          className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-stadium-800 hover:bg-gold-500 hover:text-stadium-980 font-bold text-[11px] uppercase transition-colors"
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
              <div className="w-full max-w-md rounded-3xl bg-[#090d16] border border-stadium-750 p-6 sm:p-8 shadow-2xl space-y-5">
                <div className="flex items-center justify-between pb-3 border-b border-stadium-800">
                  <h3 className="font-display font-black text-lg text-white uppercase">
                    Edit Match #{editingFixture.match_number}
                  </h3>
                  <button
                    onClick={() => setEditingFixture(null)}
                    className="p-1 text-slate-400 hover:text-white"
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
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-300 mb-1 font-sans">
                      Date (e.g. 12 Oct 2026 or leave blank for TBA)
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
                      Kickoff Time (e.g. 16:30 or leave blank for TBA)
                    </label>
                    <input
                      type="text"
                      value={editingFixture.scheduled_time || ''}
                      onChange={e => setEditingFixture({ ...editingFixture, scheduled_time: e.target.value || null })}
                      placeholder="e.g. 16:00"
                      className="w-full bg-stadium-950 border border-stadium-750 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-gold-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-300 mb-1 font-sans">
                      Venue (or leave blank for TBA)
                    </label>
                    <input
                      type="text"
                      value={editingFixture.venue || ''}
                      onChange={e => setEditingFixture({ ...editingFixture, venue: e.target.value || null })}
                      placeholder="e.g. Main Hostel Football Ground"
                      className="w-full bg-stadium-950 border border-stadium-750 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-gold-500 font-sans"
                    />
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
                    </select>
                  </div>

                  <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-stadium-800 font-sans">
                    <button
                      type="button"
                      onClick={() => setEditingFixture(null)}
                      className="px-4 py-2 rounded-xl text-slate-400 hover:text-white"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2.5 rounded-xl bg-gold-500 hover:bg-gold-600 text-stadium-980 font-black uppercase tracking-wider shadow"
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

      {/* TAB 3: ENTER MATCH RESULTS */}
      {activeTab === 'results' && (
        <div className="space-y-6">
          <div>
            <h2 className="text-base font-black font-display uppercase tracking-wider text-white">
              Official Match Score Entry
            </h2>
            <p className="text-xs text-slate-400 font-mono">
              Record final score, goalscorers, assists, and Man of the Match. All statistics & table update automatically.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {matches.map(m => {
              const home = teamsMap.get(m.home_team_id);
              const away = teamsMap.get(m.away_team_id);
              const isDone = m.status === 'COMPLETED';

              return (
                <div
                  key={m.id}
                  className="p-5 rounded-2xl bg-[#090d16] border border-stadium-750 hover:border-stadium-600 flex flex-col justify-between space-y-4 shadow-broadcast"
                >
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="font-bold text-gold-400">
                      MATCH #{String(m.match_number).padStart(2, '0')} (R{m.round_number})
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      isDone ? 'bg-emerald-500/20 text-emerald-400' : 'bg-stadium-850 text-slate-400'
                    }`}>
                      {m.status}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-sm font-display font-bold">
                    <div className="flex items-center gap-2">
                      <TeamBadge team={home!} size="sm" />
                      <span className="text-white uppercase">{home?.name}</span>
                    </div>

                    <div className="font-mono font-black text-lg px-2.5 py-0.5 rounded-lg bg-stadium-950 text-gold-400 border border-stadium-750">
                      {isDone ? `${m.home_score} - ${m.away_score}` : 'vs'}
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-white uppercase">{away?.name}</span>
                      <TeamBadge team={away!} size="sm" />
                    </div>
                  </div>

                  <button
                    onClick={() => handleOpenResultEntry(m)}
                    className="w-full py-2.5 rounded-xl bg-gold-500 hover:bg-gold-600 text-stadium-980 font-black text-xs font-display uppercase tracking-wider transition-colors shadow-md"
                  >
                    {isDone ? 'Edit Match Result' : 'Enter Official Result'}
                  </button>
                </div>
              );
            })}
          </div>

          {/* Modal / Panel for Result Entry */}
          {selectedMatchForResult && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
              <div className="w-full max-w-xl my-8 rounded-3xl bg-[#090d16] border border-stadium-750 p-6 sm:p-8 shadow-2xl space-y-6">
                
                <div className="flex items-center justify-between pb-3 border-b border-stadium-800">
                  <div>
                    <h3 className="font-display font-black text-lg text-white uppercase">
                      Enter Result: Match #{selectedMatchForResult.match_number}
                    </h3>
                    <p className="text-xs text-slate-400 font-mono">Round {selectedMatchForResult.round_number}</p>
                  </div>
                  <button
                    onClick={() => setSelectedMatchForResult(null)}
                    className="p-1 text-slate-400 hover:text-white"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Score Input Card */}
                <div className="p-5 rounded-2xl bg-stadium-950 border border-stadium-750">
                  <div className="grid grid-cols-7 items-center gap-2 text-center">
                    
                    <div className="col-span-3 flex flex-col items-center">
                      <TeamBadge team={teamsMap.get(selectedMatchForResult.home_team_id)!} size="md" />
                      <span className="font-bold text-sm text-white mt-1 uppercase">
                        {teamsMap.get(selectedMatchForResult.home_team_id)?.name}
                      </span>
                      <label className="text-[10px] uppercase font-bold text-slate-400 mt-2 block font-mono">
                        Goals Scored
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="25"
                        value={homeScoreInput}
                        onChange={e => setHomeScoreInput(Math.max(0, parseInt(e.target.value) || 0))}
                        className="w-16 text-center text-2xl font-black font-mono rounded-xl bg-stadium-900 border border-stadium-750 text-gold-400 py-1"
                      />
                    </div>

                    <div className="col-span-1 font-black text-xl text-slate-400">
                      —
                    </div>

                    <div className="col-span-3 flex flex-col items-center">
                      <TeamBadge team={teamsMap.get(selectedMatchForResult.away_team_id)!} size="md" />
                      <span className="font-bold text-sm text-white mt-1 uppercase">
                        {teamsMap.get(selectedMatchForResult.away_team_id)?.name}
                      </span>
                      <label className="text-[10px] uppercase font-bold text-slate-400 mt-2 block font-mono">
                        Goals Scored
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="25"
                        value={awayScoreInput}
                        onChange={e => setAwayScoreInput(Math.max(0, parseInt(e.target.value) || 0))}
                        className="w-16 text-center text-2xl font-black font-mono rounded-xl bg-stadium-900 border border-stadium-750 text-gold-400 py-1"
                      />
                    </div>

                  </div>
                </div>

                {/* Goals section */}
                <div className="space-y-3 font-mono">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
                      Goalscorers ({resultGoals.length})
                    </label>
                    <button
                      type="button"
                      onClick={handleAddGoal}
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-gold-400 hover:text-white"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Add Goal
                    </button>
                  </div>

                  {resultGoals.map((g, idx) => {
                    const matchPlayers = players.filter(
                      p => p.team_id === selectedMatchForResult.home_team_id || p.team_id === selectedMatchForResult.away_team_id
                    );

                    return (
                      <div key={idx} className="flex items-center gap-2 p-2 rounded-xl bg-stadium-950 border border-stadium-800 text-xs">
                        <select
                          value={g.player_id}
                          onChange={e => {
                            const pl = players.find(p => p.id === e.target.value);
                            const updated = [...resultGoals];
                            updated[idx].player_id = e.target.value;
                            if (pl) updated[idx].team_id = pl.team_id;
                            setResultGoals(updated);
                          }}
                          className="flex-1 bg-stadium-900 border border-stadium-750 rounded-lg px-2 py-1.5 text-white"
                        >
                          {matchPlayers.map(p => (
                            <option key={p.id} value={p.id}>
                              {p.name} ({teamsMap.get(p.team_id)?.short_name} - {p.position})
                            </option>
                          ))}
                        </select>

                        <div className="flex items-center gap-1">
                          <input
                            type="number"
                            min="1"
                            max="120"
                            value={g.minute}
                            onChange={e => {
                              const updated = [...resultGoals];
                              updated[idx].minute = parseInt(e.target.value) || 0;
                              setResultGoals(updated);
                            }}
                            className="w-14 bg-stadium-900 border border-stadium-750 rounded-lg px-2 py-1.5 text-center text-white"
                          />
                          <span className="text-slate-400 text-xs">min</span>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleRemoveGoal(idx)}
                          className="p-1.5 text-slate-400 hover:text-rose-400"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    );
                  })}
                </div>

                {/* Assists section */}
                <div className="space-y-3 font-mono">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
                      Assists ({resultAssists.length})
                    </label>
                    <button
                      type="button"
                      onClick={handleAddAssist}
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-gold-400 hover:text-white"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Add Assist
                    </button>
                  </div>

                  {resultAssists.map((a, idx) => {
                    const matchPlayers = players.filter(
                      p => p.team_id === selectedMatchForResult.home_team_id || p.team_id === selectedMatchForResult.away_team_id
                    );

                    return (
                      <div key={idx} className="flex items-center gap-2 p-2 rounded-xl bg-stadium-950 border border-stadium-800 text-xs">
                        <select
                          value={a.player_id}
                          onChange={e => {
                            const pl = players.find(p => p.id === e.target.value);
                            const updated = [...resultAssists];
                            updated[idx].player_id = e.target.value;
                            if (pl) updated[idx].team_id = pl.team_id;
                            setResultAssists(updated);
                          }}
                          className="flex-1 bg-stadium-900 border border-stadium-750 rounded-lg px-2 py-1.5 text-white"
                        >
                          {matchPlayers.map(p => (
                            <option key={p.id} value={p.id}>
                              {p.name} ({teamsMap.get(p.team_id)?.short_name})
                            </option>
                          ))}
                        </select>

                        <button
                          type="button"
                          onClick={() => handleRemoveAssist(idx)}
                          className="p-1.5 text-slate-400 hover:text-rose-400"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    );
                  })}
                </div>

                {/* Man of the match selector */}
                <div className="space-y-1.5 font-mono">
                  <label className="text-xs font-bold uppercase tracking-wider text-gold-400 flex items-center gap-1.5">
                    <Award className="w-3.5 h-3.5" />
                    Man of the Match
                  </label>
                  <select
                    value={selectedMotmPlayerId}
                    onChange={e => setSelectedMotmPlayerId(e.target.value)}
                    className="w-full bg-stadium-950 border border-stadium-750 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-gold-500 font-sans"
                  >
                    <option value="">-- Select Man of the Match --</option>
                    {players
                      .filter(
                        p => p.team_id === selectedMatchForResult.home_team_id || p.team_id === selectedMatchForResult.away_team_id
                      )
                      .map(p => (
                        <option key={p.id} value={p.id}>
                          {p.name} ({teamsMap.get(p.team_id)?.name})
                        </option>
                      ))}
                  </select>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-stadium-800 font-sans">
                  <button
                    type="button"
                    onClick={() => setSelectedMatchForResult(null)}
                    className="px-4 py-2.5 text-xs font-bold uppercase rounded-xl text-slate-400 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveResult}
                    className="px-6 py-2.5 text-xs font-black uppercase tracking-wider rounded-xl bg-gold-500 hover:bg-gold-600 text-stadium-980 shadow-lg shadow-gold-500/20"
                  >
                    Save & Update League Table
                  </button>
                </div>

              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 4: PLAYERS MANAGEMENT */}
      {activeTab === 'players' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-black font-display uppercase tracking-wider text-white">
                Player Registrations ({players.length})
              </h2>
              <p className="text-xs text-slate-400 font-mono">
                Register tournament squad members. Managers and players are maintained separately.
              </p>
            </div>
            <button
              onClick={handleOpenAddPlayer}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-gold-500 hover:bg-gold-600 text-stadium-980 font-black text-xs font-display uppercase tracking-wider transition-colors shadow"
            >
              <Plus className="w-4 h-4" />
              Register New Player
            </button>
          </div>

          {players.length === 0 ? (
            <div className="p-10 text-center rounded-2xl bg-[#090d16] border border-stadium-750 space-y-3">
              <Users className="w-8 h-8 text-slate-500 mx-auto" />
              <p className="text-sm font-bold text-slate-200">No players registered yet.</p>
              <p className="text-xs text-slate-400 max-w-sm mx-auto font-mono">
                Add players to the 6 teams so goals, assists, and MOTM awards can be assigned.
              </p>
              <button
                onClick={handleOpenAddPlayer}
                className="mt-2 px-5 py-2.5 text-xs font-bold uppercase tracking-wider bg-gold-500 text-stadium-980 rounded-xl"
              >
                Register First Player
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {players.map(p => {
                const team = teamsMap.get(p.team_id);
                return (
                  <div
                    key={p.id}
                    className="p-4 rounded-2xl bg-[#090d16] border border-stadium-750 flex items-center justify-between shadow-broadcast"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-8 h-8 rounded-lg bg-stadium-850 text-slate-300 font-bold font-mono text-[11px] flex items-center justify-center border border-stadium-750">
                        {p.position}
                      </span>
                      <div>
                        <h4 className="font-bold text-xs text-white uppercase">{p.name}</h4>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {team?.name}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenEditPlayer(p)}
                        className="p-1.5 text-slate-400 hover:text-white"
                        title="Edit Player"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeletePlayer(p.id, p.name)}
                        className="p-1.5 text-slate-400 hover:text-rose-400"
                        title="Delete Player"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

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
                    className="p-1 text-slate-400 hover:text-white"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleSavePlayer} className="space-y-4 text-xs font-mono">
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-300 mb-1 font-sans">
                      Full Name
                    </label>
                    <input
                      type="text"
                      required
                      value={playerName}
                      onChange={e => setPlayerName(e.target.value)}
                      placeholder="e.g. Rahul Sharma"
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
                          {t.name} (Mgr: {t.manager_name})
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
                      <option value="DEF">DEF - Defender</option>
                      <option value="MID">MID - Midfielder</option>
                      <option value="FWD">FWD - Forward</option>
                    </select>
                  </div>

                  <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-stadium-800 font-sans">
                    <button
                      type="button"
                      onClick={() => setPlayerModalOpen(false)}
                      className="px-4 py-2 text-slate-400 hover:text-white font-bold uppercase"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2.5 rounded-xl bg-gold-500 hover:bg-gold-600 text-stadium-980 font-black uppercase tracking-wider shadow"
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

      {/* TAB 5: MANAGERS */}
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
                        className="w-full bg-stadium-950 border border-stadium-750 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-gold-500 font-sans"
                      />
                      <div className="flex items-center gap-2 pt-2 font-sans">
                        <button
                          onClick={() => handleSaveManager(team.id)}
                          className="px-3.5 py-1.5 bg-gold-500 text-stadium-980 font-black rounded-lg uppercase text-[11px]"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setEditingManagerTeamId(null)}
                          className="px-3.5 py-1.5 text-slate-400 hover:text-white"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between pt-3 border-t border-stadium-800">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-slate-400 block font-mono">CURRENT MANAGER</span>
                        <span className="font-bold text-sm text-gold-400 uppercase font-sans">{team.manager_name}</span>
                      </div>
                      <button
                        onClick={() => {
                          setEditingManagerTeamId(team.id);
                          setManagerNameInput(team.manager_name);
                        }}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-stadium-850 hover:bg-stadium-800 text-slate-200 font-bold text-xs"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        Edit
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

    </div>
  );
};
