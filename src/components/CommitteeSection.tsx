import React from 'react';
import { Phone, Users } from 'lucide-react';
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
    <section className={`space-y-3 ${className}`}>
      <div className="flex items-center justify-between pb-2 border-b border-slate-100">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
          <Users className="w-3.5 h-3.5 text-green-700" />
          <span>TOURNAMENT COMMITTEE</span>
        </h2>
        <span className="text-[10px] text-slate-400 font-semibold">
          3 Coordinators
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {committee.map(member => (
          <div
            key={member.id}
            className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between"
          >
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-green-700 block">
                {member.role}
              </span>
              <h3 className="font-extrabold text-slate-900 text-sm mt-0.5">
                {member.name}
              </h3>
            </div>

            <div className="mt-3 pt-2.5 border-t border-slate-100">
              <a
                href={`tel:${member.phone}`}
                className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-800 text-xs font-bold transition-colors"
              >
                <Phone className="w-3.5 h-3.5 text-green-700" />
                <span>Call {member.phone}</span>
              </a>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
