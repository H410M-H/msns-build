"use client"

import { useState, Suspense } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs"
import { ClasswiseView } from "~/components/attendance/timetable/classwise-view"
import { TeacherwiseView } from "~/components/attendance/timetable/teacherwise-view"
import type { Class, Teacher, TimetableViewMode } from "~/lib/timetable-types"
import { GridIcon, Users, AlertCircle, Clock } from "lucide-react"
import { api } from "~/trpc/react"

const DEFAULT_TIME_SLOTS = [
  { lectureNumber: 1, startTime: "08:00", endTime: "08:35" },
  { lectureNumber: 2, startTime: "08:40", endTime: "09:15" },
  { lectureNumber: 3, startTime: "09:20", endTime: "09:55" },
  { lectureNumber: 4, startTime: "10:00", endTime: "10:35" },
  { lectureNumber: 5, startTime: "10:40", endTime: "11:15" },
  { lectureNumber: 6, startTime: "11:20", endTime: "11:55" },
  { lectureNumber: 7, startTime: "12:00", endTime: "12:35" },
  { lectureNumber: 8, startTime: "13:00", endTime: "13:35" },
  { lectureNumber: 9, startTime: "13:40", endTime: "14:15" },
]

interface EmployeeResponse {
  employeeId: string
  employeeName: string
  designation: string
  education: string | null
}

interface ClassResponse {
  classId: string
  grade: string
  section: string
  category: string
  fee: number
}

function TimetableContent() {
  const [viewMode, setViewMode] = useState<TimetableViewMode>("class")

  const { data: teachers, isLoading: teachersLoading } =
    api.employee.getAllEmployeesForTimeTable.useQuery()
  const { data: classes, isLoading: classesLoading } = api.class.getClasses.useQuery()

  if (teachersLoading || classesLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100 p-4 flex items-center justify-center">
        <div className="text-center space-y-2">
          <Clock className="h-8 w-8 mx-auto text-indigo-500 animate-spin" />
          <p className="text-lg font-semibold text-indigo-700 animate-pulse">Loading timetable data...</p>
        </div>
      </div>
    )
  }

  const transformedClasses: Class[] = (classes ?? []).map((cls: ClassResponse) => ({
    classId: cls.classId,
    grade: cls.grade,
    section: cls.section,
  }))

  const transformedTeachers: Teacher[] = (teachers ?? []).map((teacher: EmployeeResponse) => ({
    employeeId: teacher.employeeId,
    employeeName: teacher.employeeName,
    designation: teacher.designation,
    education: teacher.education ?? undefined,
  }))

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 p-4 sm:p-6 md:p-8">
      <div className="w-screen max-w-[105rem] mx-auto space-y-6 sm:space-y-8">
        {/* Header */}
        <div className="text-center space-y-2 sm:space-y-4">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600">
            Timetable Management
          </h1>
          <p className="text-sm sm:text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
            Effortlessly manage class schedules with intuitive drag-and-drop teacher assignments and real-time updates.
          </p>
        </div>

        {/* View Mode Tabs */}
        <Card className="backdrop-blur-xl bg-white/40 border border-white/50 shadow-2xl rounded-3xl overflow-hidden transition-all duration-300 hover:shadow-indigo-500/20">
          <CardHeader className="bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border-b border-white/20 p-4 sm:p-6">
            <CardTitle className="text-base sm:text-lg md:text-xl font-semibold text-indigo-800 flex items-center gap-2">
              <GridIcon className="h-4 w-4 sm:h-5 sm:w-5" />
              Choose Your View
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as TimetableViewMode)} className="space-y-4 sm:space-y-6">
              <TabsList className="grid w-screen max-w-md mx-auto grid-cols-2 gap-2 sm:gap-3 md:gap-4 bg-transparent">
                <TabsTrigger
                  value="class"
                  className="flex items-center justify-center gap-1 sm:gap-2 backdrop-blur-md bg-white/30 border border-white/40 rounded-xl shadow-md hover:bg-indigo-200/40 hover:scale-105 transition-all duration-200 data-[state=active]:bg-indigo-500 data-[state=active]:text-white data-[state=active]:shadow-lg text-sm sm:text-base"
                >
                  <GridIcon className="h-3 w-3 sm:h-4 sm:w-4" />
                  Class View
                </TabsTrigger>
                <TabsTrigger
                  value="teacher"
                  className="flex items-center justify-center gap-1 sm:gap-2 backdrop-blur-md bg-white/30 border border-white/40 rounded-xl shadow-md hover:bg-purple-200/40 hover:scale-105 transition-all duration-200 data-[state=active]:bg-purple-500 data-[state=active]:text-white data-[state=active]:shadow-lg text-sm sm:text-base"
                >
                  <Users className="h-4 w-4 sm:h-6 sm:w-6" />
                  Teacher View
                </TabsTrigger>
              </TabsList>

              {/* Classwise View */}
              <TabsContent value="class" className="mt-4 sm:mt-6">
                <ClasswiseView
                  classes={transformedClasses}
                  teachers={transformedTeachers}
                  defaultTimeSlots={DEFAULT_TIME_SLOTS}
                />
              </TabsContent>

              {/* Teacherwise View */}
              <TabsContent value="teacher" className="mt-4 sm:mt-6">
                <TeacherwiseView
                  teachers={transformedTeachers}
                  classes={transformedClasses}
                  defaultTimeSlots={DEFAULT_TIME_SLOTS}
                />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Features Card */}
        <Card className="backdrop-blur-xl bg-white/40 border border-white/50 shadow-2xl rounded-3xl overflow-hidden transition-all duration-300 hover:shadow-purple-500/20">
          <CardHeader className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-b border-white/20 p-4 sm:p-6">
            <CardTitle className="text-base sm:text-lg md:text-xl font-semibold text-purple-800 flex items-center gap-2">
              <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5" />
              Key Features
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 text-xs sm:text-sm md:text-base text-muted-foreground space-y-3 sm:space-y-4">
            <ul className="space-y-2 sm:space-y-3 list-inside">
              <li className="flex items-start gap-1 sm:gap-2">
                <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-indigo-500 flex-shrink-0 mt-0.5" />
                <span><strong>Classwise View:</strong> Drag and drop teachers to time slots with instant validation.</span>
              </li>
              <li className="flex items-start gap-1 sm:gap-2">
                <Users className="h-4 w-4 sm:h-5 sm:w-5 text-purple-500 flex-shrink-0 mt-0.5" />
                <span><strong>Teacherwise View:</strong> Comprehensive weekly overview with class details and timings.</span>
              </li>
              <li className="flex items-start gap-1 sm:gap-2">
                <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5 text-pink-500 flex-shrink-0 mt-0.5" />
                <span><strong>Smart Sync:</strong> Real-time database updates with conflict prevention.</span>
              </li>
              <li className="flex items-start gap-1 sm:gap-2">
                <GridIcon className="h-4 w-4 sm:h-5 sm:w-5 text-indigo-500 flex-shrink-0 mt-0.5" />
                <span><strong>Responsive Design:</strong> Optimized for mobile, tablet, and desktop viewing.</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default function TimetablePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100 p-4 flex items-center justify-center">
          <div className="text-center space-y-2">
            <Clock className="h-8 w-8 mx-auto text-indigo-500 animate-spin" />
            <p className="text-lg font-semibold text-indigo-700 animate-pulse">Preparing your timetable...</p>
          </div>
        </div>
      }
    >
      <TimetableContent />
    </Suspense>
  )
}