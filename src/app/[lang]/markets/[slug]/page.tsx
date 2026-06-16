'use client';

import { useState, use } from 'react';
import { useEffect } from 'react';
import { Header, Card, CardHeader, CardContent, Button, Badge, PriceChange, StatBlock } from '@/components';
import { apiGet } from '@/lib/apiClient';
import type { Analysis, Market, Price } from '@/lib/types';
import { useLocale } from '@/components/LocaleProvider';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowRight, 
  Lock, 
  TrendingUp, 
  Clock, 
  ShieldAlert, 
  Target, 
  ChevronRight,
  BarChart3,
  Calendar,
  Zap,
  Activity
} from 'lucide-react';
import { cn } from '@/lib/utils';

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4 }
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

interface MarketPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default function MarketDetailPage({ params: paramsPromise }: MarketPageProps) {
  const params = use(paramsPromise);
  const { locale } = useLocale();
  const [market, setMarket] = useState<(Market & { prices?: Price[]; analyses?: Analysis[] }) | null>(null);
  const [notFound, setNotFound] = useState(false);
  const marketPrice = market?.prices?.[0];
  const analyses = market?.analyses ?? [];

  const [analysisType, setAnalysisType] = useState<'short_term' | 'long_term'>('short_term');
  const [timeframe, setTimeframe] = useState<string>('daily');

  const shortTermFrames = [
    { id: 'daily', label: 'Daily' },
    { id: 'weekly', label: 'Weekly' },
    { id: 'monthly', label: 'Monthly' }
  ];
  const longTermFrames = [
    { id: '3month', label: '3 Months' },
    { id: '1year', label: '1 Year' },
    { id: '3year', label: '3 Years' }
  ];
  const frames = analysisType === 'short_term' ? shortTermFrames : longTermFrames;

  useEffect(() => {
    let mounted = true;
    apiGet<{ market: Market & { prices?: Price[]; analyses?: Analysis[] } }>(`/api/markets/${params.slug}`)
      .then((data) => {
        if (!mounted) return;
        setMarket(data.market);
        setNotFound(false);
      })
      .catch(() => {
        if (!mounted) return;
        setMarket(null);
        setNotFound(true);
      });

    return () => {
      mounted = false;
    };
  }, [params.slug]);

  if (notFound) {
    return (
      <div className="min-h-screen bg-white">
        <Header isAuthenticated={false} />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <h1 className="text-4xl font-extrabold text-secondary-900 mb-4">Market Not Found</h1>
            <p className="text-secondary-600 mb-8">The market you are looking for does not exist or has been removed.</p>
            <Link href={`/${locale}/markets`}>
              <Button variant="primary">Back to Markets</Button>
            </Link>
          </motion.div>
        </div>
      </div>
    );
  }

  if (!market) {
    return (
      <div className="min-h-screen bg-white">
        <Header isAuthenticated={false} />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <h1 className="text-3xl font-extrabold text-secondary-900">Loading market data...</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-secondary-50">
      <Header isAuthenticated={false} />

      {/* Page Header & Live Price */}
      <section className="bg-white border-b border-secondary-200 pt-12 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-10"
          >
            <div className="flex items-center gap-6">
              <motion.div 
                whileHover={{ rotate: 10, scale: 1.1 }}
                className="w-20 h-20 bg-gradient-to-br from-primary-600 to-primary-800 rounded-3xl flex items-center justify-center text-4xl shadow-xl shadow-primary-100"
              >
                {market.icon}
              </motion.div>
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h1 className="text-4xl font-black text-secondary-900 tracking-tight">{market.name}</h1>
                  <Badge variant="info" className="bg-primary-50 text-primary-700 border-primary-100 font-bold uppercase tracking-wider">
                    {market.symbol}
                  </Badge>
                </div>
                <p className="text-secondary-500 font-medium text-lg">{market.description}</p>
              </div>
            </div>

            {marketPrice && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-secondary-900 text-white p-6 rounded-3xl shadow-2xl flex flex-col md:flex-row items-center gap-8 min-w-[300px]"
              >
                <div className="text-center md:text-left">
                  <p className="text-secondary-400 text-xs font-bold uppercase tracking-widest mb-1">Live Price</p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-black font-mono">
                      {marketPrice.currentPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </span>
                    <PriceChange value={marketPrice.changePercent || 0} format="percent" className="text-lg" />
                  </div>
                </div>
                <div className="h-px md:h-12 w-full md:w-px bg-secondary-700" />
                <div className="flex gap-6">
                  <div className="text-center">
                    <p className="text-secondary-400 text-[10px] font-bold uppercase mb-1">High</p>
                    <p className="font-bold text-green-400 font-mono">{marketPrice.dayHigh?.toFixed(2)}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-secondary-400 text-[10px] font-bold uppercase mb-1">Low</p>
                    <p className="font-bold text-red-400 font-mono">{marketPrice.dayLow?.toFixed(2)}</p>
                  </div>
                </div>
              </motion.div>
            )}
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatBlock 
              label="Volume (24h)" 
              value={(marketPrice?.volume ? marketPrice.volume / 1000000 : 0).toFixed(1)} 
              unit="M"
              icon={<Activity className="w-4 h-4 text-primary-500" />}
            />
            <StatBlock 
              label="Volatility" 
              value="Moderate" 
              icon={<TrendingUp className="w-4 h-4 text-orange-500" />}
            />
            <StatBlock 
              label="Active Analyses" 
              value={analyses.length.toString()} 
              icon={<BarChart3 className="w-4 h-4 text-blue-500" />}
            />
            <StatBlock 
              label="Market Status" 
              value="Open" 
              icon={<Clock className="w-4 h-4 text-green-500" />}
            />
          </div>
        </div>
      </section>

      {/* Analysis Section */}
      <section className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-12 gap-8">
            <div className="space-y-2">
              <h2 className="text-3xl font-black text-secondary-900 tracking-tight">Market Insights</h2>
              <p className="text-secondary-500 text-lg">Select a timeframe to view expert analysis and trading signals</p>
            </div>

            {/* Analysis Type Tabs */}
            <div className="flex bg-white p-1.5 rounded-2xl shadow-sm border border-secondary-200">
              <button
                onClick={() => {
                  setAnalysisType('short_term');
                  setTimeframe('daily');
                }}
                className={cn(
                  "px-8 py-3 rounded-xl font-bold transition-all flex items-center gap-2",
                  analysisType === 'short_term'
                    ? "bg-primary-600 text-white shadow-lg"
                    : "text-secondary-500 hover:text-primary-600 hover:bg-primary-50"
                )}
              >
                <Zap className={cn("w-4 h-4", analysisType === 'short_term' ? "text-white" : "text-primary-500")} />
                Short-term
              </button>
              <button
                onClick={() => {
                  setAnalysisType('long_term');
                  setTimeframe('3month');
                }}
                className={cn(
                  "px-8 py-3 rounded-xl font-bold transition-all flex items-center gap-2",
                  analysisType === 'long_term'
                    ? "bg-primary-600 text-white shadow-lg"
                    : "text-secondary-500 hover:text-primary-600 hover:bg-primary-50"
                )}
              >
                <TrendingUp className={cn("w-4 h-4", analysisType === 'long_term' ? "text-white" : "text-primary-500")} />
                Long-term
              </button>
            </div>
          </div>

          {/* Timeframe Selection */}
          <div className="flex flex-wrap gap-3 mb-12">
            {frames.map((frame) => (
              <button
                key={frame.id}
                onClick={() => setTimeframe(frame.id)}
                className={cn(
                  "px-6 py-2.5 rounded-full font-bold transition-all border-2",
                  timeframe === frame.id
                    ? "bg-white border-primary-600 text-primary-600 shadow-md"
                    : "bg-transparent border-transparent text-secondary-500 hover:text-primary-600"
                )}
              >
                {frame.label}
              </button>
            ))}
          </div>

          {/* Analyses List */}
          <AnimatePresence mode="wait">
            <motion.div 
              key={`${analysisType}-${timeframe}`}
              initial="initial"
              animate="animate"
              variants={staggerContainer}
              className="grid grid-cols-1 md:grid-cols-2 gap-8"
            >
              {analyses.filter((a) => a.analysisType === analysisType && a.timeframe === timeframe).length > 0 ? (
                analyses
                  .filter((a) => a.analysisType === analysisType && a.timeframe === timeframe)
                  .map((analysis) => (
                    <motion.div key={analysis.id} variants={fadeInUp}>
                      <Card className="h-full border-none shadow-xl hover:shadow-2xl transition-all duration-300 flex flex-col overflow-hidden group">
                        <div className="p-8 space-y-6 flex-1">
                          <div className="flex justify-between items-start">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-secondary-400" />
                                <span className="text-xs font-bold text-secondary-400 uppercase tracking-widest">
                                  {new Date(analysis.publishedAt).toLocaleDateString()}
                                </span>
                              </div>
                              <h3 className="text-2xl font-black text-secondary-900 leading-tight group-hover:text-primary-600 transition-colors">
                                {analysis.title}
                              </h3>
                            </div>
                            <Badge
                              variant={
                                analysis.signal === 'BUY' ? 'success' : analysis.signal === 'SELL' ? 'danger' : 'warning'
                              }
                              className="px-4 py-1.5 rounded-full text-xs font-black shadow-sm"
                            >
                              {analysis.signal}
                            </Badge>
                          </div>

                          <p className="text-secondary-600 text-lg leading-relaxed line-clamp-3">
                            {analysis.summary}
                          </p>

                          <div className="grid grid-cols-2 gap-6 pt-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center">
                                <ShieldAlert className="w-5 h-5 text-orange-500" />
                              </div>
                              <div>
                                <p className="text-[10px] font-black text-secondary-400 uppercase">Risk Level</p>
                                <p className="font-bold text-secondary-900">{analysis.riskLevel}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                                <Target className="w-5 h-5 text-blue-500" />
                              </div>
                              <div>
                                <p className="text-[10px] font-black text-secondary-400 uppercase">Success Rate</p>
                                <p className="font-bold text-secondary-900">{analysis.accuracy}%</p>
                              </div>
                            </div>
                          </div>

                          {!analysis.isLocked ? (
                            <div className="bg-secondary-50 p-6 rounded-2xl grid grid-cols-2 gap-6 border border-secondary-100">
                              <div>
                                <p className="text-[10px] font-black text-secondary-400 uppercase mb-1">Target Price</p>
                                <p className="text-xl font-black text-primary-600 font-mono">{analysis.targetPrice}</p>
                              </div>
                              <div>
                                <p className="text-[10px] font-black text-secondary-400 uppercase mb-1">Stop Loss</p>
                                <p className="text-xl font-black text-red-500 font-mono">{analysis.stopLoss || 'N/A'}</p>
                              </div>
                            </div>
                          ) : (
                            <div className="relative group/lock">
                              <div className="bg-secondary-50 p-6 rounded-2xl grid grid-cols-2 gap-6 border border-secondary-100 blur-sm select-none">
                                <div>
                                  <p className="text-[10px] font-black text-secondary-400 uppercase mb-1">Target Price</p>
                                  <p className="text-xl font-black text-primary-600 font-mono">XXXX.XX</p>
                                </div>
                                <div>
                                  <p className="text-[10px] font-black text-secondary-400 uppercase mb-1">Stop Loss</p>
                                  <p className="text-xl font-black text-red-500 font-mono">XXXX.XX</p>
                                </div>
                              </div>
                              <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/40 backdrop-blur-[2px] rounded-2xl transition-all group-hover/lock:backdrop-blur-none">
                                <Lock className="w-8 h-8 text-secondary-900 mb-2" />
                                <p className="text-xs font-black text-secondary-900 uppercase tracking-widest">Premium Content</p>
                              </div>
                            </div>
                          )}
                        </div>

                        <div className="px-8 py-6 bg-secondary-50 border-t border-secondary-100 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-secondary-400" />
                            <span className="text-xs font-bold text-secondary-500">
                              {analysis.expiresAt ? `Valid until ${new Date(analysis.expiresAt).toLocaleDateString()}` : 'Active Analysis'}
                            </span>
                          </div>
                          
                          {analysis.isLocked ? (
                            <Link href={`/${locale}/pricing`}>
                              <Button size="md" className="shadow-lg shadow-primary-100 font-bold px-6">
                                Unlock Now
                              </Button>
                            </Link>
                          ) : (
                            <Link href={`/${locale}/dashboard/analyses`}>
                              <Button variant="ghost" size="md" className="font-bold text-primary-600 hover:text-primary-700 hover:bg-primary-50 px-4" rightIcon={<ChevronRight className="w-4 h-4" />}>
                                View Full
                              </Button>
                            </Link>
                          )}
                        </div>
                      </Card>
                    </motion.div>
                  ))
              ) : (
                <motion.div variants={fadeInUp} className="md:col-span-2">
                  <Card className="border-none shadow-lg bg-white p-20 text-center">
                    <div className="w-20 h-20 bg-secondary-50 rounded-full flex items-center justify-center mx-auto mb-6">
                      <BarChart3 className="w-10 h-10 text-secondary-200" />
                    </div>
                    <h3 className="text-2xl font-black text-secondary-900 mb-2">No Analysis Available</h3>
                    <p className="text-secondary-500 max-w-md mx-auto">
                      Our experts are currently working on new insights for this timeframe. Please check back later or explore other markets.
                    </p>
                  </Card>
                </motion.div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </section>

      {/* Subscription CTA if user hits a locked item */}
      <section className="py-24 bg-primary-600 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-[url('/grid.svg')] opacity-10" />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-6xl font-black text-white mb-8 leading-tight">
              Unlock Professional Analysis & Signals
            </h2>
            <p className="text-xl text-primary-100 mb-12 max-w-2xl mx-auto font-medium">
              Don't trade blindly. Get access to entry points, targets, and stop-loss levels for all markets.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Link href={`/${locale}/pricing`}>
                <Button size="lg" variant="secondary" className="h-16 px-12 text-lg shadow-2xl hover:shadow-primary-700/50">
                  View Subscription Plans
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
