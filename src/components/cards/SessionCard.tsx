// File: src/components/cards/SessionCard.tsx
"use client";

import {
  Boxes,
  FileStack,
  UserPlus,
  type LucideIcon,
  ArrowUpRight,
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

interface Service {
  title: string;
  description: string;
  icon: LucideIcon;
  href: string;
  baseColor: "emerald" | "cyan" | "purple"; // Simplified to drive dynamic styles
}

const services: Service[] = [
  {
    title: "Classes Allotment",
    description: "Enroll employees and manage class assignments efficiently.",
    icon: UserPlus,
    href: "/academics/classDetail",
    baseColor: "emerald",
  },
  {
    title: "Section Management",
    description: "Organize class sections and streamline student grouping.",
    icon: Boxes,
    href: "/academics/classwiseDetail",
    baseColor: "cyan",
  },
  {
    title: "Sessional Reports",
    description: "Generate, view, and export comprehensive academic reports.",
    icon: FileStack,
    href: "/reports/sessional",
    baseColor: "purple",
  },
];

export default function SessionCards() {
  return (
    <div className="w-full">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {services.map((service) => {
          const Icon = service.icon;

          // Dynamic Style Logic based on baseColor
          const styles = {
            emerald: {
              icon: "text-emerald-600 dark:text-emerald-400",
              iconBg:
                "bg-emerald-100 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20",
              borderHover:
                "group-hover:border-emerald-300 dark:group-hover:border-emerald-500/40",
              gradient:
                "from-emerald-50/50 via-transparent to-transparent dark:from-emerald-500/10",
              ring: "focus-visible:ring-emerald-500",
            },
            cyan: {
              icon: "text-cyan-600 dark:text-cyan-400",
              iconBg:
                "bg-cyan-100 dark:bg-cyan-500/10 border-cyan-200 dark:border-cyan-500/20",
              borderHover:
                "group-hover:border-cyan-300 dark:group-hover:border-cyan-500/40",
              gradient:
                "from-cyan-50/50 via-transparent to-transparent dark:from-cyan-500/10",
              ring: "focus-visible:ring-cyan-500",
            },
            purple: {
              icon: "text-purple-600 dark:text-purple-400",
              iconBg:
                "bg-purple-100 dark:bg-purple-500/10 border-purple-200 dark:border-purple-500/20",
              borderHover:
                "group-hover:border-purple-300 dark:group-hover:border-purple-500/40",
              gradient:
                "from-purple-50/50 via-transparent to-transparent dark:from-purple-500/10",
              ring: "focus-visible:ring-purple-500",
            },
          }[service.baseColor];

          return (
            <Link
              href={service.href}
              key={service.title}
              className={cn(
                "group block h-full rounded-xl outline-none transition-transform active:scale-[0.98]",
                "focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-slate-950",
                styles.ring,
              )}
            >
              <Card
                className={cn(
                  "relative h-full overflow-hidden rounded-xl border transition-all duration-300",
                  // Light Mode: White bg, Slate border
                  "border-slate-200 bg-white hover:-translate-y-1 hover:shadow-lg",
                  // Dark Mode: Glass bg, White/5 border
                  "dark:border-border dark:bg-card dark:backdrop-blur-sm dark:hover:bg-card dark:hover:shadow-none",
                  styles.borderHover,
                )}
              >
                {/* Background Gradient Effect */}
                <div
                  className={cn(
                    "absolute inset-0 bg-gradient-to-br opacity-0 transition-opacity duration-500 group-hover:opacity-100",
                    styles.gradient,
                  )}
                />

                <CardHeader className="relative z-10 px-4 py-3">
                  <div className="mb-3 flex items-start justify-between">
                    {/* Icon Container */}
                    <div
                      className={cn(
                        "flex h-10 w-10 items-center justify-center rounded-lg border shadow-sm transition-transform duration-300 group-hover:rotate-3 group-hover:scale-110 dark:shadow-inner",
                        styles.iconBg,
                      )}
                    >
                      <Icon className={cn("h-5 w-5", styles.icon)} />
                    </div>

                    {/* Action Arrow */}
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 text-muted-foreground transition-all duration-300 group-hover:bg-slate-200 group-hover:text-slate-600 dark:bg-white/5 dark:text-muted-foreground dark:group-hover:bg-white/10 dark:group-hover:text-foreground">
                      <ArrowUpRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                    </div>
                  </div>

                  <CardTitle className="text-base font-bold tracking-tight text-slate-900 transition-colors dark:text-foreground">
                    {service.title}
                  </CardTitle>
                </CardHeader>

                <CardContent className="relative z-10 px-4 pb-4 pt-0">
                  <CardDescription className="line-clamp-2 text-xs leading-relaxed text-muted-foreground group-hover:text-slate-700 dark:text-muted-foreground dark:group-hover:text-foreground">
                    {service.description}
                  </CardDescription>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
