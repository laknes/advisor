'use client';

import { useEffect, useState } from 'react';
import { Header, Card, CardHeader, CardContent, Button, Badge, Input } from '@/components';
import Link from 'next/link';

interface AdminUser {
  id: string;
  name: string | null;
  email: string;
  country: string | null;
  verified: boolean;
  createdAt: string;
}

export default function UsersManagementPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch('/api/admin/users', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token') ?? ''}`,
          },
        });
        const result = await response.json();

        if (!response.ok) {
          setError(result.error || 'Unable to load users');
          return;
        }

        setUsers(result.data.users || []);
      } catch (err) {
        setError('Unable to load users');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const filteredUsers = users.filter((user) =>
    `${user.name ?? ''} ${user.email}`.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-secondary-50">
      <Header isAuthenticated={true} userName="Admin" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-bold text-secondary-900">User Management</h1>
          <Link href="/admin/users/new">
            <Button>Add User</Button>
          </Link>
        </div>

        {error && (
          <Card className="mb-6 bg-red-50 border border-red-200">
            <CardContent>
              <p className="text-red-800">{error}</p>
            </CardContent>
          </Card>
        )}

        <Card className="mb-8">
          <CardContent className="pt-6">
            <Input
              placeholder="Search users by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              icon="🔍"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader title="All Users" subtitle={`Total: ${filteredUsers.length} users`} />
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b-2 border-secondary-200">
                  <tr>
                    <th className="text-left py-3 px-4 font-semibold text-secondary-700">Name</th>
                    <th className="text-left py-3 px-4 font-semibold text-secondary-700">Email</th>
                    <th className="text-left py-3 px-4 font-semibold text-secondary-700">Country</th>
                    <th className="text-left py-3 px-4 font-semibold text-secondary-700">Joined</th>
                    <th className="text-center py-3 px-4 font-semibold text-secondary-700">Verified</th>
                    <th className="text-center py-3 px-4 font-semibold text-secondary-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    <tr>
                      <td colSpan={6} className="py-6 text-center text-secondary-700">
                        Loading users...
                      </td>
                    </tr>
                  ) : filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-6 text-center text-secondary-700">
                        No users found.
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((user) => (
                      <tr key={user.id} className="border-b border-secondary-100 hover:bg-secondary-50">
                        <td className="py-4 px-4 font-medium text-secondary-900">{user.name ?? '—'}</td>
                        <td className="py-4 px-4 text-secondary-700">{user.email}</td>
                        <td className="py-4 px-4 text-secondary-700">{user.country ?? '—'}</td>
                        <td className="py-4 px-4 text-secondary-700">{new Date(user.createdAt).toLocaleDateString()}</td>
                        <td className="text-center py-4 px-4">
                          <Badge variant={user.verified ? 'success' : 'warning'}>
                            {user.verified ? 'Verified' : 'Pending'}
                          </Badge>
                        </td>
                        <td className="text-center py-4 px-4 space-x-2">
                          <Link href={`/admin/users/${user.id}`}>
                            <Button size="sm" variant="outline">
                              Edit
                            </Button>
                          </Link>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
