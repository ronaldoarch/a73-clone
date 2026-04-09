-- Baseline MySQL / MariaDB (sem DATETIME(3) nem comentários dentro de CREATE — evita falhas em versões antigas)

CREATE TABLE `User` (
    `id` VARCHAR(191) NOT NULL,
    `account` VARCHAR(191) NOT NULL,
    `phone` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,
    `indicatorId` VARCHAR(191) NULL,
    `roletaNovosUsedAt` DATETIME NULL,
    `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updatedAt` DATETIME NOT NULL,

    UNIQUE INDEX `User_account_key`(`account`),
    INDEX `User_indicatorId_idx`(`indicatorId`),
    INDEX `User_createdAt_idx`(`createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `AfiliadoData` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `pid` VARCHAR(191) NOT NULL,
    `subDiretos` INT NOT NULL DEFAULT 0,
    `subValidos` INT NOT NULL DEFAULT 0,
    `subOutros` INT NOT NULL DEFAULT 0,
    `novosSubordinados` INT NOT NULL DEFAULT 0,
    `valorDeposito` DOUBLE NOT NULL DEFAULT 0,
    `numDepositos` INT NOT NULL DEFAULT 0,
    `valorPrimeiroDep` DOUBLE NOT NULL DEFAULT 0,
    `usuariosPrimeiroDep` INT NOT NULL DEFAULT 0,
    `valorSaque` DOUBLE NOT NULL DEFAULT 0,
    `numSaques` INT NOT NULL DEFAULT 0,
    `comissaoRecebida` DOUBLE NOT NULL DEFAULT 0,
    `comissaoPendente` DOUBLE NOT NULL DEFAULT 0,
    `comissaoHoje` DOUBLE NOT NULL DEFAULT 0,
    `coletavelRebate` DOUBLE NOT NULL DEFAULT 0,
    `apostaAcumulada` DOUBLE NOT NULL DEFAULT 0,
    `nivelVip` INT NOT NULL DEFAULT 0,
    `bonusVipReclamar` DOUBLE NOT NULL DEFAULT 0,
    `horaRegisto` DATETIME NULL,
    `depositoMisterioso` DOUBLE NOT NULL DEFAULT 0,
    `misteriosoReclamado` TINYINT(1) NOT NULL DEFAULT 0,
    `misteriosoDiasAtivos` INT NOT NULL DEFAULT 0,
    `misteriosoCicloAtual` INT NOT NULL DEFAULT 0,
    `bonusPromoReclamados` TEXT NOT NULL,
    `bonusVipColetados` TEXT NOT NULL,
    `balance` DOUBLE NOT NULL DEFAULT 0,
    `vipDiarioColetadoEm` DATETIME NULL,
    `vipSemanalColetadoEm` DATETIME NULL,
    `vipMensalColetadoEm` DATETIME NULL,
    `rolloverPendente` DOUBLE NOT NULL DEFAULT 0,
    `updatedAt` DATETIME NOT NULL,

    UNIQUE INDEX `AfiliadoData_userId_key`(`userId`),
    UNIQUE INDEX `AfiliadoData_pid_key`(`pid`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `Deposit` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `valor` DOUBLE NOT NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'concluido',
    `externalId` VARCHAR(191) NULL,
    `creditJson` LONGTEXT NULL,
    `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    INDEX `Deposit_userId_status_createdAt_idx`(`userId`, `status`, `createdAt`),
    INDEX `Deposit_status_createdAt_idx`(`status`, `createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `Setting` (
    `id` VARCHAR(191) NOT NULL DEFAULT 'main',
    `logo` VARCHAR(191) NULL,
    `banner` VARCHAR(191) NULL,
    `value` LONGTEXT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `RoletaBonus` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `bonusBalance` DOUBLE NOT NULL DEFAULT 0,
    `spinsRemaining` INT NOT NULL DEFAULT 1,
    `lastSpinDate` DATETIME NULL,
    `bonusExpiresAt` DATETIME NULL,
    `updatedAt` DATETIME NOT NULL,

    UNIQUE INDEX `RoletaBonus_userId_key`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `RoletaBonusLog` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `valor` DOUBLE NOT NULL,
    `descricao` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

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
    `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    UNIQUE INDEX `GameTxnLog_txnId_key`(`txnId`),
    INDEX `GameTxnLog_userId_createdAt_idx`(`userId`, `createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `Withdrawal` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `valor` DOUBLE NOT NULL,
    `metodo` VARCHAR(191) NOT NULL,
    `nome` VARCHAR(191) NULL,
    `cpfId` VARCHAR(191) NULL,
    `externalId` VARCHAR(191) NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'pendente',
    `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updatedAt` DATETIME NOT NULL,

    INDEX `Withdrawal_userId_status_idx`(`userId`, `status`),
    INDEX `Withdrawal_status_createdAt_idx`(`status`, `createdAt`),
    INDEX `Withdrawal_externalId_idx`(`externalId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `AfiliadoData` ADD CONSTRAINT `AfiliadoData_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `Deposit` ADD CONSTRAINT `Deposit_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `Withdrawal` ADD CONSTRAINT `Withdrawal_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
