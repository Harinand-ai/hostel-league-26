import React from 'react';
import { motion } from 'framer-motion';
import { Match, Team } from '../types/tournament';
import { TeamBadge } from './TeamBadge';
import { Calendar, Clock, MapPin, ChevronRight, Shield } from 'lucide-react';

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
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-20px' }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      onClick={onClick}
      className={`group relative overflow-hidden rounded-2xl bg-[#090d16] border border-stadium-750 hover:border-stadium-600 transition-all duration-200 shadow-broadcast ${
        onClick ? 'cursor-pointer hover:bg-stadium-850/80' : ''
      }`}
    >
      {/* Subtle Team Color Light Accents on Card Edges */}
      <div
        className="absolute top-0 left-0 w-1.5 h-full opacity-70 group-hover:opacity-100 transition-opacity"
        style={{ backgroundColor: homeTeam.primary_color }}
      />

      {/* Top Match Header */}
      <div className="flex items-center justify-between px-5 py-2.5 bg-stadium-950/80 border-b border-stadium-800/80 text-xs">
        <div className="flex items-center gap-2 font-mono">
          <span className="font-bold text-gold-400">
            MATCH {String(match.match_number).padStart(2, '0')}
          </span>
          {showRound && (
            <span className="text-slate-400 font-medium">
              • ROUND {match.round_number}
            </span>
          )}
        </div>

        <div>
          {isLive ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-rose-500/20 text-rose-400 border border-rose-500/40">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" />
              LIVE
            </span>
          ) : isCompleted ? (
            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-mono">
              FULL TIME
            </span>
          ) : match.status === 'POSTPONED' ? (
            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-amber-500/15 text-amber-400 border border-amber-500/30 font-mono">
              POSTPONED
            </span>
          ) : (
            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider bg-stadium-850 text-slate-400 border border-stadium-750 font-mono">
              UPCOMING
            </span>
          )}
        </div>
      </div>

      {/* Main Fixture Body */}
      <div className="p-5">
        <div className="grid grid-cols-7 items-center gap-3">
          
          {/* Home team */}
          <div className="col-span-3 flex flex-col sm:flex-row items-center gap-3 text-center sm:text-left">
            <TeamBadge team={homeTeam} size="md" />
            <div>
              <span className="font-display font-black text-sm sm:text-base text-white group-hover:text-gold-400 transition-colors block uppercase tracking-tight">
                {homeTeam.name}
              </span>
              <span className="text-[11px] text-slate-400 font-mono flex items-center justify-center sm:justify-start gap-1 mt-0.5">
                <Shield className="w-3 h-3 text-slate-400" />
                {homeTeam.manager_name}
              </span>
            </div>
          </div>

          {/* Center vs or score */}
          <div className="col-span-1 flex flex-col items-center justify-center">
            {isCompleted ? (
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-stadium-950 border border-stadium-700 font-display font-black text-lg sm:text-xl text-white shadow-inner font-mono">
                <span className={match.home_score! > match.away_score! ? 'text-gold-400' : ''}>
                  {match.home_score}
                </span>
                <span className="text-slate-600">-</span>
                <span className={match.away_score! > match.home_score! ? 'text-gold-400' : ''}>
                  {match.away_score}
                </span>
              </div>
            ) : isLive ? (
              <div className="flex items-center gap-1 px-2.5 py-0.5 rounded bg-rose-950/40 border border-rose-800 text-rose-400 font-mono font-black text-base">
                <span>{match.home_score ?? 0}</span>
                <span>:</span>
                <span>{match.away_score ?? 0}</span>
              </div>
            ) : (
              <div className="w-8 h-8 rounded-lg bg-stadium-950 border border-stadium-750 flex items-center justify-center text-[10px] font-mono font-black tracking-widest text-slate-400">
                VS
              </div>
            )}
          </div>

          {/* Away team */}
          <div className="col-span-3 flex flex-col sm:flex-row-reverse items-center gap-3 text-center sm:text-right">
            <TeamBadge team={awayTeam} size="md" />
            <div>
              <span className="font-display font-black text-sm sm:text-base text-white group-hover:text-gold-400 transition-colors block uppercase tracking-tight">
                {awayTeam.name}
              </span>
              <span className="text-[11px] text-slate-400 font-mono flex items-center justify-center sm:justify-end gap-1 mt-0.5">
                <Shield className="w-3 h-3 text-slate-400" />
                {awayTeam.manager_name}
              </span>
            </div>
          </div>

        </div>

        {/* Footer info: Date, Time, Venue */}
        <div className="mt-4 pt-3.5 border-t border-stadium-800/80 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-400 font-mono">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3 h-3 text-emerald-400" />
              {match.scheduled_date || <span>DATE TBA</span>}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="w-3 h-3 text-sky-400" />
              {match.scheduled_time || <span>TIME TBA</span>}
            </span>
            <span className="flex items-center gap-1.5">
              <MapPin className="w-3 h-3 text-gold-400" />
              {match.venue || <span>VENUE TBA</span>}
            </span>
          </div>

          {onClick && (
            <div className="flex items-center gap-1 text-slate-400 group-hover:text-gold-400 transition-colors font-bold text-xs">
              <span>View Match</span>
              <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </div>
          )}
        </div>

      </div>
    </motion.div>
  );
};
