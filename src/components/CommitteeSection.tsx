import React from 'react';
import { Phone, Users, Shield, ArrowUpRight } from 'lucide-react';
import { CommitteeMember } from '../types/tournament';
import { INITIAL_COMMITTEE } from '../data/initialData';

interface CommitteeSectionProps {
  committee?: CommitteeMember[];
  className?: string;
}

export const CommitteeSection: React.FC<CommitteeSectionProps> = ({
  committee = INITIAL_COMMITTEE,
  className = '',
}) => {
  return (
    <section className={`space-y-4 ${className}`}>
      {/* Section Header */}
      <div className="flex items-center justify-between pb-2 border-b border-stadium-800">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-gold-400 animate-pulse" />
          <h2 className="text-xs font-mono font-bold uppercase tracking-widest text-[#F4F4F0]">
            TOURNAMENT COMMITTEE
          </h2>
        </div>
        <span className="text-[10px] font-mono text-[#9EA4AD] uppercase tracking-wider">
          OFFICIAL COORDINATORS
        </span>
      </div>

      {/* Grid of 3 Coordinators */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {committee.map((member) => (
          <div
            key={member.id}
            className="group relative overflow-hidden rounded-2xl bg-[#090d16] border border-stadium-750 p-5 sm:p-6 transition-all hover:border-gold-500/40 hover:bg-[#0c121e] shadow-broadcast flex flex-col justify-between"
          >
            {/* Top decorative accent */}
            <div className="flex items-start justify-between">
              <div className="w-10 h-10 rounded-xl bg-gold-500/10 border border-gold-500/30 flex items-center justify-center text-gold-400">
                <Users className="w-5 h-5" />
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-stadium-850 text-gold-400 border border-gold-500/20">
                {member.role}
              </span>
            </div>

            {/* Coordinator Info */}
            <div className="mt-4">
              <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400 block">
                ORGANIZING COMMITTEE
              </span>
              <h3 className="font-display font-black text-xl text-white uppercase tracking-tight mt-0.5">
                {member.name}
              </h3>
              <p className="text-xs text-slate-300 font-mono mt-1 flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-pitch-500" />
                <span>HOSTEL LEAGUE 26 OFFICIAL</span>
              </p>
            </div>

            {/* Callable Action on Mobile and Desktop */}
            <div className="mt-6 pt-4 border-t border-stadium-800/80">
              <a
                href={`tel:${member.phone}`}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-stadium-850 hover:bg-gold-500 text-white hover:text-stadium-980 border border-stadium-700 hover:border-gold-400 font-mono font-bold text-xs uppercase tracking-wider transition-all duration-200 group-hover:shadow-[0_0_15px_rgba(245,158,11,0.25)]"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>CALL COORDINATOR</span>
                <span className="text-[11px] opacity-75 font-normal">({member.phone})</span>
              </a>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
