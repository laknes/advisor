import { SettingsService } from '@/server/services/SettingsService';
import { handleError, successResponse } from '@/server/middleware';

export async function GET() {
  try {
    const settings = await SettingsService.getPublicSettingsMap();
    return successResponse({ settings });
  } catch (error) {
    return handleError(error);
  }
}
