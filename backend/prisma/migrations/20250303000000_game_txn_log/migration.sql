-- CreateTable
CREATE TABLE "GameTxnLog" (
    "id" TEXT NOT NULL,
    "txnId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "userCode" TEXT NOT NULL,
    "gameType" TEXT,
    "provider" TEXT,
    "gameCode" TEXT,
    "txnType" TEXT,
    "betReais" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "winReais" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "delta" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "balanceBefore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "balanceAfter" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GameTxnLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "GameTxnLog_txnId_key" ON "GameTxnLog"("txnId");
