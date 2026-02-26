"use client";

import React from "react";
import { useState, useMemo, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { ScrollArea, ScrollBar } from "~/components/ui/scroll-area";
import { Clock, User, X, GripVertical, Plus } from "lucide-react";
import { cn } from "~/lib/utils";
import type {
  Teacher,
  Class,
  TimeSlot,
  DraggedTeacher,
} from "~/lib/timetable-types";
import { DAYS_OF_WEEK, LECTURE_NUMBERS } from "~/lib/timetable-types";
import { api } from "~/trpc/react";
import type { DayOfWeek } from "@prisma/client";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "~/components/ui/tooltip";
import { Badge } from "~/components/ui/badge";
import { SubjectAssignmentDialog } from "~/components/forms/class/SubjectAssignment";

interface ClasswiseViewProps {
  classes: Class[];
  teachers: Teacher[];
  defaultTimeSlots: TimeSlot[];
  onAssignTeacher?: (slotId: string, teacher: Teacher, subject: string) => void;
  onRemoveTeacher?: (slotId: string) => void;
}

interface TimetableEntry {
  timetableId: string;
  dayOfWeek: DayOfWeek;
  lectureNumber: number;
  startTime: string;
  endTime: string;
  Employees: { employeeId: string; employeeName: string; designation: string };
  Subject: { subjectId: string; subjectName: string };
  Grades: { classId: string; grade: string; section: string };
  Sessions: { sessionId: string; sessionName: string };
}

// Helper function to validate day of week
const isValidDayOfWeek = (
  day: string,
): day is
  | "Monday"
  | "Tuesday"
  | "Wednesday"
  | "Thursday"
  | "Friday"
  | "Saturday"
  | "Sunday" => {
  return [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ].includes(day);
};

// Color palette for days
const DAY_COLORS = [
  "bg-blue-50 hover:bg-blue-100",
  "bg-green-50 hover:bg-green-100",
  "bg-yellow-50 hover:bg-yellow-100",
  "bg-purple-50 hover:bg-purple-100",
  "bg-pink-50 hover:bg-pink-100",
  "bg-indigo-50 hover:bg-indigo-100",
];

export function ClasswiseView({
  classes,
  teachers,
  defaultTimeSlots,
  onAssignTeacher,
  onRemoveTeacher,
}: ClasswiseViewProps) {
  const [selectedClass, setSelectedClass] = useState<Class | null>(
    classes[0] ?? null,
  );
  const [draggedTeacher, setDraggedTeacher] = useState<DraggedTeacher | null>(
    null,
  );
  const [selectedSubject, setSelectedSubject] = useState<{
    subjectId: string;
    subjectName: string;
  } | null>(null);
  const [assignmentDialogOpen, setAssignmentDialogOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<{
    dayOfWeek: DayOfWeek;
    lectureNumber: number;
  } | null>(null);

  const [assignedSubjects, setAssignedSubjects] = useState<
    {
      subjectId: string;
      subjectName: string;
    }[]
  >([]);

  const { data: sessions } = api.timetable.getActiveSessions.useQuery();
  const { data: classTimetable, refetch: refetchTimetable } =
    api.timetable.getTimetableByClass.useQuery(
      { classId: selectedClass?.classId ?? "" },
      { enabled: !!selectedClass?.classId },
    );

  // Extract unique subjects from the timetable data
  useEffect(() => {
    if (classTimetable && classTimetable.length > 0) {
      const uniqueSubjects = new Map<
        string,
        { subjectId: string; subjectName: string }
      >();

      classTimetable.forEach((entry) => {
        const typed = entry as TimetableEntry;
        if (typed.Subject?.subjectId) {
          uniqueSubjects.set(typed.Subject.subjectId, {
            subjectId: typed.Subject.subjectId,
            subjectName: typed.Subject.subjectName,
          });
        }
      });

      setAssignedSubjects(Array.from(uniqueSubjects.values()));
    } else {
      setAssignedSubjects([]);
    }
  }, [classTimetable]);

  // Fetch all subjects as fallback
  const { data: allSubjects } = api.subject.getAllSubjects.useQuery(undefined, {
    enabled: true,
  });

  const assignTeacherMutation = api.timetable.assignTeacher.useMutation({
    onSuccess: () => void refetchTimetable(),
  });

  const removeTeacherMutation = api.timetable.removeTeacher.useMutation({
    onSuccess: () => void refetchTimetable(),
  });

  const timetableMap = useMemo(() => {
    const map: Record<string, Record<number, TimetableEntry>> = {};
    classTimetable?.forEach((entry) => {
      const typed = entry as TimetableEntry;
      // Fix: Removed redundant if check, rely on ??= in the assignment line
      (map[typed.dayOfWeek] ??= {})[typed.lectureNumber] = typed;
    });
    return map;
  }, [classTimetable]);

  const getTimeSlot = (lectureNumber: number) =>
    defaultTimeSlots.find((slot) => slot.lectureNumber === lectureNumber);

  const getSlotForPosition = (day: string, lecture: number) =>
    timetableMap[day]?.[lecture];

  const handleTeacherDragStart = (teacher: Teacher, e: React.DragEvent) => {
    setDraggedTeacher(teacher);
    e.dataTransfer.effectAllowed = "copy";
  };

  const handleSlotDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
  };

  const handleSlotDrop = async (
    day: string,
    lecture: number,
    e: React.DragEvent,
  ) => {
    e.preventDefault();

    if (!selectedSubject?.subjectId) {
      alert("Please select a subject first");
      return;
    }

    if (!draggedTeacher || !selectedClass || !sessions?.[0] || !selectedSubject)
      return;

    if (!isValidDayOfWeek(day)) {
      console.error("Invalid day:", day);
      return;
    }

    const timeSlot = getTimeSlot(lecture);
    if (!timeSlot) return;

    try {
      await assignTeacherMutation.mutateAsync({
        classId: selectedClass.classId,
        employeeId: draggedTeacher.employeeId,
        subjectId: selectedSubject.subjectId,
        dayOfWeek: day,
        lectureNumber: lecture,
        sessionId: sessions[0].sessionId,
        startTime: timeSlot.startTime,
        endTime: timeSlot.endTime,
      });

      onAssignTeacher?.(
        `${day}-${lecture}`,
        draggedTeacher,
        selectedSubject.subjectName,
      );

      // Add subject to assigned subjects if not already present
      if (
        !assignedSubjects.some(
          (sub) => sub.subjectId === selectedSubject.subjectId,
        )
      ) {
        setAssignedSubjects((prev) => [...prev, selectedSubject]);
      }
    } catch (err) {
      console.error("Assign error:", err);
    }

    setDraggedTeacher(null);
  };

  const handleRemoveTeacher = async (timetableId: string) => {
    try {
      await removeTeacherMutation.mutateAsync({ timetableId });
      onRemoveTeacher?.(timetableId);
    } catch (err) {
      console.error("Remove error:", err);
    }
  };

  const handleOpenAssignmentDialog = (day: string, lecture: number) => {
    if (!isValidDayOfWeek(day)) {
      console.error("Invalid day:", day);
      return;
    }
    setSelectedSlot({
      dayOfWeek: day,
      lectureNumber: lecture,
    });
    setAssignmentDialogOpen(true);
  };

  const handleAssigned = () => {
    void refetchTimetable();
    setAssignmentDialogOpen(false);
    setSelectedSlot(null);
  };

  return (
    <div className="space-y-4">
      <Card className="border-primary/20 shadow-lg">
        <CardHeader className="bg-primary/5 p-3 sm:p-4">
          <CardTitle className="flex items-center gap-2 text-base text-primary sm:text-lg">
            <Clock className="h-4 w-4 sm:h-5 sm:w-5" />
            Select Class & Subject
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 p-3 sm:p-4">
          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground sm:mb-2 sm:text-sm">
              Class
            </label>
            <ScrollArea className="h-[60px] w-full whitespace-nowrap rounded-md border sm:h-auto">
              <div className="flex grid-cols-2 gap-2 p-2">
                {classes.map((cls) => (
                  <Button
                    key={cls.classId}
                    variant={
                      selectedClass?.classId === cls.classId
                        ? "default"
                        : "outline"
                    }
                    onClick={() => {
                      setSelectedClass(cls);
                      setSelectedSubject(null);
                      setAssignedSubjects([]);
                    }}
                    className="flex-shrink-0 px-2 py-1 text-xs sm:px-4 sm:py-2 sm:text-sm"
                  >
                    {cls.grade} - {cls.section}
                  </Button>
                ))}
              </div>
              <ScrollBar orientation="horizontal" />
            </ScrollArea>
          </div>

          {selectedClass && (
            <div>
              <label className="mb-1 flex items-center gap-1 text-xs font-medium text-muted-foreground sm:mb-2 sm:gap-2 sm:text-sm">
                <User className="h-3 w-3 sm:h-4 sm:w-4" />
                Subjects (From Timetable)
              </label>
              <ScrollArea className="h-[60px] w-full whitespace-nowrap rounded-md border sm:h-auto">
                <div className="flex gap-2 p-2">
                  {assignedSubjects.length > 0 ? (
                    assignedSubjects.map((subject) => (
                      <Button
                        key={subject.subjectId}
                        variant={
                          selectedSubject?.subjectId === subject.subjectId
                            ? "default"
                            : "outline"
                        }
                        onClick={() => setSelectedSubject(subject)}
                        className="flex-shrink-0 px-2 py-1 text-xs sm:px-4 sm:py-2 sm:text-sm"
                      >
                        {subject.subjectName}
                      </Button>
                    ))
                  ) : allSubjects && allSubjects.length > 0 ? (
                    // Fallback: Show all subjects if no assignments yet
                    allSubjects.map((subject) => (
                      <Button
                        key={subject.subjectId}
                        variant={
                          selectedSubject?.subjectId === subject.subjectId
                            ? "default"
                            : "outline"
                        }
                        onClick={() =>
                          setSelectedSubject({
                            subjectId: subject.subjectId,
                            subjectName: subject.subjectName,
                          })
                        }
                        className="flex-shrink-0 px-2 py-1 text-xs sm:px-4 sm:py-2 sm:text-sm"
                      >
                        {subject.subjectName}
                      </Button>
                    ))
                  ) : (
                    <div className="p-2 text-xs text-muted-foreground sm:text-sm">
                      No subjects assigned yet. Add subjects using the + button
                      in timetable.
                    </div>
                  )}
                </div>
                <ScrollBar orientation="horizontal" />
              </ScrollArea>
              {assignedSubjects.length === 0 &&
                allSubjects &&
                allSubjects.length > 0 && (
                  <div className="mt-1 text-xs text-muted-foreground">
                    Showing all available subjects. Assign a subject to see it
                    appear here.
                  </div>
                )}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-4">
        <div>
          <Card className="border-primary/20 shadow-lg">
            <CardHeader className="bg-primary/5 p-3 sm:p-4">
              <CardTitle className="flex items-center gap-2 text-base text-primary sm:text-lg">
                <User className="h-4 w-4 sm:h-5 sm:w-5" /> Teachers
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 sm:p-4">
              <div className="flex flex-wrap gap-1 rounded-md border p-1">
                {teachers.map((teacher) => (
                  <Tooltip key={teacher.employeeId}>
                    <TooltipTrigger asChild>
                      <div
                        draggable
                        onDragStart={(e) => handleTeacherDragStart(teacher, e)}
                        className={cn(
                          "cursor-grab rounded-lg border p-1 transition-all duration-200 hover:bg-accent/50 active:cursor-grabbing sm:p-2",
                          "flex min-w-[80px] flex-col items-center justify-center gap-0.5 shadow-sm sm:min-w-[100px] sm:gap-1",
                          draggedTeacher?.employeeId === teacher.employeeId &&
                            "scale-105 border-primary bg-primary/10",
                        )}
                      >
                        <GripVertical className="h-3 w-3 flex-shrink-0 text-muted-foreground" />
                        <div className="text-center">
                          <p className="truncate text-[10px] font-medium sm:text-xs">
                            {teacher.employeeName}
                          </p>
                          <Badge
                            variant="secondary"
                            className="mt-0.5 text-[9px] sm:text-[10px]"
                          >
                            {teacher.designation}
                          </Badge>
                        </div>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      Drag to assign {teacher.employeeName}
                    </TooltipContent>
                  </Tooltip>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card className="border-primary/20 shadow-lg">
            <CardHeader className="bg-primary/5 p-3 sm:p-4">
              <CardTitle className="flex items-center gap-2 text-base text-primary sm:text-lg md:text-xl">
                <Clock className="h-4 w-4 sm:h-5 sm:w-5" />
                {selectedClass
                  ? `${selectedClass.grade} - ${selectedClass.section} Timetable`
                  : "Select a Class"}
              </CardTitle>
            </CardHeader>
            <CardContent className="overflow-x-auto p-3 sm:p-4 md:p-6">
              <div className="grid min-w-[600px] grid-cols-7 gap-1 sm:min-w-[900px] sm:gap-2 md:gap-3">
                <div className="rounded-lg bg-primary p-2 text-center text-xs font-semibold text-primary-foreground shadow sm:p-3 sm:text-sm">
                  Time
                </div>
                {DAYS_OF_WEEK.map((day, index) => (
                  <div
                    key={day}
                    className={cn(
                      "rounded-lg p-2 text-center text-xs font-semibold text-foreground shadow sm:p-3 sm:text-sm",
                      DAY_COLORS[index % DAY_COLORS.length],
                    )}
                  >
                    {day.slice(0, 3)}
                  </div>
                ))}

                {LECTURE_NUMBERS.map((lecture) => (
                  <React.Fragment key={lecture}>
                    <div className="rounded-lg bg-muted/50 p-2 text-center text-xs shadow sm:p-3 sm:text-sm">
                      <div className="font-medium">L{lecture}</div>
                      {getTimeSlot(lecture) && (
                        <div className="text-[10px] text-muted-foreground sm:text-xs">
                          {getTimeSlot(lecture)?.startTime}
                        </div>
                      )}
                    </div>

                    {DAYS_OF_WEEK.map((day, dayIndex) => {
                      const slot = getSlotForPosition(day, lecture);
                      return (
                        <Tooltip key={`${day}-${lecture}`}>
                          <TooltipTrigger asChild>
                            <div
                              onDragOver={handleSlotDragOver}
                              onDrop={(e) => handleSlotDrop(day, lecture, e)}
                              className={cn(
                                "relative min-h-[60px] rounded-lg border p-2 text-xs shadow transition-all duration-200 sm:min-h-[80px] sm:p-3 sm:text-sm md:min-h-[100px]",
                                !slot
                                  ? "border-dashed bg-background hover:bg-muted/30"
                                  : cn(
                                      "border-solid",
                                      (
                                        DAY_COLORS[
                                          dayIndex % DAY_COLORS.length
                                        ] ?? ""
                                      ).replace("50", "100"),
                                    ),
                                draggedTeacher &&
                                  !slot &&
                                  "scale-105 border-primary",
                              )}
                            >
                              {slot ? (
                                <div className="space-y-0.5 sm:space-y-1">
                                  <div className="flex items-start justify-between">
                                    <div className="min-w-0 flex-1">
                                      <p className="truncate text-xs font-medium sm:text-sm">
                                        {slot.Employees.employeeName}
                                      </p>
                                      <Badge
                                        variant="outline"
                                        className="mt-0.5 text-[10px] sm:mt-1 sm:text-xs"
                                      >
                                        {slot.Subject.subjectName}
                                      </Badge>
                                    </div>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      className="h-4 w-4 p-0 hover:bg-destructive/20 sm:h-5 sm:w-5"
                                      onClick={() =>
                                        handleRemoveTeacher(slot.timetableId)
                                      }
                                      disabled={removeTeacherMutation.isPending}
                                    >
                                      <X className="h-3 w-3 text-destructive sm:h-4 sm:w-4" />
                                    </Button>
                                  </div>
                                </div>
                              ) : (
                                <div className="flex h-full flex-col items-center justify-center space-y-1">
                                  <p className="text-center text-[10px] text-muted-foreground sm:text-xs">
                                    {selectedSubject
                                      ? "Drag teacher or"
                                      : "Select subject"}
                                  </p>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 w-6 p-0 hover:bg-primary/10"
                                    onClick={() =>
                                      handleOpenAssignmentDialog(day, lecture)
                                    }
                                  >
                                    <Plus className="h-3 w-3" />
                                  </Button>
                                </div>
                              )}
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            {slot
                              ? `${slot.Subject.subjectName} with ${slot.Employees.employeeName}`
                              : "Empty slot - Click + to assign"}
                          </TooltipContent>
                        </Tooltip>
                      );
                    })}
                  </React.Fragment>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Subject Assignment Dialog */}
      {selectedClass && selectedSlot && sessions?.[0] && (
        <SubjectAssignmentDialog
          classId={selectedClass.classId}
          dayOfWeek={selectedSlot.dayOfWeek}
          lectureNumber={selectedSlot.lectureNumber}
          sessionId={sessions[0].sessionId}
          open={assignmentDialogOpen}
          onOpenChange={setAssignmentDialogOpen}
          onAssigned={handleAssigned}
        />
      )}
    </div>
  );
}
