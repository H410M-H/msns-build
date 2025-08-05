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
      color: "text-blue-600",
      loading: studentsLoading,
    },
    {
      title: "Faculty & Staff",
      value: employees?.length ?? 0,
      icon: Briefcase,
      description: "Teaching and administrative staff",
      color: "text-green-600",
      loading: employeesLoading,
    },
    {
      title: "Active Classes",
      value: classes?.length ?? 0,
      icon: GraduationCap,
      description: "Ongoing academic classes",
      color: "text-purple-600",
      loading: classesLoading,
    },
    {
      title: "Fee Structures",
      value: fees?.length ?? 0,
      icon: Wallet,
      description: "Defined fee configurations",
      color: "text-yellow-600",
      loading: feesLoading,
    },
  ]

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card 
          key={stat.title} 
          className="relative overflow-hidden bg-gradient-to-br from-white to-slate-50 hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-white/50 to-transparent" />
          <CardHeader className="relative z-10 flex flex-row items-center justify-between space-y-0 pb-4">
            <CardTitle className="text-sm font-semibold text-slate-600">
              {stat.title}
            </CardTitle>
            <div className={`p-2 rounded-lg ${stat.color.replace('text', 'bg')}/20`}>
              <stat.icon className={`h-5 w-5 ${stat.color}`} />
            </div>
          </CardHeader>
          <CardContent className="relative z-10">
            {stat.loading ? (
              <div className="space-y-2">
                <Skeleton className="h-8 w-1/2" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            ) : (
              <>
                <div className="text-3xl font-bold text-slate-900">
                  {stat.value.toLocaleString()}
                </div>
                <p className="text-sm text-slate-500 mt-2">
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