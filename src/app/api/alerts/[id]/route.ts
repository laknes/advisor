import { NextRequest } from 'next/server';
import { AlertService } from '@/server/services/AlertService';
import { UpdatePriceAlertSchema } from '@/lib/validations';
import { formatZodError } from '@/lib/errors';
import { handleError, requireAuth, successResponse } from '@/server/middleware';

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { user } = await requireAuth(req);

    const body = await req.json();
    const result = UpdatePriceAlertSchema.safeParse(body);
    if (!result.success) {
      return new Response(
        JSON.stringify({ error: 'Validation failed', errors: formatZodError(result.error) }),
        { status: 400 },
      );
    }

    const alert = await AlertService.updateAlert(id, user.id, result.data);
    return successResponse({ alert }, 'Alert updated successfully');
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
    await AlertService.deleteAlert(id, user.id);
    return successResponse(null, 'Alert deleted successfully');
  } catch (error) {
    return handleError(error);
  }
}
