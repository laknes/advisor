import { prisma } from '@/lib/db';

export class AdminService {
  static async getDashboardStats() {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const [
      totalUsers,
      activeSubscriptions,
      activeAnalyses,
      markets,
      monthlyTransactions,
      recentUsers,
      latestAnalyses,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.subscription.count({
        where: {
          isActive: true,
          endDate: { gt: now },
        },
      }),
      prisma.analysis.count({
        where: {
          expiresAt: null,
        },
      }),
      prisma.market.count(),
      prisma.transaction.aggregate({
        where: {
          status: 'completed',
          createdAt: { gte: monthStart },
        },
        _sum: { amount: true },
        _count: true,
      }),
      prisma.user.findMany({
        orderBy: { createdAt: 'desc' },
        take: 8,
        select: {
          id: true,
          email: true,
          name: true,
          country: true,
          verified: true,
          createdAt: true,
        },
      }),
      prisma.analysis.findMany({
        orderBy: { publishedAt: 'desc' },
        take: 8,
        include: { market: true },
      }),
    ]);

    return {
      totals: {
        users: totalUsers,
        activeSubscriptions,
        activeAnalyses,
        markets,
        monthlyRevenue: monthlyTransactions._sum.amount ?? 0,
        monthlyTransactions: monthlyTransactions._count,
      },
      recentUsers,
      latestAnalyses,
    };
  }

  static async getReports() {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const [transactions, subscriptionsByPlan, usersByCountry] = await Promise.all([
      prisma.transaction.findMany({
        orderBy: { createdAt: 'desc' },
        take: 50,
      }),
      prisma.subscription.groupBy({
        by: ['planId'],
        _count: { planId: true },
        where: {
          isActive: true,
          endDate: { gt: now },
        },
      }),
      prisma.user.groupBy({
        by: ['country'],
        _count: { country: true },
      }),
    ]);

    const monthlyRevenue = transactions
      .filter((transaction) => transaction.status === 'completed' && transaction.createdAt >= monthStart)
      .reduce((sum, transaction) => sum + transaction.amount, 0);

    return {
      summary: {
        monthlyRevenue,
        transactionCount: transactions.length,
        completedTransactions: transactions.filter((item) => item.status === 'completed').length,
        failedTransactions: transactions.filter((item) => item.status === 'failed').length,
      },
      transactions,
      subscriptionsByPlan,
      usersByCountry,
    };
  }
}
