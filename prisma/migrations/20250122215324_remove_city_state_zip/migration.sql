/*
  Warnings:

  - You are about to drop the column `city` on the `Facility` table. All the data in the column will be lost.
  - You are about to drop the column `state` on the `Facility` table. All the data in the column will be lost.
  - You are about to drop the column `zip` on the `Facility` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Facility" DROP COLUMN "city",
DROP COLUMN "state",
DROP COLUMN "zip";
