'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeft, BarChart3, CalendarDays, ChevronLeft, Globe2, Newspaper, TrendingUp } from 'lucide-react';

import { Button, Card, Footer, Header, useLocale } from '@/components';
import { formatFaDate } from '@/lib/format';
import { cn } from '@/lib/utils';

const fadeInUp = {
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.45, ease: 'easeOut' },
};

type NewsItem = {
  category: string;
  title: string;
  text: string;
  date: string;
};

type NewsWeek = {
  id: string;
  start: string;
  end: string;
  faLabel: string;
  enLabel: string;
  faNews: NewsItem[];
  enNews: NewsItem[];
};

const newsWeeks: NewsWeek[] = [
  {
    id: '2026-10-03',
    start: '2026-10-03',
    end: '2026-10-09',
    faLabel: 'هفته سوم مهر ۱۴۰۵',
    enLabel: 'Week of Oct 3, 2026',
    faNews: [
      { category: 'اقتصاد کلان', date: '2026-10-09', title: 'رصد نرخ بهره، تورم و اثر آن بر بازارهای دارایی', text: 'تحلیل رویدادهای کلان که می‌توانند جهت نقدینگی و انتظارات سرمایه‌گذاران را تغییر دهند.' },
      { category: 'بازار سرمایه', date: '2026-10-07', title: 'پیگیری صنایع اثرگذار و جریان نقدینگی بورس', text: 'نگاهی منظم به خبرهای مهم شرکت‌ها، سیاست‌گذاری‌ها و متغیرهای اثرگذار بر شاخص‌ها.' },
      { category: 'بازار جهانی', date: '2026-10-05', title: 'اخبار طلا، ارز و بازارهای بین‌المللی', text: 'مرور تحولات دلار جهانی، اونس طلا، نفت و ریسک‌های ژئوپلیتیک اثرگذار بر دارایی‌ها.' },
    ],
    enNews: [
      { category: 'Macro', date: '2026-10-09', title: 'Tracking rates, inflation, and asset-market impact', text: 'Coverage of macro events that can shift liquidity direction and investor expectations.' },
      { category: 'Capital Market', date: '2026-10-07', title: 'Following key sectors and equity liquidity flow', text: 'Regular view of company news, policy updates, and variables that affect market indexes.' },
      { category: 'Global Markets', date: '2026-10-05', title: 'Gold, currency, and international market news', text: 'Updates on the dollar, spot gold, oil, and geopolitical risks that move assets.' },
    ],
  },
  {
    id: '2026-09-26',
    start: '2026-09-26',
    end: '2026-10-02',
    faLabel: 'هفته دوم مهر ۱۴۰۵',
    enLabel: 'Week of Sep 26, 2026',
    faNews: [
      { category: 'اقتصاد کلان', date: '2026-10-02', title: 'مرور داده‌های تورمی و انتظارات نرخ ارز', text: 'جمع‌بندی خبرهای کلان هفته و اثر احتمالی آن‌ها بر تصمیم سرمایه‌گذاران در بازارهای موازی.' },
      { category: 'بازار سرمایه', date: '2026-09-30', title: 'تحرکات نقدینگی در گروه‌های شاخص‌ساز', text: 'پیگیری تغییرات جریان پول، گزارش‌های مهم و خبرهای سیاست‌گذاری اثرگذار بر صنایع بورسی.' },
      { category: 'بازار جهانی', date: '2026-09-28', title: 'هفته پرنوسان طلا و نفت در بازار جهانی', text: 'بررسی رویدادهای جهانی و سیگنال‌هایی که بر طلا، نفت و دارایی‌های ریسکی اثر گذاشتند.' },
    ],
    enNews: [
      { category: 'Macro', date: '2026-10-02', title: 'Inflation data and currency expectations recap', text: 'A weekly macro recap and its likely effect on investor decisions across asset classes.' },
      { category: 'Capital Market', date: '2026-09-30', title: 'Liquidity movement in index-heavy sectors', text: 'Tracking money flow, company reports, and policy signals that moved listed industries.' },
      { category: 'Global Markets', date: '2026-09-28', title: 'A volatile week for gold and oil', text: 'Reviewing global events and signals that shaped gold, oil, and risk assets.' },
    ],
  },
  {
    id: '2026-09-19',
    start: '2026-09-19',
    end: '2026-09-25',
    faLabel: 'هفته اول مهر ۱۴۰۵',
    enLabel: 'Week of Sep 19, 2026',
    faNews: [
      { category: 'اقتصاد کلان', date: '2026-09-25', title: 'تصمیم‌های سیاست‌گذار و مسیر نقدینگی', text: 'مروری بر مهم‌ترین تصمیم‌ها، اظهارنظرها و داده‌هایی که بر انتظارات تورمی اثر گذاشتند.' },
      { category: 'بازار سرمایه', date: '2026-09-23', title: 'خبرهای اثرگذار بر صنایع بزرگ بورس', text: 'نگاه هفتگی به خبرهای شرکت‌ها، نرخ‌گذاری‌ها و تغییرات مقرراتی مهم برای بازار سرمایه.' },
      { category: 'بازار جهانی', date: '2026-09-21', title: 'سیگنال‌های دلار جهانی و کامودیتی‌ها', text: 'بررسی جهت‌گیری دلار جهانی، فلزات، نفت و شاخص‌های مهم اثرگذار بر بازارهای داخلی.' },
    ],
    enNews: [
      { category: 'Macro', date: '2026-09-25', title: 'Policy decisions and liquidity direction', text: 'A review of decisions, comments, and data that influenced inflation expectations.' },
      { category: 'Capital Market', date: '2026-09-23', title: 'News shaping major equity sectors', text: 'A weekly look at company news, pricing decisions, and regulatory shifts for equities.' },
      { category: 'Global Markets', date: '2026-09-21', title: 'Dollar and commodity signals', text: 'Tracking the dollar, metals, oil, and global indexes that matter for domestic markets.' },
    ],
  },
];

export default function EconomicNewsPage() {
  const { locale } = useLocale();
  const isEnglish = locale === 'en';
  const [selectedWeekId, setSelectedWeekId] = useState(newsWeeks[0]?.id || '');
  const selectedWeek = useMemo(() => newsWeeks.find((week) => week.id === selectedWeekId) || newsWeeks[0], [selectedWeekId]);
  const news = isEnglish ? selectedWeek.enNews : selectedWeek.faNews;

  return (
    <div className="site-page min-h-screen bg-[#160022] text-white">
      <Header isAuthenticated={false} />

      <main>
        <section className="relative overflow-hidden border-b border-white/10 py-16 md:py-24">
          <div className="aurora-grid absolute inset-0 opacity-55" />
          <div className="relative z-10 mx-auto grid max-w-7xl grid-cols-1 gap-10 px-4 sm:px-6 lg:grid-cols-[1fr_0.85fr] lg:px-8">
            <motion.div initial="initial" animate="animate" variants={fadeInUp}>
              <div className="mb-6 inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/10 px-4 py-2 text-sm font-black text-primary-100">
                <Newspaper className="h-4 w-4" />
                {isEnglish ? 'Economic News' : 'اخبار اقتصادی'}
              </div>
              <h1 className="text-4xl font-black leading-tight md:text-6xl">
                {isEnglish ? 'Market-moving news in one place' : 'خبرهای اثرگذار بر بازار در یک نگاه'}
              </h1>
              <p className="mt-5 max-w-3xl text-base leading-8 text-slate-300 md:text-lg">
                {isEnglish
                  ? 'Follow the economic events, policy shifts, and global signals that matter for investment decisions.'
                  : 'رویدادهای اقتصادی، تصمیم‌های سیاست‌گذار و سیگنال‌های جهانی را دنبال کنید؛ همان خبرهایی که می‌توانند مسیر بازارها را تغییر دهند.'}
              </p>
              <Link href={`/${locale}/analyses`} className="mt-8 inline-flex">
                <Button size="lg" rightIcon={<ArrowLeft className="h-5 w-5" />}>
                  {isEnglish ? 'Connect news to analysis' : 'اتصال خبر به تحلیل'}
                </Button>
              </Link>
            </motion.div>

            <Card className="border-white/10 bg-white/[0.07] p-6">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <p className="text-sm font-black text-primary-100">{isEnglish ? 'Today watch' : 'دیده‌بان امروز'}</p>
                  <h2 className="mt-2 text-2xl font-black">{isEnglish ? 'Key signals' : 'سیگنال‌های کلیدی'}</h2>
                </div>
                <TrendingUp className="h-8 w-8 text-primary-100" />
              </div>
              <div className="space-y-4">
                {(isEnglish ? ['Inflation trend', 'Currency pressure', 'Commodity sentiment'] : ['روند تورم', 'فشار ارزی', 'جو بازار کالاها']).map((item, index) => (
                  <div key={item} className="rounded-lg border border-white/10 bg-black/20 p-4">
                    <div className="flex items-center justify-between gap-4">
                      <span className="font-bold text-slate-300">{item}</span>
                      <span className="font-mono text-lg font-black text-white">{index === 0 ? 'High' : index === 1 ? 'Medium' : 'Watch'}</span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </section>

        <section className="py-16 md:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-8 flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
              <div>
                <div className="mb-3 inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/10 px-3 py-1.5 text-sm font-black text-primary-100">
                  <CalendarDays className="h-4 w-4" />
                  {isEnglish ? 'Weekly archive' : 'آرشیو هفتگی خبرها'}
                </div>
                <h2 className="text-3xl font-black text-white">
                  {isEnglish ? selectedWeek.enLabel : selectedWeek.faLabel}
                </h2>
                <p className="mt-3 text-sm font-bold text-slate-300">
                  {isEnglish
                    ? `${new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(new Date(selectedWeek.start))} - ${new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(selectedWeek.end))}`
                    : `${formatFaDate(selectedWeek.start)} تا ${formatFaDate(selectedWeek.end)}`}
                </p>
              </div>

              <div className="flex gap-3 overflow-x-auto pb-2" role="tablist" aria-label={isEnglish ? 'News weeks' : 'هفته‌های خبری'}>
                {newsWeeks.map((week) => {
                  const isActive = week.id === selectedWeek.id;
                  return (
                    <button
                      key={week.id}
                      type="button"
                      role="tab"
                      aria-selected={isActive}
                      onClick={() => setSelectedWeekId(week.id)}
                      className={cn(
                        'inline-flex shrink-0 items-center gap-2 rounded-lg border px-4 py-3 text-sm font-black transition-all focus:outline-none focus:ring-2 focus:ring-primary-200',
                        isActive
                          ? 'border-primary-200 bg-primary-600 text-white shadow-lg shadow-primary-950/20'
                          : 'border-white/10 bg-white/[0.07] text-primary-100 hover:bg-white/12',
                      )}
                    >
                      {isEnglish ? week.enLabel : week.faLabel}
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
              {news.map((item) => (
                <Card key={item.title} className="h-full border-white/10 bg-white/[0.07] p-5">
                  <div className="mb-5 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2 text-sm font-black text-primary-100">
                    {item.category === 'Macro' || item.category === 'اقتصاد کلان' ? <BarChart3 className="h-4 w-4" /> : item.category === 'Global Markets' || item.category === 'بازار جهانی' ? <Globe2 className="h-4 w-4" /> : <CalendarDays className="h-4 w-4" />}
                    {item.category}
                    </div>
                    <span className="shrink-0 text-xs font-black text-slate-400">{isEnglish ? new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(new Date(item.date)) : formatFaDate(item.date)}</span>
                  </div>
                  <h2 className="text-xl font-black leading-8 text-white">{item.title}</h2>
                  <p className="mt-4 text-sm leading-7 text-slate-300">{item.text}</p>
                </Card>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
