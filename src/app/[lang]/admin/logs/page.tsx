'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { AlertTriangle, ArrowRight, Bug, RefreshCw, Search, Trash2, XCircle } from 'lucide-react';
import { Badge, Button, Card, CardContent, CardHeader, Header } from '@/components';
import { useLocale } from '@/components/LocaleProvider';
import { apiDelete, apiGet } from '@/lib/apiClient';
import { formatFaDate, formatFaNumber } from '@/lib/format';

interface ErrorLogItem {
  id: string;
  level: 'error' | 'warn' | 'info';
  source: string;
  message: string;
  stack?: string | null;
  route?: string | null;
  method?: string | null;
  statusCode?: number | null;
  code?: string | null;
  createdAt: string;
}

interface LogsResponse {
  logs: ErrorLogItem[];
  total: number;
  limit: number;
  offset: number;
  stats: { total: number; errors: number; warnings: number; info: number; errorsLast24h: number };
}

type LevelFilter = 'all' | 'error' | 'warn' | 'info';
type SourceFilter = 'all' | 'server' | 'client' | 'process';

const levelBadge: Record<ErrorLogItem['level'], { variant: 'danger' | 'warning' | 'info'; label: string }> = {
  error: { variant: 'danger', label: 'خطا' },
  warn: { variant: 'warning', label: 'هشدار' },
  info: { variant: 'info', label: 'اطلاعات' },
};

const sourceLabel: Record<string, string> = {
  server: 'سرور',
  client: 'مرورگر',
  process: 'پردازش',
};

export default function AdminLogsPage() {
  const { locale } = useLocale();
  const [data, setData] = useState<LogsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [levelFilter, setLevelFilter] = useState<LevelFilter>('all');
  const [sourceFilter, setSourceFilter] = useState<SourceFilter>('all');
  const [search, setSearch] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const loadLogs = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({ level: levelFilter, source: sourceFilter, limit: '100' });
      if (search.trim()) params.set('search', search.trim());
      const result = await apiGet<LogsResponse>(`/api/admin/logs?${params.toString()}`, true);
      setData(result);
      setError('');
    } catch (fetchError) {
      setError(fetchError instanceof Error ? fetchError.message : 'بارگذاری لاگ‌ها ناموفق بود.');
    } finally {
      setIsLoading(false);
    }
  }, [levelFilter, sourceFilter, search]);

  useEffect(() => {
    loadLogs();
  }, [loadLogs]);

  const clearLogs = async () => {
    if (!window.confirm('همه لاگ‌ها حذف شوند؟ این عملیات قابل بازگشت نیست.')) return;
    try {
      await apiDelete<{ deleted: number }>('/api/admin/logs', true);
      await loadLogs();
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : 'حذف لاگ‌ها ناموفق بود.');
    }
  };

  const deleteLog = async (id: string) => {
    try {
      await apiDelete<null>(`/api/admin/logs/${id}`, true);
      setData((current) => (current ? { ...current, logs: current.logs.filter((item) => item.id !== id) } : current));
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : 'حذف لاگ ناموفق بود.');
    }
  };

  const stats = data?.stats;
  const logs = useMemo(() => data?.logs || [], [data]);

  return (
    <div className="admin-page logs-page min-h-screen bg-secondary-50">
      <Header isAuthenticated userName="مدیر" />

      <main className="py-12 md:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8 flex flex-col justify-between gap-5 md:flex-row md:items-end">
            <div>
              <div className="mb-4 inline-flex rounded-2xl border border-primary-200/60 bg-white/70 p-3 text-primary-700 shadow-lg shadow-primary-900/5 backdrop-blur-xl">
                <Bug className="h-6 w-6" />
              </div>
              <h1 className="text-4xl font-black tracking-tight text-secondary-900">لاگ‌ها و <span className="text-primary-600">خطاهای سایت</span></h1>
              <p className="mt-2 max-w-3xl text-lg font-medium text-secondary-500">خطاهای سرور، مرورگر و پردازش پس‌زمینه را در یک‌جا بررسی و رفع کنید.</p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Link href={`/${locale}/admin`} className="inline-flex items-center gap-2 rounded-xl border border-primary-200 bg-white/70 px-4 py-3 text-sm font-black text-primary-800 shadow-sm backdrop-blur-xl transition hover:border-primary-400 hover:bg-white">
                <ArrowRight className="h-4 w-4" />
                بازگشت به منوی مدیریت
              </Link>
              <Button variant="outline" leftIcon={<RefreshCw className="h-4 w-4" />} onClick={loadLogs}>
                تازه‌سازی
              </Button>
              <Button variant="danger" leftIcon={<Trash2 className="h-4 w-4" />} onClick={clearLogs}>
                پاک‌سازی همه
              </Button>
            </div>
          </div>

          {error && (
            <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-800">{error}</div>
          )}

          <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
            <LogStat icon={<Bug className="h-5 w-5" />} label="کل رویدادها" value={formatFaNumber(stats?.total ?? 0)} />
            <LogStat icon={<XCircle className="h-5 w-5" />} label="خطاها" value={formatFaNumber(stats?.errors ?? 0)} tone="danger" />
            <LogStat icon={<AlertTriangle className="h-5 w-5" />} label="هشدارها" value={formatFaNumber(stats?.warnings ?? 0)} tone="warning" />
            <LogStat icon={<AlertTriangle className="h-5 w-5" />} label="خطاهای ۲۴ ساعت اخیر" value={formatFaNumber(stats?.errorsLast24h ?? 0)} tone="danger" />
          </div>

          <Card className="glass-surface mb-6 border-none p-4 shadow-xl">
            <div className="grid grid-cols-1 gap-3 lg:grid-cols-[minmax(0,1fr)_10rem_10rem]">
              <label className="relative">
                <Search className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-secondary-400" />
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="جست‌وجوی پیام، مسیر یا کد خطا"
                  className="h-12 w-full rounded-lg border border-secondary-200 bg-white/80 py-2 pl-4 pr-10 text-sm font-bold text-secondary-900 outline-none transition focus:border-primary-500"
                />
              </label>
              <select value={levelFilter} onChange={(event) => setLevelFilter(event.target.value as LevelFilter)} className="h-12 rounded-lg border border-secondary-200 bg-white/80 px-3 text-sm font-bold text-secondary-900 outline-none focus:border-primary-500">
                <option value="all">همه سطوح</option>
                <option value="error">خطا</option>
                <option value="warn">هشدار</option>
                <option value="info">اطلاعات</option>
              </select>
              <select value={sourceFilter} onChange={(event) => setSourceFilter(event.target.value as SourceFilter)} className="h-12 rounded-lg border border-secondary-200 bg-white/80 px-3 text-sm font-bold text-secondary-900 outline-none focus:border-primary-500">
                <option value="all">همه منابع</option>
                <option value="server">سرور</option>
                <option value="client">مرورگر</option>
                <option value="process">پردازش</option>
              </select>
            </div>
          </Card>

          <Card className="glass-surface border-none shadow-xl">
            <CardHeader title="فهرست رویدادها" subtitle={data ? `${formatFaNumber(data.total)} مورد` : undefined} />
            <CardContent className="space-y-3">
              {isLoading ? (
                <p className="py-8 text-center text-sm font-bold text-secondary-500">در حال بارگذاری...</p>
              ) : logs.length === 0 ? (
                <p className="py-8 text-center text-sm font-bold text-secondary-500">رویدادی یافت نشد.</p>
              ) : (
                logs.map((item) => (
                  <div key={item.id} className="rounded-xl border border-secondary-200/70 bg-white/70 p-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="mb-2 flex flex-wrap items-center gap-2">
                          <Badge variant={levelBadge[item.level].variant}>{levelBadge[item.level].label}</Badge>
                          <span className="rounded-lg bg-secondary-100 px-2 py-1 text-xs font-black text-secondary-600">{sourceLabel[item.source] || item.source}</span>
                          {item.route && <span dir="ltr" className="rounded-lg bg-secondary-100 px-2 py-1 text-xs font-bold text-secondary-500">{item.method ? `${item.method} ` : ''}{item.route}</span>}
                          {item.statusCode && <span className="rounded-lg bg-secondary-100 px-2 py-1 text-xs font-bold text-secondary-500">HTTP {item.statusCode}</span>}
                          {item.code && <span className="rounded-lg bg-secondary-100 px-2 py-1 text-xs font-bold text-secondary-500">{item.code}</span>}
                        </div>
                        <p className="break-words font-bold text-secondary-900">{item.message}</p>
                        <p className="mt-1 text-xs font-bold text-secondary-400">{formatFaDate(item.createdAt)}</p>
                        {item.stack && (
                          <button
                            type="button"
                            onClick={() => setExpandedId((current) => (current === item.id ? null : item.id))}
                            className="mt-2 text-xs font-black text-primary-700 hover:text-primary-900"
                          >
                            {expandedId === item.id ? 'مخفی کردن جزئیات' : 'نمایش جزئیات فنی'}
                          </button>
                        )}
                        {expandedId === item.id && item.stack && (
                          <pre dir="ltr" className="mt-3 max-h-64 overflow-auto rounded-lg bg-secondary-900 p-3 text-left text-xs leading-6 text-secondary-100">
                            {item.stack}
                          </pre>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => deleteLog(item.id)}
                        className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-secondary-200 text-secondary-400 transition hover:border-red-300 hover:bg-red-50 hover:text-red-600"
                        aria-label="حذف رویداد"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}

function LogStat({ icon, label, value, tone = 'default' }: { icon: React.ReactNode; label: string; value: string; tone?: 'default' | 'danger' | 'warning' }) {
  return (
    <Card className="glass-surface border-none p-4 shadow-md">
      <div className="flex items-center gap-4">
        <div
          className={
            tone === 'danger'
              ? 'rounded-xl bg-red-50 p-3 text-red-600'
              : tone === 'warning'
                ? 'rounded-xl bg-amber-50 p-3 text-amber-600'
                : 'rounded-xl bg-primary-50 p-3 text-primary-600'
          }
        >
          {icon}
        </div>
        <div>
          <p className="text-xs font-black uppercase tracking-widest text-secondary-400">{label}</p>
          <p className="text-xl font-black text-secondary-900">{value}</p>
        </div>
      </div>
    </Card>
  );
}

