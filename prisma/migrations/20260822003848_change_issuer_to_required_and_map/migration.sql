/*
  Warnings:

  - A unique constraint covering the columns `[issuer,accountId]` on the table `account` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "account" ALTER COLUMN "issuer" DROP DEFAULT;

-- CreateIndex
CREATE UNIQUE INDEX "account_issuer_accountId_uidx" ON "account"("issuer", "accountId");
