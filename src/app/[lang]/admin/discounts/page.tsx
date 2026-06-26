'use client';

import { useCallback, useEffect, useState } from 'react';
import { Header, Footer, Card, CardHeader, CardContent, Button, Badge } from '@/components';
import { apiDelete, apiGet, apiPost } from '@/lib/apiClient';
import { 
  Plus, 
  Trash2, 
  Calendar, 
  Tag, 
  Search,
} from 'lucide-react';

export default function AdminDiscountsPage() {
  const today = new Date().toISOString().slice(0, 10);
  const [discounts, setDiscounts] = useState<Array<{
    id: string;
    code: string;
    discountType: 'percentage' | 'fixed';
    discountValue: number;
    maxUses?: number | null;
    currentUses: number;
    validUntil: string;
    isActive: boolean;
  }>>([]);
  const [query, setQuery] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    code: '',
    discountType: 'percentage',
    discountValue: '',
    maxUses: '',
    validFrom: today,
    validUntil: today,
    isActive: true,
  });

  const loadDiscounts = useCallback(async () => {
    try {
      const data = await apiGet<{ discounts: typeof discounts }>('/api/admin/discounts', true);
      setDiscounts(data.discounts);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Unable to load discounts.');
    }
  }, []);

  useEffect(() => {
    loadDiscounts();
  }, [loadDiscounts]);

  const deleteDiscount = async (id: string) => {
    if (!window.confirm('Deactivate this discount code?')) return;

    try {
      await apiDelete(`/api/admin/discounts/${id}`, true);
      await loadDiscounts();
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : 'Unable to delete discount.');
    }
  };

  const createDiscount = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setIsSaving(true);

    try {
      await apiPost('/api/admin/discounts', {
        code: form.code,
        discountType: form.discountType,
        discountValue: Number(form.discountValue),
        maxUses: form.maxUses ? Number(form.maxUses) : undefined,
        validFrom: form.validFrom,
        validUntil: form.validUntil,
        isActive: form.isActive,
      }, true);
      setForm({
        code: '',
        discountType: 'percentage',
        discountValue: '',
        maxUses: '',
        validFrom: today,
        validUntil: today,
        isActive: true,
      });
      setShowCreate(false);
      await loadDiscounts();
    } catch (createError) {
      setError(createError instanceof Error ? createError.message : 'Unable to create discount.');
    } finally {
      setIsSaving(false);
    }
  };

  const filteredDiscounts = discounts.filter((discount) => discount.code.toLowerCase().includes(query.trim().toLowerCase()));

  return (
    <div className="min-h-screen bg-secondary-50">
      <Header isAuthenticated={true} userName="Admin" />

      <main className="py-12 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-6">
            <div>
              <h1 className="text-4xl font-black text-secondary-900 tracking-tight">Discount <span className="text-primary-600">Codes</span></h1>
              <p className="text-lg text-secondary-500 font-medium">Manage promotional offers and coupon strategy</p>
            </div>
            <Button size="lg" className="shadow-lg shadow-primary-200 px-8 h-14" leftIcon={<Plus className="w-5 h-5" />} onClick={() => setShowCreate((current) => !current)}>
              Create Discount
            </Button>
          </div>

          {showCreate && (
            <Card className="mb-8 border-none bg-white p-6 shadow-xl">
              <form onSubmit={createDiscount} className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <input
                  value={form.code}
                  onChange={(event) => setForm((current) => ({ ...current, code: event.target.value }))}
                  placeholder="Code"
                  required
                  className="rounded-lg border border-secondary-200 bg-white px-4 py-3 text-sm font-bold text-secondary-900 outline-none focus:border-primary-500"
                />
                <select
                  value={form.discountType}
                  onChange={(event) => setForm((current) => ({ ...current, discountType: event.target.value }))}
                  className="rounded-lg border border-secondary-200 bg-white px-4 py-3 text-sm font-bold text-secondary-900 outline-none focus:border-primary-500"
                >
                  <option value="percentage">Percentage</option>
                  <option value="fixed">Fixed</option>
                </select>
                <input
                  type="number"
                  min="1"
                  value={form.discountValue}
                  onChange={(event) => setForm((current) => ({ ...current, discountValue: event.target.value }))}
                  placeholder="Value"
                  required
                  className="rounded-lg border border-secondary-200 bg-white px-4 py-3 text-sm font-bold text-secondary-900 outline-none focus:border-primary-500"
                />
                <input
                  type="number"
                  min="1"
                  value={form.maxUses}
                  onChange={(event) => setForm((current) => ({ ...current, maxUses: event.target.value }))}
                  placeholder="Max uses"
                  className="rounded-lg border border-secondary-200 bg-white px-4 py-3 text-sm font-bold text-secondary-900 outline-none focus:border-primary-500"
                />
                <input
                  type="date"
                  value={form.validFrom}
                  onChange={(event) => setForm((current) => ({ ...current, validFrom: event.target.value }))}
                  required
                  className="rounded-lg border border-secondary-200 bg-white px-4 py-3 text-sm font-bold text-secondary-900 outline-none focus:border-primary-500"
                />
                <input
                  type="date"
                  value={form.validUntil}
                  onChange={(event) => setForm((current) => ({ ...current, validUntil: event.target.value }))}
                  required
                  className="rounded-lg border border-secondary-200 bg-white px-4 py-3 text-sm font-bold text-secondary-900 outline-none focus:border-primary-500"
                />
                <label className="flex items-center gap-3 text-sm font-bold text-secondary-700">
                  <input
                    type="checkbox"
                    checked={form.isActive}
                    onChange={(event) => setForm((current) => ({ ...current, isActive: event.target.checked }))}
                    className="h-4 w-4"
                  />
                  Active
                </label>
                <div className="flex gap-3 md:col-span-2">
                  <Button type="submit" isLoading={isSaving}>Save Discount</Button>
                  <Button type="button" variant="outline" className="border-secondary-300 text-secondary-800 hover:bg-secondary-100" onClick={() => setShowCreate(false)}>
                    Cancel
                  </Button>
                </div>
              </form>
            </Card>
          )}

          <Card className="border-none shadow-xl bg-white overflow-hidden">
            <CardHeader 
              title="Active Coupons" 
              action={
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary-400" />
                  <input
                    type="text"
                    placeholder="Search codes..."
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    className="pl-10 pr-4 py-2 bg-secondary-50 border border-secondary-100 rounded-lg text-sm text-secondary-900 focus:outline-none focus:ring-2 focus:ring-primary-500 w-64"
                  />
                </div>
              }
            />
            <CardContent className="p-0">
              {error && <p className="m-6 rounded-lg border border-red-200 bg-red-50 p-3 text-red-800">{error}</p>}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-secondary-50 border-b border-secondary-100">
                      <th className="text-left py-4 px-6 text-xs font-black text-secondary-400 uppercase tracking-widest">Coupon Code</th>
                      <th className="text-left py-4 px-6 text-xs font-black text-secondary-400 uppercase tracking-widest">Type / Value</th>
                      <th className="text-left py-4 px-6 text-xs font-black text-secondary-400 uppercase tracking-widest">Usage Limit</th>
                      <th className="text-left py-4 px-6 text-xs font-black text-secondary-400 uppercase tracking-widest">Expiry Date</th>
                      <th className="text-center py-4 px-6 text-xs font-black text-secondary-400 uppercase tracking-widest">Status</th>
                      <th className="text-right py-4 px-6 text-xs font-black text-secondary-400 uppercase tracking-widest">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-secondary-50">
                    {filteredDiscounts.map((discount) => {
                      const isExpired = new Date(discount.validUntil) < new Date();
                      const status = discount.isActive && !isExpired ? 'active' : 'expired';
                      const usagePercent = discount.maxUses ? Math.min(100, Math.round((discount.currentUses / discount.maxUses) * 100)) : 0;
                      return (
                      <tr key={discount.id} className="hover:bg-secondary-50/50 transition-colors group">
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-primary-50 rounded-lg">
                              <Tag className="w-4 h-4 text-primary-600" />
                            </div>
                            <span className="font-black text-secondary-900 tracking-wider">{discount.code}</span>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex flex-col">
                            <span className="text-sm font-bold text-secondary-900">{discount.discountType === 'percentage' ? `${discount.discountValue}%` : `$${discount.discountValue}`} Off</span>
                            <span className="text-[10px] font-bold text-secondary-400 uppercase">{discount.discountType}</span>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-1.5 w-24 bg-secondary-100 rounded-full overflow-hidden">
                              <div className={`h-full bg-primary-500`} style={{ width: `${usagePercent}%` }} />
                            </div>
                            <span className="text-xs font-bold text-secondary-600">{discount.currentUses}/{discount.maxUses || '∞'}</span>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-2 text-secondary-600">
                            <Calendar className="w-4 h-4 text-secondary-400" />
                            <span className="text-sm font-medium">{new Date(discount.validUntil).toLocaleDateString()}</span>
                          </div>
                        </td>
                        <td className="py-4 px-6 text-center">
                          <Badge variant={status === 'active' ? 'success' : 'neutral'}>
                            {status.toUpperCase()}
                          </Badge>
                        </td>
                        <td className="py-4 px-6 text-right">
                          <Button size="sm" variant="ghost" className="p-2 h-auto text-secondary-400 hover:text-red-600" onClick={() => deleteDiscount(discount.id)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </td>
                      </tr>
                      );
                    })}
                    {!filteredDiscounts.length && (
                      <tr>
                        <td colSpan={6} className="py-8 px-6 text-center text-secondary-500">No discount codes found.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
}
