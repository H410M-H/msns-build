// components/forms/class/SubjectAssignment.tsx
"use client"

import { useState } from "react"
import { Button } from "~/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "~/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select"
import { Label } from "~/components/ui/label"
import { api } from "~/trpc/react"
import { toast } from "~/hooks/use-toast"
import { Skeleton } from "~/components/ui/skeleton"
import { ReloadIcon } from "@radix-ui/react-icons"
import type { Teacher, ClassSubjectAssignment } from "~/lib/timetable-types"

// Define a more flexible type for the API response
type ApiClassSubjectAssignment = Omit<ClassSubjectAssignment, 'Sessions'> & {
  Sessions: {
    sessionId: string;
    sessionName: string;
  };
};

// Define a type for weekdays only (Monday-Saturday)
type Weekday = "Monday" | "Tuesday" | "Wednesday" | "Thursday" | "Friday" | "Saturday";

type SubjectAssignmentDialogProps = {
  classId: string
  dayOfWeek: Weekday // Changed from DayOfWeek to Weekday
  lectureNumber: number
  sessionId: string
  open: boolean
  onOpenChange: (open: boolean) => void
  onAssigned?: () => void
}

export function SubjectAssignmentDialog({
  classId,
  dayOfWeek,
  lectureNumber,
  sessionId,
  open,
  onOpenChange,
  onAssigned,
}: SubjectAssignmentDialogProps) {
  const [selectedSubject, setSelectedSubject] = useState<string>("")
  const [selectedTeacher, setSelectedTeacher] = useState<string>("")

  const utils = api.useUtils()

  const subjectsQuery = api.subject.getSubjectsByClass.useQuery(
    { classId, sessionId },
    { enabled: open && !!classId && !!sessionId },
  )
  
  const teachersQuery = api.employee.getEmployeesByDesignation.useQuery(
    { designation: "TEACHER" },
    { enabled: open },
  )

  // Use the more flexible type for the API response
  const subjects: ApiClassSubjectAssignment[] = subjectsQuery.data ?? []
  const teachers: Teacher[] = teachersQuery.data ?? []

  const assignToSlot = api.timetable.assignTeacher.useMutation()

  const handleAssign = async () => {
    if (!selectedSubject || !selectedTeacher) {
      toast({
        title: "Validation Error",
        description: "Please select both a subject and a teacher",
      })
      return
    }

    try {
      await assignToSlot.mutateAsync({
        classId,
        dayOfWeek, // Now this matches the expected type
        lectureNumber,
        subjectId: selectedSubject,
        employeeId: selectedTeacher,
        sessionId,
        startTime: "09:00",
        endTime: "10:00",
      })

      toast({
        title: "Success",
        description: "Subject and teacher assigned to this slot",
      })

      setSelectedSubject("")
      setSelectedTeacher("")
      await utils.timetable.getTimetable.invalidate()
      onOpenChange(false)
      onAssigned?.()
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to assign subject and teacher"
      toast({
        title: "Error",
        description: errorMessage,
      })
    }
  }

  const dayNames: Record<Weekday, string> = {
    Monday: "Monday",
    Tuesday: "Tuesday",
    Wednesday: "Wednesday",
    Thursday: "Thursday",
    Friday: "Friday",
    Saturday: "Saturday",
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          Assign
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Assign Subject & Teacher</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="bg-muted/50 p-3 rounded-lg space-y-1">
            <p className="text-sm font-medium text-muted-foreground">Slot Details</p>
            <p className="text-sm font-semibold">
              {dayNames[dayOfWeek]} - Lecture {lectureNumber}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="subject">Subject *</Label>
            {subjectsQuery.isLoading ? (
              <Skeleton className="h-10 w-full" />
            ) : (
              <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                <SelectTrigger id="subject">
                  <SelectValue placeholder="Select a subject" />
                </SelectTrigger>
                <SelectContent>
                  {subjects.map((cs) => (
                    <SelectItem key={cs.csId} value={cs.subjectId}>
                      {cs.Subject.subjectName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="teacher">Teacher *</Label>
            {teachersQuery.isLoading ? (
              <Skeleton className="h-10 w-full" />
            ) : (
              <Select value={selectedTeacher} onValueChange={setSelectedTeacher}>
                <SelectTrigger id="teacher">
                  <SelectValue placeholder="Select a teacher" />
                </SelectTrigger>
                <SelectContent>
                  {teachers.map((teacher) => (
                    <SelectItem key={teacher.employeeId} value={teacher.employeeId}>
                      {teacher.employeeName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          <div className="flex gap-2 pt-4">
            <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
              Cancel
            </Button>
            <Button
              onClick={handleAssign}
              disabled={assignToSlot.isPending || !selectedSubject || !selectedTeacher}
              className="flex-1"
            >
              {assignToSlot.isPending ? (
                <>
                  <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />
                  Assigning...
                </>
              ) : (
                "Assign"
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}