'use client'

import { BarChartIcon, DollarSignIcon, HandCoinsIcon, HandshakeIcon, type LucideIcon } from "lucide-react";
import Link from "next/link";

interface Service {
  title: string
  description: string
  icon: LucideIcon
  href: string
  iconColor: string
  gradientFrom: string
  gradientTo: string
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
    title: "Invoice Management",
    description: "Create and manage billing invoices",
    icon: DollarSignIcon,
    iconColor: "text-purple-500",
    gradientFrom: "from-purple-400",
    gradientTo: "to-purple-700",
    href: "/revenue",
  },
  {
    title: "Payment Settings",
    description: "Configure payment systems and preferences",
    icon: HandCoinsIcon,
    iconColor: "text-orange-500",
    gradientFrom: "from-orange-400",
    gradientTo: "to-orange-700",
    href: "/revenue",
  },
];

export const RevenueCards = () => {
  return (
    <div className="relative min-h-screen flex items-center justify-center px-4 py-6 rounded-md">
      {/* Cards Grid - Adjusted for 4 columns */}
      <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-16 lg:gap-8 max-w-7xl w-full animate-slide-in-up">
        {services.map((service, index) => {
          const Icon = service.icon;
          return (
            <Link
              href={service.href}
              key={index}
              className="relative group gap-6 p-4 transform transition-all duration-500 
                ease-in-out hover:scale-105 hover:z-20"
              style={{ transitionDelay: `${index * 100}ms` }}
            >
              {/* Background Card Decoration */}
              <div
                className={`absolute inset-0 bg-gradient-to-r ${service.gradientFrom} ${service.gradientTo} 
                  shadow-lg transform -skew-y-6 sm:skew-y-0 sm:-rotate-6 sm:rounded-3xl opacity-80 
                  transition-transform duration-700 ease-in-out group-hover:rotate-0 
                  group-hover:skew-y-0 group-hover:scale-105`}
              />

              {/* Card Content */}
              <div className="relative z-10 px-10 py-10 bg-yellow-100 backdrop-blur-lg shadow-xl 
                rounded-3xl transition-transform duration-500 ease-in-out 
                group-hover:scale-105 group-hover:rotate-1">
                <div className="flex flex-col items-center text-center">
                  <Icon className={`h-12 w-12 ${service.iconColor}`} />
                  <h3 className="text-2xl font-semibold text-gray-900 
                    group-hover:text-green-700 transition-colors duration-300">
                    {service.title}
                  </h3>
                  <p className="mt-6 text-gray-700 group-hover:text-green-600 
                    transition-colors duration-300">
                    {service.description}
                  </p>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
};