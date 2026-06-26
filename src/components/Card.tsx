import React, { ReactNode } from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { cn } from '@/lib/utils';

interface CardProps extends Omit<HTMLMotionProps<'div'>, 'children' | 'onClick'> {
  children: ReactNode;
  className?: string;
  noPadding?: boolean;
  hoverable?: boolean;
  onClick?: () => void;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ children, className, noPadding = false, hoverable = false, onClick, ...props }, ref) => {
    const classNames = typeof className === 'string' ? className : '';
    const isLightSurface = /\b!?bg-(white|secondary-50|red-50|green-50|blue-50|yellow-50)\b/.test(classNames);

    return (
      <motion.div
        ref={ref}
        onClick={onClick}
        whileHover={hoverable ? { translateY: -4, boxShadow: '0 24px 70px -28px rgba(216, 180, 254, 0.5)' } : undefined}
        transition={{ duration: 0.2 }}
        className={cn(
          'rounded-lg overflow-hidden',
          isLightSurface ? 'card-light border border-secondary-100 text-secondary-900 shadow-xl shadow-black/5' : 'glass-panel text-slate-100',
          hoverable && 'cursor-pointer',
          !noPadding && 'p-6',
          className,
        )}
        {...props}
      >
        {children}
      </motion.div>
    );
  },
);

Card.displayName = 'Card';

interface CardHeaderProps {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  icon?: ReactNode;
}

export const CardHeader: React.FC<CardHeaderProps> = ({ title, subtitle, action, icon }) => (
  <div data-card-header className="flex items-center justify-between mb-4 pb-4 border-b border-white/10">
    <div className="flex items-center gap-3">
      {icon && <div className="p-2 bg-white/10 rounded-lg">{icon}</div>}
      <div>
        <h3 data-card-title className="text-lg font-semibold text-white">{title}</h3>
        {subtitle && <p data-card-subtitle className="text-sm text-slate-300 mt-1">{subtitle}</p>}
      </div>
    </div>
    {action && <div>{action}</div>}
  </div>
);

interface CardContentProps {
  children: ReactNode;
  className?: string;
}

export const CardContent: React.FC<CardContentProps> = ({ children, className }) => (
  <div className={cn('space-y-4', className)}>{children}</div>
);

interface CardFooterProps {
  children: ReactNode;
  className?: string;
}

export const CardFooter: React.FC<CardFooterProps> = ({ children, className }) => (
  <div className={cn('flex items-center justify-between gap-4 pt-4 border-t border-white/10 mt-4', className)}>
    {children}
  </div>
);
