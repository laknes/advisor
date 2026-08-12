ALTER TABLE "users"
ADD COLUMN IF NOT EXISTS "phoneVerified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS "nationalId" TEXT,
ADD COLUMN IF NOT EXISTS "birthDate" TIMESTAMP(3),
ADD COLUMN IF NOT EXISTS "address" TEXT,
ADD COLUMN IF NOT EXISTS "identityStatus" TEXT NOT NULL DEFAULT 'incomplete';

UPDATE "users"
SET "identityStatus" = CASE
  WHEN "nationalId" IS NOT NULL
   AND "birthDate" IS NOT NULL
   AND "address" IS NOT NULL
   AND "phone" IS NOT NULL
  THEN 'pending'
  ELSE 'incomplete'
END
WHERE "identityStatus" = 'incomplete';
