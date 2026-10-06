import React from 'react';
import { Trophy, Shield, Calendar, Users, Radio } from 'lucide-react';
import { INITIAL_TEAMS } from '../data/initialData';

interface FooterProps {
  onNavigate: (tab: string, param?: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="w-full bg-slate-100 border-t border-slate-200 text-slate-600 mt-16 pb-16 md:pb-6">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
          
          {/* Brand info */}
          <div className="space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-md bg-green-700 flex items-center justify-center text-white font-bold text-xs">
                <Trophy className="w-3.5 h-3.5" />
              </div>
              <span className="font-extrabold text-slate-900 text-base">
                HOSTEL LEAGUE 26
              </span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Official tournament record and match centre. Six clubs, five rounds, fifteen matches.
            </p>
            <div className="pt-1">
              <a
                href="https://hostelleague.vercel.app/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-green-600 text-white text-xs font-bold uppercase tracking-wider hover:bg-green-700 transition-colors"
              >
                <Radio className="w-3.5 h-3.5" />
                <span>Go to Live Match</span>
              </a>
            </div>
          </div>

          {/* Clubs */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-2.5">
              Clubs & Managers
            </h4>
            <ul className="space-y-1.5 text-xs">
              {INITIAL_TEAMS.map(team => (
                <li key={team.id}>
                  <button
                    onClick={() => onNavigate('team-detail', team.id)}
                    className="hover:text-green-700 text-left flex items-center justify-between w-full group py-0.5 cursor-pointer"
                  >
                    <span className="font-semibold text-slate-700 group-hover:text-green-700">
                      {team.name}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      {team.manager_name}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Quick links & Tournament Info */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-2.5">
              Information & Rules
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  onClick={() => onNavigate('matches')}
                  className="hover:text-green-700 text-slate-700 font-medium transition-colors cursor-pointer"
                >
                  All 15 Fixtures & Results
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('stats')}
                  className="hover:text-green-700 text-slate-700 font-medium transition-colors cursor-pointer"
                >
                  Top Scorers & Honors
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('rules')}
                  className="hover:text-green-700 text-slate-700 font-medium transition-colors cursor-pointer"
                >
                  Official Rules (12 Regulations)
                </button>
              </li>
              <li className="pt-2 border-t border-slate-200">
                <button
                  onClick={() => onNavigate('admin')}
                  className="inline-flex items-center gap-1.5 text-slate-500 hover:text-slate-900 transition-colors cursor-pointer font-medium"
                >
                  <Shield className="w-3.5 h-3.5" />
                  <span>Admin Access</span>
                </button>
              </li>
            </ul>
          </div>

        </div>

        <div className="border-t border-slate-200 mt-8 pt-4 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-2">
          <p>© 2026 HOSTEL LEAGUE 26. Official Tournament Portal.</p>
          <p className="font-medium text-slate-500">6's Football • 12 Mins Each Half</p>
        </div>
      </div>
    </footer>
  );
};
