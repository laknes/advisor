'use client';

import { useEffect, useMemo, useState } from 'react';
import { Header, Card, CardHeader, CardContent, Badge } from '@/components';
import { getStoredUser } from '@/lib/clientAuth';
import { apiGet } from '@/lib/apiClient';
import type { Market, Portfolio, Price } from '@/lib/types';

export default function WatchlistPage() {
  const currentUser = getStoredUser();
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [prices, setPrices] = useState<Price[]>([]);
  const [message, setMessage] = useState('');

  useEffect(() => {
    Promise.allSettled([
      apiGet<{ portfolio: Portfolio }>('/api/portfolio', true),
      apiGet<{ markets: Array<Market & { prices?: Price[] }> }>('/api/markets'),
    ]).then(([portfolioResult, marketsResult]) => {
      if (portfolioResult.status === 'fulfilled') setPortfolio(portfolioResult.value.portfolio);
      if (marketsResult.status === 'fulfilled') setPrices(marketsResult.value.markets.flatMap((market) => market.prices ?? []));
      if (portfolioResult.status === 'rejected' || marketsResult.status === 'rejected') setMessage('امکان دریافت بخشی از نرخ‌ها وجود ندارد.');
    });
  }, []);

  const priceBySymbol = useMemo(() => new Map(prices.map((price) => [price.symbol.toUpperCase(), price])), [prices]);
  const userAssets = (portfolio?.positions || []).map((position) => ({
    symbol: position.symbol,
    name: position.type === 'stock' ? 'بورس ایران' : position.type === 'crypto' ? 'رمز ارز' : position.type === 'forex' ? 'جفت ارزها' : position.type === 'gold' ? 'طلا ریال' : 'ارز',
    price: priceBySymbol.get(position.symbol.toUpperCase()),
  }));
  const suggestedPrices = prices.filter((price) => !userAssets.some((asset) => asset.symbol.toUpperCase() === price.symbol.toUpperCase())).slice(0, 8);

  return (
    <div className="site-page min-h-screen bg-secondary-50">
      <Header isAuthenticated={true} userName={currentUser?.name || 'حساب کاربری'} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="mb-3 text-4xl font-bold text-secondary-900">واچ‌لیست نرخ‌ها</h1>
        <p className="mb-8 max-w-3xl leading-7 text-secondary-600">این بخش برای مشاهده نرخ دارایی‌های ثبت‌شده در پورتفو و نرخ‌های پیشنهادی سایت است. افزودن دارایی از صفحه پورتفو انجام می‌شود.</p>

        <Card className="mb-8">
          <CardHeader title="نرخ دارایی‌های شما" />
          <CardContent>
            {message && <p className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-red-800">{message}</p>}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {userAssets.map((asset) => {
                const price = asset.price;
                const changePercent = price?.changePercent || 0;
                return (
                <div key={asset.symbol} className="p-4 border border-secondary-200 rounded-lg hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="font-bold text-secondary-900">{asset.symbol}</p>
                      <p className="text-sm text-secondary-600">{asset.name}</p>
                    </div>
                    <Badge variant={changePercent >= 0 ? 'success' : 'danger'}>
                      {changePercent > 0 ? '+' : ''}{changePercent.toFixed(2)}%
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between pt-3 border-t border-secondary-100">
                    <span className="text-2xl font-bold text-secondary-900">{price ? `$${price.currentPrice}` : 'قیمت ثبت نشده'}</span>
                  </div>
                </div>
                );
              })}
              {!userAssets.length && <p className="text-secondary-600">هنوز دارایی در پورتفوی شما ثبت نشده است.</p>}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader title="نرخ‌های پیشنهادی سایت" />
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {suggestedPrices.map((price) => (
                <div key={price.id} className="p-4 border border-secondary-200 rounded-lg">
                  <div className="mb-3 flex items-center justify-between">
                    <p className="font-bold text-secondary-900">{price.symbol}</p>
                    <Badge variant={(price.changePercent || 0) >= 0 ? 'success' : 'danger'}>{(price.changePercent || 0).toFixed(2)}٪</Badge>
                  </div>
                  <p className="text-2xl font-bold text-secondary-900">{price.currentPrice}</p>
                </div>
              ))}
              {!suggestedPrices.length && <p className="text-secondary-600">نرخ پیشنهادی برای نمایش وجود ندارد.</p>}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

