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
    <div className={`flex flex-col items-center justify-center p-8 sm:p-12 text-center rounded-card bg-stadium-900 border border-stadium-800 ${className}`}>
      <div className="w-10 h-10 rounded-badge bg-stadium-950 border border-stadium-800 flex items-center justify-center text-[#9EA4AD] mb-3">
        <Icon className="w-5 h-5 text-[#9EA4AD]" />
      </div>

      <h3 className="text-sm sm:text-base font-bold font-display uppercase tracking-tight text-white">
        {title}
      </h3>

      {description && (
        <p className="mt-1 text-xs text-[#9EA4AD] max-w-md font-mono leading-relaxed">
          {description}
        </p>
      )}

      {actionText && onAction && (
        <button
          onClick={onAction}
          className="mt-4 px-4 py-2 text-xs font-mono font-bold uppercase tracking-wider text-stadium-980 bg-gold-400 hover:bg-gold-500 rounded-badge transition-colors"
        >
          {actionText}
        </button>
      )}
    </div>
  );
};
