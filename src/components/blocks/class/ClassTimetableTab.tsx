"use client";

import { Clock } from "lucide-react";
import { api } from "~/trpc/react";
import { ClasswiseView } from "~/components/attendance/timetable/classwise-view";

const DEFAULT_TIME_SLOTS = [
  { lectureNumber: 1, startTime: "08:00", endTime: "08:35" },
  { lectureNumber: 2, startTime: "08:40", endTime: "09:15" },
  { lectureNumber: 3, startTime: "09:20", endTime: "09:55" },
  { lectureNumber: 4, startTime: "10:00", endTime: "10:35" },
  { lectureNumber: 5, startTime: "10:40", endTime: "11:15" },
  { lectureNumber: 6, startTime: "11:20", endTime: "11:55" },
  { lectureNumber: 7, startTime: "12:00", endTime: "12:35" },
  { lectureNumber: 8, startTime: "13:00", endTime: "13:35" },
  { lectureNumber: 9, startTime: "13:40", endTime: "14:15" },
];

export function ClassTimetableTab({
  classId,
  sessionId: _sessionId,
}: {
  classId: string;
  sessionId: string;
}) {
  const { data: cls, isLoading: isClassLoading } =
    api.class.getClassById.useQuery({ classId });
  const { data: teachers, isLoading: isTeachersLoading } =
    api.employee.getAllEmployeesForTimeTable.useQuery();

  if (isClassLoading || isTeachersLoading) {
    return (
      <div className="flex items-center justify-center rounded-xl border border-border bg-card p-12 text-muted-foreground">
        <Clock className="mr-2 h-6 w-6 animate-spin text-indigo-400" />
        Loading timetable constraints...
      </div>
    );
  }

  if (!cls) {
    return (
      <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-8 text-center text-red-500">
        Class definition not found.
      </div>
    );
  }

  const transformedTeachers =
    teachers?.map((t) => ({
      employeeId: t.employeeId,
      employeeName: t.employeeName,
      designation: t.designation,
      education: t.education ?? undefined,
    })) ?? [];

  return (
    <div className="mt-4 rounded-2xl border border-border bg-card p-4 shadow-2xl">
      <ClasswiseView
        classes={[cls]}
        teachers={transformedTeachers}
        defaultTimeSlots={DEFAULT_TIME_SLOTS}
      />
    </div>
  );
}
