import React from 'react';
import { Match, Team } from '../types/tournament';
import { TeamBadge } from './TeamBadge';
import { Calendar, Clock, MapPin, ChevronRight, Zap } from 'lucide-react';

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
      className="group relative w-full overflow-hidden rounded-card bg-stadium-900 border border-stadium-800 hover:border-stadium-700 transition-colors cursor-pointer shadow-broadcast"
    >
      {/* Subtle Team Color Lighting Behind Respective Sides (Restrained, not giant glowing halos) */}
      <div
        className="absolute top-0 left-0 w-1/3 h-full opacity-10 pointer-events-none"
        style={{
          background: `linear-gradient(to right, ${homeTeam.primary_color}, transparent)`,
        }}
      />
      <div
        className="absolute top-0 right-0 w-1/3 h-full opacity-10 pointer-events-none"
        style={{
          background: `linear-gradient(to left, ${awayTeam.primary_color}, transparent)`,
        }}
      />

      {/* TOP BROADCAST STRIP */}
      <div className="relative z-10 flex items-center justify-between px-6 py-3 bg-stadium-950/90 border-b border-stadium-800 text-xs font-mono">
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-badge bg-stadium-850 border border-stadium-750 text-[10px] font-bold text-pitch-500 uppercase tracking-widest">
            <Zap className="w-3 h-3 text-pitch-500" />
            FEATURED FIXTURE
          </span>
          <span className="font-bold text-[#F4F4F0]">
            ROUND {String(match.round_number).padStart(2, '0')} • MATCH {String(match.match_number).padStart(2, '0')}
          </span>
        </div>

        <div>
          {isLive ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-badge text-[10px] font-black uppercase tracking-wider bg-rose-500/15 text-rose-400 border border-rose-500/30">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" />
              LIVE
            </span>
          ) : isCompleted ? (
            <span className="px-2.5 py-0.5 rounded-badge text-[10px] font-bold uppercase tracking-wider bg-pitch-600/20 text-pitch-400 border border-pitch-600/30 font-mono">
              FINAL SCORE
            </span>
          ) : (
            <span className="px-2.5 py-0.5 rounded-badge text-[10px] font-bold uppercase tracking-wider bg-stadium-850 text-[#9EA4AD] border border-stadium-750 font-mono">
              OFFICIAL FIXTURE
            </span>
          )}
        </div>
      </div>

      {/* MAIN BROADCAST SHOWCASE: CLUBS FACING EACH OTHER */}
      <div className="relative z-10 p-6 sm:p-8 md:p-10">
        <div className="grid grid-cols-1 md:grid-cols-11 items-center gap-6">
          
          {/* HOME TEAM (Left) */}
          <div className="md:col-span-5 flex flex-col md:flex-row items-center gap-4 text-center md:text-left">
            <div className="shrink-0">
              <TeamBadge team={homeTeam} size="xl" glow={true} />
            </div>

            <div>
              <span className="text-[10px] font-mono tracking-widest text-[#9EA4AD] uppercase block">
                HOME CLUB
              </span>
              <h3 className="font-display font-black text-2xl sm:text-3xl text-white uppercase tracking-tight">
                {homeTeam.name}
              </h3>
              
              {/* Manager Lower-Third */}
              <div className="mt-2 text-xs font-mono text-[#9EA4AD]">
                <span>MANAGER: </span>
                <strong className="text-white uppercase">{homeTeam.manager_name}</strong>
              </div>
            </div>
          </div>

          {/* CENTER VS OR SCORE (Middle) */}
          <div className="md:col-span-1 flex flex-col items-center justify-center my-1 md:my-0">
            {isCompleted ? (
              <div className="flex flex-col items-center font-mono">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-badge bg-stadium-950 border border-stadium-750 font-display font-black text-2xl text-white shadow-inner">
                  <span className={match.home_score! > match.away_score! ? 'text-gold-400' : 'text-white'}>
                    {match.home_score}
                  </span>
                  <span className="text-[#9EA4AD] text-lg font-normal">:</span>
                  <span className={match.away_score! > match.home_score! ? 'text-gold-400' : 'text-white'}>
                    {match.away_score}
                  </span>
                </div>
                <span className="text-[10px] uppercase tracking-widest text-pitch-500 font-bold mt-1">
                  FULL TIME
                </span>
              </div>
            ) : isLive ? (
              <div className="flex flex-col items-center font-mono">
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-badge bg-rose-950/40 border border-rose-800 text-rose-400 font-display font-black text-2xl">
                  <span>{match.home_score ?? 0}</span>
                  <span>-</span>
                  <span>{match.away_score ?? 0}</span>
                </div>
                <span className="text-[10px] uppercase tracking-widest text-rose-400 font-bold mt-1">
                  IN PLAY
                </span>
              </div>
            ) : (
              <div className="w-10 h-10 rounded-badge bg-stadium-950 border border-stadium-800 flex items-center justify-center text-xs font-mono font-bold tracking-widest text-[#9EA4AD]">
                VS
              </div>
            )}
          </div>

          {/* AWAY TEAM (Right) */}
          <div className="md:col-span-5 flex flex-col md:flex-row-reverse items-center gap-4 text-center md:text-right">
            <div className="shrink-0">
              <TeamBadge team={awayTeam} size="xl" glow={true} />
            </div>

            <div>
              <span className="text-[10px] font-mono tracking-widest text-[#9EA4AD] uppercase block">
                AWAY CLUB
              </span>
              <h3 className="font-display font-black text-2xl sm:text-3xl text-white uppercase tracking-tight">
                {awayTeam.name}
              </h3>
              
              {/* Manager Lower-Third */}
              <div className="mt-2 text-xs font-mono text-[#9EA4AD]">
                <span>MANAGER: </span>
                <strong className="text-white uppercase">{awayTeam.manager_name}</strong>
              </div>
            </div>
          </div>

        </div>

        {/* BOTTOM MATCH LOGISTICS */}
        <div className="mt-6 pt-4 border-t border-stadium-800 flex flex-wrap items-center justify-between gap-3 text-xs font-mono text-[#9EA4AD]">
          <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-pitch-500" />
              {match.scheduled_date ? (
                <span className="text-white font-bold">{match.scheduled_date}</span>
              ) : (
                <span>DATE TBA</span>
              )}
            </span>

            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-sky-400" />
              {match.scheduled_time ? (
                <span className="text-white font-bold">{match.scheduled_time}</span>
              ) : (
                <span>TIME TBA</span>
              )}
            </span>

            <span className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-gold-400" />
              {match.venue ? (
                <span className="text-white font-bold">{match.venue}</span>
              ) : (
                <span>VENUE TBA</span>
              )}
            </span>
          </div>

          <div className="flex items-center gap-1 text-[#F4F4F0] group-hover:text-gold-400 font-bold text-xs transition-colors">
            <span>Match Details</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </div>
        </div>

      </div>
    </div>
  );
};
