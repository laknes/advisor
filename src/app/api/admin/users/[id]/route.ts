import { NextRequest } from 'next/server';
import { UserService } from '@/server/services/UserService';
import { UpdateAdminUserSchema } from '@/lib/validations';
import { handleError, requireAdmin, successResponse } from '@/server/middleware';
import { formatZodError } from '@/lib/errors';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await requireAdmin(req);

    const user = await UserService.getUserById(id);
    return successResponse({ user });
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
    const result = UpdateAdminUserSchema.safeParse(body);

    if (!result.success) {
      const errors = formatZodError(result.error);
      return new Response(
        JSON.stringify({ error: 'Validation failed', errors }),
        { status: 400 }
      );
    }

    const user = await UserService.updateUser(id, result.data);
    return successResponse({ user }, 'User updated successfully');
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

    await UserService.deleteUser(id);
    return successResponse(null, 'User deleted successfully');
  } catch (error) {
    return handleError(error);
  }
}
