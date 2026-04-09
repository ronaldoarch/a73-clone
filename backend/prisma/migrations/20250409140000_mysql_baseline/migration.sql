-- Baseline MySQL (Coolify / produção). Histórico SQLite antigo removido.
-- Base vazia: migrate deploy cria todas as tabelas.

-- CreateTable
CREATE TABLE `User` (
    `id` VARCHAR(191) NOT NULL,
    `account` VARCHAR(191) NOT NULL,
    `phone` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,
    `indicatorId` VARCHAR(191) NULL,
    `roletaNovosUsedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `User_account_key`(`account`),
    INDEX `User_indicatorId_idx`(`indicatorId`),
    INDEX `User_createdAt_idx`(`createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `AfiliadoData` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `pid` VARCHAR(191) NOT NULL,
    `subDiretos` INTEGER NOT NULL DEFAULT 0,
    `subValidos` INTEGER NOT NULL DEFAULT 0,
    `subOutros` INTEGER NOT NULL DEFAULT 0,
    `novosSubordinados` INTEGER NOT NULL DEFAULT 0,
    `valorDeposito` DOUBLE NOT NULL DEFAULT 0,
    `numDepositos` INTEGER NOT NULL DEFAULT 0,
    `valorPrimeiroDep` DOUBLE NOT NULL DEFAULT 0,
    `usuariosPrimeiroDep` INTEGER NOT NULL DEFAULT 0,
    `valorSaque` DOUBLE NOT NULL DEFAULT 0,
    `numSaques` INTEGER NOT NULL DEFAULT 0,
    `comissaoRecebida` DOUBLE NOT NULL DEFAULT 0,
    `comissaoPendente` DOUBLE NOT NULL DEFAULT 0,
    `comissaoHoje` DOUBLE NOT NULL DEFAULT 0,
    `coletavelRebate` DOUBLE NOT NULL DEFAULT 0,
    `apostaAcumulada` DOUBLE NOT NULL DEFAULT 0,
    `nivelVip` INTEGER NOT NULL DEFAULT 0,
    `bonusVipReclamar` DOUBLE NOT NULL DEFAULT 0,
    `horaRegisto` DATETIME(3) NULL,
    `depositoMisterioso` DOUBLE NOT NULL DEFAULT 0,
    `misteriosoReclamado` BOOLEAN NOT NULL DEFAULT false,
    `misteriosoDiasAtivos` INTEGER NOT NULL DEFAULT 0,
    `misteriosoCicloAtual` INTEGER NOT NULL DEFAULT 0,
    `bonusPromoReclamados` TEXT NOT NULL DEFAULT '[]',
    `bonusVipColetados` TEXT NOT NULL DEFAULT '[]',
    `balance` DOUBLE NOT NULL DEFAULT 0,
    `vipDiarioColetadoEm` DATETIME(3) NULL,
    `vipSemanalColetadoEm` DATETIME(3) NULL,
    `vipMensalColetadoEm` DATETIME(3) NULL,
    `rolloverPendente` DOUBLE NOT NULL DEFAULT 0,
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `AfiliadoData_userId_key`(`userId`),
    UNIQUE INDEX `AfiliadoData_pid_key`(`pid`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Deposit` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `valor` DOUBLE NOT NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'concluido',
    `externalId` VARCHAR(191) NULL,
    `creditJson` LONGTEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `Deposit_userId_status_createdAt_idx`(`userId`, `status`, `createdAt`),
    INDEX `Deposit_status_createdAt_idx`(`status`, `createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Setting` (
    `id` VARCHAR(191) NOT NULL DEFAULT 'main',
    `logo` VARCHAR(191) NULL,
    `banner` VARCHAR(191) NULL,
    `value` LONGTEXT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `RoletaBonus` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `bonusBalance` DOUBLE NOT NULL DEFAULT 0,
    `spinsRemaining` INTEGER NOT NULL DEFAULT 1,
    `lastSpinDate` DATETIME(3) NULL,
    `bonusExpiresAt` DATETIME(3) NULL,
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `RoletaBonus_userId_key`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `RoletaBonusLog` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `valor` DOUBLE NOT NULL,
    `descricao` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `GameTxnLog` (
    `id` VARCHAR(191) NOT NULL,
    `txnId` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `userCode` VARCHAR(191) NOT NULL,
    `gameType` VARCHAR(191) NULL,
    `provider` VARCHAR(191) NULL,
    `gameCode` VARCHAR(191) NULL,
    `txnType` VARCHAR(191) NULL,
    `betReais` DOUBLE NOT NULL DEFAULT 0,
    `winReais` DOUBLE NOT NULL DEFAULT 0,
    `delta` DOUBLE NOT NULL DEFAULT 0,
    `balanceBefore` DOUBLE NOT NULL DEFAULT 0,
    `balanceAfter` DOUBLE NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `GameTxnLog_txnId_key`(`txnId`),
    INDEX `GameTxnLog_userId_createdAt_idx`(`userId`, `createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Withdrawal` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `valor` DOUBLE NOT NULL,
    `metodo` VARCHAR(191) NOT NULL,
    `nome` VARCHAR(191) NULL,
    `cpfId` VARCHAR(191) NULL,
    `externalId` VARCHAR(191) NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'pendente',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `Withdrawal_userId_status_idx`(`userId`, `status`),
    INDEX `Withdrawal_status_createdAt_idx`(`status`, `createdAt`),
    INDEX `Withdrawal_externalId_idx`(`externalId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `AfiliadoData` ADD CONSTRAINT `AfiliadoData_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Deposit` ADD CONSTRAINT `Deposit_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Withdrawal` ADD CONSTRAINT `Withdrawal_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
