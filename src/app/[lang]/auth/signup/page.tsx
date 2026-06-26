'use client';

import { AuthExperience, Button, Input, FormGroup, SocialAuthButtons } from '@/components';
import { useLocale } from '@/components/LocaleProvider';
import { storeAuth } from '@/lib/clientAuth';
import { LockKeyhole, Mail, UserRound } from 'lucide-react';
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
    <AuthExperience title="ساخت حساب کاربری" subtitle="حساب خود را بسازید و اولین نمای سه‌بعدی از ریسک، فرصت و مسیر رشد پورتفویتان را ببینید.">
      <div className="space-y-6 [&_label]:!text-slate-200 [&_.text-secondary-500]:!text-slate-400">
        <form onSubmit={handleSubmit}>
          <FormGroup className="space-y-4">
            <Input
              label="نام و نام خانوادگی"
              name="name"
              placeholder="نام و نام خانوادگی"
              value={formData.name}
              onChange={handleChange}
              error={errors.name}
              icon={<UserRound className="h-4 w-4" />}
              className="border-white/10 bg-white/95"
            />

            <Input
              label="نشانی ایمیل"
              type="email"
              name="email"
              placeholder="ایمیل شما"
              value={formData.email}
              onChange={handleChange}
              error={errors.email}
              icon={<Mail className="h-4 w-4" />}
              className="border-white/10 bg-white/95"
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
              helperText="حداقل ۸ نویسه"
              className="border-white/10 bg-white/95"
            />

            <Input
              label="تکرار رمز عبور"
              type="password"
              name="confirmPassword"
              placeholder="••••••••"
              value={formData.confirmPassword}
              onChange={handleChange}
              error={errors.confirmPassword}
              icon={<LockKeyhole className="h-4 w-4" />}
              className="border-white/10 bg-white/95"
            />

            <div className="flex items-start gap-2">
              <input type="checkbox" id="terms" className="mt-1 h-4 w-4 rounded border-white/20 bg-white/10" />
              <label htmlFor="terms" className="text-sm leading-7 text-slate-300">
                با{' '}
                <Link href={`/${locale}/terms`} className="font-medium text-cyan-200 hover:text-white">
                  قوانین و مقررات
                </Link>{' '}
                و{' '}
                <Link href={`/${locale}/privacy`} className="font-medium text-cyan-200 hover:text-white">
                  حریم خصوصی
                </Link>
                {' '}موافقم
              </label>
            </div>

            <Button fullWidth size="lg" isLoading={isLoading} className="h-[3.25rem] bg-cyan-50 text-slate-950 hover:bg-white">
              ساخت حساب
            </Button>
          </FormGroup>
        </form>

        <div className="text-center">
          <p className="text-slate-300">
            از قبل حساب دارید؟{' '}
            <Link href={`/${locale}/auth/login`} className="font-medium text-cyan-200 hover:text-white">
              وارد شوید
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
