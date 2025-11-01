"use client"

import { ScrollArea } from "@radix-ui/react-scroll-area"
import { Clock } from "lucide-react"
import { useState, useMemo } from "react"
import React from "react"
import { Button } from "~/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "~/components/ui/card"
import { ScrollBar } from "~/components/ui/scroll-area"
import { type Class, DAYS_OF_WEEK, type Teacher, type TimeSlot } from "~/lib/timetable-view"

import { api } from "~/trpc/react"

interface TeacherwiseViewProps {
  teachers: Teacher[]
  classes: Class[]
  defaultTimeSlots: TimeSlot[]
}

interface TeacherSlot {
  timetableId: string
  dayOfWeek: string
  lectureNumber: number
  startTime: string
  endTime: string
  Subject: { subjectName: string }
  Grades: { classId: string; grade: string; section: string }
}

export function TeacherwiseView({ teachers }: TeacherwiseViewProps) {
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(teachers[0] ?? null)

  const [teacherTimetable] = api.timetable.getTimetableByTeacher.useSuspenseQuery(
    { employeeId: selectedTeacher?.employeeId ?? "" }
  )

  const scheduleByDay = useMemo(() => {
    const schedule: Record<string, TeacherSlot[]> = {}
    DAYS_OF_WEEK.forEach((day) => {
      schedule[day] = []
    })

    teacherTimetable?.forEach((entry: TeacherSlot) => {
      if (
        entry.dayOfWeek &&
        Array.isArray(schedule[entry.dayOfWeek]) &&
        schedule[entry.dayOfWeek] !== undefined
      ) {
        schedule[entry.dayOfWeek]!.push(entry)
      }
    })

    // Sort by lecture number
    Object.keys(schedule).forEach((day) => {
      schedule[day]!.sort((a, b) => a.lectureNumber - b.lectureNumber)
    })

    return schedule
  }, [teacherTimetable])

  const getTeacherTotalClasses = () => {
    return teacherTimetable?.length ?? 0
  }

  const getTeacherClassesPerDay = (day: string) => {
    return scheduleByDay[day]?.length ?? 0
  }

  return (
    <div className="space-y-4">
      {/* Teacher Selector */}
      <Card>
        <CardHeader>
          <CardTitle>Select Teacher</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="w-full">
            <div className="flex gap-2 pb-4">
              {teachers.map((teacher) => (
                <Button
                  key={teacher.employeeId}
                  variant={selectedTeacher?.employeeId === teacher.employeeId ? "default" : "outline"}
                  onClick={() => setSelectedTeacher(teacher)}
                  className="whitespace-nowrap"
                >
                  {teacher.employeeName}
                </Button>
              ))}
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </CardContent>
      </Card>

      {selectedTeacher && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          {/* Teacher Info Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">{selectedTeacher.employeeName}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-xs text-muted-foreground">Designation</p>
                <p className="text-sm font-medium">{selectedTeacher.designation}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Education</p>
                <p className="text-sm font-medium">{selectedTeacher.education ?? "N/A"}</p>
              </div>
              <div className="pt-2 border-t">
                <p className="text-xs text-muted-foreground">Total Classes/Week</p>
                <p className="text-2xl font-bold">{getTeacherTotalClasses()}</p>
              </div>
            </CardContent>
          </Card>

          {/* Weekly Schedule */}
          <div className="lg:col-span-3">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4" />
                  Weekly Schedule
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4">
                  {DAYS_OF_WEEK.map((day) => {
                    const daySlots = scheduleByDay[day] ?? []
                    return (
                      <div key={day} className="border rounded-lg p-3">
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="font-semibold text-sm">{day}</h3>
                          {daySlots.length > 0 && (
                            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                              {daySlots.length}
                            </span>
                          )}
                        </div>
                        {daySlots.length > 0 ? (
                          <div className="space-y-2">
                            {daySlots.map((slot) => (
                              <div key={slot.timetableId} className="bg-green-50 border border-green-200 rounded p-2">
                                <div>
                                  <p className="text-xs font-medium text-green-900">
                                    {slot.Grades.grade} - {slot.Grades.section}
                                  </p>
                                  <p className="text-xs text-green-700 mt-1">{slot.Subject.subjectName}</p>
                                  <p className="text-xs text-green-600 flex items-center gap-1 mt-1">
                                    <Clock className="h-3 w-3" />L{slot.lectureNumber}: {slot.startTime}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-xs text-muted-foreground">No classes scheduled</p>
                        )}
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Daily Breakdown */}
            <Card className="mt-4">
              <CardHeader>
                <CardTitle className="text-sm">Classes Per Day</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-6 gap-2">
                  {DAYS_OF_WEEK.map((day) => (
                    <div key={day} className="text-center p-3 bg-muted rounded-lg">
                      <p className="text-xs font-medium">{day.slice(0, 3)}</p>
                      <p className="text-lg font-bold text-primary">{getTeacherClassesPerDay(day)}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  )
}
