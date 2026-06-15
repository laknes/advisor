'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { toPersianDigits, translateFaUiText } from '@/lib/format';

type Locale = 'en' | 'fa';

interface LocaleContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  dir: 'ltr' | 'rtl';
}

const LocaleContext = createContext<LocaleContextType | undefined>(undefined);

export function LocaleProvider({ 
  children, 
  initialLocale 
}: { 
  children: React.ReactNode; 
  initialLocale: Locale;
}) {
  const [locale, setLocaleState] = useState<Locale>(initialLocale);
  const pathname = usePathname();
  const router = useRouter();

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale);
    // Update URL
    const segments = pathname.split('/');
    segments[1] = newLocale;
    router.push(segments.join('/'));
  };

  const dir = locale === 'fa' ? 'rtl' : 'ltr';

  useEffect(() => {
    document.documentElement.dir = dir;
    document.documentElement.lang = locale;
  }, [dir, locale]);

  useEffect(() => {
    if (locale !== 'fa') return;

    const ignoredTags = new Set(['SCRIPT', 'STYLE', 'TEXTAREA', 'INPUT', 'CODE', 'PRE']);

    const localizeText = (value: string) => toPersianDigits(translateFaUiText(value));

    const localizeNode = (node: Node) => {
      if (node.nodeType === Node.TEXT_NODE && node.textContent) {
        const localizedText = localizeText(node.textContent);
        if (localizedText !== node.textContent) {
          node.textContent = localizedText;
        }
        return;
      }

      if (node.nodeType !== Node.ELEMENT_NODE) return;
      const element = node as HTMLElement;
      if (ignoredTags.has(element.tagName)) return;

      ['placeholder', 'title', 'aria-label'].forEach((attribute) => {
        const value = element.getAttribute(attribute);
        if (!value) return;
        const localizedValue = localizeText(value);
        if (localizedValue !== value) element.setAttribute(attribute, localizedValue);
      });

      element.childNodes.forEach(localizeNode);
    };

    localizeNode(document.body);

    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach(localizeNode);
        if (mutation.type === 'characterData') localizeNode(mutation.target);
      });
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true,
    });

    return () => observer.disconnect();
  }, [locale]);

  return (
    <LocaleContext.Provider value={{ locale, setLocale, dir }}>
      {children}
    </LocaleContext.Provider>
  );
}

export function useLocale() {
  const context = useContext(LocaleContext);
  if (context === undefined) {
    throw new Error('useLocale must be used within a LocaleProvider');
  }
  return context;
}
