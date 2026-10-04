import React from 'react';
import { Team } from '../types/tournament';

interface TeamBadgeProps {
  team: Team;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  showName?: boolean;
  nameClassName?: string;
  className?: string;
  glow?: boolean;
}

export const TeamBadge: React.FC<TeamBadgeProps> = ({
  team,
  size = 'md',
  showName = false,
  nameClassName = 'text-sm font-bold tracking-tight text-slate-100',
  className = '',
  glow = false,
}) => {
  const sizeMap = {
    xs: { box: 'w-6 h-6', text: 'text-[9px]' },
    sm: { box: 'w-8 h-8', text: 'text-[11px]' },
    md: { box: 'w-11 h-11', text: 'text-xs' },
    lg: { box: 'w-16 h-16', text: 'text-sm' },
    xl: { box: 'w-24 h-24', text: 'text-base' },
    '2xl': { box: 'w-32 h-32 md:w-36 md:h-36', text: 'text-lg' },
  };

  const currentSize = sizeMap[size];

  // Specific broadcast crest vector for each of the 6 official tournament teams
  const renderCrestGraphic = () => {
    switch (team.short_name) {
      case 'CRY': // Crystal Palace: Halved Royal Blue & Garibaldi Red with Gold Eagle
        return (
          <svg viewBox="0 0 44 50" className="w-full h-full drop-shadow-[0_4px_12px_rgba(0,0,0,0.5)]">
            <defs>
              <linearGradient id="cryGold" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#fde047" />
                <stop offset="100%" stopColor="#d97706" />
              </linearGradient>
              <clipPath id="cryClip">
                <path d="M22 2 L40 8 V26 C40 37 22 48 22 48 C22 48 4 37 4 26 V8 Z" />
              </clipPath>
            </defs>
            <path d="M22 2 L40 8 V26 C40 37 22 48 22 48 C22 48 4 37 4 26 V8 Z" fill="#0b1120" stroke="url(#cryGold)" strokeWidth="2" />
            <g clipPath="url(#cryClip)">
              {/* Halved field */}
              <rect x="4" y="2" width="18" height="46" fill="#1B458F" />
              <rect x="22" y="2" width="18" height="46" fill="#C4122D" />
              {/* Palace Tower & Eagle Silhouette */}
              <path d="M22 13 L26 21 L31 18 L25 29 L22 27 L19 29 L13 18 L18 21 Z" fill="#ffffff" />
              <rect x="20" y="29" width="4" height="6" fill="#fde047" />
            </g>
            <text x="22" y="42" textAnchor="middle" fill="#ffffff" fontSize="7" fontWeight="900" fontFamily="sans-serif" letterSpacing="0.05em">PALACE</text>
          </svg>
        );

      case 'TOT': // Spurs: Deep Navy & Lilywhite with Iconic Cockerel
        return (
          <svg viewBox="0 0 44 50" className="w-full h-full drop-shadow-[0_4px_12px_rgba(0,0,0,0.5)]">
            <defs>
              <linearGradient id="totSilver" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#ffffff" />
                <stop offset="100%" stopColor="#94a3b8" />
              </linearGradient>
            </defs>
            <path d="M22 2 L40 8 V26 C40 37 22 48 22 48 C22 48 4 37 4 26 V8 Z" fill="#132257" stroke="url(#totSilver)" strokeWidth="2" />
            {/* Vintage leather football */}
            <circle cx="22" cy="30" r="5.5" fill="none" stroke="#ffffff" strokeWidth="1.2" />
            <circle cx="22" cy="30" r="2.5" fill="#132257" stroke="#ffffff" strokeWidth="0.8" />
            {/* Cockerel body */}
            <path d="M22 12 C20 12 18 14 19 17 C17 17 15 19 16 22 L20 22 L21 24.5 L23 24.5 L24 22 C25 21 27 19 26 16 C25 13 24 12 22 12 Z" fill="#ffffff" />
            <polygon points="22,9 23.5,12 20.5,12" fill="#ffffff" />
            <text x="22" y="42" textAnchor="middle" fill="#ffffff" fontSize="7" fontWeight="900" fontFamily="sans-serif" letterSpacing="0.05em">SPURS</text>
          </svg>
        );

      case 'AVL': // Aston Villa: Rich Claret & Sky Blue with Golden Lion Rampant
        return (
          <svg viewBox="0 0 44 50" className="w-full h-full drop-shadow-[0_4px_12px_rgba(0,0,0,0.5)]">
            <defs>
              <linearGradient id="avlSky" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#bae6fd" />
                <stop offset="100%" stopColor="#38bdf8" />
              </linearGradient>
            </defs>
            <path d="M22 2 L40 8 V26 C40 37 22 48 22 48 C22 48 4 37 4 26 V8 Z" fill="#670E36" stroke="url(#avlSky)" strokeWidth="2.2" />
            {/* Prepared Lion Rampant */}
            <path d="M22 15 C23.5 14 25.5 15 25.5 17.5 C25.5 19.5 23.5 21 24.5 24 C25.5 25 27 25 27 27 C26 28.5 23.5 27.5 22 29.5 C21 31 18.5 28.5 20 26.5 C18.5 24 20 22 18.5 19.5 C18.5 16 20.5 15 22 15 Z" fill="#facc15" />
            <polygon points="21,11 22,8 23,11 25,11 23.5,13 24,15 22,13.5 20,15 20.5,13 19,11" fill="#facc15" />
            <text x="22" y="42" textAnchor="middle" fill="#95BFE5" fontSize="7" fontWeight="900" fontFamily="sans-serif" letterSpacing="0.05em">VILLA</text>
          </svg>
        );

      case 'BHA': // Brighton: Seagull Royal Blue & Bright Yellow
        return (
          <svg viewBox="0 0 44 50" className="w-full h-full drop-shadow-[0_4px_12px_rgba(0,0,0,0.5)]">
            <defs>
              <linearGradient id="bhaGold" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#fef08a" />
                <stop offset="100%" stopColor="#eab308" />
              </linearGradient>
            </defs>
            <path d="M22 2 L40 8 V26 C40 37 22 48 22 48 C22 48 4 37 4 26 V8 Z" fill="#0057B8" stroke="url(#bhaGold)" strokeWidth="2.2" />
            {/* Dynamic soaring seagull wings */}
            <path d="M10 22 Q17 16 22 23 Q27 16 34 22 Q27 19.5 22 27 Q17 19.5 10 22 Z" fill="#ffffff" />
            <circle cx="22" cy="30" r="1.8" fill="#FFCD00" />
            <text x="22" y="42" textAnchor="middle" fill="#ffffff" fontSize="7" fontWeight="900" fontFamily="sans-serif" letterSpacing="0.05em">ALBION</text>
          </svg>
        );

      case 'FUL': // Fulham: Classic Black & Crisp Lilywhite with Red Accent Band
        return (
          <svg viewBox="0 0 44 50" className="w-full h-full drop-shadow-[0_4px_12px_rgba(0,0,0,0.5)]">
            <path d="M22 2 L40 8 V26 C40 37 22 48 22 48 C22 48 4 37 4 26 V8 Z" fill="#0a0f1d" stroke="#ffffff" strokeWidth="2" />
            {/* Bold Red Sash */}
            <path d="M4 16 L40 16 L40 21 L4 21 Z" fill="#CC0000" />
            <text x="22" y="34" textAnchor="middle" fill="#ffffff" fontSize="12" fontWeight="900" fontFamily="sans-serif" letterSpacing="0.08em">FFC</text>
            <text x="22" y="43" textAnchor="middle" fill="#94a3b8" fontSize="5.5" fontWeight="800" fontFamily="sans-serif">FULHAM</text>
          </svg>
        );

      case 'NFO': // Nottingham Forest: Garibaldi Red with Majestic Forest Oak Tree & European Stars
        return (
          <svg viewBox="0 0 44 50" className="w-full h-full drop-shadow-[0_4px_12px_rgba(0,0,0,0.5)]">
            <defs>
              <linearGradient id="nfoGold" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#fef08a" />
                <stop offset="100%" stopColor="#ca8a04" />
              </linearGradient>
            </defs>
            <path d="M22 2 L40 8 V26 C40 37 22 48 22 48 C22 48 4 37 4 26 V8 Z" fill="#DD0000" stroke="#ffffff" strokeWidth="2" />
            {/* Nottingham Sherwood Oak motif */}
            <path d="M22 13 L27 20 H24 L28 25 H23 V30 H21 V25 H16 L20 20 H17 Z" fill="#ffffff" />
            {/* Two European Stars */}
            <polygon points="16,8 17,9.5 19,9.5 17.5,11 18,13 16,11.8 14,13 14.5,11 13,9.5 15,9.5" fill="url(#nfoGold)" />
            <polygon points="28,8 29,9.5 31,9.5 29.5,11 30,13 28,11.8 26,13 26.5,11 25,9.5 27,9.5" fill="url(#nfoGold)" />
            <text x="22" y="42" textAnchor="middle" fill="#ffffff" fontSize="6.5" fontWeight="900" fontFamily="sans-serif" letterSpacing="0.05em">FOREST</text>
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
    <div className={`inline-flex items-center gap-3 ${className}`}>
      <div className={`relative flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-105 ${currentSize.box}`}>
        {/* Glow halo */}
        {glow && (
          <div
            className="absolute inset-0 rounded-full blur-xl opacity-40 scale-125 pointer-events-none"
            style={{ backgroundColor: team.primary_color }}
          />
        )}

        {team.logo_url ? (
          <img
            src={team.logo_url}
            alt={`${team.name} badge`}
            className="w-full h-full object-contain relative z-10"
          />
        ) : (
          <div className="w-full h-full relative z-10">
            {renderCrestGraphic()}
          </div>
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
