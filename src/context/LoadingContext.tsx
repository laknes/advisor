'use client';

import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';

interface LoadingContextType {
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  withLoading: <T,>(fn: () => Promise<T>) => Promise<T>;
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);
const REQUEST_START_EVENT = 'advisor:loading-start';
const REQUEST_END_EVENT = 'advisor:loading-end';

export function LoadingProvider({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(false);
  const activeRequests = useRef(0);

  useEffect(() => {
    const handleRequestStart = () => {
      activeRequests.current += 1;
      setIsLoading(true);
    };

    const handleRequestEnd = () => {
      activeRequests.current = Math.max(0, activeRequests.current - 1);
      if (activeRequests.current === 0) setIsLoading(false);
    };

    window.addEventListener(REQUEST_START_EVENT, handleRequestStart);
    window.addEventListener(REQUEST_END_EVENT, handleRequestEnd);

    return () => {
      window.removeEventListener(REQUEST_START_EVENT, handleRequestStart);
      window.removeEventListener(REQUEST_END_EVENT, handleRequestEnd);
    };
  }, []);

  const withLoading = useCallback(async <T,>(fn: () => Promise<T>): Promise<T> => {
    try {
      setIsLoading(true);
      return await fn();
    } finally {
      setIsLoading(false);
    }
  }, []);

  return (
    <LoadingContext.Provider value={{ isLoading, setIsLoading, withLoading }}>
      {children}
    </LoadingContext.Provider>
  );
}

export function useLoading() {
  const context = useContext(LoadingContext);
  if (!context) {
    throw new Error('useLoading must be used within LoadingProvider');
  }
  return context;
}

export function notifyLoadingStart() {
  if (typeof window !== 'undefined') window.dispatchEvent(new Event(REQUEST_START_EVENT));
}

export function notifyLoadingEnd() {
  if (typeof window !== 'undefined') window.dispatchEvent(new Event(REQUEST_END_EVENT));
}
