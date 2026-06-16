'use client';

import { Header, Card, CardContent, Button, Badge } from '@/components';
import { useLocale } from '@/components/LocaleProvider';
import { getAuthHeaders, getStoredUser } from '@/lib/clientAuth';
import { formatDate } from '@/lib/utils';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function AnalysesPage() {
  const { locale } = useLocale();
  const currentUser = getStoredUser();
  const [analyses, setAnalyses] = useState<Array<{
    id: string;
    title: string;
    market?: { name: string } | null;
    summary: string;
    signal: 'BUY' | 'SELL' | 'HOLD';
    riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
    publishedAt: string;
    targetPrice?: number | null;
    accuracy?: number | null;
  }>>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAnalyses = async () => {
      try {
        const response = await fetch('/api/analyses?limit=50', { headers: getAuthHeaders() });
        const result = await response.json();

        if (!response.ok) {
          setError(result.error || 'Unable to load analyses.');
          return;
        }

        setAnalyses(result.data?.analyses || []);
      } catch {
        setError('Unable to load analyses.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnalyses();
  }, []);

  return (
    <div className="min-h-screen bg-secondary-50">
      <Header isAuthenticated={true} userName={currentUser?.name || 'حساب کاربری'} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-bold text-secondary-900">My Analyses</h1>
          <Link href={`/${locale}/dashboard`}>
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
          {isLoading ? (
            <Card><CardContent><p className="text-secondary-700">Loading analyses...</p></CardContent></Card>
          ) : error ? (
            <Card className="border border-red-200 bg-red-50"><CardContent><p className="text-red-800">{error}</p></CardContent></Card>
          ) : analyses.length === 0 ? (
            <Card><CardContent><p className="text-secondary-700">No analyses are available yet.</p></CardContent></Card>
          ) : analyses.map((analysis) => (
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
                        <span className="ml-2 font-semibold text-secondary-900">{analysis.market?.name || 'All markets'}</span>
                      </div>
                      <div>
                        <span className="text-secondary-600">Risk Level:</span>
                        <Badge className="ml-2" variant={analysis.riskLevel === 'LOW' ? 'success' : analysis.riskLevel === 'MEDIUM' ? 'warning' : 'danger'}>
                          {analysis.riskLevel}
                        </Badge>
                      </div>
                      <div>
                        <span className="text-secondary-600">Target:</span>
                        <span className="ml-2 font-semibold text-secondary-900">{analysis.targetPrice ? `$${analysis.targetPrice}` : '—'}</span>
                      </div>
                      <div>
                        <span className="text-secondary-600">Accuracy:</span>
                        <span className="ml-2 font-semibold text-secondary-900">{analysis.accuracy ?? 0}%</span>
                      </div>
                      <div>
                        <span className="text-secondary-600">Published:</span>
                        <span className="ml-2 font-semibold text-secondary-900">{formatDate(analysis.publishedAt, 'short')}</span>
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
