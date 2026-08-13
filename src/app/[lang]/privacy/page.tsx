'use client';

import { Header, Button } from '@/components';
import { useLocale } from '@/components/LocaleProvider';
import Link from 'next/link';

export default function PrivacyPage() {
  const { locale } = useLocale();
  const isEnglish = locale === 'en';

  return (
    <div className="min-h-screen bg-[#160022] text-white">
      <Header isAuthenticated={false} />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Link href={`/${locale}`} className="text-primary-200 hover:text-white mb-8 inline-block">
          {isEnglish ? 'Back to home' : 'بازگشت به خانه'}
        </Link>

        <h1 className="text-4xl font-bold text-white mb-8">{isEnglish ? 'Privacy Policy' : 'حریم خصوصی'}</h1>

        <div className="rounded-lg bg-white p-8 text-secondary-700 shadow-xl prose prose-lg max-w-none space-y-6">
          <section>
            <h2 className="text-2xl font-bold text-secondary-900 mt-8 mb-4">{isEnglish ? '1. Introduction' : '۱. مقدمه'}</h2>
            <p>
              {isEnglish
                ? 'Mousavi Investment provides a website and services related to portfolio management. This page explains what data we collect and how we protect it when you use our services.'
                : 'سرمایه گذاری موسوی وب‌سایت و خدمات مرتبط با مدیریت پورتفو را ارائه می‌کند. این صفحه توضیح می‌دهد هنگام استفاده از خدمات، چه داده‌هایی جمع‌آوری می‌شود و چگونه از آن‌ها محافظت می‌کنیم.'}
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-secondary-900 mt-8 mb-4">{isEnglish ? '2. Data Collection and Use' : '۲. گردآوری و استفاده از اطلاعات'}</h2>
            <p>{isEnglish ? 'To provide and improve services, we may collect:' : 'برای ارائه و بهبود خدمات، این اطلاعات ممکن است ثبت شود:'}</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>{isEnglish ? 'Identity information such as name, email, and phone number' : 'اطلاعات هویتی مانند نام، ایمیل و شماره تماس'}</li>
              <li>{isEnglish ? 'Usage information such as visited pages and visit duration' : 'اطلاعات استفاده مانند صفحات مشاهده‌شده و زمان بازدید'}</li>
              <li>{isEnglish ? 'Investment information such as portfolio assets and watched symbols' : 'اطلاعات سرمایه‌گذاری مانند دارایی‌های پورتفو و نمادهای تحت نظر'}</li>
              <li>{isEnglish ? 'Technical device identifiers and analytics data' : 'شناسه‌های فنی دستگاه و داده‌های تحلیلی'}</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-secondary-900 mt-8 mb-4">{isEnglish ? '3. How We Use Data' : '۳. کاربرد داده‌ها'}</h2>
            <p>{isEnglish ? 'Mousavi Investment uses collected data to:' : 'سرمایه گذاری موسوی از داده‌های ثبت‌شده برای این موارد استفاده می‌کند:'}</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>{isEnglish ? 'Provide, maintain, and improve services' : 'ارائه، نگهداری و بهبود خدمات'}</li>
              <li>{isEnglish ? 'Notify users about important changes' : 'اطلاع‌رسانی درباره تغییرات مهم'}</li>
              <li>{isEnglish ? 'Support users' : 'پشتیبانی از کاربران'}</li>
              <li>{isEnglish ? 'Analyze platform performance and improve user experience' : 'تحلیل عملکرد پلتفرم و بهبود تجربه کاربری'}</li>
              <li>{isEnglish ? 'Send informational messages with your consent' : 'ارسال پیام‌های اطلاع‌رسانی با رضایت شما'}</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-secondary-900 mt-8 mb-4">{isEnglish ? '4. Data Security' : '۴. امنیت داده‌ها'}</h2>
            <p>
              {isEnglish
                ? 'Your data security is important to us, but no electronic transfer or storage method is completely risk-free. We apply reasonable safeguards to protect your data.'
                : 'امنیت اطلاعات شما برای ما مهم است، اما هیچ روش انتقال یا نگهداری الکترونیکی کاملاً بدون ریسک نیست. ما از روش‌های معقول برای محافظت از داده‌ها استفاده می‌کنیم.'}
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-secondary-900 mt-8 mb-4">{isEnglish ? '5. Contact Us' : '۵. تماس با ما'}</h2>
            <p>
              {isEnglish ? 'If you have any privacy-related questions, contact us at:' : 'اگر درباره حریم خصوصی پرسشی دارید، از این نشانی با ما تماس بگیرید:'}{' '}
              <a href="mailto:privacy@portfolioadvisor.com" className="text-primary-600 hover:text-primary-700">
                privacy@portfolioadvisor.com
              </a>
            </p>
          </section>
        </div>

        <div className="mt-12">
          <Link href={`/${locale}`}>
            <Button variant="outline">{isEnglish ? 'Back to home' : 'بازگشت به خانه'}</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
