import { prisma } from '@/lib/db';
import { NotFoundError } from '@/lib/errors';

export class SubscriptionService {
  /**
   * Get all subscription plans
   */
  static async getAllPlans(activeOnly = true) {
    const plans = await prisma.subscriptionPlan.findMany({
      where: activeOnly ? { isActive: true } : undefined,
      orderBy: { price: 'asc' },
    });

    return plans;
  }

  static async getPlanById(planId: string) {
    const plan = await prisma.subscriptionPlan.findUnique({
      where: { id: planId },
    });

    if (!plan) throw new NotFoundError('Subscription plan');
    return plan;
  }

  /**
   * Get user subscriptions
   */
  static async getUserSubscriptions(userId: string) {
    const subscriptions = await prisma.subscription.findMany({
      where: { userId },
      include: {
        plan: true,
      },
      orderBy: { startDate: 'desc' },
    });

    return subscriptions;
  }

  /**
   * Get active subscriptions
   */
  static async getActiveSubscriptions(userId: string) {
    const subscriptions = await prisma.subscription.findMany({
      where: {
        userId,
        isActive: true,
        endDate: { gt: new Date() },
      },
      include: {
        plan: true,
      },
    });

    return subscriptions;
  }

  /**
   * Create subscription
   */
  static async createSubscription(userId: string, planId: string, marketId?: string) {
    const plan = await prisma.subscriptionPlan.findUnique({
      where: { id: planId },
    });

    if (!plan) {
      throw new NotFoundError('Subscription plan');
    }

    // Calculate end date based on billing period
    const startDate = new Date();
    const endDate = this.calculateEndDate(startDate, plan.billingPeriod);

    const existing = await prisma.subscription.findFirst({
      where: {
        userId,
        planId,
        marketId: marketId ?? null,
      },
    });

    const subscription = existing
      ? await prisma.subscription.update({
        where: { id: existing.id },
        data: {
          endDate: existing.endDate > startDate ? this.calculateEndDate(existing.endDate, plan.billingPeriod) : endDate,
          isActive: true,
          autoRenew: true,
        },
        include: { plan: true },
      })
      : await prisma.subscription.create({
        data: {
          userId,
          planId,
          marketId,
          startDate,
          endDate,
          isActive: true,
          autoRenew: true,
        },
      include: {
        plan: true,
      },
      });

    return subscription;
  }

  /**
   * Cancel subscription
   */
  static async cancelSubscription(subscriptionId: string, userId?: string) {
    const existing = await prisma.subscription.findUnique({
      where: { id: subscriptionId },
    });

    if (!existing || (userId && existing.userId !== userId)) {
      throw new NotFoundError('Subscription');
    }

    const subscription = await prisma.subscription.update({
      where: { id: subscriptionId },
      data: {
        isActive: false,
        autoRenew: false,
        endDate: new Date(),
      },
      include: {
        plan: true,
      },
    });

    return subscription;
  }

  static async createPlan(data: any) {
    return prisma.subscriptionPlan.create({ data });
  }

  static async updatePlan(planId: string, data: any) {
    return prisma.subscriptionPlan.update({
      where: { id: planId },
      data,
    });
  }

  static async deletePlan(planId: string) {
    return prisma.subscriptionPlan.update({
      where: { id: planId },
      data: { isActive: false },
    });
  }

  /**
   * Check if user has subscription to analysis
   */
  static async hasAccessToAnalysis(userId: string, requiredSubscription?: string): Promise<boolean> {
    if (!requiredSubscription) {
      return true; // Public analysis
    }

    const subscription = await prisma.subscription.findFirst({
      where: {
        userId,
        isActive: true,
        endDate: { gt: new Date() },
        plan: {
          slug: requiredSubscription,
        },
      },
    });

    return !!subscription;
  }

  /**
   * Calculate end date
   */
  private static calculateEndDate(startDate: Date, billingPeriod: string): Date {
    const endDate = new Date(startDate);

    switch (billingPeriod) {
      case 'monthly':
        endDate.setMonth(endDate.getMonth() + 1);
        break;
      case 'quarterly':
        endDate.setMonth(endDate.getMonth() + 3);
        break;
      case 'yearly':
        endDate.setFullYear(endDate.getFullYear() + 1);
        break;
    }

    return endDate;
  }
}
