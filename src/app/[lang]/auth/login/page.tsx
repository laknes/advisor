'use client';

import { AuthExperience, Button, Input, FormGroup, SocialAuthButtons } from '@/components';
import { useLocale } from '@/components/LocaleProvider';
import { usePublicSettings } from '@/components/usePublicSettings';
import { storeAuth } from '@/lib/clientAuth';
import { LockKeyhole, Mail, Phone, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function LoginPage() {
  const router = useRouter();
  const { locale } = useLocale();
  const settings = usePublicSettings();
  const otpEnabled = settings.otp_enabled !== false;
  const [mode, setMode] = useState<'password' | 'otp'>('password');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false,
  });
  const [otpForm, setOtpForm] = useState({
    phone: '',
    code: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [devCode, setDevCode] = useState('');
  const [otpMessage, setOtpMessage] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);

  useEffect(() => {
    if (resendCooldown <= 0) return;

    const timer = setInterval(() => {
      setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, [resendCooldown]);

  const cooldownLabel = `${String(Math.floor(resendCooldown / 60)).padStart(2, '0')}:${String(resendCooldown % 60).padStart(2, '0')}`;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleOtpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setOtpForm((prev) => ({
      ...prev,
      [name]: value,
      ...(name === 'phone' ? { code: '' } : {}),
    }));
    if (name === 'phone') {
      setOtpSent(false);
      setDevCode('');
      setOtpMessage('');
      setResendCooldown(0);
    }
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!formData.email) newErrors.email = 'وارد کردن ایمیل الزامی است';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'ایمیل وارد شده معتبر نیست';

    if (!formData.password) newErrors.password = 'وارد کردن رمز عبور الزامی است';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      setIsLoading(true);
      const response = await fetch('/api/auth?action=login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      });
      const payload = await response.json();

      if (!response.ok) {
        setErrors({ password: payload.error || 'ورود ناموفق بود' });
        return;
      }

      storeAuth(payload.data.token, payload.data.user);
      router.push(payload.data.user?.isAdmin ? `/${locale}/admin` : `/${locale}/dashboard`);
    } finally {
      setIsLoading(false);
    }
  };

  const requestOtp = async () => {
    const newErrors: Record<string, string> = {};
    if (!otpForm.phone.trim()) newErrors.phone = 'وارد کردن شماره موبایل الزامی است';
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      setIsLoading(true);
      setOtpMessage('');
      const response = await fetch('/api/auth?action=request-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: otpForm.phone, purpose: 'login' }),
      });
      const payload = await response.json();

      if (!response.ok) {
        setOtpSent(false);
        setDevCode('');
        setOtpMessage('');
        setResendCooldown(0);
        setErrors({ phone: payload.error || 'ارسال کد ناموفق بود' });
        return;
      }

      setOtpSent(true);
      setDevCode(payload.data?.otp?.devCode || '');
      setResendCooldown(payload.data?.otp?.resendAfterSeconds || 60);
      setOtpMessage(`کد یکبار مصرف ارسال شد. اعتبار: ${payload.data?.otp?.expiresInSeconds || 300} ثانیه`);
    } finally {
      setIsLoading(false);
    }
  };

  const verifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};
    if (!otpForm.phone.trim()) newErrors.phone = 'وارد کردن شماره موبایل الزامی است';
    if (!otpForm.code.trim()) newErrors.code = 'وارد کردن کد الزامی است';
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      setIsLoading(true);
      const response = await fetch('/api/auth?action=verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: otpForm.phone, code: otpForm.code, purpose: 'login' }),
      });
      const payload = await response.json();

      if (!response.ok) {
        setErrors({ code: payload.error || 'کد وارد شده معتبر نیست' });
        return;
      }

      storeAuth(payload.data.token, payload.data.user);
      router.push(payload.data.user?.isAdmin ? `/${locale}/admin` : `/${locale}/dashboard`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthExperience title="خوش آمدید" subtitle="وارد اتاق کنترل سرمایه شوید؛ جایی که پورتفو، ریسک و سیگنال‌های بازار در یک مدار زنده کنار هم دیده می‌شوند.">
      <div className="space-y-6 [&_label]:!text-slate-200 [&_.text-secondary-500]:!text-slate-400">
        {otpEnabled && (
          <div className="grid grid-cols-2 rounded-lg border border-white/10 bg-white/[0.06] p-1">
            <button
              type="button"
              onClick={() => {
                setMode('password');
                setErrors({});
              }}
              className={`rounded-md px-3 py-2 text-sm font-black transition ${mode === 'password' ? 'bg-white text-slate-950' : 'text-slate-300 hover:text-white'}`}
            >
              ایمیل
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('otp');
                setErrors({});
              }}
              className={`rounded-md px-3 py-2 text-sm font-black transition ${mode === 'otp' ? 'bg-white text-slate-950' : 'text-slate-300 hover:text-white'}`}
            >
              موبایل
            </button>
          </div>
        )}

        {mode === 'password' ? (
          <form onSubmit={handleSubmit}>
            <FormGroup className="space-y-4">
              <Input
                label="نشانی ایمیل"
                type="email"
                name="email"
                placeholder="ایمیل شما"
                value={formData.email}
                onChange={handleChange}
                error={errors.email}
                icon={<Mail className="h-4 w-4" />}
                className="border-white/10 bg-white/95 shadow-cyan-950/10"
              />

              <Input
                label="رمز عبور"
                type="password"
                name="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                error={errors.password}
                icon={<LockKeyhole className="h-4 w-4" />}
                className="border-white/10 bg-white/95 shadow-cyan-950/10"
              />

              <div className="flex flex-col gap-3 text-sm sm:flex-row sm:items-center sm:justify-between">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="rememberMe"
                    checked={formData.rememberMe}
                    onChange={handleChange}
                    className="h-4 w-4 rounded border-white/20 bg-white/10"
                  />
                  <span className="text-slate-300">مرا به خاطر بسپار</span>
                </label>
                <Link href={`/${locale}/auth/forgot-password`} className="font-medium text-cyan-200 hover:text-white">
                  رمز عبور را فراموش کرده‌اید؟
                </Link>
              </div>

              <Button fullWidth size="lg" isLoading={isLoading} className="h-[3.25rem] bg-cyan-50 text-slate-950 hover:bg-white">
                ورود
              </Button>
            </FormGroup>
          </form>
        ) : (
          <form onSubmit={verifyOtp}>
            <FormGroup className="space-y-4">
              <Input
                label="شماره موبایل"
                type="tel"
                name="phone"
                placeholder="مثلا 09123456789"
                value={otpForm.phone}
                onChange={handleOtpChange}
                error={errors.phone}
                icon={<Phone className="h-4 w-4" />}
                className="border-white/10 bg-white/95 shadow-cyan-950/10"
              />

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-[auto_1fr] sm:items-start">
                <div className="sm:mt-7">
                  <Button
                    type="button"
                    variant="secondary"
                    isLoading={isLoading && !otpSent}
                    disabled={resendCooldown > 0 || !otpForm.phone.trim()}
                    onClick={requestOtp}
                    className="h-[3.25rem] w-full"
                  >
                    {resendCooldown > 0 ? `ارسال مجدد ${cooldownLabel}` : 'ارسال کد'}
                  </Button>
                </div>
                <Input
                  label="کد یکبار مصرف"
                  type="text"
                  inputMode="numeric"
                  name="code"
                  placeholder="کد پیامک شده"
                  value={otpForm.code}
                  onChange={handleOtpChange}
                  error={errors.code}
                  icon={<ShieldCheck className="h-4 w-4" />}
                  className="border-white/10 bg-white/95 shadow-cyan-950/10"
                />
              </div>

              {(otpMessage || devCode) && (
                <div className="rounded-lg border border-white/10 bg-white/[0.08] p-3 text-sm font-bold text-slate-200">
                  {otpMessage}
                  {devCode && <span className="block pt-1 text-cyan-200">کد تست: {devCode}</span>}
                </div>
              )}

              <Button fullWidth size="lg" disabled={!otpSent} isLoading={isLoading && otpSent} className="h-[3.25rem] bg-cyan-50 text-slate-950 hover:bg-white">
                ورود با کد
              </Button>
            </FormGroup>
          </form>
        )}

        <div className="text-center">
          <p className="text-slate-300">
            حساب کاربری ندارید؟{' '}
            <Link href={`/${locale}/auth/signup`} className="font-medium text-cyan-200 hover:text-white">
              ثبت‌نام کنید
            </Link>
          </p>
        </div>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-white/12"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="bg-[#201f35] px-3 text-slate-400">یا ادامه با</span>
          </div>
        </div>

        <SocialAuthButtons />
      </div>
    </AuthExperience>
  );
}
