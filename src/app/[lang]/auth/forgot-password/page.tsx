'use client';

import { AuthExperience, Button, Input } from '@/components';
import { useLocale } from '@/components/LocaleProvider';
import { Mail, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const { locale } = useLocale();
  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};
    if (!email.trim()) newErrors.email = 'وارد کردن ایمیل الزامی است';
    else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = 'ایمیل وارد شده معتبر نیست';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      setIsLoading(true);
      setErrors({});
      const response = await fetch('/api/auth/reset-password?action=request-reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const payload = await response.json();

      if (!response.ok) {
        setErrors({ email: payload.error || 'درخواست بازنشانی ناموفق بود' });
        return;
      }

      setResetSent(true);
      setMessage(payload.data?.message || 'درخواست بازنشانی ارسال شد.');
      if (payload.data?.token) {
        setToken(payload.data.token);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};
    if (!email.trim()) newErrors.email = 'وارد کردن ایمیل الزامی است';
    if (!token.trim()) newErrors.token = 'کد بازیابی الزامی است';
    if (!password.trim()) newErrors.password = 'وارد کردن رمز عبور الزامی است';
    if (password.length < 8) newErrors.password = 'رمز عبور باید حداقل ۸ کاراکتر باشد';
    if (!confirmPassword.trim()) newErrors.confirmPassword = 'تکرار رمز عبور الزامی است';
    else if (password !== confirmPassword) newErrors.confirmPassword = 'تکرار رمز عبور با رمز عبور یکسان نیست';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      setIsLoading(true);
      setErrors({});
      const response = await fetch('/api/auth/reset-password?action=reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, token, password, confirmPassword }),
      });
      const payload = await response.json();

      if (!response.ok) {
        setErrors({ token: payload.error || 'بازیابی رمز عبور ناموفق بود' });
        return;
      }

      setMessage(payload.data?.message || 'رمز عبور با موفقیت تغییر کرد.');
      setTimeout(() => router.push(`/${locale}/auth/login`), 1200);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthExperience title="فراموشی رمز عبور" subtitle="ایمیل خود را وارد کنید تا کد بازیابی برایتان ارسال شود و رمز عبور را مجدداً تنظیم کنید.">
      <div className="space-y-6 [&_label]:!text-slate-200 [&_.text-secondary-500]:!text-slate-400">
        {!resetSent ? (
          <form onSubmit={handleRequestReset} className="space-y-4">
            <Input
              label="نشانی ایمیل"
              type="email"
              name="email"
              placeholder="ایمیل شما"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={errors.email}
              icon={<Mail className="h-4 w-4" />}
              className="border-white/10 bg-white/95"
            />

            <Button fullWidth size="lg" isLoading={isLoading} className="h-[3.25rem] bg-cyan-50 text-slate-950 hover:bg-white">
              ارسال کد بازیابی
            </Button>
          </form>
        ) : (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <Input
              label="نشانی ایمیل"
              type="email"
              name="email"
              placeholder="ایمیل شما"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={errors.email}
              icon={<Mail className="h-4 w-4" />}
              className="border-white/10 bg-white/95"
            />

            <Input
              label="کد بازیابی"
              type="text"
              name="token"
              placeholder="کد دریافتی"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              error={errors.token}
              icon={<ShieldCheck className="h-4 w-4" />}
              className="border-white/10 bg-white/95"
            />

            <Input
              label="رمز عبور جدید"
              type="password"
              name="password"
              placeholder="رمز عبور جدید"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={errors.password}
              className="border-white/10 bg-white/95"
            />

            <Input
              label="تکرار رمز عبور جدید"
              type="password"
              name="confirmPassword"
              placeholder="تکرار رمز عبور جدید"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              error={errors.confirmPassword}
              className="border-white/10 bg-white/95"
            />

            <Button fullWidth size="lg" isLoading={isLoading} className="h-[3.25rem] bg-cyan-50 text-slate-950 hover:bg-white">
              تغییر رمز عبور
            </Button>
          </form>
        )}

        {message && (
          <div className="rounded-lg border border-emerald-400/30 bg-emerald-500/10 p-3 text-sm font-medium text-emerald-200">
            {message}
          </div>
        )}

        <div className="text-center text-sm text-slate-300">
          <Link href={`/${locale}/auth/login`} className="font-medium text-cyan-200 hover:text-white">
            بازگشت به صفحه ورود
          </Link>
        </div>
      </div>
    </AuthExperience>
  );
}
