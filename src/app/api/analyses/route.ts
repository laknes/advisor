import { NextRequest } from 'next/server';
import { AnalysisService } from '@/server/services/AnalysisService';
import { CreateAnalysisSchema } from '@/lib/validations';
import { handleError, requireAdmin, successResponse } from '@/server/middleware';
import { formatZodError } from '@/lib/errors';
import { verifyToken } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const marketId = req.nextUrl.searchParams.get('marketId');
    const timeframe = req.nextUrl.searchParams.get('timeframe');
    const analysisType = req.nextUrl.searchParams.get('type');
    const limit = parseInt(req.nextUrl.searchParams.get('limit') || '20');
    const offset = parseInt(req.nextUrl.searchParams.get('offset') || '0');
    const token = req.headers.get('authorization')?.replace('Bearer ', '');
    const userId = token ? verifyToken(token)?.userId : undefined;

    if (marketId) {
      const analyses = await AnalysisService.getAnalysesByMarket(
        marketId,
        timeframe || undefined,
        analysisType || undefined,
        userId,
      );
      return successResponse({ analyses });
    }

    const result = await AnalysisService.getAllAnalyses(limit, offset, userId);
    return successResponse(result);
  } catch (error) {
    return handleError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    await requireAdmin(req);

    const body = await req.json();
    const result = CreateAnalysisSchema.safeParse(body);

    if (!result.success) {
      const errors = formatZodError(result.error);
      return new Response(
        JSON.stringify({ error: 'Validation failed', errors }),
        { status: 400 }
      );
    }

    const analysis = await AnalysisService.createAnalysis(result.data);
    return successResponse({ analysis }, 'Analysis created successfully', 201);
  } catch (error) {
    return handleError(error);
  }
}
