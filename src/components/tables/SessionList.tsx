"use client";

import { useState } from "react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Card } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Checkbox } from "~/components/ui/checkbox";
import { CalendarDays, Search, RefreshCcw } from "lucide-react";
import { api } from "~/trpc/react";
import Link from "next/link";
import { SessionCreationDialog } from "../forms/annualSession/SessionCreation";
import SessionDeletionDialog from "../forms/annualSession/SessionDeletion";

export const SessionList = () => {
  const [selectedSessions, setSelectedSessions] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState("");

  const { data: sessionList = [], refetch } = api.session.getSessions.useQuery();

  const filteredSessions = sessionList.filter((session) =>
    session.sessionName.toLowerCase().includes(searchTerm.toLowerCase())
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
        : new Set(filteredSessions.map((s) => s.sessionId))
    );
  };

  return (
    <div className="space-y-6 bg-gradient-to-b from-gray-50 to-gray-100 p-6 rounded-lg shadow-lg">
      {/* Header Controls */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center">
          <div className="relative max-w-sm flex-1">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Search sessions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 shadow-sm focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={() => refetch()}
            className="shrink-0 hover:bg-blue-100"
          >
            <RefreshCcw className="h-5 w-5 text-blue-600" />
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <SessionCreationDialog />
          <SessionDeletionDialog
            sessionIds={Array.from(selectedSessions)}
            onSuccess={() => setSelectedSessions(new Set())}
          />
        </div>
      </div>

      {/* Selection Controls */}
      <div className="flex items-center justify-between bg-white p-4 rounded-lg shadow-sm">
        <Button
          variant="outline"
          size="sm"
          onClick={toggleAllSessions}
          className="text-sm hover:bg-gray-100"
        >
          {selectedSessions.size === filteredSessions.length ? "Deselect All" : "Select All"}
        </Button>
        <span className="text-sm text-gray-600">
          {selectedSessions.size} of {filteredSessions.length} selected
        </span>
      </div>

      {/* Sessions Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filteredSessions.map((session) => (
          <Card
            key={session.sessionId}
            className="relative overflow-hidden bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300"
          >
            <div className="absolute right-3 top-3">
              <Checkbox
                checked={selectedSessions.has(session.sessionId)}
                onCheckedChange={() => toggleSessionSelection(session.sessionId)}
                className="ring-2 ring-blue-500"
              />
            </div>

            <div className="p-6">
              <div className="mb-4 flex items-center gap-2">
                <CalendarDays className="h-6 w-6 text-blue-600" />
                <h3 className="text-lg font-semibold text-gray-800">{session.sessionName}</h3>
                <Badge className="bg-green-100 text-green-600">Active</Badge>
              </div>

              <div className="mb-4 space-y-2 text-sm text-gray-600">
                <div>
                  <span className="font-medium">Start:</span>{" "}
                  {new Date(session.sessionFrom).toLocaleDateString()}
                </div>
                <div>
                  <span className="font-medium">End:</span>{" "}
                  {new Date(session.sessionTo).toLocaleDateString()}
                </div>
              </div>

              <Button asChild variant="outline" className="w-full">
                <Link href={`/admin/sessions/${session.sessionId}`}>
                  View Session Details
                </Link>
              </Button>
            </div>
          </Card>
        ))}
      </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredSessions.map((session) => (
            <Button asChild variant="outline" className="w-full" key={session.sessionId}>
              <Link href={`/admin/attendance`}>
                View Attendance Details
              </Link>
            </Button>
          ))}
        </div>
      {/* No Sessions Found */}
      {filteredSessions.length === 0 && (
        <div className="py-12 text-center">
          <CalendarDays className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-4 text-lg font-semibold text-gray-800">No sessions found</h3>
          <p className="text-gray-600">
            {searchTerm
              ? "Try adjusting your search."
              : "Get started by creating a new session."}
          </p>
        </div>
      )}
    </div>
  );
};
