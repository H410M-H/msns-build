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
  borderColor: string
  hoverShadow: string
}

const services: Services[] = [
  {
    title: "Session Management",
    description: "Manage academic sessions, terms, and schedules",
    icon: CalendarCog,
    href: "/admin/sessions",
    iconColor: "text-emerald-400",
    bgColor: "bg-emerald-500/5",
    borderColor: "border-emerald-500/20",
    hoverShadow: "hover:shadow-emerald-500/10",
  },
  {
    title: "User Management",
    description: "Manage students, teachers, and staff accounts",
    icon: NotebookPenIcon,
    href: "/admin/users",
    iconColor: "text-cyan-400",
    bgColor: "bg-cyan-500/5",
    borderColor: "border-cyan-500/20",
    hoverShadow: "hover:shadow-cyan-500/10",
  },
  {
    title: "Revenue Management",
    description: "Track and manage student fees and payments",
    icon: Wallet,
    href: "/admin/revenue",
    iconColor: "text-amber-400",
    bgColor: "bg-amber-500/5",
    borderColor: "border-amber-500/20",
    hoverShadow: "hover:shadow-amber-500/10",
  },
]

export default function AdminCards() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {services.map((service) => {
        const Icon = service.icon
        return (
          <Link href={service.href} key={service.title} className="group block">
            <Card className={`relative overflow-hidden transition-all duration-300 ${service.bgColor} border ${service.borderColor} hover:border-opacity-50 hover:-translate-y-1 hover:shadow-lg ${service.hoverShadow} backdrop-blur-md`}>
              
              {/* Gradient overlay on hover */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
              
              <CardHeader className="relative z-10 p-5 pb-2">
                <div className="flex items-center justify-between gap-3">
                  <div className="space-y-1">
                    <CardTitle className="text-base font-bold text-white tracking-tight group-hover:text-white/90 transition-colors">
                        {service.title}
                    </CardTitle>
                    <CardDescription className="text-emerald-100/50 text-xs font-medium line-clamp-1">
                        {service.description}
                    </CardDescription>
                  </div>
                  <div className={`p-2 rounded-xl bg-black/20 border border-white/5 group-hover:scale-105 transition-transform duration-500 shrink-0`}>
                    <Icon className={`h-5 w-5 ${service.iconColor} drop-shadow-sm`} />
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="relative z-10 p-5 pt-2">
                <div className={`flex items-center text-xs font-semibold ${service.iconColor} opacity-70 group-hover:opacity-100 transition-all`}>
                  Access Panel
                  <ArrowRight className="h-3 w-3 ml-1.5 transition-transform duration-300 group-hover:translate-x-1" />
                </div>
              </CardContent>
            </Card>
          </Link>
        )
      })}
    </div>
  )
}