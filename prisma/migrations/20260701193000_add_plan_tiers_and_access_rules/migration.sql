ALTER TABLE "subscription_plans"
ADD COLUMN "tier" TEXT NOT NULL DEFAULT 'basic',
ADD COLUMN "accessRules" JSONB NOT NULL DEFAULT '[]';

UPDATE "subscription_plans"
SET "tier" = CASE
  WHEN "type" IN ('vip', 'all_markets') THEN 'pro'
  WHEN "type" IN ('long_term', 'market_full') THEN 'plus'
  ELSE 'basic'
END;
