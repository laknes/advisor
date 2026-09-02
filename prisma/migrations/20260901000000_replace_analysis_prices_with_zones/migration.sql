ALTER TABLE "analyses"
  DROP COLUMN "targetPrice",
  DROP COLUMN "entryPrice",
  DROP COLUMN "stopLoss",
  DROP COLUMN "takeProfit",
  ADD COLUMN "entryZone" TEXT,
  ADD COLUMN "exitZone" TEXT;