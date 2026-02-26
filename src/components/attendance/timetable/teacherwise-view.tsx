"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { ScrollArea, ScrollBar } from "~/components/ui/scroll-area";
import { Clock, User } from "lucide-react";
import type { Teacher, Class, TimeSlot } from "~/lib/timetable-types";
import { DAYS_OF_WEEK } from "~/lib/timetable-types";
import { api } from "~/trpc/react";
import type { DayOfWeek } from "@prisma/client";
import { Badge } from "~/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "~/components/ui/tooltip";
import { cn } from "~/lib/utils";

interface TeacherwiseViewProps {
  teachers: Teacher[];
  classes: Class[];
  defaultTimeSlots: TimeSlot[];
}

interface TeacherTimetableEntry {
  timetableId: string;
  dayOfWeek: DayOfWeek;
  lectureNumber: number;
  startTime: string;
  endTime: string;
  Subject: { subjectId: string; subjectName: string };
  Grades: { classId: string; grade: string; section: string };
  Sessions: { sessionId: string; sessionName: string };
  Employees: { employeeId: string; employeeName: string; designation: string };
}

const DAY_COLORS = [
  "bg-blue-50 border-blue-200",
  "bg-green-50 border-green-200",
  "bg-yellow-50 border-yellow-200",
  "bg-purple-50 border-purple-200",
  "bg-pink-50 border-pink-200",
  "bg-indigo-50 border-indigo-200",
];

export function TeacherwiseView({
  teachers,
  classes: _classes,
  defaultTimeSlots: _slots,
}: TeacherwiseViewProps) {
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(
    teachers[0] ?? null,
  );

  const { data: teacherTimetable } =
    api.timetable.getTimetableByTeacher.useQuery(
      { employeeId: selectedTeacher?.employeeId ?? "" },
      { enabled: !!selectedTeacher?.employeeId },
    );

  const schedule = useMemo(() => {
    const map: Record<string, TeacherTimetableEntry[]> = {};
    DAYS_OF_WEEK.forEach((day) => (map[day] = []));

    teacherTimetable?.forEach((entry) => {
      const typed = entry as TeacherTimetableEntry;
      map[typed.dayOfWeek]?.push(typed);
    });

    Object.keys(map).forEach((day) => {
      map[day]?.sort((a, b) => a.lectureNumber - b.lectureNumber);
    });

    return map;
  }, [teacherTimetable]);

  const getClassesCount = () => teacherTimetable?.length ?? 0;
  const getClassesCountForDay = (day: string) => schedule[day]?.length ?? 0;

  return (
    <div className="space-y-4 md:space-y-6">
      <Card className="border-primary/20 shadow-lg">
        <CardHeader className="bg-primary/5">
          <CardTitle className="flex items-center gap-2 text-lg text-primary md:text-xl">
            <User className="h-5 w-5" />
            Select Teacher
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 md:p-6">
          <ScrollArea className="w-full whitespace-nowrap rounded-md border">
            <div className="flex gap-2 p-2">
              {teachers.map((teacher) => (
                <Button
                  key={teacher.employeeId}
                  variant={
                    selectedTeacher?.employeeId === teacher.employeeId
                      ? "default"
                      : "outline"
                  }
                  onClick={() => setSelectedTeacher(teacher)}
                  className="flex-shrink-0"
                >
                  {teacher.employeeName}
                </Button>
              ))}
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </CardContent>
      </Card>

      {selectedTeacher && (
        <Card className="border-primary/20 shadow-lg">
          <CardHeader className="bg-primary/5">
            <CardTitle className="flex items-center gap-2 text-lg text-primary md:text-xl">
              <Clock className="h-5 w-5" />
              {selectedTeacher.employeeName}&apos;s Weekly Schedule
              <Badge variant="secondary" className="ml-2">
                {selectedTeacher.designation}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 md:p-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6 lg:grid-cols-3">
              {DAYS_OF_WEEK.map((day, index) => {
                const slots = schedule[day] ?? [];
                return (
                  <Tooltip key={day}>
                    <TooltipTrigger asChild>
                      <div
                        className={cn(
                          "rounded-lg border p-4 shadow-sm transition-all duration-200",
                          DAY_COLORS[index % DAY_COLORS.length],
                          slots.length > 0 ? "hover:shadow-md" : "opacity-75",
                        )}
                      >
                        <h3 className="mb-3 text-base font-semibold">{day}</h3>
                        {slots.length > 0 ? (
                          <ScrollArea className="h-[200px] pr-4">
                            <div className="space-y-3">
                              {slots.map((slot) => (
                                <div
                                  key={slot.timetableId}
                                  className="rounded-lg border bg-white/50 p-3 shadow-inner transition-colors hover:bg-white/80"
                                >
                                  <p className="text-sm font-medium">
                                    {slot.Grades.grade} - {slot.Grades.section}
                                  </p>
                                  <p className="text-sm text-muted-foreground">
                                    {slot.Subject.subjectName}
                                  </p>
                                  <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                                    <Clock className="h-3 w-3" /> L
                                    {slot.lectureNumber} - {slot.startTime}
                                  </p>
                                </div>
                              ))}
                            </div>
                            <ScrollBar orientation="vertical" />
                          </ScrollArea>
                        ) : (
                          <p className="py-4 text-center text-sm text-muted-foreground">
                            No classes scheduled
                          </p>
                        )}
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      {slots.length} classes on {day}
                    </TooltipContent>
                  </Tooltip>
                );
              })}
            </div>

            <Card className="mt-6 border-muted bg-muted/50 shadow-sm">
              <CardContent className="p-4">
                <h4 className="mb-3 text-sm font-semibold md:text-base">
                  Classes Summary
                </h4>
                <div className="grid grid-cols-3 gap-2 sm:grid-cols-6 md:gap-3">
                  {DAYS_OF_WEEK.map((day, index) => (
                    <div
                      key={day}
                      className={cn(
                        "rounded-lg p-2 text-center shadow-inner md:p-3",
                        DAY_COLORS[index % DAY_COLORS.length],
                      )}
                    >
                      <p className="text-xs font-medium">{day.slice(0, 3)}</p>
                      <p className="text-lg font-bold md:text-xl">
                        {getClassesCountForDay(day)}
                      </p>
                    </div>
                  ))}
                </div>
                <div className="mt-4 border-t border-muted pt-3">
                  <p className="text-sm text-muted-foreground">
                    Total Classes/Week
                  </p>
                  <p className="text-2xl font-bold md:text-3xl">
                    {getClassesCount()}
                  </p>
                </div>
              </CardContent>
            </Card>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
