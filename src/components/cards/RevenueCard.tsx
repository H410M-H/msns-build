"use client";

import {
  BarChartIcon,
  DollarSignIcon,
  HandshakeIcon,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";

interface Service {
  title: string;
  description: string;
  icon: LucideIcon;
  href: string;
  iconColor: string;
  gradientFrom: string;
  gradientTo: string;
}

const services: Service[] = [
  {
    title: "Salary Management",
    description: "Manage employee salaries and compensation packages",
    icon: HandshakeIcon,
    iconColor: "text-green-500",
    gradientFrom: "from-green-400",
    gradientTo: "to-green-700",
    href: "/admin/revenue/salary",
  },
  {
    title: "Fee Management",
    description: "Handle student fees and payment tracking",
    icon: BarChartIcon,
    iconColor: "text-blue-500",
    gradientFrom: "from-blue-400",
    gradientTo: "to-blue-700",
    href: "/admin/revenue/fee",
  },
  {
    title: "Expenses Management",
    description: "Create and manage billing invoices",
    icon: DollarSignIcon,
    iconColor: "text-purple-500",
    gradientFrom: "from-purple-400",
    gradientTo: "to-purple-700",
    href: "/admin/revenue/expense",
  },
];

export const RevenueCards = () => {
  return (
    <section className="w-full py-12">
      <div className="max-w-12xl mx-auto grid grid-cols-1 gap-8 px-4 sm:grid-cols-2 lg:grid-cols-3">
        {services.map((service, index) => {
          const Icon = service.icon;
          return (
            <Link
              key={service.title}
              href={service.href}
              className="group relative rounded-3xl p-[1px] transition-transform duration-500 hover:-translate-y-1 hover:scale-[1.03] focus-visible:ring-2 focus-visible:ring-offset-2"
              style={{ transitionDelay: `${index * 100}ms` }}
            >
              {/* Gradient Border */}
              <div
                className={`absolute inset-0 rounded-3xl bg-gradient-to-br ${service.gradientFrom} ${service.gradientTo} opacity-90 blur-md group-hover:opacity-100`}
              />
              {/* Glass Card */}
              <div className="relative z-10 flex h-full flex-col items-center justify-center rounded-3xl bg-white/30 p-8 shadow-xl backdrop-blur-md transition-all duration-500 group-hover:bg-white/40 dark:bg-gray-900/40">
                <span className="inline-flex items-center justify-center rounded-full bg-white/60 p-4 shadow-inner backdrop-blur transition-transform group-hover:rotate-3">
                  <Icon className={`h-12 w-12 ${service.iconColor}`} />
                </span>
                <h3 className="mt-6 text-center text-xl font-semibold text-gray-900 dark:text-foreground sm:text-2xl">
                  {service.title}
                </h3>
                <p className="mt-3 text-center text-sm text-gray-700 dark:text-gray-300 sm:text-base">
                  {service.description}
                </p>
                {/* subtle glow underline on hover */}
                <div className="mt-6 h-[2px] w-0 bg-gradient-to-r from-transparent via-white/70 to-transparent transition-all group-hover:w-2/3" />
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
};
