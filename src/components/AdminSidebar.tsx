'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  BarChart3,
  Bug,
  CreditCard,
  FileText,
  LayoutDashboard,
  LifeBuoy,
  Percent,
  Settings,
  ShieldCheck,
  Users,
  WalletCards,
} from 'lucide-react';
import { useLocale } from '@/components/LocaleProvider';
import { cn } from '@/lib/utils';

const adminLinks = [
  { href: '', label: 'مرکز مدیریت', icon: LayoutDashboard },
  { href: '/users', label: 'کاربران', icon: Users },
  { href: '/subscriptions', label: 'اشتراک‌ها', icon: CreditCard },
  { href: '/analyses', label: 'تحلیل‌ها', icon: FileText },
  { href: '/pricing', label: 'پلن‌ها', icon: WalletCards },
  { href: '/discounts', label: 'تخفیف‌ها', icon: Percent },
  { href: '/support', label: 'پشتیبانی', icon: LifeBuoy },
  { href: '/reports', label: 'گزارش‌ها', icon: BarChart3 },
  { href: '/logs', label: 'لاگ‌ها و خطاها', icon: Bug },
  { href: '/settings', label: 'تنظیمات', icon: Settings },
];

export function AdminSidebar() {
  const { locale } = useLocale();
  const pathname = usePathname();

  return (
    <>
      <aside className="fixed right-4 top-28 z-40 hidden h-[calc(100vh-8rem)] w-64 lg:block">
        <div className="glass-panel flex h-full min-h-0 flex-col rounded-lg p-3">
          <div className="mb-4 rounded-lg bg-white/10 p-3 text-white">
            <p className="text-xs font-black text-primary-100">پنل مدیریت</p>
            <p className="mt-1 truncate text-lg font-black">مدیریت سایت</p>
          </div>
          <nav className="min-h-0 flex-1 space-y-2 overflow-y-auto overflow-x-hidden py-1 pr-1">
            {adminLinks.map((item) => {
              const Icon = item.icon;
              const href = `/${locale}/admin${item.href}`;
              const active = isActiveAdminPath(pathname, href, item.href, locale);

              return (
                <Link
                  key={item.href || 'dashboard'}
                  href={href}
                  className={cn(
                    'flex min-h-11 items-center gap-3 rounded-lg px-3 py-3 text-sm font-bold transition',
                    active ? 'bg-white text-primary-900' : 'text-slate-300 hover:bg-white/10 hover:text-white',
                  )}
                >
                  <Icon className="h-5 w-5 shrink-0" />
                  <span className="whitespace-nowrap">{item.label}</span>
                </Link>
              );
            })}
          </nav>
          <div className="mt-3 shrink-0 rounded-lg border border-white/10 bg-white/[0.06] p-3">
            <ShieldCheck className="mb-3 h-6 w-6 text-primary-100" />
            <p className="font-black">دسترسی ادمین</p>
            <p className="mt-2 text-sm leading-6 text-slate-300">APIهای مدیریتی با فهرست مجاز ایمیل ادمین محافظت می‌شوند.</p>
          </div>
        </div>
      </aside>

      <nav className="fixed inset-x-3 bottom-3 z-50 flex gap-2 overflow-x-auto rounded-lg border border-white/10 bg-[color:var(--theme-header)] p-2 shadow-2xl shadow-black/30 backdrop-blur-2xl lg:hidden">
        {adminLinks.map((item) => {
          const Icon = item.icon;
          const href = `/${locale}/admin${item.href}`;
          const active = isActiveAdminPath(pathname, href, item.href, locale);

          return (
            <Link
              key={item.href || 'dashboard-mobile'}
              href={href}
              className={cn(
                'flex min-w-16 flex-col items-center justify-center gap-1 rounded-lg px-3 py-2 text-[11px] font-black transition',
                active ? 'bg-white text-primary-900' : 'text-slate-300 hover:bg-white/10 hover:text-white',
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span className="whitespace-nowrap">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}

function isActiveAdminPath(pathname: string, href: string, suffix: string, locale: string) {
  if (!suffix) {
    return pathname === `/${locale}/admin`;
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}
