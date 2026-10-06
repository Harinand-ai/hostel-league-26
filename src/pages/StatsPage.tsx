import React, { useState } from 'react';
import { PlayerStatEntry, Team, Match, TeamStanding, Player } from '../types/tournament';
import { TeamBadge } from '../components/TeamBadge';
import { PlayerAvatar } from '../components/PlayerAvatar';
import { Trophy, Award, Shield, Flame, ChevronRight } from 'lucide-react';

interface StatsPageProps {
  topScorers: PlayerStatEntry[];
  topAssists?: any[]; // Ignored / removed
  cleanSheets: PlayerStatEntry[];
  motmLeaderboard: PlayerStatEntry[];
  teams: Team[];
  matches: Match[];
  standings: TeamStanding[];
  players?: Player[];
  onNavigate: (tab: string, param?: string) => void;
  onSelectPlayer?: (playerId: string) => void;
}

export const StatsPage: React.FC<StatsPageProps> = ({
  topScorers,
  cleanSheets,
  motmLeaderboard,
  teams,
  standings,
  players = [],
  onNavigate,
  onSelectPlayer,
}) => {
  const [activeTab, setActiveTab] = useState<'table' | 'scorers' | 'team-goals' | 'motm' | 'cleansheets'>('table');
  const playersMap = new Map(players.map(p => [p.id, p]));

  // Team goals sorted
  const teamGoalsList = [...standings].sort((a, b) => b.goals_for - a.goals_for || a.team.name.localeCompare(b.team.name));

  return (
    <div className="space-y-4 max-w-lg mx-auto">
      
      {/* Header & Tabs */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight uppercase">
          TOURNAMENT STATS & STANDINGS
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Official league table, top scorers, POTM awards, and records
        </p>

        {/* Tab Pills */}
        <div className="flex items-center gap-1 overflow-x-auto mt-3 pt-2 border-t border-slate-100">
          {[
            { id: 'table', label: 'Table' },
            { id: 'scorers', label: 'Top Scorers' },
            { id: 'team-goals', label: 'Team Goals' },
            { id: 'motm', label: 'POTM' },
            { id: 'cleansheets', label: 'Clean Sheets' },
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id as any)}
              className={`px-2.5 py-1 rounded text-xs font-bold uppercase transition-colors shrink-0 cursor-pointer ${
                activeTab === t.id
                  ? 'bg-green-700 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* 1. LEAGUE TABLE */}
      {activeTab === 'table' && (
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
              <Trophy className="w-3.5 h-3.5 text-green-700" />
              <span>OFFICIAL LEAGUE STANDINGS</span>
            </h2>
            <span className="text-[10px] text-slate-400 font-semibold">
              Win = 3 • Draw = 1 • Loss = 0
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="text-[11px] font-bold text-slate-400 border-b border-slate-100">
                  <th className="py-2 w-6">#</th>
                  <th className="py-2">Club</th>
                  <th className="py-2 text-center w-7">P</th>
                  <th className="py-2 text-center w-7">W</th>
                  <th className="py-2 text-center w-7">D</th>
                  <th className="py-2 text-center w-7">L</th>
                  <th className="py-2 text-center w-7">GF</th>
                  <th className="py-2 text-center w-7">GA</th>
                  <th className="py-2 text-center w-8">GD</th>
                  <th className="py-2 text-center w-8 font-black text-slate-900">Pts</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {standings.map(s => (
                  <tr
                    key={s.team.id}
                    onClick={() => onNavigate('team-detail', s.team.id)}
                    className="hover:bg-slate-50 cursor-pointer transition-colors"
                  >
                    <td className="py-2.5 font-bold text-slate-400">{s.position}</td>
                    <td className="py-2.5">
                      <div className="flex items-center gap-2">
                        <TeamBadge team={s.team} size="xs" />
                        <span className="font-semibold text-slate-900 truncate max-w-[110px] sm:max-w-none">
                          {s.team.name}
                        </span>
                      </div>
                    </td>
                    <td className="py-2.5 text-center text-slate-600">{s.played}</td>
                    <td className="py-2.5 text-center text-slate-600">{s.won}</td>
                    <td className="py-2.5 text-center text-slate-600">{s.drawn}</td>
                    <td className="py-2.5 text-center text-slate-600">{s.lost}</td>
                    <td className="py-2.5 text-center text-slate-600">{s.goals_for}</td>
                    <td className="py-2.5 text-center text-slate-600">{s.goals_against}</td>
                    <td className="py-2.5 text-center text-slate-600">
                      {s.goal_difference > 0 ? `+${s.goal_difference}` : s.goal_difference}
                    </td>
                    <td className="py-2.5 text-center font-black text-slate-900">{s.points}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 2. TOP SCORERS */}
      {activeTab === 'scorers' && (
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
          <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-slate-100">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
              <Flame className="w-3.5 h-3.5 text-green-700" />
              <span>TOP SCORERS</span>
            </h2>
            <span className="text-[10px] text-slate-400 font-semibold">
              Updated from match results
            </span>
          </div>

          {topScorers.length === 0 ? (
            <p className="text-xs text-slate-500 py-3 text-center">
              No goals recorded yet.
            </p>
          ) : (
            <div className="space-y-1.5">
              {topScorers.map((entry, idx) => {
                const player = playersMap.get(entry.player_id);
                return (
                  <div
                    key={entry.player_id}
                    onClick={() => onSelectPlayer?.(entry.player_id)}
                    className="flex items-center justify-between p-2.5 rounded-lg border border-slate-100 hover:bg-slate-50 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-5 text-center font-bold text-xs text-slate-400">
                        {idx + 1}
                      </span>
                      {player && (
                        <PlayerAvatar player={player} team={entry.team} size="sm" />
                      )}
                      <div>
                        <span className="font-bold text-xs text-slate-900 block">
                          {entry.player_name}
                        </span>
                        <span className="text-[10px] text-slate-500">
                          {entry.team.name}
                        </span>
                      </div>
                    </div>

                    <div className="text-right flex items-center gap-1">
                      <span className="text-base font-black text-green-700">
                        {entry.value}
                      </span>
                      <span className="text-[11px] text-slate-400">goals</span>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-300 ml-1" />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* 3. TEAM GOALS */}
      {activeTab === 'team-goals' && (
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
          <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-slate-100">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900">
              TEAM GOALS SCORED
            </h2>
          </div>

          <div className="space-y-1.5">
            {teamGoalsList.map((s, idx) => (
              <div
                key={s.team.id}
                onClick={() => onNavigate('team-detail', s.team.id)}
                className="flex items-center justify-between p-2.5 rounded-lg border border-slate-100 hover:bg-slate-50 cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="w-5 text-center font-bold text-xs text-slate-400">
                    {idx + 1}
                  </span>
                  <TeamBadge team={s.team} size="sm" />
                  <div>
                    <span className="font-bold text-xs text-slate-900 block">
                      {s.team.name}
                    </span>
                    <span className="text-[10px] text-slate-500">
                      Mgr: {s.team.manager_name}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-base font-black text-slate-900">
                    {s.goals_for}
                  </span>
                  <span className="text-[11px] text-slate-400 ml-1">goals</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. PLAYER OF THE MATCH (POTM) HONORS */}
      {activeTab === 'motm' && (
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
          <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-slate-100">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5 text-amber-600" />
              <span>MAN OF THE MATCH HONORS</span>
            </h2>
          </div>

          {motmLeaderboard.length === 0 ? (
            <p className="text-xs text-slate-500 py-3 text-center">
              No POTM awards recorded yet.
            </p>
          ) : (
            <div className="space-y-1.5">
              {motmLeaderboard.map((entry, idx) => {
                const player = playersMap.get(entry.player_id);
                return (
                  <div
                    key={entry.player_id}
                    onClick={() => onSelectPlayer?.(entry.player_id)}
                    className="flex items-center justify-between p-2.5 rounded-lg border border-slate-100 hover:bg-slate-50 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-5 text-center font-bold text-xs text-slate-400">
                        {idx + 1}
                      </span>
                      {player && (
                        <PlayerAvatar player={player} team={entry.team} size="sm" />
                      )}
                      <div>
                        <span className="font-bold text-xs text-slate-900 block">
                          {entry.player_name}
                        </span>
                        <span className="text-[10px] text-slate-500">
                          {entry.team.name}
                        </span>
                      </div>
                    </div>

                    <div className="text-right flex items-center gap-1">
                      <span className="text-base font-black text-amber-600">
                        {entry.value}
                      </span>
                      <span className="text-[11px] text-slate-400">awards</span>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-300 ml-1" />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* 5. CLEAN SHEETS */}
      {activeTab === 'cleansheets' && (
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
          <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-slate-100">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-green-700" />
              <span>CLEAN SHEETS</span>
            </h2>
            <span className="text-[10px] text-slate-400 font-semibold">
              Goalkeepers with zero goals conceded
            </span>
          </div>

          {cleanSheets.length === 0 ? (
            <p className="text-xs text-slate-500 py-3 text-center">
              No clean sheets recorded yet.
            </p>
          ) : (
            <div className="space-y-1.5">
              {cleanSheets.map((entry, idx) => {
                const player = playersMap.get(entry.player_id);
                return (
                  <div
                    key={entry.player_id}
                    onClick={() => onSelectPlayer?.(entry.player_id)}
                    className="flex items-center justify-between p-2.5 rounded-lg border border-slate-100 hover:bg-slate-50 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-5 text-center font-bold text-xs text-slate-400">
                        {idx + 1}
                      </span>
                      {player && (
                        <PlayerAvatar player={player} team={entry.team} size="sm" />
                      )}
                      <div>
                        <span className="font-bold text-xs text-slate-900 block">
                          {entry.player_name}
                        </span>
                        <span className="text-[10px] text-slate-500">
                          {entry.team.name}
                        </span>
                      </div>
                    </div>

                    <div className="text-right flex items-center gap-1">
                      <span className="text-base font-black text-green-700">
                        {entry.value}
                      </span>
                      <span className="text-[11px] text-slate-400">shutouts</span>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-300 ml-1" />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

    </div>
  );
};
