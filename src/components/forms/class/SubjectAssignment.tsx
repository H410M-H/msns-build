"use client";

import { useState } from "react";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { BookOpen, UserCheck } from "lucide-react";
import type { Teacher, ClassSubjectAssignment } from "~/lib/timetable-types";

type ApiClassSubjectAssignment = Omit<ClassSubjectAssignment, "Sessions"> & {
  Sessions: {
    sessionId: string;
    sessionName: string;
  };
};

type Weekday =
  | "Monday"
  | "Tuesday"
  | "Wednesday"
  | "Thursday"
  | "Friday"
  | "Saturday";

type SubjectAssignmentDialogProps = {
  classId: string;
  dayOfWeek: Weekday;
  lectureNumber: number;
  sessionId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAssigned?: () => void;
};

export function SubjectAssignmentDialog({
  classId,
  dayOfWeek,
  lectureNumber,
  sessionId,
  open,
  onOpenChange,
  onAssigned,
}: SubjectAssignmentDialogProps) {
  const [selectedSubject, setSelectedSubject] = useState<string>("");
  const [selectedTeacher, setSelectedTeacher] = useState<string>("");

  const utils = api.useUtils();

  const subjectsQuery = api.subject.getSubjectsByClass.useQuery(
    { classId, sessionId },
    { enabled: open && !!classId && !!sessionId }
  );

  const teachersQuery = api.employee.getEmployeesByDesignation.useQuery(
    { designation: "TEACHER" },
    { enabled: open }
  );

  const subjects: ApiClassSubjectAssignment[] = subjectsQuery.data ?? [];
  const teachers: Teacher[] = teachersQuery.data ?? [];

  const assignToSlot = api.timetable.assignTeacher.useMutation();

  const handleAssign = async () => {
    if (!selectedSubject || !selectedTeacher) {
      toast({
        title: "Validation Error",
        description: "Please select both a subject and a teacher",
      });
      return;
    }

    try {
      await assignToSlot.mutateAsync({
        classId,
        dayOfWeek,
        lectureNumber,
        subjectId: selectedSubject,
        employeeId: selectedTeacher,
        sessionId,
        startTime: "09:00",
        endTime: "10:00",
      });

      toast({
        title: "✅ Assigned Successfully",
        description: `${subjects.find(s => s.subjectId === selectedSubject)?.Subject.subjectName} → ${teachers.find(t => t.employeeId === selectedTeacher)?.employeeName}`,
      });

      setSelectedSubject("");
      setSelectedTeacher("");
      await utils.timetable.getTimetable.invalidate();
      onOpenChange(false);
      onAssigned?.();
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to assign";
      toast({
        title: "⚠ Error",
        description: errorMessage,
      });
    }
  };

  const dayNames: Record<Weekday, string> = {
    Monday: "Monday",
    Tuesday: "Tuesday",
    Wednesday: "Wednesday",
    Thursday: "Thursday",
    Friday: "Friday",
    Saturday: "Saturday",
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="hover:scale-[1.03] transition-all w-full sm:w-auto"
        >
          <UserCheck className="mr-1 h-4 w-4" /> Assign
        </Button>
      </DialogTrigger>

      <DialogContent className="w-[95%] sm:max-w-md rounded-2xl p-2 sm:p-4">
        <DialogHeader>
          <DialogTitle className="text-lg text-center sm:text-left">
            Assign Subject & Teacher
          </DialogTitle>
        </DialogHeader>

        <section className="p-3 sm:p-4 bg-muted/40 rounded-xl text-center font-medium">
          📅 {dayNames[dayOfWeek]} — 🎓 Lecture {lectureNumber}
        </section>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
          <div className="space-y-2 sm:col-span-1">
            <Label className="flex items-center gap-1">
              <BookOpen className="h-4 w-4" /> Subject *
            </Label>
            {subjectsQuery.isLoading ? (
              <Skeleton className="h-10 w-full rounded-xl" />
            ) : (
              <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                <SelectTrigger className="rounded-xl">
                  <SelectValue placeholder="Select subject" />
                </SelectTrigger>
                <SelectContent>
                  {subjects.map((s) => (
                    <SelectItem key={s.subjectId} value={s.subjectId}>
                      {s.Subject.subjectName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          <div className="space-y-2 sm:col-span-1">
            <Label className="flex items-center gap-1">
              <UserCheck className="h-4 w-4" /> Teacher *
            </Label>
            {teachersQuery.isLoading ? (
              <Skeleton className="h-10 w-full rounded-xl" />
            ) : (
              <Select value={selectedTeacher} onValueChange={setSelectedTeacher}>
                <SelectTrigger className="rounded-xl">
                  <SelectValue placeholder="Select teacher" />
                </SelectTrigger>
                <SelectContent>
                  {teachers.map((t) => (
                    <SelectItem key={t.employeeId} value={t.employeeId}>
                      {t.employeeName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        </div>

        <footer className="flex flex-col sm:flex-row gap-2 sm:gap-3 mt-6 px-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="w-full sm:w-1/2 rounded-xl hover:bg-red-50"
          >
            ✖ Cancel
          </Button>

          <Button
            onClick={handleAssign}
            disabled={assignToSlot.isPending || !selectedSubject || !selectedTeacher}
            className="w-full sm:w-1/2 rounded-xl hover:opacity-90 transition-all"
          >
            {assignToSlot.isPending ? (
              <span className="flex items-center justify-center">
                <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />
                Assigning…
              </span>
            ) : (
              "✅ Assign Slot"
            )}
          </Button>
        </footer>
      </DialogContent>
    </Dialog>
  );
}
