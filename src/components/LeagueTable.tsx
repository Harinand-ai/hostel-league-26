import React from 'react';
import { TeamStanding } from '../types/tournament';
import { TeamBadge } from './TeamBadge';
import { ChevronRight, Trophy } from 'lucide-react';

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
    <div className="w-full overflow-hidden rounded-xl bg-white border border-slate-200 shadow-xs">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs sm:text-sm">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500">
              <th className="py-2.5 px-3 text-center w-10">POS</th>
              <th className="py-2.5 px-3 font-bold">CLUB</th>
              <th className="py-2.5 px-2 text-center w-8">P</th>
              {!isCompact && (
                <>
                  <th className="py-2.5 px-2 text-center w-8 hidden sm:table-cell">W</th>
                  <th className="py-2.5 px-2 text-center w-8 hidden sm:table-cell">D</th>
                  <th className="py-2.5 px-2 text-center w-8 hidden sm:table-cell">L</th>
                  <th className="py-2.5 px-2 text-center w-9 hidden md:table-cell">GF</th>
                  <th className="py-2.5 px-2 text-center w-9 hidden md:table-cell">GA</th>
                </>
              )}
              <th className="py-2.5 px-2 text-center w-10">GD</th>
              <th className="py-2.5 px-3 text-center w-12 text-slate-900 font-extrabold">PTS</th>
              {!isCompact && (
                <th className="py-2.5 px-3 text-center hidden lg:table-cell">FORM</th>
              )}
              {onTeamClick && <th className="py-2.5 px-2 w-6"></th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-800">
            {standings.map((row) => {
              const isLeader = row.position === 1;

              return (
                <tr
                  key={row.team.id}
                  onClick={() => onTeamClick && onTeamClick(row.team.id)}
                  className={`transition-colors duration-150 ${
                    onTeamClick ? 'cursor-pointer hover:bg-slate-50' : ''
                  } ${isLeader ? 'bg-amber-50/40' : ''}`}
                >
                  {/* Position */}
                  <td className="py-3 px-3 text-center font-bold">
                    <span
                      className={`inline-flex items-center justify-center w-5 h-5 rounded-full text-xs ${
                        isLeader
                          ? 'bg-amber-500 text-white font-black'
                          : 'text-slate-600'
                      }`}
                    >
                      {row.position}
                    </span>
                  </td>

                  {/* Team */}
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-2.5">
                      <TeamBadge team={row.team} size="sm" />
                      <div className="min-w-0">
                        <span className="font-bold text-slate-900 block text-xs sm:text-sm uppercase tracking-tight truncate">
                          {row.team.name}
                        </span>
                        <span className="text-[10px] text-slate-500 block truncate">
                          {row.team.manager_name}
                        </span>
                      </div>
                      {isLeader && (
                        <Trophy className="w-3.5 h-3.5 text-amber-500 shrink-0 hidden sm:inline" />
                      )}
                    </div>
                  </td>

                  {/* Played */}
                  <td className="py-3 px-2 text-center font-semibold text-slate-900">
                    {row.played}
                  </td>

                  {/* W / D / L / GF / GA */}
                  {!isCompact && (
                    <>
                      <td className="py-3 px-2 text-center text-slate-700 hidden sm:table-cell">
                        {row.won}
                      </td>
                      <td className="py-3 px-2 text-center text-slate-500 hidden sm:table-cell">
                        {row.drawn}
                      </td>
                      <td className="py-3 px-2 text-center text-slate-500 hidden sm:table-cell">
                        {row.lost}
                      </td>
                      <td className="py-3 px-2 text-center text-slate-700 hidden md:table-cell">
                        {row.goals_for}
                      </td>
                      <td className="py-3 px-2 text-center text-slate-500 hidden md:table-cell">
                        {row.goals_against}
                      </td>
                    </>
                  )}

                  {/* Goal Difference */}
                  <td className="py-3 px-2 text-center font-semibold">
                    <span
                      className={
                        row.goal_difference > 0
                          ? 'text-emerald-700'
                          : row.goal_difference < 0
                          ? 'text-rose-600'
                          : 'text-slate-500'
                      }
                    >
                      {row.goal_difference > 0 ? `+${row.goal_difference}` : row.goal_difference}
                    </span>
                  </td>

                  {/* Points */}
                  <td className="py-3 px-3 text-center font-extrabold text-sm text-slate-900">
                    {row.points}
                  </td>

                  {/* Form */}
                  {!isCompact && (
                    <td className="py-3 px-3 text-center hidden lg:table-cell">
                      <div className="flex items-center justify-center gap-1">
                        {row.form.length === 0 ? (
                          <span className="text-slate-400 text-xs">-</span>
                        ) : (
                          row.form.slice(-5).map((res, i) => (
                            <span
                              key={i}
                              className={`w-4 h-4 rounded text-[9px] font-bold flex items-center justify-center ${
                                res === 'W'
                                  ? 'bg-emerald-600 text-white'
                                  : res === 'D'
                                  ? 'bg-slate-400 text-white'
                                  : 'bg-rose-600 text-white'
                              }`}
                            >
                              {res}
                            </span>
                          ))
                        )}
                      </div>
                    </td>
                  )}

                  {/* Arrow Indicator */}
                  {onTeamClick && (
                    <td className="py-3 px-2 text-right">
                      <ChevronRight className="w-4 h-4 text-slate-300" />
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Legend */}
      <div className="px-4 py-2 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
        <span>Win = 3 pts • Draw = 1 pt • Loss = 0 pts</span>
        <span>Points → GD → Goals For</span>
      </div>
    </div>
  );
};
