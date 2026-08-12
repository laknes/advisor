CREATE TABLE IF NOT EXISTS "phone_otps" (
  "id" TEXT NOT NULL,
  "phone" TEXT NOT NULL,
  "codeHash" TEXT NOT NULL,
  "purpose" TEXT NOT NULL DEFAULT 'login',
  "userId" TEXT,
  "attempts" INTEGER NOT NULL DEFAULT 0,
  "maxAttempts" INTEGER NOT NULL DEFAULT 5,
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "consumedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "phone_otps_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "phone_otps_phone_purpose_createdAt_idx" ON "phone_otps"("phone", "purpose", "createdAt");
CREATE INDEX IF NOT EXISTS "phone_otps_userId_purpose_createdAt_idx" ON "phone_otps"("userId", "purpose", "createdAt");
