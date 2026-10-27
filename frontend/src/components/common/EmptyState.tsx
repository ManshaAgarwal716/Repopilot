import React from 'react';
import { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
  secondaryActionText?: string;
  onSecondaryAction?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon,
  title,
  description,
  actionText,
  onAction,
  secondaryActionText,
  onSecondaryAction,
  className = '',
}) => {
  return (
    <div
      className={`border border-dashed border-charcoal-700/80 rounded-xl p-8 text-center flex flex-col items-center justify-center bg-charcoal-900/40 ${className}`}
    >
      <div className="w-12 h-12 rounded-xl bg-charcoal-800/80 border border-charcoal-700 flex items-center justify-center text-charcoal-300 mb-3 shadow-inner">
        <Icon className="w-6 h-6 stroke-[1.5]" />
      </div>
      <h4 className="text-sm font-semibold text-charcoal-100 mb-1">{title}</h4>
      <p className="text-xs text-charcoal-400 max-w-sm mb-4 leading-relaxed">{description}</p>
      {(actionText || secondaryActionText) && (
        <div className="flex flex-wrap items-center justify-center gap-2.5">
          {actionText && onAction && (
            <button
              onClick={onAction}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-brand-cyan/15 hover:bg-brand-cyan/25 text-brand-cyan border border-brand-cyan/30 text-xs font-medium transition-colors focus:outline-none focus:ring-1 focus:ring-brand-cyan"
            >
              {actionText}
            </button>
          )}
          {secondaryActionText && onSecondaryAction && (
            <button
              onClick={onSecondaryAction}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-charcoal-800 hover:bg-charcoal-750 text-charcoal-300 border border-charcoal-700 text-xs font-medium transition-colors"
            >
              {secondaryActionText}
            </button>
          )}
        </div>
      )}
    </div>
  );
};
