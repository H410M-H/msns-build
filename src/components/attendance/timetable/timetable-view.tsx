"use client"

import { useState } from "react"
import { cn } from "~/lib/utils"
import { Plus, Edit, Trash2, Clock, User } from "lucide-react"
import { Badge } from "~/components/ui/badge"

import { api } from "~/trpc/react"
import { ScrollArea, ScrollBar } from "~/components/ui/scroll-area"
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card"
import { Button } from "~/components/ui/button"

export interface TimetableEntry {
  timetableId: string
  dayOfWeek: string
  lectureNumber: number
  startTime: string
  endTime: string
  Subject: { subjectId: string; subjectName: string }
  Employees: { employeeId: string; employeeName: string; designation: string }
  Grades: { classId: string; grade: string; section: string }
  Sessions: { sessionId: string; sessionName: string }
}

export interface TimetableViewProps {
  timetable: Record<string, TimetableEntry[]>
  defaultTimeSlots: Array<{
    lectureNumber: number
    startTime: string
    endTime: string
  }>
  onEdit?: (entry: TimetableEntry) => void
  onDelete?: (timetableId: string) => void
  onAdd?: (day: string, lectureNumber: number) => void
  onSelect?: (entry: TimetableEntry) => void
  editable?: boolean
}

const DAYS_OF_WEEK = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
const LECTURE_NUMBERS = [1, 2, 3, 4, 5, 6, 7, 8, 9]

export function TimetableView({
  timetable,
  defaultTimeSlots,
  onEdit,
  onDelete,
  onAdd,
  onSelect,
  editable = false,
}: TimetableViewProps) {
  const [teachers] = api.employee.getAllEmployeesFoTimeTable.useSuspenseQuery()
  const [selectedEntry, setSelectedEntry] = useState<string | null>(null)

  const getTimeSlot = (lectureNumber: number) => {
    return defaultTimeSlots.find((slot) => slot.lectureNumber === lectureNumber)
  }

  const getEntryForSlot = (day: string, lectureNumber: number) => {
    return timetable[day]?.find((entry) => entry.lectureNumber === lectureNumber)
  }

  const isBreakTime = (lectureNumber: number) => {
    return lectureNumber === 8
  }

  const handleSelectEntry = (entry: TimetableEntry) => {
    setSelectedEntry(selectedEntry === entry.timetableId ? null : entry.timetableId)
    onSelect?.(entry)
  }

  return (
    <div className="w-full overflow-x-auto">
      <Card className="min-w-[1200px]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Weekly Timetable
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-12 gap-2">
          <div className="col-span-1">
            <ScrollArea className="h-[1100px]">
              {teachers.map((teacher) => (
                <div key={teacher.employeeId} className={cn("p-2 border rounded-lg min-h-[100px] relative group my-2")}>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <User className="h-3 w-3" />
                    {teacher.employeeName}
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {teacher.designation}
                  </Badge>
                </div>
              ))}
              <ScrollBar orientation="vertical" />
            </ScrollArea>
          </div>
          <div className="col-span-10">
            <div className="grid grid-cols-8 gap-2">
              <div className="font-semibold text-center p-3 bg-muted rounded-lg">Time / Day</div>
              {DAYS_OF_WEEK.map((day) => (
                <div key={day} className="font-semibold text-center p-3 bg-muted rounded-lg">
                  {day}
                </div>
              ))}

              {LECTURE_NUMBERS.map((lectureNumber) => {
                const timeSlot = getTimeSlot(lectureNumber)

                return (
                  <div key={lectureNumber} className="contents">
                    <div className="p-3 bg-muted/50 rounded-lg text-center">
                      <div className="font-medium">Lecture {lectureNumber}</div>
                      {timeSlot && (
                        <div className="text-sm text-muted-foreground">
                          {timeSlot.startTime} - {timeSlot.endTime}
                        </div>
                      )}
                      {isBreakTime(lectureNumber) && (
                        <Badge variant="secondary" className="mt-1 text-xs">
                          After Break
                        </Badge>
                      )}
                    </div>

                    {DAYS_OF_WEEK.map((day) => {
                      const entry = getEntryForSlot(day, lectureNumber)

                      return (
                        <div
                          key={`${day}-${lectureNumber}`}
                          className={cn(
                            "p-2 border rounded-lg min-h-[100px] relative group cursor-pointer transition-all",
                            entry ? "bg-card hover:bg-accent/50" : "bg-muted/20 hover:bg-muted/40",
                            selectedEntry === entry?.timetableId && "ring-2 ring-primary",
                          )}
                          onClick={() => entry && handleSelectEntry(entry)}
                        >
                          {entry ? (
                            <div className="space-y-2">
                              <div className="font-medium text-sm">{entry.Subject.subjectName}</div>
                              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <User className="h-3 w-3" />
                                {entry.Employees.employeeName}
                              </div>
                              <Badge variant="outline" className="text-xs">
                                {entry.Employees.designation}
                              </Badge>

                              {editable && (
                                <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <div className="flex gap-1">
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      className="h-6 w-6 p-0"
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        onEdit?.(entry)
                                      }}
                                    >
                                      <Edit className="h-3 w-3" />
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        onDelete?.(entry.timetableId)
                                      }}
                                    >
                                      <Trash2 className="h-3 w-3" />
                                    </Button>
                                  </div>
                                </div>
                              )}
                            </div>
                          ) : (
                            editable && (
                              <div className="flex items-center justify-center h-full opacity-0 group-hover:opacity-100 transition-opacity">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-8 w-8 p-0"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    onAdd?.(day, lectureNumber)
                                  }}
                                >
                                  <Plus className="h-4 w-4" />
                                </Button>
                              </div>
                            )
                          )}
                        </div>
                      )
                    })}
                  </div>
                )
              })}
            </div>

            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center gap-2 text-yellow-800">
                <Clock className="h-4 w-4" />
                <span className="font-medium">Break Schedule:</span>
                <span className="text-sm">
                  25-minute break after 7th lecture, 5-minute breaks between other lectures
                </span>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-card border rounded"></div>
                <span>Scheduled Class</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-muted/20 border rounded"></div>
                <span>Free Period</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-xs">
                  After Break
                </Badge>
                <span>Post-break lecture</span>
              </div>
            </div>
          </div>
          <div className="col-span-1"></div>
        </CardContent>
      </Card>
    </div>
  )
}
