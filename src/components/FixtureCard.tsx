import React from 'react';
import { Match, Team } from '../types/tournament';
import { TeamBadge } from './TeamBadge';
import { Calendar, Clock, MapPin, ChevronRight } from 'lucide-react';

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
  const getStatusBadge = () => {
    switch (match.status) {
      case 'LIVE':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-rose-500/20 text-rose-400 border border-rose-500/40 animate-pulse">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
            LIVE
          </span>
        );
      case 'COMPLETED':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
            FULL TIME
          </span>
        );
      case 'POSTPONED':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-amber-500/15 text-amber-400 border border-amber-500/30">
            POSTPONED
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider bg-slate-800 text-slate-400 border border-slate-700/60">
            UPCOMING
          </span>
        );
    }
  };

  const isCompleted = match.status === 'COMPLETED';

  return (
    <div
      onClick={onClick}
      className={`group relative overflow-hidden rounded-xl bg-stadium-900 border border-stadium-800/90 transition-all duration-200 ${
        onClick ? 'cursor-pointer hover:border-stadium-700 hover:bg-stadium-850 shadow-md hover:shadow-lg' : ''
      }`}
    >
      {/* Header bar */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-stadium-950/60 border-b border-stadium-800/60 text-xs">
        <div className="flex items-center gap-2">
          <span className="font-mono font-bold text-gold-400">
            MATCH {String(match.match_number).padStart(2, '0')}
          </span>
          {showRound && (
            <span className="text-slate-400 font-medium">
              • ROUND {match.round_number}
            </span>
          )}
        </div>
        <div>{getStatusBadge()}</div>
      </div>

      {/* Main match body */}
      <div className="p-4 sm:p-5">
        <div className="grid grid-cols-7 items-center gap-2">
          
          {/* Home team */}
          <div className="col-span-3 flex flex-col items-center sm:items-start text-center sm:text-left">
            <div className="flex flex-col sm:flex-row items-center gap-2.5">
              <TeamBadge team={homeTeam} size="md" />
              <div>
                <span className="font-display font-bold text-sm sm:text-base text-slate-100 group-hover:text-gold-400 transition-colors block">
                  {homeTeam.name}
                </span>
                <span className="text-[11px] text-slate-400">
                  Mgr: <strong className="font-medium text-slate-300">{homeTeam.manager_name}</strong>
                </span>
              </div>
            </div>
          </div>

          {/* Center vs or score */}
          <div className="col-span-1 flex flex-col items-center justify-center">
            {isCompleted ? (
              <div className="flex items-center gap-1.5 px-3 py-1 rounded bg-stadium-950 border border-stadium-750 font-display font-black text-base sm:text-xl text-white">
                <span>{match.home_score}</span>
                <span className="text-slate-500 font-normal">-</span>
                <span>{match.away_score}</span>
              </div>
            ) : match.status === 'LIVE' ? (
              <div className="flex flex-col items-center">
                <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-rose-950/40 border border-rose-800/50 font-display font-black text-lg text-rose-400">
                  <span>{match.home_score ?? 0}</span>
                  <span className="text-rose-600">-</span>
                  <span>{match.away_score ?? 0}</span>
                </div>
              </div>
            ) : (
              <span className="px-2.5 py-1 rounded bg-stadium-950/90 border border-stadium-800 text-[11px] font-black uppercase tracking-widest text-slate-400">
                VS
              </span>
            )}
          </div>

          {/* Away team */}
          <div className="col-span-3 flex flex-col items-center sm:items-end text-center sm:text-right">
            <div className="flex flex-col sm:flex-row-reverse items-center gap-2.5">
              <TeamBadge team={awayTeam} size="md" />
              <div>
                <span className="font-display font-bold text-sm sm:text-base text-slate-100 group-hover:text-gold-400 transition-colors block">
                  {awayTeam.name}
                </span>
                <span className="text-[11px] text-slate-400">
                  Mgr: <strong className="font-medium text-slate-300">{awayTeam.manager_name}</strong>
                </span>
              </div>
            </div>
          </div>

        </div>

        {/* Footer info: Date, Time, Venue */}
        <div className="mt-4 pt-3 border-t border-stadium-800/70 flex flex-wrap items-center justify-between gap-y-2 text-[11px] text-slate-400 font-mono">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3 text-slate-400" />
              {match.scheduled_date ? match.scheduled_date : <span className="text-slate-400 font-semibold">DATE TBA</span>}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3 text-slate-400" />
              {match.scheduled_time ? match.scheduled_time : <span className="text-slate-400 font-semibold">TIME TBA</span>}
            </span>
            <span className="flex items-center gap-1">
              <MapPin className="w-3 h-3 text-slate-400" />
              {match.venue ? match.venue : <span className="text-slate-400 font-semibold">VENUE TBA</span>}
            </span>
          </div>

          {onClick && (
            <div className="flex items-center gap-1 text-slate-400 group-hover:text-gold-400 transition-colors">
              <span>Details</span>
              <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
