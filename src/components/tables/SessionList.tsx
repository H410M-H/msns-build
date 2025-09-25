"use client";

import { useState } from "react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Card } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Checkbox } from "~/components/ui/checkbox";
import { CalendarDays, Search, RefreshCcw, GraduationCap, Clock, BookOpen, Users } from "lucide-react";
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
<div className="space-y-8 bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/40 p-8 rounded-3xl shadow-2xl border border-white/50 backdrop-blur-sm">
      
      {/* Enhanced Header Controls */}
      <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4 w-full lg:flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
            <Input
              placeholder="Search sessions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 pr-4 py-3 border-2 border-slate-200/60 rounded-2xl shadow-sm focus:ring-2 focus:ring-blue-500/50 focus:border-blue-400 transition-all duration-300 bg-white/80 backdrop-blur-sm text-slate-700 placeholder:text-slate-400"
            />
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={() => refetch()}
            className="h-12 w-12 rounded-2xl border-2 border-slate-200/60 hover:border-blue-400 hover:bg-blue-50 transition-all duration-300 shadow-sm hover:shadow-lg bg-white/80 backdrop-blur-sm group"
          >
            <RefreshCcw className="h-5 w-5 text-blue-600 group-hover:rotate-180 transition-transform duration-500" />
          </Button>
        </div>
        
        <div className="flex items-center gap-3">
          <SessionCreationDialog />
          <SessionDeletionDialog
            sessionIds={Array.from(selectedSessions)}
            onSuccess={() => setSelectedSessions(new Set())}
          />
        </div>
      </div>

      {/* Enhanced Selection Controls */}
      <div className="flex items-center justify-between bg-gradient-to-r from-white/90 to-slate-50/90 p-6 rounded-2xl shadow-lg border border-slate-200/50 backdrop-blur-sm">
        <Button
          variant="outline"
          size="sm"
          onClick={toggleAllSessions}
          className="text-sm hover:bg-slate-50 transition-all duration-300 border-2 border-slate-200 hover:border-blue-400 rounded-xl px-4 py-2 font-medium"
        >
          {selectedSessions.size === filteredSessions.length ? "Deselect All" : "Select All"}
        </Button>
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium text-slate-600">
            {selectedSessions.size} of {filteredSessions.length} selected
          </span>
          <Badge className="bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700 border-blue-200/50 px-3 py-1 rounded-full font-medium shadow-sm">
            {filteredSessions.length} Sessions
          </Badge>
        </div>
      </div>

      {/* Enhanced Sessions Grid */}
      <div className="grid gap-8 sm:grid-cols-2 xl:grid-cols-3">
        {filteredSessions.map((session) => (
          <Card
            key={session.sessionId}
            className="group relative overflow-hidden bg-gradient-to-br from-white/95 to-slate-50/90 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 border border-slate-200/50 hover:border-blue-300/50 transform hover:-translate-y-2 backdrop-blur-sm"
          >
            {/* Enhanced Checkbox */}
            <div className="absolute right-4 top-4 z-10">
              <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-3 shadow-lg border border-slate-200/50">
                <Checkbox
                  checked={selectedSessions.has(session.sessionId)}
                  onCheckedChange={() => toggleSessionSelection(session.sessionId)}
                  className="w-5 h-5 rounded-lg border-2 border-slate-300 data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-blue-500 data-[state=checked]:to-purple-600 data-[state=checked]:border-blue-500 transition-all duration-300"
                />
              </div>
            </div>

            <div className="p-8">
              {/* Enhanced Header Section */}
              <div className="mb-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-gradient-to-r from-blue-100 to-purple-100 rounded-2xl shadow-sm">
                      <GraduationCap className="h-6 w-6 text-blue-600" />
                    </div>
                    <Badge className="bg-gradient-to-r from-emerald-100 to-green-100 text-emerald-700 border-emerald-200/50 px-3 py-1 rounded-full font-medium shadow-sm">
                      Active
                    </Badge>
                  </div>
                </div>
                <h3 className="text-xl font-bold text-slate-800 group-hover:text-blue-600 transition-colors duration-300 leading-tight">
                  {session.sessionName}
                </h3>
              </div>

              {/* Enhanced Date Information */}
              <div className="mb-6 space-y-3">
                <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-blue-50/80 to-cyan-50/80 rounded-2xl border border-blue-100/50">
                  <Clock className="h-4 w-4 text-blue-500 flex-shrink-0" />
                  <div className="text-sm">
                    <span className="font-semibold text-slate-700">Start:</span>{" "}
                    <span className="text-slate-600">
                      {new Date(session.sessionFrom).toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'short', 
                        day: 'numeric' 
                      })}
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-purple-50/80 to-pink-50/80 rounded-2xl border border-purple-100/50">
                  <CalendarDays className="h-4 w-4 text-purple-500 flex-shrink-0" />
                  <div className="text-sm">
                    <span className="font-semibold text-slate-700">End:</span>{" "}
                    <span className="text-slate-600">
                      {new Date(session.sessionTo).toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'short', 
                        day: 'numeric' 
                      })}
                    </span>
                  </div>
                </div>
              </div>

              {/* Enhanced Action Button */}
              <Button className="w-full bg-gradient-to-r from-blue-500 via-purple-600 to-indigo-600 hover:from-blue-600 hover:via-purple-700 hover:to-indigo-700 text-white shadow-xl hover:shadow-2xl transition-all duration-300 rounded-2xl py-4 group border-0">
                <Link href={`/admin/sessions/${session.sessionId}`} className="flex items-center justify-center gap-2 w-full">
                  <BookOpen className="h-4 w-4 group-hover:scale-110 transition-transform duration-300" />
                  View Session Details
                </Link>
              </Button>
            </div>

            {/* Subtle Hover Overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl pointer-events-none"></div>
          </Card>
        ))}
      </div>
      
      {/* Enhanced Attendance Buttons */}
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
      </div>

      {/* Enhanced No Sessions Found */}
      {filteredSessions.length === 0 && (
        <div className="py-20 text-center">
          <div className="mb-8">
            <div className="mx-auto w-32 h-32 bg-gradient-to-br from-slate-100 via-blue-50 to-purple-50 rounded-full flex items-center justify-center shadow-2xl border border-slate-200/50">
              <CalendarDays className="h-16 w-16 text-slate-400" />
            </div>
          </div>
          <h3 className="text-3xl font-bold text-slate-800 mb-4">No sessions found</h3>
          <p className="text-slate-600 text-lg max-w-md mx-auto mb-10 leading-relaxed">
            {searchTerm
              ? "Try adjusting your search terms to find what you're looking for."
              : "Get started by creating your first academic session."}
          </p>
          {!searchTerm && <SessionCreationDialog />}
        </div>
      )}
    </div>
  );
}