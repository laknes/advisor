'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Header, Card, CardHeader, CardContent, Button, Input, FormGroup } from '@/components';
import Link from 'next/link';

export default function CreateAdminUserPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    country: '',
    verified: false,
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    setMessage('Creating user...');

    try {
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token') ?? ''}`,
        },
        body: JSON.stringify(form),
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.error || 'Unable to create user');
        setMessage('');
        return;
      }

      setMessage('User created successfully! Redirecting...');
      setTimeout(() => router.push('/admin/users'), 1000);
    } catch (err) {
      setError('Unable to create user. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-secondary-50">
      <Header isAuthenticated={true} userName="Admin" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-bold text-secondary-900">Create User</h1>
          <Link href="/admin/users">
            <Button variant="outline">← Back</Button>
          </Link>
        </div>

        {message && (
          <Card className="mb-6 bg-green-50 border border-green-200">
            <CardContent>
              <p className="text-green-800">{message}</p>
            </CardContent>
          </Card>
        )}

        {error && (
          <Card className="mb-6 bg-red-50 border border-red-200">
            <CardContent>
              <p className="text-red-800">{error}</p>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader title="User Details" />
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormGroup label="Name">
                <Input name="name" value={form.name} onChange={handleChange} placeholder="Full name" />
              </FormGroup>
              <FormGroup label="Email">
                <Input name="email" type="email" value={form.email} onChange={handleChange} placeholder="Email address" />
              </FormGroup>
              <FormGroup label="Password">
                <Input name="password" type="password" value={form.password} onChange={handleChange} placeholder="Password" />
              </FormGroup>
              <FormGroup label="Country">
                <Input name="country" value={form.country} onChange={handleChange} placeholder="Country" />
              </FormGroup>
            </div>

            <label className="flex items-center gap-3">
              <input type="checkbox" name="verified" checked={form.verified} onChange={handleChange} className="w-4 h-4" />
              <span className="text-secondary-700">Mark user as verified</span>
            </label>

            <div className="flex justify-end gap-3 pt-4">
              <Link href="/admin/users">
                <Button variant="outline">Cancel</Button>
              </Link>
              <Button onClick={handleSubmit} isLoading={loading}>
                Create User
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
