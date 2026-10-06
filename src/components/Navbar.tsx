import React, { useState } from 'react';
import { Volume2, VolumeX, Radio, Trophy } from 'lucide-react';
import { audioService } from '../services/audioService';

interface NavbarProps {
  currentTab: string;
  onNavigate: (tab: string, param?: string) => void;
  onReplayIntro?: () => void;
  isAdminLoggedIn?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onNavigate,
  isAdminLoggedIn,
}) => {
  const [isMuted, setIsMuted] = useState<boolean>(audioService.getMuted());

  const navItems = [
    { id: 'home', label: 'Home' },
    { id: 'matches', label: 'Matches' },
    { id: 'teams', label: 'Teams' },
    { id: 'stats', label: 'Stats' },
  ];

  const handleToggleSound = () => {
    const muted = audioService.toggleMute();
    setIsMuted(muted);
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-white border-b border-slate-200 shadow-xs">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-14 sm:h-16">
          
          {/* Tournament Brand Logo */}
          <button
            onClick={() => onNavigate('home')}
            className="flex items-center gap-2.5 text-left focus:outline-none group cursor-pointer"
          >
            <div className="w-8 h-8 rounded-lg bg-green-700 flex items-center justify-center text-white font-black text-sm shadow-xs">
              <Trophy className="w-4 h-4 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm sm:text-base font-extrabold tracking-tight text-slate-900 group-hover:text-green-700 transition-colors">
                HOSTEL LEAGUE <span className="text-green-700">26</span>
              </span>
              <span className="text-[10px] text-slate-500 font-medium tracking-wide">
                Official Tournament Record
              </span>
            </div>
          </button>

          {/* Desktop Nav Items */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map(item => {
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wider rounded-md transition-colors ${
                    isActive
                      ? 'bg-slate-100 text-green-700 font-extrabold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Right actions: LIVE Button + Sound */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Direct LIVE Portal Entry */}
            <a
              href="https://hostelleague.vercel.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-green-600 hover:bg-green-700 active:bg-green-800 text-white text-xs font-bold uppercase tracking-wider transition-colors shadow-xs"
              title="Watch Live Match Experience"
            >
              <Radio className="w-3.5 h-3.5 animate-pulse text-white" />
              <span>LIVE</span>
            </a>

            {/* Audio Toggle */}
            <button
              onClick={handleToggleSound}
              title={isMuted ? "Unmute sound" : "Mute sound"}
              className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-md transition-colors"
            >
              {isMuted ? (
                <VolumeX className="w-4 h-4 text-slate-400" />
              ) : (
                <Volume2 className="w-4 h-4 text-green-700" />
              )}
            </button>

            {/* Admin shortcut badge if logged in */}
            {isAdminLoggedIn && (
              <button
                onClick={() => onNavigate('admin')}
                className="hidden sm:inline-flex items-center px-2 py-1 rounded text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-200"
              >
                Admin
              </button>
            )}
          </div>

        </div>
      </div>
    </header>
  );
};
