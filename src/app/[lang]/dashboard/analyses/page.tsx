'use client';

import { Header, Card, CardHeader, CardContent, Button, Badge } from '@/components';
import { getSignalColor, getRiskColor, formatDate } from '@/lib/utils';
import Link from 'next/link';

export default function AnalysesPage() {
  const analyses = [
    {
      id: '1',
      title: 'Iran Stocks Quarterly Outlook',
      market: 'Iran Stocks',
      summary: 'Technical analysis suggests strong bullish momentum with key support levels holding.',
      signal: 'BUY',
      riskLevel: 'MEDIUM',
      date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      targetPrice: 2100,
      accuracy: 78,
    },
    {
      id: '2',
      title: 'EUR/USD Breakout Analysis',
      market: 'Forex',
      summary: 'Consolidation pattern indicates potential breakout. Watch for key resistance.',
      signal: 'HOLD',
      riskLevel: 'MEDIUM',
      date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      targetPrice: 1.12,
      accuracy: 65,
    },
    {
      id: '3',
      title: 'Gold Bullish Continuation',
      market: 'Gold',
      summary: 'Recent pullback presents buying opportunity. Long-term trend remains strong.',
      signal: 'BUY',
      riskLevel: 'LOW',
      date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      targetPrice: 2600,
      accuracy: 82,
    },
    {
      id: '4',
      title: 'USD/IRR Currency Trends',
      market: 'Currency',
      summary: 'Dollar strength persists. Levels to monitor for potential reversal.',
      signal: 'SELL',
      riskLevel: 'HIGH',
      date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      targetPrice: 40000,
      accuracy: 71,
    },
  ];

  return (
    <div className="min-h-screen bg-secondary-50">
      <Header isAuthenticated={true} userName="John Doe" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-bold text-secondary-900">My Analyses</h1>
          <Link href="/dashboard">
            <Button variant="outline">Back to Dashboard</Button>
          </Link>
        </div>

        {/* Filters */}
        <div className="mb-8 flex gap-3 flex-wrap">
          <Button variant="outline" size="sm">
            All Markets
          </Button>
          <Button variant="outline" size="sm">
            Iran Stocks
          </Button>
          <Button variant="outline" size="sm">
            Forex
          </Button>
          <Button variant="outline" size="sm">
            Gold
          </Button>
          <Button variant="outline" size="sm">
            Currency
          </Button>
        </div>

        {/* Analyses Grid */}
        <div className="space-y-4">
          {analyses.map((analysis) => (
            <Card key={analysis.id}>
              <CardContent className="pt-6">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-secondary-900">{analysis.title}</h3>
                      <Badge variant={analysis.signal === 'BUY' ? 'success' : analysis.signal === 'SELL' ? 'danger' : 'warning'}>
                        {analysis.signal}
                      </Badge>
                    </div>
                    <p className="text-secondary-600 mb-3">{analysis.summary}</p>
                    <div className="flex flex-wrap gap-4 text-sm">
                      <div>
                        <span className="text-secondary-600">Market:</span>
                        <span className="ml-2 font-semibold text-secondary-900">{analysis.market}</span>
                      </div>
                      <div>
                        <span className="text-secondary-600">Risk Level:</span>
                        <Badge className="ml-2" variant={analysis.riskLevel === 'LOW' ? 'success' : analysis.riskLevel === 'MEDIUM' ? 'warning' : 'danger'}>
                          {analysis.riskLevel}
                        </Badge>
                      </div>
                      <div>
                        <span className="text-secondary-600">Target:</span>
                        <span className="ml-2 font-semibold text-secondary-900">${analysis.targetPrice}</span>
                      </div>
                      <div>
                        <span className="text-secondary-600">Accuracy:</span>
                        <span className="ml-2 font-semibold text-secondary-900">{analysis.accuracy}%</span>
                      </div>
                      <div>
                        <span className="text-secondary-600">Published:</span>
                        <span className="ml-2 font-semibold text-secondary-900">{formatDate(analysis.date, 'short')}</span>
                      </div>
                    </div>
                  </div>
                  <Button variant="primary">View Full Analysis</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
