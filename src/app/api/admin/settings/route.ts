import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { SettingsService } from '@/server/services/SettingsService';
import { formatZodError } from '@/lib/errors';
import { handleError, requireAdmin, successResponse } from '@/server/middleware';

const UpdateSettingsSchema = z.object({
  settings: z.array(
    z.object({
      key: z.string().min(1),
      value: z.any(),
    }),
  ),
});

export async function GET(req: NextRequest) {
  try {
    await requireAdmin(req);
    const settings = await SettingsService.getSettings(false);
    return successResponse({ settings });
  } catch (error) {
    return handleError(error);
  }
}

export async function PUT(req: NextRequest) {
  try {
    await requireAdmin(req);
    const body = await req.json();
    const result = UpdateSettingsSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: 'Validation failed', errors: formatZodError(result.error) },
        { status: 400 },
      );
    }

    const settings = await SettingsService.updateSettings(
      result.data.settings.map((setting) => ({
        key: setting.key,
        value: setting.value,
      })),
    );
    return successResponse({ settings }, 'Settings updated successfully');
  } catch (error) {
    return handleError(error);
  }
}
