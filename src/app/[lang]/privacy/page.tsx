'use client';

import { Header, Button } from '@/components';
import Link from 'next/link';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white">
      <Header isAuthenticated={false} />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Link href="/" className="text-primary-600 hover:text-primary-700 mb-8 inline-block">
          ← Back to Home
        </Link>

        <h1 className="text-4xl font-bold text-secondary-900 mb-8">Privacy Policy</h1>

        <div className="prose prose-lg max-w-none space-y-6 text-secondary-700">
          <section>
            <h2 className="text-2xl font-bold text-secondary-900 mt-8 mb-4">1. Introduction</h2>
            <p>
              Portfolio Advisor ("we", "our", or "us") operates the Portfolio Advisor website and mobile application (the "Service").
              This page informs you of our policies regarding the collection, use, and disclosure of personal data when you use our Service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-secondary-900 mt-8 mb-4">2. Information Collection and Use</h2>
            <p>We collect several different types of information for various purposes to provide and improve our Service:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Personal Data: Name, email address, phone number, postal address</li>
              <li>Usage Data: Browser type, pages visited, time and date of visit</li>
              <li>Investment Data: Portfolio holdings, watchlist items, subscription preferences</li>
              <li>Cookies and Tracking Data: Device identifiers, analytics data</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-secondary-900 mt-8 mb-4">3. Use of Data</h2>
            <p>Portfolio Advisor uses the collected data for various purposes:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>To provide and maintain our Service</li>
              <li>To notify you about changes to our Service</li>
              <li>To provide customer support</li>
              <li>To gather analysis and valuable information to improve our Service</li>
              <li>To monitor the usage of our Service</li>
              <li>To send promotional communications (with your consent)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-secondary-900 mt-8 mb-4">4. Security of Data</h2>
            <p>
              The security of your data is important to us but remember that no method of transmission over the Internet or method of electronic storage
              is 100% secure. While we strive to use commercially acceptable means to protect your personal data, we cannot guarantee its absolute security.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-secondary-900 mt-8 mb-4">5. Contact Us</h2>
            <p>
              If you have any questions about this Privacy Policy, please contact us at{' '}
              <a href="mailto:privacy@portfolioadvisor.com" className="text-primary-600 hover:text-primary-700">
                privacy@portfolioadvisor.com
              </a>
            </p>
          </section>
        </div>

        <div className="mt-12">
          <Link href="/">
            <Button variant="outline">← Back to Home</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
