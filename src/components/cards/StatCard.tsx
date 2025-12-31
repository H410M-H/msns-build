"use client"

import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card"
import { Users, Briefcase, GraduationCap, Wallet } from 'lucide-react'
import { api } from "~/trpc/react"
import { Skeleton } from "~/components/ui/skeleton"

export function StatsCards() {
  const { data: students, isLoading: studentsLoading } = api.student.getStudents.useQuery()
  const { data: employees, isLoading: employeesLoading } = api.employee.getEmployees.useQuery()
  const { data: classes, isLoading: classesLoading } = api.class.getClasses.useQuery()
  const { data: fees, isLoading: feesLoading } = api.fee.getAllFees.useQuery()

  const stats = [
    {
      title: "Total Students",
      value: students?.length ?? 0,
      icon: Users,
      description: "Active enrollments",
      // Light: Pastel Emerald | Dark: Glass Emerald
      className: "bg-emerald-50 border-emerald-100 dark:bg-emerald-500/10 dark:border-emerald-500/30",
      textColor: "text-emerald-900 dark:text-white",
      iconBox: "bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400",
      loading: studentsLoading,
    },
    {
      title: "Faculty & Staff",
      value: employees?.length ?? 0,
      icon: Briefcase,
      description: "Teaching staff",
      // Light: Pastel Blue | Dark: Glass Cyan
      className: "bg-blue-50 border-blue-100 dark:bg-cyan-500/10 dark:border-cyan-500/30",
      textColor: "text-blue-900 dark:text-white",
      iconBox: "bg-blue-100 text-blue-600 dark:bg-cyan-500/20 dark:text-cyan-400",
      loading: employeesLoading,
    },
    {
      title: "Active Classes",
      value: classes?.length ?? 0,
      icon: GraduationCap,
      description: "Academic sessions",
      // Light: Pastel Violet | Dark: Glass Teal
      className: "bg-violet-50 border-violet-100 dark:bg-teal-500/10 dark:border-teal-500/30",
      textColor: "text-violet-900 dark:text-white",
      iconBox: "bg-violet-100 text-violet-600 dark:bg-teal-500/20 dark:text-teal-400",
      loading: classesLoading,
    },
    {
      title: "Fee Structures",
      value: fees?.length ?? 0,
      icon: Wallet,
      description: "Revenue streams",
      // Light: Pastel Amber | Dark: Glass Lime
      className: "bg-amber-50 border-amber-100 dark:bg-lime-500/10 dark:border-lime-500/30",
      textColor: "text-amber-900 dark:text-white",
      iconBox: "bg-amber-100 text-amber-600 dark:bg-lime-500/20 dark:text-lime-400",
      loading: feesLoading,
    },
  ]

  return (
    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 xl:grid-cols-4">
      {stats.map((stat) => (
        <Card
          key={stat.title}
          className={`relative overflow-hidden border transition-all duration-300 hover:shadow-lg hover:-translate-y-1 ${stat.className}`}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className={`text-sm font-semibold opacity-70 ${stat.textColor}`}>
              {stat.title}
            </CardTitle>
            <div className={`p-2 rounded-xl ${stat.iconBox}`}>
              <stat.icon className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            {stat.loading ? (
              <div className="space-y-2">
                <Skeleton className="h-8 w-1/2 bg-black/5 dark:bg-white/10" />
                <Skeleton className="h-4 w-3/4 bg-black/5 dark:bg-white/10" />
              </div>
            ) : (
              <>
                <div className={`text-2xl font-bold tracking-tight ${stat.textColor}`}>
                  {stat.value.toLocaleString()}
                </div>
                <p className={`text-xs mt-1 font-medium opacity-60 ${stat.textColor}`}>
                  {stat.description}
                </p>
              </>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}