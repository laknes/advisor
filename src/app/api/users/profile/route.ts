import { NextRequest } from 'next/server';
import { UserService } from '@/server/services/UserService';
import { UpdateProfileSchema } from '@/lib/validations';
import { handleError, requireAuth, successResponse } from '@/server/middleware';
import { formatZodError } from '@/lib/errors';

export async function GET(req: NextRequest) {
  try {
    const { user: authUser } = await requireAuth(req);
    const user = await UserService.getUserById(authUser.id);
    return successResponse({ user });
  } catch (error) {
    return handleError(error);
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { user: authUser } = await requireAuth(req);

    const body = await req.json();
    const result = UpdateProfileSchema.safeParse(body);

    if (!result.success) {
      const errors = formatZodError(result.error);
      return new Response(
        JSON.stringify({ error: 'Validation failed', errors }),
        { status: 400 }
      );
    }

    const user = await UserService.updateProfile(authUser.id, result.data);
    return successResponse({ user }, 'Profile updated successfully');
  } catch (error) {
    return handleError(error);
  }
}
