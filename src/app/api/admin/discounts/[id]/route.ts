import { NextRequest, NextResponse } from 'next/server';
import { DiscountService } from '@/server/services/DiscountService';
import { UpdateDiscountCodeSchema } from '@/lib/validations';
import { formatZodError } from '@/lib/errors';
import { handleError, requireAdmin, successResponse } from '@/server/middleware';

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireAdmin(req);
    const { id } = await params;
    const body = await req.json();
    const result = UpdateDiscountCodeSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: 'Validation failed', errors: formatZodError(result.error) },
        { status: 400 },
      );
    }

    const discount = await DiscountService.updateDiscount(id, result.data);
    return successResponse({ discount }, 'Discount code updated successfully');
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
    const discount = await DiscountService.deleteDiscount(id);
    return successResponse({ discount }, 'Discount code deactivated successfully');
  } catch (error) {
    return handleError(error);
  }
}
