/*
  Warnings:

  - The `thumb` column on the `BioMetric` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `indexFinger` column on the `BioMetric` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "public"."BioMetric" DROP COLUMN "thumb",
ADD COLUMN     "thumb" TEXT[] DEFAULT ARRAY[]::TEXT[],
DROP COLUMN "indexFinger",
ADD COLUMN     "indexFinger" TEXT[] DEFAULT ARRAY[]::TEXT[];
