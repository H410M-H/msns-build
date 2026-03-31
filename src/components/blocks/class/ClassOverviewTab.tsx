"use client";

import { Users, BookOpen } from "lucide-react";
import { api } from "~/trpc/react";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";

export function ClassOverviewTab({
  classId,
  sessionId,
}: {
  classId: string;
  sessionId: string;
}) {
  const { data: cls } = api.class.getClassById.useQuery({ classId });
  const { data: students } =
    api.allotment.getStudentsByClassAndSession.useQuery({ classId, sessionId });
  const { data: subjects } = api.subject.getSubjectsByClass.useQuery({
    classId,
    sessionId,
  });

  const studentCount = students?.data?.length ?? 0;
  const subjectsCount = subjects?.length ?? 0;

  return (
    <div className="grid gap-6 duration-500 animate-in fade-in md:mt-4 md:grid-cols-2 lg:grid-cols-4">
      <Card className="rounded-2xl border-border bg-card shadow-xl">
        <CardHeader className="flex flex-row items-center justify-between border-0 bg-transparent pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Total Students
          </CardTitle>
          <Users className="h-4 w-4 text-emerald-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-foreground">
            {studentCount}
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            Enrolled in {cls?.grade} {cls?.section}
          </p>
        </CardContent>
      </Card>

      <Card className="rounded-2xl border-border bg-card shadow-xl">
        <CardHeader className="flex flex-row items-center justify-between border-0 bg-transparent pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Allotted Subjects
          </CardTitle>
          <BookOpen className="h-4 w-4 text-blue-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-foreground">
            {subjectsCount}
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            Active class subjects
          </p>
        </CardContent>
      </Card>

      {/* We can add more stat cards here later, such as Average Attendance, Upcoming Exams, etc. */}
    </div>
  );
}
