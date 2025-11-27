"use client"

import React from "react"
import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card"
import { Button } from "~/components/ui/button"
import { ScrollArea, ScrollBar } from "~/components/ui/scroll-area"
import { Clock, User, X, GripVertical } from "lucide-react"
import { cn } from "~/lib/utils"
import type { Teacher, Class, TimeSlot, DraggedTeacher } from "~/lib/timetable-types"
import { DAYS_OF_WEEK, LECTURE_NUMBERS } from "~/lib/timetable-types"
import { api } from "~/trpc/react"
import type { DayOfWeek } from "@prisma/client"
import { Tooltip, TooltipContent, TooltipTrigger } from "~/components/ui/tooltip"
import { Badge } from "~/components/ui/badge"

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
  SubjectName?: string
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

  const { data: sessions } = api.timetable.getActiveSessions.useQuery()
  const { data: classTimetable, refetch: refetchTimetable } = api.timetable.getTimetableByClass.useQuery(
    { classId: selectedClass?.classId ?? "" },
    { enabled: !!selectedClass?.classId },
  )

  // NEW: Fetch class subjects separately
  const { data: classSubjects } = api.subject.getSubjectsByClass.useQuery(
    { 
      classId: selectedClass?.classId ?? "", 
      sessionId: sessions?.[0]?.sessionId ?? "" 
    },
    { 
      enabled: !!selectedClass?.classId && !!sessions?.[0]?.sessionId 
    }
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

    // Validate the day
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
        dayOfWeek: day, // Now this is type-safe
        lectureNumber: lecture,
        sessionId: sessions[0].sessionId,
        startTime: timeSlot.startTime,
        endTime: timeSlot.endTime,
      })

      onAssignTeacher?.(`${day}-${lecture}`, draggedTeacher, selectedSubject.subjectName)
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

  return (
    <div className="space-y-4 md:space-y-6">
      <Card className="border-primary/20 shadow-lg">
        <CardHeader className="bg-primary/5">
          <CardTitle className="text-lg md:text-xl flex items-center gap-2 text-primary">
            <Clock className="h-5 w-5" />
            Select Class & Subject
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 md:space-y-6 p-4 md:p-6">
          <div>
            <label className="text-sm font-medium mb-2 block text-muted-foreground">Class</label>
            <ScrollArea className="w-full whitespace-nowrap rounded-md border">
              <div className="flex gap-2 p-2">
                {classes.map((cls) => (
                  <Button
                    key={cls.classId}
                    variant={selectedClass?.classId === cls.classId ? "default" : "outline"}
                    onClick={() => {
                      setSelectedClass(cls)
                      setSelectedSubject(null)
                    }}
                    className="flex-shrink-0"
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
              <label className="text-sm font-medium mb-2 flex items-center gap-2 text-muted-foreground">
                <User className="h-4 w-4" /> Subject
              </label>
              <ScrollArea className="w-full whitespace-nowrap rounded-md border">
                <div className="flex gap-2 p-2">
                  {classSubjects?.map((subjectAssignment) => (
                    <Button
                      key={subjectAssignment.csId}
                      variant={selectedSubject?.subjectId === subjectAssignment.subjectId ? "default" : "outline"}
                      onClick={() =>
                        setSelectedSubject({
                          subjectId: subjectAssignment.subjectId,
                          subjectName: subjectAssignment.Subject.subjectName,
                        })
                      }
                      className="flex-shrink-0"
                    >
                      {subjectAssignment.Subject.subjectName}
                    </Button>
                  ))}
                  {classSubjects?.length === 0 && (
                    <div className="text-sm text-muted-foreground p-2">
                      No subjects assigned to this class
                    </div>
                  )}
                </div>
                <ScrollBar orientation="horizontal" />
              </ScrollArea>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-6 gap-4 md:gap-6">
        <div className="lg:col-span-1">
          <Card className="border-primary/20 shadow-lg h-full">
            <CardHeader className="bg-primary/5">
              <CardTitle className="text-lg flex items-center gap-2 text-primary">
                <User className="h-5 w-5" /> Teachers
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <ScrollArea className="h-[calc(100vh-300px)] md:h-[600px] pr-4">
                <div className="space-y-2">
                  {teachers.map((teacher) => (
                    <Tooltip key={teacher.employeeId}>
                      <TooltipTrigger asChild>
                        <div
                          draggable
                          onDragStart={(e) => handleTeacherDragStart(teacher, e)}
                          className={cn(
                            "p-3 border rounded-lg cursor-grab hover:bg-accent/50 transition-all duration-200 active:cursor-grabbing",
                            "flex items-start gap-2 shadow-sm",
                            draggedTeacher?.employeeId === teacher.employeeId && "bg-primary/10 border-primary scale-105"
                          )}
                        >
                          <GripVertical className="h-4 w-4 mt-1 flex-shrink-0 text-muted-foreground" />
                          <div className="min-w-0">
                            <p className="text-sm font-medium truncate">{teacher.employeeName}</p>
                            <Badge variant="secondary" className="text-xs mt-1">
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
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-5">
          <Card className="border-primary/20 shadow-lg">
            <CardHeader className="bg-primary/5">
              <CardTitle className="flex items-center gap-2 text-primary text-lg md:text-xl">
                <Clock className="h-5 w-5" />
                {selectedClass ? `${selectedClass.grade} - ${selectedClass.section} Timetable` : "Select a Class"}
              </CardTitle>
            </CardHeader>
            <CardContent className="overflow-x-auto p-4 md:p-6">
              <div className="min-w-[900px] grid grid-cols-7 gap-2 md:gap-3">
                <div className="font-semibold text-center p-3 bg-primary text-primary-foreground rounded-lg shadow">Time</div>
                {DAYS_OF_WEEK.map((day, index) => (
                  <div
                    key={day}
                    className={cn(
                      "font-semibold text-center p-3 rounded-lg shadow text-foreground",
                      DAY_COLORS[index % DAY_COLORS.length]
                    )}
                  >
                    {day}
                  </div>
                ))}

                {LECTURE_NUMBERS.map((lecture) => (
                  <React.Fragment key={lecture}>
                    <div className="p-3 bg-muted/50 text-center rounded-lg shadow">
                      <div className="font-medium">L{lecture}</div>
                      {getTimeSlot(lecture) && (
                        <div className="text-xs text-muted-foreground">
                          {getTimeSlot(lecture)?.startTime} - {getTimeSlot(lecture)?.endTime}
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
                                "p-3 border rounded-lg min-h-[80px] md:min-h-[100px] transition-all duration-200 shadow",
                                !slot 
                                  ? "border-dashed bg-background hover:bg-muted/30" 
                                  : cn(
                                      "border-solid",
                                      DAY_COLORS[dayIndex % DAY_COLORS.length]
                                        ? DAY_COLORS[dayIndex % DAY_COLORS.length]!.replace("50", "100")
                                        : ""
                                    ),
                                draggedTeacher && !slot && "border-primary scale-105"
                              )}
                            >
                              {slot ? (
                                <div className="space-y-1">
                                  <div className="flex items-start justify-between">
                                    <div className="min-w-0 flex-1">
                                      <p className="text-sm font-medium">{slot.Employees.employeeName}</p>
                                      <Badge variant="outline" className="text-xs mt-1">
                                        {slot.Subject.subjectName}
                                      </Badge>
                                    </div>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      className="h-5 w-5 p-0 hover:bg-destructive/20"
                                      onClick={() => handleRemoveTeacher(slot.timetableId)}
                                      disabled={removeTeacherMutation.isPending}
                                    >
                                      <X className="h-4 w-4 text-destructive" />
                                    </Button>
                                  </div>
                                </div>
                              ) : (
                                <p className="text-xs text-center text-muted-foreground py-6 md:py-8">
                                  {selectedSubject ? "Drag teacher here" : "Select subject first"}
                                </p>
                              )}
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            {slot ? `${slot.Subject.subjectName} with ${slot.Employees.employeeName}` : "Empty slot - Assign teacher"}
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
    </div>
  )
}