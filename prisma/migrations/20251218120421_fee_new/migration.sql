-- CreateEnum
CREATE TYPE "FeePayment" AS ENUM ('ADMISSION', 'TUITION', 'EXAM', 'LAB', 'CARD', 'CALLS');

-- CreateEnum
CREATE TYPE "FeeType" AS ENUM ('MONTHLY', 'ANNUAL');

-- CreateTable
CREATE TABLE "FeeDuration" (
    "feeId" TEXT NOT NULL,
    "level" "ClassCategory" NOT NULL,
    "feeName" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "type" "FeeCategory" NOT NULL DEFAULT 'MonthlyFee',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FeeDuration_pkey" PRIMARY KEY ("feeId")
);
