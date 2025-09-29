"use client";

import { useState } from "react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Card } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Checkbox } from "~/components/ui/checkbox";
import {
  CalendarDays,
  RefreshCcw,
  GraduationCap,
  Clock,
  BookOpen,
} from "lucide-react";
import { api } from "~/trpc/react";
import Link from "next/link";
import { SessionCreationDialog } from "../forms/annualSession/SessionCreation";
import SessionDeletionDialog from "../forms/annualSession/SessionDeletion";

export const SessionList = () => {
  const [selectedSessions, setSelectedSessions] = useState<Set<string>>(
    new Set(),
  );
  const [searchTerm, setSearchTerm] = useState("");

  const { data: sessionList = [], refetch } =
    api.session.getSessions.useQuery();

  const filteredSessions = sessionList.filter((session) =>
    session.sessionName.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const toggleSessionSelection = (sessionId: string) => {
    setSelectedSessions((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(sessionId)) {
        newSet.delete(sessionId);
      } else {
        newSet.add(sessionId);
      }
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
    <div className="space-y-8 rounded-3xl border border-white/50 bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/40 p-8 shadow-2xl backdrop-blur-sm">
      <div className="flex w-full items-center gap-4 lg:flex-1">
        <Input
          placeholder="Search sessions..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="rounded-2xl border-2 border-slate-200/60 bg-white/80 py-3 pl-12 pr-4 text-slate-700 shadow-sm backdrop-blur-sm transition-all duration-300 placeholder:text-slate-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-500/50"
        />
        <Button
          variant="outline"
          size="icon"
          onClick={() => refetch()}
          className="group h-12 w-12 rounded-2xl border-2 border-slate-200/60 bg-white/80 shadow-sm backdrop-blur-sm transition-all duration-300 hover:border-blue-400 hover:bg-blue-50 hover:shadow-lg"
        >
          <RefreshCcw className="h-5 w-5 text-blue-600 transition-transform duration-500 group-hover:rotate-180" />
        </Button>

        <div className="flex items-center gap-3">
          <SessionCreationDialog />
          <SessionDeletionDialog
            sessionIds={Array.from(selectedSessions)}
            onSuccess={() => setSelectedSessions(new Set())}
          />
        </div>
      </div>

      {/* Enhanced Selection Controls */}
      <div className="flex items-center justify-between rounded-2xl border border-slate-200/50 bg-gradient-to-r from-white/90 to-slate-50/90 p-6 shadow-lg backdrop-blur-sm">
        <Button
          variant="outline"
          size="sm"
          onClick={toggleAllSessions}
          className="rounded-xl border-2 border-slate-200 px-4 py-2 text-sm font-medium transition-all duration-300 hover:border-blue-400 hover:bg-slate-50"
        >
          {selectedSessions.size === filteredSessions.length
            ? "Deselect All"
            : "Select All"}
        </Button>
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium text-slate-600">
            {selectedSessions.size} of {filteredSessions.length} selected
          </span>
          <Badge className="rounded-full border-blue-200/50 bg-gradient-to-r from-blue-100 to-purple-100 px-3 py-1 font-medium text-blue-700 shadow-sm">
            {filteredSessions.length} Sessions
          </Badge>
        </div>
      </div>

      {/* Enhanced Sessions Grid */}
      <div className="grid gap-8 sm:grid-cols-2 xl:grid-cols-3">
        {filteredSessions.map((session) => (
          <Card
            key={session.sessionId}
            className="group relative transform overflow-hidden rounded-3xl border border-slate-200/50 bg-gradient-to-br from-white/95 to-slate-50/90 shadow-xl backdrop-blur-sm transition-all duration-500 hover:-translate-y-2 hover:border-blue-300/50 hover:shadow-2xl"
          >
            {/* Enhanced Checkbox */}
            <div className="absolute right-4 top-4 z-10">
              <div className="rounded-2xl border border-slate-200/50 bg-white/95 p-3 shadow-lg backdrop-blur-sm">
                <Checkbox
                  checked={selectedSessions.has(session.sessionId)}
                  onCheckedChange={() =>
                    toggleSessionSelection(session.sessionId)
                  }
                  className="h-5 w-5 rounded-lg border-2 border-slate-300 transition-all duration-300 data-[state=checked]:border-blue-500 data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-blue-500 data-[state=checked]:to-purple-600"
                />
              </div>
            </div>

            <div className="p-8">
              {/* Enhanced Header Section */}
              <div className="mb-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="rounded-2xl bg-gradient-to-r from-blue-100 to-purple-100 p-3 shadow-sm">
                      <GraduationCap className="h-6 w-6 text-blue-600" />
                    </div>
                    <Badge className="rounded-full border-emerald-200/50 bg-gradient-to-r from-emerald-100 to-green-100 px-3 py-1 font-medium text-emerald-700 shadow-sm">
                      Active
                    </Badge>
                  </div>
                </div>
                <h3 className="text-xl font-bold leading-tight text-slate-800 transition-colors duration-300 group-hover:text-blue-600">
                  {session.sessionName}
                </h3>
              </div>

              {/* Enhanced Date Information */}
              <div className="mb-6 space-y-3">
                <div className="flex items-center gap-3 rounded-2xl border border-blue-100/50 bg-gradient-to-r from-blue-50/80 to-cyan-50/80 p-4">
                  <Clock className="h-4 w-4 flex-shrink-0 text-blue-500" />
                  <div className="text-sm">
                    <span className="font-semibold text-slate-700">Start:</span>{" "}
                    <span className="text-slate-600">
                      {new Date(session.sessionFrom).toLocaleDateString(
                        "en-US",
                        {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        },
                      )}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3 rounded-2xl border border-purple-100/50 bg-gradient-to-r from-purple-50/80 to-pink-50/80 p-4">
                  <CalendarDays className="h-4 w-4 flex-shrink-0 text-purple-500" />
                  <div className="text-sm">
                    <span className="font-semibold text-slate-700">End:</span>{" "}
                    <span className="text-slate-600">
                      {new Date(session.sessionTo).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between gap-4">
                <Button className="" asChild>
                  <Link
                    href={`/admin/sessions/${session.sessionId}`}
                    className="flex w-full items-center justify-center gap-2"
                  >
                    <BookOpen className="h-4 w-4 transition-transform duration-300 group-hover:scale-110" />
                    View session details
                  </Link>
                </Button>
                <Button variant="secondary" asChild>
                  <Link
                    href={`/admin/sessions/timetable?sessionId=${session.sessionId}`}
                    className="flex w-full items-center justify-center gap-2"
                  >
                    <BookOpen className="h-4 w-4 transition-transform duration-300 group-hover:scale-110" />
                    View timetable
                  </Link>
                </Button>
              </div>
              {/* Enhanced Action Button */}
            </div>

            {/* Subtle Hover Overlay */}
            <div className="pointer-events-none absolute inset-0 rounded-3xl bg-gradient-to-r from-blue-500/5 to-purple-500/5 opacity-0 transition-opacity duration-500 group-hover:opacity-100"></div>
          </Card>
        ))}
      </div>

      {/* Enhanced Attendance Buttons
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filteredSessions.map((session) => (
          <Button 
            key={session.sessionId} 
            className="w-full bg-gradient-to-r from-teal-500 via-emerald-600 to-green-600 hover:from-teal-600 hover:via-emerald-700 hover:to-green-700 text-white shadow-xl hover:shadow-2xl transition-all duration-300 rounded-2xl py-4 group border-0"
          >
            <Link href={`/admin/attendance`} className="flex items-center justify-center gap-3 w-full">
              <Users className="h-5 w-5 group-hover:scale-110 transition-transform duration-300" />
              View Attendance Details
              <div className="w-2 h-2 bg-white/60 rounded-full group-hover:bg-white group-hover:scale-125 transition-all duration-300"></div>
            </Link>
          </Button>
        ))}
      </div> */}

      {/* Enhanced No Sessions Found */}
      {filteredSessions.length === 0 && (
        <div className="py-20 text-center">
          <div className="mb-8">
            <div className="mx-auto flex h-32 w-32 items-center justify-center rounded-full border border-slate-200/50 bg-gradient-to-br from-slate-100 via-blue-50 to-purple-50 shadow-2xl">
              <CalendarDays className="h-16 w-16 text-slate-400" />
            </div>
          </div>
          <h3 className="mb-4 text-3xl font-bold text-slate-800">
            No sessions found
          </h3>
          <p className="mx-auto mb-10 max-w-md text-lg leading-relaxed text-slate-600">
            {searchTerm
              ? "Try adjusting your search terms to find what you're looking for."
              : "Get started by creating your first academic session."}
          </p>
          {!searchTerm && <SessionCreationDialog />}
        </div>
      )}
    </div>
  );
};
