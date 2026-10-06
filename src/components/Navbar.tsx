import React, { useState } from 'react';
import { Volume2, VolumeX, Radio, Trophy, Play } from 'lucide-react';
import { audioService } from '../services/audioService';

interface NavbarProps {
  currentTab: string;
  onNavigate: (tab: string, param?: string) => void;
  onReplayIntro?: () => void;
  onOpenLiveWindow?: () => void;
  isAdminLoggedIn?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onNavigate,
  onReplayIntro,
  onOpenLiveWindow,
  isAdminLoggedIn,
}) => {
  const [isMuted, setIsMuted] = useState<boolean>(audioService.getMuted());

  const navItems = [
    { id: 'home', label: 'HOME' },
    { id: 'matches', label: 'MATCHES' },
    { id: 'teams', label: 'CLUBS' },
    { id: 'stats', label: 'STATS' },
  ];

  const handleToggleSound = () => {
    const muted = audioService.toggleMute();
    setIsMuted(muted);
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-[#33271e] border-b-4 border-[#140e09] shadow-md">
      <div className="max-w-4xl mx-auto px-3 sm:px-6">
        <div className="flex items-center justify-between h-14 sm:h-16">
          
          {/* Tournament Brand Logo */}
          <button
            onClick={() => onNavigate('home')}
            className="flex items-center gap-2.5 text-left focus:outline-none group cursor-pointer"
          >
            <div className="w-8 h-8 sm:w-9 sm:h-9 bg-[#4a7227] border-2 border-[#120d08] flex items-center justify-center text-[#ffff55] shadow-xs">
              <Trophy className="w-4 h-4 text-[#ffff55]" />
            </div>
            <div className="flex flex-col">
              <span className="text-xs sm:text-sm font-black mc-title-yellow">
                HOSTEL LEAGUE <span className="text-[#55ff55]">26</span>
              </span>
              <span className="text-[10px] text-[#bda88e] tracking-wider uppercase">
                MINECRAFT EDITION
              </span>
            </div>
          </button>

          {/* Desktop Nav Items */}
          <nav className="hidden md:flex items-center gap-1.5">
            {navItems.map(item => {
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className={`px-3 py-1.5 text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                    isActive ? 'mc-btn-green' : 'mc-btn'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Right actions: LIVE Button + Sound */}
          <div className="flex items-center gap-2">
            {/* In-app LIVE Window Entry */}
            <button
              onClick={onOpenLiveWindow}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-black uppercase tracking-wider mc-btn-red cursor-pointer"
              title="Open Live Match Window"
            >
              <Radio className="w-3.5 h-3.5 animate-pulse text-white" />
              <span>LIVE SCORE</span>
            </button>

            {/* Audio Toggle */}
            <button
              onClick={handleToggleSound}
              title={isMuted ? "Unmute sound" : "Mute sound"}
              className="p-1.5 mc-btn"
            >
              {isMuted ? (
                <VolumeX className="w-3.5 h-3.5 text-slate-300" />
              ) : (
                <Volume2 className="w-3.5 h-3.5 text-[#55ff55]" />
              )}
            </button>

            {/* Replay Intro Button */}
            {onReplayIntro && (
              <button
                onClick={onReplayIntro}
                title="Watch tournament intro animation"
                className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1.5 text-[10px] font-black uppercase mc-btn"
              >
                <Play className="w-3 h-3 text-[#55ff55] fill-[#55ff55]" />
                <span>INTRO</span>
              </button>
            )}

            {/* Admin shortcut badge if logged in */}
            {isAdminLoggedIn && (
              <button
                onClick={() => onNavigate('admin')}
                className="hidden sm:inline-flex items-center px-2 py-1 text-[10px] font-black mc-btn-gold"
              >
                ADMIN
              </button>
            )}
          </div>

        </div>
      </div>
    </header>
  );
};
