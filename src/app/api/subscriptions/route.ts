import { NextRequest, NextResponse } from 'next/server';
import { SubscriptionService } from '@/server/services/SubscriptionService';
import { UserService } from '@/server/services/UserService';
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

    const eligibility = await UserService.getSubscriptionEligibility(user.id);
    if (!eligibility.eligible) {
      return NextResponse.json(
        {
          error: 'برای تهیه اشتراک، ابتدا ایمیل، شماره موبایل و مشخصات شناسایی خود را تکمیل و تایید کنید.',
          code: 'PROFILE_VERIFICATION_REQUIRED',
          missing: eligibility.missing,
        },
        { status: 403 },
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
