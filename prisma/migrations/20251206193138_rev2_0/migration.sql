/*
  Warnings:

  - A unique constraint covering the columns `[studentClassId,feeId,month,year]` on the table `FeeStudentClass` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "public"."FeeStudentClass" ADD COLUMN     "lateFee" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "month" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "paidAt" TIMESTAMP(3),
ADD COLUMN     "year" INTEGER NOT NULL DEFAULT 2024;

-- CreateIndex
CREATE UNIQUE INDEX "FeeStudentClass_studentClassId_feeId_month_year_key" ON "public"."FeeStudentClass"("studentClassId", "feeId", "month", "year");
