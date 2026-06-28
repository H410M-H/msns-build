"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { MarkAttendanceTab } from "./components/MarkAttendanceTab";
import { MonthlyReportTab } from "./components/MonthlyReportTab";

export default function EmployeeAttendancePage() {
  return (
    <div className="container mx-auto space-y-6 p-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Employee Attendance
          </h1>
          <p className="text-muted-foreground">
            Manage and view attendance records for all staff members
          </p>
        </div>
      </div>

      <Tabs defaultValue="mark" className="w-full">
        <TabsList className="mb-4 grid w-full grid-cols-2 md:w-[400px]">
          <TabsTrigger value="mark">Mark Attendance</TabsTrigger>
          <TabsTrigger value="report">Monthly Report</TabsTrigger>
        </TabsList>

        <TabsContent value="mark" className="m-0 border-none p-0 outline-none">
          {/* We wrap with a div that neutralizes the internal container padding from the moved tabs so it looks seamless */}
          <div className="-m-6">
            <MarkAttendanceTab />
          </div>
        </TabsContent>

        <TabsContent value="report" className="m-0 border-none p-0 outline-none">
          <div className="-m-6">
            <MonthlyReportTab />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
