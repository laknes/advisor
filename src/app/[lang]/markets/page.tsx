'use client';

import { useEffect, useState } from 'react';
import { Header, Card, CardHeader, CardContent, Button, Badge, PriceChange } from '@/components';
import { apiGet } from '@/lib/apiClient';
import type { Analysis, Market, Price } from '@/lib/types';
import { useLocale } from '@/components/LocaleProvider';
import Link from 'next/link';

export default function MarketsPage() {
  const { locale } = useLocale();
  const [markets, setMarkets] = useState<Array<Market & { prices?: Price[] }>>([]);
  const [analyses, setAnalyses] = useState<Analysis[]>([]);

  useEffect(() => {
    let mounted = true;
    Promise.all([
      apiGet<{ markets: Array<Market & { prices?: Price[] }> }>('/api/markets'),
      apiGet<{ analyses: Analysis[] }>('/api/analyses?limit=20'),
    ])
      .then(([marketData, analysisData]) => {
        if (!mounted) return;
        setMarkets(marketData.markets);
        setAnalyses(analysisData.analyses);
      })
      .catch(() => {
        if (!mounted) return;
        setMarkets([]);
        setAnalyses([]);
      });

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <Header isAuthenticated={false} />

      {/* Page Header */}
      <div className="bg-gradient-to-r from-primary-50 to-primary-100 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold text-secondary-900">Investment Markets</h1>
          <p className="text-secondary-600 mt-2">Analyze multiple markets with expert guidance</p>
        </div>
      </div>

      {/* Markets Grid */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-12">
            {markets.map((market) => {
              const marketPrice = market.prices?.[0];
              return (
                <Card key={market.id} hoverable>
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-lg font-bold text-secondary-900">{market.name}</h3>
                        <p className="text-sm text-secondary-500">{market.symbol}</p>
                      </div>
                      <span className="text-3xl">{market.icon}</span>
                    </div>

                    {marketPrice && (
                      <div className="space-y-2 py-3 border-y border-secondary-100">
                        <div className="flex justify-between items-center">
                          <span className="text-secondary-600 text-sm">Current Price</span>
                          <span className="font-bold text-secondary-900">{marketPrice.currentPrice.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-secondary-600 text-sm">Change</span>
                          <PriceChange value={marketPrice.changePercent || 0} format="percent" />
                        </div>
                      </div>
                    )}

                    <Link href={`/${locale}/markets/${market.slug}`}>
                      <Button fullWidth variant="primary">
                        View Analysis
                      </Button>
                    </Link>
                  </div>
                </Card>
              );
            })}
          </div>

          {/* Latest Analyses */}
          <div>
            <h2 className="text-2xl font-bold text-secondary-900 mb-6">Latest Analyses</h2>
            <div className="space-y-4">
              {analyses.map((analysis) => {
                const market = markets.find((m) => m.id === analysis.marketId);
                return (
                  <Card key={analysis.id} hoverable>
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
                      <div className="md:col-span-6">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-2xl">{market?.icon}</span>
                          <div>
                            <p className="text-xs text-secondary-500 font-semibold uppercase">{market?.name}</p>
                            <h3 className="text-lg font-bold text-secondary-900">{analysis.title}</h3>
                          </div>
                        </div>
                        <p className="text-secondary-600 text-sm">{analysis.summary}</p>
                      </div>

                      <div className="md:col-span-3 flex flex-wrap gap-2">
                        <Badge variant={analysis.signal === 'BUY' ? 'success' : analysis.signal === 'SELL' ? 'danger' : 'warning'}>
                          {analysis.signal}
                        </Badge>
                        <Badge variant="info">{analysis.timeframe}</Badge>
                        <Badge variant="neutral">{analysis.riskLevel} Risk</Badge>
                      </div>

                      <div className="md:col-span-3">
                        {analysis.isLocked ? (
                          <Link href={`/${locale}/auth/signup`}>
                            <Button size="sm" variant="outline" fullWidth>
                              Unlock Analysis
                            </Button>
                          </Link>
                        ) : (
                          <Link href={`/${locale}/dashboard/analyses`}>
                            <Button size="sm" fullWidth>
                              View Full Analysis
                            </Button>
                          </Link>
                        )}
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
