import React, { useState } from 'react';
import { Player, Team } from '../types/tournament';
import { Shield } from 'lucide-react';

interface PlayerAvatarProps {
  player: Player;
  team?: Team;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  showCaptainBadge?: boolean;
  className?: string;
  glow?: boolean;
}

const sizeClasses = {
  xs: 'w-7 h-7 text-[10px]',
  sm: 'w-9 h-9 text-xs',
  md: 'w-12 h-12 text-sm',
  lg: 'w-16 h-16 text-base',
  xl: 'w-24 h-24 text-xl',
  '2xl': 'w-32 h-32 sm:w-40 sm:h-40 text-2xl sm:text-3xl',
};

const badgeSizeClasses = {
  xs: 'w-3 h-3 text-[7px]',
  sm: 'w-3.5 h-3.5 text-[8px]',
  md: 'w-4 h-4 text-[9px]',
  lg: 'w-5 h-5 text-[10px]',
  xl: 'w-6 h-6 text-xs',
  '2xl': 'w-7 h-7 text-xs font-black',
};

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

export const PlayerAvatar: React.FC<PlayerAvatarProps> = ({
  player,
  team,
  size = 'md',
  showCaptainBadge = false,
  className = '',
  glow = false,
}) => {
  const [imageFailed, setImageFailed] = useState(false);

  const teamColor = team?.primary_color || '#1e293b';
  const hasPhoto = Boolean(player.photo_url) && !imageFailed;
  const initials = getInitials(player.name);

  // Position badge colors for fallback
  const getPositionStyle = () => {
    switch (player.position) {
      case 'GK':
        return 'border-amber-500/40 text-amber-300';
      case 'CB':
        return 'border-sky-500/40 text-sky-300';
      case 'CF':
        return 'border-rose-500/40 text-rose-300';
      case 'MID':
        return 'border-emerald-500/40 text-emerald-300';
      default:
        return 'border-stadium-700 text-slate-300';
    }
  };

  return (
    <div
      className={`relative inline-flex items-center justify-center shrink-0 rounded-2xl select-none ${sizeClasses[size]} ${className}`}
      style={glow ? { boxShadow: `0 0 20px ${teamColor}40` } : undefined}
    >
      <div
        className={`w-full h-full rounded-2xl overflow-hidden flex items-center justify-center border transition-all duration-300 ${
          hasPhoto ? 'border-stadium-750 bg-[#070b12]' : `border-stadium-750/80 bg-stadium-950`
        }`}
      >
        {hasPhoto ? (
          <img
            src={player.photo_url}
            alt={player.name}
            onError={() => setImageFailed(true)}
            className="w-full h-full object-cover object-top transition-transform duration-300 hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div
            className="w-full h-full flex flex-col items-center justify-center p-1 relative overflow-hidden"
            style={{
              background: `radial-gradient(circle at 50% 30%, ${teamColor}35, #080d17 80%)`,
            }}
          >
            {/* Subtle kit collar accent */}
            <div
              className="absolute top-0 w-6 h-1 rounded-b opacity-60"
              style={{ backgroundColor: teamColor }}
            />
            <span className="font-display font-black tracking-wider text-slate-200">
              {initials}
            </span>
            {size !== 'xs' && size !== 'sm' && (
              <span
                className={`text-[9px] font-mono font-bold tracking-widest uppercase mt-0.5 opacity-75 ${getPositionStyle()}`}
              >
                {player.position}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Captain badge */}
      {showCaptainBadge && player.is_captain && (
        <span
          className={`absolute -bottom-1 -right-1 rounded-full font-mono font-black uppercase flex items-center justify-center bg-gold-400 text-stadium-980 border border-stadium-950 shadow-md ${badgeSizeClasses[size]}`}
          title="Team Captain"
        >
          C
        </span>
      )}
    </div>
  );
};
