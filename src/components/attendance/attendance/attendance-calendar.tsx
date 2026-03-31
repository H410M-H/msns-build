"use client";

import { useCallback, useMemo, useState } from "react";
import dayjs, { type Dayjs } from "dayjs";
import { Card } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { ChevronLeft, ChevronRight, User } from "lucide-react";
import { api } from "~/trpc/react";
import { cn } from "~/lib/utils";
import { AttendanceModal } from "./attendance-dialog";
import { useAttendance } from "~/hooks/use-attendance";

const weekdayNames: string[] = [
  "Sun",
  "Mon",
  "Tue",
  "Wed",
  "Thu",
  "Fri",
  "Sat",
];

export const CalendarGrid = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const { setEmployee, setOpen } = useAttendance();
  const [employees] = api.employee.getEmployees.useSuspenseQuery();
  const [attendances] =
    api.attendance.getAllEmployeeAttendance.useSuspenseQuery();

  const currentMonthDays: Dayjs[] = useMemo(() => {
    const monthStart = dayjs(currentDate).startOf("month");
    const daysInMonth = monthStart.daysInMonth();
    return Array.from({ length: daysInMonth }, (_, i) =>
      monthStart.date(i + 1),
    );
  }, [currentDate]);

  const navigateMonth = useCallback(
    (direction: "prev" | "next") => {
      const newDate = dayjs(currentDate)
        .add(direction === "next" ? 1 : -1, "month")
        .toDate();
      setCurrentDate(newDate);
    },
    [currentDate],
  );

  const getAttendanceForEmployeeAndDate = (
    employeeId: string,
    date: string,
  ) => {
    return attendances.find(
      (record) =>
        record.employeeId === employeeId &&
        dayjs(record.date).isSame(dayjs(date), "date"),
    );
  };

  const openDialog = useCallback(
    (employeeId: string, employeeName: string) => {
      setEmployee({ employeeId, employeeName });
      setOpen(true);
    },
    [setEmployee, setOpen],
  );

  // Helper to styling status text
  const getStatusColor = (status?: string) => {
    if (status === "P") return "text-emerald-600 font-bold";
    if (status === "L") return "text-amber-600 font-bold";
    return "text-rose-500 font-bold"; // Absent or other
  };

  return (
    <div className="flex h-full flex-col space-y-4">
      {/* --- Toolbar --- */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        {/* Month Navigation */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1 rounded-md bg-muted/50 p-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => navigateMonth("prev")}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="min-w-[140px] text-center font-semibold tabular-nums">
              {dayjs(currentDate).format("MMMM YYYY")}
            </span>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => navigateMonth("next")}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentDate(new Date())}
            className="hidden sm:flex"
          >
            Today
          </Button>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <span className="flex h-2 w-2 rounded-full bg-emerald-500" />
            <span>Present</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="flex h-2 w-2 rounded-full bg-rose-500" />
            <span>Absent</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="flex h-2 w-2 rounded-full bg-amber-500" />
            <span>Late</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="flex h-2 w-2 rounded-full bg-slate-300" />
            <span>Weekend</span>
          </div>
        </div>
      </div>

      {/* --- Calendar Grid --- */}
      <Card className="relative flex-1 overflow-hidden border-border/50 shadow-sm">
        <div className="h-full w-full overflow-auto">
          {/* We use min-w-max to allow horizontal scroll without shrinking columns */}
          <div className="grid min-w-max grid-cols-[220px_repeat(31,_minmax(48px,_1fr))] divide-x divide-border/40 text-sm">
            {/* 1. Header Row: Days */}
            {/* Sticky Corner (Top-Left) */}
            <div className="sticky left-0 top-0 z-20 flex h-20 flex-col justify-end bg-card p-3 font-medium text-muted-foreground shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">
              <span className="flex items-center gap-2">
                <User className="h-4 w-4" /> Employee
              </span>
            </div>

            {/* Date Headers */}
            {currentMonthDays.map((date) => {
              const isToday = date.isSame(dayjs(), "day");
              const isWeekend = date.day() === 0 || date.day() === 6;

              return (
                <div
                  // FIX: Use .format() explicitly instead of .toString() to fix TS error
                  key={date.format("YYYY-MM-DD")}
                  className={cn(
                    "sticky top-0 z-10 flex flex-col items-center justify-center border-b bg-card py-2 text-xs",
                    isWeekend && "bg-muted/20",
                    isToday && "bg-primary/5 text-primary",
                  )}
                >
                  <span
                    className={cn(
                      "font-medium uppercase opacity-70",
                      isToday && "font-bold text-primary",
                    )}
                  >
                    {weekdayNames[date.day()]?.substring(0, 3)}
                  </span>
                  <span
                    className={cn(
                      "flex h-8 w-8 items-center justify-center rounded-full text-base",
                      isToday && "bg-primary font-bold text-primary-foreground",
                    )}
                  >
                    {date.date()}
                  </span>
                </div>
              );
            })}

            {/* 2. Body Rows: Employees */}
            {employees.map((employee) => (
              // Use Fragment to avoid extra div wrapper disrupting grid layout
              <div className="contents" key={employee.employeeId}>
                {/* Employee Name (Sticky Left) */}
                <div className="sticky left-0 z-10 flex flex-col justify-center border-t bg-card p-3 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                      {employee.employeeName.substring(0, 2).toUpperCase()}
                    </div>
                    <div className="flex min-w-0 flex-col">
                      <span className="truncate text-sm font-medium text-foreground">
                        {employee.employeeName}
                      </span>
                      <span className="truncate text-xs text-muted-foreground">
                        {employee.designation}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Attendance Cells */}
                {currentMonthDays.map((date) => {
                  const attendance = getAttendanceForEmployeeAndDate(
                    employee.employeeId,
                    date.format("YYYY-MM-DD"),
                  );
                  const isToday = date.isSame(dayjs(), "day");
                  const isWeekend = date.day() === 0; // Sunday logic
                  const isFuture = date.isAfter(dayjs(), "day");

                  return (
                    <div
                      key={`${employee.employeeId}-${date.format("YYYY-MM-DD")}`}
                      className={cn(
                        "relative border-t p-1 transition-colors hover:bg-muted/50",
                        isWeekend && "bg-slate-50/50 dark:bg-card",
                        isToday && "bg-blue-50/30 dark:bg-blue-900/10",
                      )}
                    >
                      <Button
                        variant="ghost"
                        className={cn(
                          "flex h-full w-full flex-col gap-0.5 rounded-md p-0 text-[10px]",
                          // Only allow clicking if it's today or past
                          !isFuture && "cursor-pointer",
                          isFuture && "cursor-not-allowed opacity-50",
                          isToday && "ring-1 ring-inset ring-primary/30",
                        )}
                        disabled={isFuture}
                        onClick={() =>
                          openDialog(employee.employeeId, employee.employeeName)
                        }
                      >
                        {attendance ? (
                          <div className="flex h-full w-full flex-col items-center justify-center">
                            {/* Morning Slot */}
                            <div
                              className={cn(
                                "flex h-1/2 w-full items-center justify-center border-b border-border/40",
                                getStatusColor(attendance.morning),
                              )}
                            >
                              {attendance.morning}
                            </div>
                            {/* Afternoon Slot */}
                            <div
                              className={cn(
                                "flex h-1/2 w-full items-center justify-center",
                                getStatusColor(attendance.afternoon),
                              )}
                            >
                              {attendance.afternoon}
                            </div>
                          </div>
                        ) : (
                          // Empty State / Absent Default
                          <div className="flex h-full w-full flex-col items-center justify-center text-muted-foreground/30">
                            {!isFuture && !isWeekend && (
                              <span className="h-1.5 w-1.5 rounded-full bg-rose-200 dark:bg-rose-900" />
                            )}
                            {isWeekend && (
                              <span className="text-[9px]">OFF</span>
                            )}
                          </div>
                        )}
                      </Button>
                    </div>
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
