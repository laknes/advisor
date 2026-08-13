'use client';

import { useLoading } from '@/context/LoadingContext';

/**
 * Hook for wrapping async operations with automatic loading state
 * Usage: const { withLoading } = useAsyncLoading();
 *        await withLoading(() => fetch(...));
 */
export function useAsyncLoading() {
  const { withLoading } = useLoading();
  return { withLoading };
}
