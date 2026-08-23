'use client';

import { useLocale } from '@/components/LocaleProvider';
import { LoadingState } from '@/components/LoadingState';

export default function Loading() {
  const { locale } = useLocale();

  return <LoadingState fullScreen label={locale === 'en' ? 'Loading...' : 'در حال بارگذاری...'} />;
}
