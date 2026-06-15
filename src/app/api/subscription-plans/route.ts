import { NextRequest, NextResponse } from 'next/server';
import { SubscriptionService } from '@/server/services/SubscriptionService';
import { CreateSubscriptionPlanSchema } from '@/lib/validations';
import { formatZodError } from '@/lib/errors';
import { handleError, requireAdmin, successResponse } from '@/server/middleware';

export async function GET() {
  try {
    const plans = await SubscriptionService.getAllPlans();
    return successResponse({ plans });
  } catch (error) {
    return handleError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    await requireAdmin(req);
    const body = await req.json();
    const result = CreateSubscriptionPlanSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: 'Validation failed', errors: formatZodError(result.error) },
        { status: 400 },
      );
    }

    const plan = await SubscriptionService.createPlan(result.data);
    return successResponse({ plan }, 'Subscription plan created successfully', 201);
  } catch (error) {
    return handleError(error);
  }
}
