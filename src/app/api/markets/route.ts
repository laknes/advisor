import { NextRequest, NextResponse } from 'next/server';
import { MarketService } from '@/server/services/MarketService';
import { CreateMarketSchema } from '@/lib/validations';
import { formatZodError } from '@/lib/errors';
import { handleError, requireAdmin, successResponse } from '@/server/middleware';

export async function GET(req: NextRequest) {
  try {
    const markets = await MarketService.getAllMarkets();
    return successResponse({ markets });
  } catch (error) {
    return handleError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    await requireAdmin(req);
    const body = await req.json();
    const result = CreateMarketSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: 'Validation failed', errors: formatZodError(result.error) },
        { status: 400 },
      );
    }

    const market = await MarketService.createMarket(result.data);
    return successResponse({ market }, 'Market created successfully', 201);
  } catch (error) {
    return handleError(error);
  }
}
