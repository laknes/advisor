'use client';

import { useEffect, useState } from 'react';
import { Header, Card, Button } from '@/components';
import { formatFaDate, formatFaNumber } from '@/lib/format';
import { apiGet, apiPost } from '@/lib/apiClient';
import { cn } from '@/lib/utils';
import { useLocale } from '@/components/LocaleProvider';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Activity,
  BarChart3,
  Bell,
  CreditCard,
  FileText,
  Gauge,
  LayoutDashboard,
  Percent,
  Plus,
  Settings,
  ShieldCheck,
  RefreshCw,
  Users,
  WalletCards,
} from 'lucide-react';

const adminLinks = [
  { href: '', label: 'مرکز مدیریت', icon: LayoutDashboard },
  { href: '/users', label: 'کاربران', icon: Users },
  { href: '/subscriptions', label: 'اشتراک‌ها', icon: CreditCard },
  { href: '/analyses', label: 'تحلیل‌ها', icon: FileText },
  { href: '/pricing', label: 'پلن‌ها', icon: WalletCards },
  { href: '/discounts', label: 'تخفیف‌ها', icon: Percent },
  { href: '/reports', label: 'گزارش‌ها', icon: BarChart3 },
  { href: '/settings', label: 'تنظیمات', icon: Settings },
];

interface AdminStats {
  totals: {
    users: number;
    activeSubscriptions: number;
    activeAnalyses: number;
    markets: number;
    monthlyRevenue: number;
    monthlyTransactions: number;
  };
  recentUsers: Array<{
    id: string;
    name: string | null;
    email: string;
    verified: boolean;
    createdAt: string;
  }>;
}

interface IntegrationStatus {
  payments: {
    defaultGateway: unknown;
    callbackConfigured: boolean;
    gateways: Array<{ key: string; label: string; enabled: boolean; configured: boolean }>;
  };
  marketData: {
    enabled: boolean;
    refreshSeconds: number;
    providers: Array<{ key: string; label: string; enabled: boolean; configured: boolean }>;
    priceCount: number;
    latestPrice?: {
      symbol: string;
      currentPrice: number;
      timestamp: string;
      market?: { name: string };
    } | null;
  };
}

export default function AdminDashboard() {
  const { locale } = useLocale();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [integrations, setIntegrations] = useState<IntegrationStatus | null>(null);
  const [syncStatus, setSyncStatus] = useState('');

  useEffect(() => {
    let mounted = true;
    Promise.allSettled([
      apiGet<{ stats: AdminStats }>('/api/admin/stats', true),
      apiGet<{ status: IntegrationStatus }>('/api/admin/integrations/status', true),
    ]).then((results) => {
      if (!mounted) return;
      const [statsResult, integrationsResult] = results;
      if (statsResult.status === 'fulfilled') setStats(statsResult.value.stats);
      if (integrationsResult.status === 'fulfilled') setIntegrations(integrationsResult.value.status);
    });

    return () => {
      mounted = false;
    };
  }, []);

  const syncMarketData = async () => {
    setSyncStatus('در حال سینک...');
    try {
      const data = await apiPost<{ result: { updated: number } }>('/api/admin/market-data/sync', undefined, true);
      setSyncStatus(`${formatFaNumber(data.result.updated)} قیمت ذخیره شد`);
      const statusData = await apiGet<{ status: IntegrationStatus }>('/api/admin/integrations/status', true);
      setIntegrations(statusData.status);
    } catch (error) {
      setSyncStatus(error instanceof Error ? error.message : 'سینک ناموفق بود');
    }
  };

  const totals = stats?.totals ?? {
    users: 0,
    activeSubscriptions: 0,
    activeAnalyses: 0,
    markets: 0,
    monthlyRevenue: 0,
    monthlyTransactions: 0,
  };
  const recentUsers = stats?.recentUsers ?? [];
  const operations = [
    { label: 'بازارهای فعال', value: `${formatFaNumber(totals.markets)} بازار`, status: 'زنده' },
    { label: 'تراکنش‌های ماه', value: formatFaNumber(totals.monthlyTransactions), status: 'مالی' },
    { label: 'تحلیل‌های فعال', value: formatFaNumber(totals.activeAnalyses), status: 'محتوا' },
  ];

  return (
    <div className="min-h-screen bg-[#160022] text-white">
      <Header isAuthenticated userName="مدیر سیستم" />

      <div className="mx-auto flex max-w-7xl gap-6 px-4 py-8 sm:px-6 lg:px-8">
        <aside className="sticky top-24 hidden h-[calc(100vh-7rem)] w-72 shrink-0 lg:block">
          <div className="glass-panel flex h-full flex-col rounded-lg p-4">
            <div className="mb-6 rounded-lg bg-white p-4 text-primary-900">
              <p className="text-xs font-black">Admin OS</p>
              <p className="mt-1 text-xl font-black">پنل مدیریتی حرفه‌ای</p>
            </div>
            <nav className="space-y-2">
              {adminLinks.map((item, index) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={`/${locale}/admin${item.href}`}
                    className={cn(
                      'flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-bold transition',
                      index === 0 ? 'bg-white text-primary-900' : 'text-slate-300 hover:bg-white/10 hover:text-white',
                    )}
                  >
                    <Icon className="h-5 w-5" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
            <div className="mt-auto rounded-lg border border-white/10 bg-white/[0.06] p-4">
              <ShieldCheck className="mb-3 h-6 w-6" />
              <p className="font-black">دسترسی ادمین</p>
              <p className="mt-2 text-sm leading-6 text-slate-300">APIهای مدیریتی با allowlist ایمیل ادمین محافظت می‌شوند.</p>
            </div>
          </div>
        </aside>

        <main className="min-w-0 flex-1">
          <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className="mb-8 flex flex-col justify-between gap-5 xl:flex-row xl:items-end">
            <div>
              <h1 className="text-4xl font-black leading-tight md:text-5xl">پنل مدیریتی مشاور پورتفو</h1>
              <p className="mt-3 max-w-3xl text-slate-300">کنترل کاربران، پلن‌ها، تحلیل‌ها، تخفیف‌ها و گزارش‌های درآمدی در یک سطح مدیریتی یکپارچه.</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link href={`/${locale}/admin/analyses/new`}>
                <Button rightIcon={<Plus className="h-4 w-4" />}>تحلیل جدید</Button>
              </Link>
              <Link href={`/${locale}/admin/users/new`}>
                <Button variant="outline">کاربر جدید</Button>
              </Link>
            </div>
          </motion.div>

          <section className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
            <AdminKpi icon={<Users />} label="کل کاربران" value={formatFaNumber(totals.users)} detail="از دیتابیس" />
            <AdminKpi icon={<CreditCard />} label="اشتراک‌های فعال" value={formatFaNumber(totals.activeSubscriptions)} detail="تمدید خودکار فعال" />
            <AdminKpi icon={<WalletCards />} label="درآمد ماهانه" value={`${formatFaNumber(totals.monthlyRevenue)} دلار`} detail="تراکنش موفق" />
            <AdminKpi icon={<FileText />} label="تحلیل‌های فعال" value={formatFaNumber(totals.activeAnalyses)} detail="منتشر شده" />
          </section>

          <section className="mb-6 grid grid-cols-1 gap-6 xl:grid-cols-[1.2fr_0.8fr]">
            <Card className="p-0">
              <div className="border-b border-white/10 p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-black">فعالیت کاربران</h2>
                    <p className="mt-1 text-sm text-slate-400">آخرین ثبت‌نام‌ها و وضعیت احراز</p>
                  </div>
                  <Link href={`/${locale}/admin/users`}>
                    <Button variant="ghost">مشاهده کاربران</Button>
                  </Link>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[620px]">
                  <thead className="text-xs text-slate-400">
                    <tr className="border-b border-white/10">
                      <th className="px-5 py-4 text-right">کاربر</th>
                      <th className="px-5 py-4 text-right">عضویت</th>
                      <th className="px-5 py-4 text-right">وضعیت</th>
                      <th className="px-5 py-4 text-right">عملیات</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentUsers.map((user) => (
                      <tr key={user.id} className="border-b border-white/10 last:border-0 hover:bg-white/[0.04]">
                        <td className="px-5 py-4">
                          <p className="font-black">{user.name || 'بدون نام'}</p>
                          <p className="mt-1 text-xs text-slate-400">{user.email}</p>
                        </td>
                        <td className="px-5 py-4 text-sm text-slate-300">{formatFaDate(user.createdAt)}</td>
                        <td className="px-5 py-4">
                          <span className={cn('rounded-lg px-3 py-1 text-xs font-black', user.verified ? 'bg-white text-primary-900' : 'bg-white/10 text-slate-200')}>
                            {user.verified ? 'تایید شده' : 'در انتظار'}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <Link href={`/${locale}/admin/users/${user.id}`} className="text-sm font-bold text-white/80 hover:text-white">
                            ویرایش
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {!recentUsers.length && <p className="p-5 text-sm text-slate-300">هنوز کاربری در دیتابیس ثبت نشده است.</p>}
              </div>
            </Card>

            <Card className="p-5">
              <div className="mb-5 flex items-center justify-between">
                <h2 className="text-2xl font-black">وضعیت عملیات</h2>
                <Activity className="h-5 w-5" />
              </div>
              <div className="space-y-4">
                {operations.map((item) => (
                  <div key={item.label} className="rounded-lg border border-white/10 bg-white/[0.05] p-4">
                    <div className="mb-3 flex items-center justify-between">
                      <p className="font-black">{item.label}</p>
                      <span className="rounded-lg bg-white px-2 py-1 text-xs font-black text-primary-900">{item.status}</span>
                    </div>
                    <p className="text-2xl font-black">{item.value}</p>
                  </div>
                ))}
              </div>
            </Card>
          </section>

          <section className="grid grid-cols-1 gap-6 xl:grid-cols-3">
            <Card className="p-5 xl:col-span-2">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-black">مسیرهای مدیریتی جدید</h2>
                  <p className="mt-1 text-sm text-slate-400">APIهایی که برای بک‌اند کامل اضافه و استاندارد شدند</p>
                </div>
                <Gauge className="h-6 w-6" />
              </div>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                {[
                  '/api/admin/stats',
                  '/api/admin/reports',
                  '/api/admin/discounts',
                  '/api/subscription-plans/[id]',
                  '/api/markets/[slug]',
                  '/api/portfolio/[id]',
                ].map((route) => (
                  <code key={route} className="rounded-lg border border-white/10 bg-black/20 px-4 py-3 text-sm text-primary-100">
                    {route}
                  </code>
                ))}
              </div>
            </Card>

            <Card className="p-5">
              <Bell className="mb-4 h-7 w-7" />
              <h2 className="text-2xl font-black">اعلان مدیریتی</h2>
              <p className="mt-3 text-sm leading-7 text-slate-300">برای فعال‌سازی دسترسی ادمین در محیط production، ایمیل مدیر را در `ADMIN_EMAILS` قرار بدهید.</p>
              <Link href={`/${locale}/admin/reports`}>
                <Button className="mt-6 w-full">گزارش‌های مالی</Button>
              </Link>
            </Card>
          </section>

          <section className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-2">
            <Card className="p-5">
              <div className="mb-5 flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-black">درگاه‌های پرداخت ایرانی</h2>
                  <p className="mt-1 text-sm text-slate-400">زرین‌پال، زیبال، IDPay و Pay.ir از تنظیمات ادمین خوانده می‌شوند.</p>
                </div>
                <Link href={`/${locale}/admin/settings`}>
                  <Button variant="ghost">تنظیمات</Button>
                </Link>
              </div>
              <div className="space-y-3">
                {integrations?.payments.gateways.map((gateway) => (
                  <IntegrationRow key={gateway.key} label={gateway.label} enabled={gateway.enabled} configured={gateway.configured} />
                ))}
                {!integrations && <p className="text-sm text-slate-400">برای مشاهده وضعیت، با حساب ادمین وارد شوید.</p>}
              </div>
              <p className="mt-4 text-xs font-bold text-slate-500">
                درگاه پیش‌فرض: {String(integrations?.payments.defaultGateway || 'zarinpal')} | Callback: {integrations?.payments.callbackConfigured ? 'تنظیم شده' : 'نیازمند تنظیم'}
              </p>
            </Card>

            <Card className="p-5">
              <div className="mb-5 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <div>
                  <h2 className="text-2xl font-black">API دیتای واقعی بازار</h2>
                  <p className="mt-1 text-sm text-slate-400">بورس تهران، فارکس، طلا، ارز و کریپتو با URLهای تنظیم‌شده سینک می‌شوند.</p>
                </div>
                <Button onClick={syncMarketData} rightIcon={<RefreshCw className="h-4 w-4" />}>
                  سینک قیمت‌ها
                </Button>
              </div>
              <div className="space-y-3">
                {integrations?.marketData.providers.map((provider) => (
                  <IntegrationRow key={provider.key} label={provider.label} enabled={provider.enabled} configured={provider.configured} />
                ))}
                {!integrations && <p className="text-sm text-slate-400">برای مشاهده وضعیت، با حساب ادمین وارد شوید.</p>}
              </div>
              <div className="mt-4 grid grid-cols-1 gap-3 text-xs font-bold text-slate-500 sm:grid-cols-2">
                <span>قیمت‌های ذخیره‌شده: {formatFaNumber(integrations?.marketData.priceCount || 0)}</span>
                <span>بازه بروزرسانی: {formatFaNumber(integrations?.marketData.refreshSeconds || 300)} ثانیه</span>
                <span className="sm:col-span-2">
                  آخرین قیمت: {integrations?.marketData.latestPrice ? `${integrations.marketData.latestPrice.symbol} ${formatFaNumber(integrations.marketData.latestPrice.currentPrice)}` : 'هنوز داده‌ای ثبت نشده'}
                </span>
                {syncStatus && <span className="sm:col-span-2 text-primary-100">{syncStatus}</span>}
              </div>
            </Card>
          </section>
        </main>
      </div>
    </div>
  );
}

function AdminKpi({ icon, label, value, detail }: { icon: React.ReactNode; label: string; value: string; detail: string }) {
  return (
    <Card className="p-5">
      <div className="mb-4 flex items-center justify-between">
        <div className="rounded-lg bg-white/10 p-3 [&_svg]:h-5 [&_svg]:w-5">{icon}</div>
        <span className="rounded-lg bg-white px-2 py-1 text-xs font-black text-primary-900">زنده</span>
      </div>
      <p className="text-sm font-bold text-slate-400">{label}</p>
      <p className="mt-2 text-2xl font-black text-white">{value}</p>
      <p className="mt-2 text-xs text-slate-500">{detail}</p>
    </Card>
  );
}

function IntegrationRow({ label, enabled, configured }: { label: string; enabled: boolean; configured: boolean }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-lg border border-white/10 bg-white/[0.05] p-4">
      <span className="font-black">{label}</span>
      <div className="flex gap-2">
        <span className={cn('rounded-lg px-2 py-1 text-xs font-black', enabled ? 'bg-white text-primary-900' : 'bg-white/10 text-slate-300')}>
          {enabled ? 'فعال' : 'غیرفعال'}
        </span>
        <span className={cn('rounded-lg px-2 py-1 text-xs font-black', configured ? 'bg-primary-100/20 text-primary-100' : 'bg-red-400/15 text-red-200')}>
          {configured ? 'تنظیم شده' : 'ناقص'}
        </span>
      </div>
    </div>
  );
}
