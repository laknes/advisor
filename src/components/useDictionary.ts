'use client';

import { useState, useEffect } from 'react';
import { useLocale } from './LocaleProvider';

export function useDictionary() {
  const { locale } = useLocale();
  const [dictionary, setDictionary] = useState<any>(null);

  useEffect(() => {
    const loadDictionary = async () => {
      const dict = await import(`@/dictionaries/${locale}.json`);
      setDictionary(dict.default);
    };
    loadDictionary();
  }, [locale]);

  return dictionary;
}
