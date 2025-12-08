"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card"
import { Badge } from "~/components/ui/badge"
import { Progress } from "~/components/ui/progress"
import { Skeleton } from "~/components/ui/skeleton"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "~/components/ui/dialog"
import { Users, TrendingUp, ChevronRight, GraduationCap } from "lucide-react"
import { cn } from "~/lib/utils"
import { ClassFeeTable } from "~/components/tables/ClassFee"

interface MonthlyData {
  month: string
  monthNumber: number
  totalExpected: number
  totalCollected: number
  outstanding: number
  paidCount: number
  unpaidCount: number
  collectionRate: number
}

interface ClassSummary {
  classId: string
  className: string
  category: string
  studentCount: number
  monthlyData: MonthlyData[]
  yearlyTotals: {
    totalExpected: number
    totalCollected: number
    outstanding: number
  }
  collectionRate: number
}

interface ClassFeeCardsProps {
  sessionId: string
  year: number
  classData?: ClassSummary[]
  isLoading: boolean
}

const categoryColors: Record<string, string> = {
  Montessori: "bg-pink-100 text-pink-700 border-pink-200",
  Primary: "bg-blue-100 text-blue-700 border-blue-200",
  Middle: "bg-green-100 text-green-700 border-green-200",
  SSC_I: "bg-purple-100 text-purple-700 border-purple-200",
  SSC_II: "bg-orange-100 text-orange-700 border-orange-200",
}

export function ClassFeeCards({ sessionId, classData, isLoading }: ClassFeeCardsProps) {
  const [selectedClass, setSelectedClass] = useState<{ classId: string; className: string } | null>(null)

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array(6)
          .fill(0)
          .map((_, i) => (
            <Card key={i} className="bg-white">
              <CardHeader className="pb-3">
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardContent className="space-y-4">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-8 w-full" />
              </CardContent>
            </Card>
          ))}
      </div>
    )
  }

  if (!classData?.length) {
    return (
      <Card className="bg-white">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <GraduationCap className="h-12 w-12 text-slate-300 mb-4" />
          <p className="text-slate-600 font-medium">No class data available</p>
          <p className="text-sm text-slate-500 mt-1">Select a session to view class fee details</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {classData.map((cls) => (
          <Card
            key={cls.classId}
            className="bg-white hover:shadow-lg transition-all cursor-pointer group"
            onClick={() => setSelectedClass({ classId: cls.classId, className: cls.className })}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CardTitle className="text-lg font-semibold text-slate-900">{cls.className}</CardTitle>
                  <Badge variant="outline" className={cn("text-xs", categoryColors[cls.category])}>
                    {cls.category}
                  </Badge>
                </div>
                <ChevronRight className="h-5 w-5 text-slate-400 group-hover:text-slate-600 transition-colors" />
              </div>
              <div className="flex items-center gap-4 mt-2 text-sm text-slate-600">
                <span className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  {cls.studentCount} students
                </span>
                <span className="flex items-center gap-1">
                  <TrendingUp className="h-4 w-4" />
                  {cls.collectionRate.toFixed(1)}% collected
                </span>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Progress Bar */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Collection Progress</span>
                  <span className="font-medium text-slate-900">
                    Rs. {cls.yearlyTotals.totalCollected.toLocaleString()}
                  </span>
                </div>
                <Progress value={cls.collectionRate} className="h-2" />
                <div className="flex justify-between text-xs text-slate-500">
                  <span>Rs. 0</span>
                  <span>Rs. {cls.yearlyTotals.totalExpected.toLocaleString()}</span>
                </div>
              </div>

              {/* Monthly Mini Grid */}
              <div className="grid grid-cols-6 gap-1">
                {cls.monthlyData.slice(0, 12).map((month) => {
                  const hasData = month.totalExpected > 0
                  const isPaid = month.collectionRate >= 90
                  const isPartial = month.collectionRate > 0 && month.collectionRate < 90

                  return (
                    <div
                      key={month.monthNumber}
                      className={cn(
                        "aspect-square rounded-sm flex items-center justify-center text-[10px] font-medium",
                        !hasData && "bg-slate-100 text-slate-400",
                        hasData && isPaid && "bg-emerald-100 text-emerald-700",
                        hasData && isPartial && "bg-amber-100 text-amber-700",
                        hasData && !isPaid && !isPartial && "bg-red-100 text-red-700",
                      )}
                      title={`${month.month}: Rs. ${month.totalCollected.toLocaleString()} / Rs. ${month.totalExpected.toLocaleString()}`}
                    >
                      {month.month.slice(0, 1)}
                    </div>
                  )
                })}
              </div>

              {/* Summary Stats */}
              <div className="grid grid-cols-2 gap-3 pt-2 border-t">
                <div className="text-center p-2 bg-emerald-50 rounded-lg">
                  <p className="text-xs text-emerald-600 font-medium">Collected</p>
                  <p className="text-sm font-bold text-emerald-700">
                    Rs. {cls.yearlyTotals.totalCollected.toLocaleString()}
                  </p>
                </div>
                <div className="text-center p-2 bg-orange-50 rounded-lg">
                  <p className="text-xs text-orange-600 font-medium">Outstanding</p>
                  <p className="text-sm font-bold text-orange-700">
                    Rs. {cls.yearlyTotals.outstanding.toLocaleString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Class Detail Dialog */}
      <Dialog open={!!selectedClass} onOpenChange={() => setSelectedClass(null)}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl">{selectedClass?.className} - Fee Details</DialogTitle>
            <DialogDescription>View and manage monthly fee payments for this class</DialogDescription>
          </DialogHeader>
          {selectedClass && <ClassFeeTable classId={selectedClass.classId} sessionId={sessionId} />}
        </DialogContent>
      </Dialog>
    </>
  )
}
