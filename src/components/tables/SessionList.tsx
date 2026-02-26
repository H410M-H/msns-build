// File: src/components/tables/SessionList.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { cn } from "~/lib/utils";
import { api } from "~/trpc/react";

// --- Components ---
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Checkbox } from "~/components/ui/checkbox";
import { Separator } from "~/components/ui/separator";
import { SessionCreationDialog } from "../forms/annualSession/SessionCreation";
import SessionDeletionDialog from "../forms/annualSession/SessionDeletion";

// --- Icons ---
import {
  CalendarDays,
  RefreshCcw,
  GraduationCap,
  ArrowRight,
  Search,
  BookOpen,
  CalendarClock,
  ClipboardList,
  FilterX,
} from "lucide-react";

// Helper to format dates cleanly
const formatDate = (dateString: Date | string) => {
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

export const SessionList = () => {
  const [selectedSessions, setSelectedSessions] = useState<Set<string>>(
    new Set(),
  );
  const [searchTerm, setSearchTerm] = useState("");

  const {
    data: sessionList = [],
    refetch,
    isRefetching,
  } = api.session.getSessions.useQuery();

  const filteredSessions = sessionList.filter((session) =>
    session.sessionName.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const toggleSessionSelection = (sessionId: string) => {
    setSelectedSessions((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(sessionId)) newSet.delete(sessionId);
      else newSet.add(sessionId);
      return newSet;
    });
  };

  const toggleAllSessions = () => {
    setSelectedSessions(
      selectedSessions.size === filteredSessions.length
        ? new Set()
        : new Set(filteredSessions.map((s) => s.sessionId)),
    );
  };

  return (
    // Wrapper
    <div className="w-full space-y-6">
      {/* === Header & Controls === */}
      <div className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white/50 p-4 shadow-sm backdrop-blur-md transition-colors dark:border-border dark:bg-card md:flex-row md:items-center md:justify-between">
        <div className="group relative w-full md:max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-emerald-500" />
          <Input
            placeholder="Search sessions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="h-10 rounded-lg border-slate-200 bg-slate-50 pl-10 text-slate-900 transition-all placeholder:text-muted-foreground focus:border-emerald-500/50 focus:ring-emerald-500/50 dark:border-border dark:bg-card dark:text-foreground dark:placeholder:text-muted-foreground"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 self-end md:self-auto">
          <Button
            variant="outline"
            size="icon"
            onClick={() => refetch()}
            disabled={isRefetching}
            className={cn(
              "h-10 w-10 shrink-0 rounded-lg border-slate-200 bg-white text-muted-foreground transition-colors hover:bg-emerald-50 hover:text-emerald-600 dark:border-border dark:bg-card dark:text-foreground dark:hover:bg-emerald-500/10 dark:hover:text-emerald-400",
              isRefetching &&
                "animate-spin text-emerald-600 dark:text-emerald-500",
            )}
          >
            <RefreshCcw className="h-4 w-4" />
          </Button>

          {/* Batch Actions */}
          {selectedSessions.size > 0 && (
            <SessionDeletionDialog
              sessionIds={Array.from(selectedSessions)}
              onSuccess={() => setSelectedSessions(new Set())}
            />
          )}

          <SessionCreationDialog />
        </div>
      </div>

      {/* === Selection Bar (Conditional) === */}
      {filteredSessions.length > 0 && selectedSessions.size > 0 && (
        <div className="flex items-center justify-between rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2 backdrop-blur-sm animate-in fade-in slide-in-from-top-1 dark:border-emerald-500/20 dark:bg-emerald-500/5">
          <div className="flex items-center gap-3">
            <Checkbox
              id="select-all"
              checked={selectedSessions.size === filteredSessions.length}
              onCheckedChange={toggleAllSessions}
              className="border-emerald-500 data-[state=checked]:bg-emerald-600 data-[state=checked]:text-foreground"
            />
            <label
              htmlFor="select-all"
              className="cursor-pointer select-none text-sm font-medium text-emerald-900 dark:text-emerald-100"
            >
              Select All
            </label>
          </div>
          <div className="font-mono text-sm text-emerald-700 dark:text-emerald-300">
            <span className="font-bold">{selectedSessions.size}</span> selected
          </div>
        </div>
      )}

      {/* === Grid Layout === */}
      <div className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filteredSessions.map((session) => {
          const isSelected = selectedSessions.has(session.sessionId);

          return (
            <Card
              key={session.sessionId}
              className={cn(
                "group relative flex flex-col overflow-hidden rounded-xl transition-all duration-300",
                // Light Mode
                "border-slate-200 bg-white shadow-sm hover:-translate-y-1 hover:border-emerald-300 hover:shadow-lg",
                // Dark Mode
                "dark:border-border dark:bg-card dark:backdrop-blur-sm dark:hover:border-emerald-500/30 dark:hover:shadow-emerald-900/10",
                // Selected State
                isSelected &&
                  "border-emerald-200 bg-emerald-50 ring-1 ring-emerald-500 dark:border-emerald-500/30 dark:bg-emerald-900/10",
              )}
            >
              {/* Active Selection Indicator */}
              {isSelected && (
                <div className="pointer-events-none absolute right-0 top-0 z-20 h-0 w-0 border-l-[40px] border-t-[40px] border-l-transparent border-t-emerald-600" />
              )}

              {/* Decorative Top Gradient */}
              <div className="absolute left-0 top-0 h-1 w-full bg-gradient-to-r from-emerald-500 to-teal-500 opacity-0 transition-opacity group-hover:opacity-100" />

              <CardHeader className="relative pb-3 pt-5">
                <div className="absolute right-4 top-4 z-10">
                  <Checkbox
                    checked={isSelected}
                    onCheckedChange={() =>
                      toggleSessionSelection(session.sessionId)
                    }
                    className="h-5 w-5 rounded-md border-slate-300 data-[state=checked]:bg-emerald-600 data-[state=checked]:text-foreground dark:border-border"
                  />
                </div>

                <div className="flex items-start justify-between pr-8">
                  <div className="space-y-2">
                    <Badge
                      variant="secondary"
                      className="mb-1 border border-emerald-200 bg-emerald-100 px-2 py-0.5 text-[10px] uppercase tracking-wide text-emerald-700 hover:bg-emerald-200 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-400"
                    >
                      Active
                    </Badge>
                    <h3 className="line-clamp-1 text-lg font-bold tracking-tight text-slate-900 transition-colors group-hover:text-emerald-700 dark:text-foreground dark:group-hover:text-emerald-300">
                      {session.sessionName}
                    </h3>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="flex-1 pb-4">
                <div className="space-y-3 rounded-lg border border-slate-100 bg-slate-50 p-3 dark:border-border dark:bg-black/20">
                  <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-500/70">
                    <CalendarClock className="h-3 w-3" />
                    Duration
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-semibold text-muted-foreground">
                        FROM
                      </span>
                      <span className="font-mono text-slate-700 dark:text-foreground">
                        {formatDate(session.sessionFrom)}
                      </span>
                    </div>
                    <ArrowRight className="h-3 w-3 text-emerald-400/50" />
                    <div className="flex flex-col text-right">
                      <span className="text-[10px] font-semibold text-muted-foreground">
                        TO
                      </span>
                      <span className="font-mono text-slate-700 dark:text-foreground">
                        {formatDate(session.sessionTo)}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>

              <Separator className="bg-slate-100 dark:bg-white/5" />

              <CardFooter className="grid grid-cols-3 gap-2 bg-slate-50/50 p-3 dark:bg-card">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-full text-xs text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-foreground dark:hover:bg-white/5 dark:hover:text-foreground"
                  asChild
                >
                  <Link
                    href={`/admin/sessions/timetable?sessionId=${session.sessionId}`}
                  >
                    <CalendarDays className="mr-2 h-3.5 w-3.5" />
                    TimeTable
                  </Link>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-full text-xs text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-foreground dark:hover:bg-white/5 dark:hover:text-foreground"
                  asChild
                >
                  <Link href="/admin/exams">
                    <ClipboardList className="mr-2 h-3.5 w-3.5" />
                    Exams
                  </Link>
                </Button>
                <Button
                  size="sm"
                  className="h-8 w-full border-0 bg-emerald-600 text-xs font-semibold text-foreground shadow-md shadow-emerald-200 transition-all hover:bg-emerald-700 dark:shadow-emerald-900/20"
                  asChild
                >
                  <Link href={`/admin/sessions/${session.sessionId}`}>
                    <BookOpen className="mr-2 h-3.5 w-3.5" />
                    Details
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          );
        })}
      </div>

      {/* === Empty State === */}
      {filteredSessions.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 py-16 text-center animate-in fade-in-50 dark:border-border dark:bg-card">
          <div className="mb-4 rounded-full border border-slate-200 bg-white p-4 shadow-sm dark:border-border dark:bg-muted">
            {searchTerm ? (
              <FilterX className="h-8 w-8 text-muted-foreground" />
            ) : (
              <GraduationCap className="h-8 w-8 text-emerald-500/50" />
            )}
          </div>
          <h3 className="mb-1 text-xl font-bold text-slate-900 dark:text-foreground">
            {searchTerm ? "No matching sessions" : "No sessions found"}
          </h3>
          <p className="mb-6 max-w-xs text-sm text-muted-foreground dark:text-muted-foreground">
            {searchTerm
              ? "We couldn't find any session matching your search. Try clearing filters."
              : "Get started by creating your first academic session."}
          </p>
          {!searchTerm && <SessionCreationDialog />}
        </div>
      )}
    </div>
  );
};
