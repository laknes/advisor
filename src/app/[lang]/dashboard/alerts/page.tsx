'use client';

import { Header, Card, CardHeader, CardContent, Button, Badge } from '@/components';
import { useLocale } from '@/components/LocaleProvider';
import { getAuthHeaders, getStoredUser } from '@/lib/clientAuth';
import { formatDate, formatTime } from '@/lib/utils';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function AlertsPage() {
  const { locale } = useLocale();
  const currentUser = getStoredUser();
  const [alerts, setAlerts] = useState<Array<{
    id: string;
    symbol: string;
    market: string;
    condition: string;
    price: number;
    isTriggered: boolean;
    triggeredAt?: string | null;
    isActive: boolean;
    createdAt: string;
  }>>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const loadAlerts = async () => {
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/alerts', { headers: getAuthHeaders() });
      const result = await response.json();

      if (!response.ok) {
        setError(result.error || 'هشدارها بارگذاری نشدند.');
        return;
      }

      setAlerts(result.data?.alerts || []);
    } catch {
      setError('هشدارها بارگذاری نشدند.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAlerts();
  }, []);

  const handleDismiss = async (id: string) => {
    await fetch(`/api/alerts/${id}`, { method: 'DELETE', headers: getAuthHeaders() });
    setAlerts((prev) => prev.filter((alert) => alert.id !== id));
  };

  const handleDeactivate = async (id: string) => {
    await fetch(`/api/alerts/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: JSON.stringify({ isActive: false }),
    });
    setAlerts((prev) => prev.map((alert) => (alert.id === id ? { ...alert, isActive: false } : alert)));
  };

  return (
    <div className="min-h-screen bg-secondary-50">
      <Header isAuthenticated={true} userName={currentUser?.name || 'حساب کاربری'} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-bold text-secondary-900">Price & Market Alerts</h1>
          <Link href={`/${locale}/dashboard`}>
            <Button variant="outline">بازگشت به داشبورد</Button>
          </Link>
        </div>

        {/* Alert Controls */}
        <Card className="mb-8">
          <CardHeader title="Alert Preferences" />
          <CardContent className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">هشدارهای قیمت</label>
              <input type="checkbox" defaultChecked className="w-4 h-4" />
            </div>
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">Volatility Alerts</label>
              <input type="checkbox" defaultChecked className="w-4 h-4" />
            </div>
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">Analysis Published</label>
              <input type="checkbox" defaultChecked className="w-4 h-4" />
            </div>
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">اخبار بازار</label>
              <input type="checkbox" className="w-4 h-4" />
            </div>
          </CardContent>
        </Card>

        {/* Active Alerts */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-secondary-900 mb-4">Active Alerts</h2>
          <div className="space-y-4">
            {isLoading ? (
              <Card><CardContent><p className="text-secondary-700">در حال بارگذاری هشدارها...</p></CardContent></Card>
            ) : error ? (
              <Card className="border border-red-200 bg-red-50"><CardContent><p className="text-red-800">{error}</p></CardContent></Card>
            ) : alerts.filter((a) => a.isActive).length === 0 ? (
              <Card><CardContent><p className="text-secondary-700">هشدار فعالی وجود ندارد.</p></CardContent></Card>
            ) : alerts
              .filter((a) => a.isActive)
              .map((alert) => (
                <Card key={alert.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant={alert.isTriggered ? 'danger' : 'warning'}>
                            {alert.isTriggered ? '🔔 Triggered' : '⏳ Pending'}
                          </Badge>
                          <span className="text-xs text-secondary-600">
                            {alert.isTriggered && alert.triggeredAt ? `Triggered ${formatTime(alert.triggeredAt)}` : 'Waiting...'}
                          </span>
                        </div>
                        <h3 className="text-lg font-semibold text-secondary-900 mb-1">{alert.symbol} {alert.condition === 'above' ? 'above' : 'below'} {alert.price}</h3>
                        <div className="flex flex-wrap gap-4 text-sm text-secondary-600">
                          <span>
                            <strong>Symbol:</strong> {alert.symbol}
                          </span>
                          <span>
                            <strong>Market:</strong> {alert.market}
                          </span>
                          <span>
                            <strong>Target Price:</strong> ${alert.price}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => handleDeactivate(alert.id)}>
                          Deactivate
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => handleDismiss(alert.id)}>
                          Dismiss
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        </div>

        {/* Recent Alerts */}
        <div>
          <h2 className="text-2xl font-bold text-secondary-900 mb-4">Recent Alerts</h2>
          <div className="space-y-4">
            {alerts
              .filter((a) => !a.isActive)
              .map((alert) => (
                <Card key={alert.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="neutral">✓ Read</Badge>
                          <span className="text-xs text-secondary-600">{formatDate(alert.triggeredAt || alert.createdAt)}</span>
                        </div>
                        <h3 className="text-lg font-semibold text-secondary-900 mb-1">{alert.symbol} {alert.condition} {alert.price}</h3>
                        <div className="flex flex-wrap gap-4 text-sm text-secondary-600">
                          <span>
                            <strong>Symbol:</strong> {alert.symbol}
                          </span>
                          <span>
                            <strong>Market:</strong> {alert.market}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}
