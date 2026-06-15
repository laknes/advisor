import { prisma } from '@/lib/db';
import { NotFoundError } from '@/lib/errors';

export class PortfolioService {
  /**
   * Get or create user portfolio
   */
  static async getOrCreatePortfolio(userId: string) {
    let portfolio = await prisma.portfolio.findUnique({
      where: { userId },
      include: { positions: true },
    });

    if (!portfolio) {
      portfolio = await prisma.portfolio.create({
        data: {
          userId,
          totalValue: 0,
          totalInvested: 0,
          totalReturn: 0,
          returnPercentage: 0,
        },
        include: { positions: true },
      });
    }

    return portfolio;
  }

  /**
   * Add position to portfolio
   */
  static async addPosition(userId: string, data: any) {
    const portfolio = await this.getOrCreatePortfolio(userId);

    const position = await prisma.position.create({
      data: {
        portfolioId: portfolio.id,
        symbol: data.symbol,
        quantity: data.quantity,
        entryPrice: data.entryPrice,
        currentPrice: data.entryPrice,
        totalCost: data.quantity * data.entryPrice,
        currentValue: data.quantity * data.entryPrice,
        profitLoss: 0,
        profitLossPercent: 0,
        type: data.type,
      },
    });

    // Update portfolio totals
    await this.updatePortfolioTotals(portfolio.id);

    return position;
  }

  /**
   * Update position
   */
  static async updatePosition(userId: string, positionId: string, data: any) {
    const position = await prisma.position.findUnique({
      where: { id: positionId },
      include: { portfolio: true },
    });

    if (!position || position.portfolio.userId !== userId) {
      throw new NotFoundError('Position');
    }

    const currentPrice = data.currentPrice || position.currentPrice;
    const quantity = data.quantity || position.quantity;
    const totalCost = quantity * position.entryPrice;
    const currentValue = quantity * currentPrice;
    const profitLoss = currentValue - totalCost;
    const profitLossPercent = totalCost > 0 ? (profitLoss / totalCost) * 100 : 0;

    const updated = await prisma.position.update({
      where: { id: positionId },
      data: {
        quantity,
        currentPrice,
        totalCost,
        currentValue,
        profitLoss,
        profitLossPercent,
      },
    });

    // Update portfolio totals
    await this.updatePortfolioTotals(position.portfolioId);

    return updated;
  }

  /**
   * Delete position
   */
  static async deletePosition(userId: string, positionId: string) {
    const position = await prisma.position.findUnique({
      where: { id: positionId },
      include: { portfolio: true },
    });

    if (!position || position.portfolio.userId !== userId) {
      throw new NotFoundError('Position');
    }

    await prisma.position.delete({
      where: { id: positionId },
    });

    // Update portfolio totals
    await this.updatePortfolioTotals(position.portfolioId);
  }

  /**
   * Update portfolio totals
   */
  private static async updatePortfolioTotals(portfolioId: string) {
    const positions = await prisma.position.findMany({
      where: { portfolioId },
    });

    const totalInvested = positions.reduce((sum, p) => sum + p.totalCost, 0);
    const totalValue = positions.reduce((sum, p) => sum + p.currentValue, 0);
    const totalReturn = totalValue - totalInvested;
    const returnPercentage = totalInvested > 0 ? (totalReturn / totalInvested) * 100 : 0;

    await prisma.portfolio.update({
      where: { id: portfolioId },
      data: {
        totalInvested,
        totalValue,
        totalReturn,
        returnPercentage,
      },
    });
  }

  /**
   * Get portfolio with positions
   */
  static async getPortfolioWithPositions(userId: string) {
    const portfolio = await prisma.portfolio.findUnique({
      where: { userId },
      include: {
        positions: true,
      },
    });

    return portfolio;
  }
}
