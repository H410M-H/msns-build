"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs"
import { ClasswiseView } from "~/components/attendance/timetable/classwise-view"
import { TeacherwiseView } from "~/components/attendance/timetable/teacherwise-view"
import { api } from "~/trpc/react"
import { useToast } from "~/hooks/use-toast"

const DEFAULT_TIME_SLOTS = [
  { lectureNumber: 1, startTime: "09:00", endTime: "10:00" },
  { lectureNumber: 2, startTime: "10:00", endTime: "11:00" },
  { lectureNumber: 3, startTime: "11:00", endTime: "12:00" },
  { lectureNumber: 4, startTime: "12:00", endTime: "01:00" },
  { lectureNumber: 5, startTime: "02:00", endTime: "03:00" },
  { lectureNumber: 6, startTime: "03:00", endTime: "04:00" },
  { lectureNumber: 7, startTime: "04:00", endTime: "05:00" },
  { lectureNumber: 8, startTime: "05:00", endTime: "06:00" },
  { lectureNumber: 9, startTime: "06:00", endTime: "07:00" },
]

export default function TimetablePage() {
  const [viewMode, setViewMode] = useState<"classwise" | "teacherwise">("classwise")
  const { toast } = useToast()

  const assignTeacherMutation = api.timetable.assignTeacher.useMutation({
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Teacher assigned successfully",
      })
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to assign teacher",
      })
    },
  })

  const removeTeacherMutation = api.timetable.removeTeacher.useMutation({
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Teacher removed successfully",
      })
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to remove teacher",
      })
    },
  })

  const handleAssignTeacher = async (
    classId: string,
    teacherId: string,
    subjectId: string,
    day: string,
    lectureNumber: number,
  ) => {
    const timeSlot = DEFAULT_TIME_SLOTS.find((slot) => slot.lectureNumber === lectureNumber)
    if (!timeSlot) return

    // Note: sessionId would come from your session context
    // For now, we'll use a placeholder that you should replace with actual session
    const sessionId = localStorage.getItem("sessionId") ?? ""

    try {
      await assignTeacherMutation.mutateAsync({
        classId,
        employeeId: teacherId,
        subjectId,
 dayOfWeek: day as "Monday" | "Tuesday" | "Wednesday" | "Thursday" | "Friday" | "Saturday",
         lectureNumber,
        sessionId,
        startTime: timeSlot.startTime,
        endTime: timeSlot.endTime,
      })
    } catch (error) {
      console.error("[v0] Error in handleAssignTeacher:", error)
      throw error
    }
  }

  const handleRemoveTeacher = async (timetableId: string) => {
    try {
      await removeTeacherMutation.mutateAsync({ timetableId })
    } catch (error) {
      console.error("[v0] Error in handleRemoveTeacher:", error)
      throw error
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Timetable Management</h1>
        <p className="text-gray-600">Manage class schedules and teacher assignments</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Timetable Views</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as "classwise" | "teacherwise")}>
            <TabsList>
              <TabsTrigger value="classwise">Classwise View</TabsTrigger>
              <TabsTrigger value="teacherwise">Teacherwise View</TabsTrigger>
            </TabsList>

            <TabsContent value="classwise" className="mt-6">
              <ClasswiseView
                onAssignTeacher={handleAssignTeacher}
                onRemoveTeacher={handleRemoveTeacher}
                defaultTimeSlots={DEFAULT_TIME_SLOTS}
              />
            </TabsContent>

            <TabsContent value="teacherwise" className="mt-6">
              <TeacherwiseView defaultTimeSlots={DEFAULT_TIME_SLOTS} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
