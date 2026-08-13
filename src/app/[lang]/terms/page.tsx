'use client';

import { Header, Card, CardContent } from '@/components';
import { useLocale } from '@/components/LocaleProvider';
import { ShieldCheck, FileText, Scale } from 'lucide-react';

export default function TermsPage() {
  const { locale } = useLocale();
  const isEnglish = locale === 'en';

  return (
    <div className="min-h-screen bg-[#160022] text-white">
      <Header isAuthenticated={false} />

      <main className="py-20 md:py-32">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-6xl font-black text-white tracking-tight mb-6">
              {isEnglish ? 'Terms & ' : 'قوانین و '}<span className="text-primary-200">{isEnglish ? 'Conditions' : 'مقررات'}</span>
            </h1>
            <p className="text-xl text-slate-300 font-medium">
              {isEnglish ? 'Last updated: June 8, 2026' : 'آخرین به‌روزرسانی: ۱۸ خرداد ۱۴۰۵'}
            </p>
          </div>

          <Card className="border-none shadow-xl bg-white overflow-hidden rounded-3xl">
            <CardContent className="p-8 md:p-12 space-y-10">
              <section>
                <div className="flex items-center gap-3 mb-4">
                  <FileText className="w-6 h-6 text-primary-600" />
                  <h2 className="text-2xl font-bold text-secondary-900">{isEnglish ? '1. Acceptance of Terms' : '۱. پذیرش قوانین'}</h2>
                </div>
                <p className="text-secondary-600 leading-relaxed text-lg">
                  {isEnglish
                    ? 'By accessing and using Mousavi Investment, you agree to these terms. If you do not agree with any part of these terms, please do not use our services.'
                    : 'با دسترسی و استفاده از سرمایه گذاری موسوی، شما این قوانین را می‌پذیرید. اگر با هر بخش از این شرایط موافق نیستید، لطفاً از خدمات ما استفاده نکنید.'}
                </p>
              </section>

              <section>
                <div className="flex items-center gap-3 mb-4">
                  <ShieldCheck className="w-6 h-6 text-primary-600" />
                  <h2 className="text-2xl font-bold text-secondary-900">{isEnglish ? '2. Use of Services' : '۲. استفاده از خدمات'}</h2>
                </div>
                <p className="text-secondary-600 leading-relaxed text-lg">
                  {isEnglish
                    ? 'This platform provides market analysis and investment signals for informational purposes only. You are responsible for keeping your account and password secure.'
                    : 'این پلتفرم تحلیل بازار و سیگنال‌های سرمایه‌گذاری را فقط با هدف اطلاع‌رسانی ارائه می‌کند. نگهداری امن حساب کاربری و رمز عبور بر عهده شماست.'}
                </p>
              </section>

              <section>
                <div className="flex items-center gap-3 mb-4">
                  <Scale className="w-6 h-6 text-primary-600" />
                  <h2 className="text-2xl font-bold text-secondary-900">{isEnglish ? '3. Subscriptions and Payments' : '۳. اشتراک و پرداخت'}</h2>
                </div>
                <p className="text-secondary-600 leading-relaxed text-lg">
                  {isEnglish
                    ? 'Subscription fees are charged periodically before each billing period begins. You may cancel your subscription at any time, but unused time in the current period is non-refundable.'
                    : 'هزینه اشتراک‌ها به‌صورت دوره‌ای و پیش از شروع دوره دریافت می‌شود. شما می‌توانید هر زمان اشتراک خود را لغو کنید، اما بابت بخش استفاده‌نشده دوره جاری بازپرداختی انجام نمی‌شود.'}
                </p>
              </section>

              <section className="bg-secondary-50 p-8 rounded-2xl border border-secondary-100">
                <h2 className="text-xl font-bold text-secondary-900 mb-4">{isEnglish ? '4. Intellectual Property' : '۴. مالکیت فکری'}</h2>
                <p className="text-secondary-600 leading-relaxed italic">
                  {isEnglish
                    ? 'All content, analyses, and signals provided by Mousavi Investment belong to the platform and may not be redistributed, sold, or shared without explicit written permission.'
                    : 'همه محتواها، تحلیل‌ها و سیگنال‌های ارائه‌شده در سرمایه گذاری موسوی متعلق به پلتفرم هستند و بدون اجازه کتبی صریح نباید بازنشر، فروش یا در اختیار دیگران قرار داده شوند.'}
                </p>
              </section>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
