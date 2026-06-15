'use client';

import { Header, Card, CardContent } from '@/components';
import { motion } from 'framer-motion';
import { ShieldCheck, FileText, Scale } from 'lucide-react';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-secondary-50">
      <Header isAuthenticated={false} />

      <main className="py-20 md:py-32">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-6xl font-black text-secondary-900 tracking-tight mb-6">
              Terms of <span className="text-primary-600">Service</span>
            </h1>
            <p className="text-xl text-secondary-600 font-medium">
              Last updated: June 08, 2026
            </p>
          </div>

          <Card className="border-none shadow-xl bg-white overflow-hidden rounded-3xl">
            <CardContent className="p-8 md:p-12 space-y-10">
              <section>
                <div className="flex items-center gap-3 mb-4">
                  <FileText className="w-6 h-6 text-primary-600" />
                  <h2 className="text-2xl font-bold text-secondary-900">1. Acceptance of Terms</h2>
                </div>
                <p className="text-secondary-600 leading-relaxed text-lg">
                  By accessing and using Portfolio Advisor, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our services.
                </p>
              </section>

              <section>
                <div className="flex items-center gap-3 mb-4">
                  <ShieldCheck className="w-6 h-6 text-primary-600" />
                  <h2 className="text-2xl font-bold text-secondary-900">2. Use of Service</h2>
                </div>
                <p className="text-secondary-600 leading-relaxed text-lg">
                  Our platform provides market analysis and investment signals for informational purposes only. You are responsible for maintaining the confidentiality of your account and password.
                </p>
              </section>

              <section>
                <div className="flex items-center gap-3 mb-4">
                  <Scale className="w-6 h-6 text-primary-600" />
                  <h2 className="text-2xl font-bold text-secondary-900">3. Subscription and Billing</h2>
                </div>
                <p className="text-secondary-600 leading-relaxed text-lg">
                  Subscriptions are billed in advance on a recurring basis. You may cancel your subscription at any time, but no refunds will be provided for partial billing periods.
                </p>
              </section>

              <section className="bg-secondary-50 p-8 rounded-2xl border border-secondary-100">
                <h2 className="text-xl font-bold text-secondary-900 mb-4">4. Intellectual Property</h2>
                <p className="text-secondary-600 leading-relaxed italic">
                  All content, analyses, and signals provided through Portfolio Advisor are the intellectual property of the platform and may not be shared, redistributed, or resold without explicit written permission.
                </p>
              </section>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
