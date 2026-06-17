'use client';

import { useEffect, useState } from 'react';
import { Header, Footer, Card, CardContent, Button, Badge } from '@/components';
import { apiDelete, apiGet, apiPost, apiPut } from '@/lib/apiClient';
import type { SubscriptionPlan } from '@/lib/types';
import { CheckCircle2, Edit3, Plus, Save, Trash2, X } from 'lucide-react';

type PlanForm = {
  id?: string;
  name: string;
  slug: string;
  description: string;
  type: SubscriptionPlan['type'];
  price: string;
  currency: string;
  billingPeriod: SubscriptionPlan['billingPeriod'];
  features: string;
  isActive: boolean;
};

const emptyForm: PlanForm = {
  name: '',
  slug: '',
  description: '',
  type: 'timeframe',
  price: '',
  currency: 'IRR',
  billingPeriod: 'monthly',
  features: '',
  isActive: true,
};

const currencyLabel: Record<string, string> = {
  IRR: 'ریال',
  USD: 'دلار',
};

function formatPlanPrice(plan: SubscriptionPlan) {
  const amount = new Intl.NumberFormat('fa-IR').format(plan.price);
  return `${amount} ${currencyLabel[plan.currency] || plan.currency}`;
}

function planToForm(plan: SubscriptionPlan): PlanForm {
  return {
    id: plan.id,
    name: plan.name,
    slug: plan.slug,
    description: plan.description || '',
    type: plan.type,
    price: String(plan.price),
    currency: plan.currency || 'IRR',
    billingPeriod: plan.billingPeriod,
    features: plan.features.join('\n'),
    isActive: plan.isActive,
  };
}

export default function AdminPricingPage() {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [form, setForm] = useState<PlanForm>(emptyForm);
  const [status, setStatus] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const loadPlans = async () => {
    try {
      const data = await apiGet<{ plans: SubscriptionPlan[] }>('/api/subscription-plans?includeInactive=true', true);
      setPlans(data.plans);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Unable to load plans.');
    }
  };

  useEffect(() => {
    loadPlans();
  }, []);

  const updateForm = (key: keyof PlanForm, value: string | boolean) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const resetForm = () => {
    setForm(emptyForm);
  };

  const savePlan = async () => {
    setStatus('');
    setIsSaving(true);

    const payload = {
      name: form.name.trim(),
      slug: form.slug.trim(),
      description: form.description.trim() || undefined,
      type: form.type,
      price: Number(form.price),
      currency: form.currency,
      billingPeriod: form.billingPeriod,
      features: form.features.split('\n').map((feature) => feature.trim()).filter(Boolean),
      isActive: form.isActive,
    };

    try {
      if (form.id) {
        await apiPut(`/api/subscription-plans/${form.id}`, payload, true);
        setStatus('Plan updated.');
      } else {
        await apiPost('/api/subscription-plans', payload, true);
        setStatus('Plan created.');
      }
      resetForm();
      await loadPlans();
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Unable to save plan.');
    } finally {
      setIsSaving(false);
    }
  };

  const deactivatePlan = async (planId: string) => {
    try {
      await apiDelete(`/api/subscription-plans/${planId}`, true);
      setStatus('Plan deactivated.');
      await loadPlans();
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Unable to deactivate plan.');
    }
  };

  return (
    <div className="min-h-screen bg-secondary-50">
      <Header isAuthenticated userName="Admin" />

      <main className="py-12 md:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-10 flex flex-col justify-between gap-6 md:flex-row md:items-center">
            <div>
              <h1 className="text-4xl font-black tracking-tight text-secondary-900">
                مدیریت <span className="text-primary-600">قیمت اشتراک‌ها</span>
              </h1>
              <p className="mt-2 text-lg font-medium text-secondary-500">
                ساخت، ویرایش، غیرفعال‌سازی و تعیین واحد پولی ریال یا دلار برای پلن‌ها.
              </p>
            </div>
            <Button size="lg" leftIcon={<Plus className="h-5 w-5" />} onClick={resetForm}>
              پلن جدید
            </Button>
          </div>

          {status && <div className="mb-6 rounded-lg border border-secondary-200 bg-white p-4 text-sm font-bold text-secondary-700">{status}</div>}

          <Card className="mb-10 border-none bg-white p-6 shadow-xl">
            <div className="mb-6 flex items-center justify-between border-b border-secondary-100 pb-4">
              <h2 className="text-2xl font-black text-secondary-900">{form.id ? 'ویرایش پلن' : 'ساخت پلن جدید'}</h2>
              {form.id && (
                <Button variant="ghost" leftIcon={<X className="h-4 w-4" />} onClick={resetForm}>
                  لغو ویرایش
                </Button>
              )}
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
              <input className="form-input" placeholder="نام پلن" value={form.name} onChange={(event) => updateForm('name', event.target.value)} />
              <input className="form-input" placeholder="slug مثل vip-elite" value={form.slug} onChange={(event) => updateForm('slug', event.target.value)} />
              <input className="form-input" type="number" placeholder="قیمت" value={form.price} onChange={(event) => updateForm('price', event.target.value)} />
              <select className="form-input" value={form.currency} onChange={(event) => updateForm('currency', event.target.value)}>
                <option value="IRR">ریال ایران</option>
                <option value="USD">دلار آمریکا</option>
              </select>
              <select className="form-input" value={form.type} onChange={(event) => updateForm('type', event.target.value as PlanForm['type'])}>
                <option value="timeframe">تایم‌فریم</option>
                <option value="long_term">بلندمدت</option>
                <option value="market_full">دسترسی کامل بازار</option>
                <option value="all_markets">همه بازارها</option>
                <option value="vip">ویژه</option>
              </select>
              <select className="form-input" value={form.billingPeriod} onChange={(event) => updateForm('billingPeriod', event.target.value as PlanForm['billingPeriod'])}>
                <option value="monthly">ماهانه</option>
                <option value="quarterly">فصلی</option>
                <option value="yearly">سالانه</option>
              </select>
              <select className="form-input" value={String(form.isActive)} onChange={(event) => updateForm('isActive', event.target.value === 'true')}>
                <option value="true">فعال</option>
                <option value="false">غیرفعال</option>
              </select>
              <input className="form-input md:col-span-2 xl:col-span-1" placeholder="توضیح کوتاه" value={form.description} onChange={(event) => updateForm('description', event.target.value)} />
              <textarea
                className="form-input min-h-28 md:col-span-2 xl:col-span-4"
                placeholder="ویژگی‌ها، هر خط یک ویژگی"
                value={form.features}
                onChange={(event) => updateForm('features', event.target.value)}
              />
            </div>

            <div className="mt-6 flex justify-end">
              <Button onClick={savePlan} isLoading={isSaving} leftIcon={<Save className="h-5 w-5" />}>
                ذخیره پلن
              </Button>
            </div>
          </Card>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {plans.map((plan) => (
              <Card key={plan.id} className="overflow-hidden border-none bg-white shadow-xl">
                <div className="border-b border-secondary-50 bg-secondary-50/50 p-6">
                  <div className="mb-4 flex items-start justify-between">
                    <Badge variant={plan.isActive ? 'success' : 'neutral'}>
                      {plan.isActive ? 'فعال' : 'غیرفعال'}
                    </Badge>
                    <div className="flex gap-1">
                      <Button size="sm" variant="ghost" className="h-auto p-2 text-secondary-400 hover:text-blue-600" onClick={() => setForm(planToForm(plan))}>
                        <Edit3 className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="ghost" className="h-auto p-2 text-secondary-400 hover:text-red-600" onClick={() => deactivatePlan(plan.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <h3 className="mb-1 text-xl font-bold text-secondary-900">{plan.name}</h3>
                  <p className="text-sm font-medium text-secondary-500">{plan.type.replace('_', ' ').toUpperCase()}</p>
                </div>
                <CardContent className="p-6">
                  <div className="mb-6">
                    <span className="text-3xl font-black text-secondary-900">{formatPlanPrice(plan)}</span>
                    <span className="ml-2 font-bold text-secondary-400">/{plan.billingPeriod}</span>
                  </div>
                  <ul className="mb-8 space-y-3">
                    {plan.features.slice(0, 4).map((feature) => (
                      <li key={feature} className="flex items-center gap-2 text-sm text-secondary-600">
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                        <span>{feature}</span>
                      </li>
                    ))}
                    {plan.features.length > 4 && <li className="text-xs font-bold text-secondary-400">+ {plan.features.length - 4} more features</li>}
                  </ul>
                  <Button variant="outline" fullWidth onClick={() => setForm(planToForm(plan))}>
                    ویرایش جزئیات
                  </Button>
                </CardContent>
              </Card>
            ))}
            {!plans.length && (
              <Card className="border-none bg-white p-8 text-center shadow-xl md:col-span-2 lg:col-span-3">
                <p className="font-bold text-secondary-700">هنوز پلنی در دیتابیس ثبت نشده است.</p>
              </Card>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
