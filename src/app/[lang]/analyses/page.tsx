'use client';

import { useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeft, BarChart3, Calendar, Filter, LockKeyhole, ShieldAlert, Target } from 'lucide-react';
import { Badge, Button, Card, Header, useLocale } from '@/components';
import { apiGet } from '@/lib/apiClient';
import { formatFaDate, formatFaNumber } from '@/lib/format';
import type { Analysis, Market } from '@/lib/types';
import { cn } from '@/lib/utils';

const fadeInUp = {
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.45, ease: 'easeOut' },
};

const signalLabel: Record<Analysis['signal'], string> = {
  BUY: 'خرید',
  SELL: 'فروش',
  HOLD: 'نگهداری',
};

const riskLabel: Record<Analysis['riskLevel'], string> = {
  LOW: 'کم',
  MEDIUM: 'متوسط',
  HIGH: 'زیاد',
};

const analysisTypeTabs = [
  { id: 'all', label: 'همه تحلیل‌ها' },
  { id: 'short_term', label: 'کوتاه‌مدت' },
  { id: 'long_term', label: 'بلندمدت' },
] as const;

const signalTabs = [
  { id: 'all', label: 'همه سیگنال‌ها' },
  { id: 'BUY', label: 'خرید' },
  { id: 'HOLD', label: 'نگهداری' },
  { id: 'SELL', label: 'فروش' },
] as const;

type AnalysisTypeFilter = (typeof analysisTypeTabs)[number]['id'];
type SignalFilter = (typeof signalTabs)[number]['id'];

export default function AnalysesPage() {
  const { locale } = useLocale();
  const [analyses, setAnalyses] = useState<Analysis[]>([]);
  const [markets, setMarkets] = useState<Market[]>([]);
  const [loadError, setLoadError] = useState('');
  const [analysisType, setAnalysisType] = useState<AnalysisTypeFilter>('all');
  const [signal, setSignal] = useState<SignalFilter>('all');

  useEffect(() => {
    let mounted = true;

    Promise.all([
      apiGet<{ analyses: Analysis[] }>('/api/analyses?limit=50'),
      apiGet<{ markets: Market[] }>('/api/markets'),
    ])
      .then(([analysisData, marketData]) => {
        if (!mounted) return;
        setAnalyses(analysisData.analyses);
        setMarkets(marketData.markets);
        setLoadError('');
      })
      .catch((error) => {
        if (!mounted) return;
        setAnalyses([]);
        setMarkets([]);
        setLoadError(error instanceof Error ? error.message : 'بارگذاری تحلیل‌ها از دیتابیس ناموفق بود.');
      });

    return () => {
      mounted = false;
    };
  }, []);

  const marketById = useMemo(() => new Map(markets.map((market) => [market.id, market])), [markets]);
  const filteredAnalyses = useMemo(() => {
    return analyses.filter((analysis) => {
      const typeMatches = analysisType === 'all' || analysis.analysisType === analysisType;
      const signalMatches = signal === 'all' || analysis.signal === signal;
      return typeMatches && signalMatches;
    });
  }, [analyses, analysisType, signal]);

  return (
    <div className="min-h-screen bg-[#160022] text-white">
      <Header isAuthenticated={false} />

      <main>
        {loadError && (
          <div className="relative z-20 mx-auto mt-4 max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="rounded-lg border border-amber-300/30 bg-amber-300/10 px-4 py-3 text-sm font-bold leading-7 text-amber-100">
              اتصال به داده‌های واقعی برقرار نشد: {loadError}
            </div>
          </div>
        )}

        <section className="relative overflow-hidden py-16 md:py-24">
          <div className="aurora-grid absolute inset-0 opacity-60" />
          <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <motion.div initial="initial" animate="animate" variants={fadeInUp} className="mb-10 max-w-3xl">
              <h1 className="text-4xl font-black leading-tight text-white md:text-6xl">تحلیل‌های بازار</h1>
              <p className="mt-5 text-base leading-8 text-slate-300 md:text-lg">
                سیگنال‌ها، سناریوها و نقاط کلیدی بازار را بر اساس نوع تحلیل و وضعیت سیگنال مرور کنید.
              </p>
            </motion.div>

            <Card className="mb-8 p-4">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex items-center gap-2 text-sm font-black text-slate-300">
                  <Filter className="h-4 w-4 text-primary-100" />
                  فیلتر تحلیل‌ها
                </div>
                <div className="flex flex-col gap-3 sm:flex-row">
                  <SegmentedControl items={analysisTypeTabs} value={analysisType} onChange={setAnalysisType} />
                  <SegmentedControl items={signalTabs} value={signal} onChange={setSignal} />
                </div>
              </div>
            </Card>

            <div className="mb-6 text-sm font-bold text-slate-400">
              نمایش {formatFaNumber(filteredAnalyses.length)} مورد از {formatFaNumber(analyses.length)} تحلیل
            </div>

            {filteredAnalyses.length > 0 ? (
              <motion.div initial="initial" animate="animate" className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {filteredAnalyses.map((analysis, index) => {
                  const market = analysis.market || marketById.get(analysis.marketId);
                  return (
                    <motion.div key={analysis.id} variants={fadeInUp} transition={{ delay: index * 0.04 }}>
                      <Card hoverable className="flex h-full flex-col p-5">
                        <div className="flex-1 space-y-5">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex items-center gap-3">
                              <span className="text-3xl">{market?.icon || '📈'}</span>
                              <div>
                                <p className="text-xs font-black text-primary-100">{market?.name || 'بازار'}</p>
                                <h2 className="mt-1 text-xl font-black leading-8 text-white">{analysis.title}</h2>
                              </div>
                            </div>
                            {analysis.isLocked && <LockKeyhole className="mt-1 h-5 w-5 shrink-0 text-amber-200" />}
                          </div>

                          <p className="line-clamp-3 min-h-[84px] leading-7 text-slate-300">{analysis.summary}</p>

                          <div className="flex flex-wrap gap-2">
                            <Badge variant={analysis.signal === 'BUY' ? 'success' : analysis.signal === 'SELL' ? 'danger' : 'warning'}>
                              سیگنال {signalLabel[analysis.signal]}
                            </Badge>
                            <Badge variant="info">{analysis.analysisType === 'short_term' ? 'کوتاه‌مدت' : 'بلندمدت'}</Badge>
                            <Badge variant="neutral">ریسک {riskLabel[analysis.riskLevel]}</Badge>
                          </div>

                          <div className="grid grid-cols-2 gap-3 border-y border-white/10 py-4">
                            <Metric icon={<Target className="h-4 w-4" />} label="هدف" value={analysis.targetPrice ? formatFaNumber(analysis.targetPrice) : 'نامشخص'} />
                            <Metric icon={<ShieldAlert className="h-4 w-4" />} label="دقت" value={`${formatFaNumber(analysis.accuracy ?? 0)}٪`} />
                          </div>

                          <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
                            <Calendar className="h-4 w-4" />
                            {formatFaDate(analysis.publishedAt)}
                          </div>
                        </div>

                        <div className="mt-6">
                          <Link href={analysis.isLocked ? `/${locale}/pricing` : `/${locale}/dashboard/analyses`}>
                            <Button fullWidth rightIcon={<ArrowLeft className="h-4 w-4" />}>
                              {analysis.isLocked ? 'باز کردن تحلیل' : 'مشاهده کامل'}
                            </Button>
                          </Link>
                        </div>
                      </Card>
                    </motion.div>
                  );
                })}
              </motion.div>
            ) : (
              <Card className="p-12 text-center">
                <BarChart3 className="mx-auto mb-5 h-12 w-12 text-slate-500" />
                <h2 className="text-2xl font-black text-white">{analyses.length > 0 ? 'تحلیلی با این فیلتر پیدا نشد' : 'هنوز تحلیلی در دیتابیس منتشر نشده است'}</h2>
                <p className="mx-auto mt-3 max-w-md leading-7 text-slate-400">
                  {analyses.length > 0 ? 'فیلترها را تغییر دهید یا همه تحلیل‌ها را دوباره نمایش دهید.' : 'پس از ثبت تحلیل‌های واقعی در پنل مدیریت، این صفحه به‌صورت خودکار پر می‌شود.'}
                </p>
                <Button
                  type="button"
                  variant="outline"
                  className="mt-6"
                  onClick={() => {
                    setAnalysisType('all');
                    setSignal('all');
                  }}
                >
                  نمایش همه تحلیل‌ها
                </Button>
              </Card>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}

function SegmentedControl<T extends string>({
  items,
  value,
  onChange,
}: {
  items: ReadonlyArray<{ id: T; label: string }>;
  value: T;
  onChange: (value: T) => void;
}) {
  return (
    <div className="glass-soft flex overflow-x-auto rounded-lg p-1" role="tablist">
      {items.map((item) => {
        const isActive = value === item.id;
        return (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(item.id)}
            className={cn(
              'whitespace-nowrap rounded-lg px-4 py-2 text-sm font-black transition-all focus:outline-none focus:ring-2 focus:ring-white/70',
              isActive ? 'bg-white text-primary-900 shadow-lg shadow-black/20' : 'text-slate-300 hover:bg-white/10 hover:text-white',
            )}
          >
            {item.label}
          </button>
        );
      })}
    </div>
  );
}

function Metric({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div>
      <div className="mb-2 flex items-center gap-2 text-xs font-black text-slate-400">
        <span className="text-primary-100">{icon}</span>
        {label}
      </div>
      <p className="font-mono text-lg font-black text-white">{value}</p>
    </div>
  );
}
