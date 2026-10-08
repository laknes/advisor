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
import { Image as ImageIcon, Upload, Video, X } from 'lucide-react';

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
    mediaUrl: '',
    mediaType: '',
    marketId: '',
    timeframe: 'daily',
    analysisType: 'short_term',
    signal: 'BUY',
    riskLevel: 'MEDIUM',
    entryZone: '',
    exitZone: '',
    requiredSubscription: '',
    isLocked: false,
    accessLevel: 'public',
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
          mediaUrl: data.mediaUrl || '',
          mediaType: data.mediaType || '',
          marketId: data.marketId || 'iran-stocks',
          timeframe: data.timeframe || 'daily',
          analysisType: data.analysisType || 'short_term',
          signal: data.signal || 'BUY',
          riskLevel: data.riskLevel || 'MEDIUM',
          entryZone: data.entryZone || '',
          exitZone: data.exitZone || '',
          requiredSubscription: data.requiredSubscription || '',
          isLocked: data.isLocked ?? false,
          accessLevel: data.accessLevel || (data.isLocked ? 'subscription' : 'public'),
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
          mediaUrl: analysis.mediaUrl || null,
          mediaType: analysis.mediaType || null,
          entryZone: analysis.entryZone.trim() || undefined,
          exitZone: analysis.exitZone.trim() || undefined,
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

  const handleMediaUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError('');
    setMessage('در حال آپلود فایل...');

    const uploadData = new FormData();
    uploadData.append('file', file);

    try {
      const response = await fetch('/api/admin/uploads/analysis-media', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: uploadData,
      });
      const result = await response.json();

      if (!response.ok) {
        setError(result.error || 'آپلود فایل انجام نشد.');
        setMessage('');
        return;
      }

      setAnalysis((prev) => ({
        ...prev,
        mediaUrl: result.data.url,
        mediaType: result.data.mediaType,
      }));
      setMessage('فایل با موفقیت آپلود شد. برای ثبت نهایی، تغییرات را ذخیره کنید.');
    } catch {
      setError('آپلود فایل انجام نشد.');
      setMessage('');
    } finally {
      e.target.value = '';
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
    <div className="admin-page min-h-screen bg-secondary-50">
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

                <div className="rounded-lg border border-dashed border-secondary-200 bg-secondary-50 p-4">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-white text-primary-600 shadow-sm">
                        {analysis.mediaType === 'video' ? <Video className="h-5 w-5" /> : <ImageIcon className="h-5 w-5" />}
                      </div>
                      <div>
                        <p className="font-black text-secondary-900">رسانه تحلیل</p>
                        <p className="text-sm font-medium text-secondary-500">تصویر یا ویدیوی مرتبط با تحلیل را آپلود یا جایگزین کنید.</p>
                      </div>
                    </div>
                    <label className="inline-flex h-11 cursor-pointer items-center justify-center gap-2 rounded-lg bg-primary-600 px-4 text-sm font-black text-white transition-colors hover:bg-primary-700">
                      <Upload className="h-4 w-4" />
                      انتخاب فایل
                      <input type="file" accept="image/*,video/*" className="sr-only" onChange={handleMediaUpload} />
                    </label>
                  </div>

                  {analysis.mediaUrl ? (
                    <div className="mt-4 overflow-hidden rounded-lg border border-secondary-100 bg-white">
                      <div className="flex items-center justify-between border-b border-secondary-100 px-4 py-3">
                        <span className="text-sm font-bold text-secondary-600">{analysis.mediaType === 'video' ? 'ویدیو آپلود شده' : 'تصویر آپلود شده'}</span>
                        <button
                          type="button"
                          onClick={() => setAnalysis((prev) => ({ ...prev, mediaUrl: '', mediaType: '' }))}
                          className="rounded-lg p-1 text-secondary-400 transition-colors hover:bg-secondary-100 hover:text-red-600"
                          aria-label="حذف رسانه"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                      {analysis.mediaType === 'video' ? (
                        <video src={analysis.mediaUrl} controls className="max-h-80 w-full bg-black" />
                      ) : (
                        <img src={analysis.mediaUrl} alt="پیش‌نمایش رسانه تحلیل" className="max-h-80 w-full object-contain" />
                      )}
                    </div>
                  ) : null}
                </div>

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
                  <FormGroup label="Entry Zone">
                    <Input name="entryZone" value={analysis.entryZone} onChange={handleChange} />
                  </FormGroup>
                  <FormGroup label="Exit Zone">
                    <Input name="exitZone" value={analysis.exitZone} onChange={handleChange} />
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
                        { label: 'ویژه', value: 'vip' },
                      ]}
                    />
                  </FormGroup>
                  <FormGroup label="Access Level">
                    <Select
                      name="accessLevel"
                      value={analysis.accessLevel}
                      onChange={handleChange}
                      options={[
                        { label: 'Public (Free)', value: 'public' },
                        { label: 'Free (Login required)', value: 'login' },
                        { label: 'Subscription required', value: 'subscription' },
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

