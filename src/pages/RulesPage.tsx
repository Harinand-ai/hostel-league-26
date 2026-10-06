import React from 'react';
import { BookOpen, ArrowLeft, ShieldAlert } from 'lucide-react';
import { TOURNAMENT_RULES } from '../data/initialData';
import { CommitteeSection } from '../components/CommitteeSection';

interface RulesPageProps {
  onNavigate?: (tab: string, param?: string) => void;
}

export const RulesPage: React.FC<RulesPageProps> = ({ onNavigate }) => {
  return (
    <div className="space-y-5 max-w-lg mx-auto">
      
      {/* Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
        {onNavigate && (
          <button
            onClick={() => onNavigate('home')}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors mb-2 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Home</span>
          </button>
        )}
        <div className="flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-green-700" />
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight uppercase">
            RULES & REGULATIONS
          </h1>
        </div>
        <p className="text-xs text-slate-500 mt-1">
          Official tournament regulations governing Hostel League 26
        </p>
      </div>

      {/* 12 Rules list */}
      <div className="bg-white rounded-xl border border-slate-200 divide-y divide-slate-100 shadow-xs">
        {TOURNAMENT_RULES.map(rule => (
          <div key={rule.id} className="p-3.5 sm:p-4">
            <div className="flex items-baseline gap-2.5">
              <span className="font-black text-xs text-green-700 shrink-0 w-6">
                #{rule.id}
              </span>
              <div>
                <h3 className="font-extrabold text-xs sm:text-sm text-slate-900">
                  {rule.title}
                </h3>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  {rule.description}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Disqualification Callout */}
      <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3 text-xs">
        <ShieldAlert className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
        <div>
          <span className="font-extrabold text-amber-900 block">
            Important Team Reporting Requirement (Rule 12)
          </span>
          <p className="text-amber-800 mt-0.5 leading-relaxed">
            A minimum of 6 players must reach the ground and be ready before the main referee arrives. Otherwise the team is disqualified.
          </p>
        </div>
      </div>

      {/* Committee Coordinators */}
      <CommitteeSection />

    </div>
  );
};
