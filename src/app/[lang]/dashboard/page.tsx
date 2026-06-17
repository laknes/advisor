'use client';

import { useEffect, useMemo, useState } from 'react';
import { Header, Footer, Card, Button, PriceChange } from '@/components';
import { formatFaDate, formatFaNumber } from '@/lib/format';
import { apiGet } from '@/lib/apiClient';
import { cn } from '@/lib/utils';
import { useLocale } from '@/components/LocaleProvider';
import { getStoredUser } from '@/lib/clientAuth';
import type { Analysis, Market, Notification, Portfolio, Price, PriceAlert, Subscription } from '@/lib/types';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  AlertTriangle,
  Bell,
  BriefcaseBusiness,
  ChevronLeft,
  CreditCard,
  Eye,
  FileText,
  Gauge,
  LayoutDashboard,
  LineChart,
  Plus,
  ShieldCheck,
  Sparkles,
  Wallet,
} from 'lucide-react';

const dashboardLinks = [
  { href: '', label: 'نمای کلی', icon: LayoutDashboard },
  { href: '/portfolio', label: 'پورتفو', icon: BriefcaseBusiness },
  { href: '/watchlist', label: 'دیدبان', icon: Eye },
  { href: '/analyses', label: 'تحلیل‌ها', icon: FileText },
  { href: '/subscriptions', label: 'اشتراک‌ها', icon: CreditCard },
  { href: '/alerts', label: 'هشدارها', icon: Bell },
];

export default function DashboardPage() {
  const { locale } = useLocale();
  const router = useRouter();
  const [userName, setUserName] = useState('کاربر');
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [analyses, setAnalyses] = useState<Analysis[]>([]);
  const [prices, setPrices] = useState<Price[]>([]);
  const [alerts, setAlerts] = useState<PriceAlert[]>([]);

  useEffect(() => {
    const storedUser = getStoredUser();
    if (storedUser?.isAdmin) {
      router.replace(`/${locale}/admin`);
      return;
    }
    setUserName(storedUser?.name || storedUser?.email || 'کاربر');

    let mounted = true;
    Promise.allSettled([
      apiGet<{ portfolio: Portfolio }>('/api/portfolio', true),
      apiGet<{ subscriptions: Subscription[] }>('/api/subscriptions', true),
      apiGet<{ analyses: Analysis[] }>('/api/analyses?limit=6'),
      apiGet<{ markets: Array<Market & { prices?: Price[] }> }>('/api/markets'),
      apiGet<{ alerts: PriceAlert[] }>('/api/alerts', true),
    ]).then((results) => {
      if (!mounted) return;
      const [portfolioResult, subscriptionsResult, analysesResult, marketsResult, alertsResult] = results;
      if (portfolioResult.status === 'fulfilled') setPortfolio(portfolioResult.value.portfolio);
      if (subscriptionsResult.status === 'fulfilled') setSubscriptions(subscriptionsResult.value.subscriptions);
      if (analysesResult.status === 'fulfilled') setAnalyses(analysesResult.value.analyses);
      if (marketsResult.status === 'fulfilled') setPrices(marketsResult.value.markets.flatMap((market) => market.prices ?? []));
      if (alertsResult.status === 'fulfilled') setAlerts(alertsResult.value.alerts);
    });

    return () => {
      mounted = false;
    };
  }, [locale, router]);

  const activePlan = subscriptions.find((subscription) => subscription.isActive && new Date(subscription.endDate) > new Date())?.plan;
  const riskScore = useMemo(() => {
    if (!portfolio?.positions?.length || !portfolio.totalValue) return 0;
    const largestPosition = Math.max(...portfolio.positions.map((position) => position.currentValue));
    return Math.min(100, Math.round((largestPosition / portfolio.totalValue) * 100));
  }, [portfolio]);

  return (
    <div className="min-h-screen bg-[#160022] text-white">
      <Header isAuthenticated userName={userName} />

      <div className="mx-auto flex max-w-7xl gap-6 px-4 py-8 sm:px-6 lg:px-8">
        <aside className="sticky top-24 hidden h-[calc(100vh-7rem)] w-72 shrink-0 lg:block">
          <div className="glass-panel flex h-full flex-col rounded-lg p-4">
            <div className="mb-6 rounded-lg bg-white p-4 text-primary-900">
              <p className="text-xs font-black">داشبورد کاربری</p>
              <p className="mt-1 text-xl font-black">مرکز کنترل سرمایه</p>
            </div>
            <nav className="space-y-2">
              {dashboardLinks.map((item, index) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={`/${locale}/dashboard${item.href}`}
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
              <Sparkles className="mb-3 h-6 w-6 text-primary-100" />
              <p className="font-black">بینش ویژه</p>
              <p className="mt-2 text-sm leading-6 text-slate-300">سیگنال‌های اختصاصی و بازبینی ماهانه پورتفو را فعال کنید.</p>
              <Link href={`/${locale}/pricing`}>
                <Button className="mt-4 w-full">ارتقا پلن</Button>
              </Link>
            </div>
          </div>
        </aside>

        <main className="min-w-0 flex-1">
          <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className="mb-8 flex flex-col justify-between gap-5 md:flex-row md:items-end">
            <div>
              <h1 className="text-4xl font-black leading-tight md:text-5xl">داشبورد حرفه‌ای سرمایه‌گذار</h1>
              <p className="mt-3 max-w-2xl text-slate-300">نمای یکپارچه پورتفو، تحلیل‌های ذخیره‌شده، هشدارها و وضعیت اشتراک برای تصمیم‌گیری سریع‌تر.</p>
            </div>
            <div className="flex gap-3">
              <Link href={`/${locale}/dashboard/portfolio`}>
                <Button rightIcon={<Plus className="h-4 w-4" />}>افزودن دارایی</Button>
              </Link>
              <Link href={`/${locale}/markets`}>
                <Button variant="outline">رصد بازار</Button>
              </Link>
            </div>
          </motion.div>

          <section className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
            <KpiCard icon={<Wallet />} label="ارزش فعلی پورتفو" value={`${formatFaNumber(portfolio?.totalValue || 0)} دلار`} />
            <KpiCard icon={<LineChart />} label="سود/زیان کل" value={`${formatFaNumber(portfolio?.totalReturn || 0)} دلار`} change={(portfolio?.returnPercentage || 0) / 100} />
            <KpiCard icon={<Gauge />} label="امتیاز ریسک" value={`${formatFaNumber(riskScore)} از ۱۰۰`} />
            <KpiCard icon={<ShieldCheck />} label="پلن فعال" value={activePlan?.name || 'بدون اشتراک فعال'} />
          </section>

          <section className="mb-6 grid grid-cols-1 gap-6 xl:grid-cols-[1.35fr_0.65fr]">
            <Card className="p-0">
              <div className="border-b border-white/10 p-5">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <h2 className="text-2xl font-black">واچ‌لیست زنده</h2>
                    <p className="mt-1 text-sm text-slate-400">نمادهای مهم شما با تغییرات لحظه‌ای</p>
                  </div>
                  <Link href={`/${locale}/dashboard/watchlist`} className="text-sm font-bold text-white/80 hover:text-white">
                    مدیریت
                  </Link>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[620px]">
                  <thead className="text-xs text-slate-400">
                    <tr className="border-b border-white/10">
                      <th className="px-5 py-4 text-right">نماد</th>
                      <th className="px-5 py-4 text-right">قیمت</th>
                      <th className="px-5 py-4 text-right">تغییر</th>
                      <th className="px-5 py-4 text-right">بازه روز</th>
                    </tr>
                  </thead>
                  <tbody>
                    {prices.map((price) => (
                      <tr key={price.id} className="border-b border-white/10 last:border-0 hover:bg-white/[0.04]">
                        <td className="px-5 py-4 font-mono font-black text-white">{price.symbol}</td>
                        <td className="px-5 py-4 font-mono font-bold">{formatFaNumber(price.currentPrice, { maximumFractionDigits: 4 })}</td>
                        <td className="px-5 py-4"><PriceChange value={price.changePercent || 0} format="percent" /></td>
                        <td className="px-5 py-4 text-sm text-slate-300">
                          {formatFaNumber(price.dayLow || 0)} تا {formatFaNumber(price.dayHigh || 0)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>

            <Card className="p-5">
              <div className="mb-5 flex items-center justify-between">
                <h2 className="text-2xl font-black">اعلان‌های مهم</h2>
                <Bell className="h-5 w-5 text-primary-100" />
              </div>
              <div className="space-y-3">
                {alerts.slice(0, 5).map((item) => (
                  <div key={item.id} className="rounded-lg border border-white/10 bg-white/[0.05] p-4">
                    <div className="mb-2 flex items-center justify-between gap-3">
                      <span className="font-black">{item.symbol}</span>
                      <span className="rounded-lg bg-white px-2 py-1 text-xs font-black text-primary-900">{item.condition === 'above' ? 'بالاتر از' : 'پایین‌تر از'}</span>
                    </div>
                    <p className="text-sm leading-6 text-slate-300">{item.market} در قیمت {formatFaNumber(item.price)}</p>
                    <p className="mt-2 text-xs text-slate-500">{item.isTriggered ? 'فعال شده' : 'در انتظار'}</p>
                  </div>
                ))}
                {!alerts.length && <p className="rounded-lg border border-white/10 bg-white/[0.05] p-4 text-sm text-slate-300">هنوز هشدار قیمتی ثبت نشده است.</p>}
              </div>
            </Card>
          </section>

          <section className="grid grid-cols-1 gap-6 xl:grid-cols-3">
            <Card className="xl:col-span-2 p-5">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-black">تحلیل‌های پیشنهادی</h2>
                  <p className="mt-1 text-sm text-slate-400">بر اساس واچ‌لیست و اشتراک فعال شما</p>
                </div>
                <Link href={`/${locale}/dashboard/analyses`}>
                  <Button variant="ghost" rightIcon={<ChevronLeft className="h-4 w-4" />}>همه تحلیل‌ها</Button>
                </Link>
              </div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {analyses.map((analysis) => (
                  <div key={analysis.id} className="rounded-lg border border-white/10 bg-white/[0.05] p-4">
                    <div className="mb-3 flex items-center justify-between">
                      <span className="rounded-lg bg-white/10 px-3 py-1 text-xs font-black">{analysis.timeframe}</span>
                      <span className="text-xs text-slate-400">{formatFaDate(analysis.publishedAt)}</span>
                    </div>
                    <h3 className="line-clamp-1 text-lg font-black">{analysis.title}</h3>
                    <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-300">{analysis.summary}</p>
                    <div className="mt-4 flex items-center justify-between">
                      <span className="font-bold text-primary-100">سیگنال {analysis.signal}</span>
                      <span className="text-sm text-slate-400">{formatFaNumber(analysis.accuracy ?? 0)}٪ دقت</span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-5">
              <AlertTriangle className="mb-4 h-7 w-7 text-primary-100" />
              <h2 className="text-2xl font-black">کنترل ریسک</h2>
              <p className="mt-3 text-sm leading-7 text-slate-300">{portfolio?.positions?.length ? 'امتیاز ریسک بر اساس تمرکز بزرگ‌ترین موقعیت در پورتفو محاسبه شده است.' : 'برای دریافت کنترل ریسک، ابتدا دارایی‌های پورتفو را ثبت کنید.'}</p>
              <div className="mt-6 h-3 overflow-hidden rounded-full bg-white/10">
                <motion.div initial={{ width: 0 }} animate={{ width: `${riskScore}%` }} className="h-full rounded-full bg-white" />
              </div>
              <div className="mt-4 flex justify-between text-xs font-bold text-slate-400">
                <span>کم‌ریسک</span>
                <span>ریسک فعلی</span>
                <span>پرریسک</span>
              </div>
            </Card>
          </section>
        </main>
      </div>

      <Footer />
    </div>
  );
}

function KpiCard({ icon, label, value, change }: { icon: React.ReactNode; label: string; value: string; change?: number }) {
  return (
    <Card className="p-5">
      <div className="mb-4 flex items-center justify-between">
        <div className="rounded-lg bg-white/10 p-3 text-white [&_svg]:h-5 [&_svg]:w-5">{icon}</div>
        {change !== undefined ? <PriceChange value={change} format="percent" /> : null}
      </div>
      <p className="text-sm font-bold text-slate-400">{label}</p>
      <p className="mt-2 text-2xl font-black text-white">{value}</p>
    </Card>
  );
}
