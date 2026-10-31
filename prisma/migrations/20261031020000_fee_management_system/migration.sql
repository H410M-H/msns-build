-- CreateEnum safely if not exists
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'VoucherType') THEN
    CREATE TYPE "VoucherType" AS ENUM ('REGULAR_INSTALLMENT', 'SUB_INSTALLMENT', 'FULL_YEAR_MERGED', 'FEE_ADJUSTMENT', 'FINE_CHALLAN');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'PaymentStatus') THEN
    CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'PARTIALLY_PAID', 'PAID', 'OVERDUE', 'CANCELLED', 'LOCKED_MERGED');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'ConcessionCategory') THEN
    CREATE TYPE "ConcessionCategory" AS ENUM ('NONE', 'RS_10_SCHOLARSHIP', 'A_PLUS_PLUS', 'A_PLUS', 'A_GRADE', 'B_PLUS', 'B_GRADE', 'C_PLUS', 'C_GRADE', 'D_PLUS', 'D_GRADE', 'SIBLING_CONCESSION', 'STAFF_CHILD', 'ORPHAN_WELFARE', 'SUSPENDED_LOW_ATTENDANCE');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'ConcessionScope') THEN
    CREATE TYPE "ConcessionScope" AS ENUM ('SPECIAL_TWO_YEAR', 'GENERAL_ONE_YEAR', 'REFERRAL_ONE_INSTALLMENT');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'FineNature') THEN
    CREATE TYPE "FineNature" AS ENUM ('LATE_FEE', 'DISCIPLINE', 'ABSENTEEISM', 'LIBRARY_DAMAGE', 'LAB_BREAKAGE', 'OTHER');
  END IF;
END $$;

-- AlterTable FeeStudentClass
ALTER TABLE "FeeStudentClass"
  ADD COLUMN IF NOT EXISTS "installmentNo" INTEGER NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS "voucherType" "VoucherType" NOT NULL DEFAULT 'REGULAR_INSTALLMENT',
  ADD COLUMN IF NOT EXISTS "issueDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ADD COLUMN IF NOT EXISTS "dueDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ADD COLUMN IF NOT EXISTS "confirmedByUserId" TEXT,
  ADD COLUMN IF NOT EXISTS "collectingBank" TEXT DEFAULT 'CASH_COUNTER',
  ADD COLUMN IF NOT EXISTS "collectorName" TEXT,
  ADD COLUMN IF NOT EXISTS "concessionCategory" "ConcessionCategory" NOT NULL DEFAULT 'NONE',
  ADD COLUMN IF NOT EXISTS "concessionScope" "ConcessionScope",
  ADD COLUMN IF NOT EXISTS "concessionAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "exemptionAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "exemptionApprovedBy" TEXT,
  ADD COLUMN IF NOT EXISTS "exemptionReason" TEXT,
  ADD COLUMN IF NOT EXISTS "parentVoucherId" TEXT,
  ADD COLUMN IF NOT EXISTS "subInstallmentIndex" INTEGER NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS "totalSubInstallments" INTEGER NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS "isSplitLocked" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS "mergedIntoVoucherId" TEXT,
  ADD COLUMN IF NOT EXISTS "fineNature" "FineNature",
  ADD COLUMN IF NOT EXISTS "adjustmentAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "adjustmentReason" TEXT,
  ADD COLUMN IF NOT EXISTS "admissionFeePaid" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS "paymentStatus" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
  ADD COLUMN IF NOT EXISTS "amountPaid" DOUBLE PRECISION NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "paymentHistory" JSONB DEFAULT '[]';

-- Alter discountDescription to be nullable
ALTER TABLE "FeeStudentClass" ALTER COLUMN "discountDescription" DROP NOT NULL;

-- Safely add voucherNumber, backfill existing 1550 rows, then enforce NOT NULL and UNIQUE
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'FeeStudentClass' AND column_name = 'voucherNumber'
  ) THEN
    ALTER TABLE "FeeStudentClass" ADD COLUMN "voucherNumber" TEXT;
    UPDATE "FeeStudentClass" SET "voucherNumber" = 'VCH-' || "sfcId" WHERE "voucherNumber" IS NULL;
    ALTER TABLE "FeeStudentClass" ALTER COLUMN "voucherNumber" SET NOT NULL;
    CREATE UNIQUE INDEX "FeeStudentClass_voucherNumber_key" ON "FeeStudentClass"("voucherNumber");
  END IF;
END $$;

-- Backfill paymentStatus based on tuitionPaid for existing data
UPDATE "FeeStudentClass" SET "paymentStatus" = 'PAID' WHERE "tuitionPaid" = true AND "paymentStatus" = 'PENDING';

-- Drop old unique constraint
DROP INDEX IF EXISTS "FeeStudentClass_studentClassId_feeId_month_year_key";

-- Create new unique constraint
CREATE UNIQUE INDEX IF NOT EXISTS "FeeStudentClass_studentClassId_feeId_month_year_subInstallmentIndex_key" ON "FeeStudentClass"("studentClassId", "feeId", "month", "year", "subInstallmentIndex");

-- Create Indexes on FeeStudentClass
CREATE INDEX IF NOT EXISTS "FeeStudentClass_studentClassId_idx" ON "FeeStudentClass"("studentClassId");
CREATE INDEX IF NOT EXISTS "FeeStudentClass_feeId_idx" ON "FeeStudentClass"("feeId");
CREATE INDEX IF NOT EXISTS "FeeStudentClass_month_year_idx" ON "FeeStudentClass"("month", "year");
CREATE INDEX IF NOT EXISTS "FeeStudentClass_paymentStatus_idx" ON "FeeStudentClass"("paymentStatus");
CREATE INDEX IF NOT EXISTS "FeeStudentClass_voucherNumber_idx" ON "FeeStudentClass"("voucherNumber");
CREATE INDEX IF NOT EXISTS "FeeStudentClass_parentVoucherId_idx" ON "FeeStudentClass"("parentVoucherId");
CREATE INDEX IF NOT EXISTS "FeeStudentClass_mergedIntoVoucherId_idx" ON "FeeStudentClass"("mergedIntoVoucherId");

-- Add ForeignKey for self-referential subInstallment hierarchy if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'FeeStudentClass_parentVoucherId_fkey'
  ) THEN
    ALTER TABLE "FeeStudentClass" ADD CONSTRAINT "FeeStudentClass_parentVoucherId_fkey" FOREIGN KEY ("parentVoucherId") REFERENCES "FeeStudentClass"("sfcId") ON DELETE RESTRICT ON UPDATE CASCADE;
  END IF;
END $$;

-- CreateTable ChallanValidity
CREATE TABLE IF NOT EXISTS "ChallanValidity" (
    "challanValidityId" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "gradeId" TEXT NOT NULL,
    "installmentNo" INTEGER NOT NULL,
    "month" INTEGER,
    "year" INTEGER NOT NULL,
    "fromDate" TIMESTAMP(3) NOT NULL,
    "toDate" TIMESTAMP(3) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ChallanValidity_pkey" PRIMARY KEY ("challanValidityId")
);

-- CreateTable SchoolBankDetails
CREATE TABLE IF NOT EXISTS "SchoolBankDetails" (
    "bankId" TEXT NOT NULL,
    "bankName" TEXT NOT NULL,
    "accountTitle" TEXT NOT NULL,
    "accountNumber" TEXT NOT NULL,
    "iban" TEXT,
    "branchCode" TEXT,
    "branchName" TEXT,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SchoolBankDetails_pkey" PRIMARY KEY ("bankId")
);

-- CreateIndexes on ChallanValidity
CREATE UNIQUE INDEX IF NOT EXISTS "ChallanValidity_sessionId_gradeId_installmentNo_key" ON "ChallanValidity"("sessionId", "gradeId", "installmentNo");
CREATE INDEX IF NOT EXISTS "ChallanValidity_sessionId_gradeId_idx" ON "ChallanValidity"("sessionId", "gradeId");

-- Add ForeignKeys for ChallanValidity if not exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'ChallanValidity_sessionId_fkey'
  ) THEN
    ALTER TABLE "ChallanValidity" ADD CONSTRAINT "ChallanValidity_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "Sessions"("sessionId") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'ChallanValidity_gradeId_fkey'
  ) THEN
    ALTER TABLE "ChallanValidity" ADD CONSTRAINT "ChallanValidity_gradeId_fkey" FOREIGN KEY ("gradeId") REFERENCES "Grades"("classId") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;
