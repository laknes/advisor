'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import Link from 'next/link';
import {
  Activity,
  ArrowLeft,
  CheckCircle2,
  CircleDollarSign,
  Copy,
  Edit3,
  Eye,
  EyeOff,
  Layers3,
  Plus,
  RefreshCw,
  Save,
  Search,
  Trash2,
  X,
} from 'lucide-react';
import { Badge, Button, Card, Footer, Header, useLocale } from '@/components';
import { apiDelete, apiGet, apiPost, apiPut } from '@/lib/apiClient';
import { formatFaNumber } from '@/lib/format';
import type { Market, SubscriptionPlan } from '@/lib/types';
import { cn } from '@/lib/utils';

type PlanForm = {
  id?: string;
  name: string;
  slug: string;
  description: string;
  type: SubscriptionPlan['type'];
  marketId: string;
  price: string;
  currency: string;
  billingPeriod: SubscriptionPlan['billingPeriod'];
  features: string[];
  isActive: boolean;
};

type PlanTypeFilter = 'all' | SubscriptionPlan['type'];
type StatusFilter = 'all' | 'active' | 'inactive';

const emptyForm: PlanForm = {
  name: '',
  slug: '',
  description: '',
  type: 'timeframe',
  marketId: '',
  price: '',
  currency: 'IRR',
  billingPeriod: 'monthly',
  features: [''],
  isActive: true,
};

const planTypeOptions: Array<{ value: SubscriptionPlan['type']; label: string; description: string }> = [
  { value: 'timeframe', label: 'تایم‌فریم', description: 'دسترسی روزانه، هفتگی یا ماهانه' },
  { value: 'long_term', label: 'بلندمدت', description: 'پلن‌های فصلی، سالانه و چندساله' },
  { value: 'market_full', label: 'یک بازار کامل', description: 'دسترسی کامل به یک بازار مشخص' },
  { value: 'all_markets', label: 'همه بازارها', description: 'دسترسی به تمام بازارهای فعال' },
  { value: 'vip', label: 'VIP', description: 'تجربه اختصاصی و سطح بالا' },
];

const billingOptions: Array<{ value: SubscriptionPlan['billingPeriod']; label: string }> = [
  { value: 'monthly', label: 'ماهانه' },
  { value: 'quarterly', label: 'فصلی' },
  { value: 'yearly', label: 'سالانه' },
];

const currencyLabel: Record<string, string> = {
  IRR: 'ریال',
  USD: 'دلار',
};

const billingLabel: Record<SubscriptionPlan['billingPeriod'], string> = {
  monthly: 'ماهانه',
  quarterly: 'فصلی',
  yearly: 'سالانه',
};

const typeLabel: Record<SubscriptionPlan['type'], string> = {
  timeframe: 'تایم‌فریم',
  long_term: 'بلندمدت',
  market_full: 'یک بازار کامل',
  all_markets: 'همه بازارها',
  vip: 'VIP',
};

function formatPlanPrice(plan: Pick<SubscriptionPlan, 'price' | 'currency'>) {
  return `${formatFaNumber(plan.price)} ${currencyLabel[plan.currency] || plan.currency}`;
}

function planToForm(plan: SubscriptionPlan): PlanForm {
  return {
    id: plan.id,
    name: plan.name,
    slug: plan.slug,
    description: plan.description || '',
    type: plan.type,
    marketId: plan.marketId || '',
    price: String(plan.price),
    currency: plan.currency || 'IRR',
    billingPeriod: plan.billingPeriod,
    features: plan.features.length ? plan.features : [''],
    isActive: plan.isActive,
  };
}

function normalizeFeatures(features: string[]) {
  return features.map((feature) => feature.trim()).filter(Boolean);
}

function createSlug(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[\u0600-\u06FF]+/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);
}

export default function AdminPricingPage() {
  const { locale } = useLocale();
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [markets, setMarkets] = useState<Market[]>([]);
  const [form, setForm] = useState<PlanForm>(emptyForm);
  const [query, setQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<PlanTypeFilter>('all');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [status, setStatus] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const selectedType = planTypeOptions.find((option) => option.value === form.type);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [planData, marketData] = await Promise.all([
        apiGet<{ plans: SubscriptionPlan[] }>('/api/subscription-plans?includeInactive=true', true),
        apiGet<{ markets: Market[] }>('/api/markets'),
      ]);
      setPlans(planData.plans);
      setMarkets(marketData.markets);
      setStatus('');
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'بارگذاری اطلاعات قیمت‌گذاری ناموفق بود.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredPlans = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return plans.filter((plan) => {
      const matchesQuery = !normalizedQuery
        || plan.name.toLowerCase().includes(normalizedQuery)
        || plan.slug.toLowerCase().includes(normalizedQuery)
        || (plan.description || '').toLowerCase().includes(normalizedQuery);
      const matchesType = typeFilter === 'all' || plan.type === typeFilter;
      const matchesStatus = statusFilter === 'all'
        || (statusFilter === 'active' ? plan.isActive : !plan.isActive);
      return matchesQuery && matchesType && matchesStatus;
    });
  }, [plans, query, statusFilter, typeFilter]);

  const stats = useMemo(() => {
    const activePlans = plans.filter((plan) => plan.isActive);
    const inactivePlans = plans.length - activePlans.length;
    const averagePrice = activePlans.length
      ? activePlans.reduce((sum, plan) => sum + plan.price, 0) / activePlans.length
      : 0;
    return {
      total: plans.length,
      active: activePlans.length,
      inactive: inactivePlans,
      averagePrice,
    };
  }, [plans]);

  const updateForm = <K extends keyof PlanForm>(key: K, value: PlanForm[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const resetForm = () => {
    setForm(emptyForm);
    setStatus('');
  };

  const duplicatePlan = (plan: SubscriptionPlan) => {
    setForm({
      ...planToForm(plan),
      id: undefined,
      name: `${plan.name} کپی`,
      slug: `${plan.slug}-copy`,
      isActive: false,
    });
    setStatus('یک نسخه قابل ویرایش از پلن انتخاب‌شده ساخته شد.');
  };

  const updateFeature = (index: number, value: string) => {
    updateForm('features', form.features.map((feature, featureIndex) => (featureIndex === index ? value : feature)));
  };

  const addFeature = () => {
    updateForm('features', [...form.features, '']);
  };

  const removeFeature = (index: number) => {
    const nextFeatures = form.features.filter((_, featureIndex) => featureIndex !== index);
    updateForm('features', nextFeatures.length ? nextFeatures : ['']);
  };

  const savePlan = async (event?: FormEvent<HTMLFormElement>) => {
    event?.preventDefault();
    setStatus('');

    const features = normalizeFeatures(form.features);
    const price = Number(form.price);

    if (!form.name.trim() || !form.slug.trim() || !Number.isFinite(price)) {
      setStatus('نام، slug و قیمت معتبر الزامی هستند.');
      return;
    }

    const payload = {
      name: form.name.trim(),
      slug: form.slug.trim(),
      description: form.description.trim() || undefined,
      type: form.type,
      marketId: form.marketId || undefined,
      price,
      currency: form.currency,
      billingPeriod: form.billingPeriod,
      features,
      isActive: form.isActive,
    };

    setIsSaving(true);
    try {
      if (form.id) {
        await apiPut(`/api/subscription-plans/${form.id}`, payload, true);
        setStatus('پلن با موفقیت به‌روزرسانی شد.');
      } else {
        await apiPost('/api/subscription-plans', payload, true);
        setStatus('پلن جدید با موفقیت ساخته شد.');
      }
      resetForm();
      await loadData();
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'ذخیره پلن ناموفق بود.');
    } finally {
      setIsSaving(false);
    }
  };

  const deactivatePlan = async (plan: SubscriptionPlan) => {
    const confirmed = window.confirm(`پلن «${plan.name}» غیرفعال شود؟`);
    if (!confirmed) return;

    try {
      await apiDelete(`/api/subscription-plans/${plan.id}`, true);
      setStatus('پلن غیرفعال شد.');
      await loadData();
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'غیرفعال‌سازی پلن ناموفق بود.');
    }
  };

  return (
    <div className="min-h-screen overflow-hidden bg-[#160022] text-white">
      <Header isAuthenticated userName="Admin" />

      <main className="relative py-10 md:py-16">
        <div className="aurora-grid absolute inset-0 opacity-45" />
        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8 flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
            <div>
              <div className="mb-4 inline-flex rounded-lg border border-white/10 bg-white/[0.06] p-3 text-primary-100">
                <CircleDollarSign className="h-6 w-6" />
              </div>
              <h1 className="text-4xl font-black leading-tight text-white md:text-6xl">مدیریت قیمت‌گذاری</h1>
              <p className="mt-4 max-w-3xl text-base leading-8 text-slate-300 md:text-lg">
                پلن‌های اشتراک را بسازید، قیمت و دوره پرداخت را کنترل کنید، ویژگی‌ها را ویرایش کنید و وضعیت فروش هر پلن را مدیریت کنید.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link href={`/${locale}/pricing`}>
                <Button variant="outline" className="h-12" rightIcon={<ArrowLeft className="h-4 w-4" />}>
                  مشاهده صفحه عمومی
                </Button>
              </Link>
              <Button className="h-12" leftIcon={<Plus className="h-5 w-5" />} onClick={resetForm}>
                ساخت پلن جدید
              </Button>
            </div>
          </div>

          {status && (
            <div className="mb-6 rounded-lg border border-white/10 bg-white/[0.08] px-4 py-3 text-sm font-bold text-slate-200 shadow-xl shadow-black/10">
              {status}
            </div>
          )}

          <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-4">
            <StatCard icon={<Layers3 className="h-5 w-5" />} label="کل پلن‌ها" value={formatFaNumber(stats.total)} />
            <StatCard icon={<Eye className="h-5 w-5" />} label="فعال" value={formatFaNumber(stats.active)} tone="success" />
            <StatCard icon={<EyeOff className="h-5 w-5" />} label="غیرفعال" value={formatFaNumber(stats.inactive)} tone="warning" />
            <StatCard icon={<Activity className="h-5 w-5" />} label="میانگین قیمت فعال" value={formatFaNumber(stats.averagePrice, { maximumFractionDigits: 0 })} />
          </div>

          <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_24rem]">
            <section className="space-y-5">
              <Card className="p-4">
                <div className="grid grid-cols-1 gap-3 lg:grid-cols-[minmax(0,1fr)_12rem_10rem_auto]">
                  <label className="relative">
                    <Search className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                      value={query}
                      onChange={(event) => setQuery(event.target.value)}
                      placeholder="جست‌وجوی نام، slug یا توضیح پلن"
                      className="h-12 w-full rounded-lg border border-white/10 bg-white/[0.08] py-2 pl-4 pr-10 text-sm font-bold text-white outline-none transition focus:border-primary-200 placeholder:text-slate-500"
                    />
                  </label>
                  <select
                    value={typeFilter}
                    onChange={(event) => setTypeFilter(event.target.value as PlanTypeFilter)}
                    className="h-12 rounded-lg border border-white/10 bg-[#241033] px-3 text-sm font-bold text-white outline-none focus:border-primary-200"
                  >
                    <option value="all">همه نوع‌ها</option>
                    {planTypeOptions.map((option) => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                  <select
                    value={statusFilter}
                    onChange={(event) => setStatusFilter(event.target.value as StatusFilter)}
                    className="h-12 rounded-lg border border-white/10 bg-[#241033] px-3 text-sm font-bold text-white outline-none focus:border-primary-200"
                  >
                    <option value="all">همه وضعیت‌ها</option>
                    <option value="active">فعال</option>
                    <option value="inactive">غیرفعال</option>
                  </select>
                  <Button variant="secondary" className="h-12" leftIcon={<RefreshCw className="h-4 w-4" />} onClick={loadData}>
                    تازه‌سازی
                  </Button>
                </div>
              </Card>

              <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                {isLoading ? (
                  Array.from({ length: 4 }).map((_, index) => (
                    <Card key={index} className="h-72 animate-pulse bg-white/[0.06]">
                      <span className="sr-only">در حال بارگذاری</span>
                    </Card>
                  ))
                ) : filteredPlans.length ? (
                  filteredPlans.map((plan) => (
                    <PlanCard
                      key={plan.id}
                      plan={plan}
                      selected={form.id === plan.id}
                      marketName={markets.find((market) => market.id === plan.marketId)?.name}
                      onEdit={() => setForm(planToForm(plan))}
                      onDuplicate={() => duplicatePlan(plan)}
                      onDeactivate={() => deactivatePlan(plan)}
                    />
                  ))
                ) : (
                  <Card className="p-10 text-center lg:col-span-2">
                    <Layers3 className="mx-auto mb-4 h-12 w-12 text-slate-500" />
                    <h2 className="text-2xl font-black text-white">پلنی با این فیلتر پیدا نشد</h2>
                    <p className="mt-3 leading-7 text-slate-400">فیلترها را تغییر دهید یا یک پلن جدید بسازید.</p>
                  </Card>
                )}
              </div>
            </section>

            <aside className="xl:sticky xl:top-24 xl:self-start">
              <Card className="overflow-hidden">
                <div className="border-b border-white/10 bg-white/[0.04] p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h2 className="text-2xl font-black text-white">{form.id ? 'ویرایش پلن' : 'پلن جدید'}</h2>
                      <p className="mt-2 text-sm leading-6 text-slate-400">
                        {selectedType?.description || 'اطلاعات پلن را تکمیل کنید.'}
                      </p>
                    </div>
                    {form.id && (
                      <Button variant="ghost" size="sm" className="px-2" onClick={resetForm}>
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>

                <form onSubmit={savePlan} className="space-y-5 p-5">
                  <FormField label="نام پلن">
                    <input
                      value={form.name}
                      onChange={(event) => updateForm('name', event.target.value)}
                      onBlur={() => {
                        if (!form.slug) updateForm('slug', createSlug(form.name));
                      }}
                      placeholder="مثلاً تحلیل ماهانه"
                      className="admin-input"
                    />
                  </FormField>

                  <FormField label="Slug">
                    <input
                      value={form.slug}
                      onChange={(event) => updateForm('slug', event.target.value)}
                      placeholder="monthly-analysis"
                      dir="ltr"
                      className="admin-input text-left"
                    />
                  </FormField>

                  <div className="grid grid-cols-2 gap-3">
                    <FormField label="قیمت">
                      <input
                        type="number"
                        min="0"
                        value={form.price}
                        onChange={(event) => updateForm('price', event.target.value)}
                        placeholder="0"
                        className="admin-input"
                      />
                    </FormField>
                    <FormField label="واحد">
                      <select value={form.currency} onChange={(event) => updateForm('currency', event.target.value)} className="admin-input">
                        <option value="IRR">ریال</option>
                        <option value="USD">دلار</option>
                      </select>
                    </FormField>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <FormField label="نوع">
                      <select value={form.type} onChange={(event) => updateForm('type', event.target.value as SubscriptionPlan['type'])} className="admin-input">
                        {planTypeOptions.map((option) => (
                          <option key={option.value} value={option.value}>{option.label}</option>
                        ))}
                      </select>
                    </FormField>
                    <FormField label="دوره">
                      <select value={form.billingPeriod} onChange={(event) => updateForm('billingPeriod', event.target.value as SubscriptionPlan['billingPeriod'])} className="admin-input">
                        {billingOptions.map((option) => (
                          <option key={option.value} value={option.value}>{option.label}</option>
                        ))}
                      </select>
                    </FormField>
                  </div>

                  <FormField label="بازار مرتبط">
                    <select value={form.marketId} onChange={(event) => updateForm('marketId', event.target.value)} className="admin-input">
                      <option value="">بدون بازار اختصاصی</option>
                      {markets.map((market) => (
                        <option key={market.id} value={market.id}>{market.name}</option>
                      ))}
                    </select>
                  </FormField>

                  <FormField label="توضیح کوتاه">
                    <textarea
                      value={form.description}
                      onChange={(event) => updateForm('description', event.target.value)}
                      rows={3}
                      placeholder="برای نمایش در صفحه قیمت‌گذاری"
                      className="admin-input min-h-24 resize-none"
                    />
                  </FormField>

                  <div>
                    <div className="mb-2 flex items-center justify-between gap-3">
                      <span className="text-sm font-black text-slate-300">ویژگی‌ها</span>
                      <button type="button" onClick={addFeature} className="text-xs font-black text-primary-100 hover:text-white">
                        افزودن ویژگی
                      </button>
                    </div>
                    <div className="space-y-2">
                      {form.features.map((feature, index) => (
                        <div key={index} className="flex gap-2">
                          <input
                            value={feature}
                            onChange={(event) => updateFeature(index, event.target.value)}
                            placeholder={`ویژگی ${formatFaNumber(index + 1)}`}
                            className="admin-input"
                          />
                          <button
                            type="button"
                            onClick={() => removeFeature(index)}
                            className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border border-white/10 text-slate-400 transition hover:bg-red-500/10 hover:text-red-200"
                            aria-label="حذف ویژگی"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <label className="flex items-center justify-between gap-4 rounded-lg border border-white/10 bg-white/[0.045] p-3">
                    <span>
                      <span className="block text-sm font-black text-white">فروش فعال</span>
                      <span className="mt-1 block text-xs text-slate-400">اگر غیرفعال شود در صفحه عمومی نمایش داده نمی‌شود.</span>
                    </span>
                    <input
                      type="checkbox"
                      checked={form.isActive}
                      onChange={(event) => updateForm('isActive', event.target.checked)}
                      className="h-5 w-5"
                    />
                  </label>

                  <div className="flex gap-3 pt-2">
                    <Button type="submit" fullWidth isLoading={isSaving} leftIcon={<Save className="h-5 w-5" />}>
                      {form.id ? 'ذخیره تغییرات' : 'ساخت پلن'}
                    </Button>
                    <Button type="button" variant="outline" onClick={resetForm}>
                      پاک‌سازی
                    </Button>
                  </div>
                </form>
              </Card>
            </aside>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  tone = 'default',
}: {
  icon: ReactNode;
  label: string;
  value: string;
  tone?: 'default' | 'success' | 'warning';
}) {
  return (
    <Card className="p-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-black text-slate-400">{label}</p>
          <p className="mt-2 font-mono text-2xl font-black text-white">{value}</p>
        </div>
        <div
          className={cn(
            'rounded-lg p-3',
            tone === 'success' ? 'bg-emerald-300/12 text-emerald-200' : tone === 'warning' ? 'bg-amber-300/12 text-amber-200' : 'bg-primary-200/12 text-primary-100',
          )}
        >
          {icon}
        </div>
      </div>
    </Card>
  );
}

function PlanCard({
  plan,
  selected,
  marketName,
  onEdit,
  onDuplicate,
  onDeactivate,
}: {
  plan: SubscriptionPlan;
  selected: boolean;
  marketName?: string;
  onEdit: () => void;
  onDuplicate: () => void;
  onDeactivate: () => void;
}) {
  return (
    <Card className={cn('p-5 transition', selected && 'border-primary-200/70 bg-primary-200/[0.08]')}>
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <Badge variant={plan.isActive ? 'success' : 'neutral'}>{plan.isActive ? 'فعال' : 'غیرفعال'}</Badge>
            <span className="rounded-lg bg-white/[0.07] px-2 py-1 text-xs font-black text-slate-300">{typeLabel[plan.type]}</span>
            {marketName && <span className="rounded-lg bg-white/[0.07] px-2 py-1 text-xs font-black text-primary-100">{marketName}</span>}
          </div>
          <h3 className="text-2xl font-black text-white">{plan.name}</h3>
          <p dir="ltr" className="mt-1 text-left font-mono text-xs font-bold text-slate-500">{plan.slug}</p>
        </div>
        <div className="flex gap-1">
          <IconButton label="ویرایش" onClick={onEdit}><Edit3 className="h-4 w-4" /></IconButton>
          <IconButton label="کپی" onClick={onDuplicate}><Copy className="h-4 w-4" /></IconButton>
          <IconButton label="غیرفعال‌سازی" onClick={onDeactivate} danger><Trash2 className="h-4 w-4" /></IconButton>
        </div>
      </div>

      <p className="mb-5 min-h-[52px] text-sm leading-7 text-slate-300">{plan.description || 'توضیحی برای این پلن ثبت نشده است.'}</p>

      <div className="mb-5 rounded-lg border border-white/10 bg-white/[0.045] p-4">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-black text-slate-400">قیمت</p>
            <p className="mt-1 font-mono text-3xl font-black text-white">{formatPlanPrice(plan)}</p>
          </div>
          <span className="text-sm font-black text-primary-100">/{billingLabel[plan.billingPeriod]}</span>
        </div>
      </div>

      <ul className="space-y-2">
        {plan.features.slice(0, 5).map((feature) => (
          <li key={feature} className="flex items-start gap-2 text-sm leading-6 text-slate-300">
            <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-emerald-200" />
            <span>{feature}</span>
          </li>
        ))}
        {plan.features.length > 5 && (
          <li className="text-xs font-black text-slate-500">+ {formatFaNumber(plan.features.length - 5)} ویژگی دیگر</li>
        )}
      </ul>
    </Card>
  );
}

function IconButton({
  label,
  children,
  onClick,
  danger = false,
}: {
  label: string;
  children: ReactNode;
  onClick: () => void;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={label}
      className={cn(
        'inline-flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 text-slate-300 transition hover:bg-white/10 hover:text-white',
        danger && 'hover:border-red-300/30 hover:bg-red-500/10 hover:text-red-200',
      )}
    >
      {children}
    </button>
  );
}

function FormField({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-black text-slate-300">{label}</span>
      {children}
    </label>
  );
}
