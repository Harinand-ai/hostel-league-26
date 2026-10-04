import React from 'react';
import { TeamStanding } from '../types/tournament';
import { TeamCard } from '../components/TeamCard';
import { Shield } from 'lucide-react';

interface TeamsPageProps {
  standings: TeamStanding[];
  onNavigate: (tab: string, param?: string) => void;
}

export const TeamsPage: React.FC<TeamsPageProps> = ({
  standings,
  onNavigate,
}) => {
  return (
    <div className="space-y-10">
      
      {/* Header */}
      <div className="pb-6 border-b border-stadium-800">
        <div className="flex items-center gap-2 text-sky-400 text-xs font-mono font-bold uppercase tracking-widest mb-1.5">
          <Shield className="w-3.5 h-3.5" />
          THE SIX CONTENDERS
        </div>
        <h1 className="text-3xl sm:text-5xl font-black font-display tracking-tight text-white uppercase">
          TOURNAMENT CLUBS
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1 font-mono">
          The 6 official clubs competing in Hostel League 26. Select a club to inspect manager profiles, squad roster, and match log.
        </p>
      </div>

      {/* Grid of 6 teams */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {standings.map(standing => (
          <TeamCard
            key={standing.team.id}
            standing={standing}
            onClick={() => onNavigate('team-detail', standing.team.id)}
          />
        ))}
      </div>

    </div>
  );
};
