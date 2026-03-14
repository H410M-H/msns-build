// File: src/components/cards/AdminCard.tsx
"use client";

import {
  ArrowRight,
  CalendarDays,
  ClipboardList,
  DollarSign,
  FileBarChart,
  Fingerprint,
  GraduationCap,
  type LucideIcon,
  Users,
  UserCheck,
  BookOpen,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import Link from "next/link";

type IconType = LucideIcon;

interface Services {
  title: string;
  description: string;
  icon: IconType;
  href: string;
  baseColor: string;
  lightBg: string;
  darkBg: string;
  iconColor: string;
}

const COLOR_MAP: Record<
  string,
  { border: string; iconBox: string; text: string }
> = {
  emerald: {
    border:
      "border-emerald-200 dark:border-emerald-500/20 group-hover:border-emerald-300 dark:group-hover:border-emerald-500/50",
    iconBox:
      "bg-emerald-100 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20",
    text: "text-emerald-600 dark:text-emerald-400",
  },
  cyan: {
    border:
      "border-cyan-200 dark:border-cyan-500/20 group-hover:border-cyan-300 dark:group-hover:border-cyan-500/50",
    iconBox:
      "bg-cyan-100 dark:bg-cyan-500/10 border-cyan-200 dark:border-cyan-500/20",
    text: "text-cyan-600 dark:text-cyan-400",
  },
  amber: {
    border:
      "border-amber-200 dark:border-amber-500/20 group-hover:border-amber-300 dark:group-hover:border-amber-500/50",
    iconBox:
      "bg-amber-100 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/20",
    text: "text-amber-600 dark:text-amber-400",
  },
  blue: {
    border:
      "border-blue-200 dark:border-blue-500/20 group-hover:border-blue-300 dark:group-hover:border-blue-500/50",
    iconBox:
      "bg-blue-100 dark:bg-blue-500/10 border-blue-200 dark:border-blue-500/20",
    text: "text-blue-600 dark:text-blue-400",
  },
  purple: {
    border:
      "border-purple-200 dark:border-purple-500/20 group-hover:border-purple-300 dark:group-hover:border-purple-500/50",
    iconBox:
      "bg-purple-100 dark:bg-purple-500/10 border-purple-200 dark:border-purple-500/20",
    text: "text-purple-600 dark:text-purple-400",
  },
  rose: {
    border:
      "border-rose-200 dark:border-rose-500/20 group-hover:border-rose-300 dark:group-hover:border-rose-500/50",
    iconBox:
      "bg-rose-100 dark:bg-rose-500/10 border-rose-200 dark:border-rose-500/20",
    text: "text-rose-600 dark:text-rose-400",
  },
  teal: {
    border:
      "border-teal-200 dark:border-teal-500/20 group-hover:border-teal-300 dark:group-hover:border-teal-500/50",
    iconBox:
      "bg-teal-100 dark:bg-teal-500/10 border-teal-200 dark:border-teal-500/20",
    text: "text-teal-600 dark:text-teal-400",
  },
  lime: {
    border:
      "border-lime-200 dark:border-lime-500/20 group-hover:border-lime-300 dark:group-hover:border-lime-500/50",
    iconBox:
      "bg-lime-100 dark:bg-lime-500/10 border-lime-200 dark:border-lime-500/20",
    text: "text-lime-600 dark:text-lime-400",
  },
  orange: {
    border:
      "border-orange-200 dark:border-orange-500/20 group-hover:border-orange-300 dark:group-hover:border-orange-500/50",
    iconBox:
      "bg-orange-100 dark:bg-orange-500/10 border-orange-200 dark:border-orange-500/20",
    text: "text-orange-600 dark:text-orange-400",
  },
};

interface AdminCardsProps {
  basePrefix?: string;
}

function getServices(prefix: string): Services[] {
  return [
    {
      title: "Session Management",
      description: "Manage academic sessions, terms, and school years",
      icon: CalendarDays,
      href: `${prefix}/sessions`,
      baseColor: "emerald",
      lightBg: "hover:bg-emerald-50/60",
      darkBg: "hover:bg-emerald-950/30",
      iconColor: "text-emerald-600 dark:text-emerald-400",
    },
    {
      title: "User Management",
      description: "Manage students, teachers, and all staff accounts",
      icon: Users,
      href: `${prefix}/users`,
      baseColor: "cyan",
      lightBg: "hover:bg-cyan-50/60",
      darkBg: "hover:bg-cyan-950/30",
      iconColor: "text-cyan-600 dark:text-cyan-400",
    },
    {
      title: "Revenue Management",
      description: "Track fees, salaries, expenses and financial reports",
      icon: DollarSign,
      href: `${prefix}/revenue`,
      baseColor: "amber",
      lightBg: "hover:bg-amber-50/60",
      darkBg: "hover:bg-amber-950/30",
      iconColor: "text-amber-600 dark:text-amber-400",
    },
    {
      title: "Exam Management",
      description: "Manage exams, datesheets, marks and report cards",
      icon: GraduationCap,
      href: `${prefix}/exams`,
      baseColor: "purple",
      lightBg: "hover:bg-purple-50/60",
      darkBg: "hover:bg-purple-950/30",
      iconColor: "text-purple-600 dark:text-purple-400",
    },
    {
      title: "Attendance",
      description: "Record and monitor student and employee attendance",
      icon: UserCheck,
      href: `${prefix}/sessions`,
      baseColor: "blue",
      lightBg: "hover:bg-blue-50/60",
      darkBg: "hover:bg-blue-950/30",
      iconColor: "text-blue-600 dark:text-blue-400",
    },
    {
      title: "Timetable",
      description: "Schedule classes, assign teachers and time slots",
      icon: ClipboardList,
      href: `${prefix}/sessions`,
      baseColor: "teal",
      lightBg: "hover:bg-teal-50/60",
      darkBg: "hover:bg-teal-950/30",
      iconColor: "text-teal-600 dark:text-teal-400",
    },
    {
      title: "Subject Diary",
      description: "View and review teacher diary entries and curriculum progress",
      icon: BookOpen,
      href: `${prefix}/sessions`,
      baseColor: "rose",
      lightBg: "hover:bg-rose-50/60",
      darkBg: "hover:bg-rose-950/30",
      iconColor: "text-rose-600 dark:text-rose-400",
    },
    {
      title: "Reports",
      description: "Generate and export PDF reports for all modules",
      icon: FileBarChart,
      href: `${prefix}/revenue`,
      baseColor: "lime",
      lightBg: "hover:bg-lime-50/60",
      darkBg: "hover:bg-lime-950/30",
      iconColor: "text-lime-600 dark:text-lime-400",
    },
    {
      title: "Biometric Data",
      description: "Manage employee fingerprint enrollment and records",
      icon: Fingerprint,
      href: `${prefix}/users`,
      baseColor: "orange",
      lightBg: "hover:bg-orange-50/60",
      darkBg: "hover:bg-orange-950/30",
      iconColor: "text-orange-600 dark:text-orange-400",
    },
  ];
}

export default function AdminCards({ basePrefix = "/admin" }: AdminCardsProps) {
  const services = getServices(basePrefix);
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {services.map((service) => {
        const Icon = service.icon;
        const colors = COLOR_MAP[service.baseColor] ?? COLOR_MAP.emerald!;

        return (
          <Link
            href={service.href}
            key={service.title}
            className="group block h-full"
          >
            <Card
              className={`relative h-full overflow-hidden border bg-white backdrop-blur-sm transition-all duration-300 dark:bg-card ${colors.border} ${service.lightBg} ${service.darkBg} hover:-translate-y-1 hover:shadow-lg dark:hover:shadow-none`}
            >
              {/* Subtle Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/50 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100 dark:from-white/5" />

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
                  <div
                    className={`shrink-0 rounded-xl border p-2.5 ${colors.iconBox} transition-transform duration-300 group-hover:rotate-3 group-hover:scale-110`}
                  >
                    <Icon className={`h-5 w-5 ${service.iconColor}`} />
                  </div>
                </div>
              </CardHeader>

              <CardContent className="relative z-10 mt-auto p-5 pt-0">
                <div
                  className={`flex items-center text-xs font-bold ${service.iconColor} opacity-80 transition-all group-hover:opacity-100`}
                >
                  Access Panel
                  <ArrowRight className="ml-1.5 h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" />
                </div>
              </CardContent>
            </Card>
          </Link>
        );
      })}
    </div>
  );
}
