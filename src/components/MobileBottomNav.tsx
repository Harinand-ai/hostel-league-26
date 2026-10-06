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
    { id: 'home', label: 'Home', icon: Home },
    { id: 'matches', label: 'Matches', icon: Calendar },
    {
      id: 'live',
      label: 'Live',
      icon: Radio,
      isLiveLink: true,
      url: 'https://hostelleague.vercel.app/',
    },
    { id: 'teams', label: 'Teams', icon: Shield },
    { id: 'stats', label: 'Stats', icon: BarChart3 },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-200 px-2 py-1 safe-bottom shadow-lg">
      <div className="flex items-center justify-around max-w-md mx-auto">
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
                className="flex flex-col items-center justify-center py-1 px-3 rounded-lg text-green-700 active:scale-95 transition-transform"
                title="Watch Live Match"
              >
                <div className="w-8 h-8 rounded-full bg-green-600 text-white flex items-center justify-center shadow-xs">
                  <Icon className="w-4 h-4 animate-pulse" />
                </div>
                <span className="text-[10px] font-bold mt-0.5 text-green-700">
                  {tab.label}
                </span>
              </a>
            );
          }

          return (
            <button
              key={tab.id}
              onClick={() => onNavigate(tab.id)}
              className={`flex flex-col items-center justify-center py-1.5 px-3 min-w-[56px] transition-colors ${
                isActive ? 'text-green-700' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Icon className="w-5 h-5 stroke-[2]" />
              <span className={`text-[10px] mt-0.5 ${isActive ? 'font-bold' : 'font-medium'}`}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
