'use client';

import { useLocale } from './LocaleProvider';
import { Button } from './Button';
import { Globe } from 'lucide-react';

export const LanguageSwitcher = () => {
  const { locale, setLocale } = useLocale();

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setLocale(locale === 'fa' ? 'en' : 'fa')}
        className="flex items-center gap-1.5 px-2 font-bold sm:gap-2 sm:px-3"
      >
        <Globe className="w-4 h-4" />
        <span className="sm:hidden">{locale === 'fa' ? 'EN' : 'FA'}</span>
        <span className="hidden sm:inline">{locale === 'fa' ? 'English' : 'Farsi'}</span>
      </Button>
    </div>
  );
};
