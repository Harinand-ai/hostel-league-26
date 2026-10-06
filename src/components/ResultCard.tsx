import React from 'react';
import { Match, Team, Goal, ManOfTheMatch, Player } from '../types/tournament';
import { TeamBadge } from './TeamBadge';
import { Award, ChevronRight } from 'lucide-react';

interface ResultCardProps {
  match: Match;
  homeTeam: Team;
  awayTeam: Team;
  goals?: Goal[];
  motm?: ManOfTheMatch;
  players?: Player[];
  onClick?: () => void;
}

export const ResultCard: React.FC<ResultCardProps> = ({
  match,
  homeTeam,
  awayTeam,
  goals = [],
  motm,
  players = [],
  onClick,
}) => {
  const homeGoals = goals.filter(g => g.team_id === homeTeam.id);
  const awayGoals = goals.filter(g => g.team_id === awayTeam.id);

  const playersMap = new Map(players.map(p => [p.id, p]));
  const motmPlayer = motm ? playersMap.get(motm.player_id) : null;

  return (
    <div
      onClick={onClick}
      className="group rounded-xl bg-white border border-slate-200 hover:border-slate-300 hover:shadow-md transition-all shadow-sm cursor-pointer overflow-hidden"
    >
      {/* Top Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-slate-50 border-b border-slate-100 text-xs">
        <span className="font-semibold text-slate-600">
          ROUND {match.round_number} • MATCH {String(match.match_number).padStart(2, '0')}
        </span>
        <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
          COMPLETED
        </span>
      </div>

      {/* Main Score Area */}
      <div className="p-4 sm:p-5">
        <div className="grid grid-cols-7 items-center gap-2">
          {/* Home team */}
          <div className="col-span-3 flex items-center gap-2.5">
            <TeamBadge team={homeTeam} size="md" />
            <div className="min-w-0">
              <span className="font-bold text-sm sm:text-base text-slate-900 block truncate">
                {homeTeam.name}
              </span>
              <span className="text-[11px] text-slate-500 font-medium truncate block">
                Mgr: {homeTeam.manager_name}
              </span>
            </div>
          </div>

          {/* Scores */}
          <div className="col-span-1 flex items-center justify-center">
            <div className="px-3 py-1 rounded-lg bg-slate-100 border border-slate-200 font-bold text-base sm:text-lg text-slate-900 flex items-center gap-1.5">
              <span>{match.home_score ?? 0}</span>
              <span className="text-slate-400 font-normal">-</span>
              <span>{match.away_score ?? 0}</span>
            </div>
          </div>

          {/* Away team */}
          <div className="col-span-3 flex flex-row-reverse items-center gap-2.5 text-right">
            <TeamBadge team={awayTeam} size="md" />
            <div className="min-w-0">
              <span className="font-bold text-sm sm:text-base text-slate-900 block truncate">
                {awayTeam.name}
              </span>
              <span className="text-[11px] text-slate-500 font-medium truncate block">
                Mgr: {awayTeam.manager_name}
              </span>
            </div>
          </div>
        </div>

        {/* Goalscorers strip if any */}
        {(homeGoals.length > 0 || awayGoals.length > 0) && (
          <div className="mt-3.5 pt-3 border-t border-slate-100 grid grid-cols-2 gap-4 text-xs text-slate-600">
            <div>
              {homeGoals.map(g => {
                const player = playersMap.get(g.player_id);
                return (
                  <div key={g.id} className="flex items-center gap-1">
                    <span>⚽</span>
                    <span className="font-medium text-slate-800">{player?.name || 'Goal'}</span>
                  </div>
                );
              })}
            </div>
            <div className="text-right">
              {awayGoals.map(g => {
                const player = playersMap.get(g.player_id);
                return (
                  <div key={g.id} className="flex items-center justify-end gap-1">
                    <span className="font-medium text-slate-800">{player?.name || 'Goal'}</span>
                    <span>⚽</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Man of the match highlight */}
        {motmPlayer && (
          <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5 text-amber-700 font-medium">
              <Award className="w-3.5 h-3.5 text-amber-600" />
              <span>Player of the Match: <strong>{motmPlayer.name}</strong></span>
            </div>
            <div className="flex items-center gap-1 text-emerald-700 font-semibold group-hover:translate-x-0.5 transition-transform">
              <span>View Match</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
