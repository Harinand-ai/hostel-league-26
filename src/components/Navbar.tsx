import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Menu, X, Shield, PlayCircle, Volume2, VolumeX, ArrowUpRight } from 'lucide-react';
import { audioService } from '../services/audioService';

interface NavbarProps {
  currentTab: string;
  onNavigate: (tab: string, param?: string) => void;
  onReplayIntro: () => void;
  isAdminLoggedIn?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onNavigate,
  onReplayIntro,
  isAdminLoggedIn,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isMuted, setIsMuted] = useState<boolean>(audioService.getMuted());

  const navItems = [
    { id: 'home', label: 'HOME' },
    { id: 'fixtures', label: 'FIXTURES' },
    { id: 'results', label: 'RESULTS' },
    { id: 'table', label: 'TABLE' },
    { id: 'teams', label: 'CLUBS' },
    { id: 'stats', label: 'STATS' },
  ];

  const handleNavClick = (id: string) => {
    onNavigate(id);
    setMobileMenuOpen(false);
  };

  const handleToggleSound = () => {
    const muted = audioService.toggleMute();
    setIsMuted(muted);
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-[#07090D]/95 backdrop-blur-md border-b border-stadium-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-18">
          
          {/* Tournament Brand Logo */}
          <button
            onClick={() => handleNavClick('home')}
            className="flex items-center gap-3 group text-left focus:outline-none"
          >
            <div className="w-8 h-8 rounded-badge bg-gold-400 p-0.5 flex items-center justify-center">
              <div className="w-full h-full bg-[#07090D] rounded-[3px] flex items-center justify-center">
                <Trophy className="w-4 h-4 text-gold-400" />
              </div>
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="text-base font-black tracking-tight font-display text-white group-hover:text-gold-400 transition-colors">
                  HOSTEL LEAGUE
                </span>
                <span className="text-xs font-black font-display text-gold-400">
                  26
                </span>
              </div>
              <span className="text-[9px] font-mono font-bold tracking-widest text-pitch-500 uppercase -mt-0.5">
                OFFICIAL COMPETITION
              </span>
            </div>
          </button>

          {/* Desktop Nav Items with Active Indicator */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map(item => {
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`relative px-3.5 py-2 text-xs font-mono font-bold tracking-wider uppercase transition-colors ${
                    isActive
                      ? 'text-white'
                      : 'text-[#9EA4AD] hover:text-white'
                  }`}
                >
                  <span>{item.label}</span>
                  {isActive && (
                    <motion.div
                      layoutId="activeNavTab"
                      className="absolute bottom-0 left-3 right-3 h-0.5 bg-pitch-500"
                      transition={{ type: 'spring', stiffness: 450, damping: 35 }}
                    />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right actions: Audio Toggle, Replay Intro & discreet Admin button */}
          <div className="hidden md:flex items-center gap-2 font-mono">
            {/* Quick Tournament Overview Bridge */}
            <button
              onClick={() => onNavigate('quick-view')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-badge text-xs font-mono font-bold transition-all ${
                currentTab === 'quick-view'
                  ? 'bg-pitch-500 text-stadium-950 shadow-pitch-glow'
                  : 'text-pitch-400 hover:text-white bg-pitch-950/40 hover:bg-pitch-900/60 border border-pitch-800/60'
              }`}
              title="Quick Tournament Overview with Return"
            >
              <span className={`w-1.5 h-1.5 rounded-full ${currentTab === 'quick-view' ? 'bg-stadium-950' : 'bg-pitch-500 animate-pulse'}`} />
              <span>QUICK VIEW</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>

            {/* Audio Toggle */}
            <button
              onClick={handleToggleSound}
              title={isMuted ? "Enable Sound" : "Mute Sound"}
              className="p-2 text-[#9EA4AD] hover:text-white hover:bg-stadium-900 rounded-badge transition-colors"
            >
              {isMuted ? (
                <VolumeX className="w-4 h-4 text-slate-500" />
              ) : (
                <Volume2 className="w-4 h-4 text-pitch-500" />
              )}
            </button>

            {/* Replay Intro */}
            <button
              onClick={onReplayIntro}
              title="Watch Intro"
              className="p-2 text-[#9EA4AD] hover:text-gold-400 hover:bg-stadium-900 rounded-badge transition-colors"
            >
              <PlayCircle className="w-4 h-4" />
            </button>

            {/* Discreet Admin Link */}
            <button
              onClick={() => onNavigate('admin')}
              className={`px-2.5 py-1.5 text-xs rounded-badge transition-colors flex items-center gap-1.5 ${
                isAdminLoggedIn
                  ? 'bg-amber-500/10 text-gold-400 border border-gold-500/30'
                  : 'text-slate-500 hover:text-slate-300 hover:bg-stadium-900'
              }`}
              title={isAdminLoggedIn ? "Admin Panel Active" : "Admin Panel"}
            >
              <Shield className="w-3.5 h-3.5" />
              {isAdminLoggedIn && <span className="font-bold text-[10px]">ADMIN</span>}
            </button>
          </div>

          {/* Mobile hamburger button */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={handleToggleSound}
              title={isMuted ? "Enable Sound" : "Mute Sound"}
              className="p-2 text-[#9EA4AD] hover:text-white"
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-pitch-500" />}
            </button>
            <button
              onClick={onReplayIntro}
              title="Watch Tournament Intro"
              className="p-2 text-[#9EA4AD] hover:text-white"
            >
              <PlayCircle className="w-4 h-4" />
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-badge text-slate-300 hover:text-white hover:bg-stadium-900 focus:outline-none"
              aria-label="Toggle Navigation"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-stadium-800 bg-[#07090D] px-5 pt-3 pb-6 space-y-1 font-mono">
          {navItems.map(item => {
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full text-left px-3 py-2.5 rounded-badge text-xs font-bold tracking-wider uppercase transition-colors ${
                  isActive
                    ? 'bg-stadium-900 text-gold-400 border-l-2 border-gold-400'
                    : 'text-slate-300 hover:bg-stadium-900 hover:text-white'
                }`}
              >
                {item.label}
              </button>
            );
          })}

          {/* Quick Tournament Overview Bridge */}
          <div className="pt-3 pb-1 border-t border-stadium-800 mt-2">
            <button
              onClick={() => {
                onNavigate('quick-view');
                setMobileMenuOpen(false);
              }}
              className="w-full flex items-center justify-between p-3 rounded-badge bg-pitch-950/40 border border-pitch-800/60 text-xs font-mono font-bold text-pitch-400 hover:text-white transition-colors"
            >
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-pitch-500 animate-pulse" />
                <span>QUICK TOURNAMENT VIEW</span>
              </div>
              <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>

          <div className="pt-2 flex items-center justify-between px-1">
            <button
              onClick={() => handleNavClick('admin')}
              className="text-xs font-semibold text-[#9EA4AD] hover:text-gold-400 flex items-center gap-1.5 py-1.5"
            >
              <Shield className="w-4 h-4" />
              <span>Admin Management</span>
            </button>
            {isAdminLoggedIn && (
              <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/20 text-gold-400 font-bold">
                LOGGED IN
              </span>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
