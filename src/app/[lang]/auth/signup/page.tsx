'use client';

import { Header, Card, Button, Input, FormGroup } from '@/components';
import { useLocale } from '@/components/LocaleProvider';
import { storeAuth } from '@/lib/clientAuth';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function SignupPage() {
  const router = useRouter();
  const { locale } = useLocale();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!formData.name) newErrors.name = 'وارد کردن نام الزامی است';
    if (!formData.email) newErrors.email = 'وارد کردن ایمیل الزامی است';
    if (!formData.password) newErrors.password = 'وارد کردن رمز عبور الزامی است';
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'تکرار رمز عبور یکسان نیست';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      setIsLoading(true);
      const response = await fetch('/api/auth?action=register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
        }),
      });
      const payload = await response.json();

      if (!response.ok) {
        setErrors({ email: payload.error || 'ثبت‌نام ناموفق بود' });
        return;
      }

      storeAuth(payload.data.token, payload.data.user);
      router.push(`/${locale}/dashboard`);
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
              <h1 className="text-3xl font-bold text-white">ساخت حساب کاربری</h1>
              <p className="mt-2 text-slate-300">همین امروز به مشاور پورتفو بپیوندید</p>
            </div>

            <form onSubmit={handleSubmit}>
              <FormGroup>
                <Input
                  label="نام و نام خانوادگی"
                  name="name"
                  placeholder="نام و نام خانوادگی"
                  value={formData.name}
                  onChange={handleChange}
                  error={errors.name}
                  icon="👤"
                />

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
                  helperText="حداقل ۸ نویسه"
                />

                <Input
                  label="تکرار رمز عبور"
                  type="password"
                  name="confirmPassword"
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  error={errors.confirmPassword}
                  icon="🔒"
                />

                <div className="flex items-center gap-2">
                  <input type="checkbox" id="terms" className="w-4 h-4 rounded" />
                  <label htmlFor="terms" className="text-sm text-slate-300">
                    با{' '}
                    <Link href={`/${locale}/terms`} className="text-primary-200 hover:underline font-medium">
                      قوانین و مقررات
                    </Link>{' '}
                    و{' '}
                    <Link href={`/${locale}/privacy`} className="text-primary-200 hover:underline font-medium">
                      حریم خصوصی
                    </Link>
                    {' '}موافقم
                  </label>
                </div>

                <Button fullWidth size="lg" isLoading={isLoading}>
                  ساخت حساب
                </Button>
              </FormGroup>
            </form>

            <div className="text-center">
              <p className="text-slate-300">
                از قبل حساب دارید؟{' '}
                <Link href={`/${locale}/auth/login`} className="text-primary-200 hover:underline font-medium">
                  وارد شوید
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
