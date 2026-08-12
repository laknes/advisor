import { NextRequest, NextResponse } from 'next/server';
import { UserService } from '@/server/services/UserService';
import { RequestPasswordResetSchema, ResetPasswordSchema } from '@/lib/validations';
import { formatZodError } from '@/lib/errors';
import { successResponse, handleError } from '@/server/middleware';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const action = req.nextUrl.searchParams.get('action');

    if (action === 'request-reset') {
      const result = RequestPasswordResetSchema.safeParse(body);
      if (!result.success) {
        return NextResponse.json({ error: 'اطلاعات ایمیل نامعتبر است', errors: formatZodError(result.error) }, { status: 400 });
      }

      const response = await UserService.requestPasswordReset(result.data);
      return successResponse(response, 'درخواست بازنشانی رمز عبور بررسی شد');
    }

    if (action === 'reset-password') {
      const result = ResetPasswordSchema.safeParse(body);
      if (!result.success) {
        return NextResponse.json({ error: 'اطلاعات بازنشانی نامعتبر است', errors: formatZodError(result.error) }, { status: 400 });
      }

      const response = await UserService.resetPassword(result.data);
      return successResponse(response, 'رمز عبور با موفقیت تغییر کرد');
    }

    return NextResponse.json({ error: 'عملیات نامعتبر است' }, { status: 400 });
  } catch (error) {
    return handleError(error);
  }
}
