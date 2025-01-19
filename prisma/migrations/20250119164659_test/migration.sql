/*
  Warnings:

  - You are about to drop the column `name` on the `Facility` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Facility" DROP COLUMN "name",
ADD COLUMN     "firstName" TEXT,
ADD COLUMN     "lastName" TEXT;
