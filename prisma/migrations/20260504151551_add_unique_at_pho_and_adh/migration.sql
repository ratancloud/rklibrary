/*
  Warnings:

  - A unique constraint covering the columns `[aadhaarNumber]` on the table `Student` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[phoneNumber]` on the table `Student` will be added. If there are existing duplicate values, this will fail.
  - Made the column `aadhaarNumber` on table `Student` required. This step will fail if there are existing NULL values in that column.

*/
-- DropIndex
DROP INDEX "Student_libraryId_lockerNumber_key";

-- DropIndex
DROP INDEX "Student_libraryId_phoneNumber_key";

-- AlterTable
ALTER TABLE "Student" ALTER COLUMN "aadhaarNumber" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Student_aadhaarNumber_key" ON "Student"("aadhaarNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Student_phoneNumber_key" ON "Student"("phoneNumber");
