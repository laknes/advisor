import { NextRequest } from 'next/server';
import { WatchlistService } from '@/server/services/WatchlistService';
import { AddToWatchlistSchema } from '@/lib/validations';
import { handleError, requireAuth, successResponse } from '@/server/middleware';
import { formatZodError } from '@/lib/errors';

export async function GET(req: NextRequest) {
  try {
    const { user } = await requireAuth(req);
    const watchlist = await WatchlistService.getWatchlist(user.id);
    return successResponse({ watchlist });
  } catch (error) {
    return handleError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const { user } = await requireAuth(req);

    const body = await req.json();
    const result = AddToWatchlistSchema.safeParse(body);

    if (!result.success) {
      const errors = formatZodError(result.error);
      return new Response(
        JSON.stringify({ error: 'Validation failed', errors }),
        { status: 400 }
      );
    }

    const item = await WatchlistService.addToWatchlist(
      user.id,
      result.data.symbol,
      result.data.market,
      result.data.name,
    );

    return successResponse({ item }, 'Added to watchlist', 201);
  } catch (error) {
    return handleError(error);
  }
}
