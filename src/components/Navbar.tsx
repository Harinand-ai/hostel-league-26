import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Menu, X, Shield, PlayCircle, Volume2, VolumeX } from 'lucide-react';
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
    if (!muted) {
      audioService.playCardWhoosh();
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-[#06080d]/90 backdrop-blur-xl border-b border-stadium-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          
          {/* Tournament Brand Logo */}
          <button
            onClick={() => handleNavClick('home')}
            className="flex items-center gap-3.5 group text-left focus:outline-none"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gold-400 to-amber-600 p-0.5 shadow-md shadow-gold-500/10 group-hover:scale-105 transition-transform duration-200">
              <div className="w-full h-full bg-[#06080d] rounded-[10px] flex items-center justify-center">
                <Trophy className="w-5 h-5 text-gold-400" />
              </div>
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="text-base sm:text-lg font-black tracking-tight font-display text-white group-hover:text-gold-400 transition-colors">
                  HOSTEL LEAGUE
                </span>
                <span className="text-xs font-black font-display text-gold-400">
                  26
                </span>
              </div>
              <span className="text-[9px] font-mono font-bold tracking-[0.25em] text-emerald-400 uppercase -mt-0.5">
                OFFICIAL COMPETITION
              </span>
            </div>
          </button>

          {/* Desktop Nav Items with Active Underline Indicator */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2">
            {navItems.map(item => {
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`relative px-3.5 py-2 text-xs font-mono font-bold tracking-wider uppercase transition-colors ${
                    isActive
                      ? 'text-white'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <span>{item.label}</span>
                  {isActive && (
                    <motion.div
                      layoutId="activeNavTab"
                      className="absolute bottom-0 left-3 right-3 h-0.5 bg-gradient-to-r from-emerald-400 to-gold-400 rounded-full"
                      transition={{ type: 'spring', stiffness: 450, damping: 35 }}
                    />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right actions: Audio Toggle, Replay Intro & discreet Admin button */}
          <div className="hidden md:flex items-center gap-2 font-mono">
            {/* Audio Toggle */}
            <button
              onClick={handleToggleSound}
              title={isMuted ? "Enable Sound" : "Mute Sound"}
              className="p-2 text-slate-400 hover:text-white hover:bg-stadium-850 rounded-xl transition-colors"
            >
              {isMuted ? (
                <VolumeX className="w-4 h-4 text-slate-500" />
              ) : (
                <Volume2 className="w-4 h-4 text-emerald-400" />
              )}
            </button>

            {/* Replay Intro */}
            <button
              onClick={onReplayIntro}
              title="Watch Cinematic Intro"
              className="p-2 text-slate-400 hover:text-gold-400 hover:bg-stadium-850 rounded-xl transition-colors"
            >
              <PlayCircle className="w-4 h-4" />
            </button>

            {/* Discreet Admin Link */}
            <button
              onClick={() => onNavigate('admin')}
              className={`px-2.5 py-1.5 text-xs rounded-xl transition-colors flex items-center gap-1.5 ${
                isAdminLoggedIn
                  ? 'bg-amber-500/10 text-gold-400 border border-gold-500/30'
                  : 'text-slate-500 hover:text-slate-300 hover:bg-stadium-850'
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
              className="p-2 text-slate-400 hover:text-white"
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
            </button>
            <button
              onClick={onReplayIntro}
              title="Watch Tournament Intro"
              className="p-2 text-slate-400 hover:text-white"
            >
              <PlayCircle className="w-4 h-4" />
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-stadium-850 focus:outline-none"
              aria-label="Toggle Navigation"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-stadium-800 bg-[#06080d]/98 backdrop-blur-2xl px-5 pt-3 pb-6 space-y-1.5 font-mono">
          {navItems.map(item => {
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full text-left px-4 py-3 rounded-xl text-xs font-bold tracking-wider uppercase transition-colors ${
                  isActive
                    ? 'bg-stadium-850 text-gold-400 border-l-4 border-gold-500'
                    : 'text-slate-300 hover:bg-stadium-850 hover:text-white'
                }`}
              >
                {item.label}
              </button>
            );
          })}

          <div className="pt-4 border-t border-stadium-800 mt-3 flex items-center justify-between px-2">
            <button
              onClick={() => handleNavClick('admin')}
              className="text-xs font-semibold text-slate-400 hover:text-gold-400 flex items-center gap-2 py-2"
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
