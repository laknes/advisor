'use client';

import { useEffect, useState } from 'react';
import { Header, Card, CardHeader, CardContent, Button, Badge } from '@/components';
import { useLocale } from '@/components/LocaleProvider';
import { getStoredUser } from '@/lib/clientAuth';
import { apiGet, apiPut } from '@/lib/apiClient';
import { Input, Textarea, Select, FormGroup } from '@/components/Form';
import Link from 'next/link';

export default function ProfilePage() {
  const { locale } = useLocale();
  const currentUser = getStoredUser();
  const [profile, setProfile] = useState({
    name: currentUser?.name || '',
    email: currentUser?.email || '',
    phone: '',
    country: '',
    bio: '',
    riskTolerance: 'moderate',
    investmentGoal: 'long-term-growth',
    preferredNotification: 'email',
  });

  const [isEditing, setIsEditing] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    apiGet<{ user: { name?: string | null; email: string; phone?: string | null; country?: string | null } }>('/api/users/profile', true)
      .then((data) => {
        setProfile((current) => ({
          ...current,
          name: data.user.name || '',
          email: data.user.email,
          phone: data.user.phone || '',
          country: data.user.country || '',
        }));
      })
      .catch((error) => setMessage(error instanceof Error ? error.message : 'Unable to load profile.'));
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    try {
      const data = await apiPut<{ user: { name?: string | null; email: string; phone?: string | null; country?: string | null } }>('/api/users/profile', {
        name: profile.name,
        phone: profile.phone,
        country: profile.country,
      }, true);
      setProfile((current) => ({
        ...current,
        name: data.user.name || '',
        email: data.user.email,
        phone: data.user.phone || '',
        country: data.user.country || '',
      }));
      setMessage('Profile updated successfully!');
      setIsEditing(false);
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Unable to update profile.');
    }
  };

  return (
    <div className="min-h-screen bg-secondary-50">
      <Header isAuthenticated={true} userName={profile.name} />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-bold text-secondary-900">Profile Settings</h1>
          <Link href={`/${locale}/dashboard`}>
            <Button variant="outline">Back to Dashboard</Button>
          </Link>
        </div>

        {message && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-800">{message}</p>
          </div>
        )}

        {/* Profile Information */}
        <Card className="mb-8">
          <CardHeader
            title="Personal Information"
            action={
              <Button size="sm" variant={isEditing ? 'outline' : 'primary'} onClick={() => setIsEditing(!isEditing)}>
                {isEditing ? 'Cancel' : 'Edit'}
              </Button>
            }
          />
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormGroup label="Full Name">
                <Input
                  name="name"
                  value={profile.name}
                  onChange={handleChange}
                  disabled={!isEditing}
                  placeholder="Your full name"
                />
              </FormGroup>

              <FormGroup label="Email Address">
                <Input
                  name="email"
                  type="email"
                  value={profile.email}
                  onChange={handleChange}
                  disabled
                  placeholder="your@email.com"
                />
              </FormGroup>

              <FormGroup label="Phone Number">
                <Input
                  name="phone"
                  type="tel"
                  value={profile.phone}
                  onChange={handleChange}
                  disabled={!isEditing}
                  placeholder="+1 (555) 123-4567"
                />
              </FormGroup>

              <FormGroup label="Country">
                <Input
                  name="country"
                  value={profile.country}
                  onChange={handleChange}
                  disabled={!isEditing}
                  placeholder="Your country"
                />
              </FormGroup>
            </div>

            <FormGroup label="Bio">
              <Textarea
                name="bio"
                value={profile.bio}
                onChange={handleChange}
                disabled={!isEditing}
                placeholder="Tell us about yourself..."
                rows={4}
              />
            </FormGroup>

            {isEditing && (
              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => setIsEditing(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSave}>Save Changes</Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Investment Preferences */}
        <Card className="mb-8">
          <CardHeader title="Investment Preferences" />
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormGroup label="Risk Tolerance">
                <Select
                  name="riskTolerance"
                  value={profile.riskTolerance}
                  onChange={handleChange}
                  options={[
                    { label: 'Conservative', value: 'conservative' },
                    { label: 'Moderate', value: 'moderate' },
                    { label: 'Aggressive', value: 'aggressive' },
                  ]}
                />
              </FormGroup>

              <FormGroup label="Investment Goal">
                <Select
                  name="investmentGoal"
                  value={profile.investmentGoal}
                  onChange={handleChange}
                  options={[
                    { label: 'Capital Preservation', value: 'capital-preservation' },
                    { label: 'Income Generation', value: 'income-generation' },
                    { label: 'Long-term Growth', value: 'long-term-growth' },
                    { label: 'Aggressive Growth', value: 'aggressive-growth' },
                  ]}
                />
              </FormGroup>
            </div>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card className="mb-8">
          <CardHeader title="Notification Preferences" />
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-secondary-50 rounded-lg">
                <label className="font-medium text-secondary-900">Price Alerts</label>
                <input type="checkbox" defaultChecked className="w-4 h-4" />
              </div>
              <div className="flex items-center justify-between p-3 bg-secondary-50 rounded-lg">
                <label className="font-medium text-secondary-900">Analysis Updates</label>
                <input type="checkbox" defaultChecked className="w-4 h-4" />
              </div>
              <div className="flex items-center justify-between p-3 bg-secondary-50 rounded-lg">
                <label className="font-medium text-secondary-900">Market News</label>
                <input type="checkbox" className="w-4 h-4" />
              </div>
              <div className="flex items-center justify-between p-3 bg-secondary-50 rounded-lg">
                <label className="font-medium text-secondary-900">Subscription Updates</label>
                <input type="checkbox" defaultChecked className="w-4 h-4" />
              </div>
            </div>

            <FormGroup label="Preferred Notification Method">
              <Select
                name="preferredNotification"
                value={profile.preferredNotification}
                onChange={handleChange}
                options={[
                  { label: 'Email', value: 'email' },
                  { label: 'SMS', value: 'sms' },
                  { label: 'In-app', value: 'in-app' },
                  { label: 'All', value: 'all' },
                ]}
              />
            </FormGroup>
          </CardContent>
        </Card>

        {/* Account Actions */}
        <Card>
          <CardHeader title="Account Management" />
          <CardContent className="space-y-3">
            <div className="flex flex-col gap-2">
              <p className="rounded-lg bg-secondary-50 p-4 text-sm text-secondary-700">
                Email, password reset, login history and two-factor authentication need provider-level integration before they can be enabled safely.
              </p>
              <Button variant="danger" fullWidth>
                Delete Account
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
