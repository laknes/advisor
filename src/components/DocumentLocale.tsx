'use client';

import { useEffect } from 'react';

interface DocumentLocaleProps {
  lang: 'fa' | 'en';
}

export function DocumentLocale({ lang }: DocumentLocaleProps) {
  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'fa' ? 'rtl' : 'ltr';
  }, [lang]);

  return null;
}
