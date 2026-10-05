import React from 'react';
import { Trophy, Shield, Calendar, Users, Award } from 'lucide-react';
import { INITIAL_TEAMS } from '../data/initialData';

interface FooterProps {
  onNavigate: (tab: string, param?: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="w-full bg-[#040609] border-t border-stadium-800 text-slate-400 mt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 lg:gap-12">
          
          {/* Brand info */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gold-500/20 border border-gold-500/40 flex items-center justify-center">
                <Trophy className="w-4 h-4 text-gold-400" />
              </div>
              <span className="text-xl font-black tracking-tight font-display text-white">
                HOSTEL LEAGUE <span className="text-gold-400">26</span>
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed max-w-md">
              The official football competition of the hostel championship. Single round-robin format with 6 clubs, 5 rounds, and 15 competitive fixtures to determine the champion.
            </p>
            <div className="flex flex-wrap gap-4 text-xs font-mono text-slate-400 pt-2">
              <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-emerald-400" /> 15 Matches</span>
              <span className="flex items-center gap-1.5"><Users className="w-3.5 h-3.5 text-sky-400" /> 6 Clubs</span>
              <span className="flex items-center gap-1.5"><Award className="w-3.5 h-3.5 text-gold-400" /> 1 Champion</span>
            </div>
          </div>

          {/* Teams quick list */}
          <div>
            <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-200 mb-3.5">
              Clubs & Managers
            </h4>
            <ul className="space-y-2 text-xs">
              {INITIAL_TEAMS.map(team => (
                <li key={team.id}>
                  <button
                    onClick={() => onNavigate('team-detail', team.id)}
                    className="hover:text-gold-400 transition-colors text-left flex items-center justify-between w-full group"
                  >
                    <span className="text-slate-300 font-bold group-hover:text-white uppercase">{team.name}</span>
                    <span className="text-[11px] text-slate-400 font-mono">({team.manager_name})</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Quick links & Admin */}
          <div>
            <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-200 mb-3.5">
              Official Portal
            </h4>
            <ul className="space-y-2.5 text-xs font-mono">
              <li>
                <button onClick={() => onNavigate('fixtures')} className="hover:text-white transition-colors">
                  Official Fixtures (15)
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('results')} className="hover:text-white transition-colors">
                  Match Reports & Results
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('table')} className="hover:text-white transition-colors">
                  League Standings
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('stats')} className="hover:text-white transition-colors">
                  Player Leaderboards
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('rules')} className="hover:text-gold-400 text-slate-300 transition-colors">
                  Rules & Regulations (12)
                </button>
              </li>

              <li className="pt-2">
                <button
                  onClick={() => onNavigate('admin')}

                  className="inline-flex items-center gap-1.5 text-slate-400 hover:text-gold-400 transition-colors"
                >
                  <Shield className="w-3.5 h-3.5" />
                  <span>Admin Access</span>
                </button>
              </li>
            </ul>
          </div>

        </div>

        <div className="border-t border-stadium-850 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 font-mono gap-3">
          <p>© 2026 HOSTEL LEAGUE 26. All rights reserved.</p>
          <p className="text-[11px] text-emerald-400">Single Round-Robin Format • 3 Pts Win / 1 Pt Draw</p>
        </div>
      </div>
    </footer>
  );
};
