'use client';

import { Header, Card, CardHeader, CardContent, Button, Badge } from '@/components';
import { formatDate, formatTime } from '@/lib/utils';
import Link from 'next/link';

export default function AlertsPage() {
  const alerts = [
    {
      id: '1',
      type: 'price_target',
      symbol: 'TEPIX',
      market: 'Iran Stocks',
      message: 'Price reached your target of $1,850',
      targetPrice: 1850,
      currentPrice: 1850,
      triggered: true,
      triggeredAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
      status: 'active',
    },
    {
      id: '2',
      type: 'price_alert',
      symbol: 'EUR/USD',
      market: 'Forex',
      message: 'Price moved beyond 1.10 threshold',
      threshold: 1.1,
      currentPrice: 1.0945,
      triggered: false,
      createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
      status: 'active',
    },
    {
      id: '3',
      type: 'volatility_alert',
      symbol: 'GOLD',
      market: 'Gold',
      message: 'High volatility detected - unusual market movement',
      volatility: 2.5,
      currentPrice: 2454,
      triggered: true,
      triggeredAt: new Date(Date.now() - 12 * 60 * 60 * 1000),
      status: 'active',
    },
    {
      id: '4',
      type: 'analysis_published',
      symbol: 'USD/IRR',
      market: 'Currency',
      message: 'New analysis published: USD/IRR Currency Trends',
      analysis: 'USD/IRR Currency Trends',
      triggered: true,
      triggeredAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      status: 'read',
    },
  ];

  const handleDismiss = (id: string) => {
    console.log(`Dismissed alert: ${id}`);
  };

  const handleMarkAsRead = (id: string) => {
    console.log(`Marked as read: ${id}`);
  };

  return (
    <div className="min-h-screen bg-secondary-50">
      <Header isAuthenticated={true} userName="John Doe" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-bold text-secondary-900">Price & Market Alerts</h1>
          <Link href="/dashboard">
            <Button variant="outline">Back to Dashboard</Button>
          </Link>
        </div>

        {/* Alert Controls */}
        <Card className="mb-8">
          <CardHeader title="Alert Preferences" />
          <CardContent className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">Price Alerts</label>
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
              <label className="block text-sm font-medium text-secondary-700 mb-2">Market News</label>
              <input type="checkbox" className="w-4 h-4" />
            </div>
          </CardContent>
        </Card>

        {/* Active Alerts */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-secondary-900 mb-4">Active Alerts</h2>
          <div className="space-y-4">
            {alerts
              .filter((a) => a.status === 'active')
              .map((alert) => (
                <Card key={alert.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant={alert.triggered ? 'danger' : 'warning'}>
                            {alert.triggered ? '🔔 Triggered' : '⏳ Pending'}
                          </Badge>
                          <span className="text-xs text-secondary-600">
                            {alert.triggered ? `Triggered ${formatTime(alert.triggeredAt!)}` : 'Waiting...'}
                          </span>
                        </div>
                        <h3 className="text-lg font-semibold text-secondary-900 mb-1">{alert.message}</h3>
                        <div className="flex flex-wrap gap-4 text-sm text-secondary-600">
                          <span>
                            <strong>Symbol:</strong> {alert.symbol}
                          </span>
                          <span>
                            <strong>Market:</strong> {alert.market}
                          </span>
                          <span>
                            <strong>Current Price:</strong> ${alert.currentPrice}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => handleMarkAsRead(alert.id)}>
                          Mark Read
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
              .filter((a) => a.status === 'read')
              .map((alert) => (
                <Card key={alert.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="neutral">✓ Read</Badge>
                          <span className="text-xs text-secondary-600">{formatDate(alert.triggeredAt!)}</span>
                        </div>
                        <h3 className="text-lg font-semibold text-secondary-900 mb-1">{alert.message}</h3>
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
