"use client";

import { Boxes, FileStack, UserPlus, type LucideIcon, ArrowUpRight } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import Link from "next/link";
import { cn } from "~/lib/utils"; // Assuming you have a standard shadcn utils file

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
    ring: string; // Added for focus states
  };
}

const services: Service[] = [
  {
    title: "Classes Allotment",
    description: "Enroll employees and manage class assignments efficiently.",
    icon: UserPlus,
    href: "/academics/classDetail",
    colorTheme: {
      icon: "text-emerald-600",
      bg: "bg-emerald-100/50",
      border: "group-hover:border-emerald-500/50",
      gradient: "from-emerald-50/50 via-white to-white",
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
      icon: "text-cyan-600",
      bg: "bg-cyan-100/50",
      border: "group-hover:border-cyan-500/50",
      gradient: "from-cyan-50/50 via-white to-white",
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
      icon: "text-amber-600", // Changed from yellow for better contrast
      bg: "bg-amber-100/50",
      border: "group-hover:border-amber-500/50",
      gradient: "from-amber-50/50 via-white to-white",
      shadow: "group-hover:shadow-amber-500/10",
      ring: "focus-visible:ring-amber-500",
    },
  },
];

export default function SessionCards() {
  return (
    <div className="w-full py-8">
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {services.map((service) => {
          const Icon = service.icon;
          const { colorTheme } = service;

          return (
            <Link 
              href={service.href} 
              key={service.title} 
              className={cn(
                "group block h-full outline-none rounded-2xl transition-transform active:scale-[0.98]",
                "focus-visible:ring-2 focus-visible:ring-offset-2", 
                colorTheme.ring
              )}
            >
              <Card className={cn(
                "relative h-full overflow-hidden border transition-all duration-300",
                "bg-white hover:-translate-y-1 hover:shadow-xl",
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

                <CardHeader className="relative z-10 pb-2">
                  <div className="mb-4 flex items-start justify-between">
                    {/* Icon Container */}
                    <div className={cn(
                      "flex h-12 w-12 items-center justify-center rounded-2xl transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3 shadow-sm",
                      colorTheme.bg
                    )}>
                      <Icon className={cn("h-6 w-6", colorTheme.icon)} />
                    </div>

                    {/* Action Arrow */}
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-50 text-slate-300 transition-all duration-300 group-hover:bg-white group-hover:text-slate-900 group-hover:shadow-sm">
                      <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    </div>
                  </div>

                  <CardTitle className="text-lg font-semibold tracking-tight text-slate-900">
                    {service.title}
                  </CardTitle>
                </CardHeader>

                <CardContent className="relative z-10 pt-1">
                  <CardDescription className="line-clamp-2 text-sm leading-relaxed text-slate-500 group-hover:text-slate-600">
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
