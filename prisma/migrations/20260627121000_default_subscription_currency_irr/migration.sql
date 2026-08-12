ALTER TABLE "subscription_plans"
ALTER COLUMN "currency" SET DEFAULT 'IRR';

UPDATE "subscription_plans"
SET "currency" = 'IRR'
WHERE "currency" IS NULL OR "currency" = 'USD';
