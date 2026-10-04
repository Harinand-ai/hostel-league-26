import React from 'react';
import { TeamStanding } from '../types/tournament';
import { LeagueTable } from '../components/LeagueTable';
import { Trophy, HelpCircle } from 'lucide-react';

interface TablePageProps {
  standings: TeamStanding[];
  onNavigate: (tab: string, param?: string) => void;
}

export const TablePage: React.FC<TablePageProps> = ({
  standings,
  onNavigate,
}) => {
  return (
    <div className="space-y-8">
      
      {/* Header */}
      <div className="pb-6 border-b border-stadium-800">
        <div className="flex items-center gap-2 text-gold-400 text-xs font-bold uppercase tracking-widest mb-1">
          <Trophy className="w-3.5 h-3.5" />
          Official Standings
        </div>
        <h1 className="text-3xl sm:text-4xl font-black font-display tracking-tight text-white uppercase">
          LEAGUE TABLE
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Dynamically calculated live standings. Points: Win (3), Draw (1), Loss (0). Sorted by Points, then Goal Difference, then Goals For.
        </p>
      </div>

      {/* Main Table */}
      <LeagueTable
        standings={standings}
        onTeamClick={(teamId) => onNavigate('team-detail', teamId)}
        isCompact={false}
      />

      {/* Tournament Rules Info Box */}
      <div className="p-5 rounded-xl bg-stadium-900/60 border border-stadium-800 text-xs text-slate-400 space-y-2">
        <h4 className="font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
          <HelpCircle className="w-4 h-4 text-sky-400" />
          Competition Tie-Breaker Rules
        </h4>
        <ol className="list-decimal list-inside space-y-1 text-slate-400 font-mono text-[11px]">
          <li>Total Points accumulated across 5 rounds</li>
          <li>Superior Goal Difference (GD = GF - GA)</li>
          <li>Highest Goals Scored (GF)</li>
          <li>Head-to-head match result between tied teams</li>
        </ol>
      </div>

    </div>
  );
};
