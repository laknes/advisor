'use client';

import { Header, Card, CardContent } from '@/components';
import { ShieldCheck, FileText, Scale } from 'lucide-react';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#160022] text-white">
      <Header isAuthenticated={false} />

      <main className="py-20 md:py-32">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-6xl font-black text-white tracking-tight mb-6">
              قوانین و <span className="text-primary-200">مقررات</span>
            </h1>
            <p className="text-xl text-slate-300 font-medium">
              آخرین به‌روزرسانی: ۱۸ خرداد ۱۴۰۵
            </p>
          </div>

          <Card className="border-none shadow-xl bg-white overflow-hidden rounded-3xl">
            <CardContent className="p-8 md:p-12 space-y-10">
              <section>
                <div className="flex items-center gap-3 mb-4">
                  <FileText className="w-6 h-6 text-primary-600" />
                  <h2 className="text-2xl font-bold text-secondary-900">۱. پذیرش قوانین</h2>
                </div>
                <p className="text-secondary-600 leading-relaxed text-lg">
                  با دسترسی و استفاده از مشاور پورتفو، شما این قوانین را می‌پذیرید. اگر با هر بخش از این شرایط موافق نیستید، لطفاً از خدمات ما استفاده نکنید.
                </p>
              </section>

              <section>
                <div className="flex items-center gap-3 mb-4">
                  <ShieldCheck className="w-6 h-6 text-primary-600" />
                  <h2 className="text-2xl font-bold text-secondary-900">۲. استفاده از خدمات</h2>
                </div>
                <p className="text-secondary-600 leading-relaxed text-lg">
                  این پلتفرم تحلیل بازار و سیگنال‌های سرمایه‌گذاری را فقط با هدف اطلاع‌رسانی ارائه می‌کند. نگهداری امن حساب کاربری و رمز عبور بر عهده شماست.
                </p>
              </section>

              <section>
                <div className="flex items-center gap-3 mb-4">
                  <Scale className="w-6 h-6 text-primary-600" />
                  <h2 className="text-2xl font-bold text-secondary-900">۳. اشتراک و پرداخت</h2>
                </div>
                <p className="text-secondary-600 leading-relaxed text-lg">
                  هزینه اشتراک‌ها به‌صورت دوره‌ای و پیش از شروع دوره دریافت می‌شود. شما می‌توانید هر زمان اشتراک خود را لغو کنید، اما بابت بخش استفاده‌نشده دوره جاری بازپرداختی انجام نمی‌شود.
                </p>
              </section>

              <section className="bg-secondary-50 p-8 rounded-2xl border border-secondary-100">
                <h2 className="text-xl font-bold text-secondary-900 mb-4">۴. مالکیت فکری</h2>
                <p className="text-secondary-600 leading-relaxed italic">
                  همه محتواها، تحلیل‌ها و سیگنال‌های ارائه‌شده در مشاور پورتفو متعلق به پلتفرم هستند و بدون اجازه کتبی صریح نباید بازنشر، فروش یا در اختیار دیگران قرار داده شوند.
                </p>
              </section>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
