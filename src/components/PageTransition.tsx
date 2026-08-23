'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';
import { ReactNode, useEffect, useRef, useState } from 'react';
import { useLocale } from './LocaleProvider';
import { LoadingState } from './LoadingState';

export const PageTransition = ({ children }: { children: ReactNode }) => {
  const pathname = usePathname();
  const { locale } = useLocale();
  const isEnglish = locale === 'en';
  const [isRouting, setIsRouting] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setIsRouting(false);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, [pathname]);

  useEffect(() => {
    const finishSafely = () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => setIsRouting(false), 2600);
    };

    const startLoading = () => {
      setIsRouting(true);
      finishSafely();
    };

    const handleClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const target = event.target instanceof Element ? event.target.closest('a[href]') : null;
      if (!(target instanceof HTMLAnchorElement)) return;
      if (target.target && target.target !== '_self') return;
      if (target.hasAttribute('download')) return;

      const href = target.getAttribute('href');
      if (!href || href.startsWith('mailto:') || href.startsWith('tel:') || href.startsWith('#')) return;

      let nextUrl: URL;
      try {
        nextUrl = new URL(href, window.location.href);
      } catch {
        return;
      }

      if (nextUrl.origin !== window.location.origin) return;
      const currentPath = `${window.location.pathname}${window.location.search}`;
      const nextPath = `${nextUrl.pathname}${nextUrl.search}`;
      if (currentPath === nextPath) return;

      startLoading();
    };

    document.addEventListener('click', handleClick, true);
    window.addEventListener('beforeunload', startLoading);

    return () => {
      document.removeEventListener('click', handleClick, true);
      window.removeEventListener('beforeunload', startLoading);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  return (
    <>
      <AnimatePresence>
        {isRouting && <RouteLoadingOverlay isEnglish={isEnglish} />}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        <motion.div
          key={pathname}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
          className="flex flex-1 flex-col"
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </>
  );
};

function RouteLoadingOverlay({ isEnglish }: { isEnglish: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.18, ease: 'easeOut' }}
      className="fixed inset-0 z-[9998] grid place-items-center overflow-hidden bg-black/20 px-6 backdrop-blur-sm"
      role="status"
      aria-live="polite"
      aria-label={isEnglish ? 'Page is loading' : 'در حال بارگذاری صفحه'}
    >
      <LoadingState label={isEnglish ? 'Loading...' : 'در حال بارگذاری...'} className="min-h-0" />
    </motion.div>
  );
}
