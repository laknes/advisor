'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import {
  Header,
  Card,
  CardHeader,
  CardContent,
  Button,
  Input,
  Textarea,
  Select,
  FormGroup,
} from '@/components';
import { useLocale } from '@/components/LocaleProvider';
import { getAuthHeaders, getStoredUser } from '@/lib/clientAuth';
import Link from 'next/link';

interface Params {
  params: Promise<{
    id: string;
  }>;
}

export default function EditAnalysisPage({ params: paramsPromise }: Params) {
  const params = use(paramsPromise);
  const router = useRouter();
  const { locale } = useLocale();
  const currentUser = getStoredUser();
  const [markets, setMarkets] = useState<{ id: string; name: string }[]>([]);
  const [analysis, setAnalysis] = useState({
    title: '',
    summary: '',
    fullContent: '',
    marketId: '',
    timeframe: 'daily',
    analysisType: 'short_term',
    signal: 'BUY',
    riskLevel: 'MEDIUM',
    targetPrice: '',
    entryPrice: '',
    stopLoss: '',
    takeProfit: '',
    requiredSubscription: '',
    isLocked: false,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAnalysis = async () => {
      try {
        const response = await fetch(`/api/analyses/${params.id}`, {
          headers: getAuthHeaders(),
        });

        const result = await response.json();

        if (!response.ok) {
          setError(result.error || 'Unable to load analysis');
          return;
        }

        const data = result.data.analysis;
        setAnalysis({
          title: data.title || '',
          summary: data.summary || '',
          fullContent: data.fullContent || '',
          marketId: data.marketId || 'iran-stocks',
          timeframe: data.timeframe || 'daily',
          analysisType: data.analysisType || 'short_term',
          signal: data.signal || 'BUY',
          riskLevel: data.riskLevel || 'MEDIUM',
          targetPrice: data.targetPrice?.toString() || '',
          entryPrice: data.entryPrice?.toString() || '',
          stopLoss: data.stopLoss?.toString() || '',
          takeProfit: data.takeProfit?.toString() || '',
          requiredSubscription: data.requiredSubscription || '',
          isLocked: data.isLocked ?? false,
        });
      } catch {
        setError('Unable to load analysis details.');
      } finally {
        setLoading(false);
      }
    };

    fetchAnalysis();
  }, [params.id]);

  useEffect(() => {
    const fetchMarkets = async () => {
      try {
        const response = await fetch('/api/markets');
        const result = await response.json();

        if (response.ok && result.data?.markets) {
          setMarkets(result.data.markets.map((market: { id: string; name: string }) => ({ id: market.id, name: market.name })));
        }
      } catch {
        // ignore
      }
    };

    fetchMarkets();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = type === 'checkbox' ? (e.target as HTMLInputElement).checked : false;
    setAnalysis((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');
    setMessage('Saving analysis...');

    try {
      const response = await fetch(`/api/analyses/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
        },
        body: JSON.stringify({
          ...analysis,
          targetPrice: analysis.targetPrice ? Number(analysis.targetPrice) : undefined,
          entryPrice: analysis.entryPrice ? Number(analysis.entryPrice) : undefined,
          stopLoss: analysis.stopLoss ? Number(analysis.stopLoss) : undefined,
          takeProfit: analysis.takeProfit ? Number(analysis.takeProfit) : undefined,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.error || 'Unable to update analysis');
        setMessage('');
        return;
      }

      setMessage('Analysis updated successfully!');
      setTimeout(() => setMessage(''), 2000);
    } catch {
      setError('Unable to update analysis. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this analysis?')) {
      return;
    }

    try {
      const response = await fetch(`/api/analyses/${params.id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        const result = await response.json();
        setError(result.error || 'Unable to delete analysis');
        return;
      }

      router.push(`/${locale}/admin/analyses`);
    } catch {
      setError('Unable to delete analysis.');
    }
  };

  return (
    <div className="min-h-screen bg-secondary-50">
      <Header isAuthenticated={true} userName={currentUser?.name || 'مدیر'} />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-bold text-secondary-900">Edit Analysis</h1>
          <div className="flex gap-3">
            <Link href={`/${locale}/admin/analyses`}>
              <Button variant="outline">← Back</Button>
            </Link>
            <Button variant="danger" onClick={handleDelete}>
              Delete
            </Button>
          </div>
        </div>

        {loading ? (
          <Card>
            <CardContent>
              <p className="text-secondary-700">Loading analysis details...</p>
            </CardContent>
          </Card>
        ) : (
          <>
            {message && (
              <Card className="mb-6 bg-green-50 border border-green-200">
                <CardContent>
                  <p className="text-green-800">{message}</p>
                </CardContent>
              </Card>
            )}

            {error && (
              <Card className="mb-6 bg-red-50 border border-red-200">
                <CardContent>
                  <p className="text-red-800">{error}</p>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader title="Analysis Details" />
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormGroup label="Title">
                    <Input name="title" value={analysis.title} onChange={handleChange} />
                  </FormGroup>
                  <FormGroup label="Market">
                    <Select
                      name="marketId"
                      value={analysis.marketId}
                      onChange={handleChange}
                      options={markets.length > 0 ? markets.map((market) => ({ label: market.name, value: market.id })) : []}
                    />
                  </FormGroup>
                  <FormGroup label="Analysis Type">
                    <Select
                      name="analysisType"
                      value={analysis.analysisType}
                      onChange={handleChange}
                      options={[
                        { label: 'Short-term', value: 'short_term' },
                        { label: 'Long-term', value: 'long_term' },
                      ]}
                    />
                  </FormGroup>
                  <FormGroup label="Timeframe">
                    <Select
                      name="timeframe"
                      value={analysis.timeframe}
                      onChange={handleChange}
                      options={[
                        { label: 'Daily', value: 'daily' },
                        { label: 'Weekly', value: 'weekly' },
                        { label: 'Monthly', value: 'monthly' },
                        { label: '3 Months', value: '3month' },
                        { label: '1 Year', value: '1year' },
                        { label: '3 Years', value: '3year' },
                      ]}
                    />
                  </FormGroup>
                </div>

                <FormGroup label="Summary">
                  <Textarea name="summary" value={analysis.summary} onChange={handleChange} rows={3} />
                </FormGroup>
                <FormGroup label="Full Content">
                  <Textarea name="fullContent" value={analysis.fullContent} onChange={handleChange} rows={6} />
                </FormGroup>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <FormGroup label="Signal">
                    <Select
                      name="signal"
                      value={analysis.signal}
                      onChange={handleChange}
                      options={[
                        { label: 'BUY', value: 'BUY' },
                        { label: 'SELL', value: 'SELL' },
                        { label: 'HOLD', value: 'HOLD' },
                      ]}
                    />
                  </FormGroup>
                  <FormGroup label="Risk Level">
                    <Select
                      name="riskLevel"
                      value={analysis.riskLevel}
                      onChange={handleChange}
                      options={[
                        { label: 'LOW', value: 'LOW' },
                        { label: 'MEDIUM', value: 'MEDIUM' },
                        { label: 'HIGH', value: 'HIGH' },
                      ]}
                    />
                  </FormGroup>
                  <FormGroup label="Entry Price">
                    <Input name="entryPrice" type="number" value={analysis.entryPrice} onChange={handleChange} />
                  </FormGroup>
                  <FormGroup label="Target Price">
                    <Input name="targetPrice" type="number" value={analysis.targetPrice} onChange={handleChange} />
                  </FormGroup>
                  <FormGroup label="Stop Loss">
                    <Input name="stopLoss" type="number" value={analysis.stopLoss} onChange={handleChange} />
                  </FormGroup>
                  <FormGroup label="Take Profit">
                    <Input name="takeProfit" type="number" value={analysis.takeProfit} onChange={handleChange} />
                  </FormGroup>
                </div>

                <div className="border-t border-secondary-200 pt-6">
                  <FormGroup label="Required Subscription">
                    <Select
                      name="requiredSubscription"
                      value={analysis.requiredSubscription}
                      onChange={handleChange}
                      options={[
                        { label: 'Public (Free)', value: '' },
                        { label: 'Daily', value: 'daily' },
                        { label: 'Weekly', value: 'weekly' },
                        { label: 'Monthly', value: 'monthly' },
                        { label: '3-Month', value: '3month' },
                        { label: 'VIP', value: 'vip' },
                      ]}
                    />
                  </FormGroup>
                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      name="isLocked"
                      checked={analysis.isLocked}
                      onChange={handleChange}
                      className="w-4 h-4"
                    />
                    <span className="text-secondary-700">Lock full analysis content</span>
                  </label>
                </div>

                <div className="flex justify-end gap-3 pt-6">
                  <Button variant="outline" onClick={() => router.push(`/${locale}/admin/analyses`)}>
                    Cancel
                  </Button>
                  <Button onClick={handleSave} isLoading={saving}>
                    Save Changes
                  </Button>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}
