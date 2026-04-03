-- AlterTable: adiciona campos de bônus VIP diário/semanal/mensal e rollover
ALTER TABLE "AfiliadoData"
  ADD COLUMN IF NOT EXISTS "vipDiarioColetadoEm"  TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "vipSemanalColetadoEm" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "vipMensalColetadoEm"  TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "rolloverPendente"      DOUBLE PRECISION NOT NULL DEFAULT 0;
