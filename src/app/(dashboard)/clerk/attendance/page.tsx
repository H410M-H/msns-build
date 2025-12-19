import { CalendarIcon, Loader2 } from "lucide-react";
import { Badge } from "~/components/ui/badge";
import dayjs from "dayjs";
import { CalendarGrid } from "~/components/attendance/attendance/attendance-calendar";
import { Suspense } from "react";

export const dynamic = "force-dynamic";

export default function AttendancePage() {
  return (
    <div className="relative min-h-screen w-full bg-slate-950 overflow-x-hidden selection:bg-emerald-500/30">
      
      {/* === GLOBAL GRID BACKGROUND === */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(45,255,196,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(45,255,196,0.05)_1px,transparent_1px)] bg-[size:3rem_3rem] sm:bg-[size:4rem_4rem]" />
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/20 via-slate-950/80 to-slate-950" />
      </div>

      <div className="relative z-10 flex flex-col min-h-screen">
        
        {/* === Header === */}
        <header className="sticky top-0 z-50 border-b border-emerald-500/20 bg-slate-900/80 backdrop-blur-xl p-4 sm:p-6 transition-all duration-300">
          <div className="mx-auto flex max-w-[1920px] flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            
            {/* Title Section */}
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 shadow-lg shadow-emerald-900/20">
                <CalendarIcon className="h-6 w-6 text-emerald-400" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white font-serif">
                  Attendance System
                </h1>
                <p className="text-sm text-slate-400">
                  Track and manage employee attendance records
                </p>
              </div>
            </div>

            {/* Date Badge */}
            <div className="flex items-center gap-4 self-start sm:self-auto">
              <Badge variant="outline" className="h-9 px-4 text-sm bg-slate-800/50 border-emerald-500/30 text-emerald-100 backdrop-blur-md shadow-sm">
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
                  <p className="text-emerald-500/50 animate-pulse text-sm">Loading calendar data...</p>
                </div>
              }
            >
              {/* Content Wrapper for consistency */}
              <div className="rounded-2xl border border-emerald-500/10 bg-slate-900/40 backdrop-blur-sm p-1 shadow-2xl">
                 <CalendarGrid />
              </div>
            </Suspense>
          </div>
        </main>
      </div>
    </div>
  );
}