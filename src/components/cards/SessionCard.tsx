"use client";

import { Boxes, FileStack, UserPlus, type LucideIcon, ArrowUpRight } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import Link from "next/link";
import { cn } from "~/lib/utils";

interface Service {
  title: string;
  description: string;
  icon: LucideIcon;
  href: string;
  colorTheme: {
    icon: string;
    bg: string;
    border: string;
    gradient: string;
    shadow: string;
    ring: string;
  };
}

const services: Service[] = [
  {
    title: "Classes Allotment",
    description: "Enroll employees and manage class assignments efficiently.",
    icon: UserPlus,
    href: "/academics/classDetail",
    colorTheme: {
      icon: "text-emerald-400",
      bg: "bg-emerald-500/10",
      border: "group-hover:border-emerald-500/40",
      gradient: "from-emerald-500/10 via-transparent to-transparent",
      shadow: "group-hover:shadow-emerald-500/10",
      ring: "focus-visible:ring-emerald-500",
    },
  },
  {
    title: "Section Management",
    description: "Organize class sections and streamline student grouping.",
    icon: Boxes,
    href: "/academics/classwiseDetail",
    colorTheme: {
      icon: "text-cyan-400",
      bg: "bg-cyan-500/10",
      border: "group-hover:border-cyan-500/40",
      gradient: "from-cyan-500/10 via-transparent to-transparent",
      shadow: "group-hover:shadow-cyan-500/10",
      ring: "focus-visible:ring-cyan-500",
    },
  },
  {
    title: "Sessional Reports",
    description: "Generate, view, and export comprehensive academic reports.",
    icon: FileStack,
    href: "/reports/sessional",
    colorTheme: {
      icon: "text-purple-400",
      bg: "bg-purple-500/10",
      border: "group-hover:border-purple-500/40",
      gradient: "from-purple-500/10 via-transparent to-transparent",
      shadow: "group-hover:shadow-purple-500/10",
      ring: "focus-visible:ring-purple-500",
    },
  },
];

export default function SessionCards() {
  return (
    <div className="w-full">
      <div className="grid sm:grid-cols-2 lg:grid-cols-3">
        {services.map((service) => {
          const Icon = service.icon;
          const { colorTheme } = service;

          return (
            <Link 
              href={service.href} 
              key={service.title} 
              className={cn(
                "group block h-full outline-none rounded-xl transition-transform active:scale-[0.98]",
                "focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950", 
                colorTheme.ring
              )}
            >
              <Card className={cn(
                "relative h-full overflow-hidden border border-white/5 transition-all duration-300 rounded-xl",
                "bg-slate-900/40 backdrop-blur-sm hover:-translate-y-1 hover:bg-slate-900/60",
                colorTheme.border,
                colorTheme.shadow
              )}>
                
                {/* Background Gradient Effect */}
                <div 
                  className={cn(
                    "absolute inset-0 bg-gradient-to-br opacity-0 transition-opacity duration-500 group-hover:opacity-100",
                    colorTheme.gradient
                  )} 
                />

                <CardHeader className="relative z-10 px-4 py-3">
                  <div className="mb-3 flex items-start justify-between">
                    {/* Icon Container */}
                    <div className={cn(
                      "flex h-10 w-10 items-center justify-center rounded-lg border border-white/5 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3 shadow-inner",
                      colorTheme.bg
                    )}>
                      <Icon className={cn("h-5 w-5", colorTheme.icon)} />
                    </div>

                    {/* Action Arrow */}
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-white/5 text-slate-400 transition-all duration-300 group-hover:bg-white/10 group-hover:text-white">
                      <ArrowUpRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    </div>
                  </div>

                  <CardTitle className="text-base font-bold tracking-tight text-white group-hover:text-emerald-50 transition-colors">
                    {service.title}
                  </CardTitle>
                </CardHeader>

                <CardContent className="relative z-10 px-4 pb-4 pt-0">
                  <CardDescription className="line-clamp-2 text-xs leading-relaxed text-slate-400 group-hover:text-slate-300">
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