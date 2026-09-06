import { prisma } from '@/lib/db';

export type LogLevel = 'error' | 'warn' | 'info';
export type LogSource = 'server' | 'client' | 'process';

interface LogInput {
  level?: LogLevel;
  source?: LogSource;
  message: string;
  stack?: string | null;
  route?: string | null;
  method?: string | null;
  statusCode?: number | null;
  code?: string | null;
  userId?: string | null;
  context?: Record<string, unknown> | null;
}

interface ListLogsOptions {
  level?: LogLevel | 'all';
  source?: LogSource | 'all';
  search?: string;
  limit?: number;
  offset?: number;
}

let tableEnsured: Promise<void> | null = null;

async function ensureTable() {
  await prisma.$executeRaw`
    CREATE TABLE IF NOT EXISTS "error_logs" (
      "id" TEXT NOT NULL,
      "level" TEXT NOT NULL DEFAULT 'error',
      "source" TEXT NOT NULL DEFAULT 'server',
      "message" TEXT NOT NULL,
      "stack" TEXT,
      "route" TEXT,
      "method" TEXT,
      "statusCode" INTEGER,
      "code" TEXT,
      "userId" TEXT,
      "context" JSONB,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

      CONSTRAINT "error_logs_pkey" PRIMARY KEY ("id")
    )
  `;
  await prisma.$executeRaw`
    CREATE INDEX IF NOT EXISTS "error_logs_level_createdAt_idx" ON "error_logs"("level", "createdAt")
  `;
  await prisma.$executeRaw`
    CREATE INDEX IF NOT EXISTS "error_logs_source_createdAt_idx" ON "error_logs"("source", "createdAt")
  `;
}

function ensureTableOnce() {
  tableEnsured ??= ensureTable().catch((error) => {
    tableEnsured = null;
    throw error;
  });
  return tableEnsured;
}

export class LogService {
  /**
   * Records a log entry. Never throws — logging failures fall back to console
   * so they never break the request or process that triggered them.
   */
  static async log(input: LogInput) {
    const level = input.level || 'error';
    const source = input.source || 'server';

    if (level === 'error') {
      console.error(`[log:${source}]`, input.message, input.stack || '');
    } else if (level === 'warn') {
      console.warn(`[log:${source}]`, input.message);
    } else {
      console.info(`[log:${source}]`, input.message);
    }

    try {
      await ensureTableOnce();
      await prisma.errorLog.create({
        data: {
          level,
          source,
          message: input.message.slice(0, 4000),
          stack: input.stack ? input.stack.slice(0, 8000) : null,
          route: input.route || null,
          method: input.method || null,
          statusCode: input.statusCode ?? null,
          code: input.code || null,
          userId: input.userId || null,
          context: (input.context as never) || undefined,
        },
      });
    } catch (persistError) {
      console.error('[log:persist] Failed to write log entry:', persistError instanceof Error ? persistError.message : persistError);
    }
  }

  static async list(options: ListLogsOptions = {}) {
    await ensureTableOnce();

    const limit = Math.min(Math.max(options.limit ?? 50, 1), 200);
    const offset = Math.max(options.offset ?? 0, 0);

    const where = {
      ...(options.level && options.level !== 'all' ? { level: options.level } : {}),
      ...(options.source && options.source !== 'all' ? { source: options.source } : {}),
      ...(options.search
        ? {
            OR: [
              { message: { contains: options.search, mode: 'insensitive' as const } },
              { route: { contains: options.search, mode: 'insensitive' as const } },
              { code: { contains: options.search, mode: 'insensitive' as const } },
            ],
          }
        : {}),
    };

    const [logs, total, counts] = await Promise.all([
      prisma.errorLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: offset,
        take: limit,
      }),
      prisma.errorLog.count({ where }),
      prisma.errorLog.groupBy({
        by: ['level'],
        _count: { _all: true },
      }),
    ]);

    const last24h = await prisma.errorLog.count({
      where: { level: 'error', createdAt: { gt: new Date(Date.now() - 24 * 60 * 60 * 1000) } },
    });

    return {
      logs,
      total,
      limit,
      offset,
      stats: {
        total,
        errors: counts.find((item) => item.level === 'error')?._count._all || 0,
        warnings: counts.find((item) => item.level === 'warn')?._count._all || 0,
        info: counts.find((item) => item.level === 'info')?._count._all || 0,
        errorsLast24h: last24h,
      },
    };
  }

  static async clear(options: { olderThanDays?: number } = {}) {
    await ensureTableOnce();

    if (options.olderThanDays) {
      const cutoff = new Date(Date.now() - options.olderThanDays * 24 * 60 * 60 * 1000);
      const result = await prisma.errorLog.deleteMany({ where: { createdAt: { lt: cutoff } } });
      return result.count;
    }

    const result = await prisma.errorLog.deleteMany({});
    return result.count;
  }

  static async remove(id: string) {
    await ensureTableOnce();
    await prisma.errorLog.delete({ where: { id } });
  }
}
