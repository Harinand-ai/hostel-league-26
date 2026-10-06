import React from 'react';
import { TeamStanding } from '../types/tournament';
import { TeamBadge } from './TeamBadge';
import { ChevronRight, Shield } from 'lucide-react';

interface TeamCardProps {
  standing: TeamStanding;
  onClick: () => void;
}

export const TeamCard: React.FC<TeamCardProps> = ({ standing, onClick }) => {
  const { team } = standing;

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-xl border border-slate-200 p-4 hover:border-slate-300 transition-all cursor-pointer shadow-xs group"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <TeamBadge team={team} size="md" />
          <div>
            <h3 className="font-extrabold text-slate-900 text-sm group-hover:text-green-700 transition-colors">
              {team.name}
            </h3>
            <div className="flex items-center gap-1 text-[11px] text-slate-500 mt-0.5">
              <Shield className="w-3 h-3 text-slate-400" />
              <span>Manager: <strong className="text-slate-700">{team.manager_name}</strong></span>
            </div>
          </div>
        </div>

        <div className="text-right">
          <span className="text-[10px] text-slate-400 uppercase font-bold block">Rank</span>
          <span className="text-base font-black text-slate-900">#{standing.position}</span>
        </div>
      </div>

      {/* Mini Stats Row */}
      <div className="grid grid-cols-4 gap-2 mt-3 pt-3 border-t border-slate-100 text-center text-xs">
        <div>
          <span className="text-[10px] text-slate-400 uppercase block font-bold">P</span>
          <span className="font-semibold text-slate-800">{standing.played}</span>
        </div>
        <div>
          <span className="text-[10px] text-slate-400 uppercase block font-bold">W</span>
          <span className="font-semibold text-green-700">{standing.won}</span>
        </div>
        <div>
          <span className="text-[10px] text-slate-400 uppercase block font-bold">GD</span>
          <span className="font-semibold text-slate-800">
            {standing.goal_difference > 0 ? `+${standing.goal_difference}` : standing.goal_difference}
          </span>
        </div>
        <div>
          <span className="text-[10px] text-slate-400 uppercase block font-bold">PTS</span>
          <span className="font-black text-slate-900">{standing.points}</span>
        </div>
      </div>

      <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
        <span>Squad: 9 Players</span>
        <span className="text-green-700 font-semibold flex items-center gap-0.5">
          Squad Details <ChevronRight className="w-3.5 h-3.5" />
        </span>
      </div>
    </div>
  );
};
