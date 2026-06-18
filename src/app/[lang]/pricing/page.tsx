'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Check, Crown, Sparkles, TrendingUp } from 'lucide-react';
import { Header, Card, Button, Badge } from '@/components';
import { useLocale } from '@/components/LocaleProvider';
import { getAuthHeaders } from '@/lib/clientAuth';
import { formatFaNumber } from '@/lib/format';
import type { Subscription, SubscriptionPlan } from '@/lib/types';

type BillingPeriod = 'monthly' | 'quarterly' | 'yearly';

const currencyLabel: Record<'en' | 'fa', Record<string, string>> = {
  en: {
    IRR: 'IRR',
    USD: 'USD',
  },
  fa: {
    IRR: 'ریال',
    USD: 'دلار',
  },
};

const billingLabels: Record<'en' | 'fa', Record<BillingPeriod, string>> = {
  en: {
    monthly: 'Monthly',
    quarterly: 'Quarterly',
    yearly: 'Yearly',
  },
  fa: {
    monthly: 'ماهانه',
    quarterly: 'فصلی',
    yearly: 'سالانه',
  },
};

const copy = {
  en: {
    loadError: 'Unable to load plans right now. Please try again later.',
    subscribeError: 'Unable to complete the subscription.',
    serviceError: 'Subscription service is currently unavailable. Please try again later.',
    success: 'Subscription activated successfully.',
    eyebrow: 'Portfolio Advisor plans',
    title: 'Simple, Transparent Pricing',
    subtitle: 'Choose the plan that matches your trading horizon, market coverage, and advisory needs.',
    shortTitle: 'Short-term Analysis',
    shortSubtitle: 'Daily, weekly, and monthly market insights for active decisions.',
    longTitle: 'Long-term Strategy',
    longSubtitle: 'Quarterly and annual advisory for portfolio planning.',
    premiumTitle: 'Premium Access',
    premiumSubtitle: 'Full-market access and dedicated advisory options.',
    empty: 'No active plan is available for this billing period.',
    popular: 'Popular',
    vip: 'VIP',
    subscribed: 'Subscribed',
    subscribe: 'Subscribe Now',
    periodPrefix: 'per',
    faqTitle: 'Frequently Asked Questions',
    ctaTitle: 'Start Your Premium Investment Experience',
    ctaText: 'Join investors who use Portfolio Advisor to read the market with more clarity.',
    ctaButton: 'Create Account',
    faqs: [
      {
        q: 'Can I cancel my subscription anytime?',
        a: 'Yes. You can cancel whenever you want, and your access remains active until the end of the paid period.',
      },
      {
        q: 'Can I change my plan later?',
        a: 'Yes. You can upgrade or switch your plan based on your market coverage and analysis needs.',
      },
      {
        q: 'Which plan should I choose?',
        a: 'Short-term plans fit active trading, while premium plans fit broader market coverage and advisory access.',
      },
    ],
  },
  fa: {
    loadError: 'در حال حاضر امکان بارگذاری پلن‌ها وجود ندارد. لطفاً کمی بعد دوباره تلاش کنید.',
    subscribeError: 'امکان تکمیل اشتراک وجود ندارد.',
    serviceError: 'سرویس اشتراک در حال حاضر در دسترس نیست. لطفاً کمی بعد دوباره تلاش کنید.',
    success: 'اشتراک شما با موفقیت فعال شد.',
    eyebrow: 'پلن‌های مشاور پورتفو',
    title: 'قیمت‌گذاری شفاف و قابل انتخاب',
    subtitle: 'پلنی را انتخاب کنید که با افق سرمایه‌گذاری، بازار هدف و سطح مشاوره مورد نیاز شما هماهنگ است.',
    shortTitle: 'تحلیل‌های کوتاه‌مدت',
    shortSubtitle: 'تحلیل روزانه، هفتگی و ماهانه برای تصمیم‌های سریع و دقیق‌تر.',
    longTitle: 'استراتژی‌های بلندمدت',
    longSubtitle: 'برنامه‌ریزی فصلی و سالانه برای مدیریت پورتفو و کنترل ریسک.',
    premiumTitle: 'دسترسی حرفه‌ای',
    premiumSubtitle: 'دسترسی کامل به بازارها، سیگنال‌ها و مشاوره اختصاصی.',
    empty: 'برای این بازه پرداخت، پلن فعالی وجود ندارد.',
    popular: 'محبوب',
    vip: 'ویژه',
    subscribed: 'فعال شده',
    subscribe: 'شروع اشتراک',
    periodPrefix: 'پرداخت',
    faqTitle: 'سوالات متداول',
    ctaTitle: 'تجربه سرمایه‌گذاری حرفه‌ای را شروع کنید',
    ctaText: 'به سرمایه‌گذارانی بپیوندید که با مشاور پورتفو بازار را شفاف‌تر می‌بینند و تصمیم‌های آگاهانه‌تری می‌گیرند.',
    ctaButton: 'ایجاد حساب کاربری',
    faqs: [
      {
        q: 'آیا می‌توانم اشتراک را لغو کنم؟',
        a: 'بله. هر زمان بخواهید می‌توانید اشتراک را لغو کنید و دسترسی شما تا پایان دوره پرداخت‌شده فعال می‌ماند.',
      },
      {
        q: 'آیا امکان تغییر پلن وجود دارد؟',
        a: 'بله. می‌توانید بر اساس بازارهای مورد نیاز و سطح تحلیل، پلن خود را ارتقا دهید یا تغییر دهید.',
      },
      {
        q: 'کدام پلن برای من مناسب‌تر است؟',
        a: 'برای معاملات فعال، پلن‌های کوتاه‌مدت مناسب‌ترند. برای پوشش کامل بازار و مشاوره جدی‌تر، پلن‌های حرفه‌ای انتخاب بهتری هستند.',
      },
    ],
  },
} as const;

const planTranslations: Record<string, { name: string; description: string; features: string[] }> = {
  'daily-analysis': {
    name: 'تحلیل روزانه',
    description: 'تحلیل روزانه بازار برای معامله‌گران کوتاه‌مدت',
    features: ['تحلیل روزانه', 'دسترسی به یک بازار', 'هشدارهای پایه', 'اعلان ایمیلی'],
  },
  'weekly-analysis': {
    name: 'تحلیل هفتگی',
    description: 'تحلیل عمیق هفتگی برای معامله‌گران نوسانی',
    features: ['تحلیل هفتگی', 'همه تایم‌فریم‌های کوتاه‌مدت', 'هشدارهای پیشرفته', 'پشتیبانی اولویت‌دار'],
  },
  'monthly-analysis': {
    name: 'تحلیل ماهانه',
    description: 'تحلیل استراتژیک ماهانه برای سرمایه‌گذاران فعال',
    features: ['تحلیل ماهانه', 'گزارش‌های دقیق', 'راهنمایی پورتفو', 'مشاور اختصاصی'],
  },
  '3month-strategic': {
    name: 'استراتژی سه‌ماهه',
    description: 'تحلیل استراتژیک بلندمدت به‌صورت فصلی',
    features: ['گزارش فصلی', 'تحلیل روند', 'ارزیابی ریسک', 'راهنمایی بازچینی پورتفو'],
  },
  '1year-portfolio': {
    name: 'پورتفوی یک‌ساله',
    description: 'مدیریت جامع پورتفو در افق یک‌ساله',
    features: ['استراتژی سالانه', 'بازچینی فصلی', 'ارتباط مستقیم با مشاور', 'دسترسی کامل بازار'],
  },
  '3year-vip': {
    name: 'ثروت VIP سه‌ساله',
    description: 'استراتژی مدیریت ثروت در افق بلندمدت',
    features: ['برنامه استراتژیک سه‌ساله', 'بازبینی ماهانه پورتفو', 'تحلیل اولویت‌دار VIP', 'دسترسی کامل بازار'],
  },
  'market-full': {
    name: 'دسترسی کامل یک بازار',
    description: 'دسترسی کامل به تحلیل‌ها و سیگنال‌های یک بازار مشخص',
    features: ['همه تایم‌فریم‌های یک بازار', 'سیگنال‌های اختصاصی', 'هشدار لحظه‌ای', 'داده تاریخی'],
  },
  'all-markets': {
    name: 'دسترسی همه بازارها',
    description: 'دسترسی حرفه‌ای به همه بازارهای فعال پلتفرم',
    features: ['دسترسی کامل همه بازارها', 'همه انواع تحلیل', 'هشدار چنددارایی', 'پشتیبانی اولویت‌دار'],
  },
  'vip-elite': {
    name: 'VIP الیت',
    description: 'تجربه کامل مشاوره اختصاصی سرمایه‌گذاری',
    features: ['مشاور شخصی تمام‌وقت', 'سیگنال‌های اختصاصی سرمایه‌گذاری', 'وبینارهای خصوصی بازار', 'گزارش‌های اختصاصی آلفا'],
  },
};

const featureTranslations: Record<string, string> = {
  'Daily Analysis': 'تحلیل روزانه',
  'Weekly Analysis': 'تحلیل هفتگی',
  'Monthly Analysis': 'تحلیل ماهانه',
  'Access to one market': 'دسترسی به یک بازار',
  'Basic alerts': 'هشدارهای پایه',
  'Email notifications': 'اعلان ایمیلی',
  'Advanced alerts': 'هشدارهای پیشرفته',
  'Priority support': 'پشتیبانی اولویت‌دار',
  'Portfolio guidance': 'راهنمایی پورتفو',
  'Dedicated advisor': 'مشاور اختصاصی',
  'All markets access': 'دسترسی به همه بازارها',
  'All analysis types': 'همه انواع تحلیل',
  'Multi-asset alerts': 'هشدار چنددارایی',
};

function formatPlanPrice(plan: SubscriptionPlan, locale: 'en' | 'fa') {
  const amount = locale === 'fa' ? formatFaNumber(plan.price) : new Intl.NumberFormat('en-US').format(plan.price);
  return `${amount} ${currencyLabel[locale][plan.currency] || plan.currency}`;
}

function getPlanDisplay(plan: SubscriptionPlan, locale: 'en' | 'fa') {
  if (locale === 'en') return plan;
  const translated = planTranslations[plan.slug];

  return {
    ...plan,
    name: translated?.name || plan.name,
    description: translated?.description || plan.description || '',
    features: translated?.features || plan.features.map((feature) => featureTranslations[feature] || feature),
  };
}

function PlanSection({
  title,
  subtitle,
  plans,
  locale,
  subscriptions,
  loadingPlanId,
  onSubscribe,
}: {
  title: string;
  subtitle: string;
  plans: SubscriptionPlan[];
  locale: 'en' | 'fa';
  subscriptions: Subscription[];
  loadingPlanId: string | null;
  onSubscribe: (planId: string) => void;
}) {
  if (!plans.length) return null;

  const t = copy[locale];

  return (
    <section className="py-10 md:py-12">
      <div className="mb-8 flex flex-col justify-between gap-3 md:flex-row md:items-end">
        <div>
          <h2 className="text-2xl font-black text-white md:text-3xl">{title}</h2>
          <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-300 md:text-base">{subtitle}</p>
        </div>
        <div className="hidden rounded-lg border border-white/10 bg-white/[0.06] px-4 py-2 text-sm font-bold text-primary-100 md:block">
          {locale === 'fa' ? `${formatFaNumber(plans.length)} پلن فعال` : `${plans.length} active plans`}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
        {plans.map((plan) => {
          const displayPlan = getPlanDisplay(plan, locale);
          const subscribed = subscriptions.some((subscription) => subscription.planId === plan.id && subscription.isActive);
          const highlighted = plan.type === 'all_markets' || plan.type === 'vip';

          return (
            <Card
              key={plan.id}
              className={`flex h-full flex-col border p-5 shadow-2xl transition ${
                highlighted
                  ? 'border-primary-200/70 bg-white text-secondary-950'
                  : 'border-white/10 bg-white/[0.07] text-white hover:bg-white/[0.1]'
              }`}
            >
              <div className="flex flex-1 flex-col">
                <div className="mb-5 flex items-start justify-between gap-4">
                  <div>
                    <p className={`mb-2 text-xs font-black ${highlighted ? 'text-primary-700' : 'text-primary-100'}`}>
                      {billingLabels[locale][plan.billingPeriod]}
                    </p>
                    <h3 className={`text-2xl font-black leading-9 ${highlighted ? 'text-secondary-950' : 'text-white'}`}>
                      {displayPlan.name}
                    </h3>
                  </div>
                  {plan.type === 'all_markets' && <Badge variant="success">{t.popular}</Badge>}
                  {plan.type === 'vip' && <Badge variant="info">{t.vip}</Badge>}
                </div>

                <p className={`min-h-[56px] text-sm leading-7 ${highlighted ? 'text-secondary-700' : 'text-slate-300'}`}>
                  {displayPlan.description}
                </p>

                <div className={`my-6 rounded-lg border p-4 ${highlighted ? 'border-primary-100 bg-primary-50' : 'border-white/10 bg-black/20'}`}>
                  <div className={`text-3xl font-black leading-tight md:text-4xl ${highlighted ? 'text-primary-800' : 'text-white'}`}>
                    {formatPlanPrice(plan, locale)}
                  </div>
                  <p className={`mt-2 text-sm font-bold ${highlighted ? 'text-secondary-600' : 'text-slate-400'}`}>
                    {t.periodPrefix} {billingLabels[locale][plan.billingPeriod]}
                  </p>
                </div>

                <ul className="mb-6 space-y-3">
                  {displayPlan.features.map((feature, index) => (
                    <li key={`${plan.id}-${index}`} className="flex items-start gap-3">
                      <span className={`mt-0.5 rounded-full p-1 ${highlighted ? 'bg-primary-100 text-primary-800' : 'bg-primary-300/15 text-primary-100'}`}>
                        <Check className="h-3.5 w-3.5" />
                      </span>
                      <span className={`text-sm leading-7 ${highlighted ? 'text-secondary-800' : 'text-slate-200'}`}>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <Button
                fullWidth
                variant={highlighted ? 'primary' : 'secondary'}
                disabled={subscribed || loadingPlanId === plan.id}
                isLoading={loadingPlanId === plan.id}
                onClick={() => onSubscribe(plan.id)}
                className={highlighted ? 'bg-secondary-950 text-white hover:bg-secondary-800' : ''}
              >
                {subscribed ? t.subscribed : t.subscribe}
              </Button>
            </Card>
          );
        })}
      </div>
    </section>
  );
}

export default function PricingPage() {
  const { locale } = useLocale();
  const t = copy[locale];
  const [billingPeriod, setBillingPeriod] = useState<BillingPeriod>('monthly');
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loadingPlanId, setLoadingPlanId] = useState<string | null>(null);
  const [message, setMessage] = useState<string>('');
  const [messageType, setMessageType] = useState<'success' | 'error'>('success');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [plansRes, subsRes] = await Promise.all([
          fetch('/api/subscription-plans'),
          fetch('/api/subscriptions', { headers: getAuthHeaders() }),
        ]);

        const [plansData, subsData] = await Promise.all([plansRes.json(), subsRes.json()]);
        setPlans(plansData.data?.plans || []);
        setSubscriptions(subsRes.ok ? subsData.data?.subscriptions || [] : []);
      } catch {
        setMessageType('error');
        setMessage(t.loadError);
      }
    };

    fetchData();
  }, [t.loadError]);

  const activePlans = plans.filter((plan) => plan.isActive !== false && plan.billingPeriod === billingPeriod);
  const shortTermPlans = activePlans.filter((plan) => plan.type === 'timeframe');
  const longTermPlans = activePlans.filter((plan) => plan.type === 'long_term');
  const premiumPlans = activePlans.filter((plan) => plan.type === 'market_full' || plan.type === 'all_markets' || plan.type === 'vip');
  const hasVisiblePlans = shortTermPlans.length || longTermPlans.length || premiumPlans.length;

  const handleSubscribe = async (planId: string) => {
    setLoadingPlanId(planId);
    setMessage('');

    try {
      const response = await fetch('/api/subscriptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify({ planId }),
      });
      const data = await response.json();

      if (!response.ok) {
        setMessageType('error');
        setMessage(locale === 'fa' ? t.subscribeError : data.error || t.subscribeError);
      } else {
        setSubscriptions((current) => [
          ...current.filter((subscription) => subscription.planId !== planId),
          data.data.subscription as Subscription,
        ]);
        setMessageType('success');
        setMessage(t.success);
      }
    } catch {
      setMessageType('error');
      setMessage(t.serviceError);
    }

    setLoadingPlanId(null);
  };

  return (
    <div className="min-h-screen bg-[#160022] text-white">
      <Header isAuthenticated={false} />

      <main>
        <section className="relative overflow-hidden border-b border-white/10 bg-[#160022]">
          <div className="absolute inset-x-0 top-0 h-72 bg-[radial-gradient(circle_at_top,#7c3aed55,transparent_60%)]" />
          <div className="relative mx-auto max-w-7xl px-4 py-14 sm:px-6 md:py-18 lg:px-8">
            <div className="mx-auto max-w-4xl text-center">
              <div className="mb-5 inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.06] px-4 py-2 text-sm font-black text-primary-100">
                <Sparkles className="h-4 w-4" />
                {t.eyebrow}
              </div>
              <h1 className="text-4xl font-black leading-tight md:text-6xl">{t.title}</h1>
              <p className="mx-auto mt-5 max-w-3xl text-base leading-8 text-slate-300 md:text-lg">{t.subtitle}</p>

              <div className="mt-8 inline-flex flex-wrap justify-center gap-2 rounded-lg border border-white/10 bg-black/20 p-2">
                {(['monthly', 'quarterly', 'yearly'] as BillingPeriod[]).map((period) => (
                  <button
                    key={period}
                    type="button"
                    onClick={() => setBillingPeriod(period)}
                    className={`min-w-24 rounded-lg px-5 py-3 text-sm font-black transition ${
                      billingPeriod === period ? 'bg-white text-primary-900 shadow-lg' : 'text-slate-300 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    {billingLabels[locale][period]}
                  </button>
                ))}
              </div>

              {message ? (
                <p className={`mx-auto mt-5 max-w-2xl rounded-lg px-4 py-3 text-sm font-bold ${messageType === 'success' ? 'bg-primary-100 text-primary-950' : 'bg-red-100 text-red-800'}`}>
                  {message}
                </p>
              ) : null}
            </div>
          </div>
        </section>

        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          {!hasVisiblePlans && (
            <Card className="border border-white/10 bg-white/[0.07] p-8 text-center">
              <Crown className="mx-auto mb-4 h-8 w-8 text-primary-100" />
              <p className="text-lg font-black text-white">{t.empty}</p>
            </Card>
          )}

          <PlanSection
            title={t.shortTitle}
            subtitle={t.shortSubtitle}
            plans={shortTermPlans}
            locale={locale}
            subscriptions={subscriptions}
            loadingPlanId={loadingPlanId}
            onSubscribe={handleSubscribe}
          />
          <PlanSection
            title={t.longTitle}
            subtitle={t.longSubtitle}
            plans={longTermPlans}
            locale={locale}
            subscriptions={subscriptions}
            loadingPlanId={loadingPlanId}
            onSubscribe={handleSubscribe}
          />
          <PlanSection
            title={t.premiumTitle}
            subtitle={t.premiumSubtitle}
            plans={premiumPlans}
            locale={locale}
            subscriptions={subscriptions}
            loadingPlanId={loadingPlanId}
            onSubscribe={handleSubscribe}
          />
        </div>

        <section className="border-y border-white/10 bg-white/[0.04] py-16">
          <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
            <div className="mb-10 flex items-center justify-center gap-3 text-center">
              <TrendingUp className="h-6 w-6 text-primary-100" />
              <h2 className="text-3xl font-black text-white">{t.faqTitle}</h2>
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {t.faqs.map((item) => (
                <Card key={item.q} className="border border-white/10 bg-white/[0.07] p-5">
                  <h3 className="text-lg font-black leading-8 text-white">{item.q}</h3>
                  <p className="mt-3 text-sm leading-7 text-slate-300">{item.a}</p>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-white py-16 text-secondary-950">
          <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
            <h2 className="text-3xl font-black leading-tight md:text-5xl">{t.ctaTitle}</h2>
            <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-secondary-700">{t.ctaText}</p>
            <Link href={`/${locale}/auth/signup`}>
              <Button size="lg" className="mt-8 bg-secondary-950 text-white hover:bg-secondary-800">
                {t.ctaButton}
              </Button>
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
