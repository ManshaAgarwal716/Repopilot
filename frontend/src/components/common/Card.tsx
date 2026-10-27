import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  hoverable?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  onClick,
  hoverable = false,
}) => {
  return (
    <div
      onClick={onClick}
      className={`bg-charcoal-900 border border-charcoal-750/70 rounded-xl transition-all duration-150 ${
        hoverable
          ? 'hover:border-charcoal-600 hover:bg-charcoal-850 cursor-pointer'
          : ''
      } ${className}`}
    >
      {children}
    </div>
  );
};

export const CardHeader: React.FC<{
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}> = ({ title, subtitle, action, className = '' }) => {
  return (
    <div className={`p-4 border-b border-charcoal-750/70 flex items-center justify-between ${className}`}>
      <div>
        <h3 className="text-sm font-semibold text-charcoal-100 flex items-center gap-2">{title}</h3>
        {subtitle && <p className="text-xs text-charcoal-400 mt-0.5">{subtitle}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
};

export const CardContent: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = '',
}) => {
  return <div className={`p-4 ${className}`}>{children}</div>;
};
