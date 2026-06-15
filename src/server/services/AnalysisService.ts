import { prisma } from '@/lib/db';
import { NotFoundError } from '@/lib/errors';
import type { CreateAnalysisInput } from '@/lib/validations';

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
        title: true,
        summary: true,
        signal: true,
        riskLevel: true,
        targetPrice: true,
        accuracy: true,
        isLocked: true,
        publishedAt: true,
      },
    });

    return analysis;
  }

  /**
   * Get analyses by market
   */
  static async getAnalysesByMarket(marketId: string, timeframe?: string, analysisType?: string) {
    const where: any = { marketId };

    if (timeframe) where.timeframe = timeframe;
    if (analysisType) where.analysisType = analysisType;

    const analyses = await prisma.analysis.findMany({
      where,
      orderBy: { publishedAt: 'desc' },
      take: 50,
      select: {
        id: true,
        title: true,
        summary: true,
        timeframe: true,
        analysisType: true,
        signal: true,
        riskLevel: true,
        targetPrice: true,
        accuracy: true,
        isLocked: true,
        publishedAt: true,
      },
    });

    return analyses;
  }

  /**
   * Get analysis by ID (with access control)
   */
  static async getAnalysisById(analysisId: string, userId?: string) {
    const analysis = await prisma.analysis.findUnique({
      where: { id: analysisId },
      select: {
        id: true,
        title: true,
        summary: true,
        fullContent: true,
        timeframe: true,
        analysisType: true,
        signal: true,
        riskLevel: true,
        targetPrice: true,
        entryPrice: true,
        stopLoss: true,
        takeProfit: true,
        accuracy: true,
        isLocked: true,
        requiredSubscription: true,
        publishedAt: true,
        expiresAt: true,
      },
    });

    if (!analysis) {
      throw new NotFoundError('Analysis');
    }

    // Check if user has access
    if (analysis.isLocked && userId) {
      const hasSubscription = await prisma.subscription.findFirst({
        where: {
          userId,
          isActive: true,
          endDate: { gt: new Date() },
        },
      });

      if (!hasSubscription) {
        // Return analysis without full content
        const { fullContent, ...publicAnalysis } = analysis;
        return publicAnalysis;
      }
    }

    return analysis;
  }

  /**
   * Get all analyses
   */
  static async getAllAnalyses(limit = 20, offset = 0) {
    const analyses = await prisma.analysis.findMany({
      orderBy: { publishedAt: 'desc' },
      skip: offset,
      take: limit,
      select: {
        id: true,
        title: true,
        summary: true,
        signal: true,
        riskLevel: true,
        targetPrice: true,
        accuracy: true,
        timeframe: true,
        analysisType: true,
        isLocked: true,
        publishedAt: true,
      },
    });

    const total = await prisma.analysis.count();

    return { analyses, total, limit, offset };
  }

  static async updateAnalysis(analysisId: string, input: any) {
    const analysis = await prisma.analysis.update({
      where: { id: analysisId },
      data: {
        ...input,
        publishedAt: input.publishedAt ? new Date(input.publishedAt) : undefined,
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
