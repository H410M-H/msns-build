/*
  Warnings:

  - A unique constraint covering the columns `[employeeId,date]` on the table `EmployeeAttendance` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "EmployeeAttendance_employeeId_date_key" ON "public"."EmployeeAttendance"("employeeId", "date");
