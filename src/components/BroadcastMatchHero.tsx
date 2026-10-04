import React from 'react';
import { motion } from 'framer-motion';
import { Match, Team } from '../types/tournament';
import { TeamBadge } from './TeamBadge';
import { Calendar, Clock, MapPin, Shield, ChevronRight, Zap } from 'lucide-react';

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
      className="group relative w-full overflow-hidden rounded-3xl bg-[#090d16] border border-stadium-750 hover:border-stadium-600 transition-all duration-300 shadow-broadcast cursor-pointer"
    >
      {/* Dynamic Team Halo Lighting (Left Home, Right Away) */}
      <div
        className="absolute -top-24 -left-24 w-80 h-80 rounded-full blur-[100px] opacity-25 pointer-events-none transition-opacity group-hover:opacity-40"
        style={{ backgroundColor: homeTeam.primary_color }}
      />
      <div
        className="absolute -top-24 -right-24 w-80 h-80 rounded-full blur-[100px] opacity-25 pointer-events-none transition-opacity group-hover:opacity-40"
        style={{ backgroundColor: awayTeam.primary_color }}
      />

      {/* Field Turf Texture */}
      <div className="absolute inset-0 turf-stripes opacity-40 pointer-events-none" />

      {/* TOP BROADCAST STRIP */}
      <div className="relative z-10 flex items-center justify-between px-6 sm:px-8 py-3.5 bg-stadium-950/80 border-b border-stadium-800/80 text-xs">
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-stadium-850 border border-stadium-700 font-mono text-[11px] font-bold text-gold-400 uppercase tracking-widest">
            <Zap className="w-3 h-3 text-gold-400" />
            FEATURED FIXTURE
          </span>
          <span className="font-mono font-bold text-slate-300 text-xs sm:text-sm">
            ROUND {match.round_number} • MATCH {String(match.match_number).padStart(2, '0')}
          </span>
        </div>

        <div>
          {isLive ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-rose-500/20 text-rose-400 border border-rose-500/40">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
              LIVE BROADCAST
            </span>
          ) : isCompleted ? (
            <span className="px-3 py-1 rounded text-xs font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-mono">
              FINAL SCORE
            </span>
          ) : (
            <span className="px-3 py-1 rounded text-xs font-bold uppercase tracking-wider bg-stadium-850 text-slate-300 border border-stadium-750 font-mono">
              OFFICIAL FIXTURE
            </span>
          )}
        </div>
      </div>

      {/* MAIN BROADCAST SHOWCASE: CLUBS FACING EACH OTHER */}
      <div className="relative z-10 p-6 sm:p-10 md:p-12">
        <div className="grid grid-cols-1 md:grid-cols-11 items-center gap-6 sm:gap-8">
          
          {/* HOME TEAM (Left) */}
          <div className="md:col-span-5 flex flex-col md:flex-row items-center gap-5 text-center md:text-left">
            <motion.div
              whileHover={{ scale: 1.05 }}
              transition={{ type: 'spring', stiffness: 300 }}
              className="shrink-0"
            >
              <TeamBadge team={homeTeam} size="2xl" glow={true} />
            </motion.div>

            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-stadium-850 border border-stadium-700 text-[10px] font-mono font-bold text-slate-300 uppercase">
                HOME CLUB
              </div>
              <h3 className="font-display font-black text-2xl sm:text-3xl lg:text-4xl text-white tracking-tight uppercase group-hover:text-gold-400 transition-colors">
                {homeTeam.name}
              </h3>
              
              {/* Manager Lower-Third */}
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-stadium-950/80 border border-stadium-750 text-xs">
                <Shield className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-slate-400 font-sans text-[11px]">MANAGER:</span>
                <span className="font-bold text-white uppercase">{homeTeam.manager_name}</span>
              </div>
            </div>
          </div>

          {/* CENTER VS OR SCORE (Middle) */}
          <div className="md:col-span-1 flex flex-col items-center justify-center my-2 md:my-0">
            {isCompleted ? (
              <div className="flex flex-col items-center">
                <div className="flex items-center gap-3 px-4 py-2 rounded-xl bg-stadium-950 border border-stadium-700 font-display font-black text-3xl sm:text-4xl text-white shadow-2xl">
                  <span className={match.home_score! > match.away_score! ? 'text-gold-400' : 'text-slate-100'}>
                    {match.home_score}
                  </span>
                  <span className="text-slate-600 font-normal text-2xl">:</span>
                  <span className={match.away_score! > match.home_score! ? 'text-gold-400' : 'text-slate-100'}>
                    {match.away_score}
                  </span>
                </div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-400 font-bold mt-1.5">
                  FULL TIME
                </span>
              </div>
            ) : isLive ? (
              <div className="flex flex-col items-center">
                <div className="flex items-center gap-2 px-4 py-1.5 rounded-xl bg-rose-950/60 border border-rose-800 font-display font-black text-2xl sm:text-3xl text-rose-400">
                  <span>{match.home_score ?? 0}</span>
                  <span className="text-rose-600">-</span>
                  <span>{match.away_score ?? 0}</span>
                </div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-rose-400 font-bold mt-1 animate-pulse">
                  IN PLAY
                </span>
              </div>
            ) : (
              <div className="relative">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-stadium-850 to-stadium-950 border border-stadium-700 flex items-center justify-center shadow-xl group-hover:border-gold-500/50 transition-colors">
                  <span className="font-display font-black text-lg tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-gold-300 to-amber-500">
                    VS
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* AWAY TEAM (Right) */}
          <div className="md:col-span-5 flex flex-col md:flex-row-reverse items-center gap-5 text-center md:text-right">
            <motion.div
              whileHover={{ scale: 1.05 }}
              transition={{ type: 'spring', stiffness: 300 }}
              className="shrink-0"
            >
              <TeamBadge team={awayTeam} size="2xl" glow={true} />
            </motion.div>

            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-stadium-850 border border-stadium-700 text-[10px] font-mono font-bold text-slate-300 uppercase">
                AWAY CLUB
              </div>
              <h3 className="font-display font-black text-2xl sm:text-3xl lg:text-4xl text-white tracking-tight uppercase group-hover:text-gold-400 transition-colors">
                {awayTeam.name}
              </h3>
              
              {/* Manager Lower-Third */}
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-stadium-950/80 border border-stadium-750 text-xs">
                <Shield className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-slate-400 font-sans text-[11px]">MANAGER:</span>
                <span className="font-bold text-white uppercase">{awayTeam.manager_name}</span>
              </div>
            </div>
          </div>

        </div>

        {/* BOTTOM MATCH LOGISTICS TICKER */}
        <div className="mt-8 pt-6 border-t border-stadium-800/80 flex flex-wrap items-center justify-between gap-4 text-xs font-mono text-slate-400">
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
            <span className="flex items-center gap-2">
              <Calendar className="w-3.5 h-3.5 text-emerald-400" />
              {match.scheduled_date ? (
                <span className="text-slate-200 font-bold">{match.scheduled_date}</span>
              ) : (
                <span className="text-slate-400">DATE TBA</span>
              )}
            </span>

            <span className="flex items-center gap-2">
              <Clock className="w-3.5 h-3.5 text-sky-400" />
              {match.scheduled_time ? (
                <span className="text-slate-200 font-bold">{match.scheduled_time}</span>
              ) : (
                <span className="text-slate-400">TIME TBA</span>
              )}
            </span>

            <span className="flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5 text-gold-400" />
              {match.venue ? (
                <span className="text-slate-200 font-bold">{match.venue}</span>
              ) : (
                <span className="text-slate-400">VENUE TBA</span>
              )}
            </span>
          </div>

          <div className="flex items-center gap-1 text-gold-400 font-display font-bold uppercase tracking-wider text-xs group-hover:translate-x-1 transition-transform">
            <span>Match Details</span>
            <ChevronRight className="w-4 h-4" />
          </div>
        </div>

      </div>
    </div>
  );
};
