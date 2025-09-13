-- CreateTable
CREATE TABLE "public"."EmployeeAttendance" (
    "employeeAttendanceId" TEXT NOT NULL,
    "morning" TEXT NOT NULL DEFAULT 'A',
    "afternoon" TEXT NOT NULL DEFAULT 'A',
    "employeeId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EmployeeAttendance_pkey" PRIMARY KEY ("employeeAttendanceId")
);

-- AddForeignKey
ALTER TABLE "public"."EmployeeAttendance" ADD CONSTRAINT "EmployeeAttendance_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "public"."Employees"("employeeId") ON DELETE RESTRICT ON UPDATE CASCADE;
