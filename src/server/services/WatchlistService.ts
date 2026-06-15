import { prisma } from '@/lib/db';
import { NotFoundError } from '@/lib/errors';

export class WatchlistService {
  /**
   * Get user watchlist
   */
  static async getWatchlist(userId: string) {
    const watchlist = await prisma.watchlist.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    return watchlist;
  }

  /**
   * Add to watchlist
   */
  static async addToWatchlist(userId: string, symbol: string, market: string, name?: string) {
    // Check if already in watchlist
    const existing = await prisma.watchlist.findFirst({
      where: {
        userId,
        symbol,
      },
    });

    if (existing) {
      return existing;
    }

    const watchlistItem = await prisma.watchlist.create({
      data: {
        userId,
        symbol,
        market,
        name,
      },
    });

    return watchlistItem;
  }

  /**
   * Remove from watchlist
   */
  static async removeFromWatchlist(userId: string, watchlistId: string) {
    const item = await prisma.watchlist.findUnique({
      where: { id: watchlistId },
    });

    if (!item || item.userId !== userId) {
      throw new NotFoundError('Watchlist item');
    }

    await prisma.watchlist.delete({
      where: { id: watchlistId },
    });
  }
}
