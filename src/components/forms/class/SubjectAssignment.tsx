// components/forms/class/SubjectAssignment.tsx
"use client";

import { useState, useEffect, useMemo } from "react";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "~/components/ui/dialog";
import { Label } from "~/components/ui/label";
import { Checkbox } from "~/components/ui/checkbox";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { ScrollArea } from "~/components/ui/scroll-area";
import { Badge } from "~/components/ui/badge";
import { api } from "~/trpc/react";
import { toast } from "~/hooks/use-toast";
import { Skeleton } from "~/components/ui/skeleton";
import { ReloadIcon } from "@radix-ui/react-icons";
import { BookOpen, Users, CalendarSync, ChevronDown, Check } from "lucide-react";
import type { DayOfWeek } from "@prisma/client";
import { DAYS_OF_WEEK } from "~/lib/timetable-types";
import { cn } from "~/lib/utils";

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
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [selectedEmployees, setSelectedEmployees] = useState<string[]>([]);
  const [validLectureNumber, setValidLectureNumber] = useState<number>(1);
  const [applyToAllDays, setApplyToAllDays] = useState<boolean>(defaultApplyToAllDays);
  const [subjectPopoverOpen, setSubjectPopoverOpen] = useState(false);
  const [employeePopoverOpen, setEmployeePopoverOpen] = useState(false);

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

  // Get employees (filter active only, exclude workers)
  const employeesQuery = api.employee.getEmployees.useQuery(
    { activeOnly: true, excludeWorkers: true },
    {
      enabled: open,
      refetchOnWindowFocus: false,
    },
  );

  const subjects = subjectsQuery.data ?? [];
  const rawEmployees = employeesQuery.data ?? [];

  // Enforce active only and exclude workers strictly
  const eligibleEmployees = useMemo(() => {
    return rawEmployees.filter(
      (e) =>
        e.status === "Active" &&
        e.designation !== "WORKER" &&
        e.designation !== ("Worker" as any),
    );
  }, [rawEmployees]);

  const assignToSlotSingle = api.timetable.assignTeacher.useMutation();
  const assignToSlotBulk = api.timetable.assignTeacherBulk.useMutation();

  const isPending = assignToSlotSingle.isPending || assignToSlotBulk.isPending;

  const toggleSubject = (id: string) => {
    setSelectedSubjects((prev) => {
      if (prev.includes(id)) {
        return prev.filter((item) => item !== id);
      }
      if (prev.length >= 2) return prev;
      return [...prev, id];
    });
  };

  const toggleEmployee = (id: string) => {
    setSelectedEmployees((prev) => {
      if (prev.includes(id)) {
        return prev.filter((item) => item !== id);
      }
      if (prev.length >= 2) return prev;
      return [...prev, id];
    });
  };

  const handleAssign = async () => {
    if (selectedSubjects.length === 0 || selectedEmployees.length === 0) {
      toast({
        title: "Validation Error",
        description: "Please select at least 1 subject and 1 teacher (max 2 each).",
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

    const subjectNames = selectedSubjects
      .map((sId) => subjects.find((s) => s.subjectId === sId)?.subjectName ?? "Subject")
      .join(" & ");

    const employeeNames = selectedEmployees
      .map((eId) => eligibleEmployees.find((e) => e.employeeId === eId)?.employeeName ?? "Teacher")
      .join(" & ");

    try {
      if (applyToAllDays) {
        await assignToSlotBulk.mutateAsync({
          classId,
          employeeId: selectedEmployees[0]!,
          employeeIds: selectedEmployees,
          subjectId: selectedSubjects[0]!,
          subjectIds: selectedSubjects,
          sessionId,
          lectureNumber: finalLectureNumber,
          startTime,
          endTime,
          days: DAYS_OF_WEEK,
        });

        toast({
          title: "✅ Assigned to All Working Days (Mon–Sat)",
          description: `Lecture ${finalLectureNumber}: ${subjectNames} → ${employeeNames}`,
        });
      } else {
        await assignToSlotSingle.mutateAsync({
          classId,
          dayOfWeek,
          lectureNumber: finalLectureNumber,
          subjectId: selectedSubjects[0]!,
          subjectIds: selectedSubjects,
          employeeId: selectedEmployees[0]!,
          employeeIds: selectedEmployees,
          sessionId,
          startTime,
          endTime,
        });

        toast({
          title: "✅ Assigned Successfully",
          description: `${dayOfWeek} L${finalLectureNumber}: ${subjectNames} → ${employeeNames}`,
        });
      }

      setSelectedSubjects([]);
      setSelectedEmployees([]);
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
            Assign Subject & Teacher (Up to 2)
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Configure lecture {validLectureNumber} schedule. You can select 1 or 2 subjects and 1 or 2 teachers.
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
          {/* Multi-Select Subject Dropdown with Checkboxes (Max 2) */}
          <div className="space-y-2 sm:col-span-1">
            <Label className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-1">
                <BookOpen className="h-3.5 w-3.5" /> Subjects *
              </span>
              <span className="text-[10px] text-muted-foreground font-mono">
                {selectedSubjects.length}/2
              </span>
            </Label>
            {subjectsQuery.isLoading ? (
              <Skeleton className="h-10 w-full rounded-xl" />
            ) : subjectsQuery.isError ? (
              <div className="rounded-xl border border-destructive p-2 text-xs text-destructive">
                Failed to load subjects
              </div>
            ) : subjects.length === 0 ? (
              <div className="rounded-xl border border-dashed p-2 text-xs text-muted-foreground">
                No subjects available.
              </div>
            ) : (
              <Popover open={subjectPopoverOpen} onOpenChange={setSubjectPopoverOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={subjectPopoverOpen}
                    className="w-full justify-between rounded-xl border text-left font-normal h-auto min-h-[42px] py-1.5 px-3"
                  >
                    <div className="flex flex-wrap gap-1 items-center max-w-[90%]">
                      {selectedSubjects.length === 0 ? (
                        <span className="text-muted-foreground text-xs">Select subjects (max 2)...</span>
                      ) : (
                        selectedSubjects.map((sId) => {
                          const subj = subjects.find((s) => s.subjectId === sId);
                          return (
                            <Badge
                              key={sId}
                              variant="secondary"
                              className="text-[11px] py-0.5 px-1.5 bg-emerald-100/80 text-emerald-900 border border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800"
                            >
                              {subj?.subjectName ?? "Subject"}
                            </Badge>
                          );
                        })
                      )}
                    </div>
                    <ChevronDown className="h-4 w-4 shrink-0 opacity-50 ml-1" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[280px] sm:w-[320px] p-2 rounded-xl shadow-xl z-50 bg-popover" align="start">
                  <div className="flex items-center justify-between px-2 py-1.5 mb-1 border-b text-[11px] font-medium text-muted-foreground">
                    <span>Select up to 2 subjects</span>
                    {selectedSubjects.length >= 2 && (
                      <span className="text-amber-600 dark:text-amber-400 font-semibold text-[10px]">
                        Max 2 reached
                      </span>
                    )}
                  </div>
                  <ScrollArea className="h-[220px] pr-1">
                    <div className="space-y-1">
                      {subjects.map((subject) => {
                        const isSelected = selectedSubjects.includes(subject.subjectId);
                        const isDisabled = !isSelected && selectedSubjects.length >= 2;

                        return (
                          <div
                            key={subject.subjectId}
                            onClick={() => {
                              if (!isDisabled) toggleSubject(subject.subjectId);
                            }}
                            className={cn(
                              "flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs transition-colors cursor-pointer select-none",
                              isSelected
                                ? "bg-emerald-50 text-emerald-900 font-medium dark:bg-emerald-950/40 dark:text-emerald-200"
                                : isDisabled
                                  ? "opacity-40 cursor-not-allowed text-muted-foreground bg-muted/20"
                                  : "hover:bg-slate-100 dark:hover:bg-muted/60",
                            )}
                          >
                            <Checkbox
                              checked={isSelected}
                              disabled={isDisabled}
                              onCheckedChange={() => {
                                if (!isDisabled) toggleSubject(subject.subjectId);
                              }}
                              className="h-4 w-4 rounded border-slate-300 data-[state=checked]:bg-emerald-600 data-[state=checked]:border-emerald-600"
                            />
                            <div className="flex-1 min-w-0">
                              <span className="truncate block font-medium">
                                {subject.subjectName}
                              </span>
                              {subject.book && (
                                <span className="truncate block text-[10px] text-muted-foreground">
                                  {subject.book}
                                </span>
                              )}
                            </div>
                            {isSelected && <Check className="h-3.5 w-3.5 text-emerald-600 shrink-0" />}
                          </div>
                        );
                      })}
                    </div>
                  </ScrollArea>
                </PopoverContent>
              </Popover>
            )}
          </div>

          {/* Multi-Select Teacher Dropdown with Checkboxes (Max 2, Active Only, No Workers) */}
          <div className="space-y-2 sm:col-span-1">
            <Label className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-1">
                <Users className="h-3.5 w-3.5" /> Teachers *
              </span>
              <span className="text-[10px] text-muted-foreground font-mono">
                {selectedEmployees.length}/2
              </span>
            </Label>
            {employeesQuery.isLoading ? (
              <Skeleton className="h-10 w-full rounded-xl" />
            ) : employeesQuery.isError ? (
              <div className="rounded-xl border border-destructive p-2 text-xs text-destructive">
                Failed to load teachers
              </div>
            ) : eligibleEmployees.length === 0 ? (
              <div className="rounded-xl border border-dashed p-2 text-xs text-muted-foreground">
                No active teachers available.
              </div>
            ) : (
              <Popover open={employeePopoverOpen} onOpenChange={setEmployeePopoverOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={employeePopoverOpen}
                    className="w-full justify-between rounded-xl border text-left font-normal h-auto min-h-[42px] py-1.5 px-3"
                  >
                    <div className="flex flex-wrap gap-1 items-center max-w-[90%]">
                      {selectedEmployees.length === 0 ? (
                        <span className="text-muted-foreground text-xs">Select teachers (max 2)...</span>
                      ) : (
                        selectedEmployees.map((eId) => {
                          const emp = eligibleEmployees.find((e) => e.employeeId === eId);
                          return (
                            <Badge
                              key={eId}
                              variant="secondary"
                              className="text-[11px] py-0.5 px-1.5 bg-blue-100/80 text-blue-900 border border-blue-300 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800"
                            >
                              {emp?.employeeName ?? "Teacher"}
                            </Badge>
                          );
                        })
                      )}
                    </div>
                    <ChevronDown className="h-4 w-4 shrink-0 opacity-50 ml-1" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[280px] sm:w-[320px] p-2 rounded-xl shadow-xl z-50 bg-popover" align="start">
                  <div className="flex items-center justify-between px-2 py-1.5 mb-1 border-b text-[11px] font-medium text-muted-foreground">
                    <span>Select up to 2 teachers</span>
                    {selectedEmployees.length >= 2 && (
                      <span className="text-amber-600 dark:text-amber-400 font-semibold text-[10px]">
                        Max 2 reached
                      </span>
                    )}
                  </div>
                  <ScrollArea className="h-[220px] pr-1">
                    <div className="space-y-1">
                      {eligibleEmployees.map((employee) => {
                        const isSelected = selectedEmployees.includes(employee.employeeId);
                        const isDisabled = !isSelected && selectedEmployees.length >= 2;

                        return (
                          <div
                            key={employee.employeeId}
                            onClick={() => {
                              if (!isDisabled) toggleEmployee(employee.employeeId);
                            }}
                            className={cn(
                              "flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs transition-colors cursor-pointer select-none",
                              isSelected
                                ? "bg-blue-50 text-blue-900 font-medium dark:bg-blue-950/40 dark:text-blue-200"
                                : isDisabled
                                  ? "opacity-40 cursor-not-allowed text-muted-foreground bg-muted/20"
                                  : "hover:bg-slate-100 dark:hover:bg-muted/60",
                            )}
                          >
                            <Checkbox
                              checked={isSelected}
                              disabled={isDisabled}
                              onCheckedChange={() => {
                                if (!isDisabled) toggleEmployee(employee.employeeId);
                              }}
                              className="h-4 w-4 rounded border-slate-300 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                            />
                            <div className="flex-1 min-w-0">
                              <span className="truncate block font-medium">
                                {employee.employeeName}
                              </span>
                              <span className="truncate block text-[10px] text-muted-foreground">
                                {employee.designation} {employee.education ? `• ${employee.education}` : ""}
                              </span>
                            </div>
                            {isSelected && <Check className="h-3.5 w-3.5 text-blue-600 shrink-0" />}
                          </div>
                        );
                      })}
                    </div>
                  </ScrollArea>
                </PopoverContent>
              </Popover>
            )}
          </div>
        </div>

        <footer className="mt-4 flex flex-col gap-2 sm:flex-row sm:gap-3">
          <Button
            variant="outline"
            onClick={() => {
              setSelectedSubjects([]);
              setSelectedEmployees([]);
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
              selectedSubjects.length === 0 ||
              selectedEmployees.length === 0 ||
              subjects.length === 0 ||
              eligibleEmployees.length === 0
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


