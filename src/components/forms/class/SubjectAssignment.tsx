// components/forms/class/SubjectAssignment.tsx
"use client";

import { useState, useEffect } from "react";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "~/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Label } from "~/components/ui/label";
import { api } from "~/trpc/react";
import { toast } from "~/hooks/use-toast";
import { Skeleton } from "~/components/ui/skeleton";
import { ReloadIcon } from "@radix-ui/react-icons";
import { BookOpen, Users, CalendarSync } from "lucide-react";
import type { DayOfWeek } from "@prisma/client";
import { DAYS_OF_WEEK } from "~/lib/timetable-types";

type SubjectAssignmentDialogProps = {
  classId: string;
  dayOfWeek: DayOfWeek;
  lectureNumber: number;
  sessionId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAssigned?: () => void;
  defaultApplyToAllDays?: boolean;
  startTime?: string;
  endTime?: string;
};

export function SubjectAssignmentDialog({
  classId,
  dayOfWeek,
  lectureNumber,
  sessionId,
  open,
  onOpenChange,
  onAssigned,
  defaultApplyToAllDays = true,
  startTime = "08:00",
  endTime = "08:35",
}: SubjectAssignmentDialogProps) {
  const [selectedSubject, setSelectedSubject] = useState<string>("");
  const [selectedEmployee, setSelectedEmployee] = useState<string>("");
  const [validLectureNumber, setValidLectureNumber] = useState<number>(1);
  const [applyToAllDays, setApplyToAllDays] = useState<boolean>(defaultApplyToAllDays);

  const utils = api.useUtils();

  useEffect(() => {
    if (open) {
      setApplyToAllDays(defaultApplyToAllDays);
    }
  }, [open, defaultApplyToAllDays]);

  // Validate and ensure lectureNumber is at least 1
  useEffect(() => {
    if (lectureNumber >= 1) {
      setValidLectureNumber(lectureNumber);
    } else {
      console.warn(
        `Invalid lectureNumber: ${lectureNumber}. Using default value 1.`,
      );
      setValidLectureNumber(1);
    }
  }, [lectureNumber]);

  // Get ALL subjects
  const subjectsQuery = api.subject.getAllSubjects.useQuery(undefined, {
    enabled: open,
    refetchOnWindowFocus: false,
  });

  // Get ALL employees
  const employeesQuery = api.employee.getEmployees.useQuery(undefined, {
    enabled: open,
    refetchOnWindowFocus: false,
  });

  const subjects = subjectsQuery.data ?? [];
  const employees = employeesQuery.data ?? [];

  const assignToSlotSingle = api.timetable.assignTeacher.useMutation();
  const assignToSlotBulk = api.timetable.assignTeacherBulk.useMutation();

  const isPending = assignToSlotSingle.isPending || assignToSlotBulk.isPending;

  const handleAssign = async () => {
    if (!selectedSubject || !selectedEmployee) {
      toast({
        title: "Validation Error",
        description: "Please select both a subject and an employee",
      });
      return;
    }

    if (!classId || !sessionId) {
      toast({
        title: "Missing Required Data",
        description: "Class or session information is missing",
      });
      return;
    }

    const finalLectureNumber = validLectureNumber >= 1 ? validLectureNumber : 1;
    const subjectName =
      subjects.find((s) => s.subjectId === selectedSubject)?.subjectName ??
      "Subject";
    const employeeName =
      employees.find((e) => e.employeeId === selectedEmployee)
        ?.employeeName ?? "Employee";

    try {
      if (applyToAllDays) {
        await assignToSlotBulk.mutateAsync({
          classId,
          employeeId: selectedEmployee,
          subjectId: selectedSubject,
          sessionId,
          lectureNumber: finalLectureNumber,
          startTime,
          endTime,
          days: DAYS_OF_WEEK,
        });

        toast({
          title: "✅ Assigned to All Working Days (Mon–Sat)",
          description: `Lecture ${finalLectureNumber}: ${subjectName} → ${employeeName}`,
        });
      } else {
        await assignToSlotSingle.mutateAsync({
          classId,
          dayOfWeek,
          lectureNumber: finalLectureNumber,
          subjectId: selectedSubject,
          employeeId: selectedEmployee,
          sessionId,
          startTime,
          endTime,
        });

        toast({
          title: "✅ Assigned Successfully",
          description: `${dayOfWeek} L${finalLectureNumber}: ${subjectName} → ${employeeName}`,
        });
      }

      setSelectedSubject("");
      setSelectedEmployee("");
      void utils.timetable.getTimetable.invalidate();
      void utils.timetable.getTimetableByClass.invalidate({ classId });
      onOpenChange(false);
      onAssigned?.();
    } catch (error) {
      console.error("Assignment error:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Failed to assign";
      toast({
        title: "⚠ Error",
        description: errorMessage,
      });
    }
  };

  const dayNames: Record<DayOfWeek, string> = {
    Monday: "Monday",
    Tuesday: "Tuesday",
    Wednesday: "Wednesday",
    Thursday: "Thursday",
    Friday: "Friday",
    Saturday: "Saturday",
    Sunday: "Sunday",
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="w-full transition-all hover:scale-[1.03] sm:w-auto"
        >
          <Users className="mr-1 h-4 w-4" /> Assign
        </Button>
      </DialogTrigger>

      <DialogContent className="w-[95%] rounded-2xl p-4 sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-lg sm:text-left">
            Assign Subject & Teacher
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Configure lecture {validLectureNumber} schedule
          </DialogDescription>
        </DialogHeader>

        <section className="rounded-xl bg-muted/40 p-3 text-center text-sm font-medium">
          {applyToAllDays ? (
            <div className="flex items-center justify-center gap-1.5 text-emerald-700 dark:text-emerald-400 font-semibold">
              <CalendarSync className="h-4 w-4" />
              All Working Days (Mon–Sat) — 🎓 Lecture {validLectureNumber}
            </div>
          ) : (
            <div>
              📅 {dayNames[dayOfWeek]} — 🎓 Lecture {validLectureNumber}
            </div>
          )}
        </section>

        {/* Sync across all days toggle */}
        <div className="flex items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50/70 p-3 dark:border-emerald-800/30 dark:bg-emerald-950/20">
          <div className="space-y-0.5">
            <label
              htmlFor="applyToAllDays"
              className="text-xs font-semibold text-emerald-900 dark:text-emerald-200 cursor-pointer flex items-center gap-1.5"
            >
              <CalendarSync className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
              Apply to All Days (Mon–Sat)
            </label>
            <p className="text-[11px] text-emerald-700/80 dark:text-emerald-400/80">
              Timetable is same for all days in this class
            </p>
          </div>
          <input
            type="checkbox"
            id="applyToAllDays"
            checked={applyToAllDays}
            onChange={(e) => setApplyToAllDays(e.target.checked)}
            className="h-4 w-4 rounded border-emerald-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-1">
            <Label className="flex items-center gap-1 text-xs">
              <BookOpen className="h-3.5 w-3.5" /> Subject *
            </Label>
            {subjectsQuery.isLoading ? (
              <Skeleton className="h-10 w-full rounded-xl" />
            ) : subjectsQuery.isError ? (
              <div className="rounded-xl border border-destructive p-2 text-xs text-destructive">
                Failed to load subjects
              </div>
            ) : subjects.length === 0 ? (
              <div className="rounded-xl border border-dashed p-2 text-xs text-muted-foreground">
                No subjects available. Create subjects first.
              </div>
            ) : (
              <Select
                value={selectedSubject}
                onValueChange={setSelectedSubject}
              >
                <SelectTrigger className="rounded-xl">
                  <SelectValue placeholder="Select subject" />
                </SelectTrigger>
                <SelectContent>
                  {subjects.map((subject) => (
                    <SelectItem
                      key={subject.subjectId}
                      value={subject.subjectId}
                    >
                      {subject.subjectName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          <div className="space-y-2 sm:col-span-1">
            <Label className="flex items-center gap-1 text-xs">
              <Users className="h-3.5 w-3.5" /> Teacher *
            </Label>
            {employeesQuery.isLoading ? (
              <Skeleton className="h-10 w-full rounded-xl" />
            ) : employeesQuery.isError ? (
              <div className="rounded-xl border border-destructive p-2 text-xs text-destructive">
                Failed to load employees
              </div>
            ) : employees.length === 0 ? (
              <div className="rounded-xl border border-dashed p-2 text-xs text-muted-foreground">
                No teachers available
              </div>
            ) : (
              <Select
                value={selectedEmployee}
                onValueChange={setSelectedEmployee}
              >
                <SelectTrigger className="rounded-xl">
                  <SelectValue placeholder="Select teacher" />
                </SelectTrigger>
                <SelectContent>
                  {employees.map((employee) => (
                    <SelectItem
                      key={employee.employeeId}
                      value={employee.employeeId}
                    >
                      <div className="flex flex-col">
                        <span className="font-medium text-xs">
                          {employee.employeeName}
                        </span>
                        {employee.designation && (
                          <span className="text-[10px] text-muted-foreground">
                            {employee.designation}
                          </span>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        </div>

        <footer className="mt-4 flex flex-col gap-2 sm:flex-row sm:gap-3">
          <Button
            variant="outline"
            onClick={() => {
              setSelectedSubject("");
              setSelectedEmployee("");
              onOpenChange(false);
            }}
            className="w-full rounded-xl sm:w-1/2"
          >
            Cancel
          </Button>

          <Button
            onClick={handleAssign}
            disabled={
              isPending ||
              !selectedSubject ||
              !selectedEmployee ||
              subjects.length === 0 ||
              employees.length === 0
            }
            className="w-full rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white sm:w-1/2"
          >
            {isPending ? (
              <span className="flex items-center justify-center">
                <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />
                Saving…
              </span>
            ) : applyToAllDays ? (
              "✅ Assign to All Days"
            ) : (
              "✅ Assign Slot"
            )}
          </Button>
        </footer>
      </DialogContent>
    </Dialog>
  );
}

