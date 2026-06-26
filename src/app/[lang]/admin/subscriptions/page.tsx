'use client';

import { useEffect, useMemo, useState } from 'react';
import { Header, Card, CardHeader, CardContent, Button, Badge } from '@/components';
import { useLocale } from '@/components/LocaleProvider';
import { getStoredUser } from '@/lib/clientAuth';
import { apiGet } from '@/lib/apiClient';
import Link from 'next/link';

interface SubscriptionRecord {
  id: string;
  user?: { id: string; name?: string | null; email: string } | null;
  plan?: { name: string; price: number } | null;
  startDate: string;
  endDate: string;
  isActive: boolean;
}

export default function AdminSubscriptionsPage() {
  const { locale } = useLocale();
  const currentUser = getStoredUser();
  const [subscriptions, setSubscriptions] = useState<SubscriptionRecord[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    apiGet<{ subscriptions: SubscriptionRecord[] }>('/api/admin/subscriptions', true)
      .then((data) => setSubscriptions(data.subscriptions))
      .catch((loadError) => setError(loadError instanceof Error ? loadError.message : 'Unable to load subscriptions.'));
  }, []);

  const stats = useMemo(() => ({
    totalSubscriptions: subscriptions.length,
    activeSubscriptions: subscriptions.filter((s) => s.isActive && new Date(s.endDate) > new Date()).length,
    totalRevenue: subscriptions.reduce((sum, s) => sum + (s.plan?.price || 0), 0),
    avgValue: subscriptions.length ? Math.round(subscriptions.reduce((sum, s) => sum + (s.plan?.price || 0), 0) / subscriptions.length) : 0,
  }), [subscriptions]);

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

  return (
    <div className="min-h-screen bg-secondary-50">
      <Header isAuthenticated={true} userName={currentUser?.name || 'مدیر'} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-bold text-secondary-900">Subscription Management</h1>
          <Link href={`/${locale}/admin`}>
            <Button variant="outline">← Back</Button>
          </Link>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <div className="space-y-2">
              <p className="text-sm text-secondary-600">Total Subscriptions</p>
              <p className="text-3xl font-bold text-secondary-900">{stats.totalSubscriptions}</p>
            </div>
          </Card>
          <Card>
            <div className="space-y-2">
              <p className="text-sm text-secondary-600">Active Subscriptions</p>
              <p className="text-3xl font-bold text-success">{stats.activeSubscriptions}</p>
            </div>
          </Card>
          <Card>
            <div className="space-y-2">
              <p className="text-sm text-secondary-600">Total Revenue</p>
              <p className="text-3xl font-bold text-secondary-900">${stats.totalRevenue}</p>
            </div>
          </Card>
          <Card>
            <div className="space-y-2">
              <p className="text-sm text-secondary-600">Average Value</p>
              <p className="text-3xl font-bold text-secondary-900">${stats.avgValue}</p>
            </div>
          </Card>
        </div>

        {/* Subscriptions Table */}
        <Card>
          <CardHeader title="All Subscriptions" />
          <CardContent>
            {error && <p className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-red-800">{error}</p>}
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b-2 border-secondary-200">
                  <tr>
                    <th className="text-left py-3 px-4 font-semibold text-secondary-700">User</th>
                    <th className="text-left py-3 px-4 font-semibold text-secondary-700">Plan</th>
                    <th className="text-left py-3 px-4 font-semibold text-secondary-700">Start Date</th>
                    <th className="text-left py-3 px-4 font-semibold text-secondary-700">End Date</th>
                    <th className="text-left py-3 px-4 font-semibold text-secondary-700">Amount</th>
                    <th className="text-left py-3 px-4 font-semibold text-secondary-700">Status</th>
                    <th className="text-left py-3 px-4 font-semibold text-secondary-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {subscriptions.map((sub) => {
                    const status = getStatus(sub);
                    return (
                    <tr key={sub.id} className="border-b border-secondary-100 hover:bg-secondary-50">
                      <td className="py-4 px-4 font-semibold text-secondary-900">{sub.user?.name || sub.user?.email || 'Unknown user'}</td>
                      <td className="py-4 px-4 text-secondary-600">{sub.plan?.name || 'Unknown plan'}</td>
                      <td className="py-4 px-4 text-secondary-600">{new Date(sub.startDate).toLocaleDateString()}</td>
                      <td className="py-4 px-4 text-secondary-600">{new Date(sub.endDate).toLocaleDateString()}</td>
                      <td className="py-4 px-4 font-semibold">${sub.plan?.price || 0}</td>
                      <td className="py-4 px-4">
                        <Badge variant={getStatusColor(status)}>{status}</Badge>
                      </td>
                      <td className="py-4 px-4">
                        {sub.user?.id ? (
                          <Link href={`/${locale}/admin/users/${sub.user.id}`}>
                            <Button size="sm" variant="outline">View</Button>
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
                      <td colSpan={7} className="py-6 px-4 text-center text-secondary-600">No subscriptions found.</td>
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
