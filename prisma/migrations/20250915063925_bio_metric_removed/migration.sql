/*
  Warnings:

  - You are about to drop the `BioMetric` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."BioMetric" DROP CONSTRAINT "BioMetric_employeeId_fkey";

-- DropTable
DROP TABLE "public"."BioMetric";
