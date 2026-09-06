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
);

CREATE INDEX IF NOT EXISTS "error_logs_level_createdAt_idx" ON "error_logs"("level", "createdAt");
CREATE INDEX IF NOT EXISTS "error_logs_source_createdAt_idx" ON "error_logs"("source", "createdAt");
