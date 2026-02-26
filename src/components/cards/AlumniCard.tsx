"use client";

import {
  CalendarCog,
  NotebookPen,
  Wallet,
  ChevronRight,
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

interface Services {
  title: string;
  description: string;
  icon: LucideIcon;
  href: string;
  gradient: string;
  iconColor: string;
}

const services: Services[] = [
  {
    title: "Session Management",
    description: "Manage academic sessions & terms.",
    icon: CalendarCog,
    href: "/clerk/sessions",
    gradient: "from-amber-500/20 to-orange-600/5",
    iconColor: "text-amber-400",
  },
  {
    title: "User Management",
    description: "Control access for all users.",
    icon: NotebookPen,
    href: "/clerk/users",
    gradient: "from-blue-500/20 to-indigo-600/5",
    iconColor: "text-blue-400",
  },
  {
    title: "Revenue Management",
    description: "Track fees and payments.",
    icon: Wallet,
    href: "/clerk/revenue",
    gradient: "from-emerald-500/20 to-teal-600/5",
    iconColor: "text-emerald-400",
  },
];

export default function AlumniCard() {
  return (
    // COMPACT GRID: gap-3
    <div className="grid h-full grid-cols-1 gap-3 sm:gap-4 md:grid-cols-2 lg:grid-cols-3">
      {services.map((service, index) => {
        const Icon = service.icon;
        return (
          <Link href={service.href} key={index} className="group h-full">
            <Card
              className={cn(
                "relative h-full overflow-hidden border-border bg-card backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-border hover:shadow-xl",
              )}
            >
              <div
                className={`absolute inset-0 bg-gradient-to-br ${service.gradient} opacity-0 transition-opacity duration-500 group-hover:opacity-100`}
              />

              <CardHeader className="relative z-10 space-y-2 p-4 pb-2">
                <div className="flex items-start justify-between">
                  <div
                    className={`rounded-lg bg-white/5 p-2 ring-1 ring-white/10 transition-colors group-hover:bg-white/10 ${service.iconColor}`}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="rounded-full border border-border bg-white/5 p-1 text-muted-foreground transition-colors group-hover:text-foreground">
                    <ChevronRight className="h-3 w-3" />
                  </div>
                </div>

                <CardTitle className="text-base font-semibold text-foreground transition-colors group-hover:text-emerald-100">
                  {service.title}
                </CardTitle>
              </CardHeader>

              <CardContent className="relative z-10 p-4 pt-0">
                <CardDescription className="line-clamp-2 text-xs text-muted-foreground">
                  {service.description}
                </CardDescription>
              </CardContent>
            </Card>
          </Link>
        );
      })}
    </div>
  );
}
