"use client";

import { 
  CalendarCog, 
  NotebookPen, 
  Wallet, 
  ChevronRight,
  type LucideIcon 
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
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
    href: "/admin/sessions",
    gradient: "from-amber-500/20 to-orange-600/5",
    iconColor: "text-amber-400",
  },
  {
    title: "User Management",
    description: "Control access for all users.",
    icon: NotebookPen,
    href: "/admin/users",
    gradient: "from-blue-500/20 to-indigo-600/5",
    iconColor: "text-blue-400",
  },
  {
    title: "Revenue Management",
    description: "Track fees and payments.",
    icon: Wallet,
    href: "/admin/revenue",
    gradient: "from-emerald-500/20 to-teal-600/5",
    iconColor: "text-emerald-400",
  },
];

export default function AlumniCard() {
  return (
    // COMPACT GRID: gap-3
    <div className="grid gap-3 sm:gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 h-full">
      {services.map((service, index) => {
        const Icon = service.icon;
        return (
          <Link href={service.href} key={index} className="group h-full">
            <Card className={cn(
              "relative h-full overflow-hidden border-white/5 bg-slate-900/60 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-white/10 hover:shadow-xl"
            )}>
              <div className={`absolute inset-0 bg-gradient-to-br ${service.gradient} opacity-0 transition-opacity duration-500 group-hover:opacity-100`} />
              
              <CardHeader className="relative z-10 space-y-2 pb-2 p-4">
                <div className="flex items-start justify-between">
                  <div className={`rounded-lg bg-white/5 p-2 ring-1 ring-white/10 transition-colors group-hover:bg-white/10 ${service.iconColor}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="rounded-full border border-white/5 bg-white/5 p-1 text-slate-400 transition-colors group-hover:text-white">
                    <ChevronRight className="h-3 w-3" />
                  </div>
                </div>
                
                <CardTitle className="text-base font-semibold text-white group-hover:text-emerald-100 transition-colors">
                  {service.title}
                </CardTitle>
              </CardHeader>
              
              <CardContent className="relative z-10 p-4 pt-0">
                <CardDescription className="text-slate-400 text-xs line-clamp-2">
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