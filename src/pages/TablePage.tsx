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
    <div className="space-y-10">
      
      {/* Header */}
      <div className="pb-6 border-b border-stadium-800">
        <div className="flex items-center gap-2 text-gold-400 text-xs font-mono font-bold uppercase tracking-widest mb-1.5">
          <Trophy className="w-3.5 h-3.5" />
          OFFICIAL LEAGUE STANDINGS
        </div>
        <h1 className="text-3xl sm:text-5xl font-black font-display tracking-tight text-white uppercase">
          CHAMPIONSHIP TABLE
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1 font-mono">
          Dynamic real-time standings calculated automatically from verified full-time results. Win (3 Pts), Draw (1 Pt), Loss (0 Pts).
        </p>
      </div>

      {/* Main Table */}
      <LeagueTable
        standings={standings}
        onTeamClick={(teamId) => onNavigate('team-detail', teamId)}
        isCompact={false}
      />

      {/* Competition Rules Info Box */}
      <div className="p-6 rounded-2xl bg-[#090d16] border border-stadium-750 text-xs text-slate-400 space-y-3 font-mono">
        <h4 className="font-display font-black text-sm text-white uppercase tracking-tight flex items-center gap-2">
          <HelpCircle className="w-4 h-4 text-emerald-400" />
          Competition Tie-Breaker Hierarchy
        </h4>
        <ol className="list-decimal list-inside space-y-1.5 text-slate-300 text-xs">
          <li>Total Competition Points accumulated across 5 rounds</li>
          <li>Superior Goal Difference (GD = GF - GA)</li>
          <li>Highest Goals Scored (GF)</li>
          <li>Head-to-head match result between tied clubs</li>
        </ol>
      </div>

    </div>
  );
};
