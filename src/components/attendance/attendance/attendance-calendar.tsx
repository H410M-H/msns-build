"use client";

import { useCallback, useMemo, useState } from "react";
import dayjs, { type Dayjs } from "dayjs";
import { Card } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
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
                        "grid h-full min-w-[40px] gap-2 rounded border border-border/50 p-1 text-xs",
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
                        <>
                          <p
                            className={`${attendance.morning == "P" ? "font-bold text-primary" : "font-bold text-destructive"}`}
                          >
                            {attendance.morning}
                          </p>
                          <span className="h-1 w-full border-2" />
                          <p
                            className={`${attendance.afternoon == "P" ? "font-bold text-primary" : "font-bold text-destructive"}`}
                          >
                            {attendance.afternoon}
                          </p>
                        </>
                      ) : (
                        <>
                          <p className="font-bold text-destructive">A</p>
                          <span className="h-1 w-full border-2" />
                          <p className="font-bold text-destructive">A</p>
                        </>
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
