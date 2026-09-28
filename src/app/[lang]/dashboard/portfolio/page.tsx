'use client';

import { useEffect, useState } from 'react';
import { Header, Card, CardHeader, CardContent, Button } from '@/components';
import { useLocale } from '@/components/LocaleProvider';
import { getStoredUser } from '@/lib/clientAuth';
import { apiDelete, apiGet, apiPost, apiPut } from '@/lib/apiClient';
import type { Market, Portfolio, Position, Price } from '@/lib/types';

const assetTypes = [
  { value: 'stock', label: 'بورس ایران' },
  { value: 'crypto', label: 'رمز ارز' },
  { value: 'forex', label: 'جفت ارزها' },
  { value: 'gold', label: 'طلا ریال' },
  { value: 'currency', label: 'ارز' },
] as const;

const tomanPerDollar = 60000;

function formatMoney(value: number, currency: 'IRR' | 'USD') {
  return new Intl.NumberFormat('fa-IR', {
    maximumFractionDigits: currency === 'USD' ? 2 : 0,
  }).format(value) + (currency === 'USD' ? ' دلار' : ' ریال');
}

export default function PortfolioPage() {
  const currentUser = getStoredUser();
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [prices, setPrices] = useState<Price[]>([]);
  const [form, setForm] = useState({ symbol: '', quantity: '', entryPrice: '', type: 'stock' });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [message, setMessage] = useState('');

  const loadPortfolio = async () => {
    try {
      const [portfolioData, marketsData] = await Promise.all([
        apiGet<{ portfolio: Portfolio }>('/api/portfolio', true),
        apiGet<{ markets: Array<Market & { prices?: Price[] }> }>('/api/markets'),
      ]);
      setPortfolio(portfolioData.portfolio);
      setPrices(marketsData.markets.flatMap((market) => market.prices ?? []));
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'امکان دریافت پورتفو وجود ندارد.');
    }
  };

  useEffect(() => {
    loadPortfolio();
  }, []);

  const positions: Position[] = portfolio?.positions || [];
  const priceBySymbol = new Map(prices.map((price) => [price.symbol.toUpperCase(), price]));
  const enrichedPositions = positions.map((position) => {
    const livePrice = priceBySymbol.get(position.symbol.toUpperCase())?.currentPrice ?? position.currentPrice;
    const totalCost = position.quantity * position.entryPrice;
    const currentValue = position.quantity * livePrice;
    const profitLoss = currentValue - totalCost;
    const profitLossPercent = totalCost > 0 ? (profitLoss / totalCost) * 100 : 0;
    const isRial = position.type === 'stock' || position.type === 'gold';
    return { ...position, livePrice, totalCost, currentValue, profitLoss, profitLossPercent, isRial };
  });
  const rialValue = enrichedPositions.filter((position) => position.isRial).reduce((sum, position) => sum + position.currentValue, 0);
  const dollarValue = enrichedPositions.filter((position) => !position.isRial).reduce((sum, position) => sum + position.currentValue, 0);
  const rialValueAsDollar = rialValue / tomanPerDollar;
  const totalInvested = enrichedPositions.reduce((sum, position) => sum + position.totalCost, 0);
  const totalReturn = enrichedPositions.reduce((sum, position) => sum + position.profitLoss, 0);

  const addPosition = async () => {
    setMessage('');
    try {
      const payload = {
        symbol: form.symbol.trim().toUpperCase(),
        quantity: Number(form.quantity),
        entryPrice: Number(form.entryPrice),
        type: form.type,
      };

      if (editingId) {
        await apiPut(`/api/portfolio/${editingId}`, {
          quantity: payload.quantity,
          currentPrice: priceBySymbol.get(payload.symbol)?.currentPrice || payload.entryPrice,
        }, true);
      } else {
        await apiPost('/api/portfolio', payload, true);
      }
      setForm({ symbol: '', quantity: '', entryPrice: '', type: 'stock' });
      setEditingId(null);
      await loadPortfolio();
      setMessage(editingId ? 'دارایی ویرایش شد.' : 'دارایی اضافه شد.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'امکان ذخیره دارایی وجود ندارد.');
    }
  };

  const startEdit = (position: Position) => {
    setEditingId(position.id);
    setForm({
      symbol: position.symbol,
      quantity: String(position.quantity),
      entryPrice: String(position.entryPrice),
      type: position.type,
    });
  };

  const removePosition = async (id: string) => {
    setMessage('');
    try {
      await apiDelete(`/api/portfolio/${id}`, true);
      await loadPortfolio();
      setMessage('دارایی حذف شد.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'امکان حذف دارایی وجود ندارد.');
    }
  };

  return (
    <div className="site-page min-h-screen bg-secondary-50">
      <Header isAuthenticated={true} userName={currentUser?.name || 'حساب کاربری'} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-4xl font-bold text-secondary-900 mb-8">پورتفوی من</h1>
        {message && <div className="mb-6 rounded-lg border border-secondary-200 bg-white p-4 text-secondary-700">{message}</div>}

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <h3 className="text-secondary-600 text-sm font-medium mb-2">مجموع سرمایه‌گذاری</h3>
            <p className="text-3xl font-bold text-secondary-900">{formatMoney(totalInvested, 'USD')}</p>
          </Card>
          <Card>
            <h3 className="text-secondary-600 text-sm font-medium mb-2">ارزش دارایی ریالی</h3>
            <p className="text-3xl font-bold text-secondary-900">{formatMoney(rialValue, 'IRR')}</p>
            <p className="mt-2 text-sm font-bold text-secondary-600">حدود {formatMoney(rialValueAsDollar, 'USD')}</p>
          </Card>
          <Card>
            <h3 className="text-secondary-600 text-sm font-medium mb-2">ارزش دارایی دلاری</h3>
            <p className="text-3xl font-bold text-secondary-900">{formatMoney(dollarValue, 'USD')}</p>
          </Card>
          <Card>
            <h3 className="text-secondary-600 text-sm font-medium mb-2">سود/زیان کل</h3>
            <p className={`text-3xl font-bold ${totalReturn >= 0 ? 'text-success' : 'text-danger'}`}>
              {formatMoney(Math.abs(totalReturn), 'USD')}
            </p>
          </Card>
        </div>

        <Card className="mb-8">
          <CardHeader title={editingId ? 'ویرایش دارایی' : 'افزودن دارایی'} />
          <CardContent>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-5">
              <input className="form-input" placeholder="نماد" value={form.symbol} disabled={Boolean(editingId)} onChange={(event) => setForm((current) => ({ ...current, symbol: event.target.value }))} />
              <input className="form-input" placeholder="تعداد" type="number" value={form.quantity} onChange={(event) => setForm((current) => ({ ...current, quantity: event.target.value }))} />
              <input className="form-input" placeholder="قیمت ورود" type="number" value={form.entryPrice} disabled={Boolean(editingId)} onChange={(event) => setForm((current) => ({ ...current, entryPrice: event.target.value }))} />
              <select className="form-input" value={form.type} disabled={Boolean(editingId)} onChange={(event) => setForm((current) => ({ ...current, type: event.target.value }))}>
                {assetTypes.map((type) => <option key={type.value} value={type.value}>{type.label}</option>)}
              </select>
              <Button onClick={addPosition}>{editingId ? 'ثبت ویرایش' : 'افزودن دارایی'}</Button>
            </div>
            <p className="mt-4 text-sm leading-7 text-secondary-600">ارزش و سود/زیان با آخرین قیمت موجود در مارکت سایت محاسبه می‌شود. بروزرسانی خودکار ساعت ۱۶ نیازمند فعال‌سازی cron سمت سرور است.</p>
          </CardContent>
        </Card>

        {/* Positions Table */}
        <Card>
          <CardHeader title="دارایی‌ها" />
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b-2 border-secondary-200">
                  <tr>
                    <th className="text-right py-3 px-4 font-semibold text-secondary-700">نماد</th>
                    <th className="text-right py-3 px-4 font-semibold text-secondary-700">تعداد</th>
                    <th className="text-right py-3 px-4 font-semibold text-secondary-700">قیمت ورود</th>
                    <th className="text-right py-3 px-4 font-semibold text-secondary-700">قیمت مارکت</th>
                    <th className="text-right py-3 px-4 font-semibold text-secondary-700">ارزش</th>
                    <th className="text-right py-3 px-4 font-semibold text-secondary-700">سود/زیان</th>
                    <th className="text-center py-3 px-4 font-semibold text-secondary-700">عملیات</th>
                  </tr>
                </thead>
                <tbody>
                  {enrichedPositions.map((pos) => (
                    <tr key={pos.id} className="border-b border-secondary-100 hover:bg-secondary-50">
                      <td className="py-4 px-4 font-semibold text-secondary-900">{pos.symbol}</td>
                      <td className="text-right py-4 px-4 text-secondary-700">{pos.quantity}</td>
                      <td className="text-right py-4 px-4 text-secondary-700">{formatMoney(pos.entryPrice, pos.isRial ? 'IRR' : 'USD')}</td>
                      <td className="text-right py-4 px-4 font-semibold text-secondary-900">{formatMoney(pos.livePrice, pos.isRial ? 'IRR' : 'USD')}</td>
                      <td className="text-right py-4 px-4 font-semibold text-secondary-900">
                        {formatMoney(pos.currentValue, pos.isRial ? 'IRR' : 'USD')}
                      </td>
                      <td className={`text-right py-4 px-4 font-semibold ${pos.profitLoss > 0 ? 'text-success' : 'text-danger'}`}>
                        {formatMoney(Math.abs(pos.profitLoss), pos.isRial ? 'IRR' : 'USD')} ({pos.profitLossPercent.toFixed(2)}٪)
                      </td>
                      <td className="text-center py-4 px-4">
                        <div className="flex justify-center gap-2">
                          <Button size="sm" variant="outline" onClick={() => startEdit(pos)}>ویرایش</Button>
                          <Button size="sm" variant="ghost" onClick={() => removePosition(pos.id)}>حذف</Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {!positions.length && (
                    <tr>
                      <td colSpan={7} className="py-6 px-4 text-center text-secondary-600">هنوز موقعیتی در پورتفوی شما ثبت نشده است.</td>
                    </tr>
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

