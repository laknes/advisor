import { NextRequest, NextResponse } from 'next/server';
import { SubscriptionService } from '@/server/services/SubscriptionService';
import { CreateSubscriptionSchema } from '@/lib/validations';
import { formatZodError } from '@/lib/errors';
import { handleError, requireAuth, successResponse } from '@/server/middleware';

export async function GET(req: NextRequest) {
  try {
    const { user } = await requireAuth(req);
    const subscriptions = await SubscriptionService.getUserSubscriptions(user.id);
    return successResponse({ subscriptions });
  } catch (error) {
    return handleError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const { user } = await requireAuth(req);
    const body = await req.json();
    const result = CreateSubscriptionSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: 'Validation failed', errors: formatZodError(result.error) },
        { status: 400 },
      );
    }

    const subscription = await SubscriptionService.createSubscription(
      user.id,
      result.data.planId,
      result.data.marketId,
    );

    return successResponse({ subscription }, 'Subscription activated successfully', 201);
  } catch (error) {
    return handleError(error);
  }
}
