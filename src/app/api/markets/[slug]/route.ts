import { NextRequest, NextResponse } from 'next/server';
import { MarketService } from '@/server/services/MarketService';
import { UpdateMarketSchema } from '@/lib/validations';
import { formatZodError } from '@/lib/errors';
import { handleError, requireAdmin, successResponse } from '@/server/middleware';
import { verifyToken } from '@/lib/auth';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const token = req.headers.get('authorization')?.replace('Bearer ', '');
    const userId = token ? verifyToken(token)?.userId : undefined;
    const market = await MarketService.getMarketBySlug(slug, userId);
    return successResponse({ market });
  } catch (error) {
    return handleError(error);
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    await requireAdmin(req);
    const { slug } = await params;
    const market = await MarketService.getMarketBySlug(slug);
    const body = await req.json();
    const result = UpdateMarketSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: 'Validation failed', errors: formatZodError(result.error) },
        { status: 400 },
      );
    }

    const updated = await MarketService.updateMarket(market.id, result.data);
    return successResponse({ market: updated }, 'Market updated successfully');
  } catch (error) {
    return handleError(error);
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    await requireAdmin(req);
    const { slug } = await params;
    const market = await MarketService.getMarketBySlug(slug);
    await MarketService.deleteMarket(market.id);
    return successResponse(null, 'Market deleted successfully');
  } catch (error) {
    return handleError(error);
  }
}
