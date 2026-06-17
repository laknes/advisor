'use client';

import { Header, Card, Button, Input, FormGroup } from '@/components';
import { useLocale } from '@/components/LocaleProvider';
import { storeAuth } from '@/lib/clientAuth';
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
    <div className="min-h-screen bg-[#160022] text-white">
      <Header isAuthenticated={false} />

      <div className="flex items-center justify-center min-h-[calc(100vh-64px)] px-4">
        <Card className="w-full max-w-lg [&_label]:!text-slate-200 [&_.text-secondary-500]:!text-slate-400">
          <div className="space-y-6">
            <div className="text-center">
              <h1 className="text-3xl font-bold text-white">خوش آمدید</h1>
              <p className="mt-2 text-slate-300">برای ادامه وارد حساب مشاور پورتفو شوید</p>
            </div>

            <form onSubmit={handleSubmit}>
              <FormGroup>
                <Input
                  label="نشانی ایمیل"
                  type="email"
                  name="email"
                  placeholder="ایمیل شما"
                  value={formData.email}
                  onChange={handleChange}
                  error={errors.email}
                  icon="📧"
                />

                <Input
                  label="رمز عبور"
                  type="password"
                  name="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  error={errors.password}
                  icon="🔒"
                />

                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      name="rememberMe"
                      checked={formData.rememberMe}
                      onChange={handleChange}
                      className="w-4 h-4 rounded"
                    />
                    <span className="text-sm text-slate-300">مرا به خاطر بسپار</span>
                  </label>
                  <Link href={`/${locale}/auth/forgot-password`} className="text-primary-200 hover:underline text-sm font-medium">
                    رمز عبور را فراموش کرده‌اید؟
                  </Link>
                </div>

                <Button fullWidth size="lg" isLoading={isLoading}>
                  ورود
                </Button>
              </FormGroup>
            </form>

            <div className="text-center">
              <p className="text-slate-300">
                حساب کاربری ندارید؟{' '}
                <Link href={`/${locale}/auth/signup`} className="text-primary-200 hover:underline font-medium">
                  ثبت‌نام کنید
                </Link>
              </p>
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-secondary-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-[#160022] px-2 text-slate-400">یا ادامه با</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Button variant="secondary" fullWidth>
                <span className="mr-2">🔵</span> گوگل
              </Button>
              <Button variant="secondary" fullWidth>
                <span className="mr-2">📘</span> فیسبوک
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
