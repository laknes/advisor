'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import { Header, Footer, Card, Button } from '@/components';
import { apiGet, apiPut } from '@/lib/apiClient';
import { useLocale } from '@/components/LocaleProvider';
import { CheckCircle2, Save, Settings } from 'lucide-react';

interface SiteSetting { id: string; key: string; value: unknown; group: string; label: string; description?: string | null; type: string; isPublic: boolean; }
type Locale = 'fa' | 'en';

const groups: Record<Locale, Record<string, string>> = {
  fa: { payments: 'مدیریت درگاه‌های پرداخت ایرانی', market_data_free: 'APIهای رایگان دیتای واقعی بازار', market_data: 'مدیریت API دیتای واقعی بازار', billing: 'تنظیمات مالی و واحد پول', content: 'محتوای سایت', seo: 'سئو', contact: 'راه‌های ارتباطی', otp: 'کد یکبار مصرف', general: 'تنظیمات عمومی', system: 'تنظیمات سیستم' },
  en: { payments: 'Iranian payment gateways', market_data_free: 'Free real market data APIs', market_data: 'Real market data APIs', billing: 'Billing and currency', content: 'Site content', seo: 'SEO', contact: 'Contact details', otp: 'One-time password', general: 'General settings', system: 'System settings' },
};
const descriptions: Record<Locale, Record<string, string>> = {
  fa: { payments: 'کلیدها، وضعیت فعال بودن، sandbox و callback درگاه‌های پرداخت را مدیریت کنید.', market_data: 'URL و API key سرویس‌های قیمت بازار را اینجا وارد کنید.', market_data_free: 'Providerهای رایگان دریافت دیتای واقعی بازار را پیکربندی کنید.', contact: 'اطلاعات تماس، شبکه‌های اجتماعی و ثبت تیکت را مدیریت کنید.', otp: 'ورود با شماره موبایل و تنظیمات سرویس پیامک را مدیریت کنید.' },
  en: { payments: 'Manage payment gateway keys, activation status, sandbox mode, and callbacks.', market_data: 'Configure URLs and API keys for market price services.', market_data_free: 'Configure free providers for real market data.', contact: 'Manage contact details, social links, and ticket submission.', otp: 'Manage mobile login and SMS provider settings.' },
};
const faLabels: Record<string, string> = {
  site_name: 'نام فارسی سایت', site_name_en: 'نام انگلیسی سایت', site_tagline: 'شعار سایت', site_logo_url: 'آدرس لوگوی سایت', site_favicon_url: 'آدرس فاوآیکون', contact_menu_enabled: 'فعال بودن منوی تماس', support_email: 'ایمیل پشتیبانی', support_phone: 'تلفن پشتیبانی', online_chat_url: 'آدرس چت آنلاین', online_chat_label: 'عنوان چت آنلاین', support_ticket_enabled: 'فعال بودن ثبت تیکت', telegram_url: 'آدرس تلگرام', instagram_url: 'آدرس اینستاگرام', whatsapp_url: 'آدرس واتساپ', linkedin_url: 'آدرس لینکدین', contact_note: 'متن راهنمای تماس', maintenance_mode: 'حالت تعمیر و نگهداری', allow_signup: 'اجازه ثبت‌نام کاربران', otp_enabled: 'فعال بودن ورود با کد یکبار مصرف', otp_code_length: 'تعداد ارقام کد یکبار مصرف', otp_ttl_minutes: 'مدت اعتبار کد (دقیقه)', otp_resend_seconds: 'فاصله ارسال مجدد کد (ثانیه)', otp_max_attempts: 'حداکثر تلاش برای ورود کد', otp_dev_show_code: 'نمایش کد در محیط توسعه', otp_sms_provider: 'سرویس پیامک', otp_sms_api_key: 'کلید API پیامک', otp_sms_sender: 'شماره ارسال‌کننده پیامک', default_currency: 'واحد پول پیش‌فرض', payment_default_gateway: 'درگاه پرداخت ایرانی پیش‌فرض', payment_callback_url: 'آدرس بازگشت پرداخت', market_data_enabled: 'فعال بودن همگام‌سازی داده بازار', market_data_refresh_seconds: 'فاصله به‌روزرسانی (ثانیه)', market_data_default_free_provider: 'provider رایگان پیش‌فرض', market_data_provider_priority: 'ترتیب اولویت providerها', hero_title: 'عنوان بخش اصلی صفحه', hero_subtitle: 'زیرعنوان بخش اصلی صفحه', seo_title: 'عنوان سئو', seo_description: 'توضیحات سئو',
};
const enLabels: Record<string, string> = {
  site_name: 'Persian site name', site_name_en: 'English site name', site_tagline: 'Site tagline', site_logo_url: 'Site logo URL', site_favicon_url: 'Favicon URL', contact_menu_enabled: 'Contact menu enabled', support_email: 'Support email', support_phone: 'Support phone', online_chat_url: 'Online chat URL', online_chat_label: 'Online chat label', support_ticket_enabled: 'Ticket submission enabled', telegram_url: 'Telegram URL', instagram_url: 'Instagram URL', whatsapp_url: 'WhatsApp URL', linkedin_url: 'LinkedIn URL', contact_note: 'Contact menu note', maintenance_mode: 'Maintenance mode', allow_signup: 'Allow user sign-up', otp_enabled: 'OTP login enabled', otp_code_length: 'OTP code length', otp_ttl_minutes: 'OTP expiry in minutes', otp_resend_seconds: 'OTP resend delay in seconds', otp_max_attempts: 'Maximum OTP attempts', otp_dev_show_code: 'Show OTP code in development', otp_sms_provider: 'SMS provider', otp_sms_api_key: 'SMS API key', otp_sms_sender: 'SMS sender number', default_currency: 'Default currency', payment_default_gateway: 'Default Iranian payment gateway', payment_callback_url: 'Payment callback URL', market_data_enabled: 'Market data sync enabled', market_data_refresh_seconds: 'Refresh interval in seconds', market_data_default_free_provider: 'Default free market data provider', market_data_provider_priority: 'Provider priority order', hero_title: 'Hero title', hero_subtitle: 'Hero subtitle', seo_title: 'SEO title', seo_description: 'SEO description',
};
const isPersian = (value: string) => /[\u0600-\u06FF]/.test(value);
const fallbackLabel = (key: string) => key.split('_').map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join(' ');

export default function AdminSettingsPage() {
  const { locale } = useLocale();
  const language: Locale = locale === 'fa' ? 'fa' : 'en';
  const isFa = language === 'fa';
  const [settings, setSettings] = useState<SiteSetting[]>([]);
  const [values, setValues] = useState<Record<string, unknown>>({});
  const [status, setStatus] = useState('');

  useEffect(() => {
    let mounted = true;
    apiGet<{ settings: SiteSetting[] }>('/api/admin/settings', true).then((data) => {
      if (!mounted) return;
      setSettings(data.settings);
      setValues(Object.fromEntries(data.settings.map((setting) => [setting.key, setting.value])));
    }).catch((error) => { if (mounted) setStatus(error instanceof Error ? error.message : (isFa ? 'بارگذاری تنظیمات انجام نشد.' : 'Failed to load settings.')); });
    return () => { mounted = false; };
  }, [isFa]);

  const groupedSettings = useMemo(() => settings.reduce<Record<string, SiteSetting[]>>((result, setting) => {
    result[setting.group] = result[setting.group] || [];
    result[setting.group].push(setting);
    return result;
  }, {}), [settings]);
  const labelFor = (setting: SiteSetting) => (isFa ? faLabels[setting.key] : enLabels[setting.key]) || (isFa ? (isPersian(setting.label) ? setting.label : fallbackLabel(setting.key)) : (isPersian(setting.label) ? fallbackLabel(setting.key) : setting.label));
  const descriptionFor = (setting: SiteSetting) => setting.description && isPersian(setting.description) === isFa ? setting.description : null;

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus(isFa ? 'در حال ذخیره تنظیمات...' : 'Saving settings...');
    try {
      const data = await apiPut<{ settings: SiteSetting[] }>('/api/admin/settings', { settings: settings.map((setting) => ({ key: setting.key, value: values[setting.key] })) }, true);
      setSettings(data.settings);
      setValues(Object.fromEntries(data.settings.map((setting) => [setting.key, setting.value])));
      setStatus(isFa ? 'تنظیمات با موفقیت ذخیره شد.' : 'Settings saved successfully.');
    } catch (error) { setStatus(error instanceof Error ? error.message : (isFa ? 'ذخیره تنظیمات انجام نشد.' : 'Failed to save settings.')); }
  };

  return <div className="min-h-screen bg-secondary-50">
    <Header isAuthenticated userName={isFa ? 'مدیر' : 'Admin'} />
    <main className="py-12 md:py-20"><form onSubmit={handleSubmit} className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div className="mb-10 flex flex-col justify-between gap-6 md:flex-row md:items-end"><div>
        <div className="mb-4 inline-flex rounded-lg bg-primary-50 p-3 text-primary-700"><Settings className="h-6 w-6" /></div>
        <h1 className="text-4xl font-black tracking-tight text-secondary-900">{isFa ? <>تنظیمات <span className="text-primary-600">پلتفرم</span></> : <>Platform <span className="text-primary-600">Settings</span></>}</h1>
        <p className="mt-2 max-w-3xl text-lg font-medium text-secondary-500">{isFa ? 'محتوای عمومی، سئو، اطلاعات پشتیبانی، تنظیمات مالی، ثبت‌نام و وضعیت سرویس‌ها را مدیریت کنید.' : 'Manage public content, SEO, support details, billing, sign-up, and service status.'}</p>
      </div><div className="flex items-center gap-3">{status && <span className="text-sm font-bold text-secondary-500">{status}</span>}<Button type="submit" size="lg" leftIcon={<Save className="h-5 w-5" />}>{isFa ? 'ذخیره تنظیمات' : 'Save settings'}</Button></div></div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">{Object.entries(groupedSettings).map(([group, items]) => <Card key={group} className="border-none bg-white p-6 shadow-xl">
        <div className="mb-6 flex items-center justify-between border-b border-secondary-100 pb-4"><div><h2 className="text-2xl font-black text-secondary-900">{groups[language][group] || (isFa ? 'سایر تنظیمات' : 'Other settings')}</h2>{descriptions[language][group] && <p className="mt-1 text-sm font-medium text-secondary-500">{descriptions[language][group]}</p>}</div><span className="rounded-lg bg-secondary-50 px-3 py-1 text-xs font-black text-secondary-500">{items.length} {isFa ? 'مورد' : 'items'}</span></div>
        <div className="space-y-5">{items.map((setting) => <label key={setting.key} className="block"><div className="mb-2 flex items-center justify-between gap-4"><span className="font-bold text-secondary-900">{labelFor(setting)}</span>{setting.isPublic && <span className="inline-flex items-center gap-1 rounded-lg bg-green-50 px-2 py-1 text-xs font-black text-green-700"><CheckCircle2 className="h-3 w-3" />{isFa ? 'عمومی' : 'Public'}</span>}</div>
          {setting.type === 'boolean' ? <select value={String(Boolean(values[setting.key]))} onChange={(event) => setValues((current) => ({ ...current, [setting.key]: event.target.value === 'true' }))} className="w-full rounded-lg border border-secondary-200 bg-white px-4 py-3 font-medium text-secondary-900 outline-none focus:border-primary-500"><option value="true">{isFa ? 'فعال' : 'Enabled'}</option><option value="false">{isFa ? 'غیرفعال' : 'Disabled'}</option></select> : setting.type === 'textarea' ? <textarea value={String(values[setting.key] ?? '')} onChange={(event) => setValues((current) => ({ ...current, [setting.key]: event.target.value }))} rows={4} className="w-full rounded-lg border border-secondary-200 bg-white px-4 py-3 font-medium text-secondary-900 outline-none focus:border-primary-500" /> : <input type={setting.type === 'email' ? 'email' : setting.type === 'password' ? 'password' : setting.type === 'number' ? 'number' : setting.type === 'url' ? 'url' : 'text'} value={String(values[setting.key] ?? '')} onChange={(event) => setValues((current) => ({ ...current, [setting.key]: event.target.value }))} className="w-full rounded-lg border border-secondary-200 bg-white px-4 py-3 font-medium text-secondary-900 outline-none focus:border-primary-500" />}
          {['site_logo_url', 'site_favicon_url'].includes(setting.key) && String(values[setting.key] || '') && <div className="mt-3 flex items-center gap-3 rounded-lg border border-secondary-100 bg-secondary-50 p-3"><div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-lg bg-white shadow-sm"><img src={String(values[setting.key])} alt={labelFor(setting)} className="h-full w-full object-contain p-1" /></div><span className="text-xs font-bold text-secondary-500">{isFa ? 'پیش‌نمایش تصویر فعلی' : 'Current image preview'}</span></div>}{descriptionFor(setting) && <p className="mt-2 text-xs font-medium text-secondary-400">{descriptionFor(setting)}</p>}</label>)}</div>
      </Card>)}</div>
    </form></main><Footer />
  </div>;
}
