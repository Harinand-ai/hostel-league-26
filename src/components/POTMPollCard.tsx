import React, { useState, useEffect, useCallback } from 'react';
import { tournamentService } from '../services/tournamentService';
import { POTMPoll, POTMCandidate, POTMVote, Player, Team } from '../types/tournament';
import { PlayerAvatar } from './PlayerAvatar';
import { Award, CheckCircle2 } from 'lucide-react';
import { getOrCreateAnonymousVoterId } from '../lib/supabase';

interface POTMPollCardProps {
  matchId: string;
  players: Player[];
  teams: Team[];
  onVoteCast?: () => void;
}

export const POTMPollCard: React.FC<POTMPollCardProps> = ({
  matchId,
  players,
  teams,
  onVoteCast,
}) => {
  const [poll, setPoll] = useState<POTMPoll | null>(null);
  const [candidates, setCandidates] = useState<POTMCandidate[]>([]);
  const [votes, setVotes] = useState<POTMVote[]>([]);
  const [loading, setLoading] = useState(true);
  const [votingLoading, setVotingLoading] = useState(false);
  const [selectedCandidateId, setSelectedCandidateId] = useState<string | null>(null);
  const [hasVotedCandidateId, setHasVotedCandidateId] = useState<string | null>(null);
  const [voteSuccessMessage, setVoteSuccessMessage] = useState<string | null>(null);

  const playersMap = new Map(players.map(p => [p.id, p]));
  const teamsMap = new Map(teams.map(t => [t.id, t]));

  const voterId = getOrCreateAnonymousVoterId();

  // Fetch poll data
  const loadPollData = useCallback(async () => {
    try {
      const matchPoll = await tournamentService.getPollByMatchId(matchId);
      if (!matchPoll) {
        setPoll(null);
        setCandidates([]);
        setVotes([]);
        setLoading(false);
        return;
      }

      setPoll(matchPoll);
      const [candList, voteList] = await Promise.all([
        tournamentService.getCandidates(matchPoll.id),
        tournamentService.getVotes(matchPoll.id),
      ]);

      setCandidates(candList);
      setVotes(voteList);

      // Check if this anonymous user already voted
      const existingVote = voteList.find(v => v.user_id === voterId);
      if (existingVote) {
        setHasVotedCandidateId(existingVote.candidate_id);
      }
    } catch (err) {
      console.warn('Error loading POTM poll data:', err);
    } finally {
      setLoading(false);
    }
  }, [matchId, voterId]);

  useEffect(() => {
    loadPollData();
  }, [loadPollData]);

  // Handle direct 1-tap vote submission
  const handleVoteSubmit = async () => {
    if (!poll || !selectedCandidateId || poll.status === 'closed') return;

    setVotingLoading(true);
    try {
      const result = await tournamentService.submitVote(poll.id, selectedCandidateId, voterId);
      if (result.success) {
        setHasVotedCandidateId(selectedCandidateId);
        setVoteSuccessMessage('Vote submitted successfully! Thank you for voting.');
        const updatedVotes = await tournamentService.getVotes(poll.id);
        setVotes(updatedVotes);
        if (onVoteCast) onVoteCast();
      } else {
        alert(result.error || 'Unable to record vote.');
      }
    } catch (err) {
      console.warn('Vote submission error:', err);
      alert('Vote could not be recorded. Please try again.');
    } finally {
      setVotingLoading(false);
    }
  };

  if (loading) return null;
  if (!poll || candidates.length === 0) return null;

  const totalVotes = votes.length;

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <Award className="w-4 h-4 text-amber-600" />
          <h3 className="font-extrabold text-sm text-slate-900 uppercase tracking-tight">
            VOTE FOR PLAYER OF THE MATCH
          </h3>
        </div>
        <span className="text-[11px] font-semibold text-slate-400">
          {poll.status === 'closed' ? 'Poll Closed' : `${totalVotes} ${totalVotes === 1 ? 'vote' : 'votes'}`}
        </span>
      </div>

      {/* Confirmation banner if user already voted */}
      {hasVotedCandidateId ? (
        <div className="space-y-3">
          <div className="p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2.5 text-xs text-green-900">
            <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
            <div>
              <span className="font-bold block">Vote Recorded</span>
              <span className="text-[11px] text-green-700">
                You voted for {(() => {
                  const cand = candidates.find(c => c.id === hasVotedCandidateId);
                  const p = cand ? playersMap.get(cand.player_id) : null;
                  return p?.name || 'your candidate';
                })()}.
              </span>
            </div>
          </div>

          {/* Voting Results Breakdown */}
          <div className="space-y-2 pt-1">
            {candidates.map(cand => {
              const player = playersMap.get(cand.player_id);
              const team = player ? teamsMap.get(player.team_id) : null;
              if (!player) return null;

              const candidateVotes = votes.filter(v => v.candidate_id === cand.id).length;
              const pct = totalVotes > 0 ? Math.round((candidateVotes / totalVotes) * 100) : 0;
              const isSelected = cand.id === hasVotedCandidateId;

              return (
                <div key={cand.id} className="p-2 bg-slate-50 rounded-lg border border-slate-100">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <div className="flex items-center gap-2">
                      <PlayerAvatar player={player} team={team || undefined} size="xs" />
                      <span className={`font-semibold ${isSelected ? 'text-green-700 font-bold' : 'text-slate-800'}`}>
                        {player.name} {isSelected && '(Your Vote)'}
                      </span>
                    </div>
                    <span className="font-bold text-slate-600 text-xs">
                      {pct}% <span className="text-[10px] text-slate-400 font-normal">({candidateVotes})</span>
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${isSelected ? 'bg-green-600' : 'bg-slate-400'}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : poll.status === 'closed' ? (
        <div className="p-3 bg-slate-50 text-slate-600 text-xs rounded-lg text-center">
          Voting for this match has concluded.
        </div>
      ) : (
        /* Active Voting Selection */
        <div className="space-y-2.5">
          <p className="text-xs text-slate-500">
            Select a candidate below and cast your vote instantly:
          </p>

          <div className="space-y-1.5">
            {candidates.map(cand => {
              const player = playersMap.get(cand.player_id);
              const team = player ? teamsMap.get(player.team_id) : null;
              if (!player) return null;

              const isSelected = selectedCandidateId === cand.id;

              return (
                <div
                  key={cand.id}
                  onClick={() => setSelectedCandidateId(cand.id)}
                  className={`flex items-center justify-between p-2.5 rounded-lg border cursor-pointer transition-colors ${
                    isSelected
                      ? 'bg-green-50/80 border-green-600'
                      : 'bg-white border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <PlayerAvatar player={player} team={team || undefined} size="sm" />
                    <div>
                      <span className="font-bold text-xs text-slate-900 block">
                        {player.name}
                      </span>
                      <span className="text-[10px] text-slate-500">
                        {team?.name} • {player.position}
                      </span>
                    </div>
                  </div>

                  <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                    isSelected ? 'border-green-600 bg-green-600' : 'border-slate-300'
                  }`}>
                    {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-2">
            <button
              onClick={handleVoteSubmit}
              disabled={!selectedCandidateId || votingLoading}
              className={`w-full py-2.5 px-4 rounded-lg font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer ${
                selectedCandidateId && !votingLoading
                  ? 'bg-green-600 hover:bg-green-700 active:bg-green-800 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-400 cursor-not-allowed'
              }`}
            >
              {votingLoading ? 'Submitting Vote...' : 'VOTE NOW'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
