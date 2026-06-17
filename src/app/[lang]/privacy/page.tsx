'use client';

import { Header, Button } from '@/components';
import { useLocale } from '@/components/LocaleProvider';
import Link from 'next/link';

export default function PrivacyPage() {
  const { locale } = useLocale();

  return (
    <div className="min-h-screen bg-[#160022] text-white">
      <Header isAuthenticated={false} />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Link href={`/${locale}`} className="text-primary-200 hover:text-white mb-8 inline-block">
          بازگشت به خانه
        </Link>

        <h1 className="text-4xl font-bold text-white mb-8">حریم خصوصی</h1>

        <div className="rounded-lg bg-white p-8 text-secondary-700 shadow-xl prose prose-lg max-w-none space-y-6">
          <section>
            <h2 className="text-2xl font-bold text-secondary-900 mt-8 mb-4">۱. مقدمه</h2>
            <p>
              مشاور پورتفو وب‌سایت و خدمات مرتبط با مدیریت پورتفو را ارائه می‌کند. این صفحه توضیح می‌دهد هنگام استفاده از خدمات، چه داده‌هایی جمع‌آوری می‌شود و چگونه از آن‌ها محافظت می‌کنیم.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-secondary-900 mt-8 mb-4">۲. گردآوری و استفاده از اطلاعات</h2>
            <p>برای ارائه و بهبود خدمات، این اطلاعات ممکن است ثبت شود:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>اطلاعات هویتی مانند نام، ایمیل و شماره تماس</li>
              <li>اطلاعات استفاده مانند صفحات مشاهده‌شده و زمان بازدید</li>
              <li>اطلاعات سرمایه‌گذاری مانند دارایی‌های پورتفو و نمادهای تحت نظر</li>
              <li>شناسه‌های فنی دستگاه و داده‌های تحلیلی</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-secondary-900 mt-8 mb-4">۳. کاربرد داده‌ها</h2>
            <p>مشاور پورتفو از داده‌های ثبت‌شده برای این موارد استفاده می‌کند:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>ارائه، نگهداری و بهبود خدمات</li>
              <li>اطلاع‌رسانی درباره تغییرات مهم</li>
              <li>پشتیبانی از کاربران</li>
              <li>تحلیل عملکرد پلتفرم و بهبود تجربه کاربری</li>
              <li>ارسال پیام‌های اطلاع‌رسانی با رضایت شما</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-secondary-900 mt-8 mb-4">۴. امنیت داده‌ها</h2>
            <p>
              امنیت اطلاعات شما برای ما مهم است، اما هیچ روش انتقال یا نگهداری الکترونیکی کاملاً بدون ریسک نیست. ما از روش‌های معقول برای محافظت از داده‌ها استفاده می‌کنیم.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-secondary-900 mt-8 mb-4">۵. تماس با ما</h2>
            <p>
              اگر درباره حریم خصوصی پرسشی دارید، از این نشانی با ما تماس بگیرید:{' '}
              <a href="mailto:privacy@portfolioadvisor.com" className="text-primary-600 hover:text-primary-700">
                privacy@portfolioadvisor.com
              </a>
            </p>
          </section>
        </div>

        <div className="mt-12">
          <Link href={`/${locale}`}>
            <Button variant="outline">بازگشت به خانه</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
