'use client';

import { useCallback, useEffect, useState } from 'react';
import { Header, Footer, Card, CardHeader, CardContent, Button, Badge } from '@/components';
import { useLocale } from '@/components/LocaleProvider';
import { getAuthHeaders, getStoredUser } from '@/lib/clientAuth';
import Link from 'next/link';
import {
  FileText,
  Plus,
  Search,
  Filter,
  Calendar,
  Lock,
  Unlock,
  Eye,
  Edit3,
  Clock,
  Trash2
} from 'lucide-react';

interface AnalysisItem {
  id: string;
  title: string;
  market?: { name: string } | null;
  timeframe: string;
  signal: string;
  publishedAt: string;
  requiredSubscription?: string | null;
  isLocked: boolean;
}

export default function AnalysesManagementPage() {
  const { locale } = useLocale();
  const currentUser = getStoredUser();
  const [analyses, setAnalyses] = useState<AnalysisItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchAnalyses = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/analyses?limit=100', {
        headers: getAuthHeaders(),
      });
      const result = await response.json();

      if (!response.ok) {
        setError(result.error || 'Unable to load analyses');
        return;
      }

      setAnalyses(result.data?.analyses || []);
      setError('');
    } catch {
      setError('Unable to load analyses.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAnalyses();
  }, [fetchAnalyses]);

  const deleteAnalysis = async (id: string) => {
    if (!window.confirm('Delete this analysis?')) return;

    try {
      const response = await fetch(`/api/analyses/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        const result = await response.json();
        setError(result.error || 'Unable to delete analysis');
        return;
      }

      setAnalyses((current) => current.filter((analysis) => analysis.id !== id));
    } catch {
      setError('Unable to delete analysis.');
    }
  };

  return (
    <div className="min-h-screen bg-secondary-50">
      <Header isAuthenticated={true} userName={currentUser?.name || 'مدیر'} />

      <main className="py-12 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-6">
            <div>
              <h1 className="text-4xl font-black text-secondary-900 tracking-tight">Analyses <span className="text-primary-600">Management</span></h1>
              <p className="text-lg text-secondary-500 font-medium">Create, edit, and schedule market insights</p>
            </div>
            <Link href={`/${locale}/admin/analyses/new`}>
              <Button size="lg" className="shadow-lg shadow-primary-200 px-8 h-14" leftIcon={<Plus className="w-5 h-5" />}>
                Publish New Analysis
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 mb-10">
            <Card className="border-none shadow-md bg-white p-4 flex items-center gap-4">
              <div className="w-12 h-12 bg-primary-50 rounded-xl flex items-center justify-center">
                <FileText className="w-6 h-6 text-primary-600" />
              </div>
              <div>
                <p className="text-xs font-black text-secondary-400 uppercase tracking-widest">Total</p>
                <p className="text-xl font-black text-secondary-900">{analyses.length}</p>
              </div>
            </Card>
            <Card className="border-none shadow-md bg-white p-4 flex items-center gap-4">
              <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center">
                <Calendar className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-xs font-black text-secondary-400 uppercase tracking-widest">Published</p>
                <p className="text-xl font-black text-secondary-900">{analyses.length}</p>
              </div>
            </Card>
            <Card className="border-none shadow-md bg-white p-4 flex items-center gap-4">
              <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center">
                <Clock className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <p className="text-xs font-black text-secondary-400 uppercase tracking-widest">Scheduled</p>
                <p className="text-xl font-black text-secondary-900">{analyses.filter(a => new Date(a.publishedAt) > new Date()).length}</p>
              </div>
            </Card>
            <Card className="border-none shadow-md bg-white p-4 flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
                <Lock className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-xs font-black text-secondary-400 uppercase tracking-widest">Premium</p>
                <p className="text-xl font-black text-secondary-900">{analyses.filter(a => a.isLocked).length}</p>
              </div>
            </Card>
          </div>

          <Card className="border-none shadow-xl bg-white overflow-hidden">
            <CardHeader 
              title="Analyses List" 
              action={
                <div className="flex gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary-400" />
                    <input type="text" placeholder="Search..." className="pl-10 pr-4 py-2 bg-secondary-50 border border-secondary-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 w-64" />
                  </div>
                  <Button variant="outline" size="sm" leftIcon={<Filter className="w-4 h-4" />}>Filter</Button>
                </div>
              }
            />
            {error ? (
              <div className="border-b border-red-100 bg-red-50 px-6 py-4 text-sm font-bold text-red-800">{error}</div>
            ) : null}
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-secondary-50 border-b border-secondary-100">
                      <th className="text-left py-4 px-6 text-xs font-black text-secondary-400 uppercase tracking-widest">Analysis</th>
                      <th className="text-left py-4 px-6 text-xs font-black text-secondary-400 uppercase tracking-widest">Market / Frame</th>
                      <th className="text-center py-4 px-6 text-xs font-black text-secondary-400 uppercase tracking-widest">Signal</th>
                      <th className="text-left py-4 px-6 text-xs font-black text-secondary-400 uppercase tracking-widest">Date</th>
                      <th className="text-center py-4 px-6 text-xs font-black text-secondary-400 uppercase tracking-widest">Access</th>
                      <th className="text-center py-4 px-6 text-xs font-black text-secondary-400 uppercase tracking-widest">Status</th>
                      <th className="text-right py-4 px-6 text-xs font-black text-secondary-400 uppercase tracking-widest">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-secondary-50">
                    {loading ? (
                      <tr>
                        <td colSpan={7} className="py-10 text-center text-secondary-500">Loading analyses...</td>
                      </tr>
                    ) : analyses.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-10 text-center text-secondary-500">No analyses found.</td>
                      </tr>
                    ) : analyses.map((analysis) => (
                      <tr key={analysis.id} className="hover:bg-secondary-50/50 transition-colors group">
                        <td className="py-4 px-6">
                          <p className="font-bold text-secondary-900 group-hover:text-primary-600 transition-colors">{analysis.title}</p>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex flex-col">
                            <span className="text-sm font-bold text-secondary-700">{analysis.market?.name || 'Unknown market'}</span>
                            <span className="text-[10px] font-bold text-secondary-400 uppercase tracking-tighter">{analysis.timeframe}</span>
                          </div>
                        </td>
                        <td className="py-4 px-6 text-center">
                          <Badge variant={analysis.signal === 'BUY' ? 'success' : analysis.signal === 'SELL' ? 'danger' : 'warning'}>
                            {analysis.signal}
                          </Badge>
                        </td>
                        <td className="py-4 px-6 text-sm text-secondary-600 font-medium">
                          {new Date(analysis.publishedAt).toLocaleDateString()}
                        </td>
                        <td className="py-4 px-6 text-center">
                          <div className="flex justify-center">
                            {analysis.isLocked ? <Lock className="w-4 h-4 text-orange-500" /> : <Unlock className="w-4 h-4 text-green-500" />}
                          </div>
                          <span className="text-[10px] font-bold text-secondary-400 uppercase mt-1 block">{analysis.requiredSubscription || 'free'}</span>
                        </td>
                        <td className="py-4 px-6 text-center">
                          <Badge variant={new Date(analysis.publishedAt) <= new Date() ? 'info' : 'warning'}>
                            {new Date(analysis.publishedAt) <= new Date() ? 'published' : 'scheduled'}
                          </Badge>
                        </td>
                        <td className="py-4 px-6 text-right">
                          <div className="flex justify-end gap-2">
                            <Link href={`/${locale}/admin/analyses/${analysis.id}`}>
                              <Button size="sm" variant="ghost" className="p-2 h-auto text-secondary-400 hover:text-primary-600"><Eye className="w-4 h-4" /></Button>
                            </Link>
                            <Link href={`/${locale}/admin/analyses/${analysis.id}`}>
                              <Button size="sm" variant="ghost" className="p-2 h-auto text-secondary-400 hover:text-blue-600"><Edit3 className="w-4 h-4" /></Button>
                            </Link>
                            <Button size="sm" variant="ghost" className="p-2 h-auto text-secondary-400 hover:text-red-600" onClick={() => deleteAnalysis(analysis.id)}>
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
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
