import { Subscription, SubscriptionPlan } from '@/lib/types';
import { mockSubscriptionPlans } from '@/lib/mockData';

declare global {
  var portfolioAdvisorSubscriptions: Subscription[] | undefined;
}

const DEFAULT_USER_ID = 'demo-user';

const getDurationDays = (billingPeriod: SubscriptionPlan['billingPeriod']): number => {
  switch (billingPeriod) {
    case 'monthly':
      return 30;
    case 'quarterly':
      return 90;
    case 'yearly':
      return 365;
    default:
      return 30;
  }
};

const createDefaultSubscriptions = (): Subscription[] => [
  {
    id: 'sub-1',
    userId: DEFAULT_USER_ID,
    planId: '2',
    marketId: undefined,
    startDate: new Date('2026-05-05'),
    endDate: new Date('2026-06-05'),
    isActive: true,
    autoRenew: true,
  },
  {
    id: 'sub-2',
    userId: DEFAULT_USER_ID,
    planId: '6',
    marketId: undefined,
    startDate: new Date('2026-04-08'),
    endDate: new Date('2026-07-08'),
    isActive: true,
    autoRenew: true,
  },
];

const subscriptionStore = globalThis.portfolioAdvisorSubscriptions ?? createDefaultSubscriptions();
globalThis.portfolioAdvisorSubscriptions = subscriptionStore;

export const getSubscriptionPlans = (): SubscriptionPlan[] => {
  return mockSubscriptionPlans;
};

export const getUserSubscriptions = (userId: string = DEFAULT_USER_ID): Subscription[] => {
  return subscriptionStore.filter((subscription) => subscription.userId === userId);
};

export const subscribeToPlan = (planId: string, userId: string = DEFAULT_USER_ID): Subscription => {
  const plan = mockSubscriptionPlans.find((item) => item.id === planId);
  if (!plan) {
    throw new Error('Subscription plan not found');
  }

  const durationDays = getDurationDays(plan.billingPeriod);
  const now = new Date();
  const existing = subscriptionStore.find(
    (subscription) => subscription.userId === userId && subscription.planId === planId && subscription.isActive,
  );

  if (existing) {
    existing.endDate = new Date(existing.endDate.getTime() + durationDays * 24 * 60 * 60 * 1000);
    existing.autoRenew = true;
    return existing;
  }

  const subscription: Subscription = {
    id: `sub-${Date.now()}`,
    userId,
    planId,
    marketId: plan.marketId,
    startDate: now,
    endDate: new Date(now.getTime() + durationDays * 24 * 60 * 60 * 1000),
    isActive: true,
    autoRenew: true,
  };

  subscriptionStore.push(subscription);
  return subscription;
};

export const cancelSubscription = (subscriptionId: string, userId: string = DEFAULT_USER_ID): Subscription => {
  const subscription = subscriptionStore.find(
    (item) => item.id === subscriptionId && item.userId === userId,
  );
  if (!subscription) {
    throw new Error('Subscription not found');
  }

  subscription.isActive = false;
  subscription.autoRenew = false;
  return subscription;
};
