import { prisma } from '@/lib/db';
import { NotFoundError } from '@/lib/errors';
import { Prisma } from '@prisma/client';

type PlanAccessRule = {
  marketId?: string;
  analysisLimit?: number;
};

const PLAN_SELECT = {
  id: true,
  name: true,
  slug: true,
  description: true,
  type: true,
  tier: true,
  marketId: true,
  price: true,
  currency: true,
  billingPeriod: true,
  features: true,
  accessRules: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
} as const;

const LEGACY_PLAN_SELECT = {
  id: true,
  name: true,
  slug: true,
  description: true,
  type: true,
  marketId: true,
  price: true,
  currency: true,
  billingPeriod: true,
  features: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
} as const;

type PlanWithoutTier = Prisma.SubscriptionPlanGetPayload<{ select: typeof PLAN_SELECT }>;
type PlanWithOptionalFields = PlanWithoutTier & {
  tier?: string | null;
  accessRules?: unknown;
  features?: string[] | null;
};

function normalizePlan(plan: PlanWithOptionalFields) {
  return {
    ...plan,
    features: Array.isArray(plan.features) ? plan.features : [],
    accessRules: Array.isArray(plan.accessRules) ? plan.accessRules : [],
    tier: plan.tier || 'basic',
  };
}

function isMissingTierColumn(error: unknown): error is Prisma.PrismaClientKnownRequestError {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError
    && error.code === 'P2022'
    && String(error.meta?.column || '').includes('subscription_plans.')
  );
}

export class SubscriptionService {
  /**
   * Get all subscription plans
   */
  static async getAllPlans(activeOnly = true) {
    let plans;

    try {
      plans = await prisma.subscriptionPlan.findMany({
        where: activeOnly ? { isActive: true } : undefined,
        orderBy: { price: 'asc' },
        select: PLAN_SELECT,
      });
    } catch (error) {
      if (!isMissingTierColumn(error)) {
        throw error;
      }

      plans = await prisma.subscriptionPlan.findMany({
        where: activeOnly ? { isActive: true } : undefined,
        orderBy: { price: 'asc' },
        select: LEGACY_PLAN_SELECT,
      });
    }

    return plans.map(normalizePlan);
  }

  static async getPlanById(planId: string) {
    let plan;

    try {
      plan = await prisma.subscriptionPlan.findUnique({
        where: { id: planId },
        select: PLAN_SELECT,
      });
    } catch (error) {
      if (!isMissingTierColumn(error)) {
        throw error;
      }

      plan = await prisma.subscriptionPlan.findUnique({
        where: { id: planId },
        select: LEGACY_PLAN_SELECT,
      });
    }

    if (!plan) throw new NotFoundError('Subscription plan');
    return normalizePlan(plan);
  }

  /**
   * Get user subscriptions
   */
  static async getUserSubscriptions(userId: string) {
    const subscriptions = await prisma.subscription.findMany({
      where: { userId },
      include: {
        plan: {
          select: PLAN_SELECT,
        },
      },
      orderBy: { startDate: 'desc' },
    });

    return subscriptions.map((subscription) => ({
      ...subscription,
      plan: subscription.plan ? normalizePlan(subscription.plan) : subscription.plan,
    }));
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
        plan: {
          select: PLAN_SELECT,
        },
      },
    });

    return subscriptions.map((subscription) => ({
      ...subscription,
      plan: subscription.plan ? normalizePlan(subscription.plan) : subscription.plan,
    }));
  }

  /**
   * Create subscription
   */
  static async createSubscription(userId: string, planId: string, marketId?: string) {
    const plan = await prisma.subscriptionPlan.findUnique({
      where: { id: planId },
      select: PLAN_SELECT,
    });

    if (!plan) {
      throw new NotFoundError('Subscription plan');
    }

    const normalizedPlan = normalizePlan(plan);

    // Calculate end date based on billing period
    const startDate = new Date();
    const endDate = this.calculateEndDate(startDate, normalizedPlan.billingPeriod);

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
          endDate: existing.endDate > startDate ? this.calculateEndDate(existing.endDate, normalizedPlan.billingPeriod) : endDate,
          isActive: true,
          autoRenew: true,
        },
        include: { plan: { select: PLAN_SELECT } },
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
        plan: { select: PLAN_SELECT },
      },
      });

    return {
      ...subscription,
      plan: subscription.plan ? normalizePlan(subscription.plan) : subscription.plan,
    };
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
        plan: { select: PLAN_SELECT },
      },
    });

    return {
      ...subscription,
      plan: subscription.plan ? normalizePlan(subscription.plan) : subscription.plan,
    };
  }

  static async createPlan(data: any) {
    try {
      const plan = await prisma.subscriptionPlan.create({ data });
      return normalizePlan(plan as PlanWithOptionalFields);
    } catch (error) {
      if (!isMissingTierColumn(error)) {
        throw error;
      }

      const fallbackData = { ...data };
      delete fallbackData.tier;
      delete fallbackData.accessRules;
      const plan = await prisma.subscriptionPlan.create({ data: fallbackData });
      return normalizePlan(plan as PlanWithOptionalFields);
    }
  }

  static async updatePlan(planId: string, data: any) {
    try {
      const plan = await prisma.subscriptionPlan.update({
        where: { id: planId },
        data,
      });
      return normalizePlan(plan as PlanWithOptionalFields);
    } catch (error) {
      if (!isMissingTierColumn(error)) {
        throw error;
      }

      const fallbackData = { ...data };
      delete fallbackData.tier;
      delete fallbackData.accessRules;
      const plan = await prisma.subscriptionPlan.update({
        where: { id: planId },
        data: fallbackData,
      });
      return normalizePlan(plan as PlanWithOptionalFields);
    }
  }

  static async deletePlan(planId: string) {
    const plan = await prisma.subscriptionPlan.update({
      where: { id: planId },
      data: { isActive: false },
    });
    return normalizePlan(plan as PlanWithOptionalFields);
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

  static async hasAccessToMarketAnalysis(
    userId: string,
    marketId: string,
    requiredSubscription?: string | null,
  ): Promise<boolean> {
    const subscriptions = await prisma.subscription.findMany({
      where: {
        userId,
        isActive: true,
        endDate: { gt: new Date() },
      },
      include: { plan: { select: PLAN_SELECT } },
    });

    return subscriptions.some((subscription) => {
      if (requiredSubscription && subscription.plan.slug === requiredSubscription) {
        return true;
      }

      if (subscription.marketId && subscription.marketId === marketId) {
        return true;
      }

      if (subscription.plan.marketId && subscription.plan.marketId === marketId) {
        return true;
      }

      if (subscription.plan.type === 'all_markets' || subscription.plan.type === 'vip') {
        return true;
      }

      const accessRules = Array.isArray(subscription.plan.accessRules)
        ? subscription.plan.accessRules as PlanAccessRule[]
        : [];

      return accessRules.some((rule) => (
        rule.marketId === marketId && Number(rule.analysisLimit || 0) > 0
      ));
    });
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
