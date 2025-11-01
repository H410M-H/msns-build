"use client"


import { Clock, User, BookOpen, ArrowLeft, Badge } from "lucide-react"
import type { TimetableEntry } from "./timetable-view"
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card"
import { Button } from "~/components/ui/button"

export interface TimetableDetailsProps {
  entry: TimetableEntry | null
  onBack: () => void
  onEdit?: (entry: TimetableEntry) => void
  onDelete?: (timetableId: string) => void
}

export function TimetableDetails({ entry, onBack, onEdit, onDelete }: TimetableDetailsProps) {
  if (!entry) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="text-center text-muted-foreground">Select a timetable entry to view details</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Timetable Entry Details</CardTitle>
          <Button variant="ghost" size="sm" onClick={onBack} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Clock className="h-4 w-4" />
              Day of Week
            </div>
            <Badge  className="text-base">
              {entry.dayOfWeek}
            </Badge>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Clock className="h-4 w-4" />
              Lecture Number
            </div>
            <Badge  className="text-base">
              Lecture {entry.lectureNumber}
            </Badge>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Clock className="h-4 w-4" />
              Start Time
            </div>
            <p className="text-sm font-medium">{entry.startTime}</p>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Clock className="h-4 w-4" />
              End Time
            </div>
            <p className="text-sm font-medium">{entry.endTime}</p>
          </div>
        </div>

        <div className="space-y-2 border-t pt-4">
          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <BookOpen className="h-4 w-4" />
            Subject
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-muted-foreground">Subject Name</p>
              <p className="text-sm font-medium">{entry.Subject.subjectName}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Subject ID</p>
              <p className="text-sm font-medium">{entry.Subject.subjectId}</p>
            </div>
          </div>
        </div>

        <div className="space-y-2 border-t pt-4">
          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <User className="h-4 w-4" />
            Instructor
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-muted-foreground">Name</p>
              <p className="text-sm font-medium">{entry.Employees.employeeName}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Employee ID</p>
              <p className="text-sm font-medium">{entry.Employees.employeeId}</p>
            </div>
            <div className="col-span-2">
              <p className="text-xs text-muted-foreground">Designation</p>
              <Badge>{entry.Employees.designation}</Badge>
            </div>
          </div>
        </div>

        <div className="space-y-2 border-t pt-4">
          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <BookOpen className="h-4 w-4" />
            Class
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-muted-foreground">Grade</p>
              <Badge>{entry.Grades.grade}</Badge>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Section</p>
              <Badge>{entry.Grades.section}</Badge>
            </div>
            <div className="col-span-2">
              <p className="text-xs text-muted-foreground">Class ID</p>
              <p className="text-sm font-medium">{entry.Grades.classId}</p>
            </div>
          </div>
        </div>

        <div className="space-y-2 border-t pt-4">
          <p className="text-xs text-muted-foreground">Academic Session</p>
          <div className="flex items-center gap-2">
            <Badge >{entry.Sessions.sessionName}</Badge>
            <p className="text-xs text-muted-foreground">ID: {entry.Sessions.sessionId}</p>
          </div>
        </div>

        <div className="flex gap-2 border-t pt-4">
          <Button variant="outline" onClick={() => onEdit?.(entry)} className="flex-1 gap-2">
            <Clock className="h-4 w-4" />
            Edit Entry
          </Button>
          <Button variant="destructive" onClick={() => onDelete?.(entry.timetableId)} className="flex-1">
            Delete Entry
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
