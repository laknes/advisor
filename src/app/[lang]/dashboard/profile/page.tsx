'use client';

import { useEffect, useState } from 'react';
import { Header, Card, CardHeader, CardContent, Button, Badge } from '@/components';
import { useLocale } from '@/components/LocaleProvider';
import { getStoredToken, getStoredUser, storeAuth } from '@/lib/clientAuth';
import { apiGet, apiPost, apiPut } from '@/lib/apiClient';
import { formatFaDate } from '@/lib/format';
import { Input, Textarea, Select, FormGroup } from '@/components/Form';
import Link from 'next/link';
import { CheckCircle2, IdCard, Mail, Phone, ShieldCheck } from 'lucide-react';

interface ProfileUser {
  id?: string;
  name?: string | null;
  email: string;
  phone?: string | null;
  phoneVerified?: boolean;
  country?: string | null;
  verified?: boolean;
  nationalId?: string | null;
  birthDate?: string | Date | null;
  address?: string | null;
  identityStatus?: string | null;
}

const identityStatusLabel: Record<string, string> = {
  incomplete: 'ناقص',
  pending: 'در انتظار بررسی',
  verified: 'تایید شده',
  rejected: 'رد شده',
};

export default function ProfilePage() {
  const { locale } = useLocale();
  const currentUser = getStoredUser();
  const [profile, setProfile] = useState({
    name: currentUser?.name || '',
    email: currentUser?.email || '',
    phone: '',
    phoneVerified: false,
    country: '',
    verified: false,
    nationalId: '',
    birthDate: '',
    address: '',
    identityStatus: 'incomplete',
    bio: '',
    riskTolerance: 'moderate',
    investmentGoal: 'long-term-growth',
    preferredNotification: 'email',
  });

  const [isEditing, setIsEditing] = useState(false);
  const [message, setMessage] = useState('');
  const [phoneOtpCode, setPhoneOtpCode] = useState('');
  const [phoneDevCode, setPhoneDevCode] = useState('');
  const [isOtpLoading, setIsOtpLoading] = useState(false);

  useEffect(() => {
    apiGet<{ user: ProfileUser }>('/api/users/profile', true)
      .then((data) => {
        setProfile((current) => ({
          ...current,
          name: data.user.name || '',
          email: data.user.email,
          phone: data.user.phone || '',
          phoneVerified: Boolean(data.user.phoneVerified),
          country: data.user.country || '',
          verified: Boolean(data.user.verified),
          nationalId: data.user.nationalId || '',
          birthDate: data.user.birthDate ? new Date(data.user.birthDate).toISOString().slice(0, 10) : '',
          address: data.user.address || '',
          identityStatus: data.user.identityStatus || 'incomplete',
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
      const data = await apiPut<{ user: ProfileUser }>('/api/users/profile', {
        name: profile.name,
        phone: profile.phone,
        country: profile.country,
        nationalId: profile.nationalId,
        birthDate: profile.birthDate,
        address: profile.address,
      }, true);
      setProfile((current) => ({
        ...current,
        name: data.user.name || '',
        email: data.user.email,
        phone: data.user.phone || '',
        phoneVerified: Boolean(data.user.phoneVerified),
        country: data.user.country || '',
        verified: Boolean(data.user.verified),
        nationalId: data.user.nationalId || '',
        birthDate: data.user.birthDate ? new Date(data.user.birthDate).toISOString().slice(0, 10) : '',
        address: data.user.address || '',
        identityStatus: data.user.identityStatus || 'incomplete',
      }));
      setMessage('پروفایل با موفقیت به‌روزرسانی شد.');
      const token = getStoredToken();
      if (token) {
        storeAuth(token, {
          id: data.user.id || currentUser?.id,
          email: data.user.email,
          name: data.user.name,
          phone: data.user.phone,
          phoneVerified: data.user.phoneVerified,
          isAdmin: currentUser?.isAdmin,
        });
      }
      setIsEditing(false);
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'به‌روزرسانی پروفایل ممکن نشد.');
    }
  };

  const requestPhoneOtp = async () => {
    if (!profile.phone.trim()) {
      setMessage('ابتدا شماره موبایل را وارد و ذخیره کنید.');
      return;
    }

    try {
      setIsOtpLoading(true);
      const data = await apiPost<{ otp: { devCode?: string } }>('/api/auth?action=request-otp', {
        phone: profile.phone,
        purpose: 'verify_phone',
      }, true);
      setPhoneDevCode(data.otp.devCode || '');
      setMessage('کد تایید شماره موبایل ارسال شد.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'ارسال کد تایید ناموفق بود.');
    } finally {
      setIsOtpLoading(false);
    }
  };

  const verifyPhoneOtp = async () => {
    if (!phoneOtpCode.trim()) {
      setMessage('کد تایید را وارد کنید.');
      return;
    }

    try {
      setIsOtpLoading(true);
      const data = await apiPost<{ user: ProfileUser; token: string }>('/api/auth?action=verify-otp', {
        phone: profile.phone,
        code: phoneOtpCode,
        purpose: 'verify_phone',
      }, true);
      setProfile((current) => ({
        ...current,
        phone: data.user.phone || current.phone,
        phoneVerified: Boolean(data.user.phoneVerified),
      }));
      setPhoneOtpCode('');
      setPhoneDevCode('');
      storeAuth(data.token, {
        id: data.user.id || currentUser?.id,
        email: data.user.email,
        name: data.user.name,
        phone: data.user.phone,
        phoneVerified: data.user.phoneVerified,
        isAdmin: currentUser?.isAdmin,
      });
      setMessage('شماره موبایل با موفقیت تایید شد.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'تایید شماره موبایل ناموفق بود.');
    } finally {
      setIsOtpLoading(false);
    }
  };

  return (
    <div className="profile-page min-h-screen bg-[#160022] text-white">
      <Header isAuthenticated={true} userName={profile.name} />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8 flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <div>
            <h1 className="text-4xl font-black leading-tight md:text-5xl">تنظیمات پروفایل</h1>
            <p className="mt-3 text-slate-300">برای تهیه اشتراک، ایمیل، موبایل و مشخصات شناسایی باید تکمیل و تایید شوند.</p>
          </div>
          <Link href={`/${locale}/dashboard`}>
            <Button variant="outline">بازگشت به داشبورد</Button>
          </Link>
        </div>

        {message && (
          <div className="mb-6 rounded-lg border border-primary-100/30 bg-primary-100/10 p-4">
            <p className="font-bold text-primary-100">{message}</p>
          </div>
        )}

        <Card className="mb-8 p-6">
          <CardHeader title="وضعیت احراز حساب" />
          <CardContent>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <VerificationTile icon={<Mail />} label="ایمیل" verified={profile.verified} detail={profile.email} />
              <VerificationTile icon={<Phone />} label="موبایل" verified={profile.phoneVerified} detail={profile.phone || 'شماره موبایل ثبت نشده'} />
              <VerificationTile
                icon={<IdCard />}
                label="مشخصات شناسایی"
                verified={profile.identityStatus === 'verified'}
                detail={identityStatusLabel[profile.identityStatus] || 'ناقص'}
              />
            </div>
          </CardContent>
        </Card>

        {/* Profile Information */}
        <Card className="mb-8 p-6">
          <CardHeader
            title="اطلاعات شخصی"
            action={
              <Button size="sm" variant={isEditing ? 'outline' : 'primary'} onClick={() => setIsEditing(!isEditing)}>
                {isEditing ? 'لغو' : 'ویرایش'}
              </Button>
            }
          />
          <CardContent className="space-y-6 [&_label]:text-slate-200">
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
                <div className="mt-3 rounded-lg border border-white/10 bg-white/[0.05] p-3">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                    <Button
                      type="button"
                      size="sm"
                      variant="secondary"
                      isLoading={isOtpLoading}
                      onClick={requestPhoneOtp}
                      leftIcon={<Phone className="h-4 w-4" />}
                      className="h-10 shrink-0"
                    >
                      ارسال کد تایید
                    </Button>
                    <div className="flex flex-1 gap-2">
                      <input
                        value={phoneOtpCode}
                        onChange={(event) => setPhoneOtpCode(event.target.value)}
                        inputMode="numeric"
                        placeholder="کد تایید"
                        className="h-10 min-w-0 flex-1 rounded-lg border border-white/10 bg-white px-3 text-sm font-bold text-secondary-900 outline-none"
                      />
                      <Button type="button" size="sm" onClick={verifyPhoneOtp} isLoading={isOtpLoading} leftIcon={<ShieldCheck className="h-4 w-4" />} className="h-10 shrink-0">
                        تایید
                      </Button>
                    </div>
                  </div>
                  {phoneDevCode && <p className="mt-2 text-xs font-bold text-cyan-200">کد تست: {phoneDevCode}</p>}
                </div>
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormGroup label="کد ملی / شناسه هویتی">
                <Input
                  name="nationalId"
                  value={profile.nationalId}
                  onChange={handleChange}
                  disabled={!isEditing}
                  placeholder="کد ملی یا شناسه رسمی"
                />
              </FormGroup>

              <FormGroup label="تاریخ تولد">
                <Input
                  name="birthDate"
                  type="date"
                  value={profile.birthDate}
                  onChange={handleChange}
                  disabled={!isEditing}
                />
              </FormGroup>
            </div>

            <FormGroup label="نشانی محل سکونت">
              <Textarea
                name="address"
                value={profile.address}
                onChange={handleChange}
                disabled={!isEditing}
                placeholder="نشانی کامل محل سکونت"
                rows={3}
              />
            </FormGroup>

            {profile.identityStatus !== 'incomplete' && (
              <p className="rounded-lg border border-white/10 bg-white/[0.05] p-4 text-sm leading-7 text-slate-300">
                وضعیت بررسی هویت: <span className="font-black text-white">{identityStatusLabel[profile.identityStatus] || profile.identityStatus}</span>
                {profile.birthDate ? ` | تاریخ تولد: ${formatFaDate(profile.birthDate)}` : ''}
              </p>
            )}

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
        <Card className="mb-8 p-6">
          <CardHeader title="ترجیحات سرمایه‌گذاری" />
          <CardContent className="space-y-6 [&_label]:text-slate-200">
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
          <CardContent className="space-y-4 [&_label]:text-slate-200">
            <div className="space-y-3">
              <div className="flex items-center justify-between rounded-lg border border-white/10 bg-white/[0.05] p-3">
                <label className="font-medium text-white">هشدارهای قیمت</label>
                <input type="checkbox" defaultChecked className="w-4 h-4" />
              </div>
              <div className="flex items-center justify-between rounded-lg border border-white/10 bg-white/[0.05] p-3">
                <label className="font-medium text-white">به‌روزرسانی تحلیل‌ها</label>
                <input type="checkbox" defaultChecked className="w-4 h-4" />
              </div>
              <div className="flex items-center justify-between rounded-lg border border-white/10 bg-white/[0.05] p-3">
                <label className="font-medium text-white">اخبار بازار</label>
                <input type="checkbox" className="w-4 h-4" />
              </div>
              <div className="flex items-center justify-between rounded-lg border border-white/10 bg-white/[0.05] p-3">
                <label className="font-medium text-white">به‌روزرسانی اشتراک</label>
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
        <Card className="p-6">
          <CardHeader title="مدیریت حساب" />
          <CardContent className="space-y-3">
            <div className="flex flex-col gap-2">
              <p className="rounded-lg border border-white/10 bg-white/[0.05] p-4 text-sm text-slate-300">
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

function VerificationTile({
  icon,
  label,
  verified,
  detail,
}: {
  icon: React.ReactNode;
  label: string;
  verified: boolean;
  detail: string;
}) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/[0.05] p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-primary-100 [&_svg]:h-5 [&_svg]:w-5">{icon}<span className="font-black text-white">{label}</span></div>
        <Badge variant={verified ? 'success' : 'warning'}>{verified ? 'تایید شده' : 'نیازمند تایید'}</Badge>
      </div>
      <p className="text-sm leading-6 text-slate-300">{detail}</p>
      {verified && <CheckCircle2 className="mt-3 h-5 w-5 text-primary-100" />}
    </div>
  );
}
