import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { ForbiddenError, UnauthorizedError } from '@/lib/errors';

export interface AuthRequest extends NextRequest {
  user?: { userId: string; email: string };
}

export async function withAuth(req: NextRequest) {
  try {
    const token = req.headers.get('authorization')?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized: No token provided' },
        { status: 401 }
      );
    }

    const payload = verifyToken(token);

    if (!payload) {
      return NextResponse.json(
        { error: 'Unauthorized: Invalid token' },
        { status: 401 }
      );
    }

    // Attach user to request
    (req as any).user = payload;

    return null; // Continue to next handler
  } catch (error) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }
}

export function unauthorized(message = 'Unauthorized') {
  return NextResponse.json({ error: message, code: 'UNAUTHORIZED' }, { status: 401 });
}

export function forbidden(message = 'Forbidden') {
  return NextResponse.json({ error: message, code: 'FORBIDDEN' }, { status: 403 });
}

export function getAuthPayload(req: NextRequest) {
  const token = req.headers.get('authorization')?.replace('Bearer ', '');
  if (!token) throw new UnauthorizedError('Unauthorized: No token provided');

  const payload = verifyToken(token);
  if (!payload) throw new UnauthorizedError('Unauthorized: Invalid token');

  return payload;
}

export async function requireAuth(req: NextRequest) {
  const payload = getAuthPayload(req);
  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
    select: {
      id: true,
      email: true,
      name: true,
      verified: true,
    },
  });

  if (!user) throw new UnauthorizedError('Unauthorized: User not found');

  return { payload, user };
}

export async function requireAdmin(req: NextRequest) {
  const auth = await requireAuth(req);
  const allowlist = (process.env.ADMIN_EMAILS || process.env.ADMIN_EMAIL || 'admin@advisor.com')
    .split(',')
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);

  if (!allowlist.includes(auth.user.email.toLowerCase())) {
    throw new ForbiddenError('Admin access required');
  }

  return auth;
}

export async function handleError(error: any) {
  console.error('API Error:', error);

  if (error.statusCode && error.code) {
    return NextResponse.json(
      {
        error: error.message,
        code: error.code,
        ...(error.errors && { errors: error.errors }),
      },
      { status: error.statusCode }
    );
  }

  return NextResponse.json(
    { error: 'Internal server error' },
    { status: 500 }
  );
}

export function successResponse(data: any, message?: string, status = 200) {
  return NextResponse.json(
    {
      success: true,
      data,
      ...(message && { message }),
    },
    { status }
  );
}
