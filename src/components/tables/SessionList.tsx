// File: src/components/tables/SessionList.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { cn } from "~/lib/utils";
import { api } from "~/trpc/react";

// --- Components ---
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Card, CardContent, CardFooter, CardHeader } from "~/components/ui/card";
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
  FilterX
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
  const [selectedSessions, setSelectedSessions] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState("");

  const { data: sessionList = [], refetch, isRefetching } =
    api.session.getSessions.useQuery();

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
      <div className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white/50 p-4 shadow-xs backdrop-blur-md dark:border-white/5 dark:bg-slate-900/40 md:flex-row md:items-center md:justify-between transition-colors">
        <div className="relative w-full md:max-w-md group">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
          <Input
            placeholder="Search sessions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-500 focus:ring-emerald-500/50 focus:border-emerald-500/50 h-10 transition-all rounded-lg dark:bg-slate-950/50 dark:border-white/10 dark:text-white dark:placeholder:text-slate-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 self-end md:self-auto">
          <Button
            variant="outline"
            size="icon"
            onClick={() => refetch()}
            disabled={isRefetching}
            className={cn(
              "shrink-0 h-10 w-10 border-slate-200 bg-white text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors dark:border-white/10 dark:bg-slate-900/50 dark:text-slate-300 dark:hover:text-emerald-400 dark:hover:bg-emerald-500/10",
              isRefetching && "animate-spin text-emerald-600 dark:text-emerald-500"
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
        <div className="flex items-center justify-between rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2 backdrop-blur-xs animate-in fade-in slide-in-from-top-1 dark:border-emerald-500/20 dark:bg-emerald-500/5">
          <div className="flex items-center gap-3">
            <Checkbox
              id="select-all"
              checked={selectedSessions.size === filteredSessions.length}
              onCheckedChange={toggleAllSessions}
              className="border-emerald-500 data-[state=checked]:bg-emerald-600 data-[state=checked]:text-white"
            />
            <label
              htmlFor="select-all"
              className="text-sm font-medium text-emerald-900 cursor-pointer select-none dark:text-emerald-100"
            >
              Select All
            </label>
          </div>
          <div className="text-sm text-emerald-700 font-mono dark:text-emerald-300">
            <span className="font-bold">{selectedSessions.size}</span> selected
          </div>
        </div>
      )}

      {/* === Grid Layout === */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 p-4">
        {filteredSessions.map((session) => {
          const isSelected = selectedSessions.has(session.sessionId);
          
          return (
            <Card
              key={session.sessionId}
              className={cn(
                "group relative flex flex-col overflow-hidden transition-all duration-300 rounded-xl",
                // Light Mode
                "bg-white border-slate-200 shadow-xs hover:shadow-lg hover:-translate-y-1 hover:border-emerald-300",
                // Dark Mode
                "dark:bg-slate-900/40 dark:backdrop-blur-xs dark:border-white/5 dark:hover:border-emerald-500/30 dark:hover:shadow-emerald-900/10",
                // Selected State
                isSelected && "ring-1 ring-emerald-500 bg-emerald-50 border-emerald-200 dark:bg-emerald-900/10 dark:border-emerald-500/30"
              )}
            >
              {/* Active Selection Indicator */}
              {isSelected && <div className="absolute top-0 right-0 w-0 h-0 border-t-40 border-t-emerald-600 border-l-40 border-l-transparent z-20 pointer-events-none" />}

              {/* Decorative Top Gradient */}
              <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-emerald-500 to-teal-500 opacity-0 group-hover:opacity-100 transition-opacity" />

              <CardHeader className="pb-3 pt-5 relative">
                <div className="absolute right-4 top-4 z-10">
                  <Checkbox
                    checked={isSelected}
                    onCheckedChange={() => toggleSessionSelection(session.sessionId)}
                    className="border-slate-300 data-[state=checked]:bg-emerald-600 data-[state=checked]:text-white h-5 w-5 rounded-md dark:border-white/20"
                  />
                </div>
                
                <div className="flex items-start justify-between pr-8">
                  <div className="space-y-2">
                    <Badge 
                      variant="secondary" 
                      className="mb-1 bg-emerald-100 text-emerald-700 border border-emerald-200 hover:bg-emerald-200 px-2 py-0.5 text-[10px] uppercase tracking-wide dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20"
                    >
                      Active
                    </Badge>
                    <h3 className="line-clamp-1 text-lg font-bold tracking-tight text-slate-900 group-hover:text-emerald-700 transition-colors dark:text-white dark:group-hover:text-emerald-300">
                      {session.sessionName}
                    </h3>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="flex-1 pb-4">
                <div className="rounded-lg bg-slate-50 border border-slate-100 p-3 space-y-3 dark:bg-black/20 dark:border-white/5">
                  <div className="flex items-center gap-2 text-[10px] font-bold text-emerald-600 uppercase tracking-wider dark:text-emerald-500/70">
                    <CalendarClock className="h-3 w-3" />
                    Duration
                  </div>
                  
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex flex-col">
                      <span className="text-[10px] text-slate-500 font-semibold">FROM</span>
                      <span className="font-mono text-slate-700 dark:text-slate-200">{formatDate(session.sessionFrom)}</span>
                    </div>
                    <ArrowRight className="h-3 w-3 text-emerald-400/50" />
                    <div className="flex flex-col text-right">
                      <span className="text-[10px] text-slate-500 font-semibold">TO</span>
                      <span className="font-mono text-slate-700 dark:text-slate-200">{formatDate(session.sessionTo)}</span>
                    </div>
                  </div>
                </div>
              </CardContent>

              <Separator className="bg-slate-100 dark:bg-white/5" />

              <CardFooter className="grid grid-cols-2 gap-2 bg-slate-50/50 p-3 dark:bg-slate-950/20">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="w-full text-slate-600 hover:text-slate-900 hover:bg-slate-100 h-8 text-xs dark:text-slate-200 dark:hover:text-white dark:hover:bg-white/5" 
                  asChild
                >
                  <Link href={`/admin/sessions/timetable?sessionId=${session.sessionId}`}>
                    <CalendarDays className="mr-2 h-3.5 w-3.5" />
                    TimeTable
                  </Link>
                </Button>
                <Button 
                  size="sm" 
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white border-0 h-8 text-xs font-semibold shadow-md shadow-emerald-200 dark:shadow-emerald-900/20 transition-all" 
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
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 py-16 text-center animate-in fade-in-50 dark:border-white/10 dark:bg-slate-900/20">
          <div className="mb-4 rounded-full bg-white p-4 border border-slate-200 shadow-xs dark:bg-slate-800/50 dark:border-white/5">
            {searchTerm ? <FilterX className="h-8 w-8 text-slate-400" /> : <GraduationCap className="h-8 w-8 text-emerald-500/50" />}
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-1 dark:text-white">
             {searchTerm ? "No matching sessions" : "No sessions found"}
          </h3>
          <p className="text-slate-500 text-sm max-w-xs mb-6 dark:text-slate-400">
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