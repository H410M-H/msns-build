"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card"
import { Button } from "~/components/ui/button"
import { ScrollArea, ScrollBar } from "~/components/ui/scroll-area"
import { Clock } from "lucide-react"
import type { Teacher, Class, TimeSlot } from "~/lib/timetable-types"
import { DAYS_OF_WEEK } from "~/lib/timetable-types"
import { api } from "~/trpc/react"
import type { DayOfWeek } from "@prisma/client"

interface TeacherwiseViewProps {
  teachers: Teacher[]
  classes: Class[]
  defaultTimeSlots: TimeSlot[]
}

interface TeacherTimetableEntry {
  timetableId: string
  dayOfWeek: DayOfWeek
  lectureNumber: number
  startTime: string
  endTime: string
  Subject: { subjectId: string; subjectName: string }
  Grades: { classId: string; grade: string; section: string }
  Sessions: { sessionId: string; sessionName: string }
  Employees: { employeeId: string; employeeName: string; designation: string }
}

export function TeacherwiseView({ teachers, classes: _classes, defaultTimeSlots: _slots }: TeacherwiseViewProps) {
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(teachers[0] ?? null)

  const { data: teacherTimetable } = api.timetable.getTimetableByTeacher.useQuery(
    { employeeId: selectedTeacher?.employeeId ?? "" },
    { enabled: !!selectedTeacher?.employeeId },
  )

  const schedule = useMemo(() => {
    const map: Record<string, TeacherTimetableEntry[]> = {}
    DAYS_OF_WEEK.forEach(day => (map[day] = []))

    teacherTimetable?.forEach(entry => {
      const typed = entry as TeacherTimetableEntry
      map[typed.dayOfWeek]?.push(typed)
    })

    Object.keys(map).forEach(day => {
      map[day]?.sort((a, b) => a.lectureNumber - b.lectureNumber)
    })

    return map
  }, [teacherTimetable])

  const getClassesCount = () => teacherTimetable?.length ?? 0
  const getClassesCountForDay = (day: string) => schedule[day]?.length ?? 0

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Select Teacher</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="w-full whitespace-nowrap">
            <div className="flex gap-2 pb-4">
              {teachers.map((teacher) => (
                <Button
                  key={teacher.employeeId}
                  variant={selectedTeacher?.employeeId === teacher.employeeId ? "default" : "outline"}
                  onClick={() => setSelectedTeacher(teacher)}
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
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4" /> Weekly Schedule
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.keys(schedule).map(day => {
                const slots = schedule[day] ?? []
                return (
                  <div key={day} className="p-3 border rounded-lg">
                    <h3 className="font-semibold text-sm">{day}</h3>
                    {slots.length > 0 ? (
                      <div className="space-y-2 mt-2">
                        {slots.map(slot => (
                          <div key={slot.timetableId} className="p-2 border bg-green-50 rounded">
                            <p className="text-xs font-medium">{slot.Grades.grade} - {slot.Grades.section}</p>
                            <p className="text-xs">{slot.Subject.subjectName}</p>
                            <p className="text-xs flex items-center gap-1">
                              <Clock className="h-3 w-3" /> L{slot.lectureNumber} - {slot.startTime}
                            </p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-muted-foreground mt-2">No classes</p>
                    )}
                  </div>
                )
              })}
            </div>

            <div className="grid grid-cols-6 gap-2 mt-4">
              {Object.keys(schedule).map(day => (
                <div key={day} className="text-center p-2 bg-muted rounded">
                  <p className="text-xs font-medium">{day.slice(0, 3)}</p>
                  <p className="text-lg font-bold">{getClassesCountForDay(day)}</p>
                </div>
              ))}
            </div>

            <div className="mt-3 pt-2 border-t">
              <p className="text-xs text-muted-foreground">Total Classes/Week</p>
              <p className="text-2xl font-bold">{getClassesCount()}</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
