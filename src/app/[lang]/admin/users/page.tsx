'use client';

import { useEffect, useState } from 'react';
import { Header, Card, CardHeader, CardContent, Button, Badge, Input } from '@/components';
import { useLocale } from '@/components/LocaleProvider';
import { getAuthHeaders, getStoredUser } from '@/lib/clientAuth';
import { formatFaDate, formatFaNumber } from '@/lib/format';
import Link from 'next/link';
import { Search, UserPlus, Users } from 'lucide-react';

interface AdminUser {
  id: string;
  name: string | null;
  email: string;
  phone?: string | null;
  country: string | null;
  verified: boolean;
  phoneVerified?: boolean;
  identityStatus?: string | null;
  createdAt: string;
}

export default function UsersManagementPage() {
  const { locale } = useLocale();
  const currentUser = getStoredUser();
  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch('/api/admin/users', {
          headers: getAuthHeaders(),
        });
        const result = await response.json();

        if (!response.ok) {
          setError('امکان بارگذاری کاربران وجود ندارد.');
          return;
        }

        setUsers(result.data.users || []);
      } catch {
        setError('امکان بارگذاری کاربران وجود ندارد.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const filteredUsers = users.filter((user) =>
    `${user.name ?? ''} ${user.email}`.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#160022] text-white">
      <Header isAuthenticated={true} userName={currentUser?.name || 'مدیر'} />

      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <div>
            <div className="mb-4 inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.06] px-3 py-2 text-sm font-bold text-primary-100">
              <Users className="h-4 w-4" />
              مدیریت کاربران
            </div>
            <h1 className="text-4xl font-black leading-tight md:text-5xl">کاربران</h1>
            <p className="mt-3 max-w-2xl text-slate-300">وضعیت حساب، احراز ایمیل، موبایل و اطلاعات هویتی کاربران را بررسی کنید.</p>
          </div>
          <Link href={`/${locale}/admin/users/new`}>
            <Button rightIcon={<UserPlus className="h-4 w-4" />}>افزودن کاربر</Button>
          </Link>
        </div>

        {error && (
          <Card className="mb-6 border border-red-300/30 bg-red-500/10">
            <CardContent>
              <p className="font-bold text-red-100">{error}</p>
            </CardContent>
          </Card>
        )}

        <Card className="mb-8 p-5">
          <CardContent className="pt-6">
            <Input
              placeholder="جستجوی کاربر بر اساس نام یا ایمیل..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              icon={<Search className="h-4 w-4" />}
            />
          </CardContent>
        </Card>

        <Card className="p-6">
          <CardHeader title="همه کاربران" subtitle={`مجموع: ${formatFaNumber(filteredUsers.length)} کاربر`} />
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[920px] text-sm">
                <thead className="border-b border-white/10 text-slate-400">
                  <tr>
                    <th className="px-4 py-3 text-right font-bold">نام</th>
                    <th className="px-4 py-3 text-right font-bold">ایمیل</th>
                    <th className="px-4 py-3 text-right font-bold">موبایل</th>
                    <th className="px-4 py-3 text-right font-bold">کشور</th>
                    <th className="px-4 py-3 text-right font-bold">عضویت</th>
                    <th className="px-4 py-3 text-center font-bold">ایمیل</th>
                    <th className="px-4 py-3 text-center font-bold">موبایل</th>
                    <th className="px-4 py-3 text-center font-bold">هویت</th>
                    <th className="px-4 py-3 text-center font-bold">عملیات</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    <tr>
                      <td colSpan={9} className="py-8 text-center text-slate-300">
                        در حال بارگذاری کاربران...
                      </td>
                    </tr>
                  ) : filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="py-8 text-center text-slate-300">
                        کاربری پیدا نشد.
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((user) => (
                      <tr key={user.id} className="border-b border-white/10 transition last:border-0 hover:bg-white/[0.05]">
                        <td className="px-4 py-4 font-black text-white">{user.name ?? 'بدون نام'}</td>
                        <td className="px-4 py-4 text-slate-300">{user.email}</td>
                        <td className="px-4 py-4 text-slate-300">{user.phone || 'ثبت نشده'}</td>
                        <td className="px-4 py-4 text-slate-300">{user.country ?? 'ثبت نشده'}</td>
                        <td className="px-4 py-4 text-slate-300">{formatFaDate(user.createdAt)}</td>
                        <td className="px-4 py-4 text-center">
                          <Badge variant={user.verified ? 'success' : 'warning'}>
                            {user.verified ? 'تایید شده' : 'در انتظار'}
                          </Badge>
                        </td>
                        <td className="px-4 py-4 text-center">
                          <Badge variant={user.phoneVerified ? 'success' : 'warning'}>
                            {user.phoneVerified ? 'تایید شده' : 'در انتظار'}
                          </Badge>
                        </td>
                        <td className="px-4 py-4 text-center">
                          <Badge variant={user.identityStatus === 'verified' ? 'success' : user.identityStatus === 'rejected' ? 'danger' : 'warning'}>
                            {user.identityStatus === 'verified' ? 'تایید شده' : user.identityStatus === 'rejected' ? 'رد شده' : 'در انتظار'}
                          </Badge>
                        </td>
                        <td className="px-4 py-4 text-center">
                          <Link href={`/${locale}/admin/users/${user.id}`}>
                            <Button size="sm" variant="outline">
                              ویرایش
                            </Button>
                          </Link>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
