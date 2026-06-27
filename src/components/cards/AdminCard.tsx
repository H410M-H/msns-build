// File: src/components/cards/AdminCard.tsx
"use client";

import {
  ArrowRight,
  CalendarIcon as CalendarCog,
  type LucideIcon,
  NotebookPenIcon,
  Wallet,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import Link from "next/link";
import { api } from "~/trpc/react";

type IconType = LucideIcon;

interface SubAction {
  label: string;
  href: string;
  dynamicHref?: (activeSessionId?: string) => string;
}

interface Services {
  title: string;
  description: string;
  icon: IconType;
  href: string;
  // Color configuration
  baseColor: string; // Base color for borders/text (e.g., "emerald")
  lightBg: string; // Background for light mode
  darkBg: string; // Background for dark mode
  iconColor: string; // Icon text color
  subActions?: SubAction[];
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
    subActions: [
      { label: "All Sessions", href: "/admin/sessions" },
      {
        label: "Active Details",
        href: "/admin/sessions",
        dynamicHref: (activeId) => (activeId ? `/admin/sessions/${activeId}` : "/admin/sessions"),
      },
      { label: "Timetable", href: "/admin/sessions/timetable" },
      { label: "Fee Ledger", href: "/admin/sessions/fee" },
    ],
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
    subActions: [
      { label: "Students", href: "/admin/users/student/view" },
      { label: "Faculty", href: "/admin/users/faculty/view" },
      { label: "Student Attendance", href: "/admin/attendance" },
    ],
  },
  {
    title: "Revenue Management",
    description: "Track and manage student fees and payments",
    icon: Wallet,
    href: "/admin/erp/revenue",
    baseColor: "amber",
    lightBg: "hover:bg-amber-50/60",
    darkBg: "hover:bg-amber-950/30",
    iconColor: "text-amber-600 dark:text-amber-400",
    subActions: [
      { label: "Overview", href: "/admin/erp/revenue" },
      { label: "Fees", href: "/admin/erp/revenue/fee" },
      { label: "Salaries", href: "/admin/erp/revenue/salary" },
      { label: "Expenses", href: "/admin/erp/revenue/expense" },
    ],
  },
];

export default function AdminCards() {
  const { data: activeSession } = api.session.getActiveSession.useQuery();

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {services.map((service) => {
        const Icon = service.icon;

        // Dynamic class generation based on the base color
        const borderColor = {
          emerald:
            "border-emerald-200 dark:border-emerald-500/20 hover:border-emerald-300 dark:hover:border-emerald-500/50",
          cyan: "border-cyan-200 dark:border-cyan-500/20 hover:border-cyan-300 dark:hover:border-cyan-500/50",
          amber:
            "border-amber-200 dark:border-amber-500/20 hover:border-amber-300 dark:hover:border-amber-500/50",
        }[service.baseColor];

        const iconBoxStyles = {
          emerald:
            "bg-emerald-100 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20",
          cyan: "bg-cyan-100 dark:bg-cyan-500/10 border-cyan-200 dark:border-cyan-500/20",
          amber:
            "bg-amber-100 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/20",
        }[service.baseColor];

        return (
          <div key={service.title} className="h-full">
            <Card
              className={`relative flex h-full flex-col overflow-hidden border bg-white backdrop-blur-sm transition-all duration-300 dark:bg-card ${borderColor} ${service.lightBg} ${service.darkBg} hover:-translate-y-1 hover:shadow-lg dark:hover:shadow-none`}
            >
              {/* Subtle Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/50 via-transparent to-transparent opacity-0 transition-opacity duration-300 hover:opacity-100 dark:from-white/5" />

              <CardHeader className="relative z-10 p-5 pb-3">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1.5">
                    <CardTitle className="text-base font-bold leading-tight tracking-tight text-slate-900 dark:text-foreground">
                      {service.title}
                    </CardTitle>
                    <CardDescription className="line-clamp-2 text-xs font-medium leading-relaxed text-muted-foreground dark:text-muted-foreground">
                      {service.description}
                    </CardDescription>
                  </div>

                  {/* Icon Box */}
                  <Link href={service.href}>
                    <div
                      className={`shrink-0 rounded-xl border p-2.5 ${iconBoxStyles} transition-transform duration-300 hover:rotate-3 hover:scale-110`}
                    >
                      <Icon className={`h-5 w-5 ${service.iconColor}`} />
                    </div>
                  </Link>
                </div>
              </CardHeader>

              {/* Sub-actions area and Main Link */}
              <CardContent className="relative z-10 mt-auto flex flex-col gap-4 p-5 pt-0">
                {service.subActions && (
                  <div className="flex flex-wrap gap-1.5 pt-2 border-t border-slate-100 dark:border-white/5">
                    {service.subActions.map((subAction) => {
                      const href = subAction.dynamicHref
                        ? subAction.dynamicHref(activeSession?.sessionId)
                        : subAction.href;
                      return (
                        <Link
                          key={subAction.label}
                          href={href}
                          className={`px-2 py-1 text-[10px] font-bold rounded-md border bg-white hover:bg-slate-50 transition-all duration-200 shadow-sm hover:shadow dark:bg-black/20 dark:hover:bg-white/5 ${
                            service.baseColor === "emerald"
                              ? "border-emerald-500/20 text-emerald-600 dark:text-emerald-400 hover:border-emerald-500/50"
                              : service.baseColor === "cyan"
                                ? "border-cyan-500/20 text-cyan-600 dark:text-cyan-400 hover:border-cyan-500/50"
                                : "border-amber-500/20 text-amber-600 dark:text-amber-400 hover:border-amber-500/50"
                          }`}
                        >
                          {subAction.label}
                        </Link>
                      );
                    })}
                  </div>
                )}

                <Link
                  href={service.href}
                  className={`flex items-center text-xs font-bold ${service.iconColor} opacity-80 transition-all hover:opacity-100`}
                >
                  Access Panel
                  <ArrowRight className="ml-1.5 h-3.5 w-3.5 transition-transform duration-300 hover:translate-x-1" />
                </Link>
              </CardContent>
            </Card>
          </div>
        );
      })}
    </div>
  );
}
