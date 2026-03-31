import { Clock, Bell } from "lucide-react";
import EventsTable from "~/components/tables/EventsTable";

interface EventsSectionProps {
  isStudent: boolean;
  isTeacher: boolean;
}

export const EventsSection = ({ isStudent, isTeacher }: EventsSectionProps) => {
  return (
    <section className="mb-12">
      <div className="mb-8 flex items-center gap-4">
        <div className="relative">
          <div className="-rotate-2 transform rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 p-3 shadow-xl transition-transform duration-300 hover:rotate-0">
            <Clock className="h-6 w-6 text-foreground" />
          </div>
          <div className="absolute right-0 top-0 h-3 w-3 animate-pulse rounded-full bg-red-500"></div>
        </div>

        <div className="space-y-1">
          <h2 className="text-2xl font-bold text-foreground">
            {isStudent
              ? "Your Upcoming Events"
              : isTeacher
                ? "Teaching Events"
                : "All Events"}
          </h2>
          <p className="text-muted-foreground">Stay updated with latest activities</p>
        </div>

        <div className="ml-auto hidden items-center gap-2 lg:flex">
          <Bell className="h-4 w-4 animate-pulse text-blue-600" />
          <span className="text-sm text-muted-foreground">Auto-refresh enabled</span>
        </div>
      </div>

      <div className="group relative">
        <div className="absolute inset-0 scale-95 transform rounded-3xl bg-gradient-to-r from-cyan-200/25 to-blue-200/25 blur-xl transition-all duration-500 group-hover:scale-100"></div>
        <div className="relative overflow-hidden rounded-3xl border border-border bg-white/80 shadow-2xl backdrop-blur-sm dark:bg-card">
          <div className="border-b border-border/50 bg-gradient-to-r from-slate-50 to-blue-50 px-8 py-4 dark:from-slate-900 dark:to-blue-900/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-3 w-3 animate-pulse rounded-full bg-green-500"></div>
                <span className="font-medium text-foreground">
                  Live Event Feed
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>Updated just now</span>
                <div className="h-2 w-2 animate-ping rounded-full bg-blue-400"></div>
              </div>
            </div>
          </div>

          <div className="p-8">
            <EventsTable />
          </div>
        </div>
      </div>
    </section>
  );
};
