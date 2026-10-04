import React from 'react';
import { PlayerStatEntry } from '../types/tournament';
import { TeamBadge } from './TeamBadge';
import { LucideIcon } from 'lucide-react';
import { EmptyState } from './EmptyState';

interface StatCardProps {
  title: string;
  subtitle: string;
  icon: LucideIcon;
  entries: PlayerStatEntry[];
  valueLabel: string;
  emptyTitle?: string;
  emptyDescription?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  subtitle,
  icon: Icon,
  entries,
  valueLabel,
  emptyTitle = 'NO DATA YET',
  emptyDescription = 'Statistics will appear once tournament matches are completed.',
}) => {
  return (
    <div className="rounded-xl bg-stadium-900 border border-stadium-800 overflow-hidden shadow-lg flex flex-col">
      {/* Header */}
      <div className="p-4 sm:p-5 bg-stadium-950/70 border-b border-stadium-800/80 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-stadium-800 border border-stadium-750 flex items-center justify-center text-gold-400">
            <Icon className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-display font-black text-base text-slate-100 uppercase tracking-wide">
              {title}
            </h3>
            <p className="text-xs text-slate-400">{subtitle}</p>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="p-2 sm:p-4 flex-1">
        {entries.length === 0 ? (
          <EmptyState
            title={emptyTitle}
            description={emptyDescription}
            icon={Icon}
            className="border-0 bg-transparent py-8"
          />
        ) : (
          <div className="divide-y divide-stadium-800/50">
            {entries.slice(0, 10).map((entry, index) => {
              const rank = index + 1;
              const isLeader = rank === 1;

              return (
                <div
                  key={entry.player_id}
                  className={`flex items-center justify-between p-3 rounded-lg transition-colors ${
                    isLeader ? 'bg-gold-500/[0.04]' : 'hover:bg-stadium-850/60'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`w-6 h-6 rounded flex items-center justify-center font-display font-black text-xs ${
                        isLeader
                          ? 'bg-gold-500 text-stadium-950'
                          : 'bg-stadium-800 text-slate-400 font-mono'
                      }`}
                    >
                      {rank}
                    </span>

                    <TeamBadge team={entry.team} size="sm" />

                    <div>
                      <span className="font-display font-bold text-sm text-slate-100 block">
                        {entry.player_name}
                      </span>
                      <span className="text-[11px] text-slate-400">
                        {entry.team.name}
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="font-display font-black text-base sm:text-lg text-gold-400">
                      {entry.value}
                    </span>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block -mt-1">
                      {valueLabel}
                    </span>
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
