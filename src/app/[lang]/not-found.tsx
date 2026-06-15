'use client';

import { Header, Card, Button } from '@/components';
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-white">
      <Header isAuthenticated={false} />

      <div className="flex items-center justify-center min-h-[calc(100vh-64px)]">
        <Card className="max-w-lg text-center">
          <div className="space-y-6">
            <div className="text-8xl font-bold text-primary-600">404</div>
            <h1 className="text-4xl font-bold text-secondary-900">Page Not Found</h1>
            <p className="text-secondary-600 text-lg">
              Sorry, we couldn't find the page you're looking for. It might have been moved or deleted.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/">
                <Button fullWidth>Go Home</Button>
              </Link>
              <Link href="/markets">
                <Button fullWidth variant="outline">
                  Browse Markets
                </Button>
              </Link>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
