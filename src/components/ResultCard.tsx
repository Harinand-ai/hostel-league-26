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

  // Animated score counter reveal on mount/view
  const [displayHome, setDisplayHome] = useState(0);
  const [displayAway, setDisplayAway] = useState(0);

  useEffect(() => {
    const finalH = match.home_score ?? 0;
    const finalA = match.away_score ?? 0;
    
    // Quick tick reveal
    const timer = setTimeout(() => {
      setDisplayHome(finalH);
      setDisplayAway(finalA);
    }, 150);

    return () => clearTimeout(timer);
  }, [match.home_score, match.away_score]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-20px' }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      onClick={onClick}
      className="group rounded-2xl bg-[#090d16] border border-stadium-750 hover:border-stadium-600 transition-all duration-200 overflow-hidden shadow-broadcast cursor-pointer hover:bg-stadium-850/80"
    >
      {/* Top Header */}
      <div className="flex items-center justify-between px-5 py-2.5 bg-stadium-950/80 border-b border-stadium-800/80 text-xs">
        <span className="font-mono font-bold text-slate-300">
          ROUND {match.round_number} • MATCH {String(match.match_number).padStart(2, '0')}
        </span>
        <span className="px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-mono">
          FULL TIME
        </span>
      </div>

      {/* Main Score Area */}
      <div className="p-6">
        <div className="grid grid-cols-7 items-center gap-3">
          {/* Home team */}
          <div className="col-span-3 flex flex-col sm:flex-row items-center gap-3.5">
            <TeamBadge team={homeTeam} size="md" />
            <div className="text-center sm:text-left">
              <span className="font-display font-black text-base sm:text-lg text-white group-hover:text-gold-400 transition-colors block uppercase tracking-tight">
                {homeTeam.name}
              </span>
              <span className="text-[11px] text-slate-400 font-mono">
                Mgr: {homeTeam.manager_name}
              </span>
            </div>
          </div>

          {/* Animated Scores */}
          <div className="col-span-1 flex items-center justify-center">
            <div className="px-3.5 py-1.5 rounded-xl bg-stadium-950 border border-stadium-700 font-display font-black text-xl sm:text-2xl text-white shadow-inner flex items-center gap-2 font-mono">
              <motion.span
                key={`h-${displayHome}`}
                initial={{ scale: 1.4, color: '#f59e0b' }}
                animate={{ scale: 1, color: match.home_score! > match.away_score! ? '#f59e0b' : '#ffffff' }}
                transition={{ duration: 0.3 }}
              >
                {displayHome}
              </motion.span>
              <span className="text-slate-600 font-normal text-base">-</span>
              <motion.span
                key={`a-${displayAway}`}
                initial={{ scale: 1.4, color: '#f59e0b' }}
                animate={{ scale: 1, color: match.away_score! > match.home_score! ? '#f59e0b' : '#ffffff' }}
                transition={{ duration: 0.3 }}
              >
                {displayAway}
              </motion.span>
            </div>
          </div>

          {/* Away team */}
          <div className="col-span-3 flex flex-col sm:flex-row-reverse items-center gap-3.5 text-center sm:text-right">
            <TeamBadge team={awayTeam} size="md" />
            <div>
              <span className="font-display font-black text-base sm:text-lg text-white group-hover:text-gold-400 transition-colors block uppercase tracking-tight">
                {awayTeam.name}
              </span>
              <span className="text-[11px] text-slate-400 font-mono">
                Mgr: {awayTeam.manager_name}
              </span>
            </div>
          </div>
        </div>

        {/* Goal events preview */}
        {(homeGoals.length > 0 || awayGoals.length > 0) && (
          <div className="mt-5 pt-3.5 border-t border-stadium-800/80 grid grid-cols-2 gap-4 text-xs font-mono">
            {/* Home Goals */}
            <div className="space-y-1.5">
              {homeGoals.map(g => {
                const p = playersMap.get(g.player_id);
                return (
                  <div key={g.id} className="flex items-center gap-1.5 text-slate-300">
                    <span className="text-emerald-400 font-bold text-[11px]">⚽ {g.minute}'</span>
                    <span className="truncate">{p?.name || 'Goal'}</span>
                  </div>
                );
              })}
            </div>

            {/* Away Goals */}
            <div className="space-y-1.5 text-right">
              {awayGoals.map(g => {
                const p = playersMap.get(g.player_id);
                return (
                  <div key={g.id} className="flex items-center justify-end gap-1.5 text-slate-300">
                    <span className="truncate">{p?.name || 'Goal'}</span>
                    <span className="text-emerald-400 font-bold text-[11px]">⚽ {g.minute}'</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* MOTM and details link */}
        <div className="mt-4 pt-3.5 border-t border-stadium-800/80 flex items-center justify-between text-xs">
          {motmPlayer ? (
            <div className="flex items-center gap-1.5 text-gold-400 font-mono text-[11px]">
              <Award className="w-3.5 h-3.5" />
              <span>MOTM: <strong>{motmPlayer.name}</strong></span>
            </div>
          ) : (
            <div />
          )}

          <div className="flex items-center gap-1 text-slate-400 group-hover:text-gold-400 transition-colors font-bold text-xs ml-auto">
            <span>Match Report</span>
            <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </div>

      </div>
    </motion.div>
  );
};
