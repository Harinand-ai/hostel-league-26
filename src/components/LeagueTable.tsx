import React from 'react';
import { TeamStanding } from '../types/tournament';
import { TeamBadge } from './TeamBadge';
import { ChevronRight } from 'lucide-react';

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
    <div className="w-full overflow-hidden rounded-xl bg-stadium-900 border border-stadium-800 shadow-lg">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs sm:text-sm">
          <thead>
            <tr className="bg-stadium-950/80 border-b border-stadium-800 text-[11px] uppercase tracking-wider text-slate-400 font-bold">
              <th className="py-3.5 px-3 sm:px-4 text-center w-10 sm:w-12">POS</th>
              <th className="py-3.5 px-3 sm:px-4">TEAM</th>
              <th className="py-3.5 px-2 sm:px-3 text-center w-10 font-mono">P</th>
              {!isCompact && (
                <>
                  <th className="py-3.5 px-2 sm:px-3 text-center w-10 font-mono hidden sm:table-cell">W</th>
                  <th className="py-3.5 px-2 sm:px-3 text-center w-10 font-mono hidden sm:table-cell">D</th>
                  <th className="py-3.5 px-2 sm:px-3 text-center w-10 font-mono hidden sm:table-cell">L</th>
                  <th className="py-3.5 px-2 sm:px-3 text-center w-12 font-mono hidden md:table-cell">GF</th>
                  <th className="py-3.5 px-2 sm:px-3 text-center w-12 font-mono hidden md:table-cell">GA</th>
                </>
              )}
              <th className="py-3.5 px-2 sm:px-3 text-center w-12 font-mono">GD</th>
              <th className="py-3.5 px-3 sm:px-4 text-center w-14 font-mono text-gold-400 font-black">PTS</th>
              {!isCompact && (
                <th className="py-3.5 px-3 sm:px-4 text-center hidden lg:table-cell">FORM</th>
              )}
              {onTeamClick && <th className="py-3.5 px-2 w-8"></th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-stadium-800/60 font-medium">
            {standings.map((row) => {
              const isLeader = row.position === 1;

              return (
                <tr
                  key={row.team.id}
                  onClick={() => onTeamClick && onTeamClick(row.team.id)}
                  className={`group transition-colors duration-150 ${
                    onTeamClick ? 'cursor-pointer hover:bg-stadium-800/80' : ''
                  } ${isLeader ? 'bg-gold-500/[0.03]' : ''}`}
                >
                  {/* Position */}
                  <td className="py-3 px-3 sm:px-4 text-center">
                    <span
                      className={`inline-flex items-center justify-center w-6 h-6 rounded-md font-display font-black text-xs ${
                        isLeader
                          ? 'bg-gold-500/20 text-gold-400 border border-gold-500/40 shadow-sm'
                          : row.position <= 2
                          ? 'bg-sky-500/20 text-sky-300'
                          : 'text-slate-400'
                      }`}
                    >
                      {row.position}
                    </span>
                  </td>

                  {/* Team */}
                  <td className="py-3 px-3 sm:px-4">
                    <div className="flex items-center gap-2.5">
                      <TeamBadge team={row.team} size="sm" />
                      <div>
                        <span className="font-display font-bold text-slate-100 group-hover:text-gold-400 transition-colors block text-xs sm:text-sm">
                          {row.team.name}
                        </span>
                        <span className="text-[10px] text-slate-400 sm:hidden">
                          Mgr: {row.team.manager_name}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* Matches Played */}
                  <td className="py-3 px-2 sm:px-3 text-center font-mono text-slate-300">
                    {row.played}
                  </td>

                  {/* Wins, Draws, Losses (Full view) */}
                  {!isCompact && (
                    <>
                      <td className="py-3 px-2 sm:px-3 text-center font-mono text-slate-300 hidden sm:table-cell">
                        {row.won}
                      </td>
                      <td className="py-3 px-2 sm:px-3 text-center font-mono text-slate-400 hidden sm:table-cell">
                        {row.drawn}
                      </td>
                      <td className="py-3 px-2 sm:px-3 text-center font-mono text-slate-400 hidden sm:table-cell">
                        {row.lost}
                      </td>
                      <td className="py-3 px-2 sm:px-3 text-center font-mono text-slate-300 hidden md:table-cell">
                        {row.goals_for}
                      </td>
                      <td className="py-3 px-2 sm:px-3 text-center font-mono text-slate-400 hidden md:table-cell">
                        {row.goals_against}
                      </td>
                    </>
                  )}

                  {/* Goal Difference */}
                  <td className="py-3 px-2 sm:px-3 text-center font-mono">
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
                  <td className="py-3 px-3 sm:px-4 text-center font-mono font-black text-sm sm:text-base text-gold-400">
                    {row.points}
                  </td>

                  {/* Form (Recent results) */}
                  {!isCompact && (
                    <td className="py-3 px-3 sm:px-4 text-center hidden lg:table-cell">
                      <div className="flex items-center justify-center gap-1">
                        {row.form.length === 0 ? (
                          <span className="text-[10px] text-slate-400 font-mono">-</span>
                        ) : (
                          row.form.slice(-5).map((res, i) => (
                            <span
                              key={i}
                              className={`w-5 h-5 rounded flex items-center justify-center text-[10px] font-black font-mono ${
                                res === 'W'
                                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                                  : res === 'D'
                                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                                  : 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                              }`}
                            >
                              {res}
                            </span>
                          ))
                        )}
                      </div>
                    </td>
                  )}

                  {/* Click indicator */}
                  {onTeamClick && (
                    <td className="py-3 px-2 text-right">
                      <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-gold-400 group-hover:translate-x-0.5 transition-transform" />
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Table bottom legend */}
      <div className="px-4 py-2.5 bg-stadium-950/80 border-t border-stadium-800/80 flex flex-wrap items-center justify-between text-[11px] text-slate-400">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-gold-400" />
            1st: Tournament Champion
          </span>
          <span className="flex items-center gap-1.5 hidden sm:inline-flex">
            <span className="w-2 h-2 rounded-full bg-sky-400" />
            2nd: Runner-up
          </span>
        </div>
        <span className="font-mono text-[10px]">Points: Win (3) • Draw (1) • Loss (0)</span>
      </div>
    </div>
  );
};
