/*
  Warnings:

  - A unique constraint covering the columns `[createdAt,employeeId]` on the table `EmployeeAttendance` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "EmployeeAttendance_createdAt_employeeId_key" ON "public"."EmployeeAttendance"("createdAt", "employeeId");
