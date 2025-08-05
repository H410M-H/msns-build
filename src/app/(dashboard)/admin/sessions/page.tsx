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
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <PageHeader breadcrumbs={breadcrumbs} />

      <div className="px-6 p-6">
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mb-6"
        >
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1, type: "spring", stiffness: 100 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Card className="flex flex-col justify-between p-4 bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 group relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 -translate-x-full group-hover:translate-x-0" />

                <CardHeader className="flex items-center justify-between space-y-0">
                  <motion.div whileHover={{ x: 2 }}>
                    <CardTitle className="text-sm font-medium text-gray-700">
                      {stat.title}
                    </CardTitle>
                  </motion.div>
                  <motion.div
                    className={`h-10 w-10 flex items-center justify-center rounded-full ${stat.color}`}
                    whileHover={{ rotate: 360, scale: 1.1 }}
                    transition={{ type: "spring" }}
                  >
                    <stat.icon className="h-5 w-5" />
                  </motion.div>
                </CardHeader>
                <CardContent>
                  {stat.value === undefined ? (
                    <motion.div
                      animate={{ opacity: [0.5, 1, 0.5] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      <Skeleton className="h-8 w-3/4" />
                    </motion.div>
                  ) : (
                    <motion.div
                      className="text-2xl font-extrabold text-gray-900"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
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
        {/* Session Management Section */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="bg-gradient-to-r from-blue-100/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <Card className="bg-white shadow-lg rounded-xl overflow-hidden hover:shadow-xl transition-shadow duration-300 group">
            <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 border-b relative">
              <CardTitle className="text-2xl font-bold text-gray-800 relative">
                <motion.div
                  whileHover={{ x: 5 }}
                  className="inline-block"
                >
                  Session Management
                </motion.div>
                {sessionData && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="ml-4 text-sm font-normal text-gray-500 inline-block"
                  >
                    Current Session: {sessionData.sessionName}
                    <span className="mx-2">•</span>
                    {new Date(sessionData.sessionFrom).getFullYear()}–
                    {new Date(sessionData.sessionTo).getFullYear()}
                  </motion.span>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[calc(100vh-320px)]">
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ staggerChildren: 0.1 }}
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