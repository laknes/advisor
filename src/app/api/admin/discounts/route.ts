import { NextRequest, NextResponse } from 'next/server';
import { DiscountService } from '@/server/services/DiscountService';
import { CreateDiscountCodeSchema } from '@/lib/validations';
import { formatZodError } from '@/lib/errors';
import { handleError, requireAdmin, successResponse } from '@/server/middleware';

export async function GET(req: NextRequest) {
  try {
    await requireAdmin(req);
    const discounts = await DiscountService.getDiscounts();
    return successResponse({ discounts });
  } catch (error) {
    return handleError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    await requireAdmin(req);
    const body = await req.json();
    const result = CreateDiscountCodeSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: 'Validation failed', errors: formatZodError(result.error) },
        { status: 400 },
      );
    }

    const discount = await DiscountService.createDiscount(result.data);
    return successResponse({ discount }, 'Discount code created successfully', 201);
  } catch (error) {
    return handleError(error);
  }
}
