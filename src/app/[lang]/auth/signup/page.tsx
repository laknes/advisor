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
  const isEnglish = locale === 'en';
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    acceptedTerms: false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, type, checked, value } = e.target;
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

    if (!formData.name) newErrors.name = isEnglish ? 'Name is required' : 'وارد کردن نام الزامی است';
    if (!formData.email) newErrors.email = isEnglish ? 'Email is required' : 'وارد کردن ایمیل الزامی است';
    if (!formData.password) newErrors.password = isEnglish ? 'Password is required' : 'وارد کردن رمز عبور الزامی است';
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = isEnglish ? 'Password confirmation does not match' : 'تکرار رمز عبور یکسان نیست';
    }
    if (!formData.acceptedTerms) {
      newErrors.acceptedTerms = isEnglish ? 'You must accept the terms and privacy policy' : 'برای ثبت‌نام باید قوانین و مقررات را بپذیرید';
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
        setErrors({ email: payload.error || (isEnglish ? 'Signup failed' : 'ثبت‌نام ناموفق بود') });
        return;
      }

      storeAuth(payload.data.token, payload.data.user);
      router.push(`/${locale}/dashboard`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthExperience
      title={isEnglish ? 'Create your account' : 'ساخت حساب کاربری'}
      subtitle={
        isEnglish
          ? 'Create your account and unlock a live 3D view of risk, opportunity, and portfolio growth.'
          : 'حساب خود را بسازید و اولین نمای سه‌بعدی از ریسک، فرصت و مسیر رشد پورتفویتان را ببینید.'
      }
    >
      <div className="space-y-6 [&_label]:!text-slate-200 [&_.text-secondary-500]:!text-slate-400">
        <form onSubmit={handleSubmit}>
          <FormGroup className="space-y-4">
            <Input
              label={isEnglish ? 'Full name' : 'نام و نام خانوادگی'}
              name="name"
              placeholder={isEnglish ? 'Full name' : 'نام و نام خانوادگی'}
              value={formData.name}
              onChange={handleChange}
              error={errors.name}
              icon={<UserRound className="h-4 w-4" />}
              className="border-white/10 bg-white/95"
            />

            <Input
              label={isEnglish ? 'Email address' : 'نشانی ایمیل'}
              type="email"
              name="email"
              placeholder={isEnglish ? 'Your email' : 'ایمیل شما'}
              value={formData.email}
              onChange={handleChange}
              error={errors.email}
              icon={<Mail className="h-4 w-4" />}
              className="border-white/10 bg-white/95"
            />

            <Input
              label={isEnglish ? 'Password' : 'رمز عبور'}
              type="password"
              name="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              error={errors.password}
              icon={<LockKeyhole className="h-4 w-4" />}
              helperText={isEnglish ? 'At least 8 characters' : 'حداقل ۸ نویسه'}
              className="border-white/10 bg-white/95"
            />

            <Input
              label={isEnglish ? 'Confirm password' : 'تکرار رمز عبور'}
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
              <input
                type="checkbox"
                id="acceptedTerms"
                name="acceptedTerms"
                checked={formData.acceptedTerms}
                onChange={handleChange}
                className="mt-1 h-4 w-4 rounded border-white/20 bg-white/10"
              />
              <label htmlFor="acceptedTerms" className="text-sm leading-7 text-slate-300">
                {isEnglish ? 'I agree with the ' : 'با '}
                <Link href={`/${locale}/terms`} className="font-medium text-cyan-200 hover:text-white">
                  {isEnglish ? 'Terms and Conditions' : 'قوانین و مقررات'}
                </Link>{' '}
                {isEnglish ? ' and ' : 'و '}
                <Link href={`/${locale}/privacy`} className="font-medium text-cyan-200 hover:text-white">
                  {isEnglish ? 'Privacy Policy' : 'حریم خصوصی'}
                </Link>
                {isEnglish ? '' : ' موافقم'}
              </label>
            </div>
            {errors.acceptedTerms && (
              <p className="text-sm text-red-400">{errors.acceptedTerms}</p>
            )}

            <Button fullWidth size="lg" isLoading={isLoading} className="h-[3.25rem] bg-cyan-50 text-slate-950 hover:bg-white">
              {isEnglish ? 'Create account' : 'ساخت حساب'}
            </Button>
          </FormGroup>
        </form>

        <div className="text-center">
          <p className="text-slate-300">
            {isEnglish ? 'Already have an account?' : 'از قبل حساب دارید؟'}{' '}
            <Link href={`/${locale}/auth/login`} className="font-medium text-cyan-200 hover:text-white">
              {isEnglish ? 'Sign in' : 'وارد شوید'}
            </Link>
          </p>
        </div>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-white/12"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="bg-[#201f35] px-3 text-slate-400">{isEnglish ? 'Or continue with' : 'یا ادامه با'}</span>
          </div>
        </div>

        <SocialAuthButtons />
      </div>
    </AuthExperience>
  );
}
