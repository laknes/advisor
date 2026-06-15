'use client';

import { Header, Footer, Card, CardHeader, CardContent, Button, Badge } from '@/components';
import { motion } from 'framer-motion';
import { 
  DollarSign, 
  Plus, 
  Settings, 
  Trash2, 
  Edit3, 
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { mockSubscriptionPlans } from '@/lib/mockData';

export default function AdminPricingPage() {
  return (
    <div className="min-h-screen bg-secondary-50">
      <Header isAuthenticated={true} userName="Admin" />

      <main className="py-12 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-6">
            <div>
              <h1 className="text-4xl font-black text-secondary-900 tracking-tight">Pricing & <span className="text-primary-600">Plans</span></h1>
              <p className="text-lg text-secondary-500 font-medium">Manage your subscription models and pricing strategy</p>
            </div>
            <Button size="lg" className="shadow-lg shadow-primary-200 px-8 h-14" leftIcon={<Plus className="w-5 h-5" />}>
              Create New Plan
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {mockSubscriptionPlans.map((plan) => (
              <Card key={plan.id} className="border-none shadow-xl bg-white overflow-hidden group">
                <div className="p-6 border-b border-secondary-50 bg-secondary-50/50">
                  <div className="flex justify-between items-start mb-4">
                    <Badge variant={plan.isActive ? 'success' : 'neutral'}>
                      {plan.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                    <div className="flex gap-1">
                      <Button size="sm" variant="ghost" className="p-2 h-auto text-secondary-400 hover:text-blue-600"><Edit3 className="w-4 h-4" /></Button>
                      <Button size="sm" variant="ghost" className="p-2 h-auto text-secondary-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></Button>
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-secondary-900 mb-1">{plan.name}</h3>
                  <p className="text-sm text-secondary-500 font-medium">{plan.type.replace('_', ' ').toUpperCase()}</p>
                </div>
                <CardContent className="p-6">
                  <div className="mb-6">
                    <span className="text-4xl font-black text-secondary-900">${plan.price}</span>
                    <span className="text-secondary-400 font-bold ml-2">/{plan.billingPeriod}</span>
                  </div>
                  <ul className="space-y-3 mb-8">
                    {plan.features.slice(0, 3).map((f, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm text-secondary-600">
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                        <span>{f}</span>
                      </li>
                    ))}
                    {plan.features.length > 3 && (
                      <li className="text-xs text-secondary-400 font-bold ml-6">+ {plan.features.length - 3} more features</li>
                    )}
                  </ul>
                  <Button variant="outline" fullWidth className="group-hover:bg-primary-600 group-hover:text-white group-hover:border-primary-600 transition-all">
                    Edit Plan Details
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
