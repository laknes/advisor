'use client';

import { useEffect, useState } from 'react';
import { Header, Card, CardHeader, CardContent, Button } from '@/components';
import { useLocale } from '@/components/LocaleProvider';
import { getStoredUser } from '@/lib/clientAuth';
import { apiGet, apiPost } from '@/lib/apiClient';
import type { Portfolio, Position } from '@/lib/types';
import Link from 'next/link';

export default function PortfolioPage() {
  const { locale } = useLocale();
  const currentUser = getStoredUser();
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [form, setForm] = useState({ symbol: '', quantity: '', entryPrice: '', type: 'stock' });
  const [message, setMessage] = useState('');

  const loadPortfolio = async () => {
    try {
      const data = await apiGet<{ portfolio: Portfolio }>('/api/portfolio', true);
      setPortfolio(data.portfolio);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Unable to load portfolio.');
    }
  };

  useEffect(() => {
    loadPortfolio();
  }, []);

  const positions: Position[] = portfolio?.positions || [];

  const addPosition = async () => {
    setMessage('');
    try {
      await apiPost('/api/portfolio', {
        symbol: form.symbol.trim().toUpperCase(),
        quantity: Number(form.quantity),
        entryPrice: Number(form.entryPrice),
        type: form.type,
      }, true);
      setForm({ symbol: '', quantity: '', entryPrice: '', type: 'stock' });
      await loadPortfolio();
      setMessage('Position added.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Unable to add position.');
    }
  };

  return (
    <div className="min-h-screen bg-secondary-50">
      <Header isAuthenticated={true} userName={currentUser?.name || 'حساب کاربری'} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-4xl font-bold text-secondary-900 mb-8">My Portfolio</h1>
        {message && <div className="mb-6 rounded-lg border border-secondary-200 bg-white p-4 text-secondary-700">{message}</div>}

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <h3 className="text-secondary-600 text-sm font-medium mb-2">Total Invested</h3>
            <p className="text-3xl font-bold text-secondary-900">${(portfolio?.totalInvested || 0).toLocaleString()}</p>
          </Card>
          <Card>
            <h3 className="text-secondary-600 text-sm font-medium mb-2">Portfolio Value</h3>
            <p className="text-3xl font-bold text-secondary-900">${(portfolio?.totalValue || 0).toLocaleString()}</p>
          </Card>
          <Card>
            <h3 className="text-secondary-600 text-sm font-medium mb-2">Total Return</h3>
            <p className={`text-3xl font-bold ${(portfolio?.totalReturn || 0) >= 0 ? 'text-success' : 'text-danger'}`}>
              ${Math.abs(portfolio?.totalReturn || 0).toLocaleString()}
            </p>
          </Card>
        </div>

        <Card className="mb-8">
          <CardHeader title="Add Position" />
          <CardContent>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-5">
              <input className="form-input" placeholder="Symbol" value={form.symbol} onChange={(event) => setForm((current) => ({ ...current, symbol: event.target.value }))} />
              <input className="form-input" placeholder="Quantity" type="number" value={form.quantity} onChange={(event) => setForm((current) => ({ ...current, quantity: event.target.value }))} />
              <input className="form-input" placeholder="Entry price" type="number" value={form.entryPrice} onChange={(event) => setForm((current) => ({ ...current, entryPrice: event.target.value }))} />
              <select className="form-input" value={form.type} onChange={(event) => setForm((current) => ({ ...current, type: event.target.value }))}>
                <option value="stock">Stock</option>
                <option value="forex">Forex</option>
                <option value="gold">Gold</option>
                <option value="currency">Currency</option>
              </select>
              <Button onClick={addPosition}>Add Position</Button>
            </div>
          </CardContent>
        </Card>

        {/* Positions Table */}
        <Card>
          <CardHeader title="Holdings" />
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b-2 border-secondary-200">
                  <tr>
                    <th className="text-left py-3 px-4 font-semibold text-secondary-700">Symbol</th>
                    <th className="text-right py-3 px-4 font-semibold text-secondary-700">Quantity</th>
                    <th className="text-right py-3 px-4 font-semibold text-secondary-700">Entry Price</th>
                    <th className="text-right py-3 px-4 font-semibold text-secondary-700">Current Price</th>
                    <th className="text-right py-3 px-4 font-semibold text-secondary-700">Value</th>
                    <th className="text-right py-3 px-4 font-semibold text-secondary-700">Return</th>
                    <th className="text-center py-3 px-4 font-semibold text-secondary-700">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {positions.map((pos) => (
                    <tr key={pos.id} className="border-b border-secondary-100 hover:bg-secondary-50">
                      <td className="py-4 px-4 font-semibold text-secondary-900">{pos.symbol}</td>
                      <td className="text-right py-4 px-4 text-secondary-700">{pos.quantity}</td>
                      <td className="text-right py-4 px-4 text-secondary-700">${pos.entryPrice}</td>
                      <td className="text-right py-4 px-4 font-semibold text-secondary-900">${pos.currentPrice}</td>
                      <td className="text-right py-4 px-4 font-semibold text-secondary-900">
                        ${(pos.currentPrice * pos.quantity).toLocaleString()}
                      </td>
                      <td className={`text-right py-4 px-4 font-semibold ${pos.profitLoss > 0 ? 'text-success' : 'text-danger'}`}>
                        ${pos.profitLoss.toLocaleString()}
                      </td>
                      <td className="text-center py-4 px-4">
                        <Button size="sm" variant="outline">
                          Edit
                        </Button>
                      </td>
                    </tr>
                  ))}
                  {!positions.length && (
                    <tr>
                      <td colSpan={7} className="py-6 px-4 text-center text-secondary-600">No positions in your portfolio yet.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <div className="mt-8 flex gap-4">
          <Link href={`/${locale}/dashboard`}>
            <Button variant="outline">Back to Dashboard</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
