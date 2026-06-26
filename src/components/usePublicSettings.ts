'use client';

import { useEffect, useState } from 'react';
import { apiGet } from '@/lib/apiClient';

export type PublicSettings = Record<string, unknown>;

export function usePublicSettings() {
  const [settings, setSettings] = useState<PublicSettings>({});

  useEffect(() => {
    let mounted = true;

    apiGet<{ settings: PublicSettings }>('/api/settings')
      .then((data) => {
        if (mounted) setSettings(data.settings);
      })
      .catch(() => {
        if (mounted) setSettings({});
      });

    return () => {
      mounted = false;
    };
  }, []);

  return settings;
}

export function getBrandName(settings: PublicSettings, locale: string) {
  const localizedName = locale === 'en' ? settings.site_name_en : settings.site_name;
  const fallback = locale === 'en' ? 'mousavi invest' : 'سرمایه گذاری موسوی';

  return String(localizedName || settings.site_name || fallback);
}

export function getBrandLogoUrl(settings: PublicSettings) {
  return String(settings.site_logo_url || '');
}
