import { NextRequest } from 'next/server';
import { z } from 'zod';
import { handleError, successResponse } from '@/server/middleware';
import { LogService } from '@/server/services/LogService';
import { formatZodError } from '@/lib/errors';

const ClientLogSchema = z.object({
  message: z.string().min(1).max(2000),
  stack: z.string().max(8000).optional(),
  url: z.string().max(500).optional(),
});

const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX_REQUESTS = 20;
const recentRequestsByIp = new Map<string, number[]>();

function isRateLimited(ip: string) {
  const now = Date.now();
  const timestamps = (recentRequestsByIp.get(ip) || []).filter((time) => now - time < RATE_LIMIT_WINDOW_MS);
  timestamps.push(now);
  recentRequestsByIp.set(ip, timestamps);
  return timestamps.length > RATE_LIMIT_MAX_REQUESTS;
}

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
    if (isRateLimited(ip)) {
      return successResponse({ accepted: false }, 'Rate limited', 202);
    }

    const body = await req.json().catch(() => ({}));
    const result = ClientLogSchema.safeParse(body);
    if (!result.success) {
      return successResponse({ accepted: false, errors: formatZodError(result.error) }, 'Ignored', 202);
    }

    await LogService.log({
      level: 'error',
      source: 'client',
      message: result.data.message,
      stack: result.data.stack,
      route: result.data.url,
    });

    return successResponse({ accepted: true }, 'Logged', 202);
  } catch (error) {
    return handleError(error);
  }
}
