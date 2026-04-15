-- CreateTable
CREATE TABLE `CpaPayout` (
    `id` VARCHAR(191) NOT NULL,
    `affiliateUserId` VARCHAR(191) NOT NULL,
    `subUserId` VARCHAR(191) NOT NULL,
    `tier` INTEGER NOT NULL,
    `amount` DOUBLE NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `CpaPayout_affiliateUserId_subUserId_tier_key`(`affiliateUserId`, `subUserId`, `tier`),
    INDEX `CpaPayout_subUserId_idx`(`subUserId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
