'use client';

import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LoadingStateProps {
  label?: string;
  fullScreen?: boolean;
  className?: string;
}

export function LoadingState({ label = 'در حال بارگذاری...', fullScreen = false, className }: LoadingStateProps) {
  return (
    <div
      className={cn(
        'flex items-center justify-center px-6',
        fullScreen ? 'min-h-screen' : 'min-h-[12rem]',
        className,
      )}
      role="status"
      aria-live="polite"
    >
      <div className="glass-panel flex min-w-[11rem] flex-col items-center gap-3 rounded-2xl px-7 py-6 text-center">
        <Loader2 className="h-7 w-7 animate-spin text-primary-200" strokeWidth={1.7} />
        <span className="text-sm font-semibold text-slate-200">{label}</span>
      </div>
    </div>
  );
}
