'use client';

import { Header, Card, CardContent } from '@/components';
import { AlertTriangle, Info, ShieldAlert } from 'lucide-react';

export default function DisclaimerPage() {
  return (
    <div className="min-h-screen bg-[#160022] text-white">
      <Header isAuthenticated={false} />

      <main className="py-20 md:py-32">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-6xl font-black text-white tracking-tight mb-6">
              سلب <span className="text-red-300">مسئولیت</span>
            </h1>
            <p className="text-xl text-slate-300 font-medium">
              لطفاً این توضیح درباره ریسک مالی را با دقت بخوانید.
            </p>
          </div>

          <Card className="border-none shadow-xl bg-white overflow-hidden rounded-3xl">
            <CardContent className="p-8 md:p-12 space-y-10">
              <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded-r-2xl mb-10">
                <div className="flex items-center gap-3 mb-2">
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                  <h2 className="text-xl font-bold text-red-900">هشدار ریسک بالا</h2>
                </div>
                <p className="text-red-800 font-medium">
                  معامله در بازارهای مالی با ریسک بالا همراه است و برای همه سرمایه‌گذاران مناسب نیست. ممکن است بخشی یا همه سرمایه اولیه خود را از دست بدهید.
                </p>
              </div>

              <section>
                <div className="flex items-center gap-3 mb-4">
                  <Info className="w-6 h-6 text-primary-600" />
                  <h2 className="text-2xl font-bold text-secondary-900">توصیه مالی نیست</h2>
                </div>
                <p className="text-secondary-600 leading-relaxed text-lg">
                  محتوا، تحلیل‌ها و سیگنال‌های سرمایه گذاری موسوی فقط برای آموزش و اطلاع‌رسانی ارائه می‌شوند. تصمیم‌های سرمایه‌گذاری شما کاملاً بر عهده خودتان است.
                </p>
              </section>

              <section>
                <div className="flex items-center gap-3 mb-4">
                  <ShieldAlert className="w-6 h-6 text-primary-600" />
                  <h2 className="text-2xl font-bold text-secondary-900">عملکرد گذشته</h2>
                </div>
                <p className="text-secondary-600 leading-relaxed text-lg">
                  عملکرد گذشته تضمینی برای نتیجه آینده نیست. هیچ آمار یا نمونه عملکردی در سایت، سود یا نتیجه مشابه را برای شما تضمین نمی‌کند.
                </p>
              </section>

              <section className="bg-secondary-50 p-8 rounded-2xl border border-secondary-100">
                <h2 className="text-xl font-bold text-secondary-900 mb-4">دقت اطلاعات</h2>
                <p className="text-secondary-600 leading-relaxed italic">
                  ما برای دقت اطلاعات تلاش می‌کنیم، اما شرایط بازار می‌تواند سریع تغییر کند. سرمایه گذاری موسوی کامل بودن یا دقت قطعی همه اطلاعات را تضمین نمی‌کند و مسئول زیان ناشی از اتکا به محتوا نیست.
                </p>
              </section>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
