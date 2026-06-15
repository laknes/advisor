import { NextRequest } from 'next/server';
import { PortfolioService } from '@/server/services/PortfolioService';
import { UpdatePositionSchema } from '@/lib/validations';
import { handleError, requireAuth, successResponse } from '@/server/middleware';
import { formatZodError } from '@/lib/errors';

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { user } = await requireAuth(req);

    const body = await req.json();
    const result = UpdatePositionSchema.safeParse(body);

    if (!result.success) {
      const errors = formatZodError(result.error);
      return new Response(
        JSON.stringify({ error: 'Validation failed', errors }),
        { status: 400 }
      );
    }

    const position = await PortfolioService.updatePosition(user.id, id, result.data);
    return successResponse({ position }, 'Position updated successfully');
  } catch (error) {
    return handleError(error);
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { user } = await requireAuth(req);
    await PortfolioService.deletePosition(user.id, id);
    return successResponse(null, 'Position deleted successfully');
  } catch (error) {
    return handleError(error);
  }
}
