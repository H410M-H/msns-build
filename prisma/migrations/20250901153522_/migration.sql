-- CreateEnum
CREATE TYPE "public"."ExpenseCategory" AS ENUM ('UTILITIES', 'SUPPLIES', 'MAINTENANCE', 'SALARIES', 'TRANSPORT', 'FOOD', 'EQUIPMENT', 'OTHER');

-- CreateTable
CREATE TABLE "public"."Expenses" (
    "expenseId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "amount" DOUBLE PRECISION NOT NULL,
    "category" "public"."ExpenseCategory" NOT NULL,
    "month" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Expenses_pkey" PRIMARY KEY ("expenseId")
);
