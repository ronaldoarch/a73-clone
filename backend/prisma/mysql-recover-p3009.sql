-- Executar UMA VEZ no MySQL do Coolify quando aparecer P3009 (migração falhou a meio).
-- Isto apaga o estado da baseline e todas as tabelas da app (base vazia).
-- Depois: redeploy do container (entrypoint corre migrate deploy) OU `npx prisma migrate deploy` com DATABASE_URL.

SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS `Withdrawal`;
DROP TABLE IF EXISTS `Deposit`;
DROP TABLE IF EXISTS `AfiliadoData`;
DROP TABLE IF EXISTS `GameTxnLog`;
DROP TABLE IF EXISTS `RoletaBonusLog`;
DROP TABLE IF EXISTS `RoletaBonus`;
DROP TABLE IF EXISTS `Setting`;
DROP TABLE IF EXISTS `User`;
DROP TABLE IF EXISTS `_prisma_migrations`;

SET FOREIGN_KEY_CHECKS = 1;

-- Alternativa sem apagar tudo: só remover o registo da migração falhada e tabelas parciais:
-- DELETE FROM `_prisma_migrations` WHERE `migration_name` = '20250409140000_mysql_baseline';
-- (e depois DROP das tabelas que tiverem sido criadas antes do erro)
