'use client';

import { useLoading } from '@/context/LoadingContext';
import { LoadingState } from './LoadingState';

export function GlobalLoadingOverlay() {
  const { isLoading } = useLoading();

  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm">
      <LoadingState label="در حال بارگذاری..." className="min-h-0" />
    </div>
  );
}
