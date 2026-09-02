'use client';

import { type ReactNode, useEffect, useMemo, useState } from 'react';
import { Header, Footer, Button, Card, CardContent, PriceChange, StatBlock, useLocale, MarketOrbitScene } from '@/components';
import { useDictionary } from '@/components/useDictionary';
import { apiGet } from '@/lib/apiClient';
import { Analysis, Market, Price, SubscriptionPlan } from '@/lib/types';
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

const signalLabel = (locale: 'fa' | 'en', value: string) => {
  const labels: Record<string, Record<'fa' | 'en', string>> = {
    BUY: { fa: 'خرید', en: 'Buy' },
    SELL: { fa: 'فروش', en: 'Sell' },
    HOLD: { fa: 'نگهداری', en: 'Hold' },
    WATCH: { fa: 'زیر نظر', en: 'Watch' },
  };

  return labels[value]?.[locale] ?? value;
};

const billingLabel = (locale: 'fa' | 'en', value: string) => {
  const labels: Record<string, Record<'fa' | 'en', string>> = {
    monthly: { fa: 'ماهانه', en: 'Monthly' },
    quarterly: { fa: 'فصلی', en: 'Quarterly' },
    yearly: { fa: 'سالانه', en: 'Yearly' },
  };

  return labels[value]?.[locale] ?? value;
};

const MARKET_WATCH_TABS = [
  { id: 'all', label: 'All Markets' },
  { id: 'stocks', label: 'Iran Stocks' },
  { id: 'forex', label: 'Forex' },
  { id: 'metals', label: 'Gold & Metals' },
  { id: 'currency', label: 'Currencies' },
] as const;

const MARKET_WATCH_TABS_FA = [
  { id: 'all', label: 'همه بازارها' },
  { id: 'stocks', label: 'بورس ایران' },
  { id: 'forex', label: 'فارکس' },
  { id: 'metals', label: 'طلا و فلزات' },
  { id: 'currency', label: 'ارزها' },
] as const;

type MarketWatchTabId = (typeof MARKET_WATCH_TABS)[number]['id'];

const getMarketWatchTabs = (locale: 'fa' | 'en') => locale === 'en' ? MARKET_WATCH_TABS : MARKET_WATCH_TABS_FA;

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
  const isEnglish = locale === 'en';
  const hasPersianText = (value: string) => /[\u0600-\u06FF]/.test(value);
  const formatNumber = (value: number, options?: Intl.NumberFormatOptions) => new Intl.NumberFormat(isEnglish ? 'en-US' : 'fa-IR', options).format(value);
  const formatDate = (value: Date | string) => new Intl.DateTimeFormat(isEnglish ? 'en-US' : 'fa-IR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(value));
  const englishTextMap: Record<string, string> = {
    'تحلیل روزانه': 'Daily Analysis',
    'تحلیل هفتگی': 'Weekly Analysis',
    'تحلیل ماهانه': 'Monthly Analysis',
    'دسترسی همه بازارها': 'All Markets Access',
    'VIP الیت': 'VIP Elite',
    'تحلیل روزانه بازار برای معامله\u200cگران کوتاه\u200cمدت': 'Daily market analysis for short-term traders',
    'تحلیل عمیق هفتگی برای معامله\u200cگران نوسانی': 'Deep weekly analysis for swing traders',
    'تحلیل استراتژیک ماهانه برای سرمایه\u200cگذاران فعال': 'Strategic monthly analysis for active investors',
    'دسترسی پریمیوم به همه بازارهای فعال پلتفرم': 'Premium access to all active platform markets',
    'تجربه کامل مشاوره اختصاصی سرمایه\u200cگذاری': 'Full premium investment advisory experience',
    'دسترسی به یک بازار': 'Access to one market',
    'هشدارهای پایه': 'Basic alerts',
    'اعلان ایمیلی': 'Email notifications',
    'تمام تایم\u200cفریم\u200cهای کوتاه\u200cمدت': 'All short-term timeframes',
    'هشدارهای پیشرفته': 'Advanced alerts',
    'پشتیبانی اولویت\u200cدار': 'Priority support',
    'گزارش\u200cهای دقیق': 'Detailed reports',
    'راهنمایی پورتفو': 'Portfolio guidance',
    'مشاور اختصاصی': 'Dedicated advisor',
    'دسترسی کامل همه بازارها': 'Full all-markets access',
    'تمام انواع تحلیل': 'All analysis types',
    'هشدار چنددارایی': 'Multi-asset alerts',
    'مشاور شخصی تمام\u200cوقت': 'Full-time personal advisor',
    'سیگنال\u200cهای اختصاصی سرمایه\u200cگذاری': 'Exclusive investment signals',
    'وبینارهای خصوصی بازار': 'Private market webinars',
  };
  const localizeText = (value?: string | null, fallback = '') => {
    if (!value) return fallback;
    if (!isEnglish) return value;
    return englishTextMap[value] || value;
  };
  const dict = useDictionary();
  const [markets, setMarkets] = useState<Array<Market & { prices?: Price[] }>>([]);
  const [analyses, setAnalyses] = useState<Analysis[]>([]);
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [settings, setSettings] = useState<Record<string, any>>({});
  const [loadError, setLoadError] = useState('');
  const [activeMarketWatchTab, setActiveMarketWatchTab] = useState<MarketWatchTabId>('all');

  useEffect(() => {
    let mounted = true;

    Promise.allSettled([
      apiGet<{ markets: Array<Market & { prices?: Price[] }> }>('/api/markets'),
      apiGet<{ analyses: Analysis[] }>('/api/analyses?limit=6'),
      apiGet<{ plans: SubscriptionPlan[] }>('/api/subscription-plans'),
      apiGet<{ settings: Record<string, any> }>('/api/settings'),
    ])
      .then(([marketData, analysisData, planData, settingsData]) => {
        if (!mounted) return;

        const errors: string[] = [];

        if (marketData.status === 'fulfilled') {
          setMarkets(marketData.value.markets || []);
        } else {
          setMarkets([]);
          errors.push(isEnglish ? 'markets' : 'دریافت بازارها');
        }

        if (analysisData.status === 'fulfilled') {
          setAnalyses(analysisData.value.analyses || []);
        } else {
          setAnalyses([]);
          errors.push(isEnglish ? 'analyses' : 'دریافت تحلیل‌ها');
        }

        if (planData.status === 'fulfilled') {
          setPlans(planData.value.plans || []);
        } else {
          setPlans([]);
          errors.push(isEnglish ? 'subscription plans' : 'دریافت پلن‌های اشتراک');
        }

        if (settingsData.status === 'fulfilled') {
          setSettings(settingsData.value.settings || {});
        } else {
          setSettings({});
          errors.push(isEnglish ? 'public settings' : 'دریافت تنظیمات عمومی');
        }

        setLoadError(errors.length > 0 ? (isEnglish ? `Failed to load ${errors.join(', ')}` : `${errors.join('، ')} با مشکل مواجه شد.`) : '');
      });

    return () => {
      mounted = false;
    };
  }, []);

  const tabs = useMemo(() => getMarketWatchTabs(locale), [locale]);
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
              {isEnglish ? 'Live data connection failed:' : 'اتصال به داده‌های واقعی برقرار نشد:'} {loadError}
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
                {(isEnglish && hasPersianText(String(settings.hero_title || ''))
                  ? 'Smart investment guidance'
                  : settings.hero_title) || (isEnglish ? 'Smart investment guidance' : 'مشاوره سرمایه‌گذاری هوشمند')}
                <span className="block text-primary-100">{isEnglish ? 'For volatile markets' : 'برای بازارهای پرنوسان'}</span>
              </motion.h1>
              <motion.p variants={fadeInUp} className="max-w-2xl text-lg leading-9 text-slate-300 md:text-xl">
                {(isEnglish && hasPersianText(String(settings.hero_subtitle || ''))
                  ? 'Track expert market analysis, portfolio management, and real-time signals in one clear, fast experience.'
                  : settings.hero_subtitle) || (isEnglish ? 'Track expert market analysis, portfolio management, and real-time signals in one clear, fast experience.' : 'تحلیل‌های تخصصی، مدیریت پورتفو و دیدبان زنده بازار را در یک تجربه فارسی، سریع و شفاف دنبال کنید.')}
              </motion.p>

              <motion.div variants={fadeInUp} className="flex flex-col gap-4 sm:flex-row">
                <ButtonLink href={`/${locale}/auth/signup`} size="lg" className="h-14 w-full px-8 text-base sm:w-auto" rightIcon={<ArrowLeft className="h-5 w-5" />}>
                  {isEnglish ? 'Get started free' : 'شروع رایگان'}
                </ButtonLink>
                <ButtonLink href={`/${locale}/markets`} variant="outline" size="lg" className="h-14 w-full px-8 text-base sm:w-auto">
                  {isEnglish ? 'Explore markets' : 'مشاهده بازارها'}
                </ButtonLink>
              </motion.div>

              <motion.div variants={fadeInUp} className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                {[
                  { icon: <Zap className="h-5 w-5" />, text: isEnglish ? 'Real-time analysis' : 'تحلیل لحظه‌ای' },
                  { icon: <LineChart className="h-5 w-5" />, text: isEnglish ? 'Portfolio management' : 'مدیریت پورتفو' },
                  { icon: <ShieldCheck className="h-5 w-5" />, text: isEnglish ? 'Risk control' : 'کنترل ریسک' },
                ].map((item) => (
                  <div key={item.text} className="glass-soft flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-bold text-slate-100">
                    <span className="text-primary-100">{item.icon}</span>
                    {item.text}
                  </div>
                ))}
              </motion.div>
            </motion.div>

            <motion.div initial={{ opacity: 0, x: -42 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.7, delay: 0.12 }} className="lg:order-1">
              <HomeMarketStage markets={markets} locale={locale} />
            </motion.div>
          </div>
        </section>

        <section className="relative py-16 md:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <SectionTitle title={isEnglish ? 'Core markets' : 'بازارهای اصلی'} subtitle={isEnglish ? 'Track the most important markets with professional tools, actionable signals and live data.' : 'چند بازار مهم را با ابزارهای حرفه‌ای، سیگنال‌های قابل پیگیری و داده‌های زنده بررسی کنید.'} />
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
                              <h3 className="text-xl font-black text-white">{localizeText(market.name, market.name)}</h3>
                              <p className="text-sm font-bold text-primary-100">{market.symbol}</p>
                            </div>
                          </div>
                          <p className="min-h-[84px] leading-7 text-slate-300">{localizeText(market.description, market.description || '')}</p>
                          <Button variant="outline" size="md" fullWidth rightIcon={<ArrowLeft className="h-4 w-4" />}>
                            {isEnglish ? 'View analysis' : 'مشاهده تحلیل'}
                          </Button>
                        </div>
                      </Card>
                    </Link>
                  </motion.div>
                ))
              ) : (
                <Card className="p-8 text-center md:col-span-2 lg:col-span-4">
                  <p className="text-lg font-black text-white">{isEnglish ? 'No markets were returned from the database' : 'هیچ بازاری از دیتابیس دریافت نشد'}</p>
                  <p className="mt-3 text-sm leading-7 text-slate-400">{isEnglish ? 'Once markets are added from the admin panel or connected through the market API, this section will populate with real data.' : 'پس از ثبت بازارها در پنل مدیریت یا اتصال API بازار، این بخش به‌صورت واقعی پر می‌شود.'}</p>
                </Card>
              )}
            </motion.div>
          </div>
        </section>

        <section className="py-16 md:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-10 flex flex-col justify-between gap-6 md:flex-row md:items-end">
              <SectionTitle align="right" title={isEnglish ? 'Top analysis today' : 'تحلیل‌های برتر امروز'} subtitle={isEnglish ? 'Selected signals and high-probability scenarios for the current trading session.' : 'سیگنال‌های منتخب و سناریوهای پر احتمال برای جلسه معاملاتی فعلی.'} />
              <ButtonLink href={`/${locale}/analyses`} variant="ghost" rightIcon={<ArrowLeft className="h-5 w-5" />}>
                {isEnglish ? 'View all' : 'مشاهده همه'}
              </ButtonLink>
            </div>

            <motion.div variants={staggerContainer} initial="initial" whileInView="animate" viewport={{ once: true }} className="grid grid-cols-1 gap-6 md:grid-cols-3">
              {analyses.length > 0 ? (
                analyses.map((analysis: Analysis) => (
                  <motion.div key={analysis.id} variants={fadeInUp}>
                    <Card hoverable className="h-full p-5">
                      <div className="space-y-5">
                        <div className="flex justify-between gap-4">
                          <span className={cn('rounded-lg px-3 py-1 text-xs font-black', analysis.signal === 'BUY' ? 'bg-primary-100/15 text-primary-100' : analysis.signal === 'SELL' ? 'bg-red-300/15 text-red-200' : 'bg-primary-200/15 text-primary-100')}>
                            {isEnglish ? 'Signal' : 'سیگنال'} {signalLabel(locale, analysis.signal)}
                          </span>
                          <span className="text-sm font-bold text-slate-400">{formatDate(analysis.publishedAt)}</span>
                        </div>
                        <h3 className="text-xl font-black leading-8 text-white">{localizeText(analysis.title, analysis.title)}</h3>
                        <p className="line-clamp-2 leading-7 text-slate-300">{localizeText(analysis.summary, analysis.summary)}</p>
                        <div className="grid grid-cols-2 gap-3 border-y border-white/10 py-4">
                          <Metric label={isEnglish ? 'Entry zone' : 'ناحیه ورود'} value={analysis.entryZone || '—'} />
                          <Metric label={isEnglish ? 'Exit zone' : 'ناحیه خروج'} value={analysis.exitZone || '—'} accent />
                        </div>
                        <div className="flex items-center justify-between gap-3">
                          <span className="text-sm font-bold text-slate-300">{formatNumber(analysis.accuracy ?? 0)}{isEnglish ? '% accuracy' : '٪ دقت'}</span>
                          <ButtonLink href={`/${locale}/analyses/${analysis.id}`} size="sm" variant={analysis.isLocked ? 'secondary' : 'primary'}>
                            {analysis.accessLevel === 'login' ? (isEnglish ? 'Login to view' : 'ورود برای مشاهده') : analysis.isLocked ? (isEnglish ? 'Unlock analysis' : 'باز کردن تحلیل') : (isEnglish ? 'Read full' : 'مطالعه کامل')}
                          </ButtonLink>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ))
              ) : (
                <Card className="p-8 text-center md:col-span-3">
                  <p className="text-lg font-black text-white">{isEnglish ? 'No analysis has been published yet' : 'هنوز تحلیلی در دیتابیس منتشر نشده است'}</p>
                  <p className="mt-3 text-sm leading-7 text-slate-400">{isEnglish ? 'Real market analysis will appear here after it is published from the admin panel.' : 'تحلیل‌های واقعی پس از ثبت در پنل مدیریت اینجا نمایش داده می‌شوند.'}</p>
                </Card>
              )}
            </motion.div>
          </div>
        </section>

        <section className="py-16 md:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <SectionTitle title={isEnglish ? 'Market watch' : 'دیدبان بازار'} subtitle={isEnglish ? 'Follow real-time prices for stocks, forex, gold and major currencies in a fast, readable table.' : 'قیمت‌های لحظه‌ای سهام، فارکس، طلا و ارزهای مهم را در یک جدول سریع و خوانا دنبال کنید.'} />
            <div className="mb-8 flex justify-center overflow-x-auto pb-2">
              <div className="glass-soft flex rounded-lg p-1.5" role="tablist" aria-label={isEnglish ? 'Market watch filters' : 'فیلتر دیدبان بازار'}>
                {tabs.map((tab) => {
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
                        isActive ? 'bg-white/90 text-primary-900 shadow-lg shadow-black/20 backdrop-blur-xl border border-white/60' : 'text-slate-300 hover:bg-white/10 hover:text-white',
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
                {isEnglish ? `Showing ${formatNumber(filteredPrices.length)} of ${formatNumber(prices.length)} assets` : `نمایش ${formatNumber(filteredPrices.length)} مورد از ${formatNumber(prices.length)} دارایی`}
              </div>
              <div className="overflow-x-auto">
                {filteredPrices.length > 0 ? (
                  <table className="w-full min-w-[760px]">
                    <thead>
                      <tr className="border-b border-white/10 bg-white/[0.06] text-slate-300">
                        <th className="px-8 py-5 text-right text-xs font-black">{isEnglish ? 'Asset / Symbol' : 'دارایی / نماد'}</th>
                        <th className="px-8 py-5 text-right text-xs font-black">{isEnglish ? 'Last price' : 'آخرین قیمت'}</th>
                        <th className="px-8 py-5 text-right text-xs font-black">{isEnglish ? 'Net change' : 'تغییر خالص'}</th>
                        <th className="px-8 py-5 text-right text-xs font-black">{isEnglish ? '% change' : 'درصد تغییر'}</th>
                        <th className="hidden px-8 py-5 text-right text-xs font-black md:table-cell">{isEnglish ? 'Day range' : 'بازه روز'}</th>
                      </tr>
                    </thead>
                    <motion.tbody key={activeMarketWatchTab} variants={staggerContainer} initial="initial" animate="animate">
                      {filteredPrices.map((price) => (
                        <motion.tr key={price.id} variants={fadeInUp} whileHover={{ backgroundColor: 'rgba(255, 255, 255, 0.07)' }} className="border-b border-white/10 last:border-0">
                          <td className="px-8 py-5">
                            <div className="flex flex-col">
                              <span className="font-mono text-lg font-black text-white">{price.symbol}</span>
                              <span className="text-xs font-bold text-slate-400">
                                {tabs.find((tab) => tab.id === getMarketWatchTab(price))?.label ?? (isEnglish ? 'Global market' : 'بازار جهانی')}
                              </span>
                            </div>
                          </td>
                          <td className="px-8 py-5 font-mono text-xl font-black text-white">
                            {formatNumber(price.currentPrice, { minimumFractionDigits: 2, maximumFractionDigits: 4 })}
                          </td>
                          <td className="px-8 py-5"><PriceChange value={price.change || 0} /></td>
                          <td className="px-8 py-5"><PriceChange value={price.changePercent || 0} format="percent" /></td>
                          <td className="hidden px-8 py-5 md:table-cell">
                            <div className="flex flex-col gap-2">
                              <div className="h-1.5 w-32 overflow-hidden rounded-full bg-white/10">
                                <motion.div initial={{ width: 0 }} animate={{ width: '65%' }} className="h-full bg-white" />
                              </div>
                              <div className="flex w-32 justify-between text-[10px] font-bold">
                                <span className="text-red-300">{formatNumber(price.dayLow || 0, { maximumFractionDigits: 2 })}</span>
                                <span className="text-primary-100">{formatNumber(price.dayHigh || 0, { maximumFractionDigits: 2 })}</span>
                              </div>
                            </div>
                          </td>
                        </motion.tr>
                      ))}
                    </motion.tbody>
                  </table>
                ) : (
                  <div className="px-6 py-12 text-center">
                    <p className="text-lg font-black text-white">{isEnglish ? 'No data found for this group' : 'داده‌ای برای این دسته پیدا نشد'}</p>
                    <p className="mt-3 text-sm leading-7 text-slate-400">{isEnglish ? 'Choose “All markets” to view the full range of active assets.' : 'با انتخاب «همه بازارها» می‌توانید کل دارایی‌های فعال را ببینید.'}</p>
                    <Button type="button" variant="outline" className="mt-6" onClick={() => setActiveMarketWatchTab('all')}>
                      {isEnglish ? 'Show all markets' : 'نمایش همه بازارها'}
                    </Button>
                  </div>
                )}
              </div>
            </Card>
            <p className="mt-6 text-center text-sm font-medium text-slate-400">{isEnglish ? 'Data updates in real time; the displayed markets include Tehran stocks, forex, gold and currencies.' : 'داده‌ها به‌صورت لحظه‌ای به‌روزرسانی می‌شوند؛ بازارهای نمایش‌داده‌شده شامل بورس تهران، فارکس، طلای جهانی و ارزها هستند.'}</p>
          </div>
        </section>

        <section className="py-16 md:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <SectionTitle title={isEnglish ? 'Choose the plan that fits you' : 'پلن مناسب خود را انتخاب کنید'} subtitle={isEnglish ? 'Flexible subscriptions for short-term traders, active investors and wealth managers.' : 'اشتراک‌های منعطف برای معامله‌گر کوتاه‌مدت، سرمایه‌گذار فعال و مدیریت ثروت.'} />
            <motion.div variants={staggerContainer} initial="initial" whileInView="animate" viewport={{ once: true }} className="grid grid-cols-1 gap-6 md:grid-cols-3">
              {plans.length > 0 ? (
                plans.slice(0, 3).map((plan, index) => (
                  <motion.div key={plan.id} variants={fadeInUp}>
                    <Card className={cn('relative flex h-full flex-col p-6', index === 1 && 'border-white/50 bg-white/10')}>
                      {index === 1 && <div className="absolute left-4 top-4 rounded-lg bg-white px-3 py-1 text-xs font-black text-primary-900">{isEnglish ? 'Popular' : 'محبوب'}</div>}
                      <div className="flex-1 space-y-6">
                        <div>
                          <h3 className="text-2xl font-black text-white">{localizeText(plan.name, plan.name)}</h3>
                          <p className="mt-3 min-h-[56px] leading-7 text-slate-300">{localizeText(plan.description, plan.description || '')}</p>
                        </div>
                        <div className="border-y border-white/10 py-5">
                          <span className="text-4xl font-black text-primary-100">{formatNumber(plan.price)} {isEnglish ? 'USD' : 'دلار'}</span>
                          <span className="mr-2 font-bold text-slate-400">/ {billingLabel(locale, plan.billingPeriod)}</span>
                        </div>
                        <ul className="space-y-3">
                          {plan.features.map((feature) => (
                            <li key={feature} className="flex items-start gap-3 text-slate-300">
                              <CheckCircle2 className="mt-1 h-5 w-5 shrink-0 text-primary-100" />
                              <span className="text-sm font-bold leading-6">{localizeText(feature, feature)}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <Button fullWidth className="mt-8 h-12">
                        {isEnglish ? 'Start subscription' : 'شروع اشتراک'}
                      </Button>
                    </Card>
                  </motion.div>
                ))
              ) : (
                <Card className="p-8 text-center md:col-span-3">
                  <p className="text-lg font-black text-white">{isEnglish ? 'No plans are defined in the database yet' : 'پلنی در دیتابیس تعریف نشده است'}</p>
                  <p className="mt-3 text-sm leading-7 text-slate-400">{isEnglish ? 'Subscription plans will appear here after they are added from the pricing admin panel.' : 'پلن‌های اشتراک پس از ثبت در پنل قیمت‌گذاری نمایش داده می‌شوند.'}</p>
                </Card>
              )}
            </motion.div>
            <div className="mt-10 text-center">
              <ButtonLink href={`/${locale}/pricing`} variant="outline" size="lg">{isEnglish ? 'View all plans' : 'مشاهده همه پلن‌ها'}</ButtonLink>
            </div>
          </div>
        </section>

        <section className="py-16 md:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <SectionTitle title={isEnglish ? 'Proven performance' : 'سابقه عملکرد قابل اتکا'} subtitle={isEnglish ? 'Performance indicators to measure decision quality and risk management.' : 'شاخص‌های عملکرد تحلیل‌ها برای سنجش کیفیت تصمیم‌سازی و مدیریت ریسک.'} />
            <motion.div variants={staggerContainer} initial="initial" whileInView="animate" viewport={{ once: true }} className="grid grid-cols-2 gap-4 md:grid-cols-3">
              {[
                { label: isEnglish ? 'Analysis accuracy' : 'دقت تحلیل', value: `${formatNumber(performanceStats.accuracy)}${isEnglish ? '%' : '٪'}` },
                { label: isEnglish ? 'Total analyses' : 'کل تحلیل‌ها', value: formatNumber(performanceStats.totalAnalyses) },
                { label: isEnglish ? 'Success rate' : 'نرخ موفقیت', value: `${formatNumber(performanceStats.winRate)}${isEnglish ? '%' : '٪'}` },
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
            <h2 className="text-4xl font-black leading-tight text-white md:text-6xl">{isEnglish ? 'Make sharper investment decisions starting today' : 'از امروز تصمیم‌های سرمایه‌گذاری را دقیق‌تر بگیرید'}</h2>
            <p className="mx-auto mt-7 max-w-2xl text-lg leading-9 text-slate-300">
              {isEnglish ? 'Join investors who trust Mousavi Investment for expert market analysis, instant alerts and portfolio management.' : 'به سرمایه‌گذارانی بپیوندید که برای تحلیل حرفه‌ای بازار، هشدارهای سریع و مدیریت پورتفو به سرمایه گذاری موسوی اعتماد می‌کنند.'}
            </p>
            <div className="mt-10 flex flex-col justify-center gap-4 sm:flex-row">
              <ButtonLink href={`/${locale}/auth/signup`} size="lg" className="h-14 px-10">{isEnglish ? 'Sign up free' : 'ثبت‌نام رایگان'}</ButtonLink>
              <ButtonLink href={`/${locale}/faq`} size="lg" variant="outline" className="h-14 px-10">{isEnglish ? 'FAQ' : 'سوالات متداول'}</ButtonLink>
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

function HomeMarketStage({ markets, locale }: { markets: Array<Market & { prices?: Price[] }>; locale: 'fa' | 'en' }) {
  const formatNumber = (value: number, options?: Intl.NumberFormatOptions) => new Intl.NumberFormat(locale === 'en' ? 'en-US' : 'fa-IR', options).format(value);
  const localizeLabel = (value: string) => {
    if (locale !== 'en') return value;

    const map: Record<string, string> = {
      'بورس ایران': 'Iran Stocks',
      'فارکس': 'Forex',
      'طلا و فلزات': 'Gold & Metals',
      'ارزها': 'Currencies',
      'بازار جهانی': 'Global Market',
    };

    return map[value] || value;
  };

  const featuredMarkets = markets.slice(0, 4);
  const sceneLegend = [
    { label: locale === 'en' ? 'Portfolio core' : 'هسته پورتفو', color: 'bg-primary-100' },
    { label: locale === 'en' ? 'Market orbit' : 'مدار بازارها', color: 'bg-cyan-200' },
    { label: locale === 'en' ? 'Risk ring' : 'رینگ ریسک', color: 'bg-amber-300' },
    { label: locale === 'en' ? 'Signal flow' : 'جریان سیگنال', color: 'bg-emerald-300' },
  ];

  return (
    <div className="relative min-h-[620px] rounded-lg border border-white/10 bg-white/[0.055] shadow-2xl shadow-primary-950/40 backdrop-blur-md sm:min-h-[580px]">
      <div className="absolute inset-0 overflow-hidden rounded-lg">
        <MarketOrbitScene density="compact" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_42%,transparent_0%,rgba(22,0,34,0.06)_38%,rgba(22,0,34,0.7)_100%)]" />
      </div>

      <motion.div
        animate={{ y: [0, -8, 0], rotateX: [0, 2, 0] }}
        transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute left-4 top-4 w-[min(18rem,calc(100%-2rem))] rounded-lg border border-white/15 bg-[#11051f]/75 p-4 shadow-2xl shadow-cyan-950/40 backdrop-blur-2xl sm:left-6 sm:top-6"
      >
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="text-xs font-black text-cyan-100">{locale === 'en' ? '3D decision map' : 'نقشه سه‌بعدی تصمیم'}</p>
            <h2 className="mt-2 text-xl font-black text-white">{locale === 'en' ? 'Portfolio at the market center' : 'پورتفو در مرکز بازار'}</h2>
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
                  <span className="text-sm font-bold text-slate-200">{localizeLabel(market.name)}</span>
                  <PriceChange value={price?.changePercent || 0} format="percent" className="text-xs" />
                </div>
                <div className="flex items-end justify-between gap-4">
                  <span className="font-mono text-lg font-black text-white">{formatNumber(price?.currentPrice || 0, { maximumFractionDigits: 4 })}</span>
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
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.25 }}
        className="absolute right-4 top-4 hidden w-[min(15rem,calc(100%-2rem))] rounded-lg border border-white/15 bg-[#130520]/70 p-3 shadow-2xl shadow-black/20 backdrop-blur-2xl sm:right-6 sm:top-6 md:block"
      >
        <p className="mb-3 text-xs font-black text-primary-100">{locale === 'en' ? '3D view guide' : 'راهنمای نمای سه‌بعدی'}</p>
        <div className="grid gap-2">
          {sceneLegend.map((item) => (
            <div key={item.label} className="flex items-center justify-between gap-3 rounded-lg bg-white/[0.055] px-3 py-2">
              <span className="text-[11px] font-bold text-slate-200">{item.label}</span>
              <span className={cn('h-2.5 w-2.5 rounded-full shadow-lg', item.color)} />
            </div>
          ))}
        </div>
      </motion.div>

      <motion.div
        animate={{ y: [0, 10, 0], rotateY: [0, -3, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut', delay: 0.4 }}
        className="absolute bottom-4 right-4 w-[min(17rem,calc(100%-2rem))] rounded-lg border border-white/15 bg-[#120720]/80 p-4 shadow-2xl shadow-black/30 backdrop-blur-2xl sm:bottom-6 sm:right-6"
      >
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="text-xs font-black text-primary-100">{locale === 'en' ? 'Risk control ring' : 'رینگ کنترل ریسک'}</p>
            <p className="mt-1 text-3xl font-black text-white">{locale === 'en' ? '24%' : '۲۴٪'}</p>
          </div>
          <div className="rounded-lg bg-emerald-300/12 p-2 text-emerald-200">
            <ShieldCheck className="h-5 w-5" />
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {(locale === 'en' ? ['Stocks', 'Gold', 'Currencies'] : ['سهام', 'طلا', 'ارز']).map((label, idx) => (
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

function ButtonLink({
  href,
  children,
  variant = 'primary',
  size = 'md',
  className,
  leftIcon,
  rightIcon,
  fullWidth = false,
}: {
  href: string;
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  fullWidth?: boolean;
}) {
  const baseStyles = 'inline-flex items-center justify-center gap-2 rounded-lg font-bold transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-transparent';
  const variants = {
    primary: 'bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-300 shadow-lg shadow-primary-900/25',
    secondary: 'bg-white/14 text-white hover:bg-white/20 border border-white/15 focus:ring-white/40 backdrop-blur-xl',
    outline: 'border border-white/70 text-white hover:bg-white/10 focus:ring-white backdrop-blur-xl',
    ghost: 'text-slate-200 hover:bg-white/10 focus:ring-white',
  } as const;
  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-6 py-2.5 text-base',
    lg: 'px-8 py-3 text-lg',
  } as const;

  return (
    <Link
      href={href}
      className={cn(baseStyles, variants[variant], sizes[size], fullWidth && 'w-full', className)}
    >
      {leftIcon && <span>{leftIcon}</span>}
      {children}
      {rightIcon && <span>{rightIcon}</span>}
    </Link>
  );
}

