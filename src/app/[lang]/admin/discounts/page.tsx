'use client';

import { Header, Footer, Card, CardHeader, CardContent, Button, Badge, Input } from '@/components';
import { motion } from 'framer-motion';
import { 
  Percent, 
  Plus, 
  Trash2, 
  Calendar, 
  Tag, 
  Search,
  CheckCircle2
} from 'lucide-react';

export default function AdminDiscountsPage() {
  const discounts = [
    { code: 'WELCOME20', type: 'percentage', value: '20%', status: 'active', usage: '124/500', expiry: '2026-12-31' },
    { code: 'VIPGOLD', type: 'fixed', value: '$50', status: 'active', usage: '45/100', expiry: '2026-08-15' },
    { code: 'SUMMER26', type: 'percentage', value: '15%', status: 'expired', usage: '200/200', expiry: '2026-06-01' },
  ];

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
            <Button size="lg" className="shadow-lg shadow-primary-200 px-8 h-14" leftIcon={<Plus className="w-5 h-5" />}>
              Create Discount
            </Button>
          </div>

          <Card className="border-none shadow-xl bg-white overflow-hidden">
            <CardHeader 
              title="Active Coupons" 
              action={
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary-400" />
                  <input type="text" placeholder="Search codes..." className="pl-10 pr-4 py-2 bg-secondary-50 border border-secondary-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 w-64" />
                </div>
              }
            />
            <CardContent className="p-0">
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
                    {discounts.map((discount, i) => (
                      <tr key={i} className="hover:bg-secondary-50/50 transition-colors group">
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
                            <span className="text-sm font-bold text-secondary-900">{discount.value} Off</span>
                            <span className="text-[10px] font-bold text-secondary-400 uppercase">{discount.type}</span>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-1.5 w-24 bg-secondary-100 rounded-full overflow-hidden">
                              <div className={`h-full bg-primary-500`} style={{ width: '40%' }} />
                            </div>
                            <span className="text-xs font-bold text-secondary-600">{discount.usage}</span>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-2 text-secondary-600">
                            <Calendar className="w-4 h-4 text-secondary-400" />
                            <span className="text-sm font-medium">{discount.expiry}</span>
                          </div>
                        </td>
                        <td className="py-4 px-6 text-center">
                          <Badge variant={discount.status === 'active' ? 'success' : 'neutral'}>
                            {discount.status.toUpperCase()}
                          </Badge>
                        </td>
                        <td className="py-4 px-6 text-right">
                          <Button size="sm" variant="ghost" className="p-2 h-auto text-secondary-400 hover:text-red-600">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
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
