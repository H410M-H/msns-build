"use client";

import React, { useState, useMemo, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { ScrollArea, ScrollBar } from "~/components/ui/scroll-area";
import {
  Clock,
  User,
  X,
  GripVertical,
  Plus,
  CalendarSync,
  Copy,
  Layers,
  Trash2,
  CheckCircle2,
  Sparkles,
  ChevronDown,
  LayoutList,
  Grid3X3,
  BookOpen,
} from "lucide-react";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "~/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { toast } from "~/hooks/use-toast";

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

const isValidDayOfWeek = (
  day: string,
): day is DayOfWeek => {
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

const DAY_COLORS = [
  "bg-blue-50 hover:bg-blue-100 border-blue-200",
  "bg-green-50 hover:bg-green-100 border-green-200",
  "bg-yellow-50 hover:bg-yellow-100 border-yellow-200",
  "bg-purple-50 hover:bg-purple-100 border-purple-200",
  "bg-pink-50 hover:bg-pink-100 border-pink-200",
  "bg-indigo-50 hover:bg-indigo-100 border-indigo-200",
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
  const [layoutMode, setLayoutMode] = useState<"daily" | "weekly">("daily");
  const [draggedTeacher, setDraggedTeacher] = useState<DraggedTeacher | null>(
    null,
  );
  const [selectedSubject, setSelectedSubject] = useState<{
    subjectId: string;
    subjectName: string;
  } | null>(null);

  // Assignment dialog state
  const [assignmentDialogOpen, setAssignmentDialogOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<{
    dayOfWeek: DayOfWeek;
    lectureNumber: number;
    defaultApplyToAllDays?: boolean;
    startTime?: string;
    endTime?: string;
  } | null>(null);

  // Copy Day Dialog state
  const [copyDayDialogOpen, setCopyDayDialogOpen] = useState(false);
  const [sourceDay, setSourceDay] = useState<DayOfWeek>("Monday");
  const [targetDays, setTargetDays] = useState<DayOfWeek[]>([
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ]);

  // Clone Class Dialog state
  const [cloneDialogOpen, setCloneDialogOpen] = useState(false);
  const [sourceClassId, setSourceClassId] = useState<string>("");

  // Clear confirm state
  const [clearDialogOpen, setClearDialogOpen] = useState(false);
  const [clearTarget, setClearTarget] = useState<"all" | DayOfWeek>("all");

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

  const { data: allSubjects } = api.subject.getAllSubjects.useQuery(undefined, {
    enabled: true,
  });

  // Extract unique subjects from current class timetable
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

  // Mutations
  const assignTeacherMutation = api.timetable.assignTeacher.useMutation({
    onSuccess: () => void refetchTimetable(),
  });

  const assignTeacherBulkMutation = api.timetable.assignTeacherBulk.useMutation({
    onSuccess: () => void refetchTimetable(),
  });

  const removeTeacherMutation = api.timetable.removeTeacher.useMutation({
    onSuccess: () => void refetchTimetable(),
  });

  const removeTeacherBulkMutation = api.timetable.removeTeacherBulk.useMutation({
    onSuccess: () => void refetchTimetable(),
  });

  const copyDayMutation = api.timetable.copyDayToDays.useMutation({
    onSuccess: (data) => {
      toast({
        title: "✅ Schedule Synchronized",
        description: `Successfully copied ${sourceDay} schedule to ${targetDays.length} days (${data.count} slots created/updated).`,
      });
      void refetchTimetable();
      setCopyDayDialogOpen(false);
    },
    onError: (err) => {
      toast({
        title: "⚠ Copy Failed",
        description: err.message,
      });
    },
  });

  const copyClassMutation = api.timetable.copyClassTimetable.useMutation({
    onSuccess: (data) => {
      toast({
        title: "✅ Class Timetable Cloned",
        description: `Copied ${data.count} timetable entries to ${selectedClass?.grade} - ${selectedClass?.section}.`,
      });
      void refetchTimetable();
      setCloneDialogOpen(false);
    },
    onError: (err) => {
      toast({
        title: "⚠ Clone Failed",
        description: err.message,
      });
    },
  });

  const clearDayMutation = api.timetable.clearDay.useMutation({
    onSuccess: () => {
      toast({
        title: "🗑️ Day Schedule Cleared",
        description: `Timetable for ${clearTarget} has been reset.`,
      });
      void refetchTimetable();
      setClearDialogOpen(false);
    },
  });

  const clearClassMutation = api.timetable.clearClassTimetable.useMutation({
    onSuccess: () => {
      toast({
        title: "🗑️ Timetable Cleared",
        description: `All timetable slots for ${selectedClass?.grade} - ${selectedClass?.section} have been removed.`,
      });
      void refetchTimetable();
      setClearDialogOpen(false);
    },
  });

  // Map of day -> lectureNumber -> entry
  const timetableMap = useMemo(() => {
    const map: Record<string, Record<number, TimetableEntry>> = {};
    classTimetable?.forEach((entry) => {
      const typed = entry as TimetableEntry;
      (map[typed.dayOfWeek] ??= {})[typed.lectureNumber] = typed;
    });
    return map;
  }, [classTimetable]);

  // Master Daily Routine: represents the schedule for each lecture (using Monday as source of truth, or first available)
  const masterDailySchedule = useMemo(() => {
    return LECTURE_NUMBERS.map((lecture) => {
      const monEntry = timetableMap.Monday?.[lecture];
      if (monEntry) return { lecture, entry: monEntry, isConsistent: true };

      // Fallback check if any other day has it
      for (const day of DAYS_OF_WEEK) {
        const entry = timetableMap[day]?.[lecture];
        if (entry) return { lecture, entry, isConsistent: false };
      }
      return { lecture, entry: null, isConsistent: false };
    });
  }, [timetableMap]);

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

  // Drop handler for Daily Routine (Applies to all working days)
  const handleDailySlotDrop = async (
    lecture: number,
    e: React.DragEvent,
  ) => {
    e.preventDefault();

    if (!selectedSubject?.subjectId) {
      toast({
        title: "Subject Required",
        description: "Please select a subject from the list above before dragging a teacher.",
      });
      return;
    }

    if (!draggedTeacher || !selectedClass || !sessions?.[0]) return;

    const timeSlot = getTimeSlot(lecture);
    const startTime = timeSlot?.startTime ?? "08:00";
    const endTime = timeSlot?.endTime ?? "08:35";

    try {
      await assignTeacherBulkMutation.mutateAsync({
        classId: selectedClass.classId,
        employeeId: draggedTeacher.employeeId,
        subjectId: selectedSubject.subjectId,
        sessionId: sessions[0].sessionId,
        lectureNumber: lecture,
        startTime,
        endTime,
        days: DAYS_OF_WEEK,
      });

      toast({
        title: "⚡ Applied to All Days (Mon–Sat)",
        description: `Lecture ${lecture}: ${selectedSubject.subjectName} → ${draggedTeacher.employeeName}`,
      });

      if (
        !assignedSubjects.some(
          (sub) => sub.subjectId === selectedSubject.subjectId,
        )
      ) {
        setAssignedSubjects((prev) => [...prev, selectedSubject]);
      }
    } catch (err) {
      console.error("Assign error:", err);
      toast({
        title: "Assignment Error",
        description: err instanceof Error ? err.message : "Failed to assign teacher",
      });
    }

    setDraggedTeacher(null);
  };

  // Drop handler for specific day in Weekly Matrix
  const handleWeeklySlotDrop = async (
    day: string,
    lecture: number,
    e: React.DragEvent,
  ) => {
    e.preventDefault();

    if (!selectedSubject?.subjectId) {
      toast({
        title: "Subject Required",
        description: "Please select a subject from the list above first.",
      });
      return;
    }

    if (!draggedTeacher || !selectedClass || !sessions?.[0] || !isValidDayOfWeek(day))
      return;

    const timeSlot = getTimeSlot(lecture);
    const startTime = timeSlot?.startTime ?? "08:00";
    const endTime = timeSlot?.endTime ?? "08:35";

    try {
      await assignTeacherMutation.mutateAsync({
        classId: selectedClass.classId,
        employeeId: draggedTeacher.employeeId,
        subjectId: selectedSubject.subjectId,
        dayOfWeek: day,
        lectureNumber: lecture,
        sessionId: sessions[0].sessionId,
        startTime,
        endTime,
      });

      onAssignTeacher?.(
        `${day}-${lecture}`,
        draggedTeacher,
        selectedSubject.subjectName,
      );

      toast({
        title: "✅ Assigned Successfully",
        description: `${day} L${lecture}: ${selectedSubject.subjectName} → ${draggedTeacher.employeeName}`,
      });

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

  const handleRemoveSingleSlot = async (timetableId: string) => {
    try {
      await removeTeacherMutation.mutateAsync({ timetableId });
      onRemoveTeacher?.(timetableId);
      toast({
        title: "Slot Removed",
        description: "Lecture entry removed.",
      });
    } catch (err) {
      console.error("Remove error:", err);
    }
  };

  const handleRemoveLectureFromAllDays = async (lectureNumber: number) => {
    if (!selectedClass || !sessions?.[0]) return;
    try {
      await removeTeacherBulkMutation.mutateAsync({
        classId: selectedClass.classId,
        sessionId: sessions[0].sessionId,
        lectureNumber,
        days: DAYS_OF_WEEK,
      });
      toast({
        title: "🗑️ Lecture Cleared from All Days",
        description: `Lecture ${lectureNumber} removed from Monday through Saturday.`,
      });
      void refetchTimetable();
    } catch (err) {
      console.error("Remove bulk error:", err);
    }
  };

  const handleOpenAssignmentDialog = (
    day: DayOfWeek,
    lecture: number,
    defaultApplyToAll = true,
  ) => {
    const timeSlot = getTimeSlot(lecture);
    setSelectedSlot({
      dayOfWeek: day,
      lectureNumber: lecture,
      defaultApplyToAllDays: defaultApplyToAll,
      startTime: timeSlot?.startTime ?? "08:00",
      endTime: timeSlot?.endTime ?? "08:35",
    });
    setAssignmentDialogOpen(true);
  };

  const handleQuickApplyMonToAll = async () => {
    if (!selectedClass || !sessions?.[0]) return;
    const monEntries = timetableMap.Monday;
    if (!monEntries || Object.keys(monEntries).length === 0) {
      toast({
        title: "No Monday Schedule",
        description: "Please configure at least one period on Monday before syncing across days.",
      });
      return;
    }

    try {
      await copyDayMutation.mutateAsync({
        classId: selectedClass.classId,
        sessionId: sessions[0].sessionId,
        sourceDay: "Monday",
        targetDays: ["Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleExecuteCopyDay = async () => {
    if (!selectedClass || !sessions?.[0]) return;
    if (targetDays.length === 0) {
      toast({
        title: "Select Target Days",
        description: "Please check at least one target day to copy to.",
      });
      return;
    }
    await copyDayMutation.mutateAsync({
      classId: selectedClass.classId,
      sessionId: sessions[0].sessionId,
      sourceDay,
      targetDays,
    });
  };

  const handleExecuteCloneClass = async () => {
    if (!selectedClass || !sessions?.[0] || !sourceClassId) return;
    await copyClassMutation.mutateAsync({
      sourceClassId,
      targetClassId: selectedClass.classId,
      sessionId: sessions[0].sessionId,
    });
  };

  const handleExecuteClear = async () => {
    if (!selectedClass || !sessions?.[0]) return;
    if (clearTarget === "all") {
      await clearClassMutation.mutateAsync({
        classId: selectedClass.classId,
        sessionId: sessions[0].sessionId,
      });
    } else {
      await clearDayMutation.mutateAsync({
        classId: selectedClass.classId,
        sessionId: sessions[0].sessionId,
        dayOfWeek: clearTarget,
      });
    }
  };

  const isAnyMutating =
    assignTeacherMutation.isPending ||
    assignTeacherBulkMutation.isPending ||
    copyDayMutation.isPending ||
    copyClassMutation.isPending ||
    removeTeacherMutation.isPending ||
    removeTeacherBulkMutation.isPending ||
    clearClassMutation.isPending ||
    clearDayMutation.isPending;

  return (
    <div className="space-y-5">
      {/* 1. Class & Subject Selection Card */}
      <Card className="border border-slate-200 bg-white/70 shadow-sm backdrop-blur dark:border-border dark:bg-card">
        <CardHeader className="bg-slate-50/70 p-3 sm:p-4 dark:bg-muted/20">
          <CardTitle className="flex items-center gap-2 text-sm font-semibold text-slate-800 dark:text-foreground sm:text-base">
            <Clock className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            1. Select Class & Active Subject
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 p-3 sm:p-4">
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Classes ({classes.length})
            </label>
            <ScrollArea className="w-full whitespace-nowrap rounded-xl border border-slate-200/80 bg-slate-50/50 p-1 dark:border-border dark:bg-card">
              <div className="flex gap-1.5 p-1">
                {classes.map((cls) => {
                  const isSelected = selectedClass?.classId === cls.classId;
                  return (
                    <Button
                      key={cls.classId}
                      size="sm"
                      variant={isSelected ? "default" : "outline"}
                      onClick={() => {
                        setSelectedClass(cls);
                        setSelectedSubject(null);
                      }}
                      className={cn(
                        "flex-shrink-0 text-xs font-medium rounded-lg transition-all",
                        isSelected
                          ? "bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm"
                          : "hover:bg-slate-100 dark:hover:bg-muted/50",
                      )}
                    >
                      {cls.grade} - {cls.section}
                    </Button>
                  );
                })}
              </div>
              <ScrollBar orientation="horizontal" />
            </ScrollArea>
          </div>

          {selectedClass && (
            <div>
              <label className="mb-1.5 flex items-center justify-between text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                <span>Subject for drag-and-drop:</span>
                {selectedSubject ? (
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold lowercase">
                    active: {selectedSubject.subjectName}
                  </span>
                ) : (
                  <span className="text-amber-600 dark:text-amber-400">
                    select a subject below
                  </span>
                )}
              </label>
              <ScrollArea className="w-full whitespace-nowrap rounded-xl border border-slate-200/80 bg-slate-50/50 p-1 dark:border-border dark:bg-card">
                <div className="flex gap-1.5 p-1">
                  {(allSubjects && allSubjects.length > 0
                    ? allSubjects
                    : assignedSubjects
                  ).map((subject) => {
                    const isSelected =
                      selectedSubject?.subjectId === subject.subjectId;
                    return (
                      <Button
                        key={subject.subjectId}
                        size="sm"
                        variant={isSelected ? "default" : "outline"}
                        onClick={() => setSelectedSubject(subject)}
                        className={cn(
                          "flex-shrink-0 text-xs rounded-lg transition-all",
                          isSelected
                            ? "bg-slate-900 text-white hover:bg-slate-800 dark:bg-emerald-600 dark:hover:bg-emerald-700 shadow-sm"
                            : "hover:bg-slate-100 dark:hover:bg-muted/50",
                        )}
                      >
                        <BookOpen className="mr-1.5 h-3 w-3 opacity-70" />
                        {subject.subjectName}
                      </Button>
                    );
                  })}
                </div>
                <ScrollBar orientation="horizontal" />
              </ScrollArea>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 2. Teachers Draggable List */}
      <Card className="border border-slate-200 bg-white/70 shadow-sm backdrop-blur dark:border-border dark:bg-card">
        <CardHeader className="bg-slate-50/70 p-3 sm:p-4 dark:bg-muted/20">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-sm font-semibold text-slate-800 dark:text-foreground sm:text-base">
              <User className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              2. Available Teachers
              <Badge variant="secondary" className="ml-1 text-[11px]">
                {teachers.length}
              </Badge>
            </CardTitle>
            <span className="text-[11px] text-muted-foreground hidden sm:inline">
              Drag a teacher badge onto any lecture period below
            </span>
          </div>
        </CardHeader>
        <CardContent className="p-3 sm:p-4">
          <ScrollArea className="w-full whitespace-nowrap">
            <div className="flex gap-2 p-1">
              {teachers.map((teacher) => (
                <Tooltip key={teacher.employeeId}>
                  <TooltipTrigger asChild>
                    <div
                      draggable
                      onDragStart={(e) => handleTeacherDragStart(teacher, e)}
                      className={cn(
                        "cursor-grab rounded-xl border border-slate-200 bg-white p-2 text-left transition-all duration-200 hover:border-emerald-500 hover:bg-emerald-50/30 hover:shadow-md active:cursor-grabbing dark:border-border dark:bg-card",
                        "flex min-w-[130px] items-center gap-2",
                        draggedTeacher?.employeeId === teacher.employeeId &&
                          "scale-105 border-emerald-600 bg-emerald-100/50 ring-2 ring-emerald-500",
                      )}
                    >
                      <GripVertical className="h-4 w-4 flex-shrink-0 text-muted-foreground opacity-50" />
                      <div className="min-w-0">
                        <p className="truncate text-xs font-semibold text-slate-900 dark:text-foreground">
                          {teacher.employeeName}
                        </p>
                        <Badge
                          variant="secondary"
                          className="mt-0.5 max-w-[100px] truncate text-[9px] font-normal"
                        >
                          {teacher.designation}
                        </Badge>
                      </div>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    Drag to assign {teacher.employeeName} ({teacher.designation})
                  </TooltipContent>
                </Tooltip>
              ))}
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </CardContent>
      </Card>

      {/* 3. Timetable Board with Improvisation Toolbar */}
      <Card className="border border-slate-200 bg-white shadow-md dark:border-border dark:bg-card">
        {/* Header & Improvised Action Toolbar */}
        <CardHeader className="border-b border-slate-200/80 bg-slate-50/60 p-4 dark:border-border dark:bg-muted/10">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <CardTitle className="text-base font-bold text-slate-900 dark:text-foreground sm:text-lg">
                  {selectedClass
                    ? `${selectedClass.grade} - ${selectedClass.section} Timetable`
                    : "Select a Class"}
                </CardTitle>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                {layoutMode === "daily"
                  ? "⚡ Master Daily Routine Mode: Setting a lecture applies to all 6 working days (Mon–Sat)."
                  : "📅 Weekly Grid Mode: Full 6-day matrix view with per-day customization."}
              </p>
            </div>

            {/* Toolbar Buttons */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Layout Mode Switch */}
              <div className="flex items-center rounded-xl border border-slate-200 bg-slate-100 p-1 dark:border-border dark:bg-muted/40">
                <Button
                  size="sm"
                  variant={layoutMode === "daily" ? "default" : "ghost"}
                  onClick={() => setLayoutMode("daily")}
                  className={cn(
                    "h-7 text-xs font-semibold gap-1.5 rounded-lg px-2.5",
                    layoutMode === "daily"
                      ? "bg-white text-emerald-700 shadow-sm dark:bg-emerald-600 dark:text-white"
                      : "text-muted-foreground",
                  )}
                >
                  <LayoutList className="h-3.5 w-3.5" />
                  Daily Routine (All Days)
                </Button>
                <Button
                  size="sm"
                  variant={layoutMode === "weekly" ? "default" : "ghost"}
                  onClick={() => setLayoutMode("weekly")}
                  className={cn(
                    "h-7 text-xs font-semibold gap-1.5 rounded-lg px-2.5",
                    layoutMode === "weekly"
                      ? "bg-white text-emerald-700 shadow-sm dark:bg-emerald-600 dark:text-white"
                      : "text-muted-foreground",
                  )}
                >
                  <Grid3X3 className="h-3.5 w-3.5" />
                  Weekly Matrix
                </Button>
              </div>

              {/* Quick 1-Click Sync Button */}
              <Button
                size="sm"
                onClick={handleQuickApplyMonToAll}
                disabled={isAnyMutating}
                className="h-8 gap-1.5 bg-emerald-600 text-xs font-medium text-white hover:bg-emerald-700 shadow-sm rounded-xl"
              >
                <CalendarSync className="h-3.5 w-3.5" />
                Apply Mon to All Days
              </Button>

              {/* Advanced Actions Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 gap-1 text-xs rounded-xl"
                  >
                    <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                    Tools & Sync
                    <ChevronDown className="h-3 w-3 opacity-50" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 rounded-xl">
                  <DropdownMenuItem
                    onClick={() => setCopyDayDialogOpen(true)}
                    className="gap-2 text-xs cursor-pointer"
                  >
                    <Copy className="h-4 w-4 text-blue-500" />
                    Copy Day Schedule to...
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => setCloneDialogOpen(true)}
                    className="gap-2 text-xs cursor-pointer"
                  >
                    <Layers className="h-4 w-4 text-purple-500" />
                    Clone from Another Class...
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => {
                      setClearTarget("all");
                      setClearDialogOpen(true);
                    }}
                    className="gap-2 text-xs text-destructive cursor-pointer"
                  >
                    <Trash2 className="h-4 w-4" />
                    Clear Entire Class Timetable
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardHeader>

        {/* Content Section */}
        <CardContent className="p-4 sm:p-6">
          {/* ============================================================ */}
          {/* MODE A: DAILY MASTER ROUTINE VIEW (Same for All Days) */}
          {/* ============================================================ */}
          {layoutMode === "daily" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50/70 px-4 py-2.5 text-xs text-emerald-900 dark:border-emerald-800/40 dark:bg-emerald-950/20 dark:text-emerald-300">
                <div className="flex items-center gap-2 font-medium">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                  <span>
                    <strong>Standard Daily Routine Active:</strong> Changes made here immediately update Monday through Saturday.
                  </span>
                </div>
                <Badge variant="outline" className="border-emerald-400 text-emerald-700 dark:text-emerald-300 bg-white/80 dark:bg-emerald-900/30 text-[10px]">
                  Mon – Sat (6 Days Sync)
                </Badge>
              </div>

              {/* Lecture Timeline List */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {masterDailySchedule.map(({ lecture, entry }) => {
                  const timeSlot = getTimeSlot(lecture);
                  const isAssigned = !!entry;

                  return (
                    <div
                      key={lecture}
                      onDragOver={handleSlotDragOver}
                      onDrop={(e) => handleDailySlotDrop(lecture, e)}
                      className={cn(
                        "group relative rounded-2xl border p-4 transition-all duration-200 flex flex-col justify-between",
                        isAssigned
                          ? "border-slate-200 bg-slate-50/50 hover:bg-slate-100/70 hover:shadow-md dark:border-border dark:bg-card"
                          : "border-dashed border-slate-300 bg-white hover:border-emerald-500 hover:bg-emerald-50/20 dark:border-border/60 dark:bg-card/50",
                        draggedTeacher && !isAssigned && "border-emerald-500 bg-emerald-50/40 ring-2 ring-emerald-400",
                      )}
                    >
                      {/* Period Header */}
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-600 text-xs font-bold text-white shadow-sm">
                            L{lecture}
                          </span>
                          <div>
                            <span className="text-xs font-semibold text-slate-900 dark:text-foreground">
                              Lecture {lecture}
                            </span>
                            {timeSlot && (
                              <p className="text-[11px] text-muted-foreground">
                                {timeSlot.startTime} – {timeSlot.endTime}
                              </p>
                            )}
                          </div>
                        </div>

                        {isAssigned && (
                          <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100">
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
                              onClick={() =>
                                handleOpenAssignmentDialog("Monday", lecture, true)
                              }
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-6 w-6 p-0 text-destructive hover:bg-destructive/10"
                              onClick={() =>
                                handleRemoveLectureFromAllDays(lecture)
                              }
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        )}
                      </div>

                      {/* Content Body */}
                      {isAssigned ? (
                        <div className="space-y-2 mt-1">
                          <div className="rounded-xl border border-slate-200/80 bg-white p-2.5 shadow-sm dark:border-border dark:bg-card">
                            <div className="flex items-center justify-between">
                              <Badge
                                variant="outline"
                                className="bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-950/30 dark:border-emerald-800 dark:text-emerald-300 text-xs font-semibold"
                              >
                                {entry.Subject.subjectName}
                              </Badge>
                              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                                Mon – Sat
                              </span>
                            </div>
                            <div className="mt-2 flex items-center gap-2">
                              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 text-slate-700 dark:bg-muted dark:text-foreground text-[10px] font-bold">
                                {entry.Employees.employeeName.charAt(0)}
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="truncate text-xs font-semibold text-slate-900 dark:text-foreground">
                                  {entry.Employees.employeeName}
                                </p>
                                <p className="truncate text-[10px] text-muted-foreground">
                                  {entry.Employees.designation}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="my-2 flex flex-col items-center justify-center py-3 text-center">
                          <p className="text-xs text-muted-foreground">
                            {selectedSubject
                              ? "Drop teacher here or"
                              : "Select subject above or"}
                          </p>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              handleOpenAssignmentDialog("Monday", lecture, true)
                            }
                            className="mt-2 h-7 gap-1 rounded-lg text-xs font-medium border-dashed"
                          >
                            <Plus className="h-3 w-3" />
                            Assign Period
                          </Button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ============================================================ */}
          {/* MODE B: WEEKLY FULL MATRIX VIEW (Mon - Sat) */}
          {/* ============================================================ */}
          {layoutMode === "weekly" && (
            <div className="overflow-x-auto">
              <div className="grid min-w-[750px] grid-cols-7 gap-1.5 sm:gap-2">
                {/* Header Row */}
                <div className="rounded-xl bg-slate-900 p-2.5 text-center text-xs font-bold text-white shadow dark:bg-slate-800">
                  Time / Period
                </div>
                {DAYS_OF_WEEK.map((day, index) => (
                  <div
                    key={day}
                    className={cn(
                      "group relative rounded-xl p-2.5 text-center text-xs font-bold text-slate-800 shadow dark:text-foreground",
                      DAY_COLORS[index % DAY_COLORS.length],
                    )}
                  >
                    <span>{day}</span>
                  </div>
                ))}

                {/* Rows per Lecture */}
                {LECTURE_NUMBERS.map((lecture) => {
                  const timeSlot = getTimeSlot(lecture);

                  return (
                    <React.Fragment key={lecture}>
                      {/* Lecture Time Column */}
                      <div className="rounded-xl bg-slate-100 p-2 text-center shadow-sm dark:bg-muted/40 flex flex-col justify-center">
                        <div className="text-xs font-bold text-slate-900 dark:text-foreground">
                          L{lecture}
                        </div>
                        {timeSlot && (
                          <div className="text-[10px] text-muted-foreground">
                            {timeSlot.startTime}
                          </div>
                        )}
                      </div>

                      {/* Day Columns */}
                      {DAYS_OF_WEEK.map((day, dayIndex) => {
                        const slot = getSlotForPosition(day, lecture);

                        return (
                          <Tooltip key={`${day}-${lecture}`}>
                            <TooltipTrigger asChild>
                              <div
                                onDragOver={handleSlotDragOver}
                                onDrop={(e) =>
                                  handleWeeklySlotDrop(day, lecture, e)
                                }
                                className={cn(
                                  "group relative min-h-[75px] rounded-xl border p-2 text-xs shadow-sm transition-all duration-200",
                                  !slot
                                    ? "border-dashed border-slate-200 bg-white hover:bg-slate-50 dark:border-border dark:bg-card"
                                    : cn(
                                        "border-solid bg-white dark:bg-card",
                                        DAY_COLORS[
                                          dayIndex % DAY_COLORS.length
                                        ],
                                      ),
                                  draggedTeacher &&
                                    !slot &&
                                    "scale-105 border-emerald-500 bg-emerald-50/40",
                                )}
                              >
                                {slot ? (
                                  <div className="space-y-1">
                                    <div className="flex items-start justify-between gap-1">
                                      <p className="truncate text-xs font-semibold text-slate-900 dark:text-foreground">
                                        {slot.Employees.employeeName}
                                      </p>
                                      <Button
                                        size="sm"
                                        variant="ghost"
                                        className="h-4 w-4 p-0 opacity-0 group-hover:opacity-100 text-destructive hover:bg-destructive/20"
                                        onClick={() =>
                                          handleRemoveSingleSlot(slot.timetableId)
                                        }
                                      >
                                        <X className="h-3 w-3" />
                                      </Button>
                                    </div>
                                    <Badge
                                      variant="secondary"
                                      className="truncate max-w-full text-[10px] font-normal"
                                    >
                                      {slot.Subject.subjectName}
                                    </Badge>
                                  </div>
                                ) : (
                                  <div className="flex h-full flex-col items-center justify-center opacity-60 group-hover:opacity-100">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-6 w-6 p-0 hover:bg-emerald-50 dark:hover:bg-emerald-950/40"
                                      onClick={() =>
                                        handleOpenAssignmentDialog(
                                          day,
                                          lecture,
                                          false,
                                        )
                                      }
                                    >
                                      <Plus className="h-3.5 w-3.5 text-muted-foreground hover:text-emerald-600" />
                                    </Button>
                                  </div>
                                )}
                              </div>
                            </TooltipTrigger>
                            <TooltipContent>
                              {slot
                                ? `${day} L${lecture}: ${slot.Subject.subjectName} with ${slot.Employees.employeeName}`
                                : `${day} L${lecture}: Click + or drop teacher`}
                            </TooltipContent>
                          </Tooltip>
                        );
                      })}
                    </React.Fragment>
                  );
                })}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ============================================================ */}
      {/* 4. MODALS & DIALOGS */}
      {/* ============================================================ */}

      {/* A. Subject Assignment Dialog */}
      {selectedClass && selectedSlot && sessions?.[0] && (
        <SubjectAssignmentDialog
          classId={selectedClass.classId}
          dayOfWeek={selectedSlot.dayOfWeek}
          lectureNumber={selectedSlot.lectureNumber}
          sessionId={sessions[0].sessionId}
          open={assignmentDialogOpen}
          onOpenChange={setAssignmentDialogOpen}
          onAssigned={() => {
            void refetchTimetable();
            setAssignmentDialogOpen(false);
          }}
          defaultApplyToAllDays={selectedSlot.defaultApplyToAllDays ?? true}
          startTime={selectedSlot.startTime}
          endTime={selectedSlot.endTime}
        />
      )}

      {/* B. Copy Day Schedule Dialog */}
      <Dialog open={copyDayDialogOpen} onOpenChange={setCopyDayDialogOpen}>
        <DialogContent className="rounded-2xl sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base">
              <Copy className="h-4 w-4 text-emerald-600" />
              Copy Day Schedule
            </DialogTitle>
            <DialogDescription className="text-xs">
              Replicate a single day&apos;s routine to other days in {selectedClass?.grade} - {selectedClass?.section}.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div>
              <label className="text-xs font-semibold text-muted-foreground">
                Source Day
              </label>
              <Select
                value={sourceDay}
                onValueChange={(val) => setSourceDay(val as DayOfWeek)}
              >
                <SelectTrigger className="mt-1 rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DAYS_OF_WEEK.map((day) => (
                    <SelectItem key={day} value={day}>
                      {day}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-xs font-semibold text-muted-foreground">
                Target Days to Overwrite
              </label>
              <div className="mt-2 grid grid-cols-2 gap-2">
                {DAYS_OF_WEEK.filter((d) => d !== sourceDay).map((day) => {
                  const isChecked = targetDays.includes(day);
                  return (
                    <label
                      key={day}
                      className={cn(
                        "flex items-center gap-2 rounded-xl border p-2.5 text-xs font-medium cursor-pointer transition-all",
                        isChecked
                          ? "border-emerald-500 bg-emerald-50 text-emerald-900 dark:border-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-200"
                          : "border-slate-200 bg-white hover:bg-slate-50 dark:border-border dark:bg-card",
                      )}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setTargetDays([...targetDays, day]);
                          } else {
                            setTargetDays(targetDays.filter((d) => d !== day));
                          }
                        }}
                        className="rounded border-emerald-300 text-emerald-600 focus:ring-emerald-500"
                      />
                      {day}
                    </label>
                  );
                })}
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setCopyDayDialogOpen(false)}
              className="rounded-xl text-xs"
            >
              Cancel
            </Button>
            <Button
              onClick={handleExecuteCopyDay}
              disabled={copyDayMutation.isPending || targetDays.length === 0}
              className="rounded-xl bg-emerald-600 text-xs text-white hover:bg-emerald-700"
            >
              {copyDayMutation.isPending ? "Copying..." : "Copy Schedule"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* C. Clone Class Timetable Dialog */}
      <Dialog open={cloneDialogOpen} onOpenChange={setCloneDialogOpen}>
        <DialogContent className="rounded-2xl sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base">
              <Layers className="h-4 w-4 text-purple-600" />
              Clone Timetable from Another Class
            </DialogTitle>
            <DialogDescription className="text-xs">
              Copy the full weekly timetable from another class section to{" "}
              <strong>
                {selectedClass?.grade} - {selectedClass?.section}
              </strong>
              .
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div>
              <label className="text-xs font-semibold text-muted-foreground">
                Source Class
              </label>
              <Select
                value={sourceClassId}
                onValueChange={setSourceClassId}
              >
                <SelectTrigger className="mt-1 rounded-xl">
                  <SelectValue placeholder="Select class to clone from" />
                </SelectTrigger>
                <SelectContent>
                  {classes
                    .filter((c) => c.classId !== selectedClass?.classId)
                    .map((c) => (
                      <SelectItem key={c.classId} value={c.classId}>
                        {c.grade} - {c.section}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            <p className="text-[11px] text-amber-600 dark:text-amber-400">
              ⚠ This will overwrite any existing timetable entries for{" "}
              {selectedClass?.grade} - {selectedClass?.section}.
            </p>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setCloneDialogOpen(false)}
              className="rounded-xl text-xs"
            >
              Cancel
            </Button>
            <Button
              onClick={handleExecuteCloneClass}
              disabled={copyClassMutation.isPending || !sourceClassId}
              className="rounded-xl bg-purple-600 text-xs text-white hover:bg-purple-700"
            >
              {copyClassMutation.isPending ? "Cloning..." : "Clone Timetable"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* D. Clear Confirmation Dialog */}
      <Dialog open={clearDialogOpen} onOpenChange={setClearDialogOpen}>
        <DialogContent className="rounded-2xl sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base text-destructive">
              <Trash2 className="h-4 w-4" />
              Confirm Reset Timetable
            </DialogTitle>
            <DialogDescription className="text-xs">
              Are you sure you want to clear all timetable entries for{" "}
              <strong>
                {selectedClass?.grade} - {selectedClass?.section}
              </strong>
              ? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setClearDialogOpen(false)}
              className="rounded-xl text-xs"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleExecuteClear}
              disabled={
                clearClassMutation.isPending || clearDayMutation.isPending
              }
              className="rounded-xl text-xs"
            >
              {clearClassMutation.isPending ? "Clearing..." : "Yes, Clear All"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

