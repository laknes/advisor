'use client';

import { Header, Card, CardHeader, CardContent, Button, Badge } from '@/components';
import { useLocale } from '@/components/LocaleProvider';
import { getStoredUser } from '@/lib/clientAuth';
import Link from 'next/link';

interface SubscriptionRecord {
  id: string;
  userName: string;
  plan: string;
  startDate: string;
  endDate: string;
  amount: number;
  status: 'Active' | 'Expired' | 'Cancelled';
}

export default function AdminSubscriptionsPage() {
  const { locale } = useLocale();
  const currentUser = getStoredUser();
  const subscriptions: SubscriptionRecord[] = [
    {
      id: '1',
      userName: 'Alice Johnson',
      plan: 'Daily Analysis',
      startDate: '2026-05-15',
      endDate: '2026-06-15',
      amount: 49,
      status: 'Active',
    },
    {
      id: '2',
      userName: 'Bob Smith',
      plan: 'All Markets VIP',
      startDate: '2026-04-20',
      endDate: '2026-07-20',
      amount: 599,
      status: 'Active',
    },
    {
      id: '3',
      userName: 'Carol White',
      plan: 'Weekly Analysis',
      startDate: '2026-04-01',
      endDate: '2026-05-01',
      amount: 99,
      status: 'Expired',
    },
    {
      id: '4',
      userName: 'David Wilson',
      plan: 'Market Full Access',
      startDate: '2026-03-15',
      endDate: '2026-04-15',
      amount: 299,
      status: 'Cancelled',
    },
  ];

  const stats = {
    totalSubscriptions: subscriptions.length,
    activeSubscriptions: subscriptions.filter((s) => s.status === 'Active').length,
    totalRevenue: subscriptions.reduce((sum, s) => sum + s.amount, 0),
    avgValue: Math.round(subscriptions.reduce((sum, s) => sum + s.amount, 0) / subscriptions.length),
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
                  {subscriptions.map((sub) => (
                    <tr key={sub.id} className="border-b border-secondary-100 hover:bg-secondary-50">
                      <td className="py-4 px-4 font-semibold text-secondary-900">{sub.userName}</td>
                      <td className="py-4 px-4 text-secondary-600">{sub.plan}</td>
                      <td className="py-4 px-4 text-secondary-600">{sub.startDate}</td>
                      <td className="py-4 px-4 text-secondary-600">{sub.endDate}</td>
                      <td className="py-4 px-4 font-semibold">${sub.amount}</td>
                      <td className="py-4 px-4">
                        <Badge variant={getStatusColor(sub.status)}>{sub.status}</Badge>
                      </td>
                      <td className="py-4 px-4">
                        <Button size="sm" variant="outline">View</Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
