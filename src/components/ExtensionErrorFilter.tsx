'use client';

import { useEffect } from 'react';

function isMetaMaskExtensionError(value: unknown) {
  const text = value instanceof Error
    ? `${value.message} ${value.stack || ''}`
    : String(value || '');

  return (
    text.includes('Failed to connect to MetaMask')
    || text.includes('chrome-extension://nkbihfbeogaeaoehlefnkodbefgpgknn/')
    || text.includes('scripts/inpage.js')
    || text.includes('MetaMask')
    || text.includes('ethereum#initialized')
    || text.includes('eip6963')
  );
}

export function ExtensionErrorFilter() {
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      if (
        isMetaMaskExtensionError(event.error)
        || isMetaMaskExtensionError(event.message)
        || isMetaMaskExtensionError(event.filename)
      ) {
        event.preventDefault();
        event.stopImmediatePropagation();
      }
    };

    const handleRejection = (event: PromiseRejectionEvent) => {
      if (isMetaMaskExtensionError(event.reason)) {
        event.preventDefault();
        event.stopImmediatePropagation();
      }
    };

    const blockWalletAccess = () => {
      try {
        Object.defineProperty(window, 'ethereum', {
          configurable: true,
          enumerable: false,
          get: () => undefined,
          set: () => true,
        });
        Object.defineProperty(window, 'web3', {
          configurable: true,
          enumerable: false,
          get: () => undefined,
          set: () => true,
        });
      } catch {
        try {
          delete (window as Window & { ethereum?: unknown }).ethereum;
          delete (window as Window & { web3?: unknown }).web3;
        } catch {
          // Browser extensions can make these globals non-configurable.
        }
      }
    };

    const handleProviderEvent = (event: Event) => {
      event.preventDefault();
      event.stopImmediatePropagation();
    };

    window.addEventListener('error', handleError, true);
    window.addEventListener('unhandledrejection', handleRejection, true);
    window.addEventListener('ethereum#initialized', handleProviderEvent, true);
    window.addEventListener('eip6963:announceProvider', handleProviderEvent, true);
    window.addEventListener('eip6963:requestProvider', handleProviderEvent, true);
    blockWalletAccess();
    const intervalId = window.setInterval(blockWalletAccess, 500);

    return () => {
      window.removeEventListener('error', handleError, true);
      window.removeEventListener('unhandledrejection', handleRejection, true);
      window.removeEventListener('ethereum#initialized', handleProviderEvent, true);
      window.removeEventListener('eip6963:announceProvider', handleProviderEvent, true);
      window.removeEventListener('eip6963:requestProvider', handleProviderEvent, true);
      window.clearInterval(intervalId);
    };
  }, []);

  return null;
}
