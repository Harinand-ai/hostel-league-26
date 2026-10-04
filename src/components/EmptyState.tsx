import React from 'react';
import { LucideIcon, AlertCircle } from 'lucide-react';

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
    <div className={`relative overflow-hidden flex flex-col items-center justify-center p-8 sm:p-14 text-center rounded-3xl bg-[#090d16] border border-stadium-750 shadow-broadcast ${className}`}>
      {/* Subtle Turf Pattern in Empty State */}
      <div className="absolute inset-0 turf-stripes opacity-20 pointer-events-none" />

      {/* Center Icon */}
      <div className="relative z-10 w-14 h-14 rounded-2xl bg-stadium-850/80 border border-stadium-700 flex items-center justify-center text-slate-400 mb-4 shadow-inner">
        <Icon className="w-6 h-6 text-slate-400" />
      </div>

      <h3 className="relative z-10 text-base sm:text-lg font-black font-display uppercase tracking-tight text-white">
        {title}
      </h3>

      {description && (
        <p className="relative z-10 mt-1.5 text-xs sm:text-sm text-slate-400 max-w-md font-mono leading-relaxed">
          {description}
        </p>
      )}

      {actionText && onAction && (
        <button
          onClick={onAction}
          className="relative z-10 mt-5 px-5 py-2.5 text-xs font-mono font-bold uppercase tracking-wider text-stadium-980 bg-gold-500 hover:bg-gold-600 rounded-xl transition-all shadow-md shadow-gold-500/10"
        >
          {actionText}
        </button>
      )}
    </div>
  );
};
