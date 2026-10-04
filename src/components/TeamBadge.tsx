import React from 'react';
import { Team } from '../types/tournament';

interface TeamBadgeProps {
  team: Team;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  showName?: boolean;
  nameClassName?: string;
  className?: string;
}

export const TeamBadge: React.FC<TeamBadgeProps> = ({
  team,
  size = 'md',
  showName = false,
  nameClassName = 'text-sm font-semibold text-slate-200',
  className = '',
}) => {
  const sizeMap = {
    xs: { box: 'w-6 h-6', text: 'text-[9px]', icon: 'w-3.5 h-3.5' },
    sm: { box: 'w-8 h-8', text: 'text-[11px]', icon: 'w-4.5 h-4.5' },
    md: { box: 'w-11 h-11', text: 'text-xs', icon: 'w-6 h-6' },
    lg: { box: 'w-16 h-16', text: 'text-sm font-bold', icon: 'w-8 h-8' },
    xl: { box: 'w-24 h-24', text: 'text-base font-bold', icon: 'w-12 h-12' },
  };

  const currentSize = sizeMap[size];

  // Specific heraldic crest render for each of the 6 teams
  const renderCrestGraphic = () => {
    switch (team.short_name) {
      case 'CRY': // Crystal Palace: Red & Blue eagle style
        return (
          <svg viewBox="0 0 40 46" className="w-full h-full drop-shadow-md">
            <defs>
              <linearGradient id="cryGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="50%" stopColor="#1B458F" />
                <stop offset="50%" stopColor="#C4122D" />
              </linearGradient>
            </defs>
            <path d="M20 2 L36 8 V24 C36 34 20 44 20 44 C20 44 4 34 4 24 V8 Z" fill="url(#cryGrad)" stroke="#ffd700" strokeWidth="1.5" />
            <path d="M20 12 L24 20 L28 17 L22 28 L20 26 L18 28 L12 17 L16 20 Z" fill="#ffffff" />
            <text x="20" y="38" textAnchor="middle" fill="#ffffff" fontSize="6.5" fontWeight="900" fontFamily="sans-serif">CRY</text>
          </svg>
        );
      case 'TOT': // Spurs: Navy & White cockerel motif
        return (
          <svg viewBox="0 0 40 46" className="w-full h-full drop-shadow-md">
            <path d="M20 2 L36 8 V24 C36 34 20 44 20 44 C20 44 4 34 4 24 V8 Z" fill="#132257" stroke="#ffffff" strokeWidth="1.5" />
            <circle cx="20" cy="27" r="5" fill="none" stroke="#ffffff" strokeWidth="1.2" />
            <path d="M20 12 C18 12 17 14 18 16 C16 16 14 18 15 21 L18 21 L19 23 L21 23 L22 21 C23 20 24 18 23 15 C23 13 22 12 20 12 Z" fill="#ffffff" />
            <text x="20" y="38" textAnchor="middle" fill="#ffffff" fontSize="6.5" fontWeight="900" fontFamily="sans-serif">SPURS</text>
          </svg>
        );
      case 'AVL': // Aston Villa: Claret & Sky lion rampant
        return (
          <svg viewBox="0 0 40 46" className="w-full h-full drop-shadow-md">
            <path d="M20 2 L36 8 V24 C36 34 20 44 20 44 C20 44 4 34 4 24 V8 Z" fill="#670E36" stroke="#95BFE5" strokeWidth="2" />
            <path d="M20 14 C21 13 23 14 23 16 C23 18 21 19 22 22 C23 23 24 23 24 25 C23 26 21 25 20 27 C19 28 17 26 18 24 C17 22 18 20 17 18 C17 15 19 14 20 14 Z" fill="#FEDB00" />
            <polygon points="19,10 20,7 21,10 23,10 21.5,12 22,14 20,12.5 18,14 18.5,12 17,10" fill="#FEDB00" />
            <text x="20" y="38" textAnchor="middle" fill="#95BFE5" fontSize="6.5" fontWeight="900" fontFamily="sans-serif">VILLA</text>
          </svg>
        );
      case 'BHA': // Brighton: Seagull Blue & Yellow
        return (
          <svg viewBox="0 0 40 46" className="w-full h-full drop-shadow-md">
            <path d="M20 2 L36 8 V24 C36 34 20 44 20 44 C20 44 4 34 4 24 V8 Z" fill="#0057B8" stroke="#FFCD00" strokeWidth="1.8" />
            {/* Seagull wings */}
            <path d="M10 20 Q16 15 20 21 Q24 15 30 20 Q24 18 20 24 Q16 18 10 20 Z" fill="#ffffff" />
            <circle cx="20" cy="27" r="1.5" fill="#FFCD00" />
            <text x="20" y="38" textAnchor="middle" fill="#ffffff" fontSize="6.5" fontWeight="900" fontFamily="sans-serif">BHA</text>
          </svg>
        );
      case 'FUL': // Fulham: Black & White shield with red monogram
        return (
          <svg viewBox="0 0 40 46" className="w-full h-full drop-shadow-md">
            <path d="M20 2 L36 8 V24 C36 34 20 44 20 44 C20 44 4 34 4 24 V8 Z" fill="#0f172a" stroke="#ffffff" strokeWidth="1.8" />
            <path d="M4 14 L36 14 L36 19 L4 19 Z" fill="#CC0000" />
            <text x="20" y="31" textAnchor="middle" fill="#ffffff" fontSize="11" fontWeight="900" fontFamily="sans-serif">FFC</text>
          </svg>
        );
      case 'NFO': // Nottingham Forest: Garibaldi Red with stylized tree
        return (
          <svg viewBox="0 0 40 46" className="w-full h-full drop-shadow-md">
            <path d="M20 2 L36 8 V24 C36 34 20 44 20 44 C20 44 4 34 4 24 V8 Z" fill="#DD0000" stroke="#ffffff" strokeWidth="1.8" />
            {/* Tree trunk and leaves */}
            <path d="M20 11 L25 18 H22 L26 23 H21 V28 H19 V23 H14 L18 18 H15 Z" fill="#ffffff" />
            <polygon points="20,7 21,9 23,9 21.5,10.5 22,12.5 20,11.2 18,12.5 18.5,10.5 17,9 19,9" fill="#FFD700" />
            <text x="20" y="38" textAnchor="middle" fill="#ffffff" fontSize="6" fontWeight="900" fontFamily="sans-serif">NFFC</text>
          </svg>
        );
      default:
        return (
          <div
            className="w-full h-full flex items-center justify-center font-bold text-white uppercase rounded-md shadow-inner"
            style={{ backgroundColor: team.primary_color }}
          >
            {team.short_name || team.name.substring(0, 3)}
          </div>
        );
    }
  };

  return (
    <div className={`inline-flex items-center gap-2.5 ${className}`}>
      <div className={`relative flex items-center justify-center shrink-0 transition-transform duration-200 hover:scale-105 ${currentSize.box}`}>
        {team.logo_url ? (
          <img
            src={team.logo_url}
            alt={`${team.name} badge`}
            className="w-full h-full object-contain"
          />
        ) : (
          renderCrestGraphic()
        )}
      </div>

      {showName && (
        <span className={nameClassName}>
          {team.name}
        </span>
      )}
    </div>
  );
};
