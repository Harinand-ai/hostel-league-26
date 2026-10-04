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
    <div className="w-full overflow-hidden rounded-card bg-stadium-900 border border-stadium-800 shadow-broadcast">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs sm:text-sm font-mono">
          <thead>
            <tr className="bg-stadium-950 border-b border-stadium-800 text-[11px] uppercase tracking-wider text-[#9EA4AD]">
              <th className="py-3 px-3 sm:px-4 text-center w-12">POS</th>
              <th className="py-3 px-3 sm:px-4 font-sans font-bold">CLUB</th>
              <th className="py-3 px-2 sm:px-3 text-center w-10">P</th>
              {!isCompact && (
                <>
                  <th className="py-3 px-2 sm:px-3 text-center w-10 hidden sm:table-cell">W</th>
                  <th className="py-3 px-2 sm:px-3 text-center w-10 hidden sm:table-cell">D</th>
                  <th className="py-3 px-2 sm:px-3 text-center w-10 hidden sm:table-cell">L</th>
                  <th className="py-3 px-2 sm:px-3 text-center w-12 hidden md:table-cell">GF</th>
                  <th className="py-3 px-2 sm:px-3 text-center w-12 hidden md:table-cell">GA</th>
                </>
              )}
              <th className="py-3 px-2 sm:px-3 text-center w-12">GD</th>
              <th className="py-3 px-3 sm:px-4 text-center w-16 text-gold-400 font-bold">PTS</th>
              {!isCompact && (
                <th className="py-3 px-3 sm:px-4 text-center hidden lg:table-cell">FORM</th>
              )}
              {onTeamClick && <th className="py-3 px-2 w-8"></th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-stadium-800/70 font-medium">
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
                      onTeamClick ? 'cursor-pointer hover:bg-stadium-850' : ''
                    } ${isLeader ? 'bg-gold-500/[0.04]' : ''}`}
                  >
                    {/* Position */}
                    <td className="py-3 px-3 sm:px-4 text-center">
                      <span
                        className={`inline-flex items-center justify-center w-6 h-6 rounded-badge text-xs font-bold ${
                          isLeader
                            ? 'bg-gold-500 text-stadium-980'
                            : 'text-[#9EA4AD]'
                        }`}
                      >
                        {row.position}
                      </span>
                    </td>

                    {/* Team */}
                    <td className="py-3 px-3 sm:px-4">
                      <div className="flex items-center gap-3">
                        <TeamBadge team={row.team} size="sm" />
                        <div>
                          <span className="font-display font-bold text-white group-hover:text-gold-400 transition-colors block text-xs sm:text-sm uppercase">
                            {row.team.name}
                          </span>
                          <span className="text-[10px] text-[#9EA4AD] sm:hidden">
                            Mgr: {row.team.manager_name}
                          </span>
                        </div>
                        {isLeader && (
                          <Crown className="w-3.5 h-3.5 text-gold-400 shrink-0 hidden sm:inline" />
                        )}
                      </div>
                    </td>

                    {/* Played */}
                    <td className="py-3 px-2 sm:px-3 text-center text-[#F4F4F0]">
                      {row.played}
                    </td>

                    {/* Full stats */}
                    {!isCompact && (
                      <>
                        <td className="py-3 px-2 sm:px-3 text-center text-[#F4F4F0] hidden sm:table-cell">
                          {row.won}
                        </td>
                        <td className="py-3 px-2 sm:px-3 text-center text-[#9EA4AD] hidden sm:table-cell">
                          {row.drawn}
                        </td>
                        <td className="py-3 px-2 sm:px-3 text-center text-[#9EA4AD] hidden sm:table-cell">
                          {row.lost}
                        </td>
                        <td className="py-3 px-2 sm:px-3 text-center text-[#F4F4F0] hidden md:table-cell">
                          {row.goals_for}
                        </td>
                        <td className="py-3 px-2 sm:px-3 text-center text-[#9EA4AD] hidden md:table-cell">
                          {row.goals_against}
                        </td>
                      </>
                    )}

                    {/* Goal Difference */}
                    <td className="py-3 px-2 sm:px-3 text-center">
                      <span
                        className={
                          row.goal_difference > 0
                            ? 'text-pitch-500 font-bold'
                            : row.goal_difference < 0
                            ? 'text-rose-400 font-bold'
                            : 'text-[#9EA4AD]'
                        }
                      >
                        {row.goal_difference > 0 ? `+${row.goal_difference}` : row.goal_difference}
                      </span>
                    </td>

                    {/* Points */}
                    <td className="py-3 px-3 sm:px-4 text-center font-bold text-sm text-gold-400">
                      {row.points}
                    </td>

                    {/* Form */}
                    {!isCompact && (
                      <td className="py-3 px-3 sm:px-4 text-center hidden lg:table-cell">
                        <div className="flex items-center justify-center gap-1">
                          {row.form.length === 0 ? (
                            <span className="text-[10px] text-[#9EA4AD]">-</span>
                          ) : (
                            row.form.slice(-5).map((res, i) => (
                              <span
                                key={i}
                                className={`w-5 h-5 rounded-badge text-[10px] font-bold flex items-center justify-center ${
                                  res === 'W'
                                    ? 'bg-pitch-600/20 text-pitch-400 border border-pitch-600/40'
                                    : res === 'D'
                                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                                    : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
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
                      <td className="py-3 px-2 text-right">
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

      {/* Legend */}
      <div className="px-4 py-2.5 bg-stadium-950 border-t border-stadium-800 flex flex-wrap items-center justify-between text-[11px] text-[#9EA4AD] font-mono">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-gold-400" />
            1st Place: Tournament Winner
          </span>
        </div>
        <span>Tie-Breakers: Points → Goal Difference → Goals For</span>
      </div>
    </div>
  );
};
