"use client"

import type React from "react"
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

export function ClasswiseView({
  classes,
  teachers,
  defaultTimeSlots,
  onAssignTeacher,
  onRemoveTeacher: _onRemoveTeacher,
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

    const timeSlot = getTimeSlot(lecture)
    if (!timeSlot) return

    try {
      await assignTeacherMutation.mutateAsync({
        classId: selectedClass.classId,
        employeeId: draggedTeacher.employeeId,
        subjectId: selectedSubject.subjectId,
        dayOfWeek: day as DayOfWeek,
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
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Select Class & Subject</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Class</label>
            <div className="flex flex-wrap gap-2">
              {classes.map((cls) => (
                <Button
                  key={cls.classId}
                  variant={selectedClass?.classId === cls.classId ? "default" : "outline"}
                  onClick={() => {
                    setSelectedClass(cls)
                    setSelectedSubject(null)
                  }}
                >
                  {cls.grade} - {cls.section}
                </Button>
              ))}
            </div>
          </div>

          {selectedClass && (
            <div>
              <label className="text-sm font-medium mb-2 flex items-center gap-2">
                <User className="h-4 w-4" /> Subject
              </label>
              <div className="flex flex-wrap gap-2">
                {classTimetable?.map((slot) => (
                  <Button
                    key={slot.timetableId}
                    variant={selectedSubject?.subjectId === slot.Subject.subjectId ? "default" : "outline"}
                    onClick={() =>
                      setSelectedSubject({
                        subjectId: slot.Subject.subjectId,
                        subjectName: slot.Subject.subjectName ?? "",
                      })
                    }
                  >
                    {slot.Subject.subjectName}
                  </Button>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-6 gap-4">
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <User className="h-4 w-4" /> Teachers
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[600px]">
                <div className="space-y-2">
                  {teachers.map((teacher) => (
                    <div
                      key={teacher.employeeId}
                      draggable
                      onDragStart={(e) => handleTeacherDragStart(teacher, e)}
                      className={cn("p-2 border rounded-lg cursor-move hover:bg-accent/50 transition",
                        draggedTeacher?.employeeId === teacher.employeeId && "bg-primary text-primary-foreground")}
                    >
                      <div className="flex items-start gap-1">
                        <GripVertical className="h-3 w-3 mt-1 flex-shrink-0" />
                        <div className="min-w-0">
                          <p className="text-xs font-medium truncate">{teacher.employeeName}</p>
                          <p className="text-xs text-muted-foreground truncate">{teacher.designation}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <ScrollBar orientation="vertical" />
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-5">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                {selectedClass ? `${selectedClass.grade} - ${selectedClass.section} Timetable` : "Select a Class"}
              </CardTitle>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              <div className="min-w-[900px] grid grid-cols-7 gap-2">
                <div className="font-semibold text-center p-3 bg-muted rounded-lg">Time</div>
                {DAYS_OF_WEEK.map(day => (
                  <div key={day} className="font-semibold text-center p-3 bg-muted rounded-lg">{day}</div>
                ))}

                {LECTURE_NUMBERS.map((lecture) => (
                  <div key={lecture} className="contents">
                    <div className="p-3 bg-muted/50 text-center rounded-lg">
                      <div className="font-medium">L{lecture}</div>
                      {getTimeSlot(lecture) && <div className="text-xs text-muted-foreground">{getTimeSlot(lecture)?.startTime}</div>}
                    </div>

                    {DAYS_OF_WEEK.map((day) => {
                      const slot = getSlotForPosition(day, lecture)
                      return (
                        <div
                          key={`${day}-${lecture}`}
                          onDragOver={handleSlotDragOver}
                          onDrop={(e) => handleSlotDrop(day, lecture, e)}
                          className={cn("p-2 border rounded-lg min-h-[80px]",
                            !slot ? "border-dashed bg-muted/10 hover:bg-muted/30" : "bg-blue-50 border-blue-200")}
                        >
                          {slot ? (
                            <div className="space-y-1">
                              <div className="flex items-start justify-between">
                                <div className="min-w-0 flex-1">
                                  <p className="text-xs font-medium">{slot.Employees.employeeName}</p>
                                  <p className="text-xs truncate">{slot.Subject.subjectName}</p>
                                </div>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-4 w-4 p-0"
                                  onClick={() => handleRemoveTeacher(slot.timetableId)}
                                  disabled={removeTeacherMutation.isPending}
                                >
                                  <X className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <p className="text-xs text-center text-muted-foreground py-6">
                              {selectedSubject ? "Drag teacher here" : "Select subject first"}
                            </p>
                          )}
                        </div>
                      )
                    })}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
