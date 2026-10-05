import React from 'react';
import { motion } from 'framer-motion';
import { BookOpen, ShieldAlert, Award, ArrowLeft, CheckCircle2, AlertTriangle } from 'lucide-react';
import { TOURNAMENT_RULES } from '../data/initialData';

interface RulesPageProps {
  onNavigate?: (tab: string, param?: string) => void;
}

export const RulesPage: React.FC<RulesPageProps> = ({ onNavigate }) => {
  return (
    <div className="space-y-10 max-w-5xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-stadium-800">
        <div>
          {onNavigate && (
            <button
              onClick={() => onNavigate('home')}
              className="inline-flex items-center gap-1.5 text-xs font-mono font-bold uppercase tracking-wider text-slate-400 hover:text-white transition-colors mb-3"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back to Home
            </button>
          )}
          <div className="flex items-center gap-2 text-gold-400 text-xs font-mono font-bold uppercase tracking-widest mb-1.5">
            <BookOpen className="w-3.5 h-3.5" />
            OFFICIAL TOURNAMENT STATUTES
          </div>
          <h1 className="text-3xl sm:text-5xl font-black font-display tracking-tight text-white uppercase">
            RULES & REGULATIONS
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 font-mono">
            Hostel League 26 official constitution governing match play, refereeing, conduct and tournament format.
          </p>
        </div>

        <div className="px-4 py-2 rounded-xl bg-stadium-900 border border-stadium-750 font-mono text-xs text-slate-300">
          <span className="text-gold-400 font-bold">12 ARTICLES</span> • STRICT ENFORCEMENT
        </div>
      </div>

      {/* Rules Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        {TOURNAMENT_RULES.map((rule, idx) => (
          <motion.div
            key={rule.id}
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.25, delay: idx * 0.04 }}
            className="group relative overflow-hidden rounded-2xl bg-[#090d16] border border-stadium-750 p-5 sm:p-6 transition-all hover:border-gold-500/30 hover:bg-[#0b101c] shadow-broadcast flex flex-col justify-between"
          >
            <div>
              {/* Header with rule number */}
              <div className="flex items-center justify-between mb-3">
                <span className="font-mono font-black text-2xl sm:text-3xl text-gold-400/80 group-hover:text-gold-400 transition-colors">
                  {String(rule.id).padStart(2, '0')}
                </span>
                <span className="text-[10px] font-mono font-bold tracking-widest uppercase px-2.5 py-0.5 rounded-full bg-stadium-850 border border-stadium-750 text-slate-400">
                  ARTICLE {rule.id}
                </span>
              </div>

              {/* Title */}
              <h3 className="font-display font-black text-lg text-white uppercase tracking-tight mb-2 group-hover:text-gold-300 transition-colors">
                {rule.title}
              </h3>

              {/* Description */}
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-sans">
                {rule.description}
              </p>

              {/* Subrules if any */}
              {rule.subrules && rule.subrules.length > 0 && (
                <ul className="mt-3 space-y-1.5 pt-3 border-t border-stadium-800/80 text-xs text-slate-400">
                  {rule.subrules.map((sub, sIdx) => (
                    <li key={sIdx} className="flex items-start gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-pitch-500 shrink-0 mt-0.5" />
                      <span>{sub}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Bottom visual tag */}
            <div className="mt-4 pt-3 border-t border-stadium-850 flex items-center justify-between text-[11px] font-mono text-slate-500">
              <span>HOSTEL LEAGUE 26</span>
              <span className="text-pitch-500 font-bold">BINDING</span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Disqualification & Code of Conduct Callout */}
      <div className="p-6 rounded-2xl bg-rose-950/20 border border-rose-500/30 flex flex-col sm:flex-row items-start sm:items-center gap-4 text-xs font-mono">
        <div className="w-10 h-10 rounded-xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400 shrink-0">
          <ShieldAlert className="w-5 h-5" />
        </div>
        <div className="space-y-1 flex-1">
          <h4 className="font-display font-black text-sm text-rose-300 uppercase tracking-wide">
            IMPORTANT DISQUALIFICATION NOTICE (RULE 12)
          </h4>
          <p className="text-slate-300 font-sans text-xs">
            A minimum of 6 players must reach the ground and be fully ready before the main referee arrives. Failure to comply results in immediate match forfeiture.
          </p>
        </div>
      </div>

    </div>
  );
};
