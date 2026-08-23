'use client';

import { useState, useEffect } from 'react';
import { useLocale } from './LocaleProvider';
import en from '@/dictionaries/en.json';
import fa from '@/dictionaries/fa.json';

const dictionaries = { en, fa } as const;

export function useDictionary() {
  const { locale } = useLocale();
  const [dictionary, setDictionary] = useState<any>(null);

  useEffect(() => {
    setDictionary(dictionaries[locale]);
  }, [locale]);

  return dictionary;
}
