'use client';

import { Header, Card, Button } from '@/components';
import { formatFaDate, formatFaNumber } from '@/lib/format';
import { cn } from '@/lib/utils';
import { useLocale } from '@/components/LocaleProvider';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Activity,
  BarChart3,
  Bell,
  CreditCard,
  FileText,
  Gauge,
  LayoutDashboard,
  Percent,
  Plus,
  Settings,
  ShieldCheck,
  Users,
  WalletCards,
} from 'lucide-react';

const adminLinks = [
  { href: '', label: 'مرکز مدیریت', icon: LayoutDashboard },
  { href: '/users', label: 'کاربران', icon: Users },
  { href: '/subscriptions', label: 'اشتراک‌ها', icon: CreditCard },
  { href: '/analyses', label: 'تحلیل‌ها', icon: FileText },
  { href: '/pricing', label: 'پلن‌ها', icon: WalletCards },
  { href: '/discounts', label: 'تخفیف‌ها', icon: Percent },
  { href: '/reports', label: 'گزارش‌ها', icon: BarChart3 },
];

const stats = {
  users: 5230,
  activeSubscriptions: 892,
  monthlyRevenue: 125430,
  activeAnalyses: 28,
};

const recentUsers = [
  { id: 'u-1', name: 'سارا احمدی', email: 'sara@example.com', createdAt: new Date('2026-06-12'), verified: true },
  { id: 'u-2', name: 'رضا محمدی', email: 'reza@example.com', createdAt: new Date('2026-06-11'), verified: true },
  { id: 'u-3', name: 'نیما کریمی', email: 'nima@example.com', createdAt: new Date('2026-06-10'), verified: false },
];

const operations = [
  { label: 'APIهای فعال', value: '۲۴ مسیر', status: 'پایدار' },
  { label: 'پرداخت‌ها', value: '۹۸٪ موفق', status: 'نرمال' },
  { label: 'تحلیل‌های قفل‌دار', value: '۱۶ مورد', status: 'VIP' },
];

export default function AdminDashboard() {
  const { locale } = useLocale();

  return (
    <div className="min-h-screen bg-[#160022] text-white">
      <Header isAuthenticated userName="مدیر سیستم" />

      <div className="mx-auto flex max-w-7xl gap-6 px-4 py-8 sm:px-6 lg:px-8">
        <aside className="sticky top-24 hidden h-[calc(100vh-7rem)] w-72 shrink-0 lg:block">
          <div className="glass-panel flex h-full flex-col rounded-lg p-4">
            <div className="mb-6 rounded-lg bg-white p-4 text-primary-900">
              <p className="text-xs font-black">Admin OS</p>
              <p className="mt-1 text-xl font-black">پنل مدیریتی حرفه‌ای</p>
            </div>
            <nav className="space-y-2">
              {adminLinks.map((item, index) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={`/${locale}/admin${item.href}`}
                    className={cn(
                      'flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-bold transition',
                      index === 0 ? 'bg-white text-primary-900' : 'text-slate-300 hover:bg-white/10 hover:text-white',
                    )}
                  >
                    <Icon className="h-5 w-5" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
            <div className="mt-auto rounded-lg border border-white/10 bg-white/[0.06] p-4">
              <ShieldCheck className="mb-3 h-6 w-6" />
              <p className="font-black">دسترسی ادمین</p>
              <p className="mt-2 text-sm leading-6 text-slate-300">APIهای مدیریتی با allowlist ایمیل ادمین محافظت می‌شوند.</p>
            </div>
          </div>
        </aside>

        <main className="min-w-0 flex-1">
          <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className="mb-8 flex flex-col justify-between gap-5 xl:flex-row xl:items-end">
            <div>
              <h1 className="text-4xl font-black leading-tight md:text-5xl">پنل مدیریتی مشاور پورتفو</h1>
              <p className="mt-3 max-w-3xl text-slate-300">کنترل کاربران، پلن‌ها، تحلیل‌ها، تخفیف‌ها و گزارش‌های درآمدی در یک سطح مدیریتی یکپارچه.</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link href={`/${locale}/admin/analyses/new`}>
                <Button rightIcon={<Plus className="h-4 w-4" />}>تحلیل جدید</Button>
              </Link>
              <Link href={`/${locale}/admin/users/new`}>
                <Button variant="outline">کاربر جدید</Button>
              </Link>
            </div>
          </motion.div>

          <section className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
            <AdminKpi icon={<Users />} label="کل کاربران" value={formatFaNumber(stats.users)} detail="رشد ۱۲٪ ماهانه" />
            <AdminKpi icon={<CreditCard />} label="اشتراک‌های فعال" value={formatFaNumber(stats.activeSubscriptions)} detail="تمدید خودکار فعال" />
            <AdminKpi icon={<WalletCards />} label="درآمد ماهانه" value={`${formatFaNumber(stats.monthlyRevenue)} دلار`} detail="تراکنش موفق" />
            <AdminKpi icon={<FileText />} label="تحلیل‌های فعال" value={formatFaNumber(stats.activeAnalyses)} detail="منتشر شده" />
          </section>

          <section className="mb-6 grid grid-cols-1 gap-6 xl:grid-cols-[1.2fr_0.8fr]">
            <Card className="p-0">
              <div className="border-b border-white/10 p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-black">فعالیت کاربران</h2>
                    <p className="mt-1 text-sm text-slate-400">آخرین ثبت‌نام‌ها و وضعیت احراز</p>
                  </div>
                  <Link href={`/${locale}/admin/users`}>
                    <Button variant="ghost">مشاهده کاربران</Button>
                  </Link>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[620px]">
                  <thead className="text-xs text-slate-400">
                    <tr className="border-b border-white/10">
                      <th className="px-5 py-4 text-right">کاربر</th>
                      <th className="px-5 py-4 text-right">عضویت</th>
                      <th className="px-5 py-4 text-right">وضعیت</th>
                      <th className="px-5 py-4 text-right">عملیات</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentUsers.map((user) => (
                      <tr key={user.id} className="border-b border-white/10 last:border-0 hover:bg-white/[0.04]">
                        <td className="px-5 py-4">
                          <p className="font-black">{user.name}</p>
                          <p className="mt-1 text-xs text-slate-400">{user.email}</p>
                        </td>
                        <td className="px-5 py-4 text-sm text-slate-300">{formatFaDate(user.createdAt)}</td>
                        <td className="px-5 py-4">
                          <span className={cn('rounded-lg px-3 py-1 text-xs font-black', user.verified ? 'bg-white text-primary-900' : 'bg-white/10 text-slate-200')}>
                            {user.verified ? 'تایید شده' : 'در انتظار'}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <Link href={`/${locale}/admin/users/${user.id}`} className="text-sm font-bold text-white/80 hover:text-white">
                            ویرایش
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>

            <Card className="p-5">
              <div className="mb-5 flex items-center justify-between">
                <h2 className="text-2xl font-black">وضعیت عملیات</h2>
                <Activity className="h-5 w-5" />
              </div>
              <div className="space-y-4">
                {operations.map((item) => (
                  <div key={item.label} className="rounded-lg border border-white/10 bg-white/[0.05] p-4">
                    <div className="mb-3 flex items-center justify-between">
                      <p className="font-black">{item.label}</p>
                      <span className="rounded-lg bg-white px-2 py-1 text-xs font-black text-primary-900">{item.status}</span>
                    </div>
                    <p className="text-2xl font-black">{item.value}</p>
                  </div>
                ))}
              </div>
            </Card>
          </section>

          <section className="grid grid-cols-1 gap-6 xl:grid-cols-3">
            <Card className="p-5 xl:col-span-2">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-black">مسیرهای مدیریتی جدید</h2>
                  <p className="mt-1 text-sm text-slate-400">APIهایی که برای بک‌اند کامل اضافه و استاندارد شدند</p>
                </div>
                <Gauge className="h-6 w-6" />
              </div>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                {[
                  '/api/admin/stats',
                  '/api/admin/reports',
                  '/api/admin/discounts',
                  '/api/subscription-plans/[id]',
                  '/api/markets/[slug]',
                  '/api/portfolio/[id]',
                ].map((route) => (
                  <code key={route} className="rounded-lg border border-white/10 bg-black/20 px-4 py-3 text-sm text-primary-100">
                    {route}
                  </code>
                ))}
              </div>
            </Card>

            <Card className="p-5">
              <Bell className="mb-4 h-7 w-7" />
              <h2 className="text-2xl font-black">اعلان مدیریتی</h2>
              <p className="mt-3 text-sm leading-7 text-slate-300">برای فعال‌سازی دسترسی ادمین در محیط production، ایمیل مدیر را در `ADMIN_EMAILS` قرار بدهید.</p>
              <Link href={`/${locale}/admin/reports`}>
                <Button className="mt-6 w-full">گزارش‌های مالی</Button>
              </Link>
            </Card>
          </section>
        </main>
      </div>
    </div>
  );
}

function AdminKpi({ icon, label, value, detail }: { icon: React.ReactNode; label: string; value: string; detail: string }) {
  return (
    <Card className="p-5">
      <div className="mb-4 flex items-center justify-between">
        <div className="rounded-lg bg-white/10 p-3 [&_svg]:h-5 [&_svg]:w-5">{icon}</div>
        <span className="rounded-lg bg-white px-2 py-1 text-xs font-black text-primary-900">زنده</span>
      </div>
      <p className="text-sm font-bold text-slate-400">{label}</p>
      <p className="mt-2 text-2xl font-black text-white">{value}</p>
      <p className="mt-2 text-xs text-slate-500">{detail}</p>
    </Card>
  );
}
