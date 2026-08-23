'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Header, Footer, Card, Button, Badge, useLocale } from '@/components';
import { apiGet, apiPut } from '@/lib/apiClient';
import { formatFaDate, formatFaNumber } from '@/lib/format';
import type { SupportTicket } from '@/lib/types';
import { cn } from '@/lib/utils';
import { ArrowLeft, CheckCircle2, Clock3, LifeBuoy, RefreshCw, Save, Ticket } from 'lucide-react';

type StatusFilter = 'all' | SupportTicket['status'];

const statusLabel: Record<SupportTicket['status'], string> = {
  open: 'باز',
  pending: 'در حال پیگیری',
  closed: 'بسته',
};

const priorityLabel: Record<SupportTicket['priority'], string> = {
  low: 'کم',
  normal: 'معمولی',
  high: 'بالا',
};

export default function AdminSupportPage() {
  const { locale } = useLocale();
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [selectedId, setSelectedId] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [status, setStatus] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const selectedTicket = tickets.find((ticket) => ticket.id === selectedId) || tickets[0];

  const stats = useMemo(() => ({
    total: tickets.length,
    open: tickets.filter((ticket) => ticket.status === 'open').length,
    pending: tickets.filter((ticket) => ticket.status === 'pending').length,
    closed: tickets.filter((ticket) => ticket.status === 'closed').length,
  }), [tickets]);

  const loadTickets = useCallback(async (filter: StatusFilter = 'all') => {
    setIsLoading(true);
    try {
      const data = await apiGet<{ tickets: SupportTicket[] }>(`/api/admin/support/tickets?status=${filter}`, true);
      setTickets(data.tickets);
      setSelectedId((current) => current || data.tickets[0]?.id || '');
      setStatus('');
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'بارگذاری تیکت‌ها ناموفق بود.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTickets('all');
  }, [loadTickets]);

  const updateTicket = async (ticket: SupportTicket, patch: Partial<Pick<SupportTicket, 'status' | 'priority' | 'adminNote'>>) => {
    setIsSaving(true);
    try {
      const data = await apiPut<{ ticket: SupportTicket }>(`/api/admin/support/tickets/${ticket.id}`, patch, true);
      setTickets((current) => current.map((item) => (item.id === ticket.id ? data.ticket : item)));
      setStatus('تیکت با موفقیت به‌روزرسانی شد.');
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'ذخیره تیکت ناموفق بود.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#160022] text-white">
      <Header isAuthenticated userName="Admin" />

      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
          <div>
            <div className="mb-4 inline-flex rounded-lg border border-white/10 bg-white/[0.06] p-3 text-primary-100">
              <LifeBuoy className="h-6 w-6" />
            </div>
            <h1 className="text-4xl font-black leading-tight md:text-6xl">مدیریت پشتیبانی</h1>
            <p className="mt-4 max-w-3xl text-base leading-8 text-slate-300">
              تیکت‌های ثبت‌شده کاربران را ببینید، اولویت بدهید، وضعیت را تغییر دهید و یادداشت داخلی اضافه کنید.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href={`/${locale}/admin/settings`}>
              <Button variant="outline" rightIcon={<ArrowLeft className="h-4 w-4" />}>تنظیمات تماس</Button>
            </Link>
            <Button leftIcon={<RefreshCw className="h-4 w-4" />} onClick={() => loadTickets(statusFilter)}>
              تازه‌سازی
            </Button>
          </div>
        </div>

        {status && (
          <div className="mb-6 rounded-lg border border-white/10 bg-white/[0.08] px-4 py-3 text-sm font-bold text-slate-200">
            {status}
          </div>
        )}

        <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-4">
          <StatCard label="کل تیکت‌ها" value={formatFaNumber(stats.total)} icon={<Ticket />} />
          <StatCard label="باز" value={formatFaNumber(stats.open)} icon={<Clock3 />} tone="warning" />
          <StatCard label="در حال پیگیری" value={formatFaNumber(stats.pending)} icon={<RefreshCw />} />
          <StatCard label="بسته" value={formatFaNumber(stats.closed)} icon={<CheckCircle2 />} tone="success" />
        </div>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
          <Card className="p-0">
            <div className="flex items-center justify-between border-b border-white/10 p-4">
              <h2 className="text-xl font-black">لیست تیکت‌ها</h2>
              <select
                value={statusFilter}
                onChange={(event) => {
                  const next = event.target.value as StatusFilter;
                  setStatusFilter(next);
                  loadTickets(next);
                }}
                className="h-10 rounded-lg border border-[color:var(--theme-border)] bg-[color:var(--theme-input-bg)] backdrop-blur-xl px-3 text-sm font-bold text-white outline-none focus:border-primary-200"
              >
                <option value="all">همه</option>
                <option value="open">باز</option>
                <option value="pending">در حال پیگیری</option>
                <option value="closed">بسته</option>
              </select>
            </div>

            <div className="max-h-[720px] overflow-y-auto">
              {isLoading ? (
                <div className="space-y-3 p-4">
                  {Array.from({ length: 4 }).map((_, index) => (
                    <div key={index} className="h-28 animate-pulse rounded-lg bg-white/[0.06]" />
                  ))}
                </div>
              ) : tickets.length ? (
                tickets.map((ticket) => (
                  <button
                    key={ticket.id}
                    type="button"
                    onClick={() => setSelectedId(ticket.id)}
                    className={cn(
                      'block w-full border-b border-white/10 p-4 text-right transition last:border-0 hover:bg-white/[0.06]',
                      selectedTicket?.id === ticket.id && 'bg-primary-200/[0.08]',
                    )}
                  >
                    <div className="mb-3 flex flex-wrap items-center gap-2">
                      <Badge variant={ticket.status === 'closed' ? 'success' : ticket.status === 'pending' ? 'info' : 'warning'}>{statusLabel[ticket.status]}</Badge>
                      <span className="rounded-lg bg-white/[0.07] px-2 py-1 text-xs font-black text-slate-300">اولویت {priorityLabel[ticket.priority]}</span>
                    </div>
                    <p className="font-black text-white">{ticket.subject}</p>
                    <p className="mt-1 text-sm text-slate-400">{ticket.name} - {ticket.email}</p>
                    <p className="mt-2 text-xs text-slate-500">{formatFaDate(ticket.createdAt)}</p>
                  </button>
                ))
              ) : (
                <div className="p-8 text-center text-slate-400">تیکتی با این فیلتر وجود ندارد.</div>
              )}
            </div>
          </Card>

          <Card className="p-5">
            {selectedTicket ? (
              <TicketDetail ticket={selectedTicket} isSaving={isSaving} onUpdate={updateTicket} />
            ) : (
              <div className="py-16 text-center text-slate-400">برای مشاهده جزئیات، یک تیکت انتخاب کنید.</div>
            )}
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
}

function TicketDetail({
  ticket,
  isSaving,
  onUpdate,
}: {
  ticket: SupportTicket;
  isSaving: boolean;
  onUpdate: (ticket: SupportTicket, patch: Partial<Pick<SupportTicket, 'status' | 'priority' | 'adminNote'>>) => void;
}) {
  const [adminNote, setAdminNote] = useState(ticket.adminNote || '');

  useEffect(() => {
    setAdminNote(ticket.adminNote || '');
  }, [ticket.id, ticket.adminNote]);

  return (
    <div>
      <div className="mb-6 flex flex-col justify-between gap-4 border-b border-white/10 pb-5 md:flex-row md:items-start">
        <div>
          <h2 className="text-2xl font-black text-white">{ticket.subject}</h2>
          <p className="mt-2 text-sm text-slate-400">{ticket.name} - {ticket.email}</p>
          {ticket.phone && <p className="mt-1 text-sm text-slate-400">{ticket.phone}</p>}
        </div>
        <div className="flex gap-2">
          <select
            value={ticket.status}
            onChange={(event) => onUpdate(ticket, { status: event.target.value as SupportTicket['status'] })}
            className="admin-input h-11 min-w-36"
          >
            <option value="open">باز</option>
            <option value="pending">در حال پیگیری</option>
            <option value="closed">بسته</option>
          </select>
          <select
            value={ticket.priority}
            onChange={(event) => onUpdate(ticket, { priority: event.target.value as SupportTicket['priority'] })}
            className="admin-input h-11 min-w-28"
          >
            <option value="low">کم</option>
            <option value="normal">معمولی</option>
            <option value="high">بالا</option>
          </select>
        </div>
      </div>

      <div className="mb-6 rounded-lg border border-white/10 bg-white/[0.045] p-4">
        <p className="mb-2 text-xs font-black text-slate-500">متن درخواست</p>
        <p className="whitespace-pre-wrap text-sm leading-8 text-slate-200">{ticket.message}</p>
      </div>

      <label className="block">
        <span className="mb-2 block text-sm font-black text-slate-300">یادداشت داخلی ادمین</span>
        <textarea
          value={adminNote}
          onChange={(event) => setAdminNote(event.target.value)}
          rows={5}
          className="admin-input resize-none"
          placeholder="یادداشت فقط برای مدیران نمایش داده می‌شود."
        />
      </label>
      <Button className="mt-4" isLoading={isSaving} leftIcon={<Save className="h-5 w-5" />} onClick={() => onUpdate(ticket, { adminNote })}>
        ذخیره یادداشت
      </Button>
    </div>
  );
}

function StatCard({ label, value, icon, tone = 'default' }: { label: string; value: string; icon: React.ReactNode; tone?: 'default' | 'success' | 'warning' }) {
  return (
    <Card className="p-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-black text-slate-400">{label}</p>
          <p className="mt-2 font-mono text-2xl font-black text-white">{value}</p>
        </div>
        <div className={cn('rounded-lg p-3', tone === 'success' ? 'bg-emerald-300/12 text-emerald-200' : tone === 'warning' ? 'bg-amber-300/12 text-amber-200' : 'bg-primary-200/12 text-primary-100')}>
          {icon}
        </div>
      </div>
    </Card>
  );
}
