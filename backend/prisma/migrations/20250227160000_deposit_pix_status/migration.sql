-- AlterTable Deposit: status e externalId para PIX Gatebox
ALTER TABLE "Deposit" ADD COLUMN IF NOT EXISTS "status" TEXT NOT NULL DEFAULT 'concluido';
ALTER TABLE "Deposit" ADD COLUMN IF NOT EXISTS "externalId" TEXT;
