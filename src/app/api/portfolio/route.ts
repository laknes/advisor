import { NextRequest } from 'next/server';
import { PortfolioService } from '@/server/services/PortfolioService';
import { CreatePositionSchema } from '@/lib/validations';
import { handleError, requireAuth, successResponse } from '@/server/middleware';
import { formatZodError } from '@/lib/errors';

export async function GET(req: NextRequest) {
  try {
    const { user } = await requireAuth(req);
    const portfolio = await PortfolioService.getOrCreatePortfolio(user.id);
    return successResponse({ portfolio });
  } catch (error) {
    return handleError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const { user } = await requireAuth(req);

    const body = await req.json();
    const result = CreatePositionSchema.safeParse(body);

    if (!result.success) {
      const errors = formatZodError(result.error);
      return new Response(
        JSON.stringify({ error: 'Validation failed', errors }),
        { status: 400 }
      );
    }

    const position = await PortfolioService.addPosition(user.id, result.data);
    return successResponse({ position }, 'Position added successfully', 201);
  } catch (error) {
    return handleError(error);
  }
}
