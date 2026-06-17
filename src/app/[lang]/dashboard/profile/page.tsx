'use client';

import { useEffect, useState } from 'react';
import { Header, Card, CardHeader, CardContent, Button } from '@/components';
import { useLocale } from '@/components/LocaleProvider';
import { getStoredUser } from '@/lib/clientAuth';
import { apiGet, apiPut } from '@/lib/apiClient';
import { Input, Textarea, Select, FormGroup } from '@/components/Form';
import Link from 'next/link';

export default function ProfilePage() {
  const { locale } = useLocale();
  const currentUser = getStoredUser();
  const [profile, setProfile] = useState({
    name: currentUser?.name || '',
    email: currentUser?.email || '',
    phone: '',
    country: '',
    bio: '',
    riskTolerance: 'moderate',
    investmentGoal: 'long-term-growth',
    preferredNotification: 'email',
  });

  const [isEditing, setIsEditing] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    apiGet<{ user: { name?: string | null; email: string; phone?: string | null; country?: string | null } }>('/api/users/profile', true)
      .then((data) => {
        setProfile((current) => ({
          ...current,
          name: data.user.name || '',
          email: data.user.email,
          phone: data.user.phone || '',
          country: data.user.country || '',
        }));
      })
      .catch((error) => setMessage(error instanceof Error ? error.message : 'بارگذاری پروفایل ممکن نشد.'));
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    try {
      const data = await apiPut<{ user: { name?: string | null; email: string; phone?: string | null; country?: string | null } }>('/api/users/profile', {
        name: profile.name,
        phone: profile.phone,
        country: profile.country,
      }, true);
      setProfile((current) => ({
        ...current,
        name: data.user.name || '',
        email: data.user.email,
        phone: data.user.phone || '',
        country: data.user.country || '',
      }));
      setMessage('پروفایل با موفقیت به‌روزرسانی شد.');
      setIsEditing(false);
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'به‌روزرسانی پروفایل ممکن نشد.');
    }
  };

  return (
    <div className="min-h-screen bg-secondary-50">
      <Header isAuthenticated={true} userName={profile.name} />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-bold text-secondary-900">تنظیمات پروفایل</h1>
          <Link href={`/${locale}/dashboard`}>
            <Button variant="outline">بازگشت به داشبورد</Button>
          </Link>
        </div>

        {message && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-800">{message}</p>
          </div>
        )}

        {/* Profile Information */}
        <Card className="mb-8">
          <CardHeader
            title="اطلاعات شخصی"
            action={
              <Button size="sm" variant={isEditing ? 'outline' : 'primary'} onClick={() => setIsEditing(!isEditing)}>
                {isEditing ? 'لغو' : 'ویرایش'}
              </Button>
            }
          />
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormGroup label="نام و نام خانوادگی">
                <Input
                  name="name"
                  value={profile.name}
                  onChange={handleChange}
                  disabled={!isEditing}
                  placeholder="نام کامل شما"
                />
              </FormGroup>

              <FormGroup label="نشانی ایمیل">
                <Input
                  name="email"
                  type="email"
                  value={profile.email}
                  onChange={handleChange}
                  disabled
                  placeholder="ایمیل شما"
                />
              </FormGroup>

              <FormGroup label="شماره تماس">
                <Input
                  name="phone"
                  type="tel"
                  value={profile.phone}
                  onChange={handleChange}
                  disabled={!isEditing}
                  placeholder="شماره تماس"
                />
              </FormGroup>

              <FormGroup label="کشور">
                <Input
                  name="country"
                  value={profile.country}
                  onChange={handleChange}
                  disabled={!isEditing}
                  placeholder="کشور شما"
                />
              </FormGroup>
            </div>

            <FormGroup label="معرفی کوتاه">
              <Textarea
                name="bio"
                value={profile.bio}
                onChange={handleChange}
                disabled={!isEditing}
                placeholder="درباره خودتان بنویسید..."
                rows={4}
              />
            </FormGroup>

            {isEditing && (
              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => setIsEditing(false)}>
                  لغو
                </Button>
                <Button onClick={handleSave}>ذخیره تغییرات</Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Investment Preferences */}
        <Card className="mb-8">
          <CardHeader title="ترجیحات سرمایه‌گذاری" />
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormGroup label="میزان ریسک‌پذیری">
                <Select
                  name="riskTolerance"
                  value={profile.riskTolerance}
                  onChange={handleChange}
                  options={[
                    { label: 'محافظه‌کار', value: 'conservative' },
                    { label: 'متعادل', value: 'moderate' },
                    { label: 'تهاجمی', value: 'aggressive' },
                  ]}
                />
              </FormGroup>

              <FormGroup label="هدف سرمایه‌گذاری">
                <Select
                  name="investmentGoal"
                  value={profile.investmentGoal}
                  onChange={handleChange}
                  options={[
                    { label: 'حفظ سرمایه', value: 'capital-preservation' },
                    { label: 'کسب درآمد', value: 'income-generation' },
                    { label: 'رشد بلندمدت', value: 'long-term-growth' },
                    { label: 'رشد پرریسک', value: 'aggressive-growth' },
                  ]}
                />
              </FormGroup>
            </div>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card className="mb-8">
          <CardHeader title="ترجیحات اعلان‌ها" />
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-secondary-50 rounded-lg">
                <label className="font-medium text-secondary-900">هشدارهای قیمت</label>
                <input type="checkbox" defaultChecked className="w-4 h-4" />
              </div>
              <div className="flex items-center justify-between p-3 bg-secondary-50 rounded-lg">
                <label className="font-medium text-secondary-900">به‌روزرسانی تحلیل‌ها</label>
                <input type="checkbox" defaultChecked className="w-4 h-4" />
              </div>
              <div className="flex items-center justify-between p-3 bg-secondary-50 rounded-lg">
                <label className="font-medium text-secondary-900">اخبار بازار</label>
                <input type="checkbox" className="w-4 h-4" />
              </div>
              <div className="flex items-center justify-between p-3 bg-secondary-50 rounded-lg">
                <label className="font-medium text-secondary-900">به‌روزرسانی اشتراک</label>
                <input type="checkbox" defaultChecked className="w-4 h-4" />
              </div>
            </div>

            <FormGroup label="روش دریافت اعلان">
              <Select
                name="preferredNotification"
                value={profile.preferredNotification}
                onChange={handleChange}
                options={[
                  { label: 'ایمیل', value: 'email' },
                  { label: 'پیامک', value: 'sms' },
                  { label: 'درون برنامه', value: 'in-app' },
                  { label: 'همه موارد', value: 'all' },
                ]}
              />
            </FormGroup>
          </CardContent>
        </Card>

        {/* Account Actions */}
        <Card>
          <CardHeader title="مدیریت حساب" />
          <CardContent className="space-y-3">
            <div className="flex flex-col gap-2">
              <p className="rounded-lg bg-secondary-50 p-4 text-sm text-secondary-700">
                تغییر ایمیل، بازیابی رمز عبور، تاریخچه ورود و احراز هویت دومرحله‌ای پیش از فعال‌سازی امن به اتصال کامل ارائه‌دهنده احراز هویت نیاز دارند.
              </p>
              <Button variant="danger" fullWidth>
                حذف حساب
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
