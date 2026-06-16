'use client';

import { useEffect, useState } from 'react';
import { Header, Card, CardHeader, CardContent, Button, Badge } from '@/components';
import { useLocale } from '@/components/LocaleProvider';
import { getAuthHeaders, getStoredUser } from '@/lib/clientAuth';
import type { Subscription } from '@/lib/types';
import Link from 'next/link';

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
          setMessage(data.error || 'Unable to load your subscriptions.');
          return;
        }
        setSubscriptions(data.data?.subscriptions || []);
      } catch {
        setMessage('Unable to load your subscriptions.');
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
        setMessage(data.error || 'Unable to cancel the subscription.');
      } else {
        setSubscriptions((current) =>
          current.map((subscription) =>
            subscription.id === subscriptionId ? { ...subscription, isActive: false, autoRenew: false } : subscription,
          ),
        );
        setMessage('Subscription cancelled successfully.');
      }
    } catch {
      setMessage('Unable to process cancellation right now.');
    }

    setLoadingId(null);
  };

  const activeSubscriptions = subscriptions.filter((sub) => sub.isActive);

  return (
    <div className="min-h-screen bg-secondary-50">
      <Header isAuthenticated={true} userName={currentUser?.name || 'حساب کاربری'} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-secondary-900">My Subscriptions</h1>
            {message ? <p className="text-sm text-green-700 mt-2">{message}</p> : null}
          </div>
          <Link href={`/${locale}/pricing`}>
            <Button>Upgrade Plan</Button>
          </Link>
        </div>

        <Card>
          <CardHeader title="Active Subscriptions" />
          <CardContent className="space-y-4">
            {activeSubscriptions.length === 0 ? (
              <div className="p-8 text-center text-secondary-600">You have no active subscriptions right now.</div>
            ) : (
              activeSubscriptions.map((sub) => {
                const plan = sub.plan;
                return (
                  <div key={sub.id} className="border-b border-secondary-200 pb-4 last:border-b-0 last:pb-0">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-bold text-secondary-900 text-lg">{plan?.name ?? 'Subscription'}</h4>
                        <p className="text-secondary-600 text-sm">{plan?.description}</p>
                      </div>
                      <Badge variant="success">Active</Badge>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-secondary-600">Price</p>
                        <p className="font-bold text-secondary-900">${plan?.price ?? 0}/{plan?.billingPeriod || 'month'}</p>
                      </div>
                      <div>
                        <p className="text-secondary-600">Expires</p>
                        <p className="font-bold text-secondary-900">{new Date(sub.endDate).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <p className="text-secondary-600">Auto Renew</p>
                        <p className="font-bold text-secondary-900">{sub.autoRenew ? 'Enabled' : 'Disabled'}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" disabled>
                          Manage
                        </Button>
                        <Button
                          size="sm"
                          variant="danger"
                          isLoading={loadingId === sub.id}
                          onClick={() => handleCancel(sub.id)}
                        >
                          Cancel
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
            <Button variant="outline">Back to Dashboard</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
