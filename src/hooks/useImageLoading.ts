'use client';

import { useEffect } from 'react';
import { notifyLoadingEnd, notifyLoadingStart } from '@/context/LoadingContext';

export function useImageLoading() {
  useEffect(() => {
    const trackedImages = new WeakSet<HTMLImageElement>();
    const pendingImages = new Set<HTMLImageElement>();

    const trackImage = (image: HTMLImageElement) => {
      if (trackedImages.has(image) || image.complete) return;

      trackedImages.add(image);
      pendingImages.add(image);
      notifyLoadingStart();

      const finish = () => {
        if (!pendingImages.delete(image)) return;
        image.removeEventListener('load', finish);
        image.removeEventListener('error', finish);
        notifyLoadingEnd();
      };

      image.addEventListener('load', finish, { once: true });
      image.addEventListener('error', finish, { once: true });
    };

    const scanImages = () => {
      document.querySelectorAll('img').forEach((image) => trackImage(image));
    };

    scanImages();
    const observer = new MutationObserver(scanImages);
    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      observer.disconnect();
      pendingImages.forEach((image) => {
        image.dispatchEvent(new Event('error'));
      });
      pendingImages.clear();
    };
  }, []);
}
