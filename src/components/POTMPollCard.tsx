import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { tournamentService } from '../services/tournamentService';
import { POTMPoll, POTMCandidate, POTMVote, Player, Team } from '../types/tournament';
import { TeamBadge } from './TeamBadge';
import { Award, CheckCircle2, Lock, Vote, AlertCircle, User, Mail, ShieldCheck } from 'lucide-react';

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
  const [currentUser, setCurrentUser] = useState<{ id: string; email?: string } | null>(null);
  const [userVotedCandidateId, setUserVotedCandidateId] = useState<string | null>(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [pendingCandidateId, setPendingCandidateId] = useState<string | null>(null);

  const playersMap = new Map(players.map(p => [p.id, p]));
  const teamsMap = new Map(teams.map(t => [t.id, t]));

  // Check auth status
  useEffect(() => {
    const checkAuth = async () => {
      if (isSupabaseConfigured && supabase) {
        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user) {
            setCurrentUser({ id: session.user.id, email: session.user.email });
          } else {
            // Check local voter identity if available
            const localId = localStorage.getItem('hl26_voter_id');
            if (localId) {
              setCurrentUser({ id: localId, email: localStorage.getItem('hl26_voter_email') || 'voter@hostelleague26.com' });
            }
          }
        } catch {
          // fallback
        }
      } else {
        // Local mode voter identity
        const localId = localStorage.getItem('hl26_voter_id');
        if (localId) {
          setCurrentUser({ id: localId, email: localStorage.getItem('hl26_voter_email') || 'voter@local' });
        }
      }
    };
    checkAuth();
  }, []);

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

      // Check if user has already voted
      if (currentUser) {
        const found = voteList.find(v => v.user_id === currentUser.id);
        if (found) {
          setUserVotedCandidateId(found.candidate_id);
        }
      }
    } catch (err) {
      console.error('Error loading POTM poll data:', err);
    } finally {
      setLoading(false);
    }
  }, [matchId, currentUser]);

  useEffect(() => {
    loadPollData();
  }, [loadPollData]);

  // Vote submit action
  const handleVote = async (candidateId: string) => {
    if (!poll || poll.status === 'closed') return;

    if (!currentUser) {
      setPendingCandidateId(candidateId);
      setAuthModalOpen(true);
      return;
    }

    setVotingLoading(true);
    try {
      const result = await tournamentService.submitVote(poll.id, candidateId, currentUser.id);
      if (!result.success) {
        alert(result.error || 'Failed to submit vote. Each user can vote once.');
      } else {
        setUserVotedCandidateId(candidateId);
        await loadPollData();
        onVoteCast?.();
      }
    } catch (err: any) {
      alert(err.message || 'Error voting');
    } finally {
      setVotingLoading(false);
    }
  };

  // Authenticate voter
  const handleAuthenticate = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    if (!authEmail.trim()) {
      setAuthError('Email is required to verify your official vote.');
      return;
    }

    try {
      if (isSupabaseConfigured && supabase) {
        // Try sign in or sign up
        const pwd = authPassword || 'VoterPass@2026';
        let authResult = await supabase.auth.signInWithPassword({
          email: authEmail.trim(),
          password: pwd,
        });

        let authenticatedUser = authResult.data?.user;
        if (!authenticatedUser) {
          const signUpRes = await supabase.auth.signUp({
            email: authEmail.trim(),
            password: pwd,
          });
          if (signUpRes.error) {
            throw signUpRes.error;
          }
          authenticatedUser = signUpRes.data?.user;
        }

        if (authenticatedUser) {
          const userObj = { id: authenticatedUser.id, email: authenticatedUser.email };
          setCurrentUser(userObj);
          localStorage.setItem('hl26_voter_id', userObj.id);
          localStorage.setItem('hl26_voter_email', userObj.email || '');
          setAuthModalOpen(false);

          if (pendingCandidateId && poll) {
            await tournamentService.submitVote(poll.id, pendingCandidateId, userObj.id);
            setUserVotedCandidateId(pendingCandidateId);
            setPendingCandidateId(null);
            await loadPollData();
            onVoteCast?.();
          }
        }

      } else {
        // Local mode voter ID
        const fakeUserId = 'usr-' + btoa(authEmail.trim()).replace(/=/g, '').toLowerCase().slice(0, 16);
        const userObj = { id: fakeUserId, email: authEmail.trim() };
        setCurrentUser(userObj);
        localStorage.setItem('hl26_voter_id', fakeUserId);
        localStorage.setItem('hl26_voter_email', authEmail.trim());
        setAuthModalOpen(false);

        if (pendingCandidateId && poll) {
          await tournamentService.submitVote(poll.id, pendingCandidateId, fakeUserId);
          setUserVotedCandidateId(pendingCandidateId);
          setPendingCandidateId(null);
          await loadPollData();
          onVoteCast?.();
        }
      }
    } catch (err: any) {
      setAuthError(err.message || 'Authentication error.');
    }
  };

  if (loading) return null;
  if (!poll) return null;

  const totalVotes = votes.length;
  const hasVoted = Boolean(userVotedCandidateId);
  const isClosed = poll.status === 'closed';

  return (
    <div className="relative overflow-hidden rounded-2xl bg-[#090d16] border border-gold-500/30 p-5 sm:p-6 shadow-broadcast">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-stadium-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gold-500/20 border border-gold-500/40 flex items-center justify-center text-gold-400">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-display font-black text-lg sm:text-xl text-white uppercase tracking-tight">
                PLAYER OF THE MATCH
              </h3>
              {isClosed ? (
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-stadium-850 text-slate-400 border border-stadium-750">
                  FINAL RESULTS
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase bg-pitch-500/20 text-pitch-400 border border-pitch-500/30 animate-pulse">
                  ● VOTING LIVE
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              Official Fan Voting • One vote per authenticated user
            </p>
          </div>
        </div>

        <div className="font-mono text-xs text-right">
          <span className="text-slate-400 uppercase text-[10px] block">TOTAL VOTES</span>
          <span className="font-display font-black text-lg text-gold-400">{totalVotes}</span>
        </div>
      </div>

      {/* Candidate Cards Grid */}
      <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {candidates.map((candidate) => {
          const player = playersMap.get(candidate.player_id);
          const team = player ? teamsMap.get(player.team_id) : null;
          const candidateVotes = votes.filter(v => v.candidate_id === candidate.id).length;
          const percentage = totalVotes > 0 ? Math.round((candidateVotes / totalVotes) * 100) : 0;
          const isSelectedByMe = userVotedCandidateId === candidate.id;

          if (!player) return null;

          return (
            <div
              key={candidate.id}
              className={`relative overflow-hidden rounded-xl p-4 flex flex-col justify-between transition-all border ${
                isSelectedByMe
                  ? 'bg-gradient-to-b from-gold-500/15 to-stadium-950 border-gold-400 shadow-gold-glow'
                  : 'bg-stadium-950/70 border-stadium-800 hover:border-stadium-700'
              }`}
            >
              {/* Card top */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  {team && <TeamBadge team={team} size="sm" />}
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-stadium-850 text-slate-300 border border-stadium-750">
                    {player.position}
                  </span>
                </div>

                <h4 className="font-display font-black text-base text-white uppercase tracking-tight">
                  {player.name}
                </h4>
                <p className="text-[11px] text-slate-400 font-mono">
                  {team?.name || 'Club'}
                </p>
              </div>

              {/* Voting bar and action */}
              <div className="mt-5 pt-3 border-t border-stadium-800/80 space-y-2">
                {(hasVoted || isClosed) ? (
                  <div>
                    <div className="flex items-center justify-between text-xs font-mono mb-1">
                      <span className="font-bold text-white">{percentage}%</span>
                      <span className="text-[10px] text-slate-400">{candidateVotes} {candidateVotes === 1 ? 'vote' : 'votes'}</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-stadium-850 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        transition={{ duration: 0.6, ease: 'easeOut' }}
                        className={`h-full rounded-full ${isSelectedByMe ? 'bg-gold-400' : 'bg-pitch-500'}`}
                      />
                    </div>
                    {isSelectedByMe && (
                      <span className="mt-2 inline-flex items-center gap-1 text-[10px] font-mono font-bold text-gold-400">
                        <CheckCircle2 className="w-3 h-3" /> YOUR VOTE
                      </span>
                    )}
                  </div>
                ) : (
                  <button
                    onClick={() => handleVote(candidate.id)}
                    disabled={votingLoading || isClosed}
                    className="w-full py-2 px-3 rounded-lg bg-stadium-850 hover:bg-gold-500 text-white hover:text-stadium-980 font-mono font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 border border-stadium-700 hover:border-gold-400 cursor-pointer disabled:opacity-50"
                  >
                    <Vote className="w-3.5 h-3.5" />
                    <span>VOTE</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer Info */}
      <div className="mt-4 pt-3 border-t border-stadium-800/60 flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono text-slate-400">
        <span className="flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-pitch-500" />
          <span>Supabase Auth Protected • No duplicate votes allowed</span>
        </span>
        {currentUser && (
          <span className="text-slate-500 text-[10px]">
            Voter: {currentUser.email}
          </span>
        )}
      </div>

      {/* Voter Authentication Modal */}
      <AnimatePresence>
        {authModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md rounded-2xl bg-stadium-900 border border-stadium-750 p-6 shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between pb-3 border-b border-stadium-800">
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4 text-gold-400" />
                  <h4 className="font-display font-black text-base text-white uppercase tracking-tight">
                    AUTHENTICATE TO VOTE
                  </h4>
                </div>
                <button
                  onClick={() => setAuthModalOpen(false)}
                  className="text-slate-400 hover:text-white font-mono text-xs"
                >
                  ✕
                </button>
              </div>

              <p className="text-xs text-slate-300 font-sans">
                To guarantee strict one-person-one-vote integrity per tournament rules, please enter your email.
              </p>

              {authError && (
                <div className="p-2.5 rounded-lg bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{authError}</span>
                </div>
              )}

              <form onSubmit={handleAuthenticate} className="space-y-3 font-mono text-xs">
                <div>
                  <label className="block uppercase text-slate-400 mb-1">Your Email</label>
                  <div className="relative">
                    <Mail className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
                    <input
                      type="email"
                      required
                      value={authEmail}
                      onChange={e => setAuthEmail(e.target.value)}
                      placeholder="your.email@example.com"
                      className="w-full bg-stadium-950 border border-stadium-750 rounded-lg pl-9 pr-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-gold-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block uppercase text-slate-400 mb-1">Password (Optional)</label>
                  <input
                    type="password"
                    value={authPassword}
                    onChange={e => setAuthPassword(e.target.value)}
                    placeholder="•••••••• (default created if blank)"
                    className="w-full bg-stadium-950 border border-stadium-750 rounded-lg px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-gold-500"
                  />
                </div>

                <div className="pt-2 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setAuthModalOpen(false)}
                    className="px-4 py-2 rounded-lg bg-stadium-850 hover:bg-stadium-800 text-slate-300 text-xs uppercase"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-lg bg-gold-500 hover:bg-gold-600 text-stadium-980 font-black uppercase tracking-wider text-xs shadow-md"
                  >
                    Verify & Submit Vote
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};
