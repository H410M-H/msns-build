"use client";

import { Boxes, FileStack, UserPlus, type LucideIcon, ArrowRight } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import Link from "next/link";

interface Service {
  title: string;
  description: string;
  icon: LucideIcon;
  href: string;
  iconColor: string;
  bgColor: string;
  borderColor: string;
  hoverGradient: string;
  shadowColor: string;
}

const services: Service[] = [
  {
    title: "Classes Allotment",
    description: "Enroll employees and manage class assignments.",
    icon: UserPlus,
    href: "/academics/classDetail",
    iconColor: "text-emerald-600",
    bgColor: "bg-emerald-50",
    borderColor: "group-hover:border-emerald-200",
    hoverGradient: "from-emerald-50/60 to-white",
    shadowColor: "group-hover:shadow-emerald-100",
  },
  {
    title: "Section Management",
    description: "Manage class sections and student grouping.",
    icon: Boxes,
    href: "/academics/classwiseDetail",
    iconColor: "text-cyan-600",
    bgColor: "bg-cyan-50",
    borderColor: "group-hover:border-cyan-200",
    hoverGradient: "from-cyan-50/60 to-white",
    shadowColor: "group-hover:shadow-cyan-100",
  },
  {
    title: "Sessional Reports",
    description: "View and export comprehensive academic reports.",
    icon: FileStack,
    href: "/reports/sessional",
    iconColor: "text-yellow-600",
    bgColor: "bg-yellow-50",
    borderColor: "group-hover:border-yellow-200",
    hoverGradient: "from-yellow-50/60 to-white",
    shadowColor: "group-hover:shadow-yellow-100",
  },
];

export default function SessionCards() {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {services.map((service) => {
        const Icon = service.icon;
        return (
          <Link href={service.href} key={service.title} className="group block h-full">
            <Card className={`relative h-full overflow-hidden transition-all duration-300 bg-white border border-slate-200 ${service.borderColor} hover:shadow-xl ${service.shadowColor} hover:-translate-y-1 rounded-2xl`}>
              
              {/* Gradient overlay on hover */}
              <div className={`absolute inset-0 bg-gradient-to-br ${service.hoverGradient} opacity-0 transition-opacity duration-500 group-hover:opacity-100`} />
              
              <CardHeader className="relative z-10 p-6 pb-2">
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-3.5 rounded-2xl ${service.bgColor} transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3 shadow-sm`}>
                    <Icon className={`h-7 w-7 ${service.iconColor}`} />
                  </div>
                  
                  {/* Animated Arrow Button */}
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-50 border border-slate-100 text-slate-400 transition-all duration-300 group-hover:bg-white group-hover:text-slate-800 group-hover:border-slate-200 group-hover:shadow-sm">
                    <ArrowRight className="h-4 w-4 transition-transform duration-300 -rotate-45 group-hover:rotate-0" />
                  </div>
                </div>
                
                <CardTitle className="text-xl font-bold text-slate-800 tracking-tight group-hover:text-slate-900 transition-colors">
                    {service.title}
                </CardTitle>
              </CardHeader>
              
              <CardContent className="relative z-10 p-6 pt-2">
                <CardDescription className="text-slate-500 text-sm font-medium leading-relaxed">
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