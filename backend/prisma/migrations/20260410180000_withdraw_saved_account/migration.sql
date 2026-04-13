-- CreateTable
CREATE TABLE `WithdrawSavedAccount` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `type` VARCHAR(16) NOT NULL,
    `holderName` VARCHAR(128) NOT NULL,
    `pixKeyType` VARCHAR(32) NULL,
    `pixKey` VARCHAR(256) NULL,
    `bankCode` VARCHAR(32) NULL,
    `bankAccount` VARCHAR(128) NULL,
    `isDefault` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `WithdrawSavedAccount_userId_idx`(`userId`),
    INDEX `WithdrawSavedAccount_userId_isDefault_idx`(`userId`, `isDefault`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `WithdrawSavedAccount` ADD CONSTRAINT `WithdrawSavedAccount_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
