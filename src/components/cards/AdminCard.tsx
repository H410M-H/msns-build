"use client"

import { ArrowRight, CalendarIcon as CalendarCog, type LucideIcon, NotebookPenIcon, Wallet } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card"
import Link from "next/link"

type IconType = LucideIcon

interface Services {
  title: string
  description: string
  icon: IconType
  href: string
  iconColor: string
  bgColor: string
}

const services: Services[] = [
  {
    title: "Session Management",
    description: "Manage academic sessions, terms, and schedules",
    icon: CalendarCog,
    href: "/admin/sessions",
    iconColor: "text-yellow-600",
    bgColor: "bg-yellow-50",
  },
  {
    title: "User Management",
    description: "Manage students, teachers, and staff accounts",
    icon: NotebookPenIcon,
    iconColor: "text-blue-600",
    bgColor: "bg-blue-50",
    href: "/admin/users",
  },
  {
    title: "Revenue Management",
    description: "Track and manage student fees and payments",
    icon: Wallet,
    iconColor: "text-green-600",
    bgColor: "bg-green-50",
    href: "/admin/revenue",
  },
]

export default function AdminCards() {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {services.map((service) => {
        const Icon = service.icon
        return (
          <Link href={service.href} key={service.title} className="group">
            <Card className={`relative overflow-hidden transition-all duration-300 hover:-translate-y-1.5 shadow-sm hover:shadow-lg ${service.bgColor} hover:bg-opacity-90`}>
              <div className="absolute inset-0 bg-gradient-to-br from-white/30 to-transparent" />
              <CardHeader className="relative z-10">
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-xl ${service.bgColor} bg-opacity-20`}>
                    <Icon className={`h-8 w-8 ${service.iconColor}`} />
                  </div>
                  <CardTitle className="text-xl font-semibold text-slate-800">
                    {service.title}
                  </CardTitle>
                </div>
                <CardDescription className="text-slate-600 mt-2">
                  {service.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="relative z-10 pt-4">
                <div className="flex items-center text-sm font-medium text-blue-600 group-hover:text-blue-700 transition-colors">
                  Access Panel
                  <ArrowRight className="h-4 w-4 ml-2 transition-transform group-hover:translate-x-1" />
                </div>
              </CardContent>
            </Card>
          </Link>
        )
      })}
    </div>
  )
}


