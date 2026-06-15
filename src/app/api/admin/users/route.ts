import { NextRequest } from 'next/server';
import { UserService } from '@/server/services/UserService';
import { CreateAdminUserSchema } from '@/lib/validations';
import { handleError, requireAdmin, successResponse } from '@/server/middleware';
import { formatZodError } from '@/lib/errors';

export async function GET(req: NextRequest) {
  try {
    await requireAdmin(req);

    const users = await UserService.getAllUsers();
    return successResponse({ users });
  } catch (error) {
    return handleError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    await requireAdmin(req);

    const body = await req.json();
    const result = CreateAdminUserSchema.safeParse(body);

    if (!result.success) {
      const errors = formatZodError(result.error);
      return new Response(
        JSON.stringify({ error: 'Validation failed', errors }),
        { status: 400 }
      );
    }

    const user = await UserService.createUser(result.data);
    return successResponse({ user }, 'User created successfully', 201);
  } catch (error) {
    return handleError(error);
  }
}
