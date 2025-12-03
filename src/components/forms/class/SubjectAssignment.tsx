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
import { BookOpen, Users } from "lucide-react";
import type { DayOfWeek } from "@prisma/client";

// Removed local Weekday type to use DayOfWeek from Prisma source of truth

type SubjectAssignmentDialogProps = {
  classId: string;
  dayOfWeek: DayOfWeek; // Updated to use DayOfWeek
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
  const [selectedEmployee, setSelectedEmployee] = useState<string>("");
  const [validLectureNumber, setValidLectureNumber] = useState<number>(1);

  const utils = api.useUtils();

  // Validate and ensure lectureNumber is at least 1
  useEffect(() => {
    if (lectureNumber >= 1) {
      setValidLectureNumber(lectureNumber);
    } else {
      console.warn(`Invalid lectureNumber: ${lectureNumber}. Using default value 1.`);
      setValidLectureNumber(1);
    }
  }, [lectureNumber]);

  // Get ALL subjects
  const subjectsQuery = api.subject.getAllSubjects.useQuery(
    undefined,
    { 
      enabled: open,
      refetchOnWindowFocus: false
    }
  );

  // Get ALL employees
  const employeesQuery = api.employee.getEmployees.useQuery(
    undefined,
    { 
      enabled: open,
      refetchOnWindowFocus: false
    }
  );

  const subjects = subjectsQuery.data ?? [];
  const employees = employeesQuery.data ?? [];

  const assignToSlot = api.timetable.assignTeacher.useMutation({
    onSuccess: () => {
      const subjectName = subjects.find(s => s.subjectId === selectedSubject)?.subjectName ?? "Subject";
      const employeeName = employees.find(e => e.employeeId === selectedEmployee)?.employeeName ?? "Employee";

      toast({
        title: "✅ Assigned Successfully",
        description: `${subjectName} → ${employeeName}`,
      });

      setSelectedSubject("");
      setSelectedEmployee("");
      void utils.timetable.getTimetable.invalidate();
      onOpenChange(false);
      onAssigned?.();
    },
    onError: (error) => {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to assign";
      toast({
        title: "⚠ Error",
        description: errorMessage,
      });
    }
  });

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

    // Final validation to ensure lectureNumber is valid
    const finalLectureNumber = validLectureNumber >= 1 ? validLectureNumber : 1;

    try {
      await assignToSlot.mutateAsync({
        classId,
        dayOfWeek,
        lectureNumber: finalLectureNumber, // Use the validated lecture number
        subjectId: selectedSubject,
        employeeId: selectedEmployee,
        sessionId,
        startTime: "09:00",
        endTime: "10:00",
      });
    } catch (error) {
      // Error is handled in the mutation onError
      console.error("Assignment error:", error);
    }
  };

  const dayNames: Record<DayOfWeek, string> = {
    Monday: "Monday",
    Tuesday: "Tuesday",
    Wednesday: "Wednesday",
    Thursday: "Thursday",
    Friday: "Friday",
    Saturday: "Saturday",
    Sunday: "Sunday",};

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="hover:scale-[1.03] transition-all w-full sm:w-auto"
        >
          <Users className="mr-1 h-4 w-4" /> Assign
        </Button>
      </DialogTrigger>

      <DialogContent className="w-[95%] sm:max-w-md rounded-2xl p-2 sm:p-4">
        <DialogHeader>
          <DialogTitle className="text-lg text-center sm:text-left">
            Assign Subject & Employee
          </DialogTitle>
          <DialogDescription className="sr-only">
            Assign a subject and employee to this class slot
          </DialogDescription>
        </DialogHeader>

        <section className="p-3 sm:p-4 bg-muted/40 rounded-xl text-center font-medium">
          📅 {dayNames[dayOfWeek]} — 🎓 Lecture {validLectureNumber}
          {lectureNumber !== validLectureNumber && (
            <div className="text-xs text-yellow-600 mt-1">
              (Adjusted from {lectureNumber})
            </div>
          )}
        </section>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
          <div className="space-y-2 sm:col-span-1">
            <Label className="flex items-center gap-1">
              <BookOpen className="h-4 w-4" /> Subject *
            </Label>
            {subjectsQuery.isLoading ? (
              <Skeleton className="h-10 w-full rounded-xl" />
            ) : subjectsQuery.isError ? (
              <div className="text-sm text-destructive p-2 border border-destructive rounded-xl">
                Failed to load subjects
              </div>
            ) : subjects.length === 0 ? (
              <div className="text-sm text-muted-foreground p-2 border border-dashed rounded-xl">
                No subjects available. Create subjects first.
              </div>
            ) : (
              <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                <SelectTrigger className="rounded-xl">
                  <SelectValue placeholder="Select subject" />
                </SelectTrigger>
                <SelectContent>
                  {subjects.map((subject) => (
                    <SelectItem key={subject.subjectId} value={subject.subjectId}>
                      {subject.subjectName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          <div className="space-y-2 sm:col-span-1">
            <Label className="flex items-center gap-1">
              <Users className="h-4 w-4" /> Employee *
            </Label>
            {employeesQuery.isLoading ? (
              <Skeleton className="h-10 w-full rounded-xl" />
            ) : employeesQuery.isError ? (
              <div className="text-sm text-destructive p-2 border border-destructive rounded-xl">
                Failed to load employees
              </div>
            ) : employees.length === 0 ? (
              <div className="text-sm text-muted-foreground p-2 border border-dashed rounded-xl">
                No employees available
              </div>
            ) : (
              <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
                <SelectTrigger className="rounded-xl">
                  <SelectValue placeholder="Select employee" />
                </SelectTrigger>
                <SelectContent>
                  {employees.map((employee) => (
                    <SelectItem key={employee.employeeId} value={employee.employeeId}>
                      <div className="flex flex-col">
                        <span className="font-medium">{employee.employeeName}</span>
                        {employee.designation && (
                          <span className="text-xs text-muted-foreground">
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

        <footer className="flex flex-col sm:flex-row gap-2 sm:gap-3 mt-6 px-2">
          <Button
            variant="outline"
            onClick={() => {
              setSelectedSubject("");
              setSelectedEmployee("");
              onOpenChange(false);
            }}
            className="w-full sm:w-1/2 rounded-xl hover:bg-red-50"
          >
            ✖ Cancel
          </Button>

          <Button
            onClick={handleAssign}
            disabled={assignToSlot.isPending || !selectedSubject || !selectedEmployee || subjects.length === 0 || employees.length === 0}
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

        {/* Debug information - remove in production */}
        {process.env.NODE_ENV === "development" && (
          <div className="mt-4 p-2 text-xs bg-muted rounded-lg">
            <div>Class: {classId}</div>
            <div>Session: {sessionId}</div>
            <div>Original Lecture: {lectureNumber}</div>
            <div>Valid Lecture: {validLectureNumber}</div>
            <div>All Subjects: {subjects.length}</div>
            <div>All Employees: {employees.length}</div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}