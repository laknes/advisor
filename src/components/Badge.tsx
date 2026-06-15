import React, { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatFaNumber } from '@/lib/format';

interface BadgeProps {
  variant?: 'success' | 'danger' | 'warning' | 'info' | 'neutral';
  children: ReactNode;
  className?: string;
  pulse?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({ variant = 'neutral', children, className, pulse = false }) => {
  const variants = {
    success: 'bg-primary-100 text-primary-900 border border-primary-200',
    danger: 'bg-red-100 text-red-800 border border-red-200',
    warning: 'bg-white text-primary-900 border border-white',
    info: 'bg-blue-100 text-blue-800 border border-blue-200',
    neutral: 'bg-secondary-100 text-secondary-800 border border-secondary-200',
  };

  return (
    <motion.span 
      initial={pulse ? { scale: 0.95, opacity: 0.8 } : undefined}
      animate={pulse ? { scale: 1, opacity: 1 } : undefined}
      transition={pulse ? { repeat: Infinity, repeatType: 'reverse', duration: 1.5 } : undefined}
      className={cn('inline-flex items-center px-3 py-1 text-xs font-bold rounded-full', variants[variant], className)}
    >
      {children}
    </motion.span>
  );
};

interface PriceChangeProps {
  value: number;
  showSign?: boolean;
  format?: 'number' | 'percent';
  showIcon?: boolean;
  className?: string;
}

export const PriceChange: React.FC<PriceChangeProps> = ({ 
  value, 
  showSign = true, 
  format = 'number', 
  showIcon = true,
  className
}) => {
  const isPositive = value > 0;
  const isNegative = value < 0;
  const displayValue = format === 'percent'
    ? `${formatFaNumber(value * 100, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}٪`
    : formatFaNumber(value, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const sign = showSign && isPositive ? '+' : '';

  return (
    <span className={cn(
      'font-bold inline-flex items-center gap-1', 
      isPositive && 'text-primary-200', 
      isNegative && 'text-red-600', 
      !isPositive && !isNegative && 'text-secondary-500',
      className
    )}>
      {showIcon && (
        isPositive ? <ArrowUpRight className="w-4 h-4" /> : isNegative ? <ArrowDownRight className="w-4 h-4" /> : null
      )}
      {sign}
      {displayValue}
    </span>
  );
};

interface TrendIndicatorProps {
  trend: 'up' | 'down' | 'neutral';
  size?: 'sm' | 'md' | 'lg';
}

export const TrendIndicator: React.FC<TrendIndicatorProps> = ({ trend, size = 'md' }) => {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  };

  const colors = {
    up: 'text-primary-200',
    down: 'text-red-600',
    neutral: 'text-secondary-400',
  };

  const icons = {
    up: <TrendingUp className={sizes[size]} />,
    down: <TrendingDown className={sizes[size]} />,
    neutral: <Minus className={sizes[size]} />,
  };

  return <span className={cn(colors[trend])}>{icons[trend]}</span>;
};

interface StatBlockProps {
  label: string;
  value: string | number;
  unit?: string;
  change?: number;
  trend?: 'up' | 'down' | 'neutral';
  icon?: ReactNode;
}

export const StatBlock: React.FC<StatBlockProps> = ({ label, value, unit, change, trend, icon }) => (
  <div className="space-y-1">
    <div className="flex items-center gap-2">
      {icon && <span className="flex-shrink-0">{icon}</span>}
      <p className="text-sm text-slate-300 font-bold">{label}</p>
    </div>
    <div className="flex items-baseline gap-2">
      <span className="text-2xl font-black text-white">
        {value}
        {unit && <span className="text-lg text-slate-400 ml-1">{unit}</span>}
      </span>
      {change !== undefined && trend && (
        <div className="flex items-center gap-1">
          <TrendIndicator trend={trend} size="sm" />
          <PriceChange value={change} showIcon={false} />
        </div>
      )}
    </div>
  </div>
);
