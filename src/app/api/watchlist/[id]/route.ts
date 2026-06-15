import { NextRequest } from 'next/server';
import { WatchlistService } from '@/server/services/WatchlistService';
import { handleError, requireAuth, successResponse } from '@/server/middleware';

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { user } = await requireAuth(req);
    await WatchlistService.removeFromWatchlist(user.id, id);
    return successResponse(null, 'Removed from watchlist');
  } catch (error) {
    return handleError(error);
  }
}
