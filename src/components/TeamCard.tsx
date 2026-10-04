import React from 'react';
import { motion } from 'framer-motion';
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
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-20px' }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      onClick={onClick}
      className="group relative rounded-2xl bg-[#090d16] border border-stadium-750 p-6 hover:border-stadium-600 transition-all duration-200 cursor-pointer shadow-broadcast flex flex-col justify-between overflow-hidden"
    >
      {/* Subtle Team Color Light Accent on card */}
      <div
        className="absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl opacity-20 pointer-events-none group-hover:opacity-35 transition-opacity"
        style={{ backgroundColor: team.primary_color }}
      />

      <div>
        {/* Header with crest & position */}
        <div className="flex items-start justify-between">
          <TeamBadge team={team} size="xl" glow={true} />
          <div className="text-right font-mono">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">STANDINGS</span>
            <span className="font-display font-black text-2xl text-gold-400">
              #{standing.position}
            </span>
          </div>
        </div>

        {/* Team & Manager */}
        <div className="mt-5">
          <h3 className="font-display font-black text-2xl text-white group-hover:text-gold-400 transition-colors uppercase tracking-tight">
            {team.name}
          </h3>
          <div className="flex items-center gap-1.5 mt-1.5 text-xs text-slate-300 font-mono">
            <Shield className="w-3.5 h-3.5 text-emerald-400" />
            <span>MANAGER: <strong className="text-white uppercase">{team.manager_name}</strong></span>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-4 gap-2 mt-6 p-3 rounded-xl bg-stadium-950/80 border border-stadium-800 text-center font-mono text-xs">
          <div>
            <span className="text-[10px] text-slate-400 uppercase block font-sans font-bold">P</span>
            <span className="font-bold text-slate-200 text-sm">{standing.played}</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 uppercase block font-sans font-bold">W</span>
            <span className="font-bold text-emerald-400 text-sm">{standing.won}</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 uppercase block font-sans font-bold">GD</span>
            <span className="font-bold text-slate-200 text-sm">
              {standing.goal_difference > 0 ? `+${standing.goal_difference}` : standing.goal_difference}
            </span>
          </div>
          <div>
            <span className="text-[10px] text-gold-400 uppercase block font-sans font-black">PTS</span>
            <span className="font-black text-gold-400 text-base">{standing.points}</span>
          </div>
        </div>
      </div>

      {/* Footer: Form & Action */}
      <div className="mt-6 pt-4 border-t border-stadium-800/80 flex items-center justify-between text-xs font-mono">
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] text-slate-400 uppercase mr-1">FORM:</span>
          {standing.form.length === 0 ? (
            <span className="text-[11px] text-slate-400">-</span>
          ) : (
            standing.form.slice(-3).map((r, i) => (
              <span
                key={i}
                className={`w-5 h-5 rounded text-[10px] font-black font-mono flex items-center justify-center ${
                  r === 'W'
                    ? 'bg-emerald-500/25 text-emerald-300 border border-emerald-500/40'
                    : r === 'D'
                    ? 'bg-amber-500/25 text-amber-300 border border-amber-500/40'
                    : 'bg-rose-500/25 text-rose-300 border border-rose-500/40'
                }`}
              >
                {r}
              </span>
            ))
          )}
        </div>

        <div className="flex items-center gap-1 text-slate-300 group-hover:text-gold-400 font-bold transition-colors">
          <span>Club Profile</span>
          <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </div>
      </div>
    </motion.div>
  );
};
