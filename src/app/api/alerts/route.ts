import { NextRequest } from 'next/server';
import { AlertService } from '@/server/services/AlertService';
import { CreatePriceAlertSchema } from '@/lib/validations';
import { handleError, requireAuth, successResponse } from '@/server/middleware';
import { formatZodError } from '@/lib/errors';

export async function GET(req: NextRequest) {
  try {
    const { user } = await requireAuth(req);
    const alerts = await AlertService.getUserAlerts(user.id);
    return successResponse({ alerts });
  } catch (error) {
    return handleError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const { user } = await requireAuth(req);

    const body = await req.json();
    const result = CreatePriceAlertSchema.safeParse(body);

    if (!result.success) {
      const errors = formatZodError(result.error);
      return new Response(
        JSON.stringify({ error: 'Validation failed', errors }),
        { status: 400 }
      );
    }

    const alert = await AlertService.createAlert(user.id, result.data);
    return successResponse({ alert }, 'Alert created successfully', 201);
  } catch (error) {
    return handleError(error);
  }
}
