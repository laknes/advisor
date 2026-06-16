'use client';

import { Header, Card, Button, Input, FormGroup } from '@/components';
import { AUTH_TOKEN_KEY, AUTH_USER_KEY } from '@/lib/clientAuth';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function LoginPage() {
  const router = useRouter();
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

    if (!formData.email) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid';

    if (!formData.password) newErrors.password = 'Password is required';

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

      localStorage.setItem(AUTH_TOKEN_KEY, payload.data.token);
      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(payload.data.user));
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
              <h1 className="text-3xl font-bold text-secondary-900">Welcome Back</h1>
              <p className="text-secondary-600 mt-2">Login to your Portfolio Advisor account</p>
            </div>

            <form onSubmit={handleSubmit}>
              <FormGroup>
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
                    <span className="text-sm text-secondary-700">Remember me</span>
                  </label>
                  <Link href="/auth/forgot-password" className="text-primary-600 hover:underline text-sm font-medium">
                    Forgot password?
                  </Link>
                </div>

                <Button fullWidth size="lg" isLoading={isLoading}>
                  Login
                </Button>
              </FormGroup>
            </form>

            <div className="text-center">
              <p className="text-secondary-600">
                Don't have an account?{' '}
                <Link href="/auth/signup" className="text-primary-600 hover:underline font-medium">
                  Sign up here
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
