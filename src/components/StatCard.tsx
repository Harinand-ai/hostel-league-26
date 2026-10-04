import React from 'react';
import { motion } from 'framer-motion';
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
    <div className="rounded-2xl bg-[#090d16] border border-stadium-750 overflow-hidden shadow-broadcast flex flex-col">
      {/* Header */}
      <div className="p-5 bg-stadium-950/80 border-b border-stadium-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-stadium-850 border border-stadium-750 flex items-center justify-center text-emerald-400">
            <Icon className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-display font-black text-base text-white uppercase tracking-tight">
              {title}
            </h3>
            <p className="text-xs text-slate-400 font-mono">{subtitle}</p>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="p-3 sm:p-4 flex-1">
        {entries.length === 0 ? (
          <EmptyState
            title={emptyTitle}
            description={emptyDescription}
            icon={Icon}
            className="border-0 bg-transparent py-10"
          />
        ) : (
          <div className="divide-y divide-stadium-800/50">
            {entries.slice(0, 10).map((entry, index) => {
              const rank = index + 1;
              const isLeader = rank === 1;

              return (
                <motion.div
                  key={entry.player_id}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: index * 0.04 }}
                  className={`flex items-center justify-between p-3.5 rounded-xl transition-colors ${
                    isLeader ? 'bg-gold-500/[0.04]' : 'hover:bg-stadium-850/60'
                  }`}
                >
                  <div className="flex items-center gap-3.5">
                    <span
                      className={`font-display font-black text-2xl w-8 text-center ${
                        isLeader
                          ? 'text-gold-400 drop-shadow-[0_0_12px_rgba(245,158,11,0.5)]'
                          : 'text-slate-500'
                      }`}
                    >
                      {rank}
                    </span>

                    <TeamBadge team={entry.team} size="sm" />

                    <div>
                      <span className="font-display font-black text-sm text-white block uppercase tracking-tight">
                        {entry.player_name}
                      </span>
                      <span className="text-[11px] text-slate-400 font-mono">
                        {entry.team.name}
                      </span>
                    </div>
                  </div>

                  <div className="text-right font-mono">
                    <span className="font-display font-black text-lg sm:text-xl text-gold-400">
                      {entry.value}
                    </span>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block -mt-1">
                      {valueLabel}
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
