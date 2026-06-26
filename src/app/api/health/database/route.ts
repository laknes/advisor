import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function getDatabaseHost() {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) return null;

  try {
    return new URL(databaseUrl).host;
  } catch {
    return null;
  }
}

export async function GET() {
  const startedAt = Date.now();

  if (!process.env.DATABASE_URL) {
    return NextResponse.json(
      {
        success: false,
        data: {
          connected: false,
          provider: 'postgresql',
          host: null,
          latencyMs: 0,
        },
        error: 'DATABASE_URL is not configured',
      },
      { status: 503 },
    );
  }

  try {
    await prisma.$queryRaw`SELECT 1`;

    return NextResponse.json({
      success: true,
      data: {
        connected: true,
        provider: 'postgresql',
        host: getDatabaseHost(),
        latencyMs: Date.now() - startedAt,
      },
    });
  } catch (error) {
    console.error('Database health check failed:', error);

    return NextResponse.json(
      {
        success: false,
        data: {
          connected: false,
          provider: 'postgresql',
          host: getDatabaseHost(),
          latencyMs: Date.now() - startedAt,
        },
        error: 'Database connection failed',
      },
      { status: 503 },
    );
  }
}
