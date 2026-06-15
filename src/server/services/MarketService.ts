import { prisma } from '@/lib/db';
import { NotFoundError } from '@/lib/errors';

export class MarketService {
  /**
   * Get all markets
   */
  static async getAllMarkets() {
    const markets = await prisma.market.findMany({
      orderBy: { name: 'asc' },
    });

    return markets;
  }

  /**
   * Get market by slug
   */
  static async getMarketBySlug(slug: string) {
    const market = await prisma.market.findUnique({
      where: { slug },
      include: {
        analyses: {
          orderBy: { publishedAt: 'desc' },
          take: 10,
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

    return market;
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
