"use client"

import { ScrollArea } from "@radix-ui/react-scroll-area"
import { BookOpen, User, GripVertical, Clock, X } from "lucide-react"
import type React from "react"

import { useState, useMemo } from "react"
import { Button } from "~/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "~/components/ui/card"
import { ScrollBar } from "~/components/ui/scroll-area"
import { type Class, DAYS_OF_WEEK, type DraggedTeacher, LECTURE_NUMBERS, type Teacher, type TimeSlot } from "~/lib/timetable-types"
import { cn } from "~/lib/utils"

import { api } from "~/trpc/react"

interface ClasswiseViewProps {
  classes: Class[]
  teachers: Teacher[]
  defaultTimeSlots: TimeSlot[]
  onAssignTeacher?: (slotId: string, teacher: Teacher, subject: string) => void
  onRemoveTeacher?: (slotId: string) => void
}

interface TimetableEntry {
  timetableId: string
  dayOfWeek: string
  lectureNumber: number
  Employees: { employeeId: string; employeeName: string; designation: string }
  Subject: { subjectName: string }
}

export function ClasswiseView({
  classes,
  teachers,
  defaultTimeSlots,
  onAssignTeacher,
  onRemoveTeacher,
}: ClasswiseViewProps) {
  const [selectedClass, setSelectedClass] = useState<Class | null>(classes[0] || null)
  const [draggedTeacher, setDraggedTeacher] = useState<DraggedTeacher | null>(null)
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null)
  const [selectedSubject, setSelectedSubject] = useState<{ subjectId: string; subjectName: string } | null>(null)

  const [sessions] = api.timetable.getActiveSessions.useSuspenseQuery()
  const [classTimetable] = api.timetable.getTimetableByClass.useSuspenseQuery(
    { classId: selectedClass?.classId || "" },
    { enabled: !!selectedClass?.classId },
  )
  const [classSubjects] = api.timetable.getSubjectsByClassWithTeachers.useSuspenseQuery(
    { classId: selectedClass?.classId || "" },
    { enabled: !!selectedClass?.classId },
  )

  const assignTeacherMutation = api.timetable.assignTeacher.useMutation()
  const removeTeacherMutation = api.timetable.removeTeacher.useMutation()

  const timetableMap = useMemo(() => {
    const map: Record<string, Record<number, TimetableEntry>> = {}
    classTimetable?.forEach((entry: any) => {
      if (!map[entry.dayOfWeek]) {
        map[entry.dayOfWeek] = {}
      }
      map[entry.dayOfWeek][entry.lectureNumber] = entry
    })
    return map
  }, [classTimetable])

  const getTimeSlot = (lectureNumber: number) => {
    return defaultTimeSlots.find((slot) => slot.lectureNumber === lectureNumber)
  }

  const handleTeacherDragStart = (teacher: Teacher, e: React.DragEvent) => {
    setDraggedTeacher(teacher)
    e.dataTransfer.effectAllowed = "copy"
  }

  const handleSlotDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = "copy"
  }

  const handleSlotDrop = async (day: string, lectureNumber: number, e: React.DragEvent) => {
    e.preventDefault()
    if (!draggedTeacher || !selectedClass || !sessions?.[0] || !selectedSubject) {
      alert("Please select a subject first")
      return
    }

    const timeSlot = getTimeSlot(lectureNumber)
    if (!timeSlot) return

    try {
      await assignTeacherMutation.mutateAsync({
        classId: selectedClass.classId,
        employeeId: draggedTeacher.employeeId,
        subjectId: selectedSubject.subjectId,
        dayOfWeek: day as any,
        lectureNumber,
        sessionId: sessions[0].sessionId,
        startTime: timeSlot.startTime,
        endTime: timeSlot.endTime,
      })
      onAssignTeacher?.(`${day}-${lectureNumber}`, draggedTeacher, selectedSubject.subjectName)
    } catch (error) {
      console.error("Failed to assign teacher:", error)
    }
    setDraggedTeacher(null)
  }

  const handleRemoveTeacher = async (timetableId: string) => {
    try {
      await removeTeacherMutation.mutateAsync({ timetableId })
      onRemoveTeacher?.(timetableId)
    } catch (error) {
      console.error("Failed to remove teacher:", error)
    }
  }

  const getSlotForPosition = (day: string, lectureNumber: number) => {
    return timetableMap[day]?.[lectureNumber]
  }

  return (
    <div className="space-y-4">
      {/* Class and Subject Selector */}
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

          {selectedClass && classSubjects && classSubjects.length > 0 && (
            <div>
              <label className="text-sm font-medium mb-2 block flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                Subject
              </label>
              <div className="flex flex-wrap gap-2">
                {classSubjects.map((cs) => (
                  <Button
                    key={cs.csId}
                    variant={selectedSubject?.subjectId === cs.subjectId ? "default" : "outline"}
                    onClick={() => setSelectedSubject({ subjectId: cs.subjectId, subjectName: cs.Subject.subjectName })}
                    className="text-xs"
                  >
                    {cs.Subject.subjectName}
                  </Button>
                ))}
              </div>
              {selectedSubject && (
                <p className="text-xs text-muted-foreground mt-2">
                  Selected: <span className="font-medium">{selectedSubject.subjectName}</span>
                </p>
              )}
            </div>
          )}

          {selectedClass && (!classSubjects || classSubjects.length === 0) && (
            <p className="text-sm text-yellow-600 bg-yellow-50 p-3 rounded">
              No subjects configured for this class. Please set up subjects first.
            </p>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-6 gap-4">
        {/* Teachers Sidebar */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <User className="h-4 w-4" />
                Teachers
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
                      className={cn(
                        "p-2 border rounded-lg cursor-move hover:bg-accent/50 transition-colors",
                        draggedTeacher?.employeeId === teacher.employeeId && "bg-primary text-primary-foreground",
                      )}
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

        {/* Timetable Grid */}
        <div className="lg:col-span-5">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                {selectedClass ? `${selectedClass.grade} - ${selectedClass.section} Timetable` : "Select a Class"}
              </CardTitle>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              {assignTeacherMutation.isPending ||
                (removeTeacherMutation.isPending && (
                  <div className="mb-3 p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-center gap-2">
                    <Clock className="h-4 w-4 animate-spin" />
                    <span className="text-sm text-blue-900">Saving...</span>
                  </div>
                ))}
              <div className="min-w-[900px] grid grid-cols-7 gap-2">
                {/* Header Row */}
                <div className="font-semibold text-center p-3 bg-muted rounded-lg">Time</div>
                {DAYS_OF_WEEK.map((day) => (
                  <div key={day} className="font-semibold text-center p-3 bg-muted rounded-lg">
                    {day}
                  </div>
                ))}

                {/* Grid Content */}
                {LECTURE_NUMBERS.map((lectureNumber) => {
                  const timeSlot = getTimeSlot(lectureNumber)
                  return (
                    <div key={lectureNumber} className="contents">
                      {/* Time Column */}
                      <div className="p-3 bg-muted/50 rounded-lg text-center text-sm">
                        <div className="font-medium">L{lectureNumber}</div>
                        {timeSlot && <div className="text-xs text-muted-foreground">{timeSlot.startTime}</div>}
                      </div>

                      {/* Day Columns */}
                      {DAYS_OF_WEEK.map((day) => {
                        const slot = getSlotForPosition(day, lectureNumber)
                        return (
                          <div
                            key={`${day}-${lectureNumber}`}
                            onDragOver={handleSlotDragOver}
                            onDrop={(e) => handleSlotDrop(day, lectureNumber, e)}
                            className={cn(
                              "p-2 border rounded-lg min-h-[80px] transition-colors",
                              !selectedSubject && "opacity-50 cursor-not-allowed",
                              slot
                                ? "bg-blue-50 border-blue-200"
                                : "bg-muted/20 hover:bg-muted/40 border-dashed cursor-copy",
                            )}
                          >
                            {slot ? (
                              <div className="space-y-1">
                                <div className="flex items-start justify-between gap-1">
                                  <div className="min-w-0 flex-1">
                                    <p className="text-xs font-medium text-blue-900">{slot.Employees.employeeName}</p>
                                    <p className="text-xs text-blue-700 truncate">{slot.Subject.subjectName}</p>
                                  </div>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="h-4 w-4 p-0 flex-shrink-0"
                                    onClick={() => handleRemoveTeacher(slot.timetableId)}
                                    disabled={removeTeacherMutation.isPending}
                                  >
                                    <X className="h-3 w-3" />
                                  </Button>
                                </div>
                              </div>
                            ) : (
                              <div className="text-xs text-muted-foreground text-center py-6">
                                {selectedSubject ? "Drag teacher here" : "Select subject first"}
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
