import React from 'react';
import { TeamStanding } from '../types/tournament';
import { TeamBadge } from './TeamBadge';
import { ChevronRight, Shield, Award } from 'lucide-react';

interface TeamCardProps {
  standing: TeamStanding;
  onClick: () => void;
}

export const TeamCard: React.FC<TeamCardProps> = ({ standing, onClick }) => {
  const { team } = standing;

  return (
    <div
      onClick={onClick}
      className="group relative rounded-xl bg-stadium-900 border border-stadium-800 p-5 hover:border-stadium-700 hover:bg-stadium-850/80 transition-all duration-200 cursor-pointer shadow-md hover:shadow-xl flex flex-col justify-between"
    >
      <div>
        {/* Header with badge & position */}
        <div className="flex items-start justify-between">
          <TeamBadge team={team} size="lg" />
          <div className="text-right">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Rank</span>
            <span className="font-display font-black text-xl text-gold-400">
              #{standing.position}
            </span>
          </div>
        </div>

        {/* Team & Manager */}
        <div className="mt-4">
          <h3 className="font-display font-black text-xl text-slate-100 group-hover:text-gold-400 transition-colors">
            {team.name}
          </h3>
          <div className="flex items-center gap-1.5 mt-1 text-xs text-slate-400">
            <Shield className="w-3.5 h-3.5 text-slate-400" />
            <span>Manager: <strong className="font-semibold text-slate-300">{team.manager_name}</strong></span>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-4 gap-2 mt-5 p-3 rounded-lg bg-stadium-950/70 border border-stadium-800/60 text-center font-mono text-xs">
          <div>
            <span className="text-[10px] text-slate-400 uppercase block font-sans">Played</span>
            <span className="font-bold text-slate-200">{standing.played}</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 uppercase block font-sans">Won</span>
            <span className="font-bold text-emerald-400">{standing.won}</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 uppercase block font-sans">GD</span>
            <span className="font-bold text-slate-200">
              {standing.goal_difference > 0 ? `+${standing.goal_difference}` : standing.goal_difference}
            </span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 uppercase block font-sans">Points</span>
            <span className="font-black text-gold-400">{standing.points}</span>
          </div>
        </div>
      </div>

      {/* Footer: Form & Action */}
      <div className="mt-5 pt-3 border-t border-stadium-800/70 flex items-center justify-between text-xs">
        <div className="flex items-center gap-1">
          <span className="text-[10px] text-slate-400 uppercase font-sans mr-1">Form:</span>
          {standing.form.length === 0 ? (
            <span className="text-[11px] text-slate-400 font-mono">-</span>
          ) : (
            standing.form.slice(-3).map((r, i) => (
              <span
                key={i}
                className={`w-4 h-4 rounded text-[9px] font-black font-mono flex items-center justify-center ${
                  r === 'W'
                    ? 'bg-emerald-500/20 text-emerald-400'
                    : r === 'D'
                    ? 'bg-amber-500/20 text-amber-400'
                    : 'bg-rose-500/20 text-rose-400'
                }`}
              >
                {r}
              </span>
            ))
          )}
        </div>

        <div className="flex items-center gap-1 text-slate-400 group-hover:text-gold-400 font-semibold transition-colors">
          <span>Squad & Matches</span>
          <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </div>
      </div>
    </div>
  );
};
