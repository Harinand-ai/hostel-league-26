import React from 'react';
import { motion } from 'framer-motion';
import { Match, Team, Goal, Assist, ManOfTheMatch, Player } from '../types/tournament';
import { TeamBadge } from '../components/TeamBadge';
import { Calendar, Clock, MapPin, Award, ArrowLeft, Shield } from 'lucide-react';
import { EmptyState } from '../components/EmptyState';
import { POTMPollCard } from '../components/POTMPollCard';

interface MatchDetailPageProps {
  matchId: string;
  matches: Match[];
  teams: Team[];
  goals: Goal[];
  assists: Assist[];
  motms: ManOfTheMatch[];
  players: Player[];
  onNavigate: (tab: string, param?: string) => void;
}

export const MatchDetailPage: React.FC<MatchDetailPageProps> = ({
  matchId,
  matches,
  teams,
  goals,
  assists,
  motms,
  players,
  onNavigate,
}) => {
  const match = matches.find(m => m.id === matchId);
  const teamsMap = new Map(teams.map(t => [t.id, t]));
  const playersMap = new Map(players.map(p => [p.id, p]));

  if (!match) {
    return (
      <div className="py-12 text-center">
        <EmptyState
          title="MATCH NOT FOUND"
          description="The requested match could not be found."
          actionText="Back to Fixtures"
          onAction={() => onNavigate('fixtures')}
        />
      </div>
    );
  }

  const homeTeam = teamsMap.get(match.home_team_id);
  const awayTeam = teamsMap.get(match.away_team_id);

  if (!homeTeam || !awayTeam) return null;

  const matchGoals = goals
    .filter(g => g.match_id === match.id)
    .sort((a, b) => a.minute - b.minute);

  const matchAssists = assists.filter(a => a.match_id === match.id);
  const matchMotm = motms.find(m => m.match_id === match.id);
  const motmPlayer = matchMotm ? playersMap.get(matchMotm.player_id) : null;
  const isCompleted = match.status === 'COMPLETED';

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      
      {/* Back button */}
      <button
        onClick={() => onNavigate(isCompleted ? 'results' : 'fixtures')}
        className="inline-flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-slate-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to {isCompleted ? 'Results' : 'Fixtures'}
      </button>

      {/* Main Match Scorecard */}
      <div className="relative overflow-hidden rounded-3xl bg-[#090d16] border border-stadium-750 shadow-broadcast">
        
        {/* Glow halos */}
        <div
          className="absolute -top-20 -left-20 w-72 h-72 rounded-full blur-[90px] opacity-25 pointer-events-none"
          style={{ backgroundColor: homeTeam.primary_color }}
        />
        <div
          className="absolute -top-20 -right-20 w-72 h-72 rounded-full blur-[90px] opacity-25 pointer-events-none"
          style={{ backgroundColor: awayTeam.primary_color }}
        />

        {/* Header bar */}
        <div className="relative z-10 flex items-center justify-between px-6 sm:px-8 py-3.5 bg-stadium-950/80 border-b border-stadium-800 text-xs font-mono">
          <div className="flex items-center gap-2">
            <span className="font-bold text-gold-400">
              MATCH {String(match.match_number).padStart(2, '0')}
            </span>
            <span className="text-slate-400 font-semibold">• ROUND {match.round_number}</span>
          </div>

          <div>
            {match.status === 'COMPLETED' && (
              <span className="px-3 py-1 rounded text-xs font-bold uppercase tracking-wider bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                FULL TIME
              </span>
            )}
            {match.status === 'UPCOMING' && (
              <span className="px-3 py-1 rounded text-xs font-semibold uppercase tracking-wider bg-stadium-850 text-slate-400 border border-stadium-750">
                UPCOMING FIXTURE
              </span>
            )}
            {match.status === 'LIVE' && (
              <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-rose-500/20 text-rose-400 border border-rose-500/40 animate-pulse">
                ● LIVE MATCH
              </span>
            )}
            {match.status === 'POSTPONED' && (
              <span className="px-3 py-1 rounded text-xs font-bold uppercase tracking-wider bg-amber-500/20 text-amber-400 border border-amber-500/40">
                POSTPONED
              </span>
            )}
          </div>
        </div>

        {/* Score & Teams Big Display */}
        <div className="relative z-10 p-6 sm:p-10">
          <div className="grid grid-cols-7 items-center gap-4">
            
            {/* Home Team */}
            <div className="col-span-3 flex flex-col items-center text-center">
              <TeamBadge team={homeTeam} size="2xl" glow={true} />
              <button
                onClick={() => onNavigate('team-detail', homeTeam.id)}
                className="mt-4 font-display font-black text-lg sm:text-2xl lg:text-3xl text-white hover:text-gold-400 transition-colors uppercase tracking-tight"
              >
                {homeTeam.name}
              </button>
              <div className="mt-1.5 flex items-center gap-1.5 text-xs text-slate-400 font-mono">
                <Shield className="w-3.5 h-3.5 text-slate-400" />
                <span>MANAGER: <strong className="text-slate-200">{homeTeam.manager_name}</strong></span>
              </div>
            </div>

            {/* Score Center */}
            <div className="col-span-1 flex flex-col items-center justify-center">
              {isCompleted ? (
                <div className="flex items-center gap-2 sm:gap-3 px-4 sm:px-5 py-2 sm:py-3 rounded-2xl bg-stadium-950 border border-stadium-700 font-display font-black text-2xl sm:text-4xl text-white shadow-2xl font-mono">
                  <span className={match.home_score! > match.away_score! ? 'text-gold-400' : ''}>
                    {match.home_score}
                  </span>
                  <span className="text-slate-600 font-normal">:</span>
                  <span className={match.away_score! > match.home_score! ? 'text-gold-400' : ''}>
                    {match.away_score}
                  </span>
                </div>
              ) : (
                <div className="w-12 h-12 rounded-2xl bg-stadium-850 border border-stadium-750 flex items-center justify-center text-xs font-black tracking-widest text-slate-400 font-mono">
                  VS
                </div>
              )}
            </div>

            {/* Away Team */}
            <div className="col-span-3 flex flex-col items-center text-center">
              <TeamBadge team={awayTeam} size="2xl" glow={true} />
              <button
                onClick={() => onNavigate('team-detail', awayTeam.id)}
                className="mt-4 font-display font-black text-lg sm:text-2xl lg:text-3xl text-white hover:text-gold-400 transition-colors uppercase tracking-tight"
              >
                {awayTeam.name}
              </button>
              <div className="mt-1.5 flex items-center gap-1.5 text-xs text-slate-400 font-mono">
                <Shield className="w-3.5 h-3.5 text-slate-400" />
                <span>MANAGER: <strong className="text-slate-200">{awayTeam.manager_name}</strong></span>
              </div>
            </div>

          </div>

          {/* Match Logistics Metadata */}
          <div className="mt-8 pt-6 border-t border-stadium-800/80 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400 font-mono">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-emerald-400" />
              {match.scheduled_date ? match.scheduled_date : <span>DATE TBA</span>}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-sky-400" />
              {match.scheduled_time ? match.scheduled_time : <span>TIME TBA</span>}
            </span>
            <span className="flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-gold-400" />
              {match.venue ? match.venue : <span>VENUE TBA</span>}
            </span>
          </div>

          {/* Match Officials */}
          <div className="mt-3 pt-3 border-t border-stadium-850/80 flex flex-wrap items-center justify-center gap-x-6 gap-y-1 text-[11px] text-slate-400 font-mono">
            <span>REFEREE: <strong className="text-slate-200">{match.referee || 'TBA'}</strong></span>
            <span className="text-stadium-700">•</span>
            <span>LINE REF 1: <strong className="text-slate-200">{match.assistant_referee_1 || 'TBA'}</strong></span>
            <span className="text-stadium-700">•</span>
            <span>LINE REF 2: <strong className="text-slate-200">{match.assistant_referee_2 || 'TBA'}</strong></span>
          </div>
        </div>

      </div>

      {/* MOTM BANNER (if awarded) */}
      {motmPlayer && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-amber-950/40 via-stadium-900 to-amber-950/40 border border-gold-500/40 flex items-center justify-between shadow-gold-glow"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gold-500/20 border border-gold-500/50 flex items-center justify-center text-gold-400 shadow-inner">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-mono font-bold tracking-widest text-gold-400 block">
                OFFICIAL MAN OF THE MATCH
              </span>
              <h3 className="font-display font-black text-xl text-white">
                {motmPlayer.name}
              </h3>
            </div>
          </div>
          <div className="text-right">
            <span className="text-xs text-slate-400 font-mono uppercase font-bold">MVP ACCOLADE</span>
          </div>
        </motion.div>
      )}

      {/* PLAYER OF THE MATCH (POTM) FAN POLL */}
      <POTMPollCard
        matchId={match.id}
        players={players}
        teams={teams}
      />


      {/* ANIMATED GOAL EVENT TIMELINE */}
      {isCompleted && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Goals section with animated progressive line draw */}
          <div className="p-6 rounded-2xl bg-[#090d16] border border-stadium-750 space-y-4">
            <h3 className="font-display font-black text-sm uppercase tracking-broadcast text-white flex items-center gap-2">
              <span>⚽</span> GOALS TIMELINE ({matchGoals.length})
            </h3>

            {matchGoals.length === 0 ? (
              <p className="text-xs text-slate-400 py-3 font-mono">No goals scored in this match.</p>
            ) : (
              <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-gradient-to-b before:from-emerald-400 before:to-stadium-750">
                {matchGoals.map((goal, idx) => {
                  const player = playersMap.get(goal.player_id);
                  const team = teamsMap.get(goal.team_id);
                  return (
                    <motion.div
                      key={goal.id}
                      initial={{ opacity: 0, x: -15 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.3, delay: idx * 0.1 }}
                      className="relative flex items-center justify-between p-3 rounded-xl bg-stadium-950/80 border border-stadium-800 text-xs"
                    >
                      {/* Timeline node */}
                      <span className="absolute -left-[27px] w-3 h-3 rounded-full bg-emerald-400 border-2 border-stadium-950 shadow-sm" />

                      <div className="flex items-center gap-2.5">
                        <span className="font-mono font-black text-emerald-400 w-9 text-xs">
                          {goal.minute}'
                        </span>
                        <span className="font-bold text-slate-100 text-sm">
                          {player?.name || 'Goal'}
                        </span>
                      </div>
                      <span className="text-slate-400 font-mono text-[11px]">
                        {team?.name}
                      </span>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Assists section */}
          <div className="p-6 rounded-2xl bg-[#090d16] border border-stadium-750 space-y-4">
            <h3 className="font-display font-black text-sm uppercase tracking-broadcast text-white flex items-center gap-2">
              <span>🎯</span> ASSISTS ({matchAssists.length})
            </h3>

            {matchAssists.length === 0 ? (
              <p className="text-xs text-slate-400 py-3 font-mono">No assists recorded for this match.</p>
            ) : (
              <div className="space-y-2.5">
                {matchAssists.map((assist, idx) => {
                  const player = playersMap.get(assist.player_id);
                  const team = teamsMap.get(assist.team_id);
                  return (
                    <motion.div
                      key={assist.id}
                      initial={{ opacity: 0, y: 10 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.3, delay: idx * 0.1 }}
                      className="flex items-center justify-between p-3 rounded-xl bg-stadium-950/80 border border-stadium-800 text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-100 text-sm">
                          {player?.name || 'Player'}
                        </span>
                        {assist.minute && (
                          <span className="font-mono text-slate-400 text-xs">
                            ({assist.minute}')
                          </span>
                        )}
                      </div>
                      <span className="text-slate-400 font-mono text-[11px]">
                        {team?.name}
                      </span>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>

        </div>
      )}

    </div>
  );
};
