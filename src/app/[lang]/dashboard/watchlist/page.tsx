'use client';

import { useEffect, useMemo, useState } from 'react';
import { Header, Card, CardHeader, CardContent, Button, Badge } from '@/components';
import { useLocale } from '@/components/LocaleProvider';
import { getStoredUser } from '@/lib/clientAuth';
import { apiDelete, apiGet } from '@/lib/apiClient';
import type { Market, Price, Watchlist } from '@/lib/types';
import Link from 'next/link';

export default function WatchlistPage() {
  const { locale } = useLocale();
  const currentUser = getStoredUser();
  const [watchlist, setWatchlist] = useState<Watchlist[]>([]);
  const [prices, setPrices] = useState<Price[]>([]);
  const [message, setMessage] = useState('');

  useEffect(() => {
    Promise.allSettled([
      apiGet<{ watchlist: Watchlist[] }>('/api/watchlist', true),
      apiGet<{ markets: Array<Market & { prices?: Price[] }> }>('/api/markets'),
    ]).then(([watchlistResult, marketsResult]) => {
      if (watchlistResult.status === 'fulfilled') setWatchlist(watchlistResult.value.watchlist);
      if (marketsResult.status === 'fulfilled') setPrices(marketsResult.value.markets.flatMap((market) => market.prices ?? []));
    });
  }, []);

  const priceBySymbol = useMemo(() => new Map(prices.map((price) => [price.symbol.toUpperCase(), price])), [prices]);

  const removeItem = async (id: string) => {
    try {
      await apiDelete(`/api/watchlist/${id}`, true);
      setWatchlist((current) => current.filter((item) => item.id !== id));
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Unable to remove item.');
    }
  };

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
            {message && <p className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-red-800">{message}</p>}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {watchlist.map((asset) => {
                const price = priceBySymbol.get(asset.symbol.toUpperCase());
                const changePercent = price?.changePercent || 0;
                return (
                <div key={asset.id} className="p-4 border border-secondary-200 rounded-lg hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="font-bold text-secondary-900">{asset.symbol}</p>
                      <p className="text-sm text-secondary-600">{asset.name || asset.market}</p>
                    </div>
                    <Badge variant={changePercent >= 0 ? 'success' : 'danger'}>
                      {changePercent > 0 ? '+' : ''}{changePercent.toFixed(2)}%
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between pt-3 border-t border-secondary-100">
                    <span className="text-2xl font-bold text-secondary-900">{price ? `$${price.currentPrice}` : 'No price'}</span>
                    <Button size="sm" variant="outline" onClick={() => removeItem(asset.id)}>
                      Remove
                    </Button>
                  </div>
                </div>
                );
              })}
              {!watchlist.length && <p className="text-secondary-600">Your watchlist is empty.</p>}
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
