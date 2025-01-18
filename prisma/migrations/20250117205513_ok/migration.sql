/*
  Warnings:

  - A unique constraint covering the columns `[email]` on the table `Facility` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Facility_email_key" ON "Facility"("email");
