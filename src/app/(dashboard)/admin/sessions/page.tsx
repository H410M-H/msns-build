"use client";

import { ScrollArea } from "~/components/ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Users, BookOpen, GraduationCap, School, DollarSign } from "lucide-react";
import { PageHeader } from "~/components/blocks/nav/PageHeader";
import { SessionList } from "~/components/tables/SessionList";
import { api } from "~/trpc/react";
import { Skeleton } from "~/components/ui/skeleton";
import { motion, useMotionValue, useTransform } from "framer-motion";
import { useEffect } from "react";

// Animated number component
const AnimatedNumber = ({ value }: { value: number }) => {
  const motionValue = useMotionValue(0);
  const animatedValue = useTransform(motionValue, Math.round);

  useEffect(() => {
    motionValue.set(value);
  }, [motionValue, value]);

  return <motion.span>{animatedValue}</motion.span>;
};

export default function SessionFeePage() {
  const breadcrumbs = [
    { href: "/admin", label: "Dashboard" },
    { href: "/admin/sessions", label: "Sessions", current: true },
  ];

  // Fetch data from various routers
  const { data: sessionData } = api.session.getActiveSession.useQuery();
  const { data: classData } = api.class.getClasses.useQuery();
  const { data: employeeData } = api.employee.getEmployees.useQuery();
  const { data: feeData } = api.fee.getAllFees.useQuery();
  const { data: studentData } = api.student.getStudents.useQuery();
  const { data: subjectData } = api.subject.getAllSubjects.useQuery();

  const totalRevenue = feeData?.reduce((acc, fee) => acc + fee.tuitionFee, 0) ?? 0;

  const stats = [
    {
      title: "Total Students",
      value: studentData?.length ?? 0,
      icon: Users,
      color: "bg-green-100 text-green-600"
    },
    {
      title: "Total Classes",
      value: classData?.length ?? 0,
      icon: School,
      color: "bg-purple-100 text-purple-600"
    },
    {
      title: "Active Employees",
      value: employeeData?.length ?? 0,
      icon: GraduationCap,
      color: "bg-yellow-100 text-yellow-600"
    },
    {
      title: "Courses Offered",
      value: subjectData?.length ?? 0,
      icon: BookOpen,
      color: "bg-pink-100 text-pink-600"
    },
    {
      title: "Total Revenue",
      value: totalRevenue,
      icon: DollarSign,
      color: "bg-teal-100 text-teal-600",
      prefix: "Rs. "
    }
  ];

return (
  <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
    <PageHeader breadcrumbs={breadcrumbs} />

    <div className="px-4 sm:px-6 lg:px-8 py-6 max-w-7xl mx-auto">
      {/* Stats Grid - Improved responsive layout */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 lg:gap-6 mb-8"
      >
        {stats.map((stat, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ 
              delay: index * 0.1, 
              type: "spring", 
              stiffness: 200,
              damping: 15
            }}
            whileHover={{ 
              scale: 1.02,
              y: -2
            }}
            whileTap={{ scale: 0.98 }}
            className="h-full"
          >
            <Card className="h-full flex flex-col justify-between p-5 bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-100/60 shadow-sm hover:shadow-md transition-all duration-300 group relative overflow-hidden">
              {/* Modern gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              {/* Accent border effect */}
              <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-blue-500/0 via-blue-500/40 to-blue-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

              <CardHeader className="flex flex-row items-center justify-between space-y-0 p-0 mb-3">
                <motion.div whileHover={{ x: 2 }}>
                  <CardTitle className="text-xs font-semibold uppercase tracking-wide text-gray-600/90">
                    {stat.title}
                  </CardTitle>
                </motion.div>
                <motion.div
                  className={`h-9 w-9 flex items-center justify-center rounded-xl ${stat.color} shadow-sm`}
                  whileHover={{ 
                    rotate: [0, -5, 5, 0],
                    scale: 1.05
                  }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <stat.icon className="h-4 w-4 text-white" />
                </motion.div>
              </CardHeader>
              
              <CardContent className="p-0">
                {stat.value === undefined ? (
                  <motion.div
                    animate={{ opacity: [0.4, 0.8, 0.4] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <Skeleton className="h-7 w-20 rounded-lg" />
                  </motion.div>
                ) : (
                  <motion.div
                    className="text-2xl font-bold bg-gradient-to-br from-gray-900 to-gray-700 bg-clip-text text-transparent"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: index * 0.1 + 0.2 }}
                  >
                    {stat.prefix}
                    {typeof stat.value === 'number' ? (
                      <AnimatedNumber value={stat.value} />
                    ) : (
                      stat.value
                    )}
                  </motion.div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.section>

      {/* Session Management Section - Modernized */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
      >
        <Card className="bg-white/80 backdrop-blur-sm shadow-sm hover:shadow-md transition-all duration-500 rounded-2xl border border-gray-100/60 overflow-hidden group">
          {/* Header with improved gradient */}
          <CardHeader className="bg-gradient-to-r from-slate-50/80 to-blue-50/30 border-b border-gray-200/40 p-6 relative">
            <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-blue-500 to-purple-500" />
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <CardTitle className="text-xl font-bold bg-gradient-to-br from-gray-900 to-gray-700 bg-clip-text text-transparent">
                  <motion.div
                    whileHover={{ x: 3 }}
                    className="inline-flex items-center gap-2"
                  >
                    <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
                    Session Management
                  </motion.div>
                </CardTitle>
                
                {sessionData && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex flex-wrap items-center gap-1 mt-2 text-sm text-gray-600/90"
                  >
                    <span className="font-medium">Current Session:</span>
                    <span className="text-gray-900 font-semibold">{sessionData.sessionName}</span>
                    <span className="mx-1">•</span>
                    <span>
                      {new Date(sessionData.sessionFrom).getFullYear()}–
                      {new Date(sessionData.sessionTo).getFullYear()}
                    </span>
                  </motion.div>
                )}
              </div>
              

            </div>
          </CardHeader>
          
          <CardContent className="p-0">
            <ScrollArea className="h-[calc(100vh-360px)] min-h-[400px]">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ staggerChildren: 0.15, delay: 0.2 }}
              >
                <SessionList />
              </motion.div>
            </ScrollArea>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  </div>
);
}