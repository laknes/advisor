'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import { Header, Footer, Card, Button } from '@/components';
import { apiGet, apiPut } from '@/lib/apiClient';
import { CheckCircle2, Save, Settings } from 'lucide-react';

interface SiteSetting {
  id: string;
  key: string;
  value: unknown;
  group: string;
  label: string;
  description?: string | null;
  type: string;
  isPublic: boolean;
}

const groupLabels: Record<string, string> = {
  payments: 'مدیریت درگاه‌های پرداخت ایرانی',
  market_data_free: 'APIهای رایگان دیتای واقعی بازار',
  market_data: 'مدیریت API دیتای واقعی بازار',
  billing: 'تنظیمات مالی و واحد پول',
  content: 'محتوای سایت',
  seo: 'سئو',
  contact: 'راه‌های ارتباطی',
  general: 'تنظیمات عمومی',
  system: 'تنظیمات سیستم',
};

const groupDescriptions: Record<string, string> = {
  payments: 'کلیدها، وضعیت فعال بودن، sandbox و callback درگاه‌هایی مثل زرین‌پال، زیبال، IDPay و Pay.ir را از همین بخش مدیریت کنید.',
  market_data: 'URL و API key سرویس‌های قیمت بورس، فارکس، طلا، ارز و کریپتو را اینجا وارد کنید.',
  market_data_free: 'Providerهای رایگان یا دارای free tier مثل Alpha Vantage، Finnhub، Twelve Data، Polygon/Massive و CoinGecko را برای دریافت دیتای واقعی بازار پیکربندی کنید.',
};

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<SiteSetting[]>([]);
  const [values, setValues] = useState<Record<string, unknown>>({});
  const [status, setStatus] = useState('');

  useEffect(() => {
    let mounted = true;
    apiGet<{ settings: SiteSetting[] }>('/api/admin/settings', true)
      .then((data) => {
        if (!mounted) return;
        setSettings(data.settings);
        setValues(Object.fromEntries(data.settings.map((setting) => [setting.key, setting.value])));
      })
      .catch((error) => {
        if (mounted) setStatus(error.message);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const groups = useMemo(() => {
    return settings.reduce<Record<string, SiteSetting[]>>((acc, setting) => {
      acc[setting.group] = acc[setting.group] || [];
      acc[setting.group].push(setting);
      return acc;
    }, {});
  }, [settings]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus('Saving...');

    try {
      const payload = {
        settings: settings.map((setting) => ({
          key: setting.key,
          value: values[setting.key],
        })),
      };
      const data = await apiPut<{ settings: SiteSetting[] }>('/api/admin/settings', payload, true);
      setSettings(data.settings);
      setValues(Object.fromEntries(data.settings.map((setting) => [setting.key, setting.value])));
      setStatus('Settings saved.');
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Failed to save settings.');
    }
  };

  return (
    <div className="min-h-screen bg-secondary-50">
      <Header isAuthenticated userName="Admin" />

      <main className="py-12 md:py-20">
        <form onSubmit={handleSubmit} className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-10 flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <div>
              <div className="mb-4 inline-flex rounded-lg bg-primary-50 p-3 text-primary-700">
                <Settings className="h-6 w-6" />
              </div>
              <h1 className="text-4xl font-black tracking-tight text-secondary-900">
                Site <span className="text-primary-600">Settings</span>
              </h1>
              <p className="mt-2 max-w-3xl text-lg font-medium text-secondary-500">
                Manage public content, SEO, support details, billing defaults, signup access, and operational switches from the database.
              </p>
            </div>
            <div className="flex items-center gap-3">
              {status && <span className="text-sm font-bold text-secondary-500">{status}</span>}
              <Button type="submit" size="lg" leftIcon={<Save className="h-5 w-5" />}>
                Save Settings
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {Object.entries(groups).map(([group, items]) => (
              <Card key={group} className="border-none bg-white p-6 shadow-xl">
                <div className="mb-6 flex items-center justify-between border-b border-secondary-100 pb-4">
                  <div>
                    <h2 className="text-2xl font-black text-secondary-900">{groupLabels[group] || group}</h2>
                    {groupDescriptions[group] && <p className="mt-1 text-sm font-medium text-secondary-500">{groupDescriptions[group]}</p>}
                  </div>
                  <span className="rounded-lg bg-secondary-50 px-3 py-1 text-xs font-black text-secondary-500">
                    {items.length} settings
                  </span>
                </div>

                <div className="space-y-5">
                  {items.map((setting) => (
                    <label key={setting.key} className="block">
                      <div className="mb-2 flex items-center justify-between gap-4">
                        <span className="font-bold text-secondary-900">{setting.label}</span>
                        {setting.isPublic && (
                          <span className="inline-flex items-center gap-1 rounded-lg bg-green-50 px-2 py-1 text-xs font-black text-green-700">
                            <CheckCircle2 className="h-3 w-3" />
                            Public
                          </span>
                        )}
                      </div>

                      {setting.type === 'boolean' ? (
                        <select
                          value={String(Boolean(values[setting.key]))}
                          onChange={(event) => setValues((current) => ({ ...current, [setting.key]: event.target.value === 'true' }))}
                          className="w-full rounded-lg border border-secondary-200 bg-white px-4 py-3 font-medium text-secondary-900 outline-none focus:border-primary-500"
                        >
                          <option value="true">Enabled</option>
                          <option value="false">Disabled</option>
                        </select>
                      ) : setting.type === 'textarea' ? (
                        <textarea
                          value={String(values[setting.key] ?? '')}
                          onChange={(event) => setValues((current) => ({ ...current, [setting.key]: event.target.value }))}
                          rows={4}
                          className="w-full rounded-lg border border-secondary-200 bg-white px-4 py-3 font-medium text-secondary-900 outline-none focus:border-primary-500"
                        />
                      ) : (
                        <input
                          type={setting.type === 'email' ? 'email' : setting.type === 'password' ? 'password' : setting.type === 'number' ? 'number' : setting.type === 'url' ? 'url' : 'text'}
                          value={String(values[setting.key] ?? '')}
                          onChange={(event) => setValues((current) => ({ ...current, [setting.key]: event.target.value }))}
                          className="w-full rounded-lg border border-secondary-200 bg-white px-4 py-3 font-medium text-secondary-900 outline-none focus:border-primary-500"
                        />
                      )}

                      {['site_logo_url', 'site_favicon_url'].includes(setting.key) && String(values[setting.key] || '') && (
                        <div className="mt-3 flex items-center gap-3 rounded-lg border border-secondary-100 bg-secondary-50 p-3">
                          <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-lg bg-white shadow-sm">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={String(values[setting.key])} alt={setting.label} className="h-full w-full object-contain p-1" />
                          </div>
                          <span className="text-xs font-bold text-secondary-500">پیش‌نمایش تصویر فعلی</span>
                        </div>
                      )}

                      {setting.description && <p className="mt-2 text-xs font-medium text-secondary-400">{setting.description}</p>}
                    </label>
                  ))}
                </div>
              </Card>
            ))}
          </div>
        </form>
      </main>

      <Footer />
    </div>
  );
}
