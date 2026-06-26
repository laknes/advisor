'use client';

import { useEffect, useMemo, useState } from 'react';
import { Header, Footer, Button, Card, CardContent, PriceChange, StatBlock, useLocale, MarketOrbitScene } from '@/components';
import { useDictionary } from '@/components/useDictionary';
import { apiGet } from '@/lib/apiClient';
import { Analysis, Market, Price, SubscriptionPlan } from '@/lib/types';
import { formatFaDate, formatFaNumber } from '@/lib/format';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeft, CheckCircle2, LineChart, ShieldCheck, Sparkles, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

const fadeInUp = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.55, ease: 'easeOut' },
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const signalLabel: Record<string, string> = {
  BUY: 'خرید',
  SELL: 'فروش',
  HOLD: 'نگهداری',
  WATCH: 'زیر نظر',
};

const billingLabel: Record<string, string> = {
  monthly: 'ماهانه',
  quarterly: 'فصلی',
  yearly: 'سالانه',
};

const marketWatchTabs = [
  { id: 'all', label: 'همه بازارها' },
  { id: 'stocks', label: 'بورس ایران' },
  { id: 'forex', label: 'فارکس' },
  { id: 'metals', label: 'طلا و فلزات' },
  { id: 'currency', label: 'ارزها' },
] as const;

type MarketWatchTabId = (typeof marketWatchTabs)[number]['id'];

const getMarketWatchTab = (price: Price): MarketWatchTabId => {
  const symbol = price.symbol.toUpperCase();

  if (symbol.includes('TEPIX') || symbol.includes('TSE') || symbol.includes('IRX')) return 'stocks';
  if (symbol.includes('XAU') || symbol.includes('GOLD') || symbol.includes('XAG') || symbol.includes('SILVER')) return 'metals';
  if (symbol.includes('/')) {
    if (symbol.includes('IRR') || symbol.includes('IRT') || symbol.includes('TOMAN')) return 'currency';
    return 'forex';
  }
  if (symbol.includes('USD') || symbol.includes('EUR') || symbol.includes('GBP') || symbol.includes('AED')) return 'currency';

  return 'all';
};

export default function Home() {
  const { locale } = useLocale();
  const dict = useDictionary();
  const [markets, setMarkets] = useState<Array<Market & { prices?: Price[] }>>([]);
  const [analyses, setAnalyses] = useState<Analysis[]>([]);
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [settings, setSettings] = useState<Record<string, any>>({});
  const [loadError, setLoadError] = useState('');
  const [activeMarketWatchTab, setActiveMarketWatchTab] = useState<MarketWatchTabId>('all');

  useEffect(() => {
    let mounted = true;

    Promise.all([
      apiGet<{ markets: Array<Market & { prices?: Price[] }> }>('/api/markets'),
      apiGet<{ analyses: Analysis[] }>('/api/analyses?limit=6'),
      apiGet<{ plans: SubscriptionPlan[] }>('/api/subscription-plans'),
      apiGet<{ settings: Record<string, any> }>('/api/settings'),
    ])
      .then(([marketData, analysisData, planData, settingsData]) => {
        if (!mounted) return;
        setMarkets(marketData.markets);
        setAnalyses(analysisData.analyses);
        setPlans(planData.plans);
        setSettings(settingsData.settings);
        setLoadError('');
      })
      .catch((error) => {
        if (!mounted) return;
        setMarkets([]);
        setAnalyses([]);
        setPlans([]);
        setSettings({});
        setLoadError(error instanceof Error ? error.message : 'بارگذاری داده‌های سایت از دیتابیس ناموفق بود.');
      });

    return () => {
      mounted = false;
    };
  }, []);

  const prices = useMemo(() => markets.flatMap((market) => market.prices ?? []), [markets]);
  const filteredPrices = useMemo(() => {
    if (activeMarketWatchTab === 'all') return prices;
    return prices.filter((price) => getMarketWatchTab(price) === activeMarketWatchTab);
  }, [activeMarketWatchTab, prices]);
  const performanceStats = useMemo(() => {
    const accuracyValues = analyses.map((analysis) => analysis.accuracy ?? 0).filter(Boolean);
    const accuracy = accuracyValues.length
      ? accuracyValues.reduce((sum, value) => sum + value, 0) / accuracyValues.length
      : 0;

    return {
      accuracy,
      totalAnalyses: analyses.length,
      winRate: accuracy,
      averageReturn: analyses.reduce((sum, analysis) => {
        if (!analysis.entryPrice || !analysis.targetPrice) return sum;
        return sum + ((analysis.targetPrice - analysis.entryPrice) / analysis.entryPrice) * 100;
      }, 0) / Math.max(analyses.length, 1),
    };
  }, [analyses]);

  if (!dict) return null;

  return (
    <div className="min-h-screen overflow-hidden bg-[#160022] text-slate-100">
      <Header isAuthenticated={false} />

      <main>
        {loadError && (
          <div className="relative z-20 mx-auto mt-4 max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="rounded-lg border border-amber-300/30 bg-amber-300/10 px-4 py-3 text-sm font-bold leading-7 text-amber-100">
              اتصال به داده‌های واقعی برقرار نشد: {loadError}
            </div>
          </div>
        )}

        <section className="relative min-h-[calc(100vh-96px)] overflow-hidden pb-16 pt-14 md:pb-24 md:pt-24">
          <div className="aurora-grid absolute inset-0 opacity-70" />
          <motion.div
            aria-hidden
            animate={{ x: [0, 36, 0], y: [0, -24, 0], opacity: [0.42, 0.7, 0.42] }}
            transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute right-[-10rem] top-16 h-80 w-80 rounded-full bg-white/30 blur-3xl"
          />
          <motion.div
            aria-hidden
            animate={{ x: [0, -28, 0], y: [0, 32, 0], opacity: [0.28, 0.52, 0.28] }}
            transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute bottom-16 left-[-8rem] h-96 w-96 rounded-full bg-primary-200/20 blur-3xl"
          />

          <div className="relative z-10 mx-auto grid max-w-7xl grid-cols-1 items-center gap-10 px-4 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:px-8">
            <motion.div initial="initial" animate="animate" variants={staggerContainer} className="space-y-8 lg:order-2">
              <motion.h1 variants={fadeInUp} className="max-w-3xl text-5xl font-black leading-tight tracking-normal text-white md:text-7xl">
                {settings.hero_title || 'مشاوره سرمایه‌گذاری هوشمند'}
                <span className="block text-primary-100">برای بازارهای پرنوسان</span>
              </motion.h1>
              <motion.p variants={fadeInUp} className="max-w-2xl text-lg leading-9 text-slate-300 md:text-xl">
                {settings.hero_subtitle || 'تحلیل‌های تخصصی، مدیریت پورتفو و دیدبان زنده بازار را در یک تجربه فارسی، سریع و شفاف دنبال کنید.'}
              </motion.p>

              <motion.div variants={fadeInUp} className="flex flex-col gap-4 sm:flex-row">
                <Link href={`/${locale}/auth/signup`}>
                  <Button size="lg" className="h-14 w-full px-8 text-base sm:w-auto" rightIcon={<ArrowLeft className="h-5 w-5" />}>
                    شروع رایگان
                  </Button>
                </Link>
                <Link href={`/${locale}/markets`}>
                  <Button variant="outline" size="lg" className="h-14 w-full px-8 text-base sm:w-auto">
                    مشاهده بازارها
                  </Button>
                </Link>
              </motion.div>

              <motion.div variants={fadeInUp} className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                {[
                  { icon: <Zap className="h-5 w-5" />, text: 'تحلیل لحظه‌ای' },
                  { icon: <LineChart className="h-5 w-5" />, text: 'مدیریت پورتفو' },
                  { icon: <ShieldCheck className="h-5 w-5" />, text: 'کنترل ریسک' },
                ].map((item) => (
                  <div key={item.text} className="glass-soft flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-bold text-slate-100">
                    <span className="text-primary-100">{item.icon}</span>
                    {item.text}
                  </div>
                ))}
              </motion.div>
            </motion.div>

            <motion.div initial={{ opacity: 0, x: -42 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.7, delay: 0.12 }} className="lg:order-1">
              <HomeMarketStage markets={markets} />
            </motion.div>
          </div>
        </section>

        <section className="relative py-16 md:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <SectionTitle title="بازارهای اصلی" subtitle="چند بازار مهم را با ابزارهای حرفه‌ای، سیگنال‌های قابل پیگیری و داده‌های زنده بررسی کنید." />
            <motion.div variants={staggerContainer} initial="initial" whileInView="animate" viewport={{ once: true }} className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
              {markets.length > 0 ? (
                markets.map((market) => (
                  <motion.div key={market.id} variants={fadeInUp}>
                    <Link href={`/${locale}/markets/${market.slug}`}>
                      <Card hoverable className="h-full p-5">
                        <div className="space-y-5">
                          <div className="flex items-center gap-4">
                            <div className="text-4xl">{market.icon}</div>
                            <div>
                              <h3 className="text-xl font-black text-white">{market.name}</h3>
                              <p className="text-sm font-bold text-primary-100">{market.symbol}</p>
                            </div>
                          </div>
                          <p className="min-h-[84px] leading-7 text-slate-300">{market.description}</p>
                          <Button variant="outline" size="md" fullWidth rightIcon={<ArrowLeft className="h-4 w-4" />}>
                            مشاهده تحلیل
                          </Button>
                        </div>
                      </Card>
                    </Link>
                  </motion.div>
                ))
              ) : (
                <Card className="p-8 text-center md:col-span-2 lg:col-span-4">
                  <p className="text-lg font-black text-white">هیچ بازاری از دیتابیس دریافت نشد</p>
                  <p className="mt-3 text-sm leading-7 text-slate-400">پس از ثبت بازارها در پنل مدیریت یا اتصال API بازار، این بخش به‌صورت واقعی پر می‌شود.</p>
                </Card>
              )}
            </motion.div>
          </div>
        </section>

        <section className="py-16 md:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-10 flex flex-col justify-between gap-6 md:flex-row md:items-end">
              <SectionTitle align="right" title="تحلیل‌های برتر امروز" subtitle="سیگنال‌های منتخب و سناریوهای پر احتمال برای جلسه معاملاتی فعلی." />
              <Link href={`/${locale}/analyses`}>
                <Button variant="ghost" rightIcon={<ArrowLeft className="h-5 w-5" />}>
                  مشاهده همه
                </Button>
              </Link>
            </div>

            <motion.div variants={staggerContainer} initial="initial" whileInView="animate" viewport={{ once: true }} className="grid grid-cols-1 gap-6 md:grid-cols-3">
              {analyses.length > 0 ? (
                analyses.map((analysis: Analysis) => (
                  <motion.div key={analysis.id} variants={fadeInUp}>
                    <Card hoverable className="h-full p-5">
                      <div className="space-y-5">
                        <div className="flex justify-between gap-4">
                          <span className={cn('rounded-lg px-3 py-1 text-xs font-black', analysis.signal === 'BUY' ? 'bg-primary-100/15 text-primary-100' : analysis.signal === 'SELL' ? 'bg-red-300/15 text-red-200' : 'bg-primary-200/15 text-primary-100')}>
                            سیگنال {signalLabel[analysis.signal]}
                          </span>
                          <span className="text-sm font-bold text-slate-400">{formatFaDate(analysis.publishedAt)}</span>
                        </div>
                        <h3 className="text-xl font-black leading-8 text-white">{analysis.title}</h3>
                        <p className="line-clamp-2 leading-7 text-slate-300">{analysis.summary}</p>
                        <div className="grid grid-cols-2 gap-3 border-y border-white/10 py-4">
                          <Metric label="ورود" value={formatFaNumber(Number(analysis.entryPrice))} />
                          <Metric label="هدف" value={formatFaNumber(Number(analysis.targetPrice))} accent />
                        </div>
                        <div className="flex items-center justify-between gap-3">
                          <span className="text-sm font-bold text-slate-300">{formatFaNumber(analysis.accuracy ?? 0)}٪ دقت</span>
                          <Link href={`/${locale}/analyses/${analysis.id}`}>
                            <Button size="sm" variant={analysis.isLocked ? 'secondary' : 'primary'}>
                              {analysis.isLocked ? 'باز کردن تحلیل' : 'مطالعه کامل'}
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ))
              ) : (
                <Card className="p-8 text-center md:col-span-3">
                  <p className="text-lg font-black text-white">هنوز تحلیلی در دیتابیس منتشر نشده است</p>
                  <p className="mt-3 text-sm leading-7 text-slate-400">تحلیل‌های واقعی پس از ثبت در پنل مدیریت اینجا نمایش داده می‌شوند.</p>
                </Card>
              )}
            </motion.div>
          </div>
        </section>

        <section className="py-16 md:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <SectionTitle title="دیدبان بازار" subtitle="قیمت‌های لحظه‌ای سهام، فارکس، طلا و ارزهای مهم را در یک جدول سریع و خوانا دنبال کنید." />
            <div className="mb-8 flex justify-center overflow-x-auto pb-2">
              <div className="glass-soft flex rounded-lg p-1.5" role="tablist" aria-label="فیلتر دیدبان بازار">
                {marketWatchTabs.map((tab) => {
                  const isActive = activeMarketWatchTab === tab.id;

                  return (
                    <button
                      key={tab.id}
                      type="button"
                      role="tab"
                      aria-selected={isActive}
                      aria-controls="market-watch-table"
                      onClick={() => setActiveMarketWatchTab(tab.id)}
                      className={cn(
                        'whitespace-nowrap rounded-lg px-5 py-2.5 text-sm font-black transition-all focus:outline-none focus:ring-2 focus:ring-white/70',
                        isActive ? 'bg-white text-primary-900 shadow-lg shadow-black/20' : 'text-slate-300 hover:bg-white/10 hover:text-white',
                      )}
                    >
                      {tab.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <Card noPadding className="overflow-hidden" id="market-watch-table" role="tabpanel">
              <div className="border-b border-white/10 bg-white/[0.04] px-5 py-3 text-sm font-bold text-slate-300">
                نمایش {formatFaNumber(filteredPrices.length)} مورد از {formatFaNumber(prices.length)} دارایی
              </div>
              <div className="overflow-x-auto">
                {filteredPrices.length > 0 ? (
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
                    <motion.tbody key={activeMarketWatchTab} variants={staggerContainer} initial="initial" animate="animate">
                      {filteredPrices.map((price) => (
                        <motion.tr key={price.id} variants={fadeInUp} whileHover={{ backgroundColor: 'rgba(255, 255, 255, 0.07)' }} className="border-b border-white/10 last:border-0">
                          <td className="px-8 py-5">
                            <div className="flex flex-col">
                              <span className="font-mono text-lg font-black text-white">{price.symbol}</span>
                              <span className="text-xs font-bold text-slate-400">
                                {marketWatchTabs.find((tab) => tab.id === getMarketWatchTab(price))?.label ?? 'بازار جهانی'}
                              </span>
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
                                <motion.div initial={{ width: 0 }} animate={{ width: '65%' }} className="h-full bg-white" />
                              </div>
                              <div className="flex w-32 justify-between text-[10px] font-bold">
                                <span className="text-red-300">{formatFaNumber(price.dayLow || 0, { maximumFractionDigits: 2 })}</span>
                                <span className="text-primary-100">{formatFaNumber(price.dayHigh || 0, { maximumFractionDigits: 2 })}</span>
                              </div>
                            </div>
                          </td>
                        </motion.tr>
                      ))}
                    </motion.tbody>
                  </table>
                ) : (
                  <div className="px-6 py-12 text-center">
                    <p className="text-lg font-black text-white">داده‌ای برای این دسته پیدا نشد</p>
                    <p className="mt-3 text-sm leading-7 text-slate-400">با انتخاب «همه بازارها» می‌توانید کل دارایی‌های فعال را ببینید.</p>
                    <Button type="button" variant="outline" className="mt-6" onClick={() => setActiveMarketWatchTab('all')}>
                      نمایش همه بازارها
                    </Button>
                  </div>
                )}
              </div>
            </Card>
            <p className="mt-6 text-center text-sm font-medium text-slate-400">داده‌ها به‌صورت لحظه‌ای به‌روزرسانی می‌شوند؛ بازارهای نمایش‌داده‌شده شامل بورس تهران، فارکس، طلای جهانی و ارزها هستند.</p>
          </div>
        </section>

        <section className="py-16 md:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <SectionTitle title="پلن مناسب خود را انتخاب کنید" subtitle="اشتراک‌های منعطف برای معامله‌گر کوتاه‌مدت، سرمایه‌گذار فعال و مدیریت ثروت." />
            <motion.div variants={staggerContainer} initial="initial" whileInView="animate" viewport={{ once: true }} className="grid grid-cols-1 gap-6 md:grid-cols-3">
              {plans.length > 0 ? (
                plans.slice(0, 3).map((plan, index) => (
                  <motion.div key={plan.id} variants={fadeInUp}>
                    <Card className={cn('relative flex h-full flex-col p-6', index === 1 && 'border-white/50 bg-white/10')}>
                      {index === 1 && <div className="absolute left-4 top-4 rounded-lg bg-white px-3 py-1 text-xs font-black text-primary-900">محبوب</div>}
                      <div className="flex-1 space-y-6">
                        <div>
                          <h3 className="text-2xl font-black text-white">{plan.name}</h3>
                          <p className="mt-3 min-h-[56px] leading-7 text-slate-300">{plan.description}</p>
                        </div>
                        <div className="border-y border-white/10 py-5">
                          <span className="text-4xl font-black text-primary-100">{formatFaNumber(plan.price)} دلار</span>
                          <span className="mr-2 font-bold text-slate-400">/ {billingLabel[plan.billingPeriod]}</span>
                        </div>
                        <ul className="space-y-3">
                          {plan.features.map((feature) => (
                            <li key={feature} className="flex items-start gap-3 text-slate-300">
                              <CheckCircle2 className="mt-1 h-5 w-5 shrink-0 text-primary-100" />
                              <span className="text-sm font-bold leading-6">{feature}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <Button fullWidth className="mt-8 h-12">
                        شروع اشتراک
                      </Button>
                    </Card>
                  </motion.div>
                ))
              ) : (
                <Card className="p-8 text-center md:col-span-3">
                  <p className="text-lg font-black text-white">پلنی در دیتابیس تعریف نشده است</p>
                  <p className="mt-3 text-sm leading-7 text-slate-400">پلن‌های اشتراک پس از ثبت در پنل قیمت‌گذاری نمایش داده می‌شوند.</p>
                </Card>
              )}
            </motion.div>
            <div className="mt-10 text-center">
              <Link href={`/${locale}/pricing`}>
                <Button variant="outline" size="lg">مشاهده همه پلن‌ها</Button>
              </Link>
            </div>
          </div>
        </section>

        <section className="py-16 md:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <SectionTitle title="سابقه عملکرد قابل اتکا" subtitle="شاخص‌های عملکرد تحلیل‌ها برای سنجش کیفیت تصمیم‌سازی و مدیریت ریسک." />
            <motion.div variants={staggerContainer} initial="initial" whileInView="animate" viewport={{ once: true }} className="grid grid-cols-2 gap-4 md:grid-cols-4">
              {[
                { label: 'دقت تحلیل', value: `${formatFaNumber(performanceStats.accuracy)}٪` },
                { label: 'کل تحلیل‌ها', value: formatFaNumber(performanceStats.totalAnalyses) },
                { label: 'نرخ موفقیت', value: `${formatFaNumber(performanceStats.winRate)}٪` },
                { label: 'میانگین بازده', value: `${formatFaNumber(performanceStats.averageReturn)}٪` },
              ].map((stat) => (
                <motion.div key={stat.label} variants={fadeInUp}>
                  <Card className="h-full p-5">
                    <StatBlock label={stat.label} value={stat.value} />
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        <section className="relative overflow-hidden py-20 md:py-28">
          <div className="absolute inset-x-6 inset-y-0 rounded-lg bg-gradient-to-l from-white/20 via-white/10 to-primary-200/20 blur-2xl" />
          <div className="relative z-10 mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
            <h2 className="text-4xl font-black leading-tight text-white md:text-6xl">از امروز تصمیم‌های سرمایه‌گذاری را دقیق‌تر بگیرید</h2>
            <p className="mx-auto mt-7 max-w-2xl text-lg leading-9 text-slate-300">
              به سرمایه‌گذارانی بپیوندید که برای تحلیل حرفه‌ای بازار، هشدارهای سریع و مدیریت پورتفو به سرمایه گذاری موسوی اعتماد می‌کنند.
            </p>
            <div className="mt-10 flex flex-col justify-center gap-4 sm:flex-row">
              <Link href={`/${locale}/auth/signup`}>
                <Button size="lg" className="h-14 px-10">ثبت‌نام رایگان</Button>
              </Link>
              <Link href={`/${locale}/faq`}>
                <Button size="lg" variant="outline" className="h-14 px-10">سوالات متداول</Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

function SectionTitle({ title, subtitle, align = 'center' }: { title: string; subtitle: string; align?: 'center' | 'right' }) {
  return (
    <motion.div initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className={cn('mb-12', align === 'center' ? 'text-center' : 'text-right')}>
      <h2 className="text-3xl font-black leading-tight text-white md:text-5xl">{title}</h2>
      <p className={cn('mt-4 text-base leading-8 text-slate-300 md:text-lg', align === 'center' && 'mx-auto max-w-3xl')}>{subtitle}</p>
    </motion.div>
  );
}

function HomeMarketStage({ markets }: { markets: Array<Market & { prices?: Price[] }> }) {
  const featuredMarkets = markets.slice(0, 4);

  return (
    <div className="relative min-h-[500px] rounded-lg border border-white/10 bg-white/[0.055] shadow-2xl shadow-primary-950/40 backdrop-blur-md sm:min-h-[560px]">
      <div className="absolute inset-0 overflow-hidden rounded-lg">
        <MarketOrbitScene density="compact" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_48%_42%,transparent_0%,rgba(22,0,34,0.1)_44%,rgba(22,0,34,0.68)_100%)]" />
      </div>

      <motion.div
        animate={{ y: [0, -8, 0], rotateX: [0, 2, 0] }}
        transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute left-4 top-4 w-[min(18rem,calc(100%-2rem))] rounded-lg border border-white/15 bg-[#11051f]/75 p-4 shadow-2xl shadow-cyan-950/40 backdrop-blur-2xl sm:left-6 sm:top-6"
      >
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="text-xs font-black text-cyan-100">نمای سه‌بعدی بازار</p>
            <h2 className="mt-2 text-xl font-black text-white">مدار سیگنال‌ها</h2>
          </div>
          <span className="rounded-lg bg-cyan-200/12 p-2 text-cyan-100">
            <Sparkles className="h-5 w-5" />
          </span>
        </div>
        <CardContent className="space-y-3">
          {featuredMarkets.slice(0, 3).map((market, idx) => {
            const price = market.prices?.[0];
            return (
              <div key={market.id} className="rounded-lg border border-white/10 bg-white/[0.055] p-3">
                <div className="mb-2 flex items-center justify-between gap-3">
                  <span className="text-sm font-bold text-slate-200">{market.name}</span>
                  <PriceChange value={price?.changePercent || 0} format="percent" className="text-xs" />
                </div>
                <div className="flex items-end justify-between gap-4">
                  <span className="font-mono text-lg font-black text-white">{formatFaNumber(price?.currentPrice || 0, { maximumFractionDigits: 4 })}</span>
                  <div className="h-1.5 w-20 overflow-hidden rounded-full bg-white/10">
                    <motion.div initial={{ width: 0 }} animate={{ width: `${58 + idx * 12}%` }} transition={{ duration: 1.2, delay: 0.35 + idx * 0.08 }} className="h-full rounded-full bg-gradient-to-l from-cyan-100 to-primary-200" />
                  </div>
                </div>
              </div>
            );
          })}
        </CardContent>
      </motion.div>

      <motion.div
        animate={{ y: [0, 10, 0], rotateY: [0, -3, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut', delay: 0.4 }}
        className="absolute bottom-4 right-4 w-[min(17rem,calc(100%-2rem))] rounded-lg border border-white/15 bg-[#120720]/80 p-4 shadow-2xl shadow-black/30 backdrop-blur-2xl sm:bottom-6 sm:right-6"
      >
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="text-xs font-black text-primary-100">ریسک پورتفو</p>
            <p className="mt-1 text-3xl font-black text-white">۲۴٪</p>
          </div>
          <div className="rounded-lg bg-emerald-300/12 p-2 text-emerald-200">
            <ShieldCheck className="h-5 w-5" />
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {['سهام', 'طلا', 'ارز'].map((label, idx) => (
            <div key={label} className="rounded-lg bg-white/[0.06] p-2 text-center">
              <div className="mx-auto mb-2 h-14 w-2 overflow-hidden rounded-full bg-white/10">
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${44 + idx * 18}%` }}
                  transition={{ duration: 1, delay: 0.45 + idx * 0.1 }}
                  className="mt-auto rounded-full bg-gradient-to-t from-primary-200 to-cyan-100"
                />
              </div>
              <span className="text-[11px] font-bold text-slate-300">{label}</span>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}

function Metric({ label, value, accent = false }: { label: string; value: string; accent?: boolean }) {
  return (
    <div>
      <p className="text-xs font-black text-slate-400">{label}</p>
      <p className={cn('mt-1 font-mono text-lg font-black', accent ? 'text-primary-100' : 'text-white')}>{value}</p>
    </div>
  );
}

