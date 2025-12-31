// File: src/components/cards/AdminCard.tsx
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
  // Color configuration
  baseColor: string // Base color for borders/text (e.g., "emerald")
  lightBg: string // Background for light mode
  darkBg: string // Background for dark mode
  iconColor: string // Icon text color
}

const services: Services[] = [
  {
    title: "Session Management",
    description: "Manage academic sessions, terms, and schedules",
    icon: CalendarCog,
    href: "/admin/sessions",
    baseColor: "emerald",
    lightBg: "hover:bg-emerald-50/60",
    darkBg: "hover:bg-emerald-950/30",
    iconColor: "text-emerald-600 dark:text-emerald-400",
  },
  {
    title: "User Management",
    description: "Manage students, teachers, and staff accounts",
    icon: NotebookPenIcon,
    href: "/admin/users",
    baseColor: "cyan",
    lightBg: "hover:bg-cyan-50/60",
    darkBg: "hover:bg-cyan-950/30",
    iconColor: "text-cyan-600 dark:text-cyan-400",
  },
  {
    title: "Revenue Management",
    description: "Track and manage student fees and payments",
    icon: Wallet,
    href: "/admin/revenue",
    baseColor: "amber",
    lightBg: "hover:bg-amber-50/60",
    darkBg: "hover:bg-amber-950/30",
    iconColor: "text-amber-600 dark:text-amber-400",
  },
]

export default function AdminCards() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {services.map((service) => {
        const Icon = service.icon
        
        // Dynamic class generation based on the base color
        const borderColor = {
          emerald: "border-emerald-200 dark:border-emerald-500/20 group-hover:border-emerald-300 dark:group-hover:border-emerald-500/50",
          cyan: "border-cyan-200 dark:border-cyan-500/20 group-hover:border-cyan-300 dark:group-hover:border-cyan-500/50",
          amber: "border-amber-200 dark:border-amber-500/20 group-hover:border-amber-300 dark:group-hover:border-amber-500/50",
        }[service.baseColor]

        const iconBoxStyles = {
          emerald: "bg-emerald-100 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20",
          cyan: "bg-cyan-100 dark:bg-cyan-500/10 border-cyan-200 dark:border-cyan-500/20",
          amber: "bg-amber-100 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/20",
        }[service.baseColor]

        return (
          <Link href={service.href} key={service.title} className="group block h-full">
            <Card className={`relative h-full overflow-hidden border bg-white dark:bg-slate-900/40 backdrop-blur-sm transition-all duration-300 ${borderColor} ${service.lightBg} ${service.darkBg} hover:-translate-y-1 hover:shadow-lg dark:hover:shadow-none`}>
              
              {/* Subtle Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/50 via-transparent to-transparent dark:from-white/5 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              
              <CardHeader className="relative z-10 p-5 pb-3">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1.5">
                    <CardTitle className="text-base font-bold text-slate-900 dark:text-white leading-tight tracking-tight">
                        {service.title}
                    </CardTitle>
                    <CardDescription className="text-slate-500 dark:text-slate-400 text-xs font-medium leading-relaxed line-clamp-2">
                        {service.description}
                    </CardDescription>
                  </div>
                  
                  {/* Icon Box */}
                  <div className={`shrink-0 p-2.5 rounded-xl border ${iconBoxStyles} transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3`}>
                    <Icon className={`h-5 w-5 ${service.iconColor}`} />
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="relative z-10 p-5 pt-0 mt-auto">
                <div className={`flex items-center text-xs font-bold ${service.iconColor} opacity-80 group-hover:opacity-100 transition-all`}>
                  Access Panel
                  <ArrowRight className="h-3.5 w-3.5 ml-1.5 transition-transform duration-300 group-hover:translate-x-1" />
                </div>
              </CardContent>
            </Card>
          </Link>
        )
      })}
    </div>
  )
}