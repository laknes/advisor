'use client';

import { Header, Card, CardHeader, CardContent, Button, Input, Textarea, Select, FormGroup } from '@/components';
import { getAuthHeaders, getStoredUser } from '@/lib/clientAuth';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useLocale } from '@/components/LocaleProvider';
import { useDictionary } from '@/components/useDictionary';
import { 
  FilePlus, 
  Send, 
  Clock, 
  Target, 
  Globe,
  Lock,
  Calendar
} from 'lucide-react';

export default function NewAnalysisPage() {
  const { locale } = useLocale();
  const dict = useDictionary();
  const router = useRouter();
  const currentUser = getStoredUser();
  const [markets, setMarkets] = useState<{ id: string; name: string }[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    marketId: '',
    timeframe: 'daily',
    analysisType: 'short_term',
    signal: 'BUY',
    riskLevel: 'MEDIUM',
    summary: '',
    fullContent: '',
    entryPrice: '',
    targetPrice: '',
    stopLoss: '',
    accessLevel: 'premium',
    scheduleDate: '',
    scheduleTime: '',
    sendNotification: true
  });

  useEffect(() => {
    const fetchMarkets = async () => {
      try {
        const response = await fetch('/api/markets');
        const result = await response.json();

        if (response.ok) {
          const nextMarkets = result.data?.markets || [];
          setMarkets(nextMarkets);
          setFormData((prev) => ({
            ...prev,
            marketId: prev.marketId || nextMarkets[0]?.id || '',
          }));
        }
      } catch {
        setError('بازارها بارگذاری نشدند.');
      }
    };

    fetchMarkets();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/analyses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
        },
        body: JSON.stringify({
          marketId: formData.marketId,
          title: formData.title,
          summary: formData.summary,
          fullContent: formData.fullContent,
          timeframe: formData.timeframe,
          analysisType: formData.analysisType,
          signal: formData.signal,
          riskLevel: formData.riskLevel,
          entryPrice: formData.entryPrice ? Number(formData.entryPrice) : undefined,
          targetPrice: formData.targetPrice ? Number(formData.targetPrice) : undefined,
          stopLoss: formData.stopLoss ? Number(formData.stopLoss) : undefined,
          requiredSubscription: formData.accessLevel === 'free' ? undefined : formData.accessLevel,
          isLocked: formData.accessLevel !== 'free',
        }),
      });
      const result = await response.json();

      if (!response.ok) {
        setError(result.error || 'ثبت تحلیل انجام نشد.');
        return;
      }

      setMessage('تحلیل با موفقیت منتشر شد.');
      setTimeout(() => router.push(`/${locale}/admin/analyses`), 700);
    } catch {
      setError('ثبت تحلیل انجام نشد.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = type === 'checkbox' ? (e.target as HTMLInputElement).checked : false;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  if (!dict) return null;

  return (
    <div className="min-h-screen bg-secondary-50">
      <Header isAuthenticated={true} userName={currentUser?.name || 'مدیر'} />

      <main className="py-12 md:py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h1 className="text-4xl font-black text-secondary-900 tracking-tight">{dict.admin.create_new_analysis}</h1>
              <p className="text-lg text-secondary-500 font-medium">{dict.admin.publish_description}</p>
            </div>
            <Button variant="outline" className="hidden sm:flex" onClick={() => window.history.back()}>
              {dict.common.cancel}
            </Button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {error ? (
              <Card className="border border-red-200 bg-red-50">
                <CardContent><p className="text-red-800">{error}</p></CardContent>
              </Card>
            ) : null}
            {message ? (
              <Card className="border border-green-200 bg-green-50">
                <CardContent><p className="text-green-800">{message}</p></CardContent>
              </Card>
            ) : null}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-8">
                <Card className="border-none shadow-xl bg-white">
                  <CardHeader title={dict.admin.general_info} icon={<FilePlus className="w-5 h-5 text-primary-600" />} />
                  <CardContent className="space-y-6">
                    <Input 
                      label={dict.admin.analysis_title} 
                      name="title" 
                      placeholder="e.g. Gold Bullish Continuation Patterns" 
                      value={formData.title}
                      onChange={handleChange}
                      required
                    />
                    <Textarea 
                      label={dict.admin.exec_summary} 
                      name="summary" 
                      placeholder="Brief overview of the analysis (shown in previews)" 
                      rows={3}
                      value={formData.summary}
                      onChange={handleChange}
                      required
                    />
                    <Textarea 
                      label={dict.admin.full_content} 
                      name="fullContent" 
                      placeholder="Detailed technical and fundamental analysis..." 
                      rows={10}
                      value={formData.fullContent}
                      onChange={handleChange}
                      required
                    />
                  </CardContent>
                </Card>

                <Card className="border-none shadow-xl bg-white">
                  <CardHeader title={dict.admin.trading_signals} icon={<Target className="w-5 h-5 text-green-600" />} />
                  <CardContent className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    <Input 
                      label={dict.admin.entry_price} 
                      name="entryPrice" 
                      type="number" 
                      step="0.01" 
                      placeholder="0.00"
                      value={formData.entryPrice}
                      onChange={handleChange}
                    />
                    <Input 
                      label={dict.admin.target_price} 
                      name="targetPrice" 
                      type="number" 
                      step="0.01" 
                      placeholder="0.00"
                      value={formData.targetPrice}
                      onChange={handleChange}
                    />
                    <Input 
                      label={dict.admin.stop_loss} 
                      name="stopLoss" 
                      type="number" 
                      step="0.01" 
                      placeholder="0.00"
                      value={formData.stopLoss}
                      onChange={handleChange}
                    />
                  </CardContent>
                </Card>
              </div>

              {/* Sidebar Settings */}
              <div className="space-y-8">
                <Card className="border-none shadow-xl bg-white">
                  <CardHeader title={dict.admin.market_type} icon={<Globe className="w-5 h-5 text-blue-600" />} />
                  <CardContent className="space-y-6">
                    <Select 
                      label={dict.common.markets} 
                      name="marketId" 
                      value={formData.marketId}
                      onChange={handleChange}
                      required
                      options={markets.map((market) => ({ value: market.id, label: market.name }))}
                      placeholder="Select Market"
                    />
                    <Select 
                      label={dict.admin.analysis_type} 
                      name="analysisType" 
                      value={formData.analysisType}
                      onChange={handleChange}
                      options={[
                        { value: 'short_term', label: dict.admin.short_term },
                        { value: 'long_term', label: dict.admin.long_term },
                      ]}
                    />
                    <Select 
                      label="Signal" 
                      name="signal" 
                      value={formData.signal}
                      onChange={handleChange}
                      options={[
                        { value: 'BUY', label: dict.common.buy },
                        { value: 'SELL', label: dict.common.sell },
                        { value: 'HOLD', label: dict.common.hold },
                      ]}
                    />
                    <Select 
                      label={dict.admin.risk_level} 
                      name="riskLevel" 
                      value={formData.riskLevel}
                      onChange={handleChange}
                      options={[
                        { value: 'LOW', label: dict.admin.low_risk },
                        { value: 'MEDIUM', label: dict.admin.medium_risk },
                        { value: 'HIGH', label: dict.admin.high_risk },
                      ]}
                    />
                  </CardContent>
                </Card>

                <Card className="border-none shadow-xl bg-white">
                  <CardHeader title={dict.admin.access_scheduling} icon={<Lock className="w-5 h-5 text-orange-600" />} />
                  <CardContent className="space-y-6">
                    <Select 
                      label={dict.admin.access_level} 
                      name="accessLevel" 
                      value={formData.accessLevel}
                      onChange={handleChange}
                      options={[
                        { value: 'free', label: dict.admin.free_access },
                        { value: 'basic', label: dict.admin.basic_sub },
                        { value: 'premium', label: dict.admin.premium_sub },
                        { value: 'vip', label: dict.admin.vip_sub },
                      ]}
                    />
                    
                    <div className="space-y-4 pt-4 border-t border-secondary-50">
                      <p className="text-sm font-bold text-secondary-700">{dict.admin.schedule_pub}</p>
                      <Input 
                        type="date" 
                        name="scheduleDate" 
                        value={formData.scheduleDate}
                        onChange={handleChange}
                        icon={<Calendar className="w-4 h-4" />}
                      />
                      <Input 
                        type="time" 
                        name="scheduleTime" 
                        value={formData.scheduleTime}
                        onChange={handleChange}
                        icon={<Clock className="w-4 h-4" />}
                      />
                    </div>

                    <div className="flex items-center gap-3 pt-4 border-t border-secondary-50">
                      <input 
                        type="checkbox" 
                        id="sendNotification" 
                        name="sendNotification"
                        checked={formData.sendNotification}
                        onChange={handleChange}
                        className="w-5 h-5 rounded border-secondary-300 text-primary-600 focus:ring-primary-500"
                      />
                      <label htmlFor="sendNotification" className="text-sm font-bold text-secondary-700">{dict.admin.send_notif}</label>
                    </div>
                  </CardContent>
                </Card>

                <Button type="submit" fullWidth size="lg" isLoading={isSubmitting} className="h-16 text-lg shadow-xl shadow-primary-200" leftIcon={<Send className="w-5 h-5" />}>
                  {dict.admin.publish_analysis}
                </Button>
              </div>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
