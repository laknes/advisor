'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { Header, Card, CardHeader, CardContent, Button, Input, FormGroup } from '@/components';
import { useLocale } from '@/components/LocaleProvider';
import { getAuthHeaders, getStoredUser } from '@/lib/clientAuth';
import Link from 'next/link';

interface Params {
  params: Promise<{
    id: string;
  }>;
}

export default function EditAdminUserPage({ params: paramsPromise }: Params) {
  const params = use(paramsPromise);
  const router = useRouter();
  const { locale } = useLocale();
  const currentUser = getStoredUser();
  const [form, setForm] = useState({
    name: '',
    email: '',
    country: '',
    verified: false,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch(`/api/admin/users/${params.id}`, {
          headers: getAuthHeaders(),
        });

        const result = await response.json();

        if (!response.ok) {
          setError(result.error || 'Unable to load user');
          return;
        }

        setForm({
          name: result.data.user.name || '',
          email: result.data.user.email || '',
          country: result.data.user.country || '',
          verified: result.data.user.verified ?? false,
        });
      } catch {
        setError('Unable to load user details.');
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [params.id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');
    setMessage('Saving changes...');

    try {
      const response = await fetch(`/api/admin/users/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
        },
        body: JSON.stringify(form),
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.error || 'Unable to update user');
        setMessage('');
        return;
      }

      setMessage('User details saved successfully!');
      setTimeout(() => setMessage(''), 2000);
    } catch {
      setError('Unable to update user. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-secondary-50">
      <Header isAuthenticated={true} userName={currentUser?.name || 'مدیر'} />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-bold text-secondary-900">Edit User</h1>
          <div className="flex gap-3">
            <Link href={`/${locale}/admin/users`}>
              <Button variant="outline">← Back</Button>
            </Link>
          </div>
        </div>

        {loading ? (
          <Card>
            <CardContent>
              <p className="text-secondary-700">Loading user details...</p>
            </CardContent>
          </Card>
        ) : (
          <>
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
              <CardHeader title="User Information" />
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormGroup label="Name">
                    <Input name="name" value={form.name} onChange={handleChange} placeholder="Full name" />
                  </FormGroup>
                  <FormGroup label="Email">
                    <Input name="email" type="email" value={form.email} onChange={handleChange} placeholder="Email address" />
                  </FormGroup>
                  <FormGroup label="Country">
                    <Input name="country" value={form.country} onChange={handleChange} placeholder="Country" />
                  </FormGroup>
                </div>

                <label className="flex items-center gap-3">
                  <input type="checkbox" name="verified" checked={form.verified} onChange={handleChange} className="w-4 h-4" />
                  <span className="text-secondary-700">Verified account</span>
                </label>

                <div className="flex justify-end gap-3 pt-4">
                  <Button variant="outline" onClick={() => router.push(`/${locale}/admin/users`)}>
                    Cancel
                  </Button>
                  <Button onClick={handleSave} isLoading={saving}>
                    Save Changes
                  </Button>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}
