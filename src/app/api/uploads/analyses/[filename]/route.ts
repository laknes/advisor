import { readFile } from 'fs/promises';
import path from 'path';

const contentTypes: Record<string, string> = {
  '.gif': 'image/gif',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.mov': 'video/quicktime',
  '.mp4': 'video/mp4',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.webm': 'video/webm',
};

function safeFilename(value: string) {
  return path.basename(value);
}

async function readUpload(filename: string) {
  const safeName = safeFilename(filename);
  const candidates = [
    path.join(process.cwd(), 'uploads', 'analyses', safeName),
    path.join(process.cwd(), 'public', 'uploads', 'analyses', safeName),
  ];

  for (const candidate of candidates) {
    try {
      return await readFile(candidate);
    } catch {
      // Try the next storage location.
    }
  }

  return null;
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ filename: string }> },
) {
  const { filename } = await params;
  const file = await readUpload(filename);

  if (!file) {
    return new Response('Not found', { status: 404 });
  }

  const contentType = contentTypes[path.extname(filename).toLowerCase()] || 'application/octet-stream';

  return new Response(file, {
    headers: {
      'Cache-Control': 'public, max-age=31536000, immutable',
      'Content-Type': contentType,
    },
  });
}
