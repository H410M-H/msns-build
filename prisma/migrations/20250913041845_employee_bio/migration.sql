/*
  Warnings:

  - You are about to drop the `Fingerprint` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "public"."Fingerprint";

-- CreateTable
CREATE TABLE "public"."BioMetric" (
    "fingerId" TEXT NOT NULL,
    "thumb" TEXT NOT NULL DEFAULT '',
    "indexFinger" TEXT NOT NULL DEFAULT '',
    "employeeId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BioMetric_pkey" PRIMARY KEY ("fingerId")
);

-- CreateIndex
CREATE UNIQUE INDEX "BioMetric_employeeId_key" ON "public"."BioMetric"("employeeId");

-- AddForeignKey
ALTER TABLE "public"."BioMetric" ADD CONSTRAINT "BioMetric_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "public"."Employees"("employeeId") ON DELETE RESTRICT ON UPDATE CASCADE;
