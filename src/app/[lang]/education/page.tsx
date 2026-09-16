'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeft, BookOpenCheck, CandlestickChart, GraduationCap, LineChart, ShieldCheck, WalletCards } from 'lucide-react';

import { Button, Card, Footer, Header, useLocale } from '@/components';

const fadeInUp = {
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.45, ease: 'easeOut' },
};

const faLessons = [
  { icon: LineChart, title: 'مبانی تحلیل بازار', text: 'شناخت روند، حمایت و مقاومت، حجم معاملات و سناریونویسی قبل از ورود.' },
  { icon: ShieldCheck, title: 'مدیریت ریسک', text: 'تعیین حد ضرر، اندازه موقعیت، نسبت ریسک به بازده و کنترل تصمیم‌های هیجانی.' },
  { icon: CandlestickChart, title: 'خواندن نمودار', text: 'کار با کندل‌ها، ساختار قیمت و نشانه‌هایی که تغییر فاز بازار را نشان می‌دهند.' },
  { icon: WalletCards, title: 'ساخت پورتفوی', text: 'تقسیم سرمایه بین دارایی‌ها، کنترل تمرکز ریسک و بازبینی دوره‌ای سبد.' },
];

const enLessons = [
  { icon: LineChart, title: 'Market Analysis Basics', text: 'Understand trend, support and resistance, volume, and scenario planning before entry.' },
  { icon: ShieldCheck, title: 'Risk Management', text: 'Set stop loss, position size, risk-to-reward, and control emotional decisions.' },
  { icon: CandlestickChart, title: 'Chart Reading', text: 'Work with candles, price structure, and signals that show market phase changes.' },
  { icon: WalletCards, title: 'Portfolio Building', text: 'Allocate capital across assets, manage concentration risk, and review holdings periodically.' },
];

export default function EducationPage() {
  const { locale } = useLocale();
  const isEnglish = locale === 'en';
  const lessons = isEnglish ? enLessons : faLessons;

  return (
    <div className="site-page min-h-screen bg-[#160022] text-white">
      <Header isAuthenticated={false} />

      <main>
        <section className="relative overflow-hidden border-b border-white/10 py-16 md:py-24">
          <div className="aurora-grid absolute inset-0 opacity-55" />
          <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <motion.div initial="initial" animate="animate" variants={fadeInUp} className="max-w-4xl">
              <div className="mb-6 inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/10 px-4 py-2 text-sm font-black text-primary-100">
                <GraduationCap className="h-4 w-4" />
                {isEnglish ? 'Education Center' : 'مرکز آموزش'}
              </div>
              <h1 className="text-4xl font-black leading-tight md:text-6xl">
                {isEnglish ? 'Learn investing with a practical path' : 'آموزش سرمایه‌گذاری با مسیر کاربردی'}
              </h1>
              <p className="mt-5 max-w-3xl text-base leading-8 text-slate-300 md:text-lg">
                {isEnglish
                  ? 'Start from the foundations and move toward disciplined analysis, risk management, and portfolio decisions.'
                  : 'از مفاهیم پایه شروع کنید و قدم‌به‌قدم به تحلیل منظم، مدیریت ریسک و تصمیم‌گیری بهتر در پورتفوی برسید.'}
              </p>
              <Link href={`/${locale}/analyses`} className="mt-8 inline-flex">
                <Button size="lg" rightIcon={<ArrowLeft className="h-5 w-5" />}>
                  {isEnglish ? 'See market analyses' : 'مشاهده تحلیل‌ها'}
                </Button>
              </Link>
            </motion.div>
          </div>
        </section>

        <section className="py-16 md:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-10 flex items-center gap-3">
              <BookOpenCheck className="h-8 w-8 text-primary-100" />
              <h2 className="text-3xl font-black md:text-4xl">{isEnglish ? 'Learning Tracks' : 'مسیرهای آموزشی'}</h2>
            </div>
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
              {lessons.map((lesson) => (
                <Card key={lesson.title} className="h-full border-white/10 bg-white/[0.07] p-5">
                  <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-lg bg-primary-100/15 text-primary-100">
                    <lesson.icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-black text-white">{lesson.title}</h3>
                  <p className="mt-4 text-sm leading-7 text-slate-300">{lesson.text}</p>
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
