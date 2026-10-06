import React from 'react';
import { Match, Team } from '../types/tournament';
import { TeamBadge } from './TeamBadge';
import { ChevronRight } from 'lucide-react';

interface FixtureCardProps {
  match: Match;
  homeTeam: Team;
  awayTeam: Team;
  onClick?: () => void;
  showRound?: boolean;
}

export const FixtureCard: React.FC<FixtureCardProps> = ({
  match,
  homeTeam,
  awayTeam,
  onClick,
  showRound = false,
}) => {
  const isCompleted = match.status === 'COMPLETED';
  const isLive = match.status === 'LIVE';

  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-xl border border-slate-200 p-3 sm:p-4 transition-all shadow-xs hover:border-slate-300 ${
        onClick ? 'cursor-pointer hover:bg-slate-50/70' : ''
      }`}
    >
      {/* Top Header: Match Number & Status */}
      <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100 text-xs">
        <div className="flex items-center gap-1.5 font-bold text-slate-800">
          <span>MATCH {String(match.match_number).padStart(2, '0')}</span>
          {showRound && (
            <span className="text-slate-400 font-medium">• Round {match.round_number}</span>
          )}
        </div>

        <div>
          {isLive ? (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-extrabold uppercase bg-green-100 text-green-800 border border-green-200">
              <span className="w-1.5 h-1.5 rounded-full bg-green-600 animate-pulse" />
              LIVE
            </span>
          ) : isCompleted ? (
            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-100 text-slate-700">
              COMPLETED
            </span>
          ) : (
            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold uppercase bg-slate-50 text-slate-500 border border-slate-100">
              UPCOMING
            </span>
          )}
        </div>
      </div>

      {/* Teams and Score */}
      <div className="grid grid-cols-7 items-center gap-2 py-1">
        {/* Home team */}
        <div className="col-span-3 flex items-center gap-2">
          <TeamBadge team={homeTeam} size="sm" />
          <div className="truncate">
            <span className="font-bold text-slate-900 text-xs sm:text-sm block truncate">
              {homeTeam.name}
            </span>
            <span className="text-[10px] text-slate-400 truncate block">
              {homeTeam.manager_name}
            </span>
          </div>
        </div>

        {/* Center Score or VS */}
        <div className="col-span-1 flex flex-col items-center justify-center text-center">
          {isCompleted ? (
            <div className="font-black text-sm sm:text-base text-slate-900 tracking-tight">
              {match.home_score} — {match.away_score}
            </div>
          ) : isLive ? (
            <div className="font-extrabold text-sm text-green-700">
              {match.home_score ?? 0} — {match.away_score ?? 0}
            </div>
          ) : (
            <span className="text-[11px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
              VS
            </span>
          )}
        </div>

        {/* Away team */}
        <div className="col-span-3 flex items-center justify-end gap-2 text-right">
          <div className="truncate">
            <span className="font-bold text-slate-900 text-xs sm:text-sm block truncate">
              {awayTeam.name}
            </span>
            <span className="text-[10px] text-slate-400 truncate block">
              {awayTeam.manager_name}
            </span>
          </div>
          <TeamBadge team={awayTeam} size="sm" />
        </div>
      </div>

      {/* Date, Time, Venue or TBA */}
      <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
        <div className="truncate">
          <span>{match.scheduled_date || 'Date: TBA'}</span>
          <span className="mx-1.5">•</span>
          <span>{match.scheduled_time || 'Time: TBA'}</span>
          <span className="mx-1.5">•</span>
          <span>{match.venue || 'Venue: TBA'}</span>
        </div>

        {onClick && (
          <ChevronRight className="w-4 h-4 text-slate-400 shrink-0 ml-1" />
        )}
      </div>
    </div>
  );
};
