import { prisma } from '@/lib/db';
import { NotFoundError } from '@/lib/errors';
import type { CreateAnalysisInput, UpdateAnalysisInput } from '@/lib/validations';
import { SubscriptionService } from './SubscriptionService';

export class AnalysisService {
  /**
   * Create new analysis
   */
  static async createAnalysis(input: CreateAnalysisInput) {
    const analysis = await prisma.analysis.create({
      data: {
        ...input,
        publishedAt: new Date(),
      },
      select: {
        id: true,
        marketId: true,
        market: { select: { id: true, name: true, slug: true } },
        title: true,
        summary: true,
        signal: true,
        riskLevel: true,
        entryZone: true,
        exitZone: true,
        accuracy: true,
        isLocked: true,
        requiredSubscription: true,
        accessLevel: true,
        publishedAt: true,
      },
    });

    return analysis;
  }

  /**
   * Get analyses by market
   */
  static async getAnalysesByMarket(marketId: string, timeframe?: string, analysisType?: string, userId?: string) {
    const where: { marketId: string; timeframe?: string; analysisType?: string } = { marketId };

    if (timeframe) where.timeframe = timeframe;
    if (analysisType) where.analysisType = analysisType;

    const analyses = await prisma.analysis.findMany({
      where,
      orderBy: { publishedAt: 'desc' },
      take: 50,
      select: {
        id: true,
        marketId: true,
        market: { select: { id: true, name: true, slug: true } },
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
        accessLevel: true,
        publishedAt: true,
      },
    });

    return Promise.all(analyses.map((analysis) => this.applyAccess(analysis, userId)));
  }

  /**
   * Get analysis by ID (with access control)
   */
  static async getAnalysisById(analysisId: string, userId?: string) {
    const analysis = await prisma.analysis.findUnique({
      where: { id: analysisId },
      select: {
        id: true,
        marketId: true,
        market: { select: { id: true, name: true, slug: true } },
        title: true,
        summary: true,
        fullContent: true,
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
    });

    if (!analysis) {
      throw new NotFoundError('Analysis');
    }

    const accessLevel = analysis.accessLevel;
    const hasAccess = accessLevel === 'public'
      || (accessLevel === 'login' && Boolean(userId))
      || (accessLevel === 'subscription' && userId
        ? await SubscriptionService.hasAccessToMarketAnalysis(userId, analysis.marketId, analysis.requiredSubscription)
        : false);

    if (!hasAccess) {
      const publicAnalysis: Partial<typeof analysis> = { ...analysis };
      delete publicAnalysis.fullContent;
      return publicAnalysis;
    }

    return analysis;
  }

  /**
   * Get all analyses
   */
  static async getAllAnalyses(limit = 20, offset = 0, userId?: string) {
    const analyses = await prisma.analysis.findMany({
      orderBy: { publishedAt: 'desc' },
      skip: offset,
      take: limit,
      select: {
        id: true,
        marketId: true,
        market: { select: { id: true, name: true, slug: true } },
        title: true,
        summary: true,
        signal: true,
        riskLevel: true,
        entryZone: true,
        exitZone: true,
        accuracy: true,
        timeframe: true,
        analysisType: true,
        isLocked: true,
        requiredSubscription: true,
        accessLevel: true,
        publishedAt: true,
      },
    });

    const total = await prisma.analysis.count();

    return { analyses: await Promise.all(analyses.map((analysis) => this.applyAccess(analysis, userId))), total, limit, offset };
  }

  private static async applyAccess<T extends { accessLevel: string; marketId: string; requiredSubscription?: string | null }>(analysis: T, userId?: string) {
    if (analysis.accessLevel === 'public' || (analysis.accessLevel === 'login' && userId)) {
      return { ...analysis, isLocked: false };
    }

    if (analysis.accessLevel === 'subscription' && userId && await SubscriptionService.hasAccessToMarketAnalysis(userId, analysis.marketId, analysis.requiredSubscription)) {
      return { ...analysis, isLocked: false };
    }

    return { ...analysis, isLocked: true };
  }

  static async updateAnalysis(analysisId: string, input: UpdateAnalysisInput) {
    const analysis = await prisma.analysis.update({
      where: { id: analysisId },
      data: {
        ...input,
        updatedAt: new Date(),
      },
    });

    return analysis;
  }

  static async deleteAnalysis(analysisId: string) {
    await prisma.analysis.delete({
      where: { id: analysisId },
    });
  }
}
