-- Demo iGameWin por utilizador (user_create com is_demo)
ALTER TABLE `User` ADD COLUMN `igamewinDemo` BOOLEAN NOT NULL DEFAULT false;
