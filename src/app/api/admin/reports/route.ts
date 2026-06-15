import { NextRequest } from 'next/server';
import { AdminService } from '@/server/services/AdminService';
import { handleError, requireAdmin, successResponse } from '@/server/middleware';

export async function GET(req: NextRequest) {
  try {
    await requireAdmin(req);
    const reports = await AdminService.getReports();
    return successResponse({ reports });
  } catch (error) {
    return handleError(error);
  }
}
