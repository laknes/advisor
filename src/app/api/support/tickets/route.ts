import { NextRequest, NextResponse } from 'next/server';
import { CreateSupportTicketSchema } from '@/lib/validations';
import { formatZodError } from '@/lib/errors';
import { getAuthPayload, handleError, successResponse } from '@/server/middleware';
import { SupportService } from '@/server/services/SupportService';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = CreateSupportTicketSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: 'Validation failed', errors: formatZodError(result.error) },
        { status: 400 },
      );
    }

    let userId: string | undefined;
    try {
      userId = getAuthPayload(req).userId;
    } catch {
      userId = undefined;
    }

    const ticket = await SupportService.createTicket(result.data, userId);
    return successResponse({ ticket }, 'Support ticket created successfully', 201);
  } catch (error) {
    return handleError(error);
  }
}
