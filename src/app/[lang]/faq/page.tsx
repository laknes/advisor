'use client';

import { Header, Card, CardHeader, CardContent, Button } from '@/components';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { Plus, Minus, HelpCircle } from 'lucide-react';

const faqs = [
  {
    question: "تحلیل روزانه چگونه آماده می‌شود؟",
    answer: "تیم تحلیل‌گران ما بازارها را به‌صورت پیوسته پایش می‌کند و هر روز گزارش‌هایی شامل نقاط ورود، اهداف و ارزیابی ریسک منتشر می‌شود."
  },
  {
    question: "چه بازارهایی پوشش داده می‌شود؟",
    answer: "در حال حاضر بازار سهام تهران، ارز، طلا و فلزات گران‌بها و بازارهای پولی جهانی پوشش داده می‌شود."
  },
  {
    question: "آیا می‌توانم هر زمان اشتراک را لغو کنم؟",
    answer: "بله، مدیریت اشتراک از داشبورد انجام می‌شود و پس از لغو، دسترسی شما تا پایان دوره فعلی باقی می‌ماند."
  },
  {
    question: "دقت سیگنال‌های معاملاتی چقدر است؟",
    answer: "هیچ تحلیلی موفقیت قطعی ندارد، اما عملکرد تاریخی ما در بازارهای مختلف نرخ موفقیت قابل توجهی نشان داده است. تمرکز اصلی ما مدیریت ریسک و پایداری بلندمدت است."
  },
  {
    question: "آیا مشاوره اختصاصی هم ارائه می‌شود؟",
    answer: "بله، در طرح‌های ویژه امکان ارتباط مستقیم با کارشناس بازار و دریافت راهنمایی اختصاصی وجود دارد."
  }
];

export default function FAQPage() {
  return (
    <div className="min-h-screen bg-[#160022] text-white">
      <Header isAuthenticated={false} />

      <main className="py-20 md:py-32">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-6xl font-black text-white tracking-tight mb-6">
              سوالات <span className="text-primary-200">متداول</span>
            </h1>
            <p className="text-xl text-slate-300 font-medium">
              پاسخ پرسش‌های رایج درباره پلتفرم و خدمات ما.
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <FAQItem key={index} question={faq.question} answer={faq.answer} />
            ))}
          </div>

          <div className="mt-20 text-center bg-white p-12 rounded-3xl shadow-xl border border-secondary-100">
            <div className="w-16 h-16 bg-primary-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <HelpCircle className="w-8 h-8 text-primary-600" />
            </div>
            <h2 className="text-2xl font-bold text-secondary-900 mb-4">هنوز سوال دارید؟</h2>
            <p className="text-secondary-600 mb-8 max-w-md mx-auto">
              اگر پاسخ مورد نظر را پیدا نکردید، با تیم پشتیبانی تماس بگیرید.
            </p>
            <Button size="lg" className="px-10 h-14">تماس با پشتیبانی</Button>
          </div>
        </div>
      </main>
    </div>
  );
}

function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <motion.div 
      initial={false}
      className="bg-white rounded-2xl border border-secondary-100 shadow-sm overflow-hidden"
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-6 text-right hover:bg-secondary-50 transition-colors"
      >
        <span className="text-lg font-bold text-secondary-900">{question}</span>
        <div className={`p-2 rounded-lg transition-colors ${isOpen ? 'bg-primary-600 text-white' : 'bg-secondary-100 text-secondary-500'}`}>
          {isOpen ? <Minus className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
        </div>
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
          >
            <div className="p-6 pt-0 text-secondary-600 leading-relaxed text-lg border-t border-secondary-50 mt-4">
              {answer}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
