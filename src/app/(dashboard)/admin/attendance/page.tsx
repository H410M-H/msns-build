import { CalendarIcon, Loader2 } from "lucide-react";
import { Badge } from "~/components/ui/badge";
import dayjs from "dayjs";
import { CalendarGrid } from "~/components/attendance/attendance/attendance-calendar";
import { Suspense } from "react";

export const dynamic = "force-dynamic";

export default function AttendancePage() {
  return (
    <div className="relative min-h-screen w-full overflow-x-hidden bg-card selection:bg-emerald-500/30">
      {/* === GLOBAL GRID BACKGROUND === */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(45,255,196,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(45,255,196,0.05)_1px,transparent_1px)] bg-[size:3rem_3rem] sm:bg-[size:4rem_4rem]" />
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/20 via-slate-950/80 to-slate-950" />
      </div>

      <div className="relative z-10 flex min-h-screen flex-col">
        {/* === Header === */}
        <header className="sticky top-0 z-50 border-b border-emerald-500/20 bg-card p-4 backdrop-blur-xl transition-all duration-300 sm:p-6">
          <div className="mx-auto flex max-w-[1920px] flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            {/* Title Section */}
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-emerald-500/30 bg-gradient-to-br from-emerald-500/20 to-teal-500/20 shadow-lg shadow-emerald-900/20">
                <CalendarIcon className="h-6 w-6 text-emerald-400" />
              </div>
              <div>
                <h1 className="font-serif text-xl font-bold tracking-tight text-foreground sm:text-2xl">
                  Attendance System
                </h1>
                <p className="text-sm text-muted-foreground">
                  Track and manage employee attendance records
                </p>
              </div>
            </div>

            {/* Date Badge */}
            <div className="flex items-center gap-4 self-start sm:self-auto">
              <Badge
                variant="outline"
                className="h-9 border-emerald-500/30 bg-muted px-4 text-sm text-emerald-100 shadow-sm backdrop-blur-md"
              >
                {dayjs().format("dddd, MMMM D, YYYY")}
              </Badge>
            </div>
          </div>
        </header>

        {/* === Main Content === */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <div className="mx-auto max-w-[1920px]">
            <Suspense
              fallback={
                <div className="flex h-[50vh] flex-col items-center justify-center gap-3">
                  <Loader2 className="h-10 w-10 animate-spin text-emerald-500" />
                  <p className="animate-pulse text-sm text-emerald-500/50">
                    Loading calendar data...
                  </p>
                </div>
              }
            >
              {/* Content Wrapper for consistency */}
              <div className="rounded-2xl border border-emerald-500/10 bg-card p-1 shadow-2xl backdrop-blur-sm">
                <CalendarGrid />
              </div>
            </Suspense>
          </div>
        </main>
      </div>
    </div>
  );
}
