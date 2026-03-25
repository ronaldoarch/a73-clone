-- AlterTable Withdrawal: ID do saque no gateway (ex.: Cyber wd_xxx)
ALTER TABLE "Withdrawal" ADD COLUMN IF NOT EXISTS "externalId" TEXT;

CREATE INDEX IF NOT EXISTS "Withdrawal_externalId_idx" ON "Withdrawal"("externalId");
