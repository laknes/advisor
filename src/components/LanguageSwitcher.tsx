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
        className="flex items-center gap-2 font-bold"
      >
        <Globe className="w-4 h-4" />
        <span>{locale === 'fa' ? 'انگلیسی' : 'فارسی'}</span>
      </Button>
    </div>
  );
};
