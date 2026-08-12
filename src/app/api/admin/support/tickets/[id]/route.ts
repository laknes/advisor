import { NextRequest, NextResponse } from 'next/server';
import { UpdateSupportTicketSchema } from '@/lib/validations';
import { formatZodError } from '@/lib/errors';
import { handleError, requireAdmin, successResponse } from '@/server/middleware';
import { SupportService } from '@/server/services/SupportService';

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireAdmin(req);
    const { id } = await params;
    const body = await req.json();
    const result = UpdateSupportTicketSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: 'Validation failed', errors: formatZodError(result.error) },
        { status: 400 },
      );
    }

    const ticket = await SupportService.updateTicket(id, result.data);
    return successResponse({ ticket }, 'Support ticket updated successfully');
  } catch (error) {
    return handleError(error);
  }
}
