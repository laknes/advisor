'use client';

import { use, useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, LockKeyhole } from 'lucide-react';
import { Badge, Button, Card, CardContent, Header, useLocale } from '@/components';
import { apiGet } from '@/lib/apiClient';
import { getStoredToken } from '@/lib/clientAuth';
import type { Analysis } from '@/lib/types';

interface AnalysisDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function AnalysisDetailPage({ params: paramsPromise }: AnalysisDetailPageProps) {
  const params = use(paramsPromise);
  const { locale } = useLocale();
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    apiGet<{ analysis: Analysis }>(`/api/analyses/${params.id}`, Boolean(getStoredToken()))
      .then((data) => setAnalysis(data.analysis))
      .catch((requestError) => setError(requestError instanceof Error ? requestError.message : 'تحلیل پیدا نشد.'));
  }, [params.id]);

  return (
    <div className="min-h-screen bg-secondary-50">
      <Header />
      <main className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        <Link href={`/${locale}/analyses`} className="mb-8 inline-flex items-center gap-2 font-bold text-primary-700">
          <ArrowRight className="h-4 w-4" />
          بازگشت به تحلیل‌ها
        </Link>

        {error ? (
          <Card><CardContent><p className="text-red-700">{error}</p></CardContent></Card>
        ) : !analysis ? (
          <Card><CardContent><p className="text-secondary-700">در حال بارگذاری تحلیل...</p></CardContent></Card>
        ) : (
          <Card>
            <CardContent className="space-y-7 p-7 md:p-10">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-black text-primary-700">{analysis.market?.name || 'بازار'}</p>
                  <h1 className="mt-2 text-3xl font-black leading-tight text-secondary-900">{analysis.title}</h1>
                </div>
                <Badge variant={analysis.signal === 'BUY' ? 'success' : analysis.signal === 'SELL' ? 'danger' : 'warning'}>
                  {analysis.signal}
                </Badge>
              </div>

              <p className="leading-8 text-secondary-700">{analysis.summary}</p>

              {analysis.fullContent ? (
                <article className="whitespace-pre-wrap border-t border-secondary-100 pt-7 text-lg leading-9 text-secondary-800">
                  {analysis.fullContent}
                </article>
              ) : (
                <div className="rounded-xl border border-amber-200 bg-amber-50 p-6 text-center">
                  <LockKeyhole className="mx-auto mb-3 h-8 w-8 text-amber-600" />
                  <p className="font-bold text-amber-900">
                    {analysis.accessLevel === 'login' ? 'برای مشاهده متن کامل، ابتدا وارد حساب کاربری شوید.' : 'برای مشاهده متن کامل، اشتراک مورد نیاز است.'}
                  </p>
                  <Link href={analysis.accessLevel === 'login' ? `/${locale}/auth/login?redirect=/${locale}/analyses/${analysis.id}` : `/${locale}/pricing`} className="mt-5 inline-block">
                    <Button>{analysis.accessLevel === 'login' ? 'ورود به حساب' : 'مشاهده پلن‌ها'}</Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
