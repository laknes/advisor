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
        setError(result.error || 'بارگذاری تحلیل‌ها انجام نشد.');
        return;
      }

      setAnalyses(result.data?.analyses || []);
      setError('');
    } catch {
      setError('بارگذاری تحلیل‌ها انجام نشد.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAnalyses();
  }, [fetchAnalyses]);

  const deleteAnalysis = async (id: string) => {
    if (!window.confirm('آیا از حذف این تحلیل مطمئن هستید؟')) return;

    try {
      const response = await fetch(`/api/analyses/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        const result = await response.json();
        setError(result.error || 'حذف تحلیل انجام نشد.');
        return;
      }

      setAnalyses((current) => current.filter((analysis) => analysis.id !== id));
    } catch {
      setError('حذف تحلیل انجام نشد.');
    }
  };

  return (
    <div className="admin-page admin-analyses-page min-h-screen">
      <Header isAuthenticated={true} userName={currentUser?.name || 'مدیر'} />

      <main className="py-12 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-6">
            <div>
              <h1 className="text-4xl font-black text-secondary-900 tracking-tight">مدیریت <span className="text-primary-600">تحلیل‌ها</span></h1>
              <p className="text-lg text-secondary-500 font-medium">ایجاد، ویرایش و زمان‌بندی بینش‌های بازار</p>
            </div>
            <Link href={`/${locale}/admin/analyses/new`}>
              <Button size="lg" className="shadow-lg shadow-primary-200 px-8 h-14" leftIcon={<Plus className="w-5 h-5" />}>
                انتشار تحلیل جدید
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 mb-10">
            <Card className="border border-white/10 bg-white/[0.07] p-4 flex items-center gap-4">
              <div className="w-12 h-12 bg-primary-400/15 rounded-xl flex items-center justify-center">
                <FileText className="w-6 h-6 text-primary-200" />
              </div>
              <div>
                <p className="text-xs font-black text-slate-400 uppercase tracking-widest">کل تحلیل‌ها</p>
                <p className="text-xl font-black text-white">{analyses.length}</p>
              </div>
            </Card>
            <Card className="border border-white/10 bg-white/[0.07] p-4 flex items-center gap-4">
              <div className="w-12 h-12 bg-emerald-400/15 rounded-xl flex items-center justify-center">
                <Calendar className="w-6 h-6 text-emerald-200" />
              </div>
              <div>
                <p className="text-xs font-black text-slate-400 uppercase tracking-widest">منتشرشده</p>
                <p className="text-xl font-black text-white">{analyses.length}</p>
              </div>
            </Card>
            <Card className="border border-white/10 bg-white/[0.07] p-4 flex items-center gap-4">
              <div className="w-12 h-12 bg-amber-300/15 rounded-xl flex items-center justify-center">
                <Clock className="w-6 h-6 text-amber-200" />
              </div>
              <div>
                <p className="text-xs font-black text-slate-400 uppercase tracking-widest">زمان‌بندی‌شده</p>
                <p className="text-xl font-black text-white">{analyses.filter(a => new Date(a.publishedAt) > new Date()).length}</p>
              </div>
            </Card>
            <Card className="border border-white/10 bg-white/[0.07] p-4 flex items-center gap-4">
              <div className="w-12 h-12 bg-cyan-300/15 rounded-xl flex items-center justify-center">
                <Lock className="w-6 h-6 text-cyan-200" />
              </div>
              <div>
                <p className="text-xs font-black text-slate-400 uppercase tracking-widest">ویژه</p>
                <p className="text-xl font-black text-white">{analyses.filter(a => a.isLocked).length}</p>
              </div>
            </Card>
          </div>

          <Card className="border border-white/10 bg-white/[0.07] overflow-hidden">
            <CardHeader 
              title="فهرست تحلیل‌ها" 
              action={
                <div className="flex gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input type="text" placeholder="جست‌وجو..." className="admin-input h-10 w-64 pl-10 pr-4" />
                  </div>
                  <Button variant="outline" size="sm" leftIcon={<Filter className="w-4 h-4" />}>فیلتر</Button>
                </div>
              }
            />
            {error ? (
              <div className="border-b border-red-400/20 bg-red-400/10 px-6 py-4 text-sm font-bold text-red-100">{error}</div>
            ) : null}
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/10 bg-white/[0.05]">
                      <th className="text-right py-4 px-6 text-xs font-black text-slate-400 uppercase tracking-widest">تحلیل</th>
                      <th className="text-right py-4 px-6 text-xs font-black text-slate-400 uppercase tracking-widest">بازار / بازه</th>
                      <th className="text-center py-4 px-6 text-xs font-black text-slate-400 uppercase tracking-widest">سیگنال</th>
                      <th className="text-right py-4 px-6 text-xs font-black text-slate-400 uppercase tracking-widest">تاریخ</th>
                      <th className="text-center py-4 px-6 text-xs font-black text-slate-400 uppercase tracking-widest">دسترسی</th>
                      <th className="text-center py-4 px-6 text-xs font-black text-slate-400 uppercase tracking-widest">وضعیت</th>
                      <th className="text-left py-4 px-6 text-xs font-black text-slate-400 uppercase tracking-widest">عملیات</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10">
                    {loading ? (
                      <tr>
                        <td colSpan={7} className="py-10 text-center text-slate-300">در حال بارگذاری تحلیل‌ها...</td>
                      </tr>
                    ) : analyses.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-10 text-center text-slate-300">تحلیلی پیدا نشد.</td>
                      </tr>
                    ) : analyses.map((analysis) => (
                      <tr key={analysis.id} className="hover:bg-white/[0.055] transition-colors group">
                        <td className="py-4 px-6">
                          <p className="font-bold text-white group-hover:text-primary-200 transition-colors">{analysis.title}</p>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex flex-col">
                            <span className="text-sm font-bold text-slate-200">{analysis.market?.name || 'بازار نامشخص'}</span>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{analysis.timeframe}</span>
                          </div>
                        </td>
                        <td className="py-4 px-6 text-center">
                          <Badge variant={analysis.signal === 'BUY' ? 'success' : analysis.signal === 'SELL' ? 'danger' : 'warning'}>
                            {analysis.signal}
                          </Badge>
                        </td>
                        <td className="py-4 px-6 text-sm text-slate-300 font-medium">
                          {new Date(analysis.publishedAt).toLocaleDateString()}
                        </td>
                        <td className="py-4 px-6 text-center">
                          <div className="flex justify-center">
                            {analysis.isLocked ? <Lock className="w-4 h-4 text-orange-500" /> : <Unlock className="w-4 h-4 text-green-500" />}
                          </div>
                          <span className="text-[10px] font-bold text-slate-400 uppercase mt-1 block">{analysis.requiredSubscription || 'رایگان'}</span>
                        </td>
                        <td className="py-4 px-6 text-center">
                          <Badge variant={new Date(analysis.publishedAt) <= new Date() ? 'info' : 'warning'}>
                            {new Date(analysis.publishedAt) <= new Date() ? 'منتشرشده' : 'زمان‌بندی‌شده'}
                          </Badge>
                        </td>
                        <td className="py-4 px-6 text-right">
                          <div className="flex justify-end gap-2">
                            <Link href={`/${locale}/admin/analyses/${analysis.id}`}>
                              <Button size="sm" variant="ghost" className="p-2 h-auto text-slate-400 hover:text-primary-200"><Eye className="w-4 h-4" /></Button>
                            </Link>
                            <Link href={`/${locale}/admin/analyses/${analysis.id}`}>
                              <Button size="sm" variant="ghost" className="p-2 h-auto text-slate-400 hover:text-cyan-200"><Edit3 className="w-4 h-4" /></Button>
                            </Link>
                            <Button size="sm" variant="ghost" className="p-2 h-auto text-slate-400 hover:text-red-200" onClick={() => deleteAnalysis(analysis.id)}>
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

