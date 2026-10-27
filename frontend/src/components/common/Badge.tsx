import React from 'react';

export type BadgeVariant = 'emerald' | 'amber' | 'rose' | 'cyan' | 'indigo' | 'zinc';

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  size?: 'sm' | 'md';
  className?: string;
  dot?: boolean;
}

const variantStyles: Record<BadgeVariant, { bg: string; text: string; border: string; dot: string }> = {
  emerald: {
    bg: 'bg-emerald-950/40',
    text: 'text-emerald-300',
    border: 'border-emerald-800/40',
    dot: 'bg-emerald-400',
  },
  amber: {
    bg: 'bg-amber-950/40',
    text: 'text-amber-300',
    border: 'border-amber-800/40',
    dot: 'bg-amber-400',
  },
  rose: {
    bg: 'bg-rose-950/40',
    text: 'text-rose-300',
    border: 'border-rose-800/40',
    dot: 'bg-rose-400',
  },
  cyan: {
    bg: 'bg-cyan-950/40',
    text: 'text-cyan-300',
    border: 'border-cyan-800/40',
    dot: 'bg-cyan-400',
  },
  indigo: {
    bg: 'bg-indigo-950/40',
    text: 'text-indigo-300',
    border: 'border-indigo-800/40',
    dot: 'bg-indigo-400',
  },
  zinc: {
    bg: 'bg-charcoal-800/60',
    text: 'text-charcoal-300',
    border: 'border-charcoal-700/60',
    dot: 'bg-charcoal-400',
  },
};

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'zinc',
  size = 'sm',
  className = '',
  dot = false,
}) => {
  const v = variantStyles[variant];
  const sizeClass = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs';

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium rounded-full border ${v.bg} ${v.text} ${v.border} ${sizeClass} ${className}`}
    >
      {dot && <span className={`w-1.5 h-1.5 rounded-full ${v.dot}`} />}
      {children}
    </span>
  );
};
