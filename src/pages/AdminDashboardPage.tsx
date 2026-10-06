import React, { useState, useEffect, useCallback } from 'react';
import {
  Team,
  Match,
  Player,
  Goal,
  ManOfTheMatch,
  TeamStanding,
  PlayerStatEntry,
  Position,
  POTMPoll,
  POTMCandidate,
  POTMVote,
} from '../types/tournament';
import { tournamentService } from '../services/tournamentService';
import { TeamBadge } from '../components/TeamBadge';
import { 
  Shield, 
  Calendar, 
  Users, 
  Award, 
  LogOut, 
  Plus, 
  Edit3, 
  Trash2, 
  ArrowLeft,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

interface AdminDashboardPageProps {
  teams: Team[];
  matches: Match[];
  players: Player[];
  goals: Goal[];
  assists?: any[];
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
  motms,
  onDataChanged,
  onLogout,
  onNavigateHome,
}) => {
  const [activeTab, setActiveTab] = useState<'matches' | 'players' | 'teams' | 'potm'>('matches');

  // MATCH EDIT SCREEN STATE (One match = one edit screen)
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [editStatus, setEditStatus] = useState<Match['status']>('UPCOMING');
  const [editDate, setEditDate] = useState<string>('');
  const [editTime, setEditTime] = useState<string>('');
  const [editVenue, setEditVenue] = useState<string>('');
  const [editReferee, setEditReferee] = useState<string>('');
  const [editRef1, setEditRef1] = useState<string>('');
  const [editRef2, setEditRef2] = useState<string>('');
  const [editHomeScore, setEditHomeScore] = useState<number>(0);
  const [editAwayScore, setEditAwayScore] = useState<number>(0);
  const [editGoals, setEditGoals] = useState<{ id: string; player_id: string; team_id: string }[]>([]);
  const [editMotmPlayerId, setEditMotmPlayerId] = useState<string>('');
  const [newGoalTeamId, setNewGoalTeamId] = useState<string>('');
  const [newGoalPlayerId, setNewGoalPlayerId] = useState<string>('');

  // PLAYER MANAGEMENT STATE
  const [playerModalOpen, setPlayerModalOpen] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null);
  const [playerName, setPlayerName] = useState('');
  const [playerTeamId, setPlayerTeamId] = useState(teams[0]?.id || '');
  const [playerPosition, setPlayerPosition] = useState<Position>('MID');
  const [playerIsCaptain, setPlayerIsCaptain] = useState<boolean>(false);
  const [playerPhotoUrl, setPlayerPhotoUrl] = useState<string>('');
  const [playerFilterTeam, setPlayerFilterTeam] = useState<string>('all');

  // TEAM MANAGER EDIT STATE
  const [editingTeam, setEditingTeam] = useState<Team | null>(null);
  const [managerInput, setManagerInput] = useState('');

  // POTM MANAGEMENT STATE
  const [polls, setPolls] = useState<POTMPoll[]>([]);
  const [candidatesMap, setCandidatesMap] = useState<Map<string, POTMCandidate[]>>(new Map());
  const [votesMap, setVotesMap] = useState<Map<string, POTMVote[]>>(new Map());
  const [pollModalOpen, setPollModalOpen] = useState(false);
  const [newPollMatchId, setNewPollMatchId] = useState<string>(matches[0]?.id || '');
  const [selectedPollCandidates, setSelectedPollCandidates] = useState<string[]>([]);

  // Feedback banner
  const [feedback, setFeedback] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setFeedback({ message, type });
    setTimeout(() => setFeedback(null), 3000);
  };

  const teamsMap = new Map(teams.map(t => [t.id, t]));
  const playersMap = new Map(players.map(p => [p.id, p]));

  // Load Polls
  const loadPollsData = useCallback(async () => {
    try {
      const pList = await tournamentService.getPolls();
      setPolls(pList);
      const cMap = new Map<string, POTMCandidate[]>();
      const vMap = new Map<string, POTMVote[]>();
      for (const p of pList) {
        const [cands, vts] = await Promise.all([
          tournamentService.getCandidates(p.id),
          tournamentService.getVotes(p.id),
        ]);
        cMap.set(p.id, cands);
        vMap.set(p.id, vts);
      }
      setCandidatesMap(cMap);
      setVotesMap(vMap);
    } catch (err) {
      console.warn('Polls load error:', err);
    }
  }, []);

  useEffect(() => {
    loadPollsData();
  }, [loadPollsData]);

  // When admin clicks a match to edit
  const handleOpenMatchEditor = (match: Match) => {
    setSelectedMatch(match);
    setEditStatus(match.status);
    setEditDate(match.scheduled_date || '');
    setEditTime(match.scheduled_time || '');
    setEditVenue(match.venue || '');
    setEditReferee(match.referee || '');
    setEditRef1(match.assistant_referee_1 || '');
    setEditRef2(match.assistant_referee_2 || '');
    
    // Existing goals for this match
    const matchGoals = goals.filter(g => g.match_id === match.id);
    setEditGoals(matchGoals.map(g => ({ id: g.id, player_id: g.player_id, team_id: g.team_id })));
    setEditHomeScore(match.home_score ?? matchGoals.filter(g => g.team_id === match.home_team_id).length);
    setEditAwayScore(match.away_score ?? matchGoals.filter(g => g.team_id === match.away_team_id).length);

    // Existing MOTM
    const motm = motms.find(m => m.match_id === match.id);
    setEditMotmPlayerId(motm ? motm.player_id : '');

    // Default goal input team & player
    setNewGoalTeamId(match.home_team_id);
    const homeTeamPlayers = players.filter(p => p.team_id === match.home_team_id);
    setNewGoalPlayerId(homeTeamPlayers[0]?.id || '');
  };

  // Add goal in Match editor
  const handleAddGoal = () => {
    if (!newGoalPlayerId || !newGoalTeamId || !selectedMatch) return;
    const newG = {
      id: `temp-${Date.now()}-${Math.random()}`,
      player_id: newGoalPlayerId,
      team_id: newGoalTeamId,
    };
    const updated = [...editGoals, newG];
    setEditGoals(updated);
    // Auto update scores
    setEditHomeScore(updated.filter(g => g.team_id === selectedMatch.home_team_id).length);
    setEditAwayScore(updated.filter(g => g.team_id === selectedMatch.away_team_id).length);
  };

  // Remove goal in Match editor
  const handleRemoveGoal = (id: string) => {
    if (!selectedMatch) return;
    const updated = editGoals.filter(g => g.id !== id);
    setEditGoals(updated);
    setEditHomeScore(updated.filter(g => g.team_id === selectedMatch.home_team_id).length);
    setEditAwayScore(updated.filter(g => g.team_id === selectedMatch.away_team_id).length);
  };

  // Save Match Changes (Requirement 24)
  const handleSaveMatch = async () => {
    if (!selectedMatch) return;

    try {
      await tournamentService.saveSimplifiedMatch(
        selectedMatch.id,
        editStatus,
        {
          scheduled_date: editDate.trim() || null,
          scheduled_time: editTime.trim() || null,
          venue: editVenue.trim() || null,
          referee: editReferee.trim() || null,
          assistant_referee_1: editRef1.trim() || null,
          assistant_referee_2: editRef2.trim() || null,
        },
        editStatus === 'COMPLETED' ? editHomeScore : null,
        editStatus === 'COMPLETED' ? editAwayScore : null,
        editGoals.map(g => ({ player_id: g.player_id, team_id: g.team_id })),
        editMotmPlayerId || undefined
      );

      showToast(`Match ${selectedMatch.match_number} updated successfully!`);
      setSelectedMatch(null);
      onDataChanged();
    } catch (err: any) {
      showToast(err.message || 'Error saving match', 'error');
    }
  };

  // Player Save
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
          is_captain: playerIsCaptain,
          photo_url: playerPhotoUrl.trim() || undefined,
        });
        showToast('Player updated successfully');
      } else {
        await tournamentService.addPlayer({
          name: playerName.trim(),
          team_id: playerTeamId,
          position: playerPosition,
          is_captain: playerIsCaptain,
          photo_url: playerPhotoUrl.trim() || undefined,
        });
        showToast('Player added successfully');
      }
      setPlayerModalOpen(false);
      setEditingPlayer(null);
      onDataChanged();
    } catch (err: any) {
      showToast(err.message || 'Error saving player', 'error');
    }
  };

  // Player Delete
  const handleDeletePlayer = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to remove player "${name}"?`)) return;
    try {
      await tournamentService.deletePlayer(id);
      showToast('Player removed');
      onDataChanged();
    } catch (err: any) {
      showToast(err.message || 'Error deleting player', 'error');
    }
  };

  // Team Manager Save
  const handleSaveManager = async () => {
    if (!editingTeam || !managerInput.trim()) return;
    try {
      await tournamentService.updateTeamManager(editingTeam.id, managerInput.trim());
      showToast(`Manager for ${editingTeam.name} updated!`);
      setEditingTeam(null);
      onDataChanged();
    } catch (err: any) {
      showToast(err.message || 'Error updating manager', 'error');
    }
  };

  // Create Poll
  const handleCreatePoll = async () => {
    if (!newPollMatchId || selectedPollCandidates.length === 0) {
      alert('Please select a match and at least one candidate player.');
      return;
    }
    const match = matches.find(m => m.id === newPollMatchId);
    const title = match ? `Match ${match.match_number} Player of the Match` : 'Player of the Match';
    try {
      await tournamentService.createPoll(newPollMatchId, title, selectedPollCandidates);
      showToast('POTM Poll created successfully!');
      setPollModalOpen(false);
      setSelectedPollCandidates([]);
      loadPollsData();
    } catch (err: any) {
      showToast(err.message || 'Error creating poll', 'error');
    }
  };

  // Close Poll
  const handleClosePoll = async (pollId: string) => {
    if (!confirm('Close voting for this poll?')) return;
    try {
      await tournamentService.closePoll(pollId);
      showToast('Poll closed');
      loadPollsData();
    } catch (err: any) {
      showToast(err.message || 'Error closing poll', 'error');
    }
  };

  return (
    <div className="space-y-4 max-w-xl mx-auto pb-12">
      
      {/* Toast Feedback */}
      {feedback && (
        <div className={`p-3 rounded-lg text-xs font-bold flex items-center gap-2 ${
          feedback.type === 'success' ? 'bg-green-100 text-green-800 border border-green-200' : 'bg-red-100 text-red-800 border border-red-200'
        }`}>
          {feedback.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Top Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-green-700 flex items-center justify-center text-white font-bold">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <h1 className="font-black text-slate-900 text-base uppercase tracking-tight">
                ADMIN PANEL
              </h1>
              <span className="text-[11px] text-slate-500 font-medium">
                Hostel League 26 Official Operations
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onNavigateHome}
              className="px-2.5 py-1 text-xs font-semibold text-slate-600 hover:text-slate-900 border border-slate-200 rounded-md cursor-pointer"
            >
              Site
            </button>
            <button
              onClick={onLogout}
              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-red-600 hover:bg-red-50 border border-red-200 rounded-md cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Logout</span>
            </button>
          </div>
        </div>

        {/* Admin Tabs */}
        <div className="flex items-center gap-1 mt-3 pt-2.5 border-t border-slate-100">
          {[
            { id: 'matches', label: 'Matches', icon: Calendar },
            { id: 'players', label: 'Players', icon: Users },
            { id: 'teams', label: 'Clubs', icon: Shield },
            { id: 'potm', label: 'POTM Polls', icon: Award },
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setSelectedMatch(null);
                  setActiveTab(tab.id as any);
                }}
                className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-green-700 text-white'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ================= TAB 1: MATCHES ================= */}
      {activeTab === 'matches' && (
        <>
          {/* If Match is Selected -> ONE MATCH EDIT SCREEN (Requirement 24) */}
          {selectedMatch ? (
            <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 shadow-xs space-y-4">
              
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <button
                  onClick={() => setSelectedMatch(null)}
                  className="inline-flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-slate-900 cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to Matches List</span>
                </button>
                <span className="text-xs font-black text-green-700 uppercase">
                  EDIT MATCH {String(selectedMatch.match_number).padStart(2, '0')}
                </span>
              </div>

              {/* Match Opponents Banner */}
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 flex items-center justify-between text-xs font-bold">
                <span className="text-slate-900">{teamsMap.get(selectedMatch.home_team_id)?.name}</span>
                <span className="text-slate-400">VS</span>
                <span className="text-slate-900">{teamsMap.get(selectedMatch.away_team_id)?.name}</span>
              </div>

              {/* 1. STATUS */}
              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 mb-1.5">
                  Match Status
                </label>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  {(['UPCOMING', 'LIVE', 'COMPLETED'] as Match['status'][]).map(st => (
                    <button
                      type="button"
                      key={st}
                      onClick={() => setEditStatus(st)}
                      className={`py-2 rounded-lg font-bold border cursor-pointer transition-colors ${
                        editStatus === st
                          ? 'bg-green-700 text-white border-green-700'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              {/* 2. RESULT (Home Score / Away Score) */}
              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 mb-1.5">
                  Result / Score
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-[11px] text-slate-500 font-medium block mb-1">
                      {teamsMap.get(selectedMatch.home_team_id)?.name} Score
                    </span>
                    <input
                      type="number"
                      min={0}
                      value={editHomeScore}
                      onChange={e => setEditHomeScore(Math.max(0, parseInt(e.target.value) || 0))}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-sm font-bold text-slate-900"
                    />
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-500 font-medium block mb-1">
                      {teamsMap.get(selectedMatch.away_team_id)?.name} Score
                    </span>
                    <input
                      type="number"
                      min={0}
                      value={editAwayScore}
                      onChange={e => setEditAwayScore(Math.max(0, parseInt(e.target.value) || 0))}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-sm font-bold text-slate-900"
                    />
                  </div>
                </div>
              </div>

              {/* 3. SIMPLE GOALS ENTRY (Select Team -> Select Player -> Add) */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-3">
                <span className="text-xs font-bold uppercase text-slate-800 block">
                  Goals Tracker ({editGoals.length})
                </span>

                {/* Add Goal Control */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <select
                    value={newGoalTeamId}
                    onChange={e => {
                      const tId = e.target.value;
                      setNewGoalTeamId(tId);
                      const tPlayers = players.filter(p => p.team_id === tId);
                      setNewGoalPlayerId(tPlayers[0]?.id || '');
                    }}
                    className="bg-white border border-slate-200 rounded-lg p-2 text-xs text-slate-800 font-medium"
                  >
                    <option value={selectedMatch.home_team_id}>
                      {teamsMap.get(selectedMatch.home_team_id)?.name} (Home)
                    </option>
                    <option value={selectedMatch.away_team_id}>
                      {teamsMap.get(selectedMatch.away_team_id)?.name} (Away)
                    </option>
                  </select>

                  <select
                    value={newGoalPlayerId}
                    onChange={e => setNewGoalPlayerId(e.target.value)}
                    className="bg-white border border-slate-200 rounded-lg p-2 text-xs text-slate-800 font-medium"
                  >
                    {players
                      .filter(p => p.team_id === newGoalTeamId)
                      .map(p => (
                        <option key={p.id} value={p.id}>
                          {p.name} ({p.position})
                        </option>
                      ))}
                  </select>

                  <button
                    type="button"
                    onClick={handleAddGoal}
                    className="py-2 px-3 bg-green-600 hover:bg-green-700 text-white rounded-lg text-xs font-bold uppercase cursor-pointer"
                  >
                    + Add Goal
                  </button>
                </div>

                {/* Goals List */}
                {editGoals.length > 0 ? (
                  <div className="space-y-1.5 pt-1">
                    {editGoals.map((g, idx) => {
                      const p = playersMap.get(g.player_id);
                      const t = teamsMap.get(g.team_id);
                      return (
                        <div
                          key={g.id || idx}
                          className="flex items-center justify-between p-2 bg-white rounded-lg border border-slate-200 text-xs"
                        >
                          <div className="flex items-center gap-2">
                            <span>⚽</span>
                            <span className="font-bold text-slate-900">{p?.name || 'Player'}</span>
                            <span className="text-[11px] text-slate-400">({t?.name})</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveGoal(g.id)}
                            className="text-red-600 hover:text-red-800 text-[11px] font-bold cursor-pointer"
                          >
                            Remove
                          </button>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <span className="text-[11px] text-slate-400 block">No goals added yet.</span>
                )}
              </div>

              {/* 4. MAN OF THE MATCH SELECTOR */}
              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 mb-1.5">
                  Official Man of the Match
                </label>
                <select
                  value={editMotmPlayerId}
                  onChange={e => setEditMotmPlayerId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs text-slate-800 font-medium"
                >
                  <option value="">-- None Selected --</option>
                  <optgroup label={teamsMap.get(selectedMatch.home_team_id)?.name || 'Home'}>
                    {players
                      .filter(p => p.team_id === selectedMatch.home_team_id)
                      .map(p => (
                        <option key={p.id} value={p.id}>
                          {p.name} ({p.position})
                        </option>
                      ))}
                  </optgroup>
                  <optgroup label={teamsMap.get(selectedMatch.away_team_id)?.name || 'Away'}>
                    {players
                      .filter(p => p.team_id === selectedMatch.away_team_id)
                      .map(p => (
                        <option key={p.id} value={p.id}>
                          {p.name} ({p.position})
                        </option>
                      ))}
                  </optgroup>
                </select>
              </div>

              {/* 5. FIXTURE LOGISTICS (Date, Time, Venue, Referees) */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <span className="text-xs font-bold uppercase text-slate-800 block">
                  Fixture Details (TBA if not known)
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <div>
                    <label className="text-[10px] text-slate-500 font-semibold block mb-0.5">Date</label>
                    <input
                      type="text"
                      placeholder="e.g. 15 Oct"
                      value={editDate}
                      onChange={e => setEditDate(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded p-1.5 text-xs text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-500 font-semibold block mb-0.5">Time</label>
                    <input
                      type="text"
                      placeholder="e.g. 5:00 PM"
                      value={editTime}
                      onChange={e => setEditTime(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded p-1.5 text-xs text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-500 font-semibold block mb-0.5">Venue</label>
                    <input
                      type="text"
                      placeholder="e.g. Main Ground"
                      value={editVenue}
                      onChange={e => setEditVenue(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded p-1.5 text-xs text-slate-900"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
                  <div>
                    <label className="text-[10px] text-slate-500 font-semibold block mb-0.5">Main Referee</label>
                    <input
                      type="text"
                      placeholder="Referee Name"
                      value={editReferee}
                      onChange={e => setEditReferee(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded p-1.5 text-xs text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-500 font-semibold block mb-0.5">Assistant Ref 1</label>
                    <input
                      type="text"
                      placeholder="Line Ref 1"
                      value={editRef1}
                      onChange={e => setEditRef1(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded p-1.5 text-xs text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-500 font-semibold block mb-0.5">Assistant Ref 2</label>
                    <input
                      type="text"
                      placeholder="Line Ref 2"
                      value={editRef2}
                      onChange={e => setEditRef2(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded p-1.5 text-xs text-slate-900"
                    />
                  </div>
                </div>
              </div>

              {/* SAVE / CANCEL BUTTONS */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedMatch(null)}
                  className="px-4 py-2 border border-slate-200 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveMatch}
                  className="px-5 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-xs font-bold uppercase tracking-wider cursor-pointer shadow-xs"
                >
                  Save Changes
                </button>
              </div>

            </div>
          ) : (
            /* ALL 15 MATCHES LIST */
            <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <h2 className="text-xs font-bold uppercase text-slate-900">
                  Select a match to edit (15 Fixtures)
                </h2>
                <span className="text-[11px] text-slate-400 font-medium">
                  Rounds 1 to 5
                </span>
              </div>

              <div className="space-y-2">
                {matches.map(m => {
                  const home = teamsMap.get(m.home_team_id);
                  const away = teamsMap.get(m.away_team_id);
                  return (
                    <div
                      key={m.id}
                      onClick={() => handleOpenMatchEditor(m)}
                      className="flex items-center justify-between p-3 rounded-lg border border-slate-100 hover:bg-slate-50 transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-14 font-mono font-bold text-xs text-slate-500">
                          M{String(m.match_number).padStart(2, '0')} (R{m.round_number})
                        </span>
                        <div>
                          <span className="font-bold text-xs text-slate-900">
                            {home?.name} vs {away?.name}
                          </span>
                          <span className="text-[11px] text-slate-400 block">
                            {m.status === 'COMPLETED' ? `Result: ${m.home_score} — ${m.away_score}` : m.status}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          m.status === 'COMPLETED' ? 'bg-slate-100 text-slate-700' : m.status === 'LIVE' ? 'bg-green-100 text-green-800' : 'bg-slate-50 text-slate-400'
                        }`}>
                          {m.status}
                        </span>
                        <Edit3 className="w-4 h-4 text-slate-400" />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}

      {/* ================= TAB 2: PLAYERS ================= */}
      {activeTab === 'players' && (
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h2 className="text-xs font-bold uppercase text-slate-900">
              Registered Players ({players.length})
            </h2>
            <button
              onClick={() => {
                setEditingPlayer(null);
                setPlayerName('');
                setPlayerTeamId(teams[0]?.id || '');
                setPlayerPosition('MID');
                setPlayerIsCaptain(false);
                setPlayerPhotoUrl('');
                setPlayerModalOpen(true);
              }}
              className="inline-flex items-center gap-1 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-lg text-xs font-bold uppercase cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Player</span>
            </button>
          </div>

          {/* Team filter */}
          <div className="flex items-center gap-1.5 overflow-x-auto py-1">
            <button
              onClick={() => setPlayerFilterTeam('all')}
              className={`px-2.5 py-1 rounded text-xs font-bold uppercase shrink-0 ${
                playerFilterTeam === 'all' ? 'bg-green-700 text-white' : 'bg-slate-100 text-slate-600'
              }`}
            >
              All
            </button>
            {teams.map(t => (
              <button
                key={t.id}
                onClick={() => setPlayerFilterTeam(t.id)}
                className={`px-2.5 py-1 rounded text-xs font-bold uppercase shrink-0 ${
                  playerFilterTeam === t.id ? 'bg-green-700 text-white' : 'bg-slate-100 text-slate-600'
                }`}
              >
                {t.short_name}
              </button>
            ))}
          </div>

          {/* Player list */}
          <div className="space-y-1.5 max-h-[60vh] overflow-y-auto pr-1">
            {players
              .filter(p => playerFilterTeam === 'all' || p.team_id === playerFilterTeam)
              .map(player => (
                <div
                  key={player.id}
                  className="flex items-center justify-between p-2.5 rounded-lg border border-slate-100 hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-xs text-slate-900">{player.name}</span>
                        {player.is_captain && (
                          <span className="px-1 py-0.2 rounded text-[9px] font-black uppercase bg-amber-100 text-amber-800">
                            C
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-500">
                        {teamsMap.get(player.team_id)?.name} • {player.position}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setEditingPlayer(player);
                        setPlayerName(player.name);
                        setPlayerTeamId(player.team_id);
                        setPlayerPosition(player.position);
                        setPlayerIsCaptain(player.is_captain);
                        setPlayerPhotoUrl(player.photo_url || '');
                        setPlayerModalOpen(true);
                      }}
                      className="p-1.5 text-slate-500 hover:text-green-700 hover:bg-slate-100 rounded cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeletePlayer(player.id, player.name)}
                      className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* ================= TAB 3: TEAMS / MANAGERS ================= */}
      {activeTab === 'teams' && (
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs space-y-3">
          <div className="pb-2 border-b border-slate-100">
            <h2 className="text-xs font-bold uppercase text-slate-900">
              The 6 Official Clubs & Managers
            </h2>
            <p className="text-[11px] text-slate-500">
              Edit manager assignments or team details
            </p>
          </div>

          <div className="space-y-2">
            {teams.map(team => (
              <div
                key={team.id}
                className="flex items-center justify-between p-3 rounded-lg border border-slate-100 bg-white"
              >
                <div className="flex items-center gap-2.5">
                  <TeamBadge team={team} size="sm" />
                  <div>
                    <span className="font-bold text-xs text-slate-900 block">{team.name}</span>
                    <span className="text-[11px] text-slate-500">
                      Manager: <strong className="text-slate-800">{team.manager_name}</strong>
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setEditingTeam(team);
                    setManagerInput(team.manager_name);
                  }}
                  className="px-2.5 py-1 border border-slate-200 rounded text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
                >
                  Edit Manager
                </button>
              </div>
            ))}
          </div>

          {/* Edit Manager Modal Inline */}
          {editingTeam && (
            <div className="mt-4 p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
              <h3 className="text-xs font-bold uppercase text-slate-900">
                Update Manager for {editingTeam.name}
              </h3>
              <input
                type="text"
                value={managerInput}
                onChange={e => setManagerInput(e.target.value)}
                placeholder="Manager Name"
                className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs text-slate-900"
              />
              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingTeam(null)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveManager}
                  className="px-4 py-1.5 bg-green-600 text-white rounded text-xs font-bold uppercase"
                >
                  Save Manager
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ================= TAB 4: POTM POLLS ================= */}
      {activeTab === 'potm' && (
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div>
              <h2 className="text-xs font-bold uppercase text-slate-900">
                POTM Fan Polls ({polls.length})
              </h2>
              <span className="text-[11px] text-slate-500">
                Public anonymous voting with zero email/password required
              </span>
            </div>
            <button
              onClick={() => {
                setNewPollMatchId(matches[0]?.id || '');
                setSelectedPollCandidates([]);
                setPollModalOpen(true);
              }}
              className="inline-flex items-center gap-1 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-lg text-xs font-bold uppercase cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create Poll</span>
            </button>
          </div>

          {polls.length === 0 ? (
            <p className="text-xs text-slate-500 py-3 text-center">
              No fan polls created yet. Click "Create Poll" to start voting for a match.
            </p>
          ) : (
            <div className="space-y-3">
              {polls.map(poll => {
                const match = matches.find(m => m.id === poll.match_id);
                const cands = candidatesMap.get(poll.id) || [];
                const vts = votesMap.get(poll.id) || [];

                return (
                  <div key={poll.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="font-bold text-xs text-slate-900 block">{poll.title}</span>
                        <span className="text-[10px] text-slate-500">
                          {match ? `Match ${match.match_number} • Round ${match.round_number}` : ''} • {vts.length} total votes
                        </span>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        poll.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-slate-200 text-slate-700'
                      }`}>
                        {poll.status}
                      </span>
                    </div>

                    <div className="space-y-1">
                      {cands.map(c => {
                        const p = playersMap.get(c.player_id);
                        const cVotes = vts.filter(v => v.candidate_id === c.id).length;
                        return (
                          <div key={c.id} className="flex items-center justify-between text-xs bg-white p-1.5 rounded border border-slate-100">
                            <span className="font-medium text-slate-800">{p?.name || 'Player'}</span>
                            <span className="font-bold text-slate-600">{cVotes} votes</span>
                          </div>
                        );
                      })}
                    </div>

                    {poll.status === 'active' && (
                      <div className="pt-1 flex justify-end">
                        <button
                          type="button"
                          onClick={() => handleClosePoll(poll.id)}
                          className="px-3 py-1 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded text-[11px] font-bold uppercase cursor-pointer"
                        >
                          Close Voting
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* MODAL: ADD / EDIT PLAYER */}
      {playerModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 border border-slate-200 shadow-xl space-y-3">
            <h3 className="font-bold text-sm text-slate-900 uppercase">
              {editingPlayer ? 'Edit Player' : 'Add New Player'}
            </h3>

            <form onSubmit={handleSavePlayer} className="space-y-3">
              <div>
                <label className="text-[10px] text-slate-500 font-bold uppercase block mb-1">Player Name</label>
                <input
                  type="text"
                  required
                  value={playerName}
                  onChange={e => setPlayerName(e.target.value)}
                  placeholder="Player Full Name"
                  className="w-full bg-slate-50 border border-slate-200 rounded p-2 text-xs text-slate-900"
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-500 font-bold uppercase block mb-1">Club Assignment</label>
                <select
                  value={playerTeamId}
                  onChange={e => setPlayerTeamId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded p-2 text-xs text-slate-900"
                >
                  {teams.map(t => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] text-slate-500 font-bold uppercase block mb-1">Position</label>
                <select
                  value={playerPosition}
                  onChange={e => setPlayerPosition(e.target.value as Position)}
                  className="w-full bg-slate-50 border border-slate-200 rounded p-2 text-xs text-slate-900"
                >
                  <option value="GK">Goalkeeper (GK)</option>
                  <option value="CB">Center Back (CB)</option>
                  <option value="MID">Midfielder (MID)</option>
                  <option value="CF">Center Forward (CF)</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="capCheck"
                  checked={playerIsCaptain}
                  onChange={e => setPlayerIsCaptain(e.target.checked)}
                  className="rounded border-slate-300"
                />
                <label htmlFor="capCheck" className="text-xs font-semibold text-slate-700">Team Captain</label>
              </div>

              <div>
                <label className="text-[10px] text-slate-500 font-bold uppercase block mb-1">Photo URL (Optional)</label>
                <input
                  type="text"
                  value={playerPhotoUrl}
                  onChange={e => setPlayerPhotoUrl(e.target.value)}
                  placeholder="/photos/name.jpg or image URL"
                  className="w-full bg-slate-50 border border-slate-200 rounded p-2 text-xs text-slate-900"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setPlayerModalOpen(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-green-600 text-white rounded text-xs font-bold uppercase"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: CREATE POTM POLL */}
      {pollModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 border border-slate-200 shadow-xl space-y-3">
            <h3 className="font-bold text-sm text-slate-900 uppercase">
              Create POTM Fan Poll
            </h3>

            <div>
              <label className="text-[10px] text-slate-500 font-bold uppercase block mb-1">Select Match</label>
              <select
                value={newPollMatchId}
                onChange={e => {
                  setNewPollMatchId(e.target.value);
                  setSelectedPollCandidates([]);
                }}
                className="w-full bg-slate-50 border border-slate-200 rounded p-2 text-xs text-slate-900"
              >
                {matches.map(m => (
                  <option key={m.id} value={m.id}>
                    Match {m.match_number}: {teamsMap.get(m.home_team_id)?.name} vs {teamsMap.get(m.away_team_id)?.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[10px] text-slate-500 font-bold uppercase block mb-1">
                Select Candidates ({selectedPollCandidates.length} chosen)
              </label>
              <div className="max-h-48 overflow-y-auto space-y-1 bg-slate-50 p-2 rounded border border-slate-200">
                {(() => {
                  const m = matches.find(match => match.id === newPollMatchId);
                  if (!m) return null;
                  const matchPlayers = players.filter(p => p.team_id === m.home_team_id || p.team_id === m.away_team_id);
                  return matchPlayers.map(p => {
                    const isChecked = selectedPollCandidates.includes(p.id);
                    return (
                      <label key={p.id} className="flex items-center gap-2 p-1 hover:bg-white rounded cursor-pointer text-xs">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {
                            if (isChecked) {
                              setSelectedPollCandidates(selectedPollCandidates.filter(id => id !== p.id));
                            } else {
                              setSelectedPollCandidates([...selectedPollCandidates, p.id]);
                            }
                          }}
                        />
                        <span className="font-medium text-slate-800">{p.name} ({teamsMap.get(p.team_id)?.short_name})</span>
                      </label>
                    );
                  });
                })()}
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setPollModalOpen(false)}
                className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleCreatePoll}
                className="px-4 py-1.5 bg-green-600 text-white rounded text-xs font-bold uppercase"
              >
                Start Voting
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
