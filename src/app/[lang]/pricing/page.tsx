'use client';

import { useEffect, useState } from 'react';
import { Header, Card, Button, Badge } from '@/components';
import type { Subscription, SubscriptionPlan } from '@/lib/types';
import Link from 'next/link';

export default function PricingPage() {
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'quarterly' | 'yearly'>('monthly');
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loadingPlanId, setLoadingPlanId] = useState<string | null>(null);
  const [message, setMessage] = useState<string>('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [plansRes, subsRes] = await Promise.all([
          fetch('/api/subscription-plans'),
          fetch('/api/subscriptions'),
        ]);

        const [plansData, subsData] = await Promise.all([plansRes.json(), subsRes.json()]);
        setPlans(plansData as SubscriptionPlan[]);
        setSubscriptions(subsData as Subscription[]);
      } catch (error) {
        setMessage('Unable to load plans right now. Please try again later.');
      }
    };

    fetchData();
  }, []);

  const shortTermPlans = plans.filter((p) => p.type === 'timeframe');
  const longTermPlans = plans.filter((p) => p.type === 'long_term');
  const allAccessPlans = plans.filter((p) => p.type === 'market_full' || p.type === 'all_markets');

  const isSubscribed = (planId: string) => subscriptions.some((subscription) => subscription.planId === planId && subscription.isActive);

  const handleSubscribe = async (planId: string) => {
    setLoadingPlanId(planId);
    setMessage('');

    try {
      const response = await fetch('/api/subscriptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId }),
      });
      const data = await response.json();

      if (!response.ok) {
        setMessage(data.error || 'Unable to complete the subscription.');
      } else {
        setSubscriptions((current) => [
          ...current.filter((subscription) => subscription.planId !== planId),
          data.subscription as Subscription,
        ]);
        setMessage('Subscription activated successfully!');
      }
    } catch (error) {
      setMessage('Subscription service is currently unavailable. Please try again later.');
    }

    setLoadingPlanId(null);
  };

  return (
    <div className="min-h-screen bg-white">
      <Header isAuthenticated={false} />

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary-50 to-primary-100 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-secondary-900 mb-4">Simple, Transparent Pricing</h1>
          <p className="text-xl text-secondary-600 mb-8 max-w-2xl mx-auto">
            Choose the perfect plan for your investment needs. Upgrade or downgrade anytime.
          </p>

          {/* Billing Period Toggle */}
          <div className="flex justify-center gap-4 mb-12">
            <button
              onClick={() => setBillingPeriod('monthly')}
              className={`px-6 py-2.5 font-semibold rounded-lg transition-all ${
                billingPeriod === 'monthly'
                  ? 'bg-primary-600 text-white shadow-lg'
                  : 'bg-white text-secondary-900 border-2 border-secondary-200'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingPeriod('quarterly')}
              className={`px-6 py-2.5 font-semibold rounded-lg transition-all ${
                billingPeriod === 'quarterly'
                  ? 'bg-primary-600 text-white shadow-lg'
                  : 'bg-white text-secondary-900 border-2 border-secondary-200'
              }`}
            >
              Quarterly
            </button>
            <button
              onClick={() => setBillingPeriod('yearly')}
              className={`px-6 py-2.5 font-semibold rounded-lg transition-all ${
                billingPeriod === 'yearly'
                  ? 'bg-primary-600 text-white shadow-lg'
                  : 'bg-white text-secondary-900 border-2 border-secondary-200'
              }`}
            >
              Yearly
            </button>
          </div>

          {message ? <p className="mt-4 text-sm text-green-700">{message}</p> : null}
        </div>
      </div>

      {/* Short-term Plans */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-secondary-900 mb-2">Short-term Analysis Plans</h2>
          <p className="text-secondary-600 mb-12">Daily, weekly, and monthly market insights</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {shortTermPlans.map((plan) => (
              <Card key={plan.id} className="flex flex-col h-full hover:shadow-xl transition-shadow">
                <div className="space-y-4 flex-1">
                  <h3 className="text-2xl font-bold text-secondary-900">{plan.name}</h3>
                  <p className="text-secondary-600">{plan.description}</p>

                  <div className="py-4 bg-primary-50 px-4 rounded-lg">
                    <span className="text-4xl font-bold text-primary-600">${plan.price}</span>
                    <span className="text-secondary-600 ml-2">/{plan.billingPeriod}</span>
                  </div>

                  <ul className="space-y-3">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-3">
                        <span className="text-green-600 font-bold mt-1">✓</span>
                        <span className="text-secondary-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <Button
                  fullWidth
                  disabled={isSubscribed(plan.id) || loadingPlanId === plan.id}
                  isLoading={loadingPlanId === plan.id}
                  onClick={() => handleSubscribe(plan.id)}
                >
                  {isSubscribed(plan.id) ? 'Subscribed' : 'Subscribe Now'}
                </Button>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Long-term Plans */}
      <section className="py-20 bg-secondary-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-secondary-900 mb-2">Long-term Analysis Plans</h2>
          <p className="text-secondary-600 mb-12">Strategic quarterly, yearly, and 3-year analyses</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {longTermPlans.map((plan) => (
              <Card key={plan.id} className="flex flex-col h-full hover:shadow-xl transition-shadow">
                <div className="space-y-4 flex-1">
                  <h3 className="text-2xl font-bold text-secondary-900">{plan.name}</h3>
                  <p className="text-secondary-600">{plan.description}</p>

                  <div className="py-4 bg-primary-50 px-4 rounded-lg">
                    <span className="text-4xl font-bold text-primary-600">${plan.price}</span>
                    <span className="text-secondary-600 ml-2">/{plan.billingPeriod}</span>
                  </div>

                  <ul className="space-y-3">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-3">
                        <span className="text-green-600 font-bold mt-1">✓</span>
                        <span className="text-secondary-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <Button
                  fullWidth
                  disabled={isSubscribed(plan.id) || loadingPlanId === plan.id}
                  isLoading={loadingPlanId === plan.id}
                  onClick={() => handleSubscribe(plan.id)}
                >
                  {isSubscribed(plan.id) ? 'Subscribed' : 'Subscribe Now'}
                </Button>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* All-Access Plans */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-secondary-900 mb-2">Premium Access Plans</h2>
          <p className="text-secondary-600 mb-12">Complete access to all markets and analyses</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl">
            {allAccessPlans.map((plan) => (
              <Card
                key={plan.id}
                className={`flex flex-col h-full transition-all ${
                  plan.type === 'all_markets' ? 'border-2 border-primary-600 md:col-span-2 md:w-1/2 mx-auto' : 'hover:shadow-xl'
                }`}
              >
                <div className="space-y-4 flex-1">
                  <div className="flex items-start justify-between">
                    <h3 className="text-2xl font-bold text-secondary-900">{plan.name}</h3>
                    {plan.type === 'all_markets' && <Badge variant="success">Popular</Badge>}
                  </div>
                  <p className="text-secondary-600">{plan.description}</p>

                  <div className="py-4 bg-primary-50 px-4 rounded-lg">
                    <span className="text-4xl font-bold text-primary-600">${plan.price}</span>
                    <span className="text-secondary-600 ml-2">/{plan.billingPeriod}</span>
                  </div>

                  <ul className="space-y-3">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-3">
                        <span className="text-green-600 font-bold mt-1">✓</span>
                        <span className="text-secondary-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <Button
                  fullWidth
                  variant={plan.type === 'all_markets' ? 'primary' : 'secondary'}
                  disabled={isSubscribed(plan.id) || loadingPlanId === plan.id}
                  isLoading={loadingPlanId === plan.id}
                  onClick={() => handleSubscribe(plan.id)}
                >
                  {isSubscribed(plan.id) ? 'Subscribed' : 'Subscribe Now'}
                </Button>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-secondary-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-secondary-900 mb-12 text-center">Frequently Asked Questions</h2>

          <div className="space-y-6">
            {[
              {
                q: 'Can I cancel my subscription anytime?',
                a: 'Yes, you can cancel your subscription at any time without penalties. Your access continues until the end of your billing period.',
              },
              {
                q: 'Is there a refund policy?',
                a: 'We offer a 7-day money-back guarantee for all new subscriptions. If you are not satisfied, contact our support team.',
              },
              {
                q: 'Can I upgrade or downgrade my plan?',
                a: 'Absolutely! You can change your subscription plan at any time. Changes take effect on your next billing cycle.',
              },
              {
                q: 'Do you offer discounts for annual subscriptions?',
                a: 'Yes! Annual subscriptions receive a 15% discount compared to monthly billing. Quarterly plans also offer 5% savings.',
              },
            ].map((item, idx) => (
              <Card key={idx}>
                <h4 className="font-bold text-lg text-secondary-900 mb-2">{item.q}</h4>
                <p className="text-secondary-700">{item.a}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-primary-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">Start Your Premium Investment Experience</h2>
          <p className="text-primary-100 text-lg mb-8 max-w-2xl mx-auto">
            Join thousands of investors who use Portfolio Advisor to make informed decisions and grow their wealth.
          </p>
          <Link href="/auth/signup">
            <Button size="lg" variant="secondary">
              Get Started Now
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
