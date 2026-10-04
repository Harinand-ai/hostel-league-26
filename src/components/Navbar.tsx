import React, { useState } from 'react';
import { Trophy, Menu, X, Shield, PlayCircle } from 'lucide-react';

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

  const navItems = [
    { id: 'home', label: 'HOME' },
    { id: 'fixtures', label: 'FIXTURES' },
    { id: 'results', label: 'RESULTS' },
    { id: 'table', label: 'TABLE' },
    { id: 'teams', label: 'TEAMS' },
    { id: 'stats', label: 'STATS' },
  ];

  const handleNavClick = (id: string) => {
    onNavigate(id);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-stadium-950/85 backdrop-blur-md border-b border-stadium-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          
          {/* Logo */}
          <button
            onClick={() => handleNavClick('home')}
            className="flex items-center gap-3 group text-left focus:outline-none"
          >
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-gold-500 to-amber-600 p-0.5 shadow-md shadow-gold-500/10 group-hover:scale-105 transition-transform duration-200">
              <div className="w-full h-full bg-stadium-950 rounded-[7px] flex items-center justify-center">
                <Trophy className="w-5 h-5 text-gold-400" />
              </div>
            </div>
            <div className="flex flex-col">
              <span className="text-base sm:text-lg font-black tracking-tight font-display text-white group-hover:text-gold-400 transition-colors">
                HOSTEL LEAGUE
              </span>
              <span className="text-[10px] font-extrabold tracking-[0.25em] text-gold-500 uppercase -mt-1">
                26 OFFICIAL
              </span>
            </div>
          </button>

          {/* Desktop Nav Items */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2">
            {navItems.map(item => {
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`px-3 py-2 text-xs lg:text-sm font-bold tracking-wider uppercase rounded-md transition-all duration-150 ${
                    isActive
                      ? 'text-white bg-stadium-800 border-b-2 border-gold-500 shadow-sm'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-stadium-850'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Right actions: Replay Intro & discreet Admin button */}
          <div className="hidden md:flex items-center gap-2">
            <button
              onClick={onReplayIntro}
              title="Watch Tournament Intro"
              className="p-2 text-slate-400 hover:text-gold-400 hover:bg-stadium-850 rounded-lg transition-colors"
            >
              <PlayCircle className="w-4 h-4" />
            </button>

            <button
              onClick={() => onNavigate('admin')}
              className={`p-2 text-xs rounded-lg transition-colors flex items-center gap-1.5 ${
                isAdminLoggedIn
                  ? 'bg-amber-500/10 text-gold-400 border border-gold-500/30'
                  : 'text-slate-500 hover:text-slate-300 hover:bg-stadium-850'
              }`}
              title={isAdminLoggedIn ? "Admin Panel Active" : "Admin Panel"}
            >
              <Shield className="w-3.5 h-3.5" />
              {isAdminLoggedIn && <span className="font-semibold text-[11px]">ADMIN</span>}
            </button>
          </div>

          {/* Mobile hamburger button */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={onReplayIntro}
              title="Watch Tournament Intro"
              className="p-2 text-slate-400 hover:text-white"
            >
              <PlayCircle className="w-5 h-5" />
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-stadium-850 focus:outline-none"
              aria-label="Toggle Navigation"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-stadium-800 bg-stadium-950/95 backdrop-blur-xl px-4 pt-2 pb-5 space-y-1">
          {navItems.map(item => {
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full text-left px-4 py-3 rounded-lg text-sm font-bold tracking-wider uppercase transition-colors ${
                  isActive
                    ? 'bg-stadium-800 text-gold-400 border-l-4 border-gold-500'
                    : 'text-slate-300 hover:bg-stadium-850 hover:text-white'
                }`}
              >
                {item.label}
              </button>
            );
          })}

          <div className="pt-3 border-t border-stadium-800/80 mt-2 flex items-center justify-between px-2">
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
