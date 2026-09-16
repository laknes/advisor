'use client';

import { useEffect, useMemo, useState } from 'react';
import { Header, Card, CardHeader, CardContent, Button, Badge } from '@/components';
import { useLocale } from '@/components/LocaleProvider';
import { getStoredUser } from '@/lib/clientAuth';
import { apiGet } from '@/lib/apiClient';
import { formatMoney } from '@/lib/format';
import Link from 'next/link';

interface SubscriptionRecord {
  id: string;
  user?: { id: string; name?: string | null; email: string } | null;
  plan?: { name: string; price: number; currency?: string | null } | null;
  startDate: string;
  endDate: string;
  isActive: boolean;
}

export default function AdminSubscriptionsPage() {
  const { locale } = useLocale();
  const isFa = locale === 'fa';
  const currentUser = getStoredUser();
  const [subscriptions, setSubscriptions] = useState<SubscriptionRecord[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    apiGet<{ subscriptions: SubscriptionRecord[] }>('/api/admin/subscriptions', true)
      .then((data) => setSubscriptions(data.subscriptions))
      .catch((loadError) => setError(loadError instanceof Error ? loadError.message : (isFa ? 'بارگذاری اشتراک‌ها انجام نشد.' : 'Unable to load subscriptions.')));
  }, [isFa]);

  const stats = useMemo(() => ({
    totalSubscriptions: subscriptions.length,
    activeSubscriptions: subscriptions.filter((s) => s.isActive && new Date(s.endDate) > new Date()).length,
    totalRevenue: subscriptions.reduce((sum, s) => sum + (s.plan?.price || 0), 0),
    avgValue: subscriptions.length ? Math.round(subscriptions.reduce((sum, s) => sum + (s.plan?.price || 0), 0) / subscriptions.length) : 0,
  }), [subscriptions]);
  const primaryCurrency = subscriptions.find((subscription) => subscription.plan?.currency)?.plan?.currency || 'IRR';

  const getStatus = (sub: SubscriptionRecord) => {
    if (!sub.isActive) return 'Cancelled';
    if (new Date(sub.endDate) < new Date()) return 'Expired';
    return 'Active';
  };

  const getStatusColor = (status: string): 'success' | 'warning' | 'danger' => {
    if (status === 'Active') return 'success';
    if (status === 'Expired') return 'warning';
    return 'danger';
  };
  const statusLabel = (status: string) => isFa ? ({ Active: 'فعال', Expired: 'منقضی‌شده', Cancelled: 'لغوشده' }[status] || status) : status;

  return (
    <div className="admin-page min-h-screen bg-secondary-50">
      <Header isAuthenticated={true} userName={currentUser?.name || 'مدیر'} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-bold text-secondary-900">{isFa ? 'مدیریت اشتراک‌ها' : 'Subscription Management'}</h1>
          <Link href={`/${locale}/admin`}>
            <Button variant="outline">{isFa ? 'بازگشت' : '← Back'}</Button>
          </Link>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <div className="space-y-2">
              <p className="text-sm text-secondary-600">{isFa ? 'کل اشتراک‌ها' : 'Total Subscriptions'}</p>
              <p className="text-3xl font-bold text-secondary-900">{stats.totalSubscriptions}</p>
            </div>
          </Card>
          <Card>
            <div className="space-y-2">
              <p className="text-sm text-secondary-600">{isFa ? 'اشتراک‌های فعال' : 'Active Subscriptions'}</p>
              <p className="text-3xl font-bold text-success">{stats.activeSubscriptions}</p>
            </div>
          </Card>
          <Card>
            <div className="space-y-2">
              <p className="text-sm text-secondary-600">{isFa ? 'کل درآمد' : 'Total Revenue'}</p>
              <p className="text-3xl font-bold text-secondary-900">{formatMoney(stats.totalRevenue, primaryCurrency, locale)}</p>
            </div>
          </Card>
          <Card>
            <div className="space-y-2">
              <p className="text-sm text-secondary-600">{isFa ? 'میانگین ارزش' : 'Average Value'}</p>
              <p className="text-3xl font-bold text-secondary-900">{formatMoney(stats.avgValue, primaryCurrency, locale)}</p>
            </div>
          </Card>
        </div>

        {/* Subscriptions Table */}
        <Card>
          <CardHeader title={isFa ? 'همه اشتراک‌ها' : 'All Subscriptions'} />
          <CardContent>
            {error && <p className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-red-800">{error}</p>}
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b-2 border-secondary-200">
                  <tr>
                    <th className="text-right py-3 px-4 font-semibold text-secondary-700">{isFa ? 'کاربر' : 'User'}</th>
                    <th className="text-right py-3 px-4 font-semibold text-secondary-700">{isFa ? 'پلن' : 'Plan'}</th>
                    <th className="text-right py-3 px-4 font-semibold text-secondary-700">{isFa ? 'تاریخ شروع' : 'Start Date'}</th>
                    <th className="text-right py-3 px-4 font-semibold text-secondary-700">{isFa ? 'تاریخ پایان' : 'End Date'}</th>
                    <th className="text-right py-3 px-4 font-semibold text-secondary-700">{isFa ? 'مبلغ' : 'Amount'}</th>
                    <th className="text-right py-3 px-4 font-semibold text-secondary-700">{isFa ? 'وضعیت' : 'Status'}</th>
                    <th className="text-right py-3 px-4 font-semibold text-secondary-700">{isFa ? 'عملیات' : 'Actions'}</th>
                  </tr>
                </thead>
                <tbody>
                  {subscriptions.map((sub) => {
                    const status = getStatus(sub);
                    return (
                    <tr key={sub.id} className="border-b border-secondary-100 hover:bg-secondary-50">
                      <td className="py-4 px-4 font-semibold text-secondary-900">{sub.user?.name || sub.user?.email || (isFa ? 'کاربر ناشناس' : 'Unknown user')}</td>
                      <td className="py-4 px-4 text-secondary-600">{sub.plan?.name || (isFa ? 'پلن نامشخص' : 'Unknown plan')}</td>
                      <td className="py-4 px-4 text-secondary-600">{new Date(sub.startDate).toLocaleDateString(isFa ? 'fa-IR' : 'en-US')}</td>
                      <td className="py-4 px-4 text-secondary-600">{new Date(sub.endDate).toLocaleDateString(isFa ? 'fa-IR' : 'en-US')}</td>
                      <td className="py-4 px-4 font-semibold">{formatMoney(sub.plan?.price || 0, sub.plan?.currency || primaryCurrency, locale)}</td>
                      <td className="py-4 px-4">
                        <Badge variant={getStatusColor(status)}>{statusLabel(status)}</Badge>
                      </td>
                      <td className="py-4 px-4">
                        {sub.user?.id ? (
                          <Link href={`/${locale}/admin/users/${sub.user.id}`}>
                            <Button size="sm" variant="outline">{isFa ? 'مشاهده' : 'View'}</Button>
                          </Link>
                        ) : (
                          <span className="text-secondary-400">—</span>
                        )}
                      </td>
                    </tr>
                    );
                  })}
                  {!subscriptions.length && (
                    <tr>
                      <td colSpan={7} className="py-6 px-4 text-center text-secondary-600">{isFa ? 'اشتراکی پیدا نشد.' : 'No subscriptions found.'}</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

