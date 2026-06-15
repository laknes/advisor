'use client';

import { Header, Card, Button, Input, FormGroup } from '@/components';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function SignupPage() {
  const router = useRouter();
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

    if (!formData.name) newErrors.name = 'Name is required';
    if (!formData.email) newErrors.email = 'Email is required';
    if (!formData.password) newErrors.password = 'Password is required';
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
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

      localStorage.setItem('portfolio_advisor_token', payload.data.token);
      localStorage.setItem('portfolio_advisor_user', JSON.stringify(payload.data.user));
      router.push('/fa/dashboard');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50">
      <Header isAuthenticated={false} />

      <div className="flex items-center justify-center min-h-[calc(100vh-64px)] px-4">
        <Card className="w-full max-w-lg">
          <div className="space-y-6">
            <div className="text-center">
              <h1 className="text-3xl font-bold text-secondary-900">Create Account</h1>
              <p className="text-secondary-600 mt-2">Join Portfolio Advisor today</p>
            </div>

            <form onSubmit={handleSubmit}>
              <FormGroup>
                <Input
                  label="Full Name"
                  name="name"
                  placeholder="نام و نام خانوادگی"
                  value={formData.name}
                  onChange={handleChange}
                  error={errors.name}
                  icon="👤"
                />

                <Input
                  label="Email Address"
                  type="email"
                  name="email"
                  placeholder="your@email.com"
                  value={formData.email}
                  onChange={handleChange}
                  error={errors.email}
                  icon="📧"
                />

                <Input
                  label="Password"
                  type="password"
                  name="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  error={errors.password}
                  icon="🔒"
                  helperText="At least 8 characters"
                />

                <Input
                  label="Confirm Password"
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
                  <label htmlFor="terms" className="text-sm text-secondary-700">
                    I agree to the{' '}
                    <Link href="/terms" className="text-primary-600 hover:underline font-medium">
                      Terms of Service
                    </Link>{' '}
                    and{' '}
                    <Link href="/privacy" className="text-primary-600 hover:underline font-medium">
                      Privacy Policy
                    </Link>
                  </label>
                </div>

                <Button fullWidth size="lg" isLoading={isLoading}>
                  Create Account
                </Button>
              </FormGroup>
            </form>

            <div className="text-center">
              <p className="text-secondary-600">
                Already have an account?{' '}
                <Link href="/auth/login" className="text-primary-600 hover:underline font-medium">
                  Login here
                </Link>
              </p>
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-secondary-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-secondary-500">Or continue with</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Button variant="secondary" fullWidth>
                <span className="mr-2">🔵</span> Google
              </Button>
              <Button variant="secondary" fullWidth>
                <span className="mr-2">📘</span> Facebook
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
