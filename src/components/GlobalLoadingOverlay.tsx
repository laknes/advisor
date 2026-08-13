'use client';

import { useLoading } from '@/context/LoadingContext';
import { Loader } from 'lucide-react';

export function GlobalLoadingOverlay() {
  const { isLoading } = useLoading();

  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-2xl p-8 flex flex-col items-center gap-4">
        <div className="animate-spin">
          <Loader className="w-12 h-12 text-primary-600" strokeWidth={1.5} />
        </div>
        <div className="text-center">
          <p className="text-lg font-semibold text-secondary-900">درحال بارگذاری...</p>
          <p className="text-sm text-secondary-500">لطفا صبر کنید</p>
        </div>
      </div>
    </div>
  );
}
