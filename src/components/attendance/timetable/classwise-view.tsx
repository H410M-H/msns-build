"use client"

import React from "react"
import { useState, useMemo, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card"
import { Button } from "~/components/ui/button"
import { ScrollArea, ScrollBar } from "~/components/ui/scroll-area"
import { Clock, User, X, GripVertical, Plus } from "lucide-react"
import { cn } from "~/lib/utils"
import type { Teacher, Class, TimeSlot, DraggedTeacher } from "~/lib/timetable-types"
import { DAYS_OF_WEEK, LECTURE_NUMBERS } from "~/lib/timetable-types"
import { api } from "~/trpc/react"
import type { DayOfWeek } from "@prisma/client"
import { Tooltip, TooltipContent, TooltipTrigger } from "~/components/ui/tooltip"
import { Badge } from "~/components/ui/badge"
import { SubjectAssignmentDialog } from "~/components/forms/class/SubjectAssignment"

interface ClasswiseViewProps {
  classes: Class[]
  teachers: Teacher[]
  defaultTimeSlots: TimeSlot[]
  onAssignTeacher?: (slotId: string, teacher: Teacher, subject: string) => void
  onRemoveTeacher?: (slotId: string) => void
}

interface TimetableEntry {
  timetableId: string
  dayOfWeek: DayOfWeek
  lectureNumber: number
  startTime: string
  endTime: string
  Employees: { employeeId: string; employeeName: string; designation: string }
  Subject: { subjectId: string; subjectName: string }
  Grades: { classId: string; grade: string; section: string }
  Sessions: { sessionId: string; sessionName: string }
}

// Helper function to validate day of week
const isValidDayOfWeek = (day: string): day is "Monday" | "Tuesday" | "Wednesday" | "Thursday" | "Friday" | "Saturday" => {
  return ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"].includes(day)
}

// Color palette for days
const DAY_COLORS = [
  "bg-blue-50 hover:bg-blue-100",
  "bg-green-50 hover:bg-green-100",
  "bg-yellow-50 hover:bg-yellow-100",
  "bg-purple-50 hover:bg-purple-100",
  "bg-pink-50 hover:bg-pink-100",
  "bg-indigo-50 hover:bg-indigo-100",
]

export function ClasswiseView({
  classes,
  teachers,
  defaultTimeSlots,
  onAssignTeacher,
  onRemoveTeacher,
}: ClasswiseViewProps) {
  const [selectedClass, setSelectedClass] = useState<Class | null>(classes[0] ?? null)
  const [draggedTeacher, setDraggedTeacher] = useState<DraggedTeacher | null>(null)
  const [selectedSubject, setSelectedSubject] = useState<{ subjectId: string; subjectName: string } | null>(null)
  const [assignmentDialogOpen, setAssignmentDialogOpen] = useState(false)
  const [selectedSlot, setSelectedSlot] = useState<{
    dayOfWeek: DayOfWeek;
    lectureNumber: number;
  } | null>(null)
  
  const [assignedSubjects, setAssignedSubjects] = useState<{
    subjectId: string;
    subjectName: string;
  }[]>([])

  const { data: sessions } = api.timetable.getActiveSessions.useQuery()
  const { data: classTimetable, refetch: refetchTimetable } = api.timetable.getTimetableByClass.useQuery(
    { classId: selectedClass?.classId ?? "" },
    { enabled: !!selectedClass?.classId },
  )

  // Extract unique subjects from the timetable data
  useEffect(() => {
    if (classTimetable && classTimetable.length > 0) {
      const uniqueSubjects = new Map<string, { subjectId: string; subjectName: string }>()
      
      classTimetable.forEach((entry) => {
        const typed = entry as TimetableEntry
        if (typed.Subject?.subjectId) {
          uniqueSubjects.set(typed.Subject.subjectId, {
            subjectId: typed.Subject.subjectId,
            subjectName: typed.Subject.subjectName
          })
        }
      })
      
      setAssignedSubjects(Array.from(uniqueSubjects.values()))
    } else {
      setAssignedSubjects([])
    }
  }, [classTimetable])

  // Fetch all subjects as fallback
  const { data: allSubjects } = api.subject.getAllSubjects.useQuery(
    undefined,
    { enabled: true }
  )

  const assignTeacherMutation = api.timetable.assignTeacher.useMutation({
    onSuccess: () => void refetchTimetable(),
  })

  const removeTeacherMutation = api.timetable.removeTeacher.useMutation({
    onSuccess: () => void refetchTimetable(),
  })

  const timetableMap = useMemo(() => {
    const map: Record<string, Record<number, TimetableEntry>> = {}
    classTimetable?.forEach((entry) => {
      const typed = entry as TimetableEntry
      if (!map[typed.dayOfWeek]) {
        map[typed.dayOfWeek] = {}
      }
      (map[typed.dayOfWeek] ??= {})[typed.lectureNumber] = typed
    })
    return map
  }, [classTimetable])

  const getTimeSlot = (lectureNumber: number) =>
    defaultTimeSlots.find((slot) => slot.lectureNumber === lectureNumber)

  const getSlotForPosition = (day: string, lecture: number) =>
    timetableMap[day]?.[lecture]

  const handleTeacherDragStart = (teacher: Teacher, e: React.DragEvent) => {
    setDraggedTeacher(teacher)
    e.dataTransfer.effectAllowed = "copy"
  }

  const handleSlotDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = "copy"
  }

  const handleSlotDrop = async (day: string, lecture: number, e: React.DragEvent) => {
    e.preventDefault()

    if (!selectedSubject?.subjectId) {
      alert("Please select a subject first")
      return
    }

    if (!draggedTeacher || !selectedClass || !sessions?.[0] || !selectedSubject) return

    if (!isValidDayOfWeek(day)) {
      console.error("Invalid day:", day)
      return
    }

    const timeSlot = getTimeSlot(lecture)
    if (!timeSlot) return

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
      })

      onAssignTeacher?.(`${day}-${lecture}`, draggedTeacher, selectedSubject.subjectName)
      
      // Add subject to assigned subjects if not already present
      if (!assignedSubjects.some(sub => sub.subjectId === selectedSubject.subjectId)) {
        setAssignedSubjects(prev => [...prev, selectedSubject])
      }
    } catch (err) {
      console.error("Assign error:", err)
    }

    setDraggedTeacher(null)
  }

  const handleRemoveTeacher = async (timetableId: string) => {
    try {
      await removeTeacherMutation.mutateAsync({ timetableId })
      onRemoveTeacher?.(timetableId)
    } catch (err) {
      console.error("Remove error:", err)
    }
  }

  const handleOpenAssignmentDialog = (day: string, lecture: number) => {
    if (!isValidDayOfWeek(day)) {
      console.error("Invalid day:", day)
      return
    }
    setSelectedSlot({
      dayOfWeek: day,
      lectureNumber: lecture
    })
    setAssignmentDialogOpen(true)
  }

  const handleAssigned = () => {
    void refetchTimetable()
    setAssignmentDialogOpen(false)
    setSelectedSlot(null)
  }

  return (
    <div className="space-y-4">
      <Card className="border-primary/20 shadow-lg">
        <CardHeader className="bg-primary/5 p-3 sm:p-4">
          <CardTitle className="text-base sm:text-lg flex items-center gap-2 text-primary">
            <Clock className="h-4 w-4 sm:h-5 sm:w-5" />
            Select Class & Subject
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 p-3 sm:p-4">
          <div>
            <label className="text-xs sm:text-sm font-medium mb-1 sm:mb-2 block text-muted-foreground">Class</label>
            <ScrollArea className="w-full whitespace-nowrap rounded-md border h-[60px] sm:h-auto">
              <div className="flex gap-2 p-2 grid-cols-2">
                {classes.map((cls) => (
                  <Button
                    key={cls.classId}
                    variant={selectedClass?.classId === cls.classId ? "default" : "outline"}
                    onClick={() => {
                      setSelectedClass(cls)
                      setSelectedSubject(null)
                      setAssignedSubjects([])
                    }}
                    className="flex-shrink-0 text-xs sm:text-sm py-1 sm:py-2 px-2 sm:px-4"
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
              <label className="text-xs sm:text-sm font-medium mb-1 sm:mb-2 flex items-center gap-1 sm:gap-2 text-muted-foreground">
                <User className="h-3 w-3 sm:h-4 sm:w-4" /> 
                Subjects (From Timetable)
              </label>
              <ScrollArea className="w-full whitespace-nowrap rounded-md border h-[60px] sm:h-auto">
                <div className="flex gap-2 p-2">
                  {assignedSubjects.length > 0 ? (
                    assignedSubjects.map((subject) => (
                      <Button
                        key={subject.subjectId}
                        variant={selectedSubject?.subjectId === subject.subjectId ? "default" : "outline"}
                        onClick={() => setSelectedSubject(subject)}
                        className="flex-shrink-0 text-xs sm:text-sm py-1 sm:py-2 px-2 sm:px-4"
                      >
                        {subject.subjectName}
                      </Button>
                    ))
                  ) : allSubjects && allSubjects.length > 0 ? (
                    // Fallback: Show all subjects if no assignments yet
                    allSubjects.map((subject) => (
                      <Button
                        key={subject.subjectId}
                        variant={selectedSubject?.subjectId === subject.subjectId ? "default" : "outline"}
                        onClick={() => setSelectedSubject({
                          subjectId: subject.subjectId,
                          subjectName: subject.subjectName
                        })}
                        className="flex-shrink-0 text-xs sm:text-sm py-1 sm:py-2 px-2 sm:px-4"
                      >
                        {subject.subjectName}
                      </Button>
                    ))
                  ) : (
                    <div className="text-xs sm:text-sm text-muted-foreground p-2">
                      No subjects assigned yet. Add subjects using the + button in timetable.
                    </div>
                  )}
                </div>
                <ScrollBar orientation="horizontal" />
              </ScrollArea>
              {assignedSubjects.length === 0 && allSubjects && allSubjects.length > 0 && (
                <div className="text-xs text-muted-foreground mt-1">
                  Showing all available subjects. Assign a subject to see it appear here.
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
              <CardTitle className="text-base sm:text-lg flex items-center gap-2 text-primary">
                <User className="h-4 w-4 sm:h-5 sm:w-5" /> Teachers
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 sm:p-4">
              <div className="flex flex-wrap gap-1 p-1 rounded-md border">
                {teachers.map((teacher) => (
                  <Tooltip key={teacher.employeeId}>
                    <TooltipTrigger asChild>
                      <div
                        draggable
                        onDragStart={(e) => handleTeacherDragStart(teacher, e)}
                        className={cn(
                          "p-1 sm:p-2 border rounded-lg cursor-grab hover:bg-accent/50 transition-all duration-200 active:cursor-grabbing",
                          "flex flex-col items-center justify-center gap-0.5 sm:gap-1 shadow-sm min-w-[80px] sm:min-w-[100px]",
                          draggedTeacher?.employeeId === teacher.employeeId && "bg-primary/10 border-primary scale-105"
                        )}
                      >
                        <GripVertical className="h-3 w-3 flex-shrink-0 text-muted-foreground" />
                        <div className="text-center">
                          <p className="text-[10px] sm:text-xs font-medium truncate">{teacher.employeeName}</p>
                          <Badge variant="secondary" className="text-[9px] sm:text-[10px] mt-0.5">
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
              <CardTitle className="flex items-center gap-2 text-primary text-base sm:text-lg md:text-xl">
                <Clock className="h-4 w-4 sm:h-5 sm:w-5" />
                {selectedClass ? `${selectedClass.grade} - ${selectedClass.section} Timetable` : "Select a Class"}
              </CardTitle>
            </CardHeader>
            <CardContent className="overflow-x-auto p-3 sm:p-4 md:p-6">
              <div className="min-w-[600px] sm:min-w-[900px] grid grid-cols-7 gap-1 sm:gap-2 md:gap-3">
                <div className="font-semibold text-center p-2 sm:p-3 bg-primary text-primary-foreground rounded-lg shadow text-xs sm:text-sm">Time</div>
                {DAYS_OF_WEEK.map((day, index) => (
                  <div
                    key={day}
                    className={cn(
                      "font-semibold text-center p-2 sm:p-3 rounded-lg shadow text-foreground text-xs sm:text-sm",
                      DAY_COLORS[index % DAY_COLORS.length]
                    )}
                  >
                    {day.slice(0, 3)}
                  </div>
                ))}

                {LECTURE_NUMBERS.map((lecture) => (
                  <React.Fragment key={lecture}>
                    <div className="p-2 sm:p-3 bg-muted/50 text-center rounded-lg shadow text-xs sm:text-sm">
                      <div className="font-medium">L{lecture}</div>
                      {getTimeSlot(lecture) && (
                        <div className="text-[10px] sm:text-xs text-muted-foreground">
                          {getTimeSlot(lecture)?.startTime}
                        </div>
                      )}
                    </div>

                    {DAYS_OF_WEEK.map((day, dayIndex) => {
                      const slot = getSlotForPosition(day, lecture)
                      return (
                        <Tooltip key={`${day}-${lecture}`}>
                          <TooltipTrigger asChild>
                            <div
                              onDragOver={handleSlotDragOver}
                              onDrop={(e) => handleSlotDrop(day, lecture, e)}
                              className={cn(
                                "p-2 sm:p-3 border rounded-lg min-h-[60px] sm:min-h-[80px] md:min-h-[100px] transition-all duration-200 shadow text-xs sm:text-sm relative",
                                !slot 
                                  ? "border-dashed bg-background hover:bg-muted/30" 
                                  : cn(
                                      "border-solid",
                                      (DAY_COLORS[dayIndex % DAY_COLORS.length] ?? "").replace("50", "100")
                                    ),
                                draggedTeacher && !slot && "border-primary scale-105"
                              )}
                            >
                              {slot ? (
                                <div className="space-y-0.5 sm:space-y-1">
                                  <div className="flex items-start justify-between">
                                    <div className="min-w-0 flex-1">
                                      <p className="text-xs sm:text-sm font-medium truncate">{slot.Employees.employeeName}</p>
                                      <Badge variant="outline" className="text-[10px] sm:text-xs mt-0.5 sm:mt-1">
                                        {slot.Subject.subjectName}
                                      </Badge>
                                    </div>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      className="h-4 w-4 sm:h-5 sm:w-5 p-0 hover:bg-destructive/20"
                                      onClick={() => handleRemoveTeacher(slot.timetableId)}
                                      disabled={removeTeacherMutation.isPending}
                                    >
                                      <X className="h-3 w-3 sm:h-4 sm:w-4 text-destructive" />
                                    </Button>
                                  </div>
                                </div>
                              ) : (
                                <div className="flex flex-col items-center justify-center h-full space-y-1">
                                  <p className="text-[10px] sm:text-xs text-center text-muted-foreground">
                                    {selectedSubject ? "Drag teacher or" : "Select subject"}
                                  </p>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 w-6 p-0 hover:bg-primary/10"
                                    onClick={() => handleOpenAssignmentDialog(day, lecture)}
                                  >
                                    <Plus className="h-3 w-3" />
                                  </Button>
                                </div>
                              )}
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            {slot ? `${slot.Subject.subjectName} with ${slot.Employees.employeeName}` : "Empty slot - Click + to assign"}
                          </TooltipContent>
                        </Tooltip>
                      )
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
  )
}