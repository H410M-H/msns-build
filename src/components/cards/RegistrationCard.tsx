// RegistrationCards.tsx
"use client"
import { motion } from "framer-motion";
import { UserPlus, Users, type LucideIcon } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

type IconType = LucideIcon

interface Services {
  title: string
  description: string
  icon: IconType
  href: string
  iconColor: string
  gradientFrom: string
  gradientTo: string
}

const services: Services[] = [
  {
    title: "Student Registration",
    description: "Register new students and manage their admission process with ease.",
    icon: UserPlus,
    href: "/admin/users/student/create",
    iconColor: "bg-emerald-100",
    gradientFrom: "from-green-400",
    gradientTo: "to-green-700",
  },
  {
    title: "Active Students",
    description: "View and manage currently enrolled students' information.",
    icon: Users,
    href: "/admin/users/student/view",
    iconColor: "bg-blue-100",
    gradientFrom: "from-blue-400",
    gradientTo: "to-blue-700",
  },
  {
    title: "Employee Registration",
    description: "Streamline the process of registering new faculty members.",
    icon: UserPlus,
    href: "/admin/users/faculty/create",
    iconColor: "bg-purple-100",
    gradientFrom: "from-purple-400",
    gradientTo: "to-purple-700",
  },
  {
    title: "Active Employees",
    description: "Access and manage current faculty member information.",
    icon: Users,
    href: "/admin/users/faculty/view",
    iconColor: "bg-orange-100",
    gradientFrom: "from-orange-400",
    gradientTo: "to-orange-700",
  },
];

export default function RegistrationCards() {
  return (
    <div className="relative min-h-[60vh] flex items-center justify-center rounded-md overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0">
        <Image
          width="1920"
          height="1080"
          src="https://res.cloudinary.com/dvvbxrs55/image/upload/v1729267628/Schoolview_zmv8rr.jpg"
          sizes="100vw"
          alt="School view background"
          className="w-full h-full object-cover"
          priority
        />
        <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />
      </div>

      {/* Cards Grid */}
      <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 max-w-7xl w-full px-4 py-12">
        {services.map((service, index) => {
          const Icon = service.icon
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Link
                href={service.href}
                className="relative group block h-full transform transition-all duration-300 
                  hover:z-20 focus:outline-none focus:ring-4 focus:ring-emerald-500/30 rounded-3xl"
              >
                {/* Card Container */}
                <div className="relative h-full p-6 bg-white/90 backdrop-blur-lg shadow-2xl 
                  rounded-3xl transition-transform duration-300 ease-in-out 
                  group-hover:scale-105 group-hover:shadow-2xl
                  border border-white/20">
                  
                  {/* Gradient Accent */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${service.gradientFrom} ${service.gradientTo} 
                    opacity-0 group-hover:opacity-10 rounded-3xl transition-opacity duration-300`} />

                  <div className="flex flex-col items-center text-center space-y-4">
                    <div className={`p-4 rounded-2xl ${service.iconColor} transition-colors duration-300`}>
                      <Icon className="h-8 w-8 text-gray-900" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 
                      group-hover:text-green-700 transition-colors duration-300">
                      {service.title}
                    </h3>
                    <p className="text-gray-600 group-hover:text-gray-800 
                      transition-colors duration-300">
                      {service.description}
                    </p>
                  </div>
                </div>
              </Link>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}