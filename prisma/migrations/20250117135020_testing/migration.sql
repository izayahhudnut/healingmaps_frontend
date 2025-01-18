-- CreateEnum
CREATE TYPE "Status" AS ENUM ('active', 'inactive');

-- AlterTable
ALTER TABLE "Patient" ADD COLUMN     "status" "Status" NOT NULL DEFAULT 'active';
