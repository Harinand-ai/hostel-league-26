import React from 'react';
import { Match, Team, Goal, ManOfTheMatch, Player } from '../types/tournament';
import { TeamBadge } from '../components/TeamBadge';
import { PlayerAvatar } from '../components/PlayerAvatar';
import { Calendar, Clock, MapPin, Award, ArrowLeft, Radio, ArrowRight, Shield } from 'lucide-react';
import { EmptyState } from '../components/EmptyState';
import { POTMPollCard } from '../components/POTMPollCard';

interface MatchDetailPageProps {
  matchId: string;
  matches: Match[];
  teams: Team[];
  goals: Goal[];
  assists?: any[];
  motms: ManOfTheMatch[];
  players: Player[];
  onNavigate: (tab: string, param?: string) => void;
  onOpenLiveWindow?: () => void;
  onSelectPlayer?: (playerId: string) => void;
}

export const MatchDetailPage: React.FC<MatchDetailPageProps> = ({
  matchId,
  matches,
  teams,
  goals,
  motms,
  players,
  onNavigate,
  onOpenLiveWindow,
  onSelectPlayer,
}) => {
  const match = matches.find(m => m.id === matchId);
  const teamsMap = new Map(teams.map(t => [t.id, t]));
  const playersMap = new Map(players.map(p => [p.id, p]));

  if (!match) {
    return (
      <div className="py-12 text-center">
        <EmptyState
          title="MATCH NOT FOUND"
          description="The requested match fixture could not be located."
          actionText="Back to Matches"
          onAction={() => onNavigate('matches')}
        />
      </div>
    );
  }

  const homeTeam = teamsMap.get(match.home_team_id);
  const awayTeam = teamsMap.get(match.away_team_id);

  if (!homeTeam || !awayTeam) return null;

  const matchGoals = goals.filter(g => g.match_id === match.id);
  const homeGoals = matchGoals.filter(g => g.team_id === homeTeam.id);
  const awayGoals = matchGoals.filter(g => g.team_id === awayTeam.id);

  const matchMotm = motms.find(m => m.match_id === match.id);
  const motmPlayer = matchMotm ? playersMap.get(matchMotm.player_id) : null;
  const isCompleted = match.status === 'COMPLETED';
  const isLive = match.status === 'LIVE';

  return (
    <div className="space-y-5 max-w-lg mx-auto">
      
      {/* Back button */}
      <button
        onClick={() => onNavigate('matches')}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Matches</span>
      </button>

      {/* Main Match Header Card */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
        
        {/* Status bar */}
        <div className="flex items-center justify-between px-4 py-2.5 bg-slate-50 border-b border-slate-100 text-xs">
          <div className="flex items-center gap-2 font-bold text-slate-800">
            <span>MATCH {String(match.match_number).padStart(2, '0')}</span>
            <span className="text-slate-400 font-normal">• Round {match.round_number}</span>
          </div>

          <div>
            {isLive ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-700 border border-rose-200">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-600 animate-ping" />
                LIVE
              </span>
            ) : isCompleted ? (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
                COMPLETED
              </span>
            ) : (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                UPCOMING
              </span>
            )}
          </div>
        </div>

        {/* Teams and Score Presentation */}
        <div className="p-5 sm:p-6">
          <div className="grid grid-cols-7 items-center gap-3">
            
            {/* Home Team */}
            <div className="col-span-3 flex flex-col items-center text-center">
              <TeamBadge team={homeTeam} size="lg" />
              <button
                onClick={() => onNavigate('team-detail', homeTeam.id)}
                className="mt-2 font-extrabold text-sm sm:text-base text-slate-900 hover:text-emerald-700 transition-colors uppercase leading-tight"
              >
                {homeTeam.name}
              </button>
              <span className="text-[11px] text-slate-500 font-medium mt-0.5">
                Mgr: {homeTeam.manager_name}
              </span>
            </div>

            {/* Score / Status Center */}
            <div className="col-span-1 flex flex-col items-center justify-center">
              {isCompleted ? (
                <div className="px-3 py-1.5 rounded-lg bg-slate-100 border border-slate-200 font-extrabold text-xl sm:text-2xl text-slate-900">
                  <span>{match.home_score}</span>
                  <span className="mx-1 text-slate-400">-</span>
                  <span>{match.away_score}</span>
                </div>
              ) : isLive ? (
                <div className="px-3 py-1 rounded-lg bg-rose-50 border border-rose-200 font-bold text-lg text-rose-700">
                  <span>{match.home_score ?? 0} - {match.away_score ?? 0}</span>
                </div>
              ) : (
                <span className="w-9 h-9 rounded-full bg-slate-100 text-slate-500 font-bold text-xs flex items-center justify-center">
                  VS
                </span>
              )}
            </div>

            {/* Away Team */}
            <div className="col-span-3 flex flex-col items-center text-center">
              <TeamBadge team={awayTeam} size="lg" />
              <button
                onClick={() => onNavigate('team-detail', awayTeam.id)}
                className="mt-2 font-extrabold text-sm sm:text-base text-slate-900 hover:text-emerald-700 transition-colors uppercase leading-tight"
              >
                {awayTeam.name}
              </button>
              <span className="text-[11px] text-slate-500 font-medium mt-0.5">
                Mgr: {awayTeam.manager_name}
              </span>
            </div>

          </div>

          {/* Fixture Logistics (Date, Time, Venue, Referees) */}
          <div className="mt-5 pt-3.5 border-t border-slate-100 flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5 text-xs text-slate-500">
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>{match.scheduled_date || 'Date: TBA'}</span>
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>{match.scheduled_time || 'Time: TBA'}</span>
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              <span>{match.venue || 'Venue: TBA'}</span>
            </span>
          </div>

          {match.referee && (
            <div className="mt-2 text-center text-[11px] text-slate-400">
              Referee: <span className="font-medium text-slate-600">{match.referee}</span>
              {match.assistant_referee_1 && ` • Lines: ${match.assistant_referee_1}`}
              {match.assistant_referee_2 && `, ${match.assistant_referee_2}`}
            </div>
          )}

        </div>

      </div>

      {/* LIVE MATCH LINK BANNER IF CURRENTLY LIVE */}
      {isLive && (
        <button
          onClick={onOpenLiveWindow}
          className="w-full block p-3.5 mc-btn-red text-left shadow-md cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-black/30 border border-white/20 flex items-center justify-center">
                <Radio className="w-4 h-4 text-white animate-pulse" />
              </div>
              <div>
                <span className="font-black text-xs uppercase block tracking-wider text-white">
                  LIVE SCORE
                </span>
                <span className="text-xs text-[#ffaaaa]">
                  Open in-app match broadcast window
                </span>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-white" />
          </div>
        </button>
      )}

      {/* GOALSCORERS LIST (SIMPLE: TEAM + PLAYER) */}
      {isCompleted && (
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs space-y-3">
          <h3 className="font-bold text-xs uppercase tracking-wider text-slate-700 flex items-center gap-1.5 pb-2 border-b border-slate-100">
            <span>⚽</span>
            <span>GOALSCORERS</span>
          </h3>

          {matchGoals.length === 0 ? (
            <p className="text-xs text-slate-500 py-1">No goals scored in this match.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              {/* Home Team Goals */}
              <div className="space-y-1.5">
                <span className="font-bold text-slate-800 block text-[11px] uppercase pb-1 border-b border-slate-100">
                  {homeTeam.name} ({homeGoals.length})
                </span>
                {homeGoals.length === 0 ? (
                  <span className="text-slate-400 text-xs italic">0 goals</span>
                ) : (
                  homeGoals.map((g, idx) => {
                    const scorer = playersMap.get(g.player_id);
                    return (
                      <div
                        key={g.id || idx}
                        onClick={() => scorer && onSelectPlayer?.(scorer.id)}
                        className={`flex items-center gap-1.5 p-2 rounded-lg bg-slate-50 border border-slate-100 ${
                          scorer ? 'cursor-pointer hover:bg-slate-100' : ''
                        }`}
                      >
                        <span className="text-sm">⚽</span>
                        <span className="font-bold text-slate-900">{scorer?.name || 'Goal'}</span>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Away Team Goals */}
              <div className="space-y-1.5">
                <span className="font-bold text-slate-800 block text-[11px] uppercase pb-1 border-b border-slate-100">
                  {awayTeam.name} ({awayGoals.length})
                </span>
                {awayGoals.length === 0 ? (
                  <span className="text-slate-400 text-xs italic">0 goals</span>
                ) : (
                  awayGoals.map((g, idx) => {
                    const scorer = playersMap.get(g.player_id);
                    return (
                      <div
                        key={g.id || idx}
                        onClick={() => scorer && onSelectPlayer?.(scorer.id)}
                        className={`flex items-center gap-1.5 p-2 rounded-lg bg-slate-50 border border-slate-100 ${
                          scorer ? 'cursor-pointer hover:bg-slate-100' : ''
                        }`}
                      >
                        <span className="text-sm">⚽</span>
                        <span className="font-bold text-slate-900">{scorer?.name || 'Goal'}</span>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* MAN OF THE MATCH CARD (IF AWARDED) */}
      {motmPlayer && (
        <div
          onClick={() => onSelectPlayer?.(motmPlayer.id)}
          className={`p-4 rounded-xl bg-amber-50/70 border border-amber-200 shadow-xs flex items-center justify-between ${
            onSelectPlayer ? 'cursor-pointer hover:bg-amber-50 transition-colors' : ''
          }`}
        >
          <div className="flex items-center gap-3">
            <PlayerAvatar
              player={motmPlayer}
              team={teamsMap.get(motmPlayer.team_id)}
              size="md"
            />
            <div>
              <div className="flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5 text-amber-600" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800">
                  PLAYER OF THE MATCH
                </span>
              </div>
              <h4 className="font-extrabold text-sm sm:text-base text-slate-900 mt-0.5">
                {motmPlayer.name}
              </h4>
              <span className="text-xs text-slate-600">
                {teamsMap.get(motmPlayer.team_id)?.name} • {motmPlayer.position}
              </span>
            </div>
          </div>

          {onSelectPlayer && (
            <span className="text-xs font-semibold text-amber-800 shrink-0">
              Profile →
            </span>
          )}
        </div>
      )}

      {/* PUBLIC POTM FAN VOTING */}
      <POTMPollCard
        matchId={match.id}
        players={players}
        teams={teams}
      />

    </div>
  );
};
