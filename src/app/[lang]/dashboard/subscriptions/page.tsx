'use client';

import { useEffect, useState } from 'react';
import { Header, Card, CardHeader, CardContent, Button, Badge } from '@/components';
import { useLocale } from '@/components/LocaleProvider';
import { getAuthHeaders, getStoredUser } from '@/lib/clientAuth';
import { formatFaDate, formatMoney } from '@/lib/format';
import type { Subscription } from '@/lib/types';
import Link from 'next/link';
import { CreditCard, ShieldCheck, Sparkles } from 'lucide-react';

const billingPeriodLabel: Record<string, string> = {
  monthly: 'ماهیانه',
  quarterly: 'سه‌ماهه',
  yearly: 'سالانه',
};

export default function SubscriptionsPage() {
  const { locale } = useLocale();
  const currentUser = getStoredUser();
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [message, setMessage] = useState<string>('');

  useEffect(() => {
    const fetchSubscriptions = async () => {
      try {
        const response = await fetch('/api/subscriptions', { headers: getAuthHeaders() });
        const data = await response.json();
        if (!response.ok) {
          setMessage('امکان دریافت اشتراک‌ها وجود ندارد.');
          return;
        }
        setSubscriptions(data.data?.subscriptions || []);
      } catch {
        setMessage('امکان دریافت اشتراک‌ها وجود ندارد.');
      }
    };

    fetchSubscriptions();
  }, []);

  const handleCancel = async (subscriptionId: string) => {
    setLoadingId(subscriptionId);
    setMessage('');

    try {
      const response = await fetch(`/api/subscriptions/${subscriptionId}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      const data = await response.json();

      if (!response.ok) {
        setMessage('امکان لغو اشتراک وجود ندارد.');
      } else {
        setSubscriptions((current) =>
          current.map((subscription) =>
            subscription.id === subscriptionId ? { ...subscription, isActive: false, autoRenew: false } : subscription,
          ),
        );
        setMessage('اشتراک با موفقیت لغو شد.');
      }
    } catch {
      setMessage('در حال حاضر امکان پردازش لغو اشتراک وجود ندارد.');
    }

    setLoadingId(null);
  };

  const activeSubscriptions = subscriptions.filter((sub) => sub.isActive && new Date(sub.endDate) > new Date());

  return (
    <div className="min-h-screen bg-[#160022] text-white">
      <Header isAuthenticated={true} userName={currentUser?.name || 'حساب کاربری'} />

      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <div>
            <div className="mb-4 inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.06] px-3 py-2 text-sm font-bold text-primary-100">
              <CreditCard className="h-4 w-4" />
              وضعیت دسترسی
            </div>
            <h1 className="text-4xl font-black leading-tight md:text-5xl">اشتراک‌های من</h1>
            <p className="mt-3 max-w-2xl text-slate-300">پلن‌های فعال، تاریخ پایان دسترسی و وضعیت تمدید خودکار را در یک نمای متمرکز دنبال کنید.</p>
            {message ? (
              <p className="mt-4 rounded-lg border border-primary-100/30 bg-primary-100/10 px-4 py-3 text-sm font-bold text-primary-100">
                {message}
              </p>
            ) : null}
          </div>
          <Link href={`/${locale}/pricing`}>
            <Button rightIcon={<Sparkles className="h-4 w-4" />}>ارتقا پلن</Button>
          </Link>
        </div>

        <Card className="p-6">
          <CardHeader
            title="اشتراک‌های فعال"
            subtitle={`${activeSubscriptions.length.toLocaleString('fa-IR')} پلن فعال`}
            icon={<ShieldCheck className="h-5 w-5" />}
          />
          <CardContent className="space-y-4">
            {activeSubscriptions.length === 0 ? (
              <div className="rounded-lg border border-white/10 bg-white/[0.05] p-8 text-center">
                <p className="text-lg font-black text-white">در حال حاضر اشتراک فعالی ندارید.</p>
                <p className="mt-2 text-sm leading-6 text-slate-300">برای دسترسی به تحلیل‌های ویژه و امکانات حرفه‌ای، یکی از پلن‌ها را فعال کنید.</p>
                <Link href={`/${locale}/pricing`}>
                  <Button className="mt-5">مشاهده پلن‌ها</Button>
                </Link>
              </div>
            ) : (
              activeSubscriptions.map((sub) => {
                const plan = sub.plan;
                return (
                  <div key={sub.id} className="rounded-lg border border-white/10 bg-white/[0.05] p-5 transition hover:bg-white/[0.08]">
                    <div className="mb-5 flex items-start justify-between gap-4">
                      <div>
                        <h4 className="text-xl font-black text-white">{plan?.name ?? 'اشتراک'}</h4>
                        <p className="mt-2 text-sm leading-6 text-slate-300">{plan?.description || 'پلن فعال سرمایه‌گذاری'}</p>
                      </div>
                      <Badge variant="success">فعال</Badge>
                    </div>
                    <div className="grid grid-cols-1 gap-4 text-sm md:grid-cols-4">
                      <div>
                        <p className="text-slate-400">هزینه</p>
                        <p className="mt-1 font-black text-white">
                          {formatMoney(plan?.price ?? 0, plan?.currency, locale)}/{billingPeriodLabel[plan?.billingPeriod || 'monthly'] || 'دوره'}
                        </p>
                      </div>
                      <div>
                        <p className="text-slate-400">تاریخ پایان</p>
                        <p className="mt-1 font-black text-white">{formatFaDate(sub.endDate)}</p>
                      </div>
                      <div>
                        <p className="text-slate-400">تمدید خودکار</p>
                        <p className="mt-1 font-black text-white">{sub.autoRenew ? 'فعال' : 'غیرفعال'}</p>
                      </div>
                      <div className="flex items-end gap-2">
                        <Button size="sm" variant="outline" disabled>
                          مدیریت
                        </Button>
                        <Button
                          size="sm"
                          variant="danger"
                          isLoading={loadingId === sub.id}
                          onClick={() => handleCancel(sub.id)}
                        >
                          لغو اشتراک
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>

        <div className="mt-8">
          <Link href={`/${locale}/dashboard`}>
            <Button variant="outline">بازگشت به داشبورد</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
