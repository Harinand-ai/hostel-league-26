import React from 'react';
import { PlayerStatEntry, Player } from '../types/tournament';
import { TeamBadge } from './TeamBadge';
import { PlayerAvatar } from './PlayerAvatar';
import { LucideIcon, ChevronRight } from 'lucide-react';
import { EmptyState } from './EmptyState';

interface StatCardProps {
  title: string;
  subtitle: string;
  icon: LucideIcon;
  entries: PlayerStatEntry[];
  valueLabel: string;
  emptyTitle?: string;
  emptyDescription?: string;
  allPlayers?: Player[];
  onSelectPlayer?: (playerId: string) => void;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  subtitle,
  icon: Icon,
  entries,
  valueLabel,
  emptyTitle = 'NO DATA YET',
  emptyDescription = 'Statistics will appear once tournament matches are completed.',
  allPlayers = [],
  onSelectPlayer,
}) => {
  const playersMap = React.useMemo(() => new Map(allPlayers.map(p => [p.id, p])), [allPlayers]);

  return (
    <div className="rounded-xl bg-white border border-slate-200 overflow-hidden shadow-xs flex flex-col">
      {/* Header */}
      <div className="p-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700">
            <Icon className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-extrabold text-sm text-slate-900 uppercase tracking-tight">
              {title}
            </h3>
            <p className="text-[11px] text-slate-500">{subtitle}</p>
          </div>
        </div>
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
          {valueLabel}
        </span>
      </div>

      {/* Body */}
      <div className="p-2 sm:p-3 flex-1">
        {entries.length === 0 ? (
          <EmptyState
            title={emptyTitle}
            description={emptyDescription}
            icon={Icon}
            className="border-0 bg-transparent py-8"
          />
        ) : (
          <div className="divide-y divide-slate-100">
            {entries.slice(0, 10).map((entry, index) => {
              const rank = index + 1;
              const isLeader = rank === 1;

              return (
                <div
                  key={entry.player_id}
                  className={`flex items-center justify-between p-2.5 rounded-lg transition-colors ${
                    isLeader ? 'bg-amber-50/50' : 'hover:bg-slate-50'
                  } ${onSelectPlayer ? 'cursor-pointer group' : ''}`}
                  onClick={() => onSelectPlayer?.(entry.player_id)}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`font-extrabold text-base w-6 text-center ${
                        isLeader ? 'text-amber-600' : 'text-slate-400'
                      }`}
                    >
                      {rank}
                    </span>

                    {playersMap.get(entry.player_id) ? (
                      <PlayerAvatar
                        player={playersMap.get(entry.player_id)!}
                        team={entry.team}
                        size="xs"
                      />
                    ) : (
                      <TeamBadge team={entry.team} size="xs" />
                    )}

                    <div className="min-w-0">
                      <span className="font-bold text-xs sm:text-sm text-slate-900 block truncate group-hover:text-emerald-700 transition-colors">
                        {entry.player_name}
                      </span>
                      <span className="text-[10px] text-slate-500 font-medium truncate block">
                        {entry.team.name}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-base text-slate-900 font-mono">
                      {entry.value}
                    </span>
                    {onSelectPlayer && (
                      <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-700 group-hover:translate-x-0.5 transition-all" />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
