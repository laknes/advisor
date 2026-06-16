import { NextRequest } from 'next/server';
import { MarketDataService } from '@/server/services/MarketDataService';
import { handleError, requireAdmin, successResponse } from '@/server/middleware';

export async function GET(req: NextRequest) {
  try {
    await requireAdmin(req);
    const status = await MarketDataService.getIntegrationStatus();
    return successResponse({ status });
  } catch (error) {
    return handleError(error);
  }
}
