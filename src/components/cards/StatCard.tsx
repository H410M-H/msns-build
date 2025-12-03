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
      description: "Currently enrolled students",
      color: "text-emerald-400",
      bgColor: "bg-emerald-500/10",
      borderColor: "border-emerald-500/30",
      loading: studentsLoading,
    },
    {
      title: "Faculty & Staff",
      value: employees?.length ?? 0,
      icon: Briefcase,
      description: "Teaching staff",
      color: "text-cyan-400",
      bgColor: "bg-cyan-500/10",
      borderColor: "border-cyan-500/30",
      loading: employeesLoading,
    },
    {
      title: "Active Classes",
      value: classes?.length ?? 0,
      icon: GraduationCap,
      description: "Academic classes",
      color: "text-teal-400",
      bgColor: "bg-teal-500/10",
      borderColor: "border-teal-500/30",
      loading: classesLoading,
    },
    {
      title: "Fee Structures",
      value: fees?.length ?? 0,
      icon: Wallet,
      description: "Fee configurations",
      color: "text-lime-400",
      bgColor: "bg-lime-500/10",
      borderColor: "border-lime-500/30",
      loading: feesLoading,
    },
  ]

  return (
    <div className="relative">
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <Card
            key={stat.title}
            className={`relative overflow-hidden ${stat.bgColor} border ${stat.borderColor} backdrop-blur-md transition-all duration-300 hover:bg-white/10 hover:-translate-y-1 hover:shadow-lg`}
          >
            <CardHeader className="relative z-10 flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-semibold text-emerald-100/70">
                {stat.title}
              </CardTitle>
              <div className={`p-2 rounded-xl bg-white/5 border border-white/10`}>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent className="relative z-10 pt-2">
              {stat.loading ? (
                <div className="space-y-2">
                  <Skeleton className="h-8 w-1/2 bg-white/10" />
                  <Skeleton className="h-4 w-3/4 bg-white/10" />
                </div>
              ) : (
                <>
                  <div className="text-2xl font-bold text-white tracking-tight">
                    {stat.value.toLocaleString()}
                  </div>
                  <p className="text-xs text-emerald-100/50 mt-1 font-medium">
                    {stat.description}
                  </p>
                </>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}