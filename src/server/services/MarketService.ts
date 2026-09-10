import { prisma } from '@/lib/db';
import { NotFoundError } from '@/lib/errors';
import { SubscriptionService } from './SubscriptionService';

export class MarketService {
  /**
   * Get all markets
   */
  static async getAllMarkets() {
    const markets = await prisma.market.findMany({
      orderBy: { name: 'asc' },
      include: {
        prices: {
          orderBy: { timestamp: 'desc' },
          take: 1,
        },
      },
    });

    return markets;
  }

  /**
   * Get market by slug
   */
  static async getMarketBySlug(slug: string, userId?: string) {
    const market = await prisma.market.findUnique({
      where: { slug },
      include: {
        analyses: {
          orderBy: { publishedAt: 'desc' },
          take: 10,
          select: {
            id: true,
            marketId: true,
            title: true,
            summary: true,
            timeframe: true,
            analysisType: true,
            signal: true,
            riskLevel: true,
            entryZone: true,
            exitZone: true,
            accuracy: true,
            isLocked: true,
            requiredSubscription: true,
            accessLevel: true,
            publishedAt: true,
            expiresAt: true,
          },
        },
        prices: {
          orderBy: { timestamp: 'desc' },
          take: 1,
        },
      },
    });

    if (!market) {
      throw new NotFoundError('Market');
    }

    const analyses = await Promise.all(market.analyses.map(async (analysis) => {
      const hasAccess = analysis.accessLevel === 'public'
        || (analysis.accessLevel === 'login' && Boolean(userId))
        || (analysis.accessLevel === 'subscription' && userId
          ? await SubscriptionService.hasAccessToMarketAnalysis(userId, analysis.marketId, analysis.requiredSubscription)
          : false);

      return hasAccess ? { ...analysis, isLocked: false } : { ...analysis, isLocked: true };
    }));

    return { ...market, analyses };
  }

  /**
   * Get market by ID
   */
  static async getMarketById(id: string) {
    const market = await prisma.market.findUnique({
      where: { id },
    });

    if (!market) {
      throw new NotFoundError('Market');
    }

    return market;
  }

  /**
   * Create market (admin only)
   */
  static async createMarket(data: any) {
    const market = await prisma.market.create({
      data,
    });

    return market;
  }

  /**
   * Update market (admin only)
   */
  static async updateMarket(id: string, data: any) {
    const market = await prisma.market.update({
      where: { id },
      data,
    });

    return market;
  }

  static async deleteMarket(id: string) {
    const market = await prisma.market.findUnique({
      where: { id },
    });

    if (!market) {
      throw new NotFoundError('Market');
    }

    await prisma.market.delete({
      where: { id },
    });
  }
}
