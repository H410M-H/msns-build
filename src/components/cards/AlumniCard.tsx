// File: src/components/cards/AlumniCard.tsx
"use client";

import {
  CalendarCog,
  NotebookPen,
  Wallet,
  ChevronRight,
  ArrowRight,
  type LucideIcon,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import Link from "next/link";
import { cn } from "~/lib/utils";
import { api } from "~/trpc/react";

interface SubAction {
  label: string;
  href: string;
  dynamicHref?: (activeSessionId?: string) => string;
}

interface Services {
  title: string;
  description: string;
  icon: LucideIcon;
  href: string;
  gradient: string;
  iconColor: string;
  subActions?: SubAction[];
}

const services: Services[] = [
  {
    title: "Session Management",
    description: "Manage academic sessions & terms.",
    icon: CalendarCog,
    href: "/clerk/sessions",
    gradient: "from-amber-500/20 to-orange-600/5",
    iconColor: "text-amber-400",
    subActions: [
      { label: "All Sessions", href: "/clerk/sessions" },
      {
        label: "Active Details",
        href: "/clerk/sessions",
        dynamicHref: (activeId) => (activeId ? `/clerk/sessions/${activeId}` : "/clerk/sessions"),
      },
      { label: "Timetable", href: "/clerk/sessions/timetable" },
      { label: "Fee Ledger", href: "/clerk/sessions/fee" },
    ],
  },
  {
    title: "User Management",
    description: "Control access for all users.",
    icon: NotebookPen,
    href: "/clerk/users",
    gradient: "from-blue-500/20 to-indigo-600/5",
    iconColor: "text-blue-400",
    subActions: [
      { label: "Students", href: "/clerk/users/student/view" },
      { label: "Faculty", href: "/clerk/users/faculty/view" },
      { label: "Student Attendance", href: "/clerk/attendance" },
    ],
  },
  {
    title: "Revenue Management",
    description: "Track fees and payments.",
    icon: Wallet,
    href: "/clerk/sessions/fee",
    gradient: "from-emerald-500/20 to-teal-600/5",
    iconColor: "text-emerald-400",
    subActions: [
      { label: "Fee Ledger/Transactions", href: "/clerk/sessions/fee" },
    ],
  },
];

export default function AlumniCard() {
  const { data: activeSession } = api.session.getActiveSession.useQuery();

  return (
    <div className="grid h-full grid-cols-1 gap-3 sm:gap-4 md:grid-cols-2 lg:grid-cols-3">
      {services.map((service, index) => {
        const Icon = service.icon;
        return (
          <div key={index} className="h-full">
            <Card
              className={cn(
                "relative flex h-full flex-col overflow-hidden border-border bg-card backdrop-blur-sm transition-all duration-300 hover:border-border hover:shadow-xl",
              )}
            >
              <div
                className={`absolute inset-0 bg-gradient-to-br ${service.gradient} opacity-0 transition-opacity duration-500 hover:opacity-100`}
              />

              <CardHeader className="relative z-10 space-y-2 p-4 pb-2">
                <div className="flex items-start justify-between">
                  <Link href={service.href}>
                    <div
                      className={`rounded-lg bg-white/5 p-2 ring-1 ring-white/10 transition-colors hover:bg-white/10 ${service.iconColor}`}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                  </Link>
                  <Link href={service.href}>
                    <div className="rounded-full border border-border bg-white/5 p-1 text-muted-foreground transition-colors hover:text-foreground">
                      <ChevronRight className="h-3 w-3" />
                    </div>
                  </Link>
                </div>

                <CardTitle className="text-base font-semibold text-foreground transition-colors hover:text-emerald-100">
                  {service.title}
                </CardTitle>
                <CardDescription className="line-clamp-2 text-xs text-muted-foreground">
                  {service.description}
                </CardDescription>
              </CardHeader>

              {/* Sub Actions and Access Panel */}
              <CardContent className="relative z-10 mt-auto flex flex-col gap-4 p-4 pt-0">
                {service.subActions && (
                  <div className="flex flex-wrap gap-1.5 pt-2 border-t border-white/5">
                    {service.subActions.map((subAction) => {
                      const href = subAction.dynamicHref
                        ? subAction.dynamicHref(activeSession?.sessionId)
                        : subAction.href;
                      return (
                        <Link
                          key={subAction.label}
                          href={href}
                          className="px-2 py-1 text-[10px] font-bold rounded-md border border-white/10 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-foreground transition-all duration-200 shadow-sm"
                        >
                          {subAction.label}
                        </Link>
                      );
                    })}
                  </div>
                )}

                <Link
                  href={service.href}
                  className={cn(
                    "flex items-center text-xs font-bold opacity-85 transition-all hover:opacity-100",
                    service.iconColor
                  )}
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
