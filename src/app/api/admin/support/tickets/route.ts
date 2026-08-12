import { NextRequest } from 'next/server';
import { handleError, requireAdmin, successResponse } from '@/server/middleware';
import { SupportService } from '@/server/services/SupportService';

export async function GET(req: NextRequest) {
  try {
    await requireAdmin(req);
    const status = req.nextUrl.searchParams.get('status') || 'all';
    const tickets = await SupportService.getTickets(status);
    return successResponse({ tickets });
  } catch (error) {
    return handleError(error);
  }
}
