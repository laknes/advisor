import { prisma } from '@/lib/db';
import { NotFoundError } from '@/lib/errors';

export class AlertService {
  /**
   * Get user alerts
   */
  static async getUserAlerts(userId: string) {
    const alerts = await prisma.priceAlert.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    return alerts;
  }

  /**
   * Create price alert
   */
  static async createAlert(userId: string, data: any) {
    const alert = await prisma.priceAlert.create({
      data: {
        userId,
        symbol: data.symbol,
        market: data.market,
        price: data.price,
        condition: data.condition,
        isActive: data.isActive !== false,
      },
    });

    return alert;
  }

  /**
   * Update alert
   */
  static async updateAlert(alertId: string, userId: string, data: any) {
    const alert = await prisma.priceAlert.findUnique({
      where: { id: alertId },
    });

    if (!alert || alert.userId !== userId) {
      throw new NotFoundError('Alert');
    }

    const updated = await prisma.priceAlert.update({
      where: { id: alertId },
      data: {
        price: data.price || alert.price,
        market: data.market || alert.market,
        condition: data.condition || alert.condition,
        isActive: data.isActive !== undefined ? data.isActive : alert.isActive,
      },
    });

    return updated;
  }

  /**
   * Delete alert
   */
  static async deleteAlert(alertId: string, userId: string) {
    const alert = await prisma.priceAlert.findUnique({
      where: { id: alertId },
    });

    if (!alert || alert.userId !== userId) {
      throw new NotFoundError('Alert');
    }

    await prisma.priceAlert.delete({
      where: { id: alertId },
    });
  }
}
