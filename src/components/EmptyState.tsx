import React from 'react';
import { LucideIcon, Calendar, Trophy, AlertCircle } from 'lucide-react';

interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: LucideIcon;
  actionText?: string;
  onAction?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  icon: Icon = AlertCircle,
  actionText,
  onAction,
  className = '',
}) => {
  return (
    <div className={`flex flex-col items-center justify-center p-8 md:p-12 text-center rounded-xl bg-stadium-900/60 border border-stadium-800/80 ${className}`}>
      <div className="w-12 h-12 rounded-full bg-stadium-800 flex items-center justify-center text-slate-400 mb-4 border border-stadium-750">
        <Icon className="w-6 h-6 text-slate-400" />
      </div>
      <h3 className="text-sm md:text-base font-bold font-display uppercase tracking-wider text-slate-200">
        {title}
      </h3>
      {description && (
        <p className="mt-1 text-xs md:text-sm text-slate-400 max-w-sm">
          {description}
        </p>
      )}
      {actionText && onAction && (
        <button
          onClick={onAction}
          className="mt-4 px-4 py-2 text-xs font-bold uppercase tracking-wider text-gold-400 hover:text-white bg-gold-500/10 hover:bg-gold-500/20 border border-gold-500/30 rounded-lg transition-colors"
        >
          {actionText}
        </button>
      )}
    </div>
  );
};
