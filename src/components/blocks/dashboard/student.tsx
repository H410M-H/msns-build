"use client";

import React, { useState } from "react";
import { BookOpen, Calendar, Clock, Sparkles, FileText, CheckCircle2, ChevronRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { Skeleton } from "~/components/ui/skeleton";
import { api } from "~/trpc/react";
import Link from "next/link";
import { cn } from "~/lib/utils";

const SUBJECT_ACCENTS = [
  { bg: "from-blue-500/10 to-indigo-500/10", border: "border-blue-200 dark:border-blue-900/40", icon: "text-blue-600 dark:text-blue-400" },
  { bg: "from-emerald-500/10 to-teal-500/10", border: "border-emerald-200 dark:border-emerald-900/40", icon: "text-emerald-600 dark:text-emerald-400" },
  { bg: "from-purple-500/10 to-pink-500/10", border: "border-purple-200 dark:border-purple-900/40", icon: "text-purple-600 dark:text-purple-400" },
  { bg: "from-amber-500/10 to-orange-500/10", border: "border-amber-200 dark:border-amber-900/40", icon: "text-amber-600 dark:text-amber-400" },
  { bg: "from-rose-500/10 to-red-500/10", border: "border-rose-200 dark:border-rose-900/40", icon: "text-rose-600 dark:text-rose-400" },
  { bg: "from-cyan-500/10 to-sky-500/10", border: "border-cyan-200 dark:border-cyan-900/40", icon: "text-cyan-600 dark:text-cyan-400" },
];

export const StudentSection = () => {
  const { data: subjects, isLoading } = api.subject.getAllSubjects.useQuery();

  return (
    <section className="mb-12">
      {/* Section Header */}
      <div className="mb-8 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="rotate-1 transform rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 p-3 shadow-xl transition-transform duration-300 hover:rotate-0">
              <BookOpen className="h-6 w-6 text-white" />
            </div>
          </div>

          <div className="space-y-0.5">
            <h2 className="text-2xl font-bold tracking-tight text-foreground">
              Your Enrolled Courses
            </h2>
            <p className="text-xs text-muted-foreground">
              Access your subjects, daily homework diaries, and weekly timetables
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border-emerald-200 text-xs font-semibold px-2.5 py-1">
            Active Term: 2026
          </Badge>
        </div>
      </div>

      {/* Courses Cards Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="rounded-3xl p-6">
              <Skeleton className="h-6 w-1/2 mb-3" />
              <Skeleton className="h-4 w-3/4 mb-4" />
              <Skeleton className="h-9 w-full" />
            </Card>
          ))}
        </div>
      ) : subjects && subjects.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {subjects.map((subject, idx) => {
            const accent = SUBJECT_ACCENTS[idx % SUBJECT_ACCENTS.length]!;

            return (
              <Card
                key={subject.subjectId}
                className={cn(
                  "group relative overflow-hidden rounded-3xl border bg-gradient-to-br p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg dark:bg-card",
                  accent.bg,
                  accent.border,
                )}
              >
                <div className="flex items-start justify-between">
                  <div className="rounded-2xl bg-white p-3 shadow-sm dark:bg-muted">
                    <BookOpen className={cn("h-6 w-6", accent.icon)} />
                  </div>
                  <Badge variant="secondary" className="rounded-lg text-[10px] font-semibold">
                    Core Course
                  </Badge>
                </div>

                <div className="mt-4">
                  <h3 className="text-lg font-bold text-foreground group-hover:text-emerald-600 transition-colors">
                    {subject.subjectName}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    Structured syllabus and daily class activities
                  </p>
                </div>

                <div className="mt-6 flex items-center justify-between border-t border-slate-200/60 pt-4 dark:border-border/40">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                    <span>Enrolled</span>
                  </div>

                  <Link href={`/attendance/timetable`}>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 gap-1 rounded-xl text-xs font-semibold hover:bg-white/80 dark:hover:bg-muted"
                    >
                      View Schedule
                      <ChevronRight className="h-3.5 w-3.5" />
                    </Button>
                  </Link>
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        <div className="rounded-3xl border border-dashed border-border bg-card/70 p-12 text-center shadow-sm backdrop-blur-sm">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600">
            <BookOpen className="h-8 w-8" />
          </div>
          <h3 className="mb-1 text-base font-bold text-foreground">
            No Enrolled Courses Found
          </h3>
          <p className="text-xs text-muted-foreground">
            Course allotments will appear here once your class registration is active.
          </p>
        </div>
      )}
    </section>
  );
};
