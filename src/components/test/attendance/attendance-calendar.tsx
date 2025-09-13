"use client";

import { useCallback, useMemo, useState } from "react";
import dayjs, { type Dayjs } from "dayjs";
import { Card } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { api } from "~/trpc/react";
import { cn } from "~/lib/utils";
import { AttendanceModal } from "./attendance-dialog";
import { useAttendance } from "~/hooks/use-attendance";

interface CalendarGridProps {
  onAttendanceClick?: (employeeId: string, date: string) => void;
}

interface AttendanceRecord {
  id: string;
  employeeId: string;
  date: string;
  status: "present" | "absent" | "late" | "half-day" | "holiday";
  checkIn?: string;
  checkOut?: string;
}

const weekdayNames: string[] = [
  "Sun",
  "Mon",
  "Tue",
  "Wed",
  "Thu",
  "Fri",
  "Sat",
];

const generateMockAttendance = (): AttendanceRecord[] => {
  const records: AttendanceRecord[] = [];
  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();

  Array.from<number>({ length: 10 }).forEach((_, index) => {
    for (let i = 1; i <= 31; i++) {
      const date = new Date(currentYear, currentMonth, i);
      if (date.getMonth() !== currentMonth) break; // Stop if we go to next month

      const dateStr = date.toISOString().split("T")[0] ?? "";

      // Random attendance status
      const statuses: AttendanceRecord["status"][] = [
        "present",
        "present",
        "present",
        "absent",
        "late",
      ];
      const randomStatus =
        statuses[Math.floor(Math.random() * statuses.length)];

      records.push({
        id: `${index}-${dateStr}`,
        employeeId: `employee-${index}`,
        date: dateStr,
        status: randomStatus ?? "present",
        checkIn:
          randomStatus === "present"
            ? "09:00"
            : randomStatus === "late"
              ? "09:30"
              : undefined,
        checkOut:
          randomStatus === "present" || randomStatus === "late"
            ? "17:30"
            : undefined,
      });
    }
  });

  return records;
};

export const CalendarGrid = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const { setEmployee, setOpen } = useAttendance();
  const [employees] = api.employee.getEmployees.useSuspenseQuery();
  const attendanceRecords = generateMockAttendance();

  const currentMonthDays: Dayjs[] = useMemo(() => {
    const monthStart = dayjs(currentDate).startOf("month");
    const daysInMonth = monthStart.daysInMonth();
    return Array.from({ length: daysInMonth }, (_, i) =>
      monthStart.date(i + 1),
    );
  }, [currentDate]);

  const navigateMonth = (direction: "prev" | "next") => {
    const newDate = dayjs(currentDate)
      .add(direction === "next" ? 1 : -1, "month")
      .toDate();
    setCurrentDate(newDate);
  };

  const getAttendanceForEmployeeAndDate = (
    employeeId: string,
    date: string,
  ) => {
    return attendanceRecords.find(
      (record) => record.employeeId === employeeId && record.date === date,
    );
  };

  const getStatusColor = (status: AttendanceRecord["status"]) => {
    const colors = {
      present:
        "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
      absent: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
      late: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
      "half-day":
        "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
      holiday:
        "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
    };
    return colors[status];
  };

  const getStatusSymbol = (status: AttendanceRecord["status"]) => {
    const symbols = {
      present: "P",
      absent: "A",
      late: "L",
      "half-day": "H",
      holiday: "🏖️",
    };
    return symbols[status];
  };

  const openDialog = useCallback(
    (employeeId: string, employeeName: string) => {
      setEmployee({ employeeId: employeeId, employeeName: employeeName });
      setOpen(true);
    },
    [setEmployee, setOpen],
  );

  return (
    <div className="space-y-4">
      {/* Calendar Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-semibold text-foreground">
            {dayjs(currentDate).format("MMMM YYYY")}
          </h2>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigateMonth("prev")}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigateMonth("next")}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <div className="flex items-center gap-1">
            <div className="h-3 w-3 rounded bg-green-100 dark:bg-green-900"></div>
            <span>Present</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="h-3 w-3 rounded bg-red-100 dark:bg-red-900"></div>
            <span>Absent</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="h-3 w-3 rounded bg-yellow-100 dark:bg-yellow-900"></div>
            <span>Late</span>
          </div>
        </div>
      </div>

      {/* Calendar Grid */}
      <Card className="p-4">
        <div className="overflow-x-auto">
          <div className="min-w-max">
            {/* Days of month header - Two rows */}
            <div className="mb-2 grid grid-cols-[200px_repeat(31,_minmax(40px,_1fr))] gap-1">
              {/* Empty cell for employee column */}
              <div className="p-2 text-xs font-medium text-muted-foreground">
                Employee
              </div>

              {/* Weekday names row */}
              {currentMonthDays.map((date) => (
                <div
                  key={`weekday-${date.date()}`}
                  className="p-1 text-center text-xs font-medium text-muted-foreground"
                >
                  {weekdayNames[date.day()]?.substring(0, 3)}
                </div>
              ))}
            </div>

            <div className="mb-4 grid grid-cols-[200px_repeat(31,_minmax(40px,_1fr))] gap-1">
              {/* Empty cell for employee column */}
              <div className="p-1 text-xs font-medium text-muted-foreground">
                Date
              </div>

              {/* Date numbers row */}
              {currentMonthDays.map((date) => (
                <div
                  key={`date-${date.date()}`}
                  className="p-1 text-center text-xs font-medium text-muted-foreground"
                >
                  {date.date()}
                </div>
              ))}
            </div>

            {/* Calendar rows for each employee */}
            {employees.map((employee) => (
              <div
                key={employee.employeeId}
                className="grid grid-cols-[200px_repeat(31,_minmax(40px,_1fr))] gap-1 border-t border-border py-2"
              >
                {/* Employee name column */}
                <div className="flex items-center p-2">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-foreground">
                      {employee.employeeName}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {employee.designation}
                    </p>
                  </div>
                </div>

                {currentMonthDays.map((date) => {
                  const attendance = getAttendanceForEmployeeAndDate(
                    employee.employeeId,
                    date.format("YYYY-MM-DD"),
                  );

                  const isToday = date.isSame(dayjs(), "day");
                  const isWeekend = date.day() === 0;
                  const isClickable = true;

                  return (
                    <Button
                      type="button"
                      variant="outline"
                      key={`${employee.employeeId}-${date.format("YYYY-MM-DD")}`}
                      className={cn(
                        "flex h-full min-w-[40px] items-center justify-center rounded border border-border/50 p-1 text-xs",
                        isToday && "ring-1 ring-primary",
                        isClickable && "cursor-pointer hover:bg-muted/50",
                        !isToday && "bg-gray-400",
                        isWeekend && "bg-orange-600",
                      )}
                      onClick={() =>
                        openDialog(employee.employeeId, employee.employeeName)
                      }
                      disabled={!isToday}
                    >
                      {attendance ? (
                        <Badge
                          variant="secondary"
                          className={`flex h-4 w-4 items-center justify-center p-0 text-xs ${getStatusColor(attendance.status)}`}
                        >
                          {getStatusSymbol(attendance.status)}
                        </Badge>
                      ) : (
                        <p>N</p>
                      )}
                    </Button>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </Card>
      <AttendanceModal />
    </div>
  );
};
