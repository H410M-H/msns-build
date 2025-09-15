import { CalendarIcon } from "lucide-react";
import { Badge } from "~/components/ui/badge";
import dayjs from "dayjs";
import { CalendarGrid } from "~/components/test/attendance/attendance-calendar";
import { Suspense } from "react";
export default function AttendancePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
              <CalendarIcon className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-foreground">
                Attendance System
              </h1>
              <p className="text-sm text-muted-foreground">
                Track and manage employee attendance
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Badge variant="outline" className="text-sm">
              {dayjs().format("dddd, MMMM D, YYYY")}
            </Badge>
          </div>
        </div>
      </header>
      <Suspense
        fallback={<div className="text-4xl text-red-600">Loading....</div>}
      >
        <CalendarGrid />
      </Suspense>
    </div>
  );
}
