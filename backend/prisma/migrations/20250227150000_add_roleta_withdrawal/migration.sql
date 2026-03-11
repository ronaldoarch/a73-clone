-- CreateTable RoletaBonus
CREATE TABLE IF NOT EXISTS "RoletaBonus" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "bonusBalance" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "spinsRemaining" INTEGER NOT NULL DEFAULT 1,
    "lastSpinDate" TIMESTAMP(3),
    "bonusExpiresAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RoletaBonus_pkey" PRIMARY KEY ("id")
);

-- CreateTable RoletaBonusLog
CREATE TABLE IF NOT EXISTS "RoletaBonusLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "valor" DOUBLE PRECISION NOT NULL,
    "descricao" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RoletaBonusLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable Withdrawal
CREATE TABLE IF NOT EXISTS "Withdrawal" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "valor" DOUBLE PRECISION NOT NULL,
    "metodo" TEXT NOT NULL,
    "nome" TEXT,
    "cpfId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pendente',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Withdrawal_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "RoletaBonus_userId_key" ON "RoletaBonus"("userId");

-- AddForeignKey (only if tables were just created - use DO block for safety)
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'RoletaBonus_userId_fkey') THEN
        ALTER TABLE "RoletaBonus" ADD CONSTRAINT "RoletaBonus_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'RoletaBonusLog_userId_fkey') THEN
        ALTER TABLE "RoletaBonusLog" ADD CONSTRAINT "RoletaBonusLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Withdrawal_userId_fkey') THEN
        ALTER TABLE "Withdrawal" ADD CONSTRAINT "Withdrawal_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;
