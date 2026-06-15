import { NextRequest } from 'next/server';
import { AnalysisService } from '@/server/services/AnalysisService';
import { UpdateAnalysisSchema } from '@/lib/validations';
import { handleError, requireAdmin, successResponse } from '@/server/middleware';
import { formatZodError } from '@/lib/errors';
import { verifyToken } from '@/lib/auth';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const token = req.headers.get('authorization')?.replace('Bearer ', '');
    const userId = token ? verifyToken(token)?.userId : undefined;

    const analysis = await AnalysisService.getAnalysisById(id, userId);
    return successResponse({ analysis });
  } catch (error) {
    return handleError(error);
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await requireAdmin(req);

    const body = await req.json();
    const result = UpdateAnalysisSchema.safeParse(body);

    if (!result.success) {
      const errors = formatZodError(result.error);
      return new Response(
        JSON.stringify({ error: 'Validation failed', errors }),
        { status: 400 }
      );
    }

    const analysis = await AnalysisService.updateAnalysis(id, result.data);
    return successResponse({ analysis }, 'Analysis updated successfully');
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
    await requireAdmin(req);

    await AnalysisService.deleteAnalysis(id);
    return successResponse(null, 'Analysis deleted successfully');
  } catch (error) {
    return handleError(error);
  }
}
