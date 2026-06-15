import React, { ReactNode, ButtonHTMLAttributes } from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, keyof HTMLMotionProps<'button'>>, Omit<HTMLMotionProps<'button'>, 'children'> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  fullWidth?: boolean;
  children?: ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (props_destructured, ref) => {
    const {
      className,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      fullWidth = false,
      disabled,
      children,
      whileHover,
      whileTap,
      ...props
    } = props_destructured;

    const baseStyles = 'inline-flex items-center justify-center gap-2 font-bold rounded-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-transparent';

    const variants = {
      primary: 'bg-white text-primary-900 hover:bg-primary-100 focus:ring-white shadow-lg shadow-primary-900/20',
      secondary: 'bg-white/14 text-white hover:bg-white/20 border border-white/15 focus:ring-white/40 backdrop-blur-xl',
      outline: 'border border-white/70 text-white hover:bg-white/10 focus:ring-white backdrop-blur-xl',
      danger: 'bg-red-500 text-white hover:bg-red-400 focus:ring-red-400',
      ghost: 'text-slate-200 hover:bg-white/10 focus:ring-white',
    };

    const sizes = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-6 py-2.5 text-base',
      lg: 'px-8 py-3 text-lg',
    };

    return (
      <motion.button
        ref={ref}
        disabled={isLoading || disabled}
        whileHover={whileHover || { scale: 1.02, translateY: -1 }}
        whileTap={whileTap || { scale: 0.98 }}
        className={cn(
          baseStyles,
          variants[variant],
          sizes[size],
          fullWidth && 'w-full',
          (isLoading || disabled) && 'opacity-50 cursor-not-allowed',
          className,
        )}
        {...props}
      >
        {isLoading ? (
          <Loader2 className="animate-spin h-4 w-4" />
        ) : leftIcon ? (
          <span>{leftIcon}</span>
        ) : null}
        {children}
        {rightIcon && <span>{rightIcon}</span>}
      </motion.button>
    );
  },
);

Button.displayName = 'Button';
