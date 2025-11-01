"use client";

import { useState, Suspense } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { GridIcon, Users, AlertCircle } from "lucide-react";
import { api } from "~/trpc/react";
import {
  type Class,
  type Teacher,
  type TimetableViewMode,
} from "~/lib/timetable-view";
import { ClasswiseView } from "~/components/attendance/timetable/classwise-view";
import { TeacherwiseView } from "~/components/attendance/timetable/teacherwise-view";

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

function TimetableContent() {
  const [viewMode, setViewMode] = useState<TimetableViewMode>("class");
  const { data: teachers, isLoading: loadingTeachers } =
    api.employee.getAllEmployeesForTimeTable.useQuery();
  const { data: classes, isLoading: loadingClasses } =
    api.class.getClasses.useQuery();

  if (loadingTeachers || loadingClasses) {
    return <div>Loading timetable data...</div>;
  }

  const transformedClasses: Class[] = (classes ?? []).map((cls) => ({
    classId: cls.classId,
    grade: cls.grade,
    section: cls.section,
  }));
  const transformedTeachers: Teacher[] = (teachers ?? []).map((t) => ({
    employeeId: t.employeeId,
    employeeName: t.employeeName,
    designation: t.designation,
    education: t.education,
  }));

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="mx-auto max-w-full space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">Timetable Management</h1>
          <p className="mt-2 text-muted-foreground">
            Manage class schedules with drag-and-drop teacher assignment
          </p>
        </div>

        {/* View Mode Tabs */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Select View Mode</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs
              value={viewMode}
              onValueChange={(value) => setViewMode(value as TimetableViewMode)}
            >
              <TabsList className="grid w-full max-w-md grid-cols-2">
                <TabsTrigger value="class" className="flex items-center gap-2">
                  <GridIcon className="h-4 w-4" />
                  Classwise
                </TabsTrigger>
                <TabsTrigger
                  value="teacher"
                  className="flex items-center gap-2"
                >
                  <Users className="h-4 w-4" />
                  Teacherwise
                </TabsTrigger>
              </TabsList>

              {/* Classwise View */}
              <TabsContent value="class" className="mt-6">
                <ClasswiseView
                  classes={transformedClasses}
                  teachers={transformedTeachers}
                  defaultTimeSlots={DEFAULT_TIME_SLOTS}
                />
              </TabsContent>

              {/* Teacherwise View */}
              <TabsContent value="teacher" className="mt-6">
                <TeacherwiseView
                  teachers={transformedTeachers}
                  classes={transformedClasses}
                  defaultTimeSlots={DEFAULT_TIME_SLOTS}
                />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Features Card */}
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              <AlertCircle className="h-4 w-4" />
              Features
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <ul className="list-inside list-disc space-y-1">
              <li>
                <strong>Classwise View:</strong> Drag teachers from the sidebar
                to assign them to specific time slots.
              </li>
              <li>
                <strong>Teacherwise View:</strong> View the complete weekly
                schedule for each teacher across all classes.
              </li>
              <li>
                <strong>Real-time Sync:</strong> All assignments are
                automatically saved to the database.
              </li>
              <li>
                <strong>Conflict Prevention:</strong> Each slot shows the
                current teacher assignment to avoid conflicts.
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function TimetablePage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-background p-6">
          Loading...
        </div>
      }
    >
      <TimetableContent />
    </Suspense>
  );
}
