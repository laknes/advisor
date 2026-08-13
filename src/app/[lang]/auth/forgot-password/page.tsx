'use client';

import { AuthExperience, Button, Input } from '@/components';
import { useLocale } from '@/components/LocaleProvider';
import { evaluatePasswordPolicy } from '@/lib/passwordPolicy';
import { Mail, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const { locale } = useLocale();
  const isEnglish = locale === 'en';
  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handlePasswordChange = (value: string) => {
    setPassword(value);
    // Real-time password confirmation check
    if (confirmPassword) {
      if (value !== confirmPassword) {
        setErrors((prev) => ({
          ...prev,
          confirmPassword: isEnglish ? 'Password confirmation does not match' : 'تکرار رمز عبور یکسان نیست',
        }));
      } else {
        setErrors((prev) => ({ ...prev, confirmPassword: '' }));
      }
    }
  };

  const handleConfirmPasswordChange = (value: string) => {
    setConfirmPassword(value);
    // Real-time password confirmation check
    if (value) {
      if (password !== value) {
        setErrors((prev) => ({
          ...prev,
          confirmPassword: isEnglish ? 'Password confirmation does not match' : 'تکرار رمز عبور یکسان نیست',
        }));
      } else {
        setErrors((prev) => ({ ...prev, confirmPassword: '' }));
      }
    }
  };
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const passwordPolicy = evaluatePasswordPolicy(password);
  const strengthLabel = isEnglish
    ? (passwordPolicy.score <= 1 ? 'Weak' : passwordPolicy.score === 2 ? 'Fair' : passwordPolicy.score === 3 ? 'Good' : 'Strong')
    : (passwordPolicy.score <= 1 ? 'ضعیف' : passwordPolicy.score === 2 ? 'متوسط' : passwordPolicy.score === 3 ? 'خوب' : 'قوی');

  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};
    if (!email.trim()) newErrors.email = isEnglish ? 'Email is required' : 'وارد کردن ایمیل الزامی است';
    else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = isEnglish ? 'Please enter a valid email' : 'ایمیل وارد شده معتبر نیست';

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
        setErrors({ email: payload.error || (isEnglish ? 'Reset request failed' : 'درخواست بازنشانی ناموفق بود') });
        return;
      }

      setResetSent(true);
      setMessage(payload.data?.message || (isEnglish ? 'Reset request sent.' : 'درخواست بازنشانی ارسال شد.'));
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
    if (!email.trim()) newErrors.email = isEnglish ? 'Email is required' : 'وارد کردن ایمیل الزامی است';
    if (!token.trim()) newErrors.token = isEnglish ? 'Reset code is required' : 'کد بازیابی الزامی است';
    if (!password.trim()) newErrors.password = isEnglish ? 'Password is required' : 'وارد کردن رمز عبور الزامی است';
    else if (!passwordPolicy.isValid) {
      newErrors.password = isEnglish
        ? 'Password must be at least 8 characters and include at least one uppercase letter and one number'
        : 'رمز عبور باید حداقل ۸ کاراکتر بوده و شامل حداقل یک حرف بزرگ انگلیسی و یک عدد باشد';
    }
    if (!confirmPassword.trim()) newErrors.confirmPassword = isEnglish ? 'Password confirmation is required' : 'تکرار رمز عبور الزامی است';
    else if (password !== confirmPassword) newErrors.confirmPassword = isEnglish ? 'Password confirmation does not match' : 'تکرار رمز عبور با رمز عبور یکسان نیست';

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
        setErrors({ token: payload.error || (isEnglish ? 'Password reset failed' : 'بازیابی رمز عبور ناموفق بود') });
        return;
      }

      setMessage(payload.data?.message || (isEnglish ? 'Password changed successfully.' : 'رمز عبور با موفقیت تغییر کرد.'));
      setTimeout(() => router.push(`/${locale}/auth/login`), 1200);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthExperience
      title={isEnglish ? 'Forgot password' : 'فراموشی رمز عبور'}
      subtitle={
        isEnglish
          ? 'Enter your email to receive a reset code and set a new password.'
          : 'ایمیل خود را وارد کنید تا کد بازیابی برایتان ارسال شود و رمز عبور را مجدداً تنظیم کنید.'
      }
    >
      <div className="space-y-6 [&_label]:!text-slate-200 [&_.text-secondary-500]:!text-slate-400">
        {!resetSent ? (
          <form onSubmit={handleRequestReset} className="space-y-4">
            <Input
              label={isEnglish ? 'Email address' : 'نشانی ایمیل'}
              type="email"
              name="email"
              placeholder={isEnglish ? 'Your email' : 'ایمیل شما'}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={errors.email}
              icon={<Mail className="h-4 w-4" />}
              className="border-white/10 bg-white/95"
            />

            <Button fullWidth size="lg" isLoading={isLoading} className="h-[3.25rem] bg-cyan-50 text-slate-950 hover:bg-white">
              {isEnglish ? 'Send reset code' : 'ارسال کد بازیابی'}
            </Button>
          </form>
        ) : (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <Input
              label={isEnglish ? 'Email address' : 'نشانی ایمیل'}
              type="email"
              name="email"
              placeholder={isEnglish ? 'Your email' : 'ایمیل شما'}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={errors.email}
              icon={<Mail className="h-4 w-4" />}
              className="border-white/10 bg-white/95"
            />

            <Input
              label={isEnglish ? 'Reset code' : 'کد بازیابی'}
              type="text"
              name="token"
              placeholder={isEnglish ? 'Received code' : 'کد دریافتی'}
              value={token}
              onChange={(e) => setToken(e.target.value)}
              error={errors.token}
              icon={<ShieldCheck className="h-4 w-4" />}
              className="border-white/10 bg-white/95"
            />

            <Input
              label={isEnglish ? 'New password' : 'رمز عبور جدید'}
              type="password"
              name="password"
              placeholder={isEnglish ? 'New password' : 'رمز عبور جدید'}
              value={password}
              onChange={(e) => handlePasswordChange(e.target.value)}
              error={errors.password}
              helperText={isEnglish ? 'Minimum 8 characters, 1 uppercase letter, and 1 number' : 'حداقل ۸ نویسه، ۱ حرف بزرگ انگلیسی و ۱ عدد'}
              className="border-white/10 bg-white/95"
            />

            {password.length > 0 && (
              <div className="rounded-lg border border-white/10 bg-white/[0.05] p-3">
                <div className="mb-2 flex items-center justify-between text-xs font-bold text-slate-300">
                  <span>{isEnglish ? 'Password strength' : 'قدرت رمز عبور'}</span>
                  <span>{strengthLabel}</span>
                </div>
                <div className="mb-3 grid grid-cols-4 gap-1.5">
                  {[0, 1, 2, 3].map((index) => (
                    <span
                      key={index}
                      className={`h-1.5 rounded-full ${
                        passwordPolicy.score > index
                          ? passwordPolicy.score <= 1
                            ? 'bg-red-400'
                            : passwordPolicy.score === 2
                              ? 'bg-amber-400'
                              : passwordPolicy.score === 3
                                ? 'bg-cyan-300'
                                : 'bg-emerald-400'
                          : 'bg-white/10'
                      }`}
                    />
                  ))}
                </div>
                <div className="space-y-1.5 text-xs text-slate-300">
                  <p className={passwordPolicy.length ? 'text-emerald-300' : 'text-slate-400'}>
                    {passwordPolicy.length ? '✓' : '•'} {isEnglish ? 'At least 8 characters' : 'حداقل ۸ کاراکتر'}
                  </p>
                  <p className={passwordPolicy.uppercase ? 'text-emerald-300' : 'text-slate-400'}>
                    {passwordPolicy.uppercase ? '✓' : '•'} {isEnglish ? 'At least one uppercase letter (A-Z)' : 'حداقل یک حرف بزرگ انگلیسی (A-Z)'}
                  </p>
                  <p className={passwordPolicy.digit ? 'text-emerald-300' : 'text-slate-400'}>
                    {passwordPolicy.digit ? '✓' : '•'} {isEnglish ? 'At least one number (0-9)' : 'حداقل یک عدد (0-9)'}
                  </p>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Input
                label={isEnglish ? 'Confirm new password' : 'تکرار رمز عبور جدید'}
                type="password"
                name="confirmPassword"
                placeholder={isEnglish ? 'Confirm new password' : 'تکرار رمز عبور جدید'}
                value={confirmPassword}
                onChange={(e) => handleConfirmPasswordChange(e.target.value)}
                error={errors.confirmPassword}
                className="border-white/10 bg-white/95"
              />
              {confirmPassword.length > 0 && !errors.confirmPassword && (
                <div className="flex items-center gap-2 text-sm text-emerald-300">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-400/20 text-xs">✓</span>
                  {isEnglish ? 'Passwords match' : 'رمز های عبور یکسان هستند'}
                </div>
              )}
            </div>

            <Button fullWidth size="lg" isLoading={isLoading} className="h-[3.25rem] bg-cyan-50 text-slate-950 hover:bg-white">
              {isEnglish ? 'Reset password' : 'تغییر رمز عبور'}
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
            {isEnglish ? 'Back to login' : 'بازگشت به صفحه ورود'}
          </Link>
        </div>
      </div>
    </AuthExperience>
  );
}
