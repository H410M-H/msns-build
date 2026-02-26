"use client";

import { motion } from "framer-motion";
import { UserPlus, Users, type LucideIcon, ArrowRight } from "lucide-react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";

interface Service {
  title: string;
  description: string;
  icon: LucideIcon;
  href: string;
  iconColor: string;
  bgColor: string;
  borderColor: string;
  hoverShadow: string;
}

const services: Service[] = [
  {
    title: "Student Registration",
    description: "Enroll new students and manage admission data.",
    icon: UserPlus,
    href: "/admin/users/student/create",
    iconColor: "text-emerald-400",
    bgColor: "bg-emerald-500/10",
    borderColor: "border-emerald-500/20",
    hoverShadow: "hover:shadow-emerald-500/10",
  },
  {
    title: "Active Students",
    description: "View and manage currently enrolled students.",
    icon: Users,
    href: "/admin/users/student/view",
    iconColor: "text-cyan-400",
    bgColor: "bg-cyan-500/10",
    borderColor: "border-cyan-500/20",
    hoverShadow: "hover:shadow-cyan-500/10",
  },
  {
    title: "Employee Registration",
    description: "Register new faculty and staff members.",
    icon: UserPlus,
    href: "/admin/users/faculty/create",
    iconColor: "text-purple-400",
    bgColor: "bg-purple-500/10",
    borderColor: "border-purple-500/20",
    hoverShadow: "hover:shadow-purple-500/10",
  },
  {
    title: "Active Employees",
    description: "Access faculty directory and information.",
    icon: Users,
    href: "/admin/users/faculty/view",
    iconColor: "text-amber-400",
    bgColor: "bg-amber-500/10",
    borderColor: "border-amber-500/20",
    hoverShadow: "hover:shadow-amber-500/10",
  },
];

export default function RegistrationCards() {
  return (
    <div className="mx-auto grid w-full max-w-7xl gap-6 md:grid-cols-2 lg:grid-cols-4">
      {services.map((service, _index) => {
        const Icon = service.icon;
        return (
          <Link
            href={service.href}
            key={service.title}
            className="group block h-full"
          >
            <motion.div
              whileHover={{ y: -5 }}
              transition={{ type: "spring", stiffness: 300 }}
              className="h-full"
            >
              <Card
                className={`relative h-full overflow-hidden border bg-white/5 transition-all duration-500 ${service.borderColor} hover:border-opacity-50 hover:shadow-2xl ${service.hoverShadow} backdrop-blur-md`}
              >
                {/* Gradient overlay on hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

                <CardHeader className="relative z-10 pb-2">
                  <div className="mb-4 flex items-start justify-between">
                    <div
                      className={`rounded-2xl p-3 ${service.bgColor} border border-border transition-transform duration-500 group-hover:scale-110`}
                    >
                      <Icon className={`h-6 w-6 ${service.iconColor}`} />
                    </div>
                    <div
                      className={`rounded-full bg-white/5 p-2 text-foreground/40 transition-all group-hover:bg-white/10 group-hover:text-foreground`}
                    >
                      <ArrowRight className="h-4 w-4 -rotate-45 transition-transform duration-300 group-hover:rotate-0" />
                    </div>
                  </div>
                  <CardTitle className="text-xl font-bold tracking-tight text-foreground transition-colors group-hover:text-emerald-300">
                    {service.title}
                  </CardTitle>
                </CardHeader>

                <CardContent className="relative z-10">
                  <CardDescription className="text-sm leading-relaxed text-emerald-100/50">
                    {service.description}
                  </CardDescription>
                </CardContent>
              </Card>
            </motion.div>
          </Link>
        );
      })}
    </div>
  );
}
