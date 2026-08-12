'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';
import { ReactNode, useEffect, useRef, useState } from 'react';

export const PageTransition = ({ children }: { children: ReactNode }) => {
  const pathname = usePathname();
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
        {isRouting && <RouteLoadingOverlay />}
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

function RouteLoadingOverlay() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.18, ease: 'easeOut' }}
      className="fixed inset-0 z-[9998] grid place-items-center overflow-hidden bg-[rgba(var(--theme-bg-rgb),0.82)] px-6 backdrop-blur-xl"
      role="status"
      aria-live="polite"
      aria-label="در حال بارگذاری صفحه"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_42%,color-mix(in_srgb,var(--theme-accent)_26%,transparent),transparent_24rem)]" />
      <div className="absolute inset-0 opacity-40 [background-image:linear-gradient(rgba(255,255,255,0.055)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.055)_1px,transparent_1px)] [background-size:54px_54px] [mask-image:radial-gradient(circle_at_center,black,transparent_72%)]" />

      <motion.div
        initial={{ scale: 0.92, y: 14 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.96, y: -10 }}
        transition={{ duration: 0.26, ease: 'easeOut' }}
        className="relative flex w-[min(21rem,100%)] flex-col items-center rounded-lg border border-white/15 bg-white/[0.08] p-7 text-center shadow-2xl shadow-black/30 backdrop-blur-2xl"
      >
        <div className="relative h-28 w-28 [perspective:720px]">
          <motion.div
            animate={{ rotateX: [62, 62], rotateZ: 360 }}
            transition={{ duration: 2.2, repeat: Infinity, ease: 'linear' }}
            className="absolute inset-2 rounded-full border border-primary-100/50 shadow-[0_0_34px_rgba(216,180,254,0.34)]"
          />
          <motion.div
            animate={{ rotateX: [68, 68], rotateZ: -360 }}
            transition={{ duration: 3.2, repeat: Infinity, ease: 'linear' }}
            className="absolute inset-5 rounded-full border border-cyan-200/45"
          />
          <motion.div
            animate={{ rotateY: 360, rotateX: [0, 18, 0] }}
            transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute left-1/2 top-1/2 h-12 w-12 -translate-x-1/2 -translate-y-1/2 rounded-lg border border-white/25 bg-gradient-to-br from-primary-100 via-white to-cyan-100 shadow-[0_0_30px_rgba(216,180,254,0.45)]"
          />
          {[0, 1, 2].map((item) => (
            <motion.span
              key={item}
              animate={{ scale: [0.85, 1.12, 0.85], opacity: [0.45, 1, 0.45] }}
              transition={{ duration: 1.4, repeat: Infinity, delay: item * 0.18, ease: 'easeInOut' }}
              className="absolute bottom-3 h-2.5 w-2.5 rounded-full bg-primary-100 shadow-[0_0_16px_rgba(216,180,254,0.7)]"
              style={{ right: `${34 + item * 17}%` }}
            />
          ))}
        </div>

        <p className="mt-5 text-sm font-black text-white">در حال آماده‌سازی صفحه</p>
        <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: '-100%' }}
            transition={{ duration: 1.15, repeat: Infinity, ease: 'easeInOut' }}
            className="h-full w-1/2 rounded-full bg-gradient-to-l from-primary-100 via-cyan-100 to-emerald-200"
          />
        </div>
      </motion.div>
    </motion.div>
  );
}
