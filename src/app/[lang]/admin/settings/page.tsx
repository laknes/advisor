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
  otp: 'کد یکبار مصرف',
  general: 'تنظیمات عمومی',
  system: 'تنظیمات سیستم',
};

const groupDescriptions: Record<string, string> = {
  payments: 'کلیدها، وضعیت فعال بودن، sandbox و callback درگاه‌هایی مثل زرین‌پال، زیبال، IDPay و Pay.ir را از همین بخش مدیریت کنید.',
  market_data: 'URL و API key سرویس‌های قیمت بورس، فارکس، طلا، ارز و کریپتو را اینجا وارد کنید.',
  market_data_free: 'Providerهای رایگان یا دارای free tier مثل Alpha Vantage، Finnhub، Twelve Data، Polygon/Massive و CoinGecko را برای دریافت دیتای واقعی بازار پیکربندی کنید.',
  contact: 'نمایش منوی تماس در هدر، لینک چت آنلاین، شبکه‌های اجتماعی، ایمیل، تلفن و فعال بودن ثبت تیکت را از این بخش مدیریت کنید.',
  otp: 'ورود با شماره موبایل، تایید شماره، مدت اعتبار کد و تنظیمات اتصال سرویس پیامک را از این بخش مدیریت کنید.',
};

const settingLabels: Record<string, string> = {
  site_name: 'نام فارسی سایت', site_name_en: 'نام انگلیسی سایت', site_tagline: 'شعار سایت', site_logo_url: 'آدرس لوگوی سایت', site_favicon_url: 'آدرس فاوآیکون',
  contact_menu_enabled: 'فعال بودن منوی تماس', support_email: 'ایمیل پشتیبانی', support_phone: 'تلفن پشتیبانی', online_chat_url: 'آدرس چت آنلاین', online_chat_label: 'عنوان چت آنلاین', support_ticket_enabled: 'فعال بودن ثبت تیکت', telegram_url: 'آدرس تلگرام', instagram_url: 'آدرس اینستاگرام', whatsapp_url: 'آدرس واتساپ', linkedin_url: 'آدرس لینکدین', contact_note: 'متن راهنمای تماس',
  maintenance_mode: 'حالت تعمیر و نگهداری', allow_signup: 'اجازه ثبت‌نام کاربران',
  otp_enabled: 'فعال بودن ورود با کد یکبار مصرف', otp_code_length: 'تعداد ارقام کد یکبار مصرف', otp_ttl_minutes: 'مدت اعتبار کد (دقیقه)', otp_resend_seconds: 'فاصله ارسال مجدد کد (ثانیه)', otp_max_attempts: 'حداکثر تلاش برای ورود کد', otp_dev_show_code: 'نمایش کد در محیط توسعه', otp_sms_provider: 'سرویس پیامک', otp_sms_api_key: 'کلید API پیامک', otp_sms_sender: 'شماره ارسال‌کننده پیامک',
  default_currency: 'واحد پول پیش‌فرض', payment_default_gateway: 'درگاه پرداخت ایرانی پیش‌فرض', payment_callback_url: 'آدرس بازگشت پرداخت', zarinpal_enabled: 'فعال بودن زرین‌پال', zarinpal_merchant_id: 'شناسه پذیرنده زرین‌پال', zarinpal_sandbox: 'حالت آزمایشی زرین‌پال', zibal_enabled: 'فعال بودن زیبال', zibal_merchant: 'شناسه پذیرنده زیبال', idpay_enabled: 'فعال بودن IDPay', idpay_api_key: 'کلید API IDPay', payir_enabled: 'فعال بودن Pay.ir', payir_api_key: 'کلید API Pay.ir',
  market_data_enabled: 'فعال بودن همگام‌سازی داده بازار', market_data_refresh_seconds: 'فاصله به‌روزرسانی (ثانیه)', market_data_default_free_provider: 'provider رایگان پیش‌فرض', market_data_provider_priority: 'ترتیب اولویت providerها',
  alpha_vantage_enabled: 'فعال بودن Alpha Vantage', alpha_vantage_base_url: 'آدرس پایه Alpha Vantage', alpha_vantage_api_key: 'کلید API Alpha Vantage', alpha_vantage_docs_url: 'آدرس مستندات Alpha Vantage', finnhub_enabled: 'فعال بودن Finnhub', finnhub_base_url: 'آدرس پایه Finnhub', finnhub_api_key: 'کلید API Finnhub', finnhub_docs_url: 'آدرس مستندات Finnhub', twelve_data_enabled: 'فعال بودن Twelve Data', twelve_data_base_url: 'آدرس پایه Twelve Data', twelve_data_api_key: 'کلید API Twelve Data', twelve_data_docs_url: 'آدرس مستندات Twelve Data', polygon_enabled: 'فعال بودن Polygon / Massive', polygon_base_url: 'آدرس پایه Polygon / Massive', polygon_api_key: 'کلید API Polygon / Massive', polygon_docs_url: 'آدرس مستندات Polygon / Massive', coingecko_enabled: 'فعال بودن CoinGecko', coingecko_base_url: 'آدرس پایه CoinGecko', coingecko_api_key: 'کلید API CoinGecko', coingecko_docs_url: 'آدرس مستندات CoinGecko',
  tsetmc_enabled: 'فعال بودن داده بورس تهران', tsetmc_prices_url: 'آدرس API قیمت بورس تهران', tsetmc_api_key: 'کلید API بورس تهران', forex_enabled: 'فعال بودن داده فارکس', forex_prices_url: 'آدرس API قیمت فارکس', forex_api_key: 'کلید API فارکس', gold_enabled: 'فعال بودن داده طلا', gold_prices_url: 'آدرس API قیمت طلا', gold_api_key: 'کلید API طلا', currency_enabled: 'فعال بودن داده ارز', currency_prices_url: 'آدرس API قیمت ارز', currency_api_key: 'کلید API ارز', crypto_enabled: 'فعال بودن داده کریپتو', crypto_prices_url: 'آدرس API قیمت کریپتو', crypto_api_key: 'کلید API کریپتو',
  hero_title: 'عنوان بخش اصلی صفحه', hero_subtitle: 'زیرعنوان بخش اصلی صفحه', seo_title: 'عنوان سئو', seo_description: 'توضیحات سئو',
};

const isPersianText = (value: string) => /[\u0600-\u06FF]/.test(value);

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
        if (mounted) setStatus(error instanceof Error ? error.message : 'بارگذاری تنظیمات انجام نشد.');
      });

    return () => { mounted = false; };
  }, []);

  const groups = useMemo(() => settings.reduce<Record<string, SiteSetting[]>>((acc, setting) => {
    acc[setting.group] = acc[setting.group] || [];
    acc[setting.group].push(setting);
    return acc;
  }, {}), [settings]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus('در حال ذخیره تنظیمات...');

    try {
      const payload = { settings: settings.map((setting) => ({ key: setting.key, value: values[setting.key] })) };
      const data = await apiPut<{ settings: SiteSetting[] }>('/api/admin/settings', payload, true);
      setSettings(data.settings);
      setValues(Object.fromEntries(data.settings.map((setting) => [setting.key, setting.value])));
      setStatus('تنظیمات با موفقیت ذخیره شد.');
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'ذخیره تنظیمات انجام نشد.');
    }
  };

  return (
    <div className="min-h-screen bg-secondary-50">
      <Header isAuthenticated userName="مدیر" />
      <main className="py-12 md:py-20">
        <form onSubmit={handleSubmit} className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-10 flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <div>
              <div className="mb-4 inline-flex rounded-lg bg-primary-50 p-3 text-primary-700"><Settings className="h-6 w-6" /></div>
              <h1 className="text-4xl font-black tracking-tight text-secondary-900">تنظیمات <span className="text-primary-600">پلتفرم</span></h1>
              <p className="mt-2 max-w-3xl text-lg font-medium text-secondary-500">محتوای عمومی، سئو، اطلاعات پشتیبانی، تنظیمات مالی، ثبت‌نام و وضعیت سرویس‌ها را مدیریت کنید.</p>
            </div>
            <div className="flex items-center gap-3">
              {status && <span className="text-sm font-bold text-secondary-500">{status}</span>}
              <Button type="submit" size="lg" leftIcon={<Save className="h-5 w-5" />}>ذخیره تنظیمات</Button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {Object.entries(groups).map(([group, items]) => (
              <Card key={group} className="border-none bg-white p-6 shadow-xl">
                <div className="mb-6 flex items-center justify-between border-b border-secondary-100 pb-4">
                  <div>
                    <h2 className="text-2xl font-black text-secondary-900">{groupLabels[group] || 'سایر تنظیمات'}</h2>
                    {groupDescriptions[group] && <p className="mt-1 text-sm font-medium text-secondary-500">{groupDescriptions[group]}</p>}
                  </div>
                  <span className="rounded-lg bg-secondary-50 px-3 py-1 text-xs font-black text-secondary-500">{items.length} مورد</span>
                </div>

                <div className="space-y-5">
                  {items.map((setting) => {
                    const description = setting.description && isPersianText(setting.description) ? setting.description : null;
                    return (
                      <label key={setting.key} className="block">
                        <div className="mb-2 flex items-center justify-between gap-4">
                          <span className="font-bold text-secondary-900">{settingLabels[setting.key] || setting.label}</span>
                          {setting.isPublic && <span className="inline-flex items-center gap-1 rounded-lg bg-green-50 px-2 py-1 text-xs font-black text-green-700"><CheckCircle2 className="h-3 w-3" />عمومی</span>}
                        </div>
                        {setting.type === 'boolean' ? (
                          <select value={String(Boolean(values[setting.key]))} onChange={(event) => setValues((current) => ({ ...current, [setting.key]: event.target.value === 'true' }))} className="w-full rounded-lg border border-secondary-200 bg-white px-4 py-3 font-medium text-secondary-900 outline-none focus:border-primary-500">
                            <option value="true">فعال</option><option value="false">غیرفعال</option>
                          </select>
                        ) : setting.type === 'textarea' ? (
                          <textarea value={String(values[setting.key] ?? '')} onChange={(event) => setValues((current) => ({ ...current, [setting.key]: event.target.value }))} rows={4} className="w-full rounded-lg border border-secondary-200 bg-white px-4 py-3 font-medium text-secondary-900 outline-none focus:border-primary-500" />
                        ) : (
                          <input type={setting.type === 'email' ? 'email' : setting.type === 'password' ? 'password' : setting.type === 'number' ? 'number' : setting.type === 'url' ? 'url' : 'text'} value={String(values[setting.key] ?? '')} onChange={(event) => setValues((current) => ({ ...current, [setting.key]: event.target.value }))} className="w-full rounded-lg border border-secondary-200 bg-white px-4 py-3 font-medium text-secondary-900 outline-none focus:border-primary-500" />
                        )}
                        {['site_logo_url', 'site_favicon_url'].includes(setting.key) && String(values[setting.key] || '') && <div className="mt-3 flex items-center gap-3 rounded-lg border border-secondary-100 bg-secondary-50 p-3"><div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-lg bg-white shadow-sm"><img src={String(values[setting.key])} alt={settingLabels[setting.key] || setting.label} className="h-full w-full object-contain p-1" /></div><span className="text-xs font-bold text-secondary-500">پیش‌نمایش تصویر فعلی</span></div>}
                        {description && <p className="mt-2 text-xs font-medium text-secondary-400">{description}</p>}
                      </label>
                    );
                  })}
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
