import React from 'react';
import { Home, Calendar, Shield, BarChart3, Radio } from 'lucide-react';

interface MobileBottomNavProps {
  currentTab: string;
  onNavigate: (tab: string, param?: string) => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  currentTab,
  onNavigate,
}) => {
  const tabs = [
    { id: 'home', label: 'HOME', icon: Home },
    { id: 'matches', label: 'MATCH', icon: Calendar },
    {
      id: 'live',
      label: 'LIVE',
      icon: Radio,
      isLiveLink: true,
      url: 'https://hostelleague.vercel.app/',
    },
    { id: 'teams', label: 'CLUBS', icon: Shield },
    { id: 'stats', label: 'STATS', icon: BarChart3 },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#2b2118] border-t-4 border-[#120d08] px-1 py-1 safe-bottom shadow-2xl">
      <div className="flex items-center justify-around max-w-md mx-auto gap-1">
        {tabs.map(tab => {
          const Icon = tab.icon;
          const isActive = currentTab === tab.id;

          if (tab.isLiveLink) {
            return (
              <a
                key={tab.id}
                href={tab.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex flex-col items-center justify-center py-1 px-1 bg-[#801818] border-2 border-[#120d08] text-white active:scale-95 transition-transform"
                title="Watch Live Match"
              >
                <Icon className="w-4 h-4 animate-pulse text-white" />
                <span className="text-[9px] font-black mt-0.5 tracking-tight font-display text-white">
                  {tab.label}
                </span>
              </a>
            );
          }

          return (
            <button
              key={tab.id}
              onClick={() => onNavigate(tab.id)}
              className={`flex-1 flex flex-col items-center justify-center py-1.5 px-1 transition-all cursor-pointer ${
                isActive
                  ? 'bg-[#4a7227] border-2 border-white text-[#ffff55] shadow-xs'
                  : 'bg-[#1c150e] border-2 border-[#120d08] text-[#c7b49d] hover:bg-[#2c2219]'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className={`text-[9px] font-black mt-0.5 tracking-tight font-display ${isActive ? 'text-[#ffff55]' : 'text-[#c7b49d]'}`}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
