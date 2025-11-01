"use client"

import type React from "react"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { Button } from "../ui/button"
import { ScrollArea, ScrollBar } from "../ui/scroll-area"
import { Clock, User, X, GripVertical } from "lucide-react"
import { cn } from "../../lib/utils"
import type { Teacher, Class, TimeSlot, DraggedTeacher } from "../../lib/timetable-types"
import { DAYS_OF_WEEK, LECTURE_NUMBERS } from "../../lib/timetable-types"
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

  const [sessions] = api.timetable.getActiveSessions.useSuspenseQuery()
  const [classTimetable] = api.timetable.getTimetableByClass.useSuspenseQuery(
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
    if (!draggedTeacher || !selectedClass || !sessions?.[0]) return

    const timeSlot = getTimeSlot(lectureNumber)
    if (!timeSlot) return

    try {
      await assignTeacherMutation.mutateAsync({
        classId: selectedClass.classId,
        employeeId: draggedTeacher.employeeId,
        subjectId: "default-subject", // TODO: select from class subjects
        dayOfWeek: day as any,
        lectureNumber,
        sessionId: sessions[0].sessionId,
        startTime: timeSlot.startTime,
        endTime: timeSlot.endTime,
      })
      onAssignTeacher?.(`${day}-${lectureNumber}`, draggedTeacher, "Subject")
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
      {/* Class Selector */}
      <Card>
        <CardHeader>
          <CardTitle>Select Class</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {classes.map((cls) => (
              <Button
                key={cls.classId}
                variant={selectedClass?.classId === cls.classId ? "default" : "outline"}
                onClick={() => setSelectedClass(cls)}
              >
                {cls.grade} - {cls.section}
              </Button>
            ))}
          </div>
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
                              "p-2 border rounded-lg min-h-[80px] transition-colors cursor-copy",
                              slot ? "bg-blue-50 border-blue-200" : "bg-muted/20 hover:bg-muted/40 border-dashed",
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
                              <div className="text-xs text-muted-foreground text-center py-6">Drag teacher here</div>
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
