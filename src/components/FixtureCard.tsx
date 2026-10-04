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
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-20px' }}
      transition={{ duration: 0.3 }}
      onClick={onClick}
      className={`group relative overflow-hidden rounded-card bg-stadium-900 border border-stadium-800 hover:border-stadium-700 transition-colors shadow-broadcast ${
        onClick ? 'cursor-pointer hover:bg-stadium-850' : ''
      }`}
    >
      {/* Top Match Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-stadium-950 border-b border-stadium-800 text-xs font-mono">
        <div className="flex items-center gap-2">
          <span className="font-bold text-gold-400">
            MATCH {String(match.match_number).padStart(2, '0')}
          </span>
          {showRound && (
            <span className="text-[#9EA4AD]">
              • ROUND {match.round_number}
            </span>
          )}
        </div>

        <div>
          {isLive ? (
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-badge text-[10px] font-bold uppercase tracking-wider bg-rose-500/20 text-rose-400 border border-rose-500/30">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" />
              LIVE
            </span>
          ) : isCompleted ? (
            <span className="inline-flex items-center px-2 py-0.5 rounded-badge text-[10px] font-bold uppercase tracking-wider bg-pitch-600/20 text-pitch-400 border border-pitch-600/30">
              FULL TIME
            </span>
          ) : match.status === 'POSTPONED' ? (
            <span className="inline-flex items-center px-2 py-0.5 rounded-badge text-[10px] font-bold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/30">
              POSTPONED
            </span>
          ) : (
            <span className="inline-flex items-center px-2 py-0.5 rounded-badge text-[10px] font-bold uppercase tracking-wider bg-stadium-850 text-[#9EA4AD] border border-stadium-750">
              UPCOMING
            </span>
          )}
        </div>
      </div>

      {/* Main Fixture Body */}
      <div className="p-4 sm:p-5">
        <div className="grid grid-cols-7 items-center gap-2">
          
          {/* Home team */}
          <div className="col-span-3 flex flex-col sm:flex-row items-center gap-3 text-center sm:text-left">
            <TeamBadge team={homeTeam} size="md" />
            <div>
              <span className="font-display font-black text-sm sm:text-base text-white uppercase tracking-tight block">
                {homeTeam.name}
              </span>
              <span className="text-[11px] text-[#9EA4AD] font-mono flex items-center justify-center sm:justify-start gap-1 mt-0.5">
                <Shield className="w-3 h-3 text-[#9EA4AD]" />
                {homeTeam.manager_name}
              </span>
            </div>
          </div>

          {/* Center vs or score */}
          <div className="col-span-1 flex flex-col items-center justify-center font-mono">
            {isCompleted ? (
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-badge bg-stadium-950 border border-stadium-750 font-bold text-base sm:text-lg text-white">
                <span className={match.home_score! > match.away_score! ? 'text-gold-400' : ''}>
                  {match.home_score}
                </span>
                <span className="text-[#9EA4AD]">-</span>
                <span className={match.away_score! > match.home_score! ? 'text-gold-400' : ''}>
                  {match.away_score}
                </span>
              </div>
            ) : isLive ? (
              <div className="flex items-center gap-1 px-2 py-0.5 rounded-badge bg-rose-950/40 border border-rose-800 text-rose-400 font-bold text-sm">
                <span>{match.home_score ?? 0}</span>
                <span>:</span>
                <span>{match.away_score ?? 0}</span>
              </div>
            ) : (
              <div className="w-7 h-7 rounded-badge bg-stadium-950 border border-stadium-800 flex items-center justify-center text-[10px] font-bold text-[#9EA4AD]">
                VS
              </div>
            )}
          </div>

          {/* Away team */}
          <div className="col-span-3 flex flex-col sm:flex-row-reverse items-center gap-3 text-center sm:text-right">
            <TeamBadge team={awayTeam} size="md" />
            <div>
              <span className="font-display font-black text-sm sm:text-base text-white uppercase tracking-tight block">
                {awayTeam.name}
              </span>
              <span className="text-[11px] text-[#9EA4AD] font-mono flex items-center justify-center sm:justify-end gap-1 mt-0.5">
                <Shield className="w-3 h-3 text-[#9EA4AD]" />
                {awayTeam.manager_name}
              </span>
            </div>
          </div>

        </div>

        {/* Footer info: Date, Time, Venue */}
        <div className="mt-4 pt-3 border-t border-stadium-800 flex flex-wrap items-center justify-between gap-2 text-[11px] text-[#9EA4AD] font-mono">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3 h-3 text-pitch-500" />
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
            <div className="flex items-center gap-1 text-[#F4F4F0] group-hover:text-gold-400 transition-colors font-bold text-xs">
              <span>Details</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </div>
          )}
        </div>

      </div>
    </motion.div>
  );
};
