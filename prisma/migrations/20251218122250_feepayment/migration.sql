/*
  Warnings:

  - Added the required column `feePayment` to the `FeeDuration` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "FeeDuration" ADD COLUMN     "feePayment" "FeePayment" NOT NULL;
