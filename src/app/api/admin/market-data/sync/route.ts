import { NextRequest } from 'next/server';
import { MarketDataService } from '@/server/services/MarketDataService';
import { handleError, requireAdmin, successResponse } from '@/server/middleware';

export async function POST(req: NextRequest) {
  try {
    await requireAdmin(req);
    const result = await MarketDataService.syncConfiguredPrices();
    return successResponse({ result }, 'Market data sync completed');
  } catch (error) {
    return handleError(error);
  }
}
