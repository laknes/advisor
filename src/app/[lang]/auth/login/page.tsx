'use client';

import { AuthExperience, Button, Input, FormGroup, SocialAuthButtons } from '@/components';
import { useLocale } from '@/components/LocaleProvider';
import { storeAuth } from '@/lib/clientAuth';
import { LockKeyhole, Mail } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function LoginPage() {
  const router = useRouter();
  const { locale } = useLocale();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

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

  return (
    <AuthExperience title="خوش آمدید" subtitle="وارد اتاق کنترل سرمایه شوید؛ جایی که پورتفو، ریسک و سیگنال‌های بازار در یک مدار زنده کنار هم دیده می‌شوند.">
      <div className="space-y-6 [&_label]:!text-slate-200 [&_.text-secondary-500]:!text-slate-400">
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
