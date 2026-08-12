'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { Header, Card, CardHeader, CardContent, Button, Input, FormGroup } from '@/components';
import { useLocale } from '@/components/LocaleProvider';
import { getAuthHeaders, getStoredUser } from '@/lib/clientAuth';
import Link from 'next/link';

interface Params {
  params: Promise<{
    id: string;
  }>;
}

export default function EditAdminUserPage({ params: paramsPromise }: Params) {
  const params = use(paramsPromise);
  const router = useRouter();
  const { locale } = useLocale();
  const currentUser = getStoredUser();
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    country: '',
    verified: false,
    phoneVerified: false,
    nationalId: '',
    birthDate: '',
    address: '',
    identityStatus: 'incomplete',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch(`/api/admin/users/${params.id}`, {
          headers: getAuthHeaders(),
        });

        const result = await response.json();

        if (!response.ok) {
          setError('امکان بارگذاری کاربر وجود ندارد.');
          return;
        }

        setForm({
          name: result.data.user.name || '',
          email: result.data.user.email || '',
          phone: result.data.user.phone || '',
          country: result.data.user.country || '',
          verified: result.data.user.verified ?? false,
          phoneVerified: result.data.user.phoneVerified ?? false,
          nationalId: result.data.user.nationalId || '',
          birthDate: result.data.user.birthDate ? new Date(result.data.user.birthDate).toISOString().slice(0, 10) : '',
          address: result.data.user.address || '',
          identityStatus: result.data.user.identityStatus || 'incomplete',
        });
      } catch {
        setError('امکان بارگذاری اطلاعات کاربر وجود ندارد.');
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [params.id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');
    setMessage('در حال ذخیره تغییرات...');

    try {
      const response = await fetch(`/api/admin/users/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
        },
        body: JSON.stringify(form),
      });

      const result = await response.json();

      if (!response.ok) {
        setError('امکان به‌روزرسانی کاربر وجود ندارد.');
        setMessage('');
        return;
      }

      setMessage('اطلاعات کاربر با موفقیت ذخیره شد.');
      setTimeout(() => setMessage(''), 2000);
    } catch {
      setError('امکان به‌روزرسانی کاربر وجود ندارد. دوباره تلاش کنید.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#160022] text-white">
      <Header isAuthenticated={true} userName={currentUser?.name || 'مدیر'} />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-black text-white">ویرایش کاربر</h1>
          <div className="flex gap-3">
            <Link href={`/${locale}/admin/users`}>
              <Button variant="outline">← Back</Button>
            </Link>
          </div>
        </div>

        {loading ? (
          <Card>
            <CardContent>
              <p className="text-slate-300">در حال بارگذاری اطلاعات کاربر...</p>
            </CardContent>
          </Card>
        ) : (
          <>
            {message && (
              <Card className="mb-6 border border-primary-100/30 bg-primary-100/10">
                <CardContent>
                  <p className="font-bold text-primary-100">{message}</p>
                </CardContent>
              </Card>
            )}

            {error && (
              <Card className="mb-6 border border-red-300/30 bg-red-500/10">
                <CardContent>
                  <p className="font-bold text-red-100">{error}</p>
                </CardContent>
              </Card>
            )}

            <Card className="p-6">
              <CardHeader title="اطلاعات کاربر" />
              <CardContent className="space-y-6 [&_label]:text-slate-200">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormGroup label="نام">
                    <Input name="name" value={form.name} onChange={handleChange} placeholder="نام کامل" />
                  </FormGroup>
                  <FormGroup label="ایمیل">
                    <Input name="email" type="email" value={form.email} onChange={handleChange} placeholder="نشانی ایمیل" />
                  </FormGroup>
                  <FormGroup label="شماره موبایل">
                    <Input name="phone" value={form.phone} onChange={handleChange} placeholder="شماره موبایل" />
                  </FormGroup>
                  <FormGroup label="کشور">
                    <Input name="country" value={form.country} onChange={handleChange} placeholder="کشور" />
                  </FormGroup>
                  <FormGroup label="کد ملی / شناسه هویتی">
                    <Input name="nationalId" value={form.nationalId} onChange={handleChange} placeholder="کد ملی یا شناسه رسمی" />
                  </FormGroup>
                  <FormGroup label="تاریخ تولد">
                    <Input name="birthDate" type="date" value={form.birthDate} onChange={handleChange} />
                  </FormGroup>
                  <FormGroup label="نشانی">
                    <Input name="address" value={form.address} onChange={handleChange} placeholder="نشانی کامل" />
                  </FormGroup>
                  <FormGroup label="وضعیت هویت">
                    <select name="identityStatus" value={form.identityStatus} onChange={(event) => setForm((prev) => ({ ...prev, identityStatus: event.target.value }))} className="admin-input">
                      <option value="incomplete">ناقص</option>
                      <option value="pending">در انتظار بررسی</option>
                      <option value="verified">تایید شده</option>
                      <option value="rejected">رد شده</option>
                    </select>
                  </FormGroup>
                </div>

                <label className="flex items-center gap-3">
                  <input type="checkbox" name="verified" checked={form.verified} onChange={handleChange} className="w-4 h-4" />
                  <span className="text-slate-200">ایمیل تایید شده</span>
                </label>

                <label className="flex items-center gap-3">
                  <input type="checkbox" name="phoneVerified" checked={form.phoneVerified} onChange={handleChange} className="w-4 h-4" />
                  <span className="text-slate-200">موبایل تایید شده</span>
                </label>

                <div className="flex justify-end gap-3 pt-4">
                  <Button variant="outline" onClick={() => router.push(`/${locale}/admin/users`)}>
                    لغو
                  </Button>
                  <Button onClick={handleSave} isLoading={saving}>
                    ذخیره تغییرات
                  </Button>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}
