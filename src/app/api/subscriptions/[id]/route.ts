import { NextRequest } from 'next/server';
import { SubscriptionService } from '@/server/services/SubscriptionService';
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

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { user } = await requireAuth(req);
    const subscription = await SubscriptionService.cancelSubscription(id, user.id);
    return successResponse({ subscription }, 'Subscription cancelled successfully');
  } catch (error) {
    return handleError(error);
  }
}
