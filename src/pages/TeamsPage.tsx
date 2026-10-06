import React from 'react';
import { TeamStanding } from '../types/tournament';
import { TeamCard } from '../components/TeamCard';

interface TeamsPageProps {
  standings: TeamStanding[];
  onNavigate: (tab: string, param?: string) => void;
}

export const TeamsPage: React.FC<TeamsPageProps> = ({
  standings,
  onNavigate,
}) => {
  return (
    <div className="space-y-4 max-w-lg mx-auto">
      
      {/* Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight uppercase">
          TOURNAMENT CLUBS
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          The 6 official clubs competing in Hostel League 26
        </p>
      </div>

      {/* Grid of 6 teams */}
      <div className="space-y-3">
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
