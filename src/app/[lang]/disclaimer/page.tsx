'use client';

import { Header, Card, CardContent } from '@/components';
import { motion } from 'framer-motion';
import { AlertTriangle, Info, ShieldAlert } from 'lucide-react';

export default function DisclaimerPage() {
  return (
    <div className="min-h-screen bg-secondary-50">
      <Header isAuthenticated={false} />

      <main className="py-20 md:py-32">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-6xl font-black text-secondary-900 tracking-tight mb-6">
              Legal <span className="text-red-600">Disclaimer</span>
            </h1>
            <p className="text-xl text-secondary-600 font-medium">
              Please read this financial risk disclosure carefully.
            </p>
          </div>

          <Card className="border-none shadow-xl bg-white overflow-hidden rounded-3xl">
            <CardContent className="p-8 md:p-12 space-y-10">
              <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded-r-2xl mb-10">
                <div className="flex items-center gap-3 mb-2">
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                  <h2 className="text-xl font-bold text-red-900 uppercase tracking-wider">High Risk Warning</h2>
                </div>
                <p className="text-red-800 font-medium">
                  Trading financial markets carries a high level of risk and may not be suitable for all investors. You could lose some or all of your initial investment.
                </p>
              </div>

              <section>
                <div className="flex items-center gap-3 mb-4">
                  <Info className="w-6 h-6 text-primary-600" />
                  <h2 className="text-2xl font-bold text-secondary-900">Not Financial Advice</h2>
                </div>
                <p className="text-secondary-600 leading-relaxed text-lg">
                  The content, analyses, and signals provided by Portfolio Advisor are for educational and informational purposes only. We are not registered financial advisors. Any investment decisions you make are solely your responsibility.
                </p>
              </section>

              <section>
                <div className="flex items-center gap-3 mb-4">
                  <ShieldAlert className="w-6 h-6 text-primary-600" />
                  <h2 className="text-2xl font-bold text-secondary-900">Historical Performance</h2>
                </div>
                <p className="text-secondary-600 leading-relaxed text-lg">
                  Past performance is not indicative of future results. Any testimonials or performance statistics mentioned on this site do not guarantee that you will achieve similar results.
                </p>
              </section>

              <section className="bg-secondary-50 p-8 rounded-2xl border border-secondary-100">
                <h2 className="text-xl font-bold text-secondary-900 mb-4">Accuracy of Information</h2>
                <p className="text-secondary-600 leading-relaxed italic">
                  While we strive for accuracy, market conditions can change rapidly. Portfolio Advisor does not guarantee the completeness or accuracy of any information provided and will not be liable for any losses arising from reliance on our content.
                </p>
              </section>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
