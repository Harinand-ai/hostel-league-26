import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
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

  // Animated score counter reveal
  const [displayHome, setDisplayHome] = useState(0);
  const [displayAway, setDisplayAway] = useState(0);

  useEffect(() => {
    const finalH = match.home_score ?? 0;
    const finalA = match.away_score ?? 0;
    
    const timer = setTimeout(() => {
      setDisplayHome(finalH);
      setDisplayAway(finalA);
    }, 150);

    return () => clearTimeout(timer);
  }, [match.home_score, match.away_score]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-20px' }}
      transition={{ duration: 0.3 }}
      onClick={onClick}
      className="group rounded-card bg-stadium-900 border border-stadium-800 hover:border-stadium-700 transition-colors shadow-broadcast cursor-pointer hover:bg-stadium-850"
    >
      {/* Top Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-stadium-950 border-b border-stadium-800 text-xs font-mono">
        <span className="font-bold text-[#9EA4AD]">
          ROUND {match.round_number} • MATCH {String(match.match_number).padStart(2, '0')}
        </span>
        <span className="px-2 py-0.5 rounded-badge text-[10px] font-bold uppercase tracking-wider bg-pitch-600/20 text-pitch-400 border border-pitch-600/30">
          FULL TIME
        </span>
      </div>

      {/* Main Score Area */}
      <div className="p-4 sm:p-5">
        <div className="grid grid-cols-7 items-center gap-2">
          {/* Home team */}
          <div className="col-span-3 flex flex-col sm:flex-row items-center gap-3">
            <TeamBadge team={homeTeam} size="md" />
            <div className="text-center sm:text-left">
              <span className="font-display font-black text-sm sm:text-base text-white group-hover:text-gold-400 transition-colors block uppercase tracking-tight">
                {homeTeam.name}
              </span>
              <span className="text-[11px] text-[#9EA4AD] font-mono">
                Mgr: {homeTeam.manager_name}
              </span>
            </div>
          </div>

          {/* Animated Scores */}
          <div className="col-span-1 flex items-center justify-center font-mono">
            <div className="px-3 py-1 rounded-badge bg-stadium-950 border border-stadium-750 font-bold text-lg sm:text-xl text-white shadow-inner flex items-center gap-1.5">
              <span className={match.home_score! > match.away_score! ? 'text-gold-400' : 'text-white'}>
                {displayHome}
              </span>
              <span className="text-[#9EA4AD] font-normal text-sm">-</span>
              <span className={match.away_score! > match.home_score! ? 'text-gold-400' : 'text-white'}>
                {displayAway}
              </span>
            </div>
          </div>

          {/* Away team */}
          <div className="col-span-3 flex flex-col sm:flex-row-reverse items-center gap-3 text-center sm:text-right">
            <TeamBadge team={awayTeam} size="md" />
            <div>
              <span className="font-display font-black text-sm sm:text-base text-white group-hover:text-gold-400 transition-colors block uppercase tracking-tight">
                {awayTeam.name}
              </span>
              <span className="text-[11px] text-[#9EA4AD] font-mono">
                Mgr: {awayTeam.manager_name}
              </span>
            </div>
          </div>
        </div>

        {/* Goal events preview */}
        {(homeGoals.length > 0 || awayGoals.length > 0) && (
          <div className="mt-4 pt-3 border-t border-stadium-800 grid grid-cols-2 gap-3 text-xs font-mono">
            {/* Home Goals */}
            <div className="space-y-1">
              {homeGoals.map(g => {
                const p = playersMap.get(g.player_id);
                return (
                  <div key={g.id} className="flex items-center gap-1.5 text-slate-300">
                    <span className="text-pitch-500 font-bold text-[11px]">⚽ {g.minute}'</span>
                    <span className="truncate">{p?.name || 'Goal'}</span>
                  </div>
                );
              })}
            </div>

            {/* Away Goals */}
            <div className="space-y-1 text-right">
              {awayGoals.map(g => {
                const p = playersMap.get(g.player_id);
                return (
                  <div key={g.id} className="flex items-center justify-end gap-1.5 text-slate-300">
                    <span className="truncate">{p?.name || 'Goal'}</span>
                    <span className="text-pitch-500 font-bold text-[11px]">⚽ {g.minute}'</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* MOTM and details link */}
        <div className="mt-3.5 pt-3 border-t border-stadium-800 flex items-center justify-between text-xs font-mono">
          {motmPlayer ? (
            <div className="flex items-center gap-1.5 text-gold-400 text-[11px]">
              <Award className="w-3.5 h-3.5" />
              <span>MOTM: <strong>{motmPlayer.name}</strong></span>
            </div>
          ) : (
            <div />
          )}

          <div className="flex items-center gap-1 text-[#9EA4AD] group-hover:text-gold-400 transition-colors font-bold text-xs ml-auto">
            <span>Match Report</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </div>
        </div>

      </div>
    </motion.div>
  );
};
