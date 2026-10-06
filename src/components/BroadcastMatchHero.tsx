import React from 'react';
import { Match, Team } from '../types/tournament';
import { TeamBadge } from './TeamBadge';
import { Calendar, Clock, MapPin, ChevronRight, Play } from 'lucide-react';

interface BroadcastMatchHeroProps {
  match: Match;
  homeTeam: Team;
  awayTeam: Team;
  onClick: () => void;
}

export const BroadcastMatchHero: React.FC<BroadcastMatchHeroProps> = ({
  match,
  homeTeam,
  awayTeam,
  onClick,
}) => {
  const isCompleted = match.status === 'COMPLETED';
  const isLive = match.status === 'LIVE';

  return (
    <div
      onClick={onClick}
      className="group w-full overflow-hidden rounded-xl bg-white border border-slate-200 hover:border-slate-300 hover:shadow-md transition-all cursor-pointer"
    >
      {/* Top Match Header Strip */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-slate-50 border-b border-slate-100 text-xs">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-slate-700">
            ROUND {match.round_number} • MATCH {String(match.match_number).padStart(2, '0')}
          </span>
        </div>

        <div>
          {isLive ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-700 border border-rose-200">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-600 animate-ping" />
              LIVE NOW
            </span>
          ) : isCompleted ? (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
              FULL TIME
            </span>
          ) : (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
              UPCOMING
            </span>
          )}
        </div>
      </div>

      {/* Main Fixture Presentation */}
      <div className="p-5 sm:p-6">
        <div className="grid grid-cols-11 items-center gap-3">
          
          {/* HOME TEAM */}
          <div className="col-span-5 flex flex-col items-center text-center">
            <TeamBadge team={homeTeam} size="lg" />
            <h3 className="font-bold text-base sm:text-lg text-slate-900 mt-2 line-clamp-1">
              {homeTeam.name}
            </h3>
            <span className="text-[11px] text-slate-500 font-medium">
              Mgr: {homeTeam.manager_name}
            </span>
          </div>

          {/* VS / SCORE BADGE */}
          <div className="col-span-1 flex flex-col items-center justify-center">
            {isCompleted ? (
              <div className="px-3 py-1.5 rounded-lg bg-slate-100 border border-slate-200 font-bold text-xl text-slate-900">
                <span>{match.home_score}</span>
                <span className="mx-1 text-slate-400">-</span>
                <span>{match.away_score}</span>
              </div>
            ) : isLive ? (
              <div className="px-3 py-1 rounded-lg bg-rose-50 border border-rose-200 font-bold text-xl text-rose-700">
                <span>{match.home_score ?? 0} - {match.away_score ?? 0}</span>
              </div>
            ) : (
              <span className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center text-xs font-bold">
                VS
              </span>
            )}
          </div>

          {/* AWAY TEAM */}
          <div className="col-span-5 flex flex-col items-center text-center">
            <TeamBadge team={awayTeam} size="lg" />
            <h3 className="font-bold text-base sm:text-lg text-slate-900 mt-2 line-clamp-1">
              {awayTeam.name}
            </h3>
            <span className="text-[11px] text-slate-500 font-medium">
              Mgr: {awayTeam.manager_name}
            </span>
          </div>

        </div>

        {/* Match Logistics Footnote */}
        <div className="mt-5 pt-3.5 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>{match.scheduled_date || 'Date TBA'}</span>
            </span>

            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>{match.scheduled_time || 'Time TBA'}</span>
            </span>

            <span className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              <span>{match.venue || 'Venue TBA'}</span>
            </span>
          </div>

          <div className="flex items-center gap-1 text-emerald-700 font-semibold text-xs group-hover:translate-x-0.5 transition-transform">
            <span>Match Details</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </div>
        </div>

      </div>
    </div>
  );
};
