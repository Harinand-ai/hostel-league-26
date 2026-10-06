import React from 'react';
import { Trophy, Shield, Calendar, Users, Radio } from 'lucide-react';
import { INITIAL_TEAMS } from '../data/initialData';

interface FooterProps {
  onNavigate: (tab: string, param?: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="w-full bg-[#241a12] border-t-4 border-[#120d08] text-[#c7b49d] mt-16 pb-16 md:pb-6">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          
          {/* Brand info */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-[#4a7227] border-2 border-[#120d08] flex items-center justify-center text-[#ffff55] font-bold text-xs">
                <Trophy className="w-3.5 h-3.5" />
              </div>
              <span className="font-black text-white text-xs mc-title-yellow">
                HOSTEL LEAGUE 26
              </span>
            </div>
            <p className="text-sm text-[#a89680]">
              Official tournament record. Six clubs, five rounds, fifteen matches.
            </p>
            <div className="pt-1">
              <a
                href="https://hostelleague.vercel.app/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 mc-btn-red text-[10px] font-black uppercase tracking-wider"
              >
                <Radio className="w-3.5 h-3.5" />
                <span>LIVE SCORE</span>
              </a>
            </div>
          </div>

          {/* Clubs */}
          <div>
            <h4 className="text-[10px] font-black uppercase tracking-wider text-[#ffff55] mb-2">
              Clubs & Managers
            </h4>
            <ul className="space-y-1 text-sm">
              {INITIAL_TEAMS.map(team => (
                <li key={team.id}>
                  <button
                    onClick={() => onNavigate('team-detail', team.id)}
                    className="hover:text-[#ffff55] text-left flex items-center justify-between w-full group py-0.5 cursor-pointer"
                  >
                    <span className="font-bold text-[#f0e4cf] group-hover:text-[#ffff55]">
                      {team.name}
                    </span>
                    <span className="text-xs text-[#968470]">
                      {team.manager_name}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Quick Shortcuts */}
          <div>
            <h4 className="text-[10px] font-black uppercase tracking-wider text-[#ffff55] mb-2">
              Realm Navigation
            </h4>
            <div className="flex flex-col space-y-1 text-sm">
              <button
                onClick={() => onNavigate('matches')}
                className="text-left text-[#f0e4cf] hover:text-[#ffff55] flex items-center gap-1.5 cursor-pointer py-0.5"
              >
                <Calendar className="w-3 h-3 text-[#55ff55]" />
                <span>All 15 Fixtures</span>
              </button>
              <button
                onClick={() => onNavigate('teams')}
                className="text-left text-[#f0e4cf] hover:text-[#ffff55] flex items-center gap-1.5 cursor-pointer py-0.5"
              >
                <Shield className="w-3 h-3 text-[#55ffff]" />
                <span>Participating Squads</span>
              </button>
              <button
                onClick={() => onNavigate('stats')}
                className="text-left text-[#f0e4cf] hover:text-[#ffff55] flex items-center gap-1.5 cursor-pointer py-0.5"
              >
                <Trophy className="w-3 h-3 text-[#ffaa00]" />
                <span>Standings & Golden Boot</span>
              </button>
              <button
                onClick={() => onNavigate('admin-login')}
                className="text-left text-[#968470] hover:text-white flex items-center gap-1.5 cursor-pointer py-0.5"
              >
                <Users className="w-3 h-3" />
                <span>Admin Operations</span>
              </button>
            </div>
          </div>

        </div>

        <div className="mt-8 pt-4 border-t-2 border-[#19110a] text-center text-xs text-[#806f5e]">
          Hostel League 26 • Minecraft Edition • All Match & Tournament Records Preserved
        </div>
      </div>
    </footer>
  );
};
