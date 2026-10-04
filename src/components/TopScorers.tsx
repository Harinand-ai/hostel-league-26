import React from 'react';
import { PlayerStatEntry } from '../types/tournament';
import { TeamBadge } from './TeamBadge';
import { Flame } from 'lucide-react';
import { EmptyState } from './EmptyState';

interface TopScorersProps {
  scorers: PlayerStatEntry[];
  limit?: number;
  onViewAll?: () => void;
}

export const TopScorers: React.FC<TopScorersProps> = ({
  scorers,
  limit = 5,
  onViewAll,
}) => {
  const displayScorers = limit ? scorers.slice(0, limit) : scorers;

  if (displayScorers.length === 0) {
    return (
      <EmptyState
        title="NO GOALSCORER DATA YET"
        description="Goalscorer statistics will appear after matches are completed."
        icon={Flame}
      />
    );
  }

  return (
    <div className="w-full rounded-xl bg-stadium-900 border border-stadium-800 overflow-hidden shadow-lg">
      <div className="divide-y divide-stadium-800/60">
        {displayScorers.map((entry, index) => {
          const rank = index + 1;
          const isGoldenBoot = rank === 1;

          return (
            <div
              key={entry.player_id}
              className={`flex items-center justify-between p-3.5 sm:p-4 transition-colors ${
                isGoldenBoot ? 'bg-gold-500/[0.04]' : 'hover:bg-stadium-850/60'
              }`}
            >
              {/* Rank & Player info */}
              <div className="flex items-center gap-3">
                <span
                  className={`w-6 h-6 rounded flex items-center justify-center font-display font-black text-xs ${
                    isGoldenBoot
                      ? 'bg-gold-500 text-stadium-950 font-black shadow-sm'
                      : 'bg-stadium-800 text-slate-400 font-mono'
                  }`}
                >
                  {rank}
                </span>

                <TeamBadge team={entry.team} size="sm" />

                <div>
                  <h4 className="font-display font-bold text-sm text-slate-100">
                    {entry.player_name}
                  </h4>
                  <p className="text-[11px] text-slate-400">
                    {entry.team.name}
                  </p>
                </div>
              </div>

              {/* Goals counter */}
              <div className="flex items-center gap-2">
                <div className="text-right">
                  <span className="font-display font-black text-lg sm:text-xl text-gold-400">
                    {entry.value}
                  </span>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block -mt-1">
                    {entry.value === 1 ? 'Goal' : 'Goals'}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {onViewAll && scorers.length > limit && (
        <div className="p-3 bg-stadium-950/60 border-t border-stadium-800/60 text-center">
          <button
            onClick={onViewAll}
            className="text-xs font-bold uppercase tracking-wider text-gold-400 hover:text-white transition-colors"
          >
            View Full Leaderboard →
          </button>
        </div>
      )}
    </div>
  );
};
