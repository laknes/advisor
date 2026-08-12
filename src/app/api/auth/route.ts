import { NextRequest, NextResponse } from 'next/server';
import { UserService } from '@/server/services/UserService';
import { RegisterSchema, LoginSchema, RequestOtpSchema, VerifyOtpSchema } from '@/lib/validations';
import { getAuthPayload, handleError, isAdminEmail, successResponse } from '@/server/middleware';
import { formatZodError } from '@/lib/errors';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const action = req.nextUrl.searchParams.get('action');

    if (action === 'register') {
      const result = RegisterSchema.safeParse(body);
      if (!result.success) {
        const errors = formatZodError(result.error);
        return NextResponse.json(
          { error: 'Validation failed', errors },
          { status: 400 }
        );
      }

      const { user, token } = await UserService.register(result.data);
      return successResponse({ user: { ...user, isAdmin: isAdminEmail(user.email) }, token }, 'User registered successfully', 201);
    }

    if (action === 'login') {
      const result = LoginSchema.safeParse(body);
      if (!result.success) {
        const errors = formatZodError(result.error);
        return NextResponse.json(
          { error: 'Validation failed', errors },
          { status: 400 }
        );
      }

      const { user, token } = await UserService.login(result.data);
      return successResponse({ user: { ...user, isAdmin: isAdminEmail(user.email) }, token }, 'Logged in successfully');
    }

    if (action === 'request-otp') {
      const result = RequestOtpSchema.safeParse(body);
      if (!result.success) {
        const errors = formatZodError(result.error);
        return NextResponse.json(
          { error: 'Validation failed', errors },
          { status: 400 }
        );
      }

      let userId: string | undefined;
      try {
        userId = getAuthPayload(req).userId;
      } catch {
        userId = undefined;
      }

      const otp = await UserService.requestOtp(result.data, userId);
      return successResponse({ otp }, 'OTP code sent');
    }

    if (action === 'verify-otp') {
      const result = VerifyOtpSchema.safeParse(body);
      if (!result.success) {
        const errors = formatZodError(result.error);
        return NextResponse.json(
          { error: 'Validation failed', errors },
          { status: 400 }
        );
      }

      let userId: string | undefined;
      try {
        userId = getAuthPayload(req).userId;
      } catch {
        userId = undefined;
      }

      const { user, token } = await UserService.verifyOtp(result.data, userId);
      return successResponse({ user: { ...user, isAdmin: isAdminEmail(user.email) }, token }, 'OTP verified');
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    return handleError(error);
  }
}
