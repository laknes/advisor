import { NextRequest, NextResponse } from 'next/server';
import { SubscriptionService } from '@/server/services/SubscriptionService';
import { UpdateSubscriptionPlanSchema } from '@/lib/validations';
import { formatZodError } from '@/lib/errors';
import { handleError, requireAdmin, successResponse } from '@/server/middleware';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const plan = await SubscriptionService.getPlanById(id);
    return successResponse({ plan });
  } catch (error) {
    return handleError(error);
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireAdmin(req);
    const { id } = await params;
    const body = await req.json();
    const result = UpdateSubscriptionPlanSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: 'Validation failed', errors: formatZodError(result.error) },
        { status: 400 },
      );
    }

    const plan = await SubscriptionService.updatePlan(id, result.data);
    return successResponse({ plan }, 'Subscription plan updated successfully');
  } catch (error) {
    return handleError(error);
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireAdmin(req);
    const { id } = await params;
    const plan = await SubscriptionService.deletePlan(id);
    return successResponse({ plan }, 'Subscription plan deactivated successfully');
  } catch (error) {
    return handleError(error);
  }
}
