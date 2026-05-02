/*
  Warnings:

  - A unique constraint covering the columns `[libraryId,lockerNumber]` on the table `Student` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `fatherName` to the `Student` table without a default value. This is not possible if the table is not empty.
  - Added the required column `fatherPhone` to the `Student` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Student_lockerNumber_key";

-- AlterTable
ALTER TABLE "Student" ADD COLUMN     "aadhaarBackId" TEXT,
ADD COLUMN     "aadhaarBackUrl" TEXT,
ADD COLUMN     "aadhaarFrontId" TEXT,
ADD COLUMN     "aadhaarFrontUrl" TEXT,
ADD COLUMN     "aadhaarNumber" TEXT,
ADD COLUMN     "fatherName" TEXT NOT NULL,
ADD COLUMN     "fatherPhone" TEXT NOT NULL,
ADD COLUMN     "profileImageId" TEXT,
ADD COLUMN     "profileImageUrl" TEXT,
ADD COLUMN     "temporaryAddress" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Student_libraryId_lockerNumber_key" ON "Student"("libraryId", "lockerNumber");
