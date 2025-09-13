-- DropIndex
DROP INDEX "public"."EmployeeAttendance_createdAt_employeeId_key";

-- AlterTable
ALTER TABLE "public"."EmployeeAttendance" ADD COLUMN     "date" TEXT NOT NULL DEFAULT '';
