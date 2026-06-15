import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
  helperText?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, icon, helperText, id, ...props }, ref) => {
    return (
      <div className="w-full group">
        {label && (
          <label htmlFor={id} className="block text-sm font-bold text-secondary-700 mb-2 transition-colors group-focus-within:text-primary-600">
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-secondary-400 group-focus-within:text-primary-500 transition-colors">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            id={id}
            className={cn(
              'w-full px-4 py-3 bg-white border-2 border-secondary-100 rounded-xl text-secondary-900 placeholder-secondary-400',
              'focus:outline-none focus:ring-4 focus:ring-primary-50 focus:border-primary-500',
              'transition-all duration-200 shadow-sm',
              icon && 'pl-11',
              error && 'border-red-200 focus:ring-red-50 focus:border-red-500',
              className,
            )}
            {...props}
          />
        </div>
        <AnimatePresence>
          {error && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex items-center gap-1.5 text-sm text-red-600 mt-2 font-medium"
            >
              <AlertCircle className="w-4 h-4" />
              <span>{error}</span>
            </motion.div>
          )}
        </AnimatePresence>
        {helperText && !error && <p className="text-sm text-secondary-500 mt-2 ml-1">{helperText}</p>}
      </div>
    );
  },
);

Input.displayName = 'Input';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
  maxLength?: number;
  showCharCount?: boolean;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, helperText, maxLength, showCharCount = false, id, ...props }, ref) => {
    const [charCount, setCharCount] = React.useState(0);

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={id} className="block text-sm font-medium text-secondary-700 mb-2">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={id}
          maxLength={maxLength}
          onChange={(e) => {
            setCharCount(e.target.value.length);
            props.onChange?.(e);
          }}
          className={cn(
            'w-full px-4 py-2.5 bg-white border border-secondary-200 rounded-lg text-secondary-900 placeholder-secondary-400',
            'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent',
            'transition-all duration-200 resize-none',
            error && 'border-red-300 focus:ring-red-500',
            className,
          )}
          {...props}
        />
        <div className="flex items-center justify-between mt-2">
          {error && <p className="text-sm text-red-600">{error}</p>}
          {helperText && !error && <p className="text-sm text-secondary-500">{helperText}</p>}
          {showCharCount && maxLength && <p className="text-sm text-secondary-500">{charCount} / {maxLength}</p>}
        </div>
      </div>
    );
  },
);

Textarea.displayName = 'Textarea';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: Array<{ value: string; label: string }>;
  placeholder?: string;
  helperText?: string;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, options, placeholder, helperText, id, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label htmlFor={id} className="block text-sm font-medium text-secondary-700 mb-2">
            {label}
          </label>
        )}
        <select
          ref={ref}
          id={id}
          className={cn(
            'w-full px-4 py-2.5 bg-white border border-secondary-200 rounded-lg text-secondary-900',
            'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent',
            'transition-all duration-200 appearance-none cursor-pointer',
            error && 'border-red-300 focus:ring-red-500',
            className,
          )}
          {...props}
        >
          {placeholder && <option value="">{placeholder}</option>}
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
        {helperText && !error && <p className="text-sm text-secondary-500 mt-2">{helperText}</p>}
      </div>
    );
  },
);

Select.displayName = 'Select';

interface FormGroupProps {
  children: React.ReactNode;
  className?: string;
  label?: string;
}

export const FormGroup: React.FC<FormGroupProps> = ({ children, className, label }) => (
  <div className={cn('space-y-2', className)}>
    {label && <label className="block text-sm font-medium text-secondary-700">{label}</label>}
    {children}
  </div>
);
