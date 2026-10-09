import { randomUUID } from 'crypto';
import { mkdir, writeFile } from 'fs/promises';
import path from 'path';
import { NextRequest } from 'next/server';
import { handleError, requireAdmin, successResponse } from '@/server/middleware';

const allowedTypes = new Map([
  ['image/jpeg', 'jpg'],
  ['image/png', 'png'],
  ['image/webp', 'webp'],
  ['image/gif', 'gif'],
  ['video/mp4', 'mp4'],
  ['video/webm', 'webm'],
  ['video/quicktime', 'mov'],
]);

const maxFileSize = 80 * 1024 * 1024;

export async function POST(req: NextRequest) {
  try {
    await requireAdmin(req);

    const formData = await req.formData();
    const file = formData.get('file');

    if (!(file instanceof File)) {
      return Response.json({ error: 'فایل انتخاب نشده است.' }, { status: 400 });
    }

    const extension = allowedTypes.get(file.type);
    if (!extension) {
      return Response.json({ error: 'فقط تصویر یا ویدیوی معتبر قابل آپلود است.' }, { status: 400 });
    }

    if (file.size > maxFileSize) {
      return Response.json({ error: 'حجم فایل نباید بیشتر از ۸۰ مگابایت باشد.' }, { status: 400 });
    }

    const uploadDir = path.join(process.cwd(), 'uploads', 'analyses');
    await mkdir(uploadDir, { recursive: true });

    const filename = `${Date.now()}-${randomUUID()}.${extension}`;
    await writeFile(path.join(uploadDir, filename), Buffer.from(await file.arrayBuffer()));

    return successResponse({
      url: `/api/uploads/analyses/${filename}`,
      mediaType: file.type.startsWith('video/') ? 'video' : 'image',
    }, 'Media uploaded successfully', 201);
  } catch (error) {
    return handleError(error);
  }
}
