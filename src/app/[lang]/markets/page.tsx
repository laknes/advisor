'use client';

import { useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Activity,
  ArrowLeft,
  BarChart3,
  Clock,
  Filter,
  LineChart,
  ShieldCheck,
  Sparkles,
  TrendingUp,
} from 'lucide-react';
import { Badge, Button, Card, Footer, Header, MarketOrbitScene, PriceChange, useLocale } from '@/components';
import { apiGet } from '@/lib/apiClient';
import { formatFaDate, formatFaNumber } from '@/lib/format';
import type { Analysis, Market, Price } from '@/lib/types';
import { cn } from '@/lib/utils';

type MarketWithPrices = Market & { prices?: Price[] };

const fadeInUp = {
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.45, ease: 'easeOut' },
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.07,
    },
  },
};

const marketTabs = [
  { id: 'all', label: 'همه بازارها' },
  { id: 'iran-stocks', label: 'بورس ایران' },
  { id: 'forex', label: 'فارکس' },
  { id: 'gold', label: 'طلا و فلزات' },
  { id: 'currency', label: 'ارزها' },
] as const;

type MarketTabId = (typeof marketTabs)[number]['id'];

const signalLabel: Record<Analysis['signal'], string> = {
  BUY: 'خرید',
  SELL: 'فروش',
  HOLD: 'نگهداری',
};

const riskLabel: Record<Analysis['riskLevel'], string> = {
  LOW: 'کم',
  MEDIUM: 'متوسط',
  HIGH: 'زیاد',
};

export default function MarketsPage() {
  const { locale } = useLocale();
  const [markets, setMarkets] = useState<MarketWithPrices[]>([]);
  const [analyses, setAnalyses] = useState<Analysis[]>([]);
  const [loadError, setLoadError] = useState('');
  const [activeTab, setActiveTab] = useState<MarketTabId>('all');

  useEffect(() => {
    let mounted = true;

    Promise.all([
      apiGet<{ markets: MarketWithPrices[] }>('/api/markets'),
      apiGet<{ analyses: Analysis[] }>('/api/analyses?limit=20'),
    ])
      .then(([marketData, analysisData]) => {
        if (!mounted) return;
        setMarkets(marketData.markets);
        setAnalyses(analysisData.analyses);
        setLoadError('');
      })
      .catch((error) => {
        if (!mounted) return;
        setMarkets([]);
        setAnalyses([]);
        setLoadError(error instanceof Error ? error.message : 'بارگذاری بازارها از دیتابیس ناموفق بود.');
      });

    return () => {
      mounted = false;
    };
  }, []);

  const filteredMarkets = useMemo(() => {
    if (activeTab === 'all') return markets;
    return markets.filter((market) => market.slug === activeTab);
  }, [activeTab, markets]);

  const prices = useMemo(() => markets.flatMap((market) => market.prices ?? []), [markets]);
  const marketById = useMemo(() => new Map(markets.map((market) => [market.id, market])), [markets]);
  const activeAnalyses = useMemo(() => {
    if (activeTab === 'all') return analyses.slice(0, 6);
    const activeMarketIds = new Set(filteredMarkets.map((market) => market.id));
    return analyses.filter((analysis) => activeMarketIds.has(analysis.marketId)).slice(0, 6);
  }, [activeTab, analyses, filteredMarkets]);

  const headlinePrice = prices[0];
  const averageChange = prices.length
    ? prices.reduce((sum, price) => sum + (price.changePercent ?? 0), 0) / prices.length
    : 0;

  return (
    <div className="min-h-screen overflow-hidden bg-[#160022] text-white">
      <Header isAuthenticated={false} />

      <main>
        {loadError && (
          <div className="relative z-20 mx-auto mt-4 max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="rounded-lg border border-amber-300/30 bg-amber-300/10 px-4 py-3 text-sm font-bold leading-7 text-amber-100">
              اتصال به داده‌های واقعی برقرار نشد: {loadError}
            </div>
          </div>
        )}

        <section className="relative min-h-[calc(100vh-96px)] overflow-hidden pb-14 pt-14 md:pb-20 md:pt-20">
          <div className="aurora-grid absolute inset-0 opacity-60" />
          <div className="absolute inset-x-0 top-0 h-64 bg-[radial-gradient(circle_at_48%_0%,rgba(216,180,254,0.28),transparent_34rem)]" />

          <div className="relative z-10 mx-auto grid max-w-7xl grid-cols-1 items-center gap-10 px-4 sm:px-6 lg:grid-cols-[1fr_0.95fr] lg:px-8">
            <motion.div initial="initial" animate="animate" variants={staggerContainer} className="space-y-8 lg:order-2">
              <motion.h1 variants={fadeInUp} className="max-w-3xl text-5xl font-black leading-tight text-white md:text-7xl">
                بازارهای اصلی سرمایه‌گذاری
              </motion.h1>
              <motion.p variants={fadeInUp} className="max-w-2xl text-lg leading-9 text-slate-300 md:text-xl">
                قیمت‌ها، تغییرات روزانه و تحلیل‌های منتخب بورس، فارکس، طلا و ارز را در یک نمای یکپارچه دنبال کنید.
              </motion.p>

              <motion.div variants={fadeInUp} className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <HeroMetric icon={<Activity className="h-5 w-5" />} label="بازار فعال" value={formatFaNumber(markets.length)} />
                <HeroMetric icon={<LineChart className="h-5 w-5" />} label="میانگین تغییر" value={`${formatFaNumber(averageChange * 100, { maximumFractionDigits: 2 })}٪`} />
                <HeroMetric icon={<ShieldCheck className="h-5 w-5" />} label="تحلیل منتشرشده" value={formatFaNumber(analyses.length)} />
              </motion.div>

              <motion.div variants={fadeInUp} className="flex flex-col gap-4 sm:flex-row">
                <Link href="#market-grid">
                  <Button size="lg" className="h-14 w-full px-8 text-base sm:w-auto" rightIcon={<ArrowLeft className="h-5 w-5" />}>
                    مشاهده بازارها
                  </Button>
                </Link>
                <Link href={`/${locale}/analyses`}>
                  <Button variant="outline" size="lg" className="h-14 w-full px-8 text-base sm:w-auto">
                    تحلیل‌های بازار
                  </Button>
                </Link>
              </motion.div>
            </motion.div>

            <motion.div initial={{ opacity: 0, x: -38 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.7, delay: 0.1 }} className="lg:order-1">
              <div className="relative min-h-[500px] overflow-hidden rounded-lg border border-white/10 bg-white/[0.055] shadow-2xl shadow-primary-950/40 backdrop-blur-md">
                <MarketOrbitScene density="compact" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_42%,transparent_0%,rgba(22,0,34,0.22)_48%,rgba(22,0,34,0.76)_100%)]" />

                <div className="absolute left-4 top-4 w-[min(18rem,calc(100%-2rem))] rounded-lg border border-white/15 bg-[#11051f]/78 p-4 shadow-2xl shadow-cyan-950/40 backdrop-blur-2xl sm:left-6 sm:top-6">
                  <div className="mb-4 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-black text-cyan-100">رصد زنده</p>
                      <h2 className="mt-2 text-xl font-black text-white">نمای بازار</h2>
                    </div>
                    <Sparkles className="h-5 w-5 text-cyan-100" />
                  </div>
                  <div className="space-y-3">
                    {markets.slice(0, 3).map((market) => {
                      const price = market.prices?.[0];
                      return (
                        <div key={market.id} className="rounded-lg border border-white/10 bg-white/[0.055] p-3">
                          <div className="mb-2 flex items-center justify-between gap-3">
                            <span className="font-bold text-slate-200">{market.name}</span>
                            <PriceChange value={price?.changePercent || 0} format="percent" className="text-xs" />
                          </div>
                          <p className="font-mono text-lg font-black text-white">
                            {formatFaNumber(price?.currentPrice || 0, { maximumFractionDigits: 4 })}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="absolute bottom-4 right-4 w-[min(17rem,calc(100%-2rem))] rounded-lg border border-white/15 bg-[#120720]/82 p-4 shadow-2xl shadow-black/30 backdrop-blur-2xl sm:bottom-6 sm:right-6">
                  <p className="text-xs font-black text-primary-100">شاخص مرجع</p>
                  <div className="mt-3 flex items-end justify-between gap-4">
                    <div>
                      <p className="font-mono text-3xl font-black text-white">
                        {formatFaNumber(headlinePrice?.currentPrice || 0, { maximumFractionDigits: 2 })}
                      </p>
                      <PriceChange value={headlinePrice?.changePercent || 0} format="percent" className="mt-2 text-sm" />
                    </div>
                    <div className="rounded-lg bg-emerald-300/12 p-3 text-emerald-200">
                      <TrendingUp className="h-6 w-6" />
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        <section id="market-grid" className="py-16 md:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-10 flex flex-col justify-between gap-6 md:flex-row md:items-end">
              <SectionTitle title="انتخاب بازار" subtitle="بازار موردنظر را انتخاب کنید و وارد نمای تحلیل، قیمت و سیگنال‌های همان بازار شوید." />
              <div className="glass-soft flex max-w-full overflow-x-auto rounded-lg p-1.5" role="tablist" aria-label="فیلتر بازارها">
                {marketTabs.map((tab) => {
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      role="tab"
                      aria-selected={isActive}
                      onClick={() => setActiveTab(tab.id)}
                      className={cn(
                        'whitespace-nowrap rounded-lg px-4 py-2.5 text-sm font-black transition-all focus:outline-none focus:ring-2 focus:ring-white/70',
                        isActive ? 'bg-white text-primary-900 shadow-lg shadow-black/20' : 'text-slate-300 hover:bg-white/10 hover:text-white',
                      )}
                    >
                      {tab.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <motion.div key={activeTab} variants={staggerContainer} initial="initial" animate="animate" className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
              {filteredMarkets.length > 0 ? (
                filteredMarkets.map((market) => (
                  <motion.div key={market.id} variants={fadeInUp}>
                    <MarketCard market={market} locale={locale} analysisCount={analyses.filter((analysis) => analysis.marketId === market.id).length} />
                  </motion.div>
                ))
              ) : (
                <Card className="p-10 text-center md:col-span-2 lg:col-span-4">
                  <BarChart3 className="mx-auto mb-5 h-12 w-12 text-slate-500" />
                  <h3 className="text-2xl font-black text-white">بازاری از دیتابیس دریافت نشد</h3>
                  <p className="mx-auto mt-3 max-w-md leading-7 text-slate-400">بازارها را در پنل مدیریت ثبت کنید یا اتصال API داده بازار را بررسی کنید.</p>
                  {activeTab !== 'all' && (
                    <Button type="button" variant="outline" className="mt-6" onClick={() => setActiveTab('all')}>
                      نمایش همه بازارها
                    </Button>
                  )}
                </Card>
              )}
            </motion.div>
          </div>
        </section>

        <section className="py-16 md:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-10 flex flex-col justify-between gap-6 md:flex-row md:items-end">
              <SectionTitle title="دیدبان قیمت" subtitle="جدول سریع برای مقایسه قیمت، تغییرات و بازه روز دارایی‌های فعال." />
              <div className="flex items-center gap-2 text-sm font-bold text-slate-400">
                <Clock className="h-4 w-4 text-primary-100" />
                به‌روزرسانی لحظه‌ای
              </div>
            </div>

            <Card noPadding className="overflow-hidden">
              <div className="border-b border-white/10 bg-white/[0.04] px-5 py-3 text-sm font-bold text-slate-300">
                نمایش {formatFaNumber(prices.length)} دارایی فعال
              </div>
              <div className="overflow-x-auto">
                {prices.length > 0 ? (
                  <table className="w-full min-w-[760px]">
                    <thead>
                      <tr className="border-b border-white/10 bg-white/[0.06] text-slate-300">
                        <th className="px-8 py-5 text-right text-xs font-black">دارایی / نماد</th>
                        <th className="px-8 py-5 text-right text-xs font-black">آخرین قیمت</th>
                        <th className="px-8 py-5 text-right text-xs font-black">تغییر خالص</th>
                        <th className="px-8 py-5 text-right text-xs font-black">درصد تغییر</th>
                        <th className="hidden px-8 py-5 text-right text-xs font-black md:table-cell">بازه روز</th>
                      </tr>
                    </thead>
                    <tbody>
                      {prices.map((price) => (
                        <tr key={price.id} className="border-b border-white/10 transition-colors last:border-0 hover:bg-white/[0.055]">
                          <td className="px-8 py-5">
                            <div className="flex flex-col">
                              <span className="font-mono text-lg font-black text-white">{price.symbol}</span>
                              <span className="text-xs font-bold text-slate-400">بازار جهانی</span>
                            </div>
                          </td>
                          <td className="px-8 py-5 font-mono text-xl font-black text-white">
                            {formatFaNumber(price.currentPrice, { minimumFractionDigits: 2, maximumFractionDigits: 4 })}
                          </td>
                          <td className="px-8 py-5"><PriceChange value={price.change || 0} /></td>
                          <td className="px-8 py-5"><PriceChange value={price.changePercent || 0} format="percent" /></td>
                          <td className="hidden px-8 py-5 md:table-cell">
                            <div className="flex flex-col gap-2">
                              <div className="h-1.5 w-32 overflow-hidden rounded-full bg-white/10">
                                <div className="h-full w-[65%] rounded-full bg-gradient-to-l from-cyan-100 to-primary-200" />
                              </div>
                              <div className="flex w-32 justify-between text-[10px] font-bold">
                                <span className="text-red-300">{formatFaNumber(price.dayLow || 0, { maximumFractionDigits: 2 })}</span>
                                <span className="text-primary-100">{formatFaNumber(price.dayHigh || 0, { maximumFractionDigits: 2 })}</span>
                              </div>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="px-6 py-12 text-center">
                    <p className="text-lg font-black text-white">قیمتی از دیتابیس دریافت نشد</p>
                    <p className="mt-3 text-sm leading-7 text-slate-400">پس از اتصال ارائه‌دهنده داده بازار یا ثبت قیمت‌ها، این جدول به‌صورت واقعی پر می‌شود.</p>
                  </div>
                )}
              </div>
            </Card>
          </div>
        </section>

        <section className="py-16 md:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-10 flex flex-col justify-between gap-6 md:flex-row md:items-end">
              <SectionTitle title="تحلیل‌های مرتبط" subtitle="آخرین سناریوهای منتشرشده برای بازارهای انتخاب‌شده." />
              <Link href={`/${locale}/analyses`}>
                <Button variant="ghost" rightIcon={<ArrowLeft className="h-5 w-5" />}>
                  مشاهده همه تحلیل‌ها
                </Button>
              </Link>
            </div>

            {activeAnalyses.length > 0 ? (
              <motion.div variants={staggerContainer} initial="initial" whileInView="animate" viewport={{ once: true }} className="grid grid-cols-1 gap-6 md:grid-cols-3">
                {activeAnalyses.map((analysis) => {
                  const market = analysis.market || marketById.get(analysis.marketId);
                  return (
                    <motion.div key={analysis.id} variants={fadeInUp}>
                      <Card hoverable className="flex h-full flex-col p-5">
                        <div className="flex-1 space-y-5">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex items-center gap-3">
                              <span className="text-3xl">{market?.icon || '📈'}</span>
                              <div>
                                <p className="text-xs font-black text-primary-100">{market?.name || 'بازار'}</p>
                                <h3 className="mt-1 text-xl font-black leading-8 text-white">{analysis.title}</h3>
                              </div>
                            </div>
                            <Badge variant={analysis.signal === 'BUY' ? 'success' : analysis.signal === 'SELL' ? 'danger' : 'warning'}>
                              {signalLabel[analysis.signal]}
                            </Badge>
                          </div>
                          <p className="line-clamp-3 min-h-[84px] leading-7 text-slate-300">{analysis.summary}</p>
                          <div className="grid grid-cols-2 gap-3 border-y border-white/10 py-4">
                            <SmallMetric label="ریسک" value={riskLabel[analysis.riskLevel]} />
                            <SmallMetric label="دقت" value={`${formatFaNumber(analysis.accuracy ?? 0)}٪`} />
                          </div>
                          <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
                            <Clock className="h-4 w-4" />
                            {formatFaDate(analysis.publishedAt)}
                          </div>
                        </div>
                        <Link href={analysis.isLocked ? `/${locale}/pricing` : `/${locale}/dashboard/analyses`} className="mt-6">
                          <Button fullWidth rightIcon={<ArrowLeft className="h-4 w-4" />}>
                            {analysis.isLocked ? 'باز کردن تحلیل' : 'مشاهده کامل'}
                          </Button>
                        </Link>
                      </Card>
                    </motion.div>
                  );
                })}
              </motion.div>
            ) : (
              <Card className="p-12 text-center">
                <Filter className="mx-auto mb-5 h-12 w-12 text-slate-500" />
                <h3 className="text-2xl font-black text-white">برای این بازار هنوز تحلیلی منتشر نشده است</h3>
                <p className="mx-auto mt-3 max-w-md leading-7 text-slate-400">از فیلتر «همه بازارها» استفاده کنید یا بعداً دوباره بررسی کنید.</p>
                <Button type="button" variant="outline" className="mt-6" onClick={() => setActiveTab('all')}>
                  نمایش همه بازارها
                </Button>
              </Card>
            )}
          </div>
        </section>

        <section className="relative overflow-hidden py-20 md:py-28">
          <div className="absolute inset-x-6 inset-y-0 rounded-lg bg-gradient-to-l from-white/18 via-white/10 to-primary-200/20 blur-2xl" />
          <div className="relative z-10 mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
            <h2 className="text-4xl font-black leading-tight text-white md:text-6xl">بازار مناسب استراتژی خود را پیدا کنید</h2>
            <p className="mx-auto mt-7 max-w-2xl text-lg leading-9 text-slate-300">
              برای دسترسی به تحلیل‌های دقیق‌تر، هشدارها و مدیریت پورتفو، حساب کاربری خود را فعال کنید.
            </p>
            <div className="mt-10 flex flex-col justify-center gap-4 sm:flex-row">
              <Link href={`/${locale}/auth/signup`}>
                <Button size="lg" className="h-14 px-10">شروع رایگان</Button>
              </Link>
              <Link href={`/${locale}/pricing`}>
                <Button size="lg" variant="outline" className="h-14 px-10">مشاهده پلن‌ها</Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

function SectionTitle({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div>
      <h2 className="text-3xl font-black leading-tight text-white md:text-5xl">{title}</h2>
      <p className="mt-4 max-w-2xl text-base leading-8 text-slate-300 md:text-lg">{subtitle}</p>
    </div>
  );
}

function HeroMetric({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div className="glass-soft flex items-center gap-3 rounded-lg px-4 py-3">
      <span className="text-primary-100">{icon}</span>
      <div>
        <p className="text-xs font-bold text-slate-400">{label}</p>
        <p className="font-mono text-lg font-black text-white">{value}</p>
      </div>
    </div>
  );
}

function MarketCard({ market, locale, analysisCount }: { market: MarketWithPrices; locale: string; analysisCount: number }) {
  const price = market.prices?.[0];

  return (
    <Card hoverable className="flex h-full flex-col p-5">
      <div className="flex-1 space-y-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <span className="text-4xl">{market.icon}</span>
            <h3 className="mt-4 text-2xl font-black text-white">{market.name}</h3>
            <p className="mt-1 text-sm font-bold text-primary-100">{market.symbol}</p>
          </div>
          <div className="rounded-lg bg-white/[0.06] p-2 text-primary-100">
            <BarChart3 className="h-5 w-5" />
          </div>
        </div>

        <p className="min-h-[84px] leading-7 text-slate-300">{market.description}</p>

        <div className="space-y-3 border-y border-white/10 py-4">
          <div className="flex items-center justify-between gap-4">
            <span className="text-sm font-bold text-slate-400">آخرین قیمت</span>
            <span className="font-mono text-xl font-black text-white">{formatFaNumber(price?.currentPrice || 0, { maximumFractionDigits: 4 })}</span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span className="text-sm font-bold text-slate-400">تغییر روزانه</span>
            <PriceChange value={price?.changePercent || 0} format="percent" />
          </div>
          <div className="flex items-center justify-between gap-4">
            <span className="text-sm font-bold text-slate-400">تحلیل فعال</span>
            <span className="font-mono font-black text-white">{formatFaNumber(analysisCount)}</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <SmallMetric label="هدف" value={price?.dayHigh ? formatFaNumber(price.dayHigh, { maximumFractionDigits: 2 }) : 'نامشخص'} />
          <SmallMetric label="حمایت" value={price?.dayLow ? formatFaNumber(price.dayLow, { maximumFractionDigits: 2 }) : 'نامشخص'} />
        </div>
      </div>

      <Link href={`/${locale}/markets/${market.slug}`} className="mt-6">
        <Button fullWidth rightIcon={<ArrowLeft className="h-4 w-4" />}>
          مشاهده تحلیل
        </Button>
      </Link>
    </Card>
  );
}

function SmallMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/[0.045] p-3">
      <p className="text-xs font-black text-slate-400">{label}</p>
      <p className="mt-1 font-mono text-lg font-black text-white">{value}</p>
    </div>
  );
}
