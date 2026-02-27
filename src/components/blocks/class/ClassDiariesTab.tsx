"use client";

import { useState } from "react";
import { BookOpen, CalendarIcon, Loader2, User } from "lucide-react";
import { format } from "date-fns";
import { api } from "~/trpc/react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";

type Diary = {
  subjectDiaryId: string;
  ClassSubject: {
    Subject: {
      subjectName: string;
    };
  };
  date: string | Date;
  Teacher: {
    employeeName: string;
  };
  content: string;
};

export function ClassDiariesTab({
  classId,
  sessionId,
}: {
  classId: string;
  sessionId: string;
}) {
  const [date, setDate] = useState<string>("");

  const { data: diaries, isLoading } =
    api.subjectDiary.getClassDiaries.useQuery({
      classId,
      sessionId,
      ...(date ? { date: new Date(date) } : {}),
    });

  return (
    <Card className="rounded-2xl border-border bg-card shadow-2xl duration-500 animate-in fade-in md:mt-4">
      <CardHeader className="border-b border-border pb-4 md:px-8">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <CardTitle className="flex items-center gap-2 text-xl text-indigo-400">
              <BookOpen className="h-5 w-5" />
              Subject Diaries
            </CardTitle>
            <CardDescription className="mt-1 text-muted-foreground">
              Daily updates and homework assigned by teachers.
            </CardDescription>
          </div>
          <div className="flex items-center gap-2 rounded-lg border border-border bg-card p-1.5 text-sm">
            <CalendarIcon className="ml-1 h-4 w-4 text-muted-foreground" />
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="mr-2 border-none bg-transparent text-foreground outline-none"
            />
            {date && (
              <button
                onClick={() => setDate("")}
                className="px-2 text-xs text-muted-foreground hover:text-foreground"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-6 md:px-8">
        {isLoading ? (
          <div className="flex justify-center p-12">
            <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
          </div>
        ) : !diaries || diaries.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border bg-card p-12 text-center text-muted-foreground">
            <BookOpen className="mx-auto mb-3 h-8 w-8 opacity-20" />
            No diaries recorded {date ? "for this date" : "yet"}.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
            {(diaries as Diary[]).map((diary) => (
              <Card
                key={diary.subjectDiaryId}
                className="overflow-hidden border-t-4 border-border border-t-indigo-500 bg-card shadow-lg"
              >
                <CardHeader className="bg-white/[0.02] p-4 pb-2">
                  <div className="mb-2 flex items-start justify-between">
                    <Badge
                      variant="outline"
                      className="border-indigo-500/20 bg-indigo-500/10 text-indigo-300"
                    >
                      {diary.ClassSubject.Subject.subjectName}
                    </Badge>
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <CalendarIcon className="h-3 w-3" />
                      {format(
                        typeof diary.date === "string"
                          ? new Date(diary.date)
                          : diary.date,
                        "MMM d, yyyy"
                      )}
                    </span>
                  </div>
                  <div className="mt-2 flex items-center gap-2 text-sm text-foreground">
                    <User className="h-4 w-4 text-muted-foreground" />
                    {diary.Teacher.employeeName}
                  </div>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="min-h-[100px] whitespace-pre-wrap rounded-lg border border-border bg-card p-3 text-sm leading-relaxed text-foreground">
                    {diary.content}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
