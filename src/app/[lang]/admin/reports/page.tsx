'use client';

import { useEffect, useMemo, useState } from 'react';
import { Header, Footer, Card, CardHeader, CardContent, Button, StatBlock, Badge } from '@/components';
import { motion } from 'framer-motion';
import { apiGet } from '@/lib/apiClient';
import { 
  BarChart3, 
  Download, 
  Filter,
  CreditCard
} from 'lucide-react';

export default function AdminReportsPage() {
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
  const [error, setError] = useState('');

  useEffect(() => {
    apiGet<{ reports: NonNullable<typeof reports> }>('/api/admin/reports', true)
      .then((data) => setReports(data.reports))
      .catch((loadError) => setError(loadError instanceof Error ? loadError.message : 'Unable to load reports.'));
  }, []);

  const salesStats = useMemo(() => [
    { label: 'Monthly Revenue', value: `$${(reports?.summary.monthlyRevenue || 0).toLocaleString()}`, change: 0, trend: 'up' },
    { label: 'Transactions', value: String(reports?.summary.transactionCount || 0), change: 0, trend: 'up' },
    { label: 'Completed', value: String(reports?.summary.completedTransactions || 0), change: 0, trend: 'up' },
    { label: 'Failed', value: String(reports?.summary.failedTransactions || 0), change: 0, trend: 'down' },
  ], [reports]);

  return (
    <div className="min-h-screen bg-secondary-50">
      <Header isAuthenticated={true} userName="Admin" />

      <main className="py-12 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-6">
            <div>
              <h1 className="text-4xl font-black text-secondary-900 tracking-tight">Sales & <span className="text-primary-600">Revenue</span> Reports</h1>
              <p className="text-lg text-secondary-500 font-medium">Detailed financial analytics and transaction history</p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" size="lg" leftIcon={<Filter className="w-5 h-5" />}>Filter Period</Button>
              <Button size="lg" className="shadow-lg shadow-primary-200" leftIcon={<Download className="w-5 h-5" />}>Export PDF</Button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
            {salesStats.map((stat, i) => (
              <Card key={i} className="border-none shadow-md bg-white">
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
                <p className="text-secondary-400 font-bold uppercase tracking-widest">Revenue Growth Chart</p>
                <p className="text-xs text-secondary-300 mt-2">Visual analytics will be rendered here</p>
              </div>
            </Card>
            <Card className="border-none shadow-xl bg-secondary-900 text-white overflow-hidden relative">
              <div className="absolute -right-10 -top-10 w-40 h-40 bg-primary-600 rounded-full blur-3xl opacity-20" />
              <CardHeader title="Payment Methods" icon={<CreditCard className="w-5 h-5 text-primary-400" />} />
              <CardContent className="space-y-6">
                {[
                  { label: 'Completed', value: `${reports?.summary.transactionCount ? Math.round(((reports?.summary.completedTransactions || 0) / reports.summary.transactionCount) * 100) : 0}%`, color: 'bg-primary-500' },
                  { label: 'Pending', value: `${reports?.summary.transactionCount ? Math.round((((reports.transactions.length - reports.summary.completedTransactions - reports.summary.failedTransactions) || 0) / reports.summary.transactionCount) * 100) : 0}%`, color: 'bg-blue-500' },
                  { label: 'Failed', value: `${reports?.summary.transactionCount ? Math.round(((reports?.summary.failedTransactions || 0) / reports.summary.transactionCount) * 100) : 0}%`, color: 'bg-orange-500' }
                ].map((m, i) => (
                  <div key={i}>
                    <div className="flex justify-between items-end mb-2">
                      <p className="text-xs font-black text-secondary-400 uppercase tracking-widest">{m.label}</p>
                      <p className="text-lg font-black">{m.value}</p>
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
            <CardHeader title="Recent Transactions" subtitle="Last 50 payments across all gateways" />
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-secondary-50 border-b border-secondary-100">
                      <th className="text-left py-4 px-6 text-xs font-black text-secondary-400 uppercase tracking-widest">Transaction ID</th>
                      <th className="text-left py-4 px-6 text-xs font-black text-secondary-400 uppercase tracking-widest">User</th>
                      <th className="text-left py-4 px-6 text-xs font-black text-secondary-400 uppercase tracking-widest">Plan</th>
                      <th className="text-left py-4 px-6 text-xs font-black text-secondary-400 uppercase tracking-widest">Amount</th>
                      <th className="text-left py-4 px-6 text-xs font-black text-secondary-400 uppercase tracking-widest">Status</th>
                      <th className="text-right py-4 px-6 text-xs font-black text-secondary-400 uppercase tracking-widest">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-secondary-50">
                    {(reports?.transactions || []).map((txn) => (
                      <tr key={txn.id} className="hover:bg-secondary-50/50 transition-colors">
                        <td className="py-4 px-6 font-mono text-xs font-bold text-secondary-500">{txn.id}</td>
                        <td className="py-4 px-6 text-sm font-bold text-secondary-900">{txn.userId}</td>
                        <td className="py-4 px-6 text-sm font-medium text-secondary-600">{txn.transactionType}</td>
                        <td className="py-4 px-6 font-black text-secondary-900">{txn.amount} {txn.currency}</td>
                        <td className="py-4 px-6">
                          <Badge variant={txn.status === 'completed' ? 'success' : 'warning'}>{txn.status}</Badge>
                        </td>
                        <td className="py-4 px-6 text-right text-xs font-bold text-secondary-400">{new Date(txn.createdAt).toLocaleString()}</td>
                      </tr>
                    ))}
                    {!reports?.transactions.length && (
                      <tr>
                        <td colSpan={6} className="py-8 px-6 text-center text-secondary-500">No transactions found.</td>
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
