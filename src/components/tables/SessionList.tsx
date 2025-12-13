"use client";

import { useState } from "react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Card, CardContent, CardFooter, CardHeader } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Checkbox } from "~/components/ui/checkbox";
import { Separator } from "~/components/ui/separator";
import {
  CalendarDays,
  RefreshCcw,
  GraduationCap,
  ArrowRight,
  Search,
  BookOpen,
  CalendarClock,
  CheckCircle2,
} from "lucide-react";
import { api } from "~/trpc/react";
import Link from "next/link";
import { SessionCreationDialog } from "../forms/annualSession/SessionCreation";
import SessionDeletionDialog from "../forms/annualSession/SessionDeletion";
import { cn } from "~/lib/utils";

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
    <div className="mx-auto w-full space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col gap-4 rounded-xl border bg-card p-4 shadow-sm md:flex-row md:items-center md:justify-between">
        <div className="relative w-full md:max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search sessions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 bg-background/50"
          />
        </div>

        <div className="flex items-center gap-2 self-end md:self-auto">
          <Button
            variant="outline"
            size="icon"
            onClick={() => refetch()}
            disabled={isRefetching}
            className={cn("shrink-0", isRefetching && "animate-spin")}
          >
            <RefreshCcw className="h-4 w-4" />
          </Button>
          <SessionDeletionDialog
            sessionIds={Array.from(selectedSessions)}
            onSuccess={() => setSelectedSessions(new Set())}
          />
          <SessionCreationDialog />
        </div>
      </div>

      {/* Selection Bar - Only visible when items exist */}
      {filteredSessions.length > 0 && (
        <div className="flex items-center justify-between rounded-lg border bg-muted/40 px-4 py-3">
          <div className="flex items-center gap-3">
            <Checkbox
              id="select-all"
              checked={
                filteredSessions.length > 0 &&
                selectedSessions.size === filteredSessions.length
              }
              onCheckedChange={toggleAllSessions}
            />
            <label
              htmlFor="select-all"
              className="text-sm font-medium text-muted-foreground cursor-pointer select-none"
            >
              Select All
            </label>
          </div>
          <div className="text-sm text-muted-foreground">
            <span className="font-semibold text-primary">{selectedSessions.size}</span> selected
          </div>
        </div>
      )}

      {/* Grid Layout */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filteredSessions.map((session) => {
          const isSelected = selectedSessions.has(session.sessionId);
          
          return (
            <Card
              key={session.sessionId}
              className={cn(
                "group relative flex flex-col overflow-hidden transition-all hover:shadow-lg hover:-translate-y-1",
                isSelected && "ring-2 ring-primary ring-offset-2"
              )}
            >
              <CardHeader className="pb-3 pt-5 relative">
                <div className="absolute right-4 top-4 z-10">
                  <Checkbox
                    checked={isSelected}
                    onCheckedChange={() => toggleSessionSelection(session.sessionId)}
                  />
                </div>
                
                <div className="flex items-start justify-between pr-8">
                  <div className="space-y-1">
                    <Badge 
                      variant="secondary" 
                      className="mb-2 bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-100"
                    >
                      Active Session
                    </Badge>
                    <h3 className="line-clamp-1 text-xl font-bold tracking-tight">
                      {session.sessionName}
                    </h3>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="flex-1 pb-4">
                <div className="rounded-lg bg-muted/50 p-3 space-y-3">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CalendarClock className="h-4 w-4 text-primary" />
                    <span className="font-medium">Academic Duration</span>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex flex-col">
                      <span className="text-[10px] uppercase text-muted-foreground font-bold">Starts</span>
                      <span className="font-medium text-foreground">{formatDate(session.sessionFrom)}</span>
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground/50" />
                    <div className="flex flex-col text-right">
                      <span className="text-[10px] uppercase text-muted-foreground font-bold">Ends</span>
                      <span className="font-medium text-foreground">{formatDate(session.sessionTo)}</span>
                    </div>
                  </div>
                </div>
              </CardContent>

              <Separator />

              <CardFooter className="grid grid-cols-2 gap-3 bg-muted/20 p-4">
                <Button variant="outline" size="sm" className="w-full" asChild>
                  <Link href={`/admin/sessions/timetable?sessionId=${session.sessionId}`}>
                    <CalendarDays className="mr-2 h-3.5 w-3.5" />
                    Timetable
                  </Link>
                </Button>
                <Button size="sm" className="w-full bg-blue-600 hover:bg-blue-700" asChild>
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

      {/* Empty State */}
      {filteredSessions.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed py-16 text-center animate-in fade-in-50">
          <div className="mb-4 rounded-full bg-muted p-4">
            <GraduationCap className="h-10 w-10 text-muted-foreground/50" />
          </div>
          <h3 className="text-xl font-semibold">No sessions found</h3>
          <p className="mt-2 text-sm text-muted-foreground max-w-sm">
            {searchTerm
              ? "No results for your search. Try clearing filters."
              : "Get started by creating your first academic session."}
          </p>
          {!searchTerm && (
            <div className="mt-6">
              <SessionCreationDialog />
            </div>
          )}
        </div>
      )}
    </div>
  );
};
