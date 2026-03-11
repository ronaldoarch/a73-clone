-- AlterTable: User - add indicatorId (indica quem indicou - userId do afiliado)
ALTER TABLE "User" ADD COLUMN "indicatorId" TEXT;
-- Remove pid antigo se existir (era código de afiliado; agora usamos AfiliadoData.pid)
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema=current_schema() AND table_name='User' AND column_name='pid') THEN
    ALTER TABLE "User" DROP COLUMN "pid";
  END IF;
END $$;

-- CreateTable AfiliadoData
CREATE TABLE "AfiliadoData" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "pid" TEXT NOT NULL,
    "subDiretos" INTEGER NOT NULL DEFAULT 0,
    "subValidos" INTEGER NOT NULL DEFAULT 0,
    "subOutros" INTEGER NOT NULL DEFAULT 0,
    "novosSubordinados" INTEGER NOT NULL DEFAULT 0,
    "valorDeposito" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "numDepositos" INTEGER NOT NULL DEFAULT 0,
    "valorPrimeiroDep" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "usuariosPrimeiroDep" INTEGER NOT NULL DEFAULT 0,
    "valorSaque" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "numSaques" INTEGER NOT NULL DEFAULT 0,
    "comissaoRecebida" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "comissaoPendente" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "comissaoHoje" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "coletavelRebate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "apostaAcumulada" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "nivelVip" INTEGER NOT NULL DEFAULT 0,
    "bonusVipReclamar" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "horaRegisto" TIMESTAMP(3),
    "depositoMisterioso" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "misteriosoReclamado" BOOLEAN NOT NULL DEFAULT false,
    "misteriosoDiasAtivos" INTEGER NOT NULL DEFAULT 0,
    "bonusPromoReclamados" JSONB NOT NULL DEFAULT '[]',
    "bonusVipColetados" JSONB NOT NULL DEFAULT '[]',
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AfiliadoData_pkey" PRIMARY KEY ("id")
);

-- CreateTable Deposit
CREATE TABLE "Deposit" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "valor" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Deposit_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "AfiliadoData_userId_key" ON "AfiliadoData"("userId");
CREATE UNIQUE INDEX "AfiliadoData_pid_key" ON "AfiliadoData"("pid");

ALTER TABLE "AfiliadoData" ADD CONSTRAINT "AfiliadoData_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Deposit" ADD CONSTRAINT "Deposit_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
