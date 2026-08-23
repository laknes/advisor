ALTER TABLE "analyses"
ADD COLUMN IF NOT EXISTS "accessLevel" TEXT NOT NULL DEFAULT 'subscription';

UPDATE "analyses"
SET "accessLevel" = CASE
  WHEN "isLocked" THEN 'subscription'
  ELSE 'public'
END
WHERE "accessLevel" = 'subscription';
