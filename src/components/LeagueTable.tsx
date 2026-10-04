import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TeamStanding } from '../types/tournament';
import { TeamBadge } from './TeamBadge';
import { ChevronRight, Crown } from 'lucide-react';

interface LeagueTableProps {
  standings: TeamStanding[];
  onTeamClick?: (teamId: string) => void;
  isCompact?: boolean;
}

export const LeagueTable: React.FC<LeagueTableProps> = ({
  standings,
  onTeamClick,
  isCompact = false,
}) => {
  return (
    <div className="w-full overflow-hidden rounded-2xl bg-[#090d16] border border-stadium-750 shadow-broadcast">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs sm:text-sm">
          <thead>
            <tr className="bg-stadium-950 border-b border-stadium-750 text-[11px] uppercase tracking-wider text-slate-400 font-mono font-bold">
              <th className="py-4 px-3 sm:px-4 text-center w-12 sm:w-14">POS</th>
              <th className="py-4 px-3 sm:px-4">CLUB</th>
              <th className="py-4 px-2 sm:px-3 text-center w-10 font-mono">P</th>
              {!isCompact && (
                <>
                  <th className="py-4 px-2 sm:px-3 text-center w-10 font-mono hidden sm:table-cell">W</th>
                  <th className="py-4 px-2 sm:px-3 text-center w-10 font-mono hidden sm:table-cell">D</th>
                  <th className="py-4 px-2 sm:px-3 text-center w-10 font-mono hidden sm:table-cell">L</th>
                  <th className="py-4 px-2 sm:px-3 text-center w-12 font-mono hidden md:table-cell">GF</th>
                  <th className="py-4 px-2 sm:px-3 text-center w-12 font-mono hidden md:table-cell">GA</th>
                </>
              )}
              <th className="py-4 px-2 sm:px-3 text-center w-12 font-mono">GD</th>
              <th className="py-4 px-3 sm:px-4 text-center w-16 font-mono text-gold-400 font-black text-xs sm:text-sm">PTS</th>
              {!isCompact && (
                <th className="py-4 px-3 sm:px-4 text-center hidden lg:table-cell">FORM</th>
              )}
              {onTeamClick && <th className="py-4 px-2 w-8"></th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-stadium-800/60 font-medium">
            <AnimatePresence>
              {standings.map((row) => {
                const isLeader = row.position === 1;

                return (
                  <motion.tr
                    key={row.team.id}
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ type: 'spring', stiffness: 350, damping: 25 }}
                    onClick={() => onTeamClick && onTeamClick(row.team.id)}
                    className={`group transition-colors duration-150 ${
                      onTeamClick ? 'cursor-pointer hover:bg-stadium-850/80' : ''
                    } ${isLeader ? 'bg-gold-500/[0.04]' : ''}`}
                  >
                    {/* Position */}
                    <td className="py-3.5 px-3 sm:px-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <span
                          className={`inline-flex items-center justify-center w-6 h-6 rounded-md font-display font-black text-xs ${
                            isLeader
                              ? 'bg-gold-500 text-stadium-980 font-black shadow-sm'
                              : row.position === 2
                              ? 'bg-slate-700/60 text-slate-200'
                              : 'text-slate-400 font-mono'
                          }`}
                        >
                          {row.position}
                        </span>
                      </div>
                    </td>

                    {/* Team */}
                    <td className="py-3.5 px-3 sm:px-4">
                      <div className="flex items-center gap-3">
                        <TeamBadge team={row.team} size="sm" />
                        <div>
                          <span className="font-display font-bold text-slate-100 group-hover:text-gold-400 transition-colors block text-xs sm:text-sm tracking-tight">
                            {row.team.name}
                          </span>
                          <span className="text-[10px] text-slate-400 sm:hidden font-mono">
                            Mgr: {row.team.manager_name}
                          </span>
                        </div>
                        {isLeader && (
                          <Crown className="w-3.5 h-3.5 text-gold-400 shrink-0 hidden sm:inline" />
                        )}
                      </div>
                    </td>

                    {/* Played */}
                    <td className="py-3.5 px-2 sm:px-3 text-center font-mono text-slate-300">
                      {row.played}
                    </td>

                    {/* Wins, Draws, Losses (Full view) */}
                    {!isCompact && (
                      <>
                        <td className="py-3.5 px-2 sm:px-3 text-center font-mono text-slate-200 hidden sm:table-cell">
                          {row.won}
                        </td>
                        <td className="py-3.5 px-2 sm:px-3 text-center font-mono text-slate-400 hidden sm:table-cell">
                          {row.drawn}
                        </td>
                        <td className="py-3.5 px-2 sm:px-3 text-center font-mono text-slate-400 hidden sm:table-cell">
                          {row.lost}
                        </td>
                        <td className="py-3.5 px-2 sm:px-3 text-center font-mono text-slate-200 hidden md:table-cell">
                          {row.goals_for}
                        </td>
                        <td className="py-3.5 px-2 sm:px-3 text-center font-mono text-slate-400 hidden md:table-cell">
                          {row.goals_against}
                        </td>
                      </>
                    )}

                    {/* Goal Difference */}
                    <td className="py-3.5 px-2 sm:px-3 text-center font-mono">
                      <span
                        className={`font-semibold ${
                          row.goal_difference > 0
                            ? 'text-emerald-400'
                            : row.goal_difference < 0
                            ? 'text-rose-400'
                            : 'text-slate-400'
                        }`}
                      >
                        {row.goal_difference > 0 ? `+${row.goal_difference}` : row.goal_difference}
                      </span>
                    </td>

                    {/* Points */}
                    <td className="py-3.5 px-3 sm:px-4 text-center font-mono font-black text-sm sm:text-base text-gold-400">
                      {row.points}
                    </td>

                    {/* Form */}
                    {!isCompact && (
                      <td className="py-3.5 px-3 sm:px-4 text-center hidden lg:table-cell">
                        <div className="flex items-center justify-center gap-1.5">
                          {row.form.length === 0 ? (
                            <span className="text-[10px] text-slate-400 font-mono">-</span>
                          ) : (
                            row.form.slice(-5).map((res, i) => (
                              <span
                                key={i}
                                className={`w-5 h-5 rounded flex items-center justify-center text-[10px] font-black font-mono shadow-sm ${
                                  res === 'W'
                                    ? 'bg-emerald-500/25 text-emerald-300 border border-emerald-500/50'
                                    : res === 'D'
                                    ? 'bg-amber-500/25 text-amber-300 border border-amber-500/50'
                                    : 'bg-rose-500/25 text-rose-300 border border-rose-500/50'
                                }`}
                              >
                                {res}
                              </span>
                            ))
                          )}
                        </div>
                      </td>
                    )}

                    {/* Indicator */}
                    {onTeamClick && (
                      <td className="py-3.5 px-2 text-right">
                        <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-gold-400 group-hover:translate-x-0.5 transition-transform" />
                      </td>
                    )}
                  </motion.tr>
                );
              })}
            </AnimatePresence>
          </tbody>
        </table>
      </div>

      {/* Legend Footer */}
      <div className="px-5 py-3 bg-stadium-950 border-t border-stadium-800 flex flex-wrap items-center justify-between text-[11px] text-slate-400 font-mono">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-gold-400" />
            1st Place: Tournament Winner
          </span>
          <span className="flex items-center gap-1.5 hidden sm:inline-flex">
            <span className="w-2 h-2 rounded-full bg-slate-500" />
            2nd–6th: Single Round-Robin
          </span>
        </div>
        <span>Tie-Breaker: Points → Goal Difference → Goals For</span>
      </div>
    </div>
  );
};
