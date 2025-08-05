"use client"

import { Boxes, CalendarCog, type LucideIcon, NotebookPenIcon } from "lucide-react";
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
        title: "Session Management",
        description: "Easily enroll new students and manage their financial records.",
        icon: CalendarCog,
        href: "/admin/academics/sessionalDetails",
        iconColor: "text-yellow-500",
        gradientFrom: "from-yellow-400",
        gradientTo: "to-yellow-700",
      },
      {
        title: "User Management",
        description: "Create and manage new classes or courses for the school",
        icon: NotebookPenIcon,
        iconColor: "text-blue-500",
        gradientFrom: "from-blue-400",
        gradientTo: "to-blue-700",
        href: "/admin/users",
      },
      {
        title: "Section & Class Management",
        description: "Easily enroll new students and manage their financial records.",
        icon: Boxes,
        href: "/admin/academics/sessionalDetails/class",
        iconColor: "text-purple-500",
        gradientFrom: "from-purple-400",
        gradientTo: "to-purple-700",
      },
      {
        title: "Fee Management",
        description: "Create and manage new classes or courses for the school",
        icon: NotebookPenIcon,
        iconColor: "text-green-500",
        gradientFrom: "from-green-400",
        gradientTo: "to-green-700",
        href: "/revenue",
      },
    ];

    export default function AcademicCards () {
      return (
        <div className="relative min-h-screen flex items-center justify-center px-4 py-6 rounded-md">
          {/* Background Image */}
          <Image
            width="1920"
            height="1080"
            src="https://res.cloudinary.com/dvvbxrs55/image/upload/v1729267628/Schoolview_zmv8rr.jpg"
            sizes="100vw"
            alt="School view background"
            className="absolute inset-0 object-cover w-full h-full"
          />
      
          {/* Cards Grid */}
          <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-16 lg:gap-8 max-w-7xl w-full animate-slide-in-up">
            {services.map((service, index) => {
              const Icon = service.icon
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
              )
            })}
          </div>
        </div>
      )
  };
  