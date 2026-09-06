import { NextRequest } from 'next/server';
import { handleError, requireAdmin, successResponse } from '@/server/middleware';
import { LogService } from '@/server/services/LogService';

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireAdmin(req);
    const { id } = await params;
    await LogService.remove(id);
    return successResponse(null, 'Log entry deleted successfully');
  } catch (error) {
    return handleError(error);
  }
}
