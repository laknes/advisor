'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeft, BarChart3, CalendarDays, Globe2, Newspaper, TrendingUp } from 'lucide-react';

import { Button, Card, Footer, Header, useLocale } from '@/components';

const fadeInUp = {
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.45, ease: 'easeOut' },
};

const faNews = [
  { category: 'اقتصاد کلان', title: 'رصد نرخ بهره، تورم و اثر آن بر بازارهای دارایی', text: 'تحلیل رویدادهای کلان که می‌توانند جهت نقدینگی و انتظارات سرمایه‌گذاران را تغییر دهند.' },
  { category: 'بازار سرمایه', title: 'پیگیری صنایع اثرگذار و جریان نقدینگی بورس', text: 'نگاهی منظم به خبرهای مهم شرکت‌ها، سیاست‌گذاری‌ها و متغیرهای اثرگذار بر شاخص‌ها.' },
  { category: 'بازار جهانی', title: 'اخبار طلا، ارز و بازارهای بین‌المللی', text: 'مرور تحولات دلار جهانی، اونس طلا، نفت و ریسک‌های ژئوپلیتیک اثرگذار بر دارایی‌ها.' },
];

const enNews = [
  { category: 'Macro', title: 'Tracking rates, inflation, and asset-market impact', text: 'Coverage of macro events that can shift liquidity direction and investor expectations.' },
  { category: 'Capital Market', title: 'Following key sectors and equity liquidity flow', text: 'Regular view of company news, policy updates, and variables that affect market indexes.' },
  { category: 'Global Markets', title: 'Gold, currency, and international market news', text: 'Updates on the dollar, spot gold, oil, and geopolitical risks that move assets.' },
];

export default function EconomicNewsPage() {
  const { locale } = useLocale();
  const isEnglish = locale === 'en';
  const news = isEnglish ? enNews : faNews;

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
            <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
              {news.map((item) => (
                <Card key={item.title} className="h-full border-white/10 bg-white/[0.07] p-5">
                  <div className="mb-5 flex items-center gap-2 text-sm font-black text-primary-100">
                    {item.category === 'Macro' || item.category === 'اقتصاد کلان' ? <BarChart3 className="h-4 w-4" /> : item.category === 'Global Markets' || item.category === 'بازار جهانی' ? <Globe2 className="h-4 w-4" /> : <CalendarDays className="h-4 w-4" />}
                    {item.category}
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
