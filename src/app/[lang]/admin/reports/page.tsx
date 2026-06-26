'use client';

import { useEffect, useMemo, useState } from 'react';
import { Header, Footer, Card, CardHeader, CardContent, Button, StatBlock, Badge } from '@/components';
import { motion } from 'framer-motion';
import { apiGet } from '@/lib/apiClient';
import { formatFaDate, formatFaNumber } from '@/lib/format';
import { useLocale } from '@/components/LocaleProvider';
import { 
  BarChart3, 
  Download, 
  CreditCard
} from 'lucide-react';

const labels = {
  en: {
    userName: 'Admin',
    loadError: 'Unable to load reports.',
    titleStart: 'Sales &',
    titleHighlight: 'Revenue',
    titleEnd: 'Reports',
    subtitle: 'Detailed financial analytics and transaction history',
    filterPeriod: 'Filter Period',
    exportPdf: 'Export PDF',
    allTime: 'All time',
    last30Days: 'Last 30 days',
    last90Days: 'Last 90 days',
    monthlyRevenue: 'Monthly Revenue',
    transactions: 'Transactions',
    completed: 'Completed',
    pending: 'Pending',
    failed: 'Failed',
    revenueGrowthChart: 'Revenue Growth Chart',
    visualAnalytics: 'Visual analytics will be rendered here',
    paymentMethods: 'Payment Methods',
    recentTransactions: 'Recent Transactions',
    recentTransactionsSubtitle: 'Last 50 payments across all gateways',
    transactionId: 'Transaction ID',
    user: 'User',
    plan: 'Plan',
    amount: 'Amount',
    status: 'Status',
    date: 'Date',
    empty: 'No transactions found.',
    unknownPlan: 'Payment',
    statusLabels: {
      pending: 'Pending',
      completed: 'Completed',
      failed: 'Failed',
    },
  },
  fa: {
    userName: 'مدیر سیستم',
    loadError: 'امکان بارگذاری گزارش‌ها وجود ندارد.',
    titleStart: 'گزارش‌های',
    titleHighlight: 'فروش و درآمد',
    titleEnd: '',
    subtitle: 'تحلیل مالی دقیق و تاریخچه تراکنش‌های پلتفرم',
    filterPeriod: 'فیلتر بازه زمانی',
    exportPdf: 'خروجی PDF',
    allTime: 'همه زمان‌ها',
    last30Days: '۳۰ روز اخیر',
    last90Days: '۹۰ روز اخیر',
    monthlyRevenue: 'درآمد ماهانه',
    transactions: 'تراکنش‌ها',
    completed: 'تکمیل‌شده',
    pending: 'در انتظار',
    failed: 'ناموفق',
    revenueGrowthChart: 'نمودار رشد درآمد',
    visualAnalytics: 'نمایش تصویری تحلیل‌ها در این بخش قرار می‌گیرد',
    paymentMethods: 'وضعیت پرداخت‌ها',
    recentTransactions: 'آخرین تراکنش‌ها',
    recentTransactionsSubtitle: '۵۰ پرداخت اخیر در همه درگاه‌ها',
    transactionId: 'شناسه تراکنش',
    user: 'کاربر',
    plan: 'پلن',
    amount: 'مبلغ',
    status: 'وضعیت',
    date: 'تاریخ',
    empty: 'تراکنشی یافت نشد.',
    unknownPlan: 'پرداخت',
    statusLabels: {
      pending: 'در انتظار',
      completed: 'تکمیل‌شده',
      failed: 'ناموفق',
    },
  },
} as const;

const transactionTypeLabels: Record<'en' | 'fa', Record<string, string>> = {
  en: {
    subscription_payment: 'Subscription payment',
    subscription: 'Subscription',
    payment: 'Payment',
  },
  fa: {
    subscription_payment: 'پرداخت اشتراک',
    subscription: 'اشتراک',
    payment: 'پرداخت',
  },
};

export default function AdminReportsPage() {
  const { locale } = useLocale();
  const isFa = locale === 'fa';
  const t = labels[locale];
  const [reports, setReports] = useState<{
    summary: {
      monthlyRevenue: number;
      transactionCount: number;
      completedTransactions: number;
      failedTransactions: number;
    };
    transactions: Array<{
      id: string;
      userId: string;
      amount: number;
      currency: string;
      status: 'pending' | 'completed' | 'failed';
      transactionType: string;
      planId?: string | null;
      createdAt: string;
    }>;
  } | null>(null);
  const [period, setPeriod] = useState<'all' | '30' | '90'>('all');
  const [error, setError] = useState('');

  useEffect(() => {
    apiGet<{ reports: NonNullable<typeof reports> }>('/api/admin/reports', true)
      .then((data) => setReports(data.reports))
      .catch((loadError) => setError(isFa ? t.loadError : loadError instanceof Error ? loadError.message : t.loadError));
  }, [isFa, t.loadError]);

  const formatNumber = (value: number) => (isFa ? formatFaNumber(value) : value.toLocaleString());
  const formatMoney = (value: number) => (isFa ? `${formatFaNumber(value)} دلار` : `$${value.toLocaleString()}`);
  const formatDateTime = (value: string) => (isFa ? formatFaDate(value) : new Date(value).toLocaleString());
  const formatTransactionType = (type: string) => transactionTypeLabels[locale][type] || type || t.unknownPlan;
  const visibleTransactions = useMemo(() => {
    if (!reports) return [];
    if (period === 'all') return reports.transactions;

    const since = new Date();
    since.setDate(since.getDate() - Number(period));
    return reports.transactions.filter((txn) => new Date(txn.createdAt) >= since);
  }, [period, reports]);

  const visibleSummary = useMemo(() => {
    if (!reports || period === 'all') return reports?.summary;

    return {
      monthlyRevenue: visibleTransactions
        .filter((txn) => txn.status === 'completed')
        .reduce((sum, txn) => sum + txn.amount, 0),
      transactionCount: visibleTransactions.length,
      completedTransactions: visibleTransactions.filter((txn) => txn.status === 'completed').length,
      failedTransactions: visibleTransactions.filter((txn) => txn.status === 'failed').length,
    };
  }, [period, reports, visibleTransactions]);

  const salesStats = [
    { label: t.monthlyRevenue, value: formatMoney(visibleSummary?.monthlyRevenue || 0), change: 0, trend: 'up' },
    { label: t.transactions, value: formatNumber(visibleSummary?.transactionCount || 0), change: 0, trend: 'up' },
    { label: t.completed, value: formatNumber(visibleSummary?.completedTransactions || 0), change: 0, trend: 'up' },
    { label: t.failed, value: formatNumber(visibleSummary?.failedTransactions || 0), change: 0, trend: 'down' },
  ];

  return (
    <div className="min-h-screen bg-secondary-50">
      <Header isAuthenticated={true} userName={t.userName} />

      <main className="py-12 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-6">
            <div>
              <h1 className="text-4xl font-black text-secondary-900 tracking-tight">
                {t.titleStart} <span className="text-primary-600">{t.titleHighlight}</span>{t.titleEnd ? ` ${t.titleEnd}` : ''}
              </h1>
              <p className="text-lg text-secondary-500 font-medium">{t.subtitle}</p>
            </div>
            <div className="flex gap-3">
              <select
                value={period}
                onChange={(event) => setPeriod(event.target.value as 'all' | '30' | '90')}
                aria-label={t.filterPeriod}
                className="h-14 rounded-lg border border-secondary-200 bg-white px-4 text-sm font-bold text-secondary-900 outline-none focus:border-primary-500"
              >
                <option value="all">{t.allTime}</option>
                <option value="30">{t.last30Days}</option>
                <option value="90">{t.last90Days}</option>
              </select>
              <Button size="lg" className="shadow-lg shadow-primary-200" leftIcon={<Download className="w-5 h-5" />} onClick={() => window.print()}>{t.exportPdf}</Button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
            {salesStats.map((stat, i) => (
              <Card key={i} className="border-none shadow-md bg-secondary-900">
                <StatBlock 
                  label={stat.label} 
                  value={stat.value} 
                  change={stat.change} 
                  trend={stat.trend as any} 
                />
              </Card>
            ))}
          </div>
          {error && <div className="mb-8 rounded-lg border border-red-200 bg-red-50 p-4 text-red-800">{error}</div>}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
            <Card className="lg:col-span-2 border-none shadow-xl bg-white h-[400px] flex items-center justify-center">
              <div className="text-center">
                <BarChart3 className="w-16 h-16 text-secondary-100 mx-auto mb-4" />
                <p className="text-secondary-400 font-bold uppercase tracking-widest">{t.revenueGrowthChart}</p>
                <p className="text-xs text-secondary-300 mt-2">{t.visualAnalytics}</p>
              </div>
            </Card>
            <Card className="border-none shadow-xl bg-secondary-900 text-white overflow-hidden relative">
              <div className="absolute -right-10 -top-10 w-40 h-40 bg-primary-600 rounded-full blur-3xl opacity-20" />
              <CardHeader title={t.paymentMethods} icon={<CreditCard className="w-5 h-5 text-primary-400" />} />
              <CardContent className="space-y-6">
                {[
                  { label: t.completed, value: `${visibleSummary?.transactionCount ? Math.round(((visibleSummary.completedTransactions || 0) / visibleSummary.transactionCount) * 100) : 0}%`, color: 'bg-primary-500' },
                  { label: t.pending, value: `${visibleSummary?.transactionCount ? Math.round(((visibleTransactions.length - visibleSummary.completedTransactions - visibleSummary.failedTransactions) / visibleSummary.transactionCount) * 100) : 0}%`, color: 'bg-blue-500' },
                  { label: t.failed, value: `${visibleSummary?.transactionCount ? Math.round(((visibleSummary.failedTransactions || 0) / visibleSummary.transactionCount) * 100) : 0}%`, color: 'bg-orange-500' }
                ].map((m, i) => (
                  <div key={i}>
                    <div className="flex justify-between items-end mb-2">
                      <p className="text-xs font-black text-secondary-400 uppercase tracking-widest">{m.label}</p>
                      <p className="text-lg font-black">{isFa ? m.value.replace(/\d/g, (digit) => '۰۱۲۳۴۵۶۷۸۹'[Number(digit)]) : m.value}</p>
                    </div>
                    <div className="w-full h-1.5 bg-secondary-800 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: m.value }}
                        className={`h-full ${m.color}`}
                      />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          <Card className="border-none shadow-xl bg-white overflow-hidden">
            <CardHeader title={t.recentTransactions} subtitle={t.recentTransactionsSubtitle} />
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-secondary-50 border-b border-secondary-100">
                      <th className="text-start py-4 px-6 text-xs font-black text-secondary-400 uppercase tracking-widest">{t.transactionId}</th>
                      <th className="text-start py-4 px-6 text-xs font-black text-secondary-400 uppercase tracking-widest">{t.user}</th>
                      <th className="text-start py-4 px-6 text-xs font-black text-secondary-400 uppercase tracking-widest">{t.plan}</th>
                      <th className="text-start py-4 px-6 text-xs font-black text-secondary-400 uppercase tracking-widest">{t.amount}</th>
                      <th className="text-start py-4 px-6 text-xs font-black text-secondary-400 uppercase tracking-widest">{t.status}</th>
                      <th className="text-end py-4 px-6 text-xs font-black text-secondary-400 uppercase tracking-widest">{t.date}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-secondary-50">
                    {visibleTransactions.map((txn) => (
                      <tr key={txn.id} className="hover:bg-secondary-50/50 transition-colors">
                        <td className="py-4 px-6 font-mono text-xs font-bold text-secondary-500">{txn.id}</td>
                        <td className="py-4 px-6 text-sm font-bold text-secondary-900">{txn.userId}</td>
                        <td className="py-4 px-6 text-sm font-medium text-secondary-600">{formatTransactionType(txn.transactionType)}</td>
                        <td className="py-4 px-6 font-black text-secondary-900">{formatNumber(txn.amount)} {txn.currency}</td>
                        <td className="py-4 px-6">
                          <Badge variant={txn.status === 'completed' ? 'success' : txn.status === 'failed' ? 'danger' : 'warning'}>{t.statusLabels[txn.status]}</Badge>
                        </td>
                        <td className="py-4 px-6 text-end text-xs font-bold text-secondary-400">{formatDateTime(txn.createdAt)}</td>
                      </tr>
                    ))}
                    {!visibleTransactions.length && (
                      <tr>
                        <td colSpan={6} className="py-8 px-6 text-center text-secondary-500">{t.empty}</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
}
