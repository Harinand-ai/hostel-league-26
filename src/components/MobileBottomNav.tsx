import React from 'react';
import { motion } from 'framer-motion';
import { Home, Calendar, Trophy, Shield, BarChart3, ExternalLink, Zap } from 'lucide-react';

interface MobileBottomNavProps {
  currentTab: string;
  onNavigate: (tab: string, param?: string) => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  currentTab,
  onNavigate,
}) => {
  const tabs = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'fixtures', label: 'Fixtures', icon: Calendar },
    { id: 'table', label: 'Table', icon: Trophy },
    { id: 'stats', label: 'Stats', icon: BarChart3 },
    { id: 'teams', label: 'Clubs', icon: Shield },
    { id: 'quick-view', label: 'Quick', icon: Zap, isSpecial: true },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#06090F]/90 backdrop-blur-xl border-t border-stadium-800/80 px-2 py-1 safe-bottom shadow-[0_-8px_25px_rgba(0,0,0,0.8)]">
      <div className="flex items-center justify-around max-w-lg mx-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentTab === tab.id;

          if (tab.isSpecial) {
            return (
              <button
                key={tab.id}
                onClick={() => onNavigate(tab.id)}
                className={`relative flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all duration-200 active:scale-95 ${
                  isActive
                    ? 'text-stadium-950 font-black'
                    : 'text-pitch-400 hover:text-white'
                }`}
              >
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${
                    isActive
                      ? 'bg-pitch-400 shadow-[0_0_15px_rgba(0,255,133,0.7)] text-stadium-950'
                      : 'bg-pitch-950/80 border border-pitch-500/40 text-pitch-400'
                  }`}
                >
                  <Icon className="w-4 h-4 stroke-[2.5]" />
                </div>
                <span className="text-[10px] font-mono font-bold tracking-tight mt-0.5">
                  {tab.label}
                </span>
              </button>
            );
          }

          return (
            <button
              key={tab.id}
              onClick={() => onNavigate(tab.id)}
              className="relative flex flex-col items-center justify-center py-1.5 px-2 min-w-[52px] transition-all duration-150 active:scale-95"
            >
              {isActive && (
                <motion.div
                  layoutId="mobileActiveTabGlow"
                  className="absolute inset-0 bg-pitch-500/10 rounded-xl -z-10 border border-pitch-500/30"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
              <Icon
                className={`w-5 h-5 transition-colors ${
                  isActive
                    ? 'text-pitch-400 drop-shadow-[0_0_8px_rgba(0,255,133,0.6)]'
                    : 'text-slate-400'
                }`}
              />
              <span
                className={`text-[10px] font-mono mt-1 tracking-tight transition-colors ${
                  isActive
                    ? 'text-white font-bold'
                    : 'text-slate-400'
                }`}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
