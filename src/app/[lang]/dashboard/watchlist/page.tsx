'use client';

import { Header, Card, CardHeader, CardContent, Button, Badge } from '@/components';
import { useLocale } from '@/components/LocaleProvider';
import { getStoredUser } from '@/lib/clientAuth';
import Link from 'next/link';

export default function WatchlistPage() {
  const { locale } = useLocale();
  const currentUser = getStoredUser();
  const watchlist = [
    { symbol: 'TEPIX', market: 'Iran Stocks', price: 1850, change: 1.63, changePercent: 0.88 },
    { symbol: 'EUR/USD', market: 'Forex', price: 1.0945, change: 0.0025, changePercent: 0.23 },
    { symbol: 'GOLD', market: 'Gold', price: 2454, change: 28.5, changePercent: 1.18 },
    { symbol: 'USD/IRR', market: 'Currency', price: 42650, change: 150, changePercent: 0.35 },
  ];

  return (
    <div className="min-h-screen bg-secondary-50">
      <Header isAuthenticated={true} userName={currentUser?.name || 'حساب کاربری'} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-bold text-secondary-900">My Watchlist</h1>
          <Link href={`/${locale}/dashboard`}>
            <Button variant="outline">Back to Dashboard</Button>
          </Link>
        </div>

        <Card>
          <CardHeader title="Monitored Assets" />
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {watchlist.map((asset, idx) => (
                <div key={idx} className="p-4 border border-secondary-200 rounded-lg hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="font-bold text-secondary-900">{asset.symbol}</p>
                      <p className="text-sm text-secondary-600">{asset.market}</p>
                    </div>
                    <Badge variant={asset.change > 0 ? 'success' : 'danger'}>
                      {asset.changePercent > 0 ? '+' : ''}{asset.changePercent.toFixed(2)}%
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between pt-3 border-t border-secondary-100">
                    <span className="text-2xl font-bold text-secondary-900">${asset.price}</span>
                    <Button size="sm" variant="outline">
                      Remove
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="mt-8">
          <Link href={`/${locale}/markets`}>
            <Button>Add More Assets</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
