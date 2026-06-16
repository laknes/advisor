'use client';

import { Header, Card, CardHeader, CardContent, Button } from '@/components';
import { useLocale } from '@/components/LocaleProvider';
import { getStoredUser } from '@/lib/clientAuth';
import Link from 'next/link';

export default function PortfolioPage() {
  const { locale } = useLocale();
  const currentUser = getStoredUser();
  const positions = [
    { symbol: 'TEPIX', quantity: 100, entryPrice: 1500, currentPrice: 1625, profitLoss: 12500 },
    { symbol: 'EUR/USD', quantity: 50000, entryPrice: 1.08, currentPrice: 1.095, profitLoss: 750 },
    { symbol: 'GOLD', quantity: 10, entryPrice: 2300, currentPrice: 2454, profitLoss: 1540 },
  ];

  const totalInvested = positions.reduce((sum, p) => sum + p.entryPrice * p.quantity, 0);
  const totalValue = positions.reduce((sum, p) => sum + p.currentPrice * p.quantity, 0);
  const totalReturn = totalValue - totalInvested;

  return (
    <div className="min-h-screen bg-secondary-50">
      <Header isAuthenticated={true} userName={currentUser?.name || 'حساب کاربری'} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-4xl font-bold text-secondary-900 mb-8">My Portfolio</h1>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <h3 className="text-secondary-600 text-sm font-medium mb-2">Total Invested</h3>
            <p className="text-3xl font-bold text-secondary-900">${totalInvested.toLocaleString()}</p>
          </Card>
          <Card>
            <h3 className="text-secondary-600 text-sm font-medium mb-2">Portfolio Value</h3>
            <p className="text-3xl font-bold text-secondary-900">${totalValue.toLocaleString()}</p>
          </Card>
          <Card>
            <h3 className="text-secondary-600 text-sm font-medium mb-2">Total Return</h3>
            <p className={`text-3xl font-bold ${totalReturn > 0 ? 'text-success' : 'text-danger'}`}>
              ${Math.abs(totalReturn).toLocaleString()}
            </p>
          </Card>
        </div>

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
                  {positions.map((pos, idx) => (
                    <tr key={idx} className="border-b border-secondary-100 hover:bg-secondary-50">
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
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <div className="mt-8 flex gap-4">
          <Link href={`/${locale}/dashboard`}>
            <Button variant="outline">Back to Dashboard</Button>
          </Link>
          <Button>Add Position</Button>
        </div>
      </div>
    </div>
  );
}
