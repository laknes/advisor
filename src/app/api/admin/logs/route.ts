import { NextRequest } from 'next/server';
import { handleError, requireAdmin, successResponse } from '@/server/middleware';
import { LogService, type LogLevel, type LogSource } from '@/server/services/LogService';

export async function GET(req: NextRequest) {
  try {
    await requireAdmin(req);

    const level = (req.nextUrl.searchParams.get('level') || 'all') as LogLevel | 'all';
    const source = (req.nextUrl.searchParams.get('source') || 'all') as LogSource | 'all';
    const search = req.nextUrl.searchParams.get('search') || undefined;
    const limit = parseInt(req.nextUrl.searchParams.get('limit') || '50');
    const offset = parseInt(req.nextUrl.searchParams.get('offset') || '0');

    const result = await LogService.list({ level, source, search, limit, offset });
    return successResponse(result);
  } catch (error) {
    return handleError(error);
  }
}

export async function DELETE(req: NextRequest) {
  try {
    await requireAdmin(req);

    const olderThanDaysParam = req.nextUrl.searchParams.get('olderThanDays');
    const olderThanDays = olderThanDaysParam ? parseInt(olderThanDaysParam) : undefined;
    const deleted = await LogService.clear(olderThanDays ? { olderThanDays } : {});

    return successResponse({ deleted }, 'Logs cleared successfully');
  } catch (error) {
    return handleError(error);
  }
}
