"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "~/components/ui/card";
import {
  Users,
  BookOpen,
  GraduationCap,
  School,
  DollarSign,
  Target,
} from "lucide-react";
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

  const totalRevenue =
    feeData?.reduce((acc, fee) => acc + fee.tuitionFee, 0) ?? 0;

  const stats = [
    {
      title: "Total Students",
      value: studentData?.length ?? 0,
      icon: Users,
      color: "bg-gradient-to-br from-green-500 to-emerald-600",
      bgColor: "from-green-50 to-green-100/50",
    },
    {
      title: "Total Classes",
      value: classData?.length ?? 0,
      icon: School,
      color: "bg-gradient-to-br from-purple-500 to-indigo-600",
      bgColor: "from-purple-50 to-purple-100/50",
    },
    {
      title: "Active Employees",
      value: employeeData?.length ?? 0,
      icon: GraduationCap,
      color: "bg-gradient-to-br from-amber-500 to-orange-600",
      bgColor: "from-amber-50 to-amber-100/50",
    },
    {
      title: "Courses Offered",
      value: subjectData?.length ?? 0,
      icon: BookOpen,
      color: "bg-gradient-to-br from-pink-500 to-rose-600",
      bgColor: "from-pink-50 to-pink-100/50",
    },
    {
      title: "Total Revenue",
      value: totalRevenue,
      icon: DollarSign,
      color: "bg-gradient-to-br from-teal-500 to-cyan-600",
      bgColor: "from-teal-50 to-teal-100/50",
      prefix: "Rs. ",
    },
  ];

  return (
    <div className="min-h-screen">
      <PageHeader breadcrumbs={breadcrumbs} />

      <div className="flex-1 space-y-4 lg:pb-8">
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="border-gren-200/20 rounded-3xl border bg-white shadow-sm"
        >
          <section className="grid grid-cols-1 gap-4 px-4 py-4 lg:grid-cols-5 lg:px-6">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{
                  delay: index * 0.1,
                  type: "spring",
                  stiffness: 200,
                  damping: 15,
                }}
                whileHover={{
                  scale: 1.02,
                  y: -2,
                }}
                className="h-full"
              >
                <Card className="group relative flex h-full flex-col justify-between overflow-hidden rounded-2xl border border-white/40 bg-gradient-to-br from-pink-300/30 via-green-300/30 to-white/80 p-6 shadow-sm backdrop-blur-sm transition-all duration-300 hover:shadow-md">
                  {/* Animated gradient overlay */}
                  <div className="absolute left-0 top-0 h-0.5 w-full bg-gradient-to-r from-transparent via-current to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-30" />

                  <CardHeader className="mb-4 flex flex-row items-center justify-between space-y-0 p-0">
                    <motion.div whileHover={{ x: 2 }}>
                      <CardTitle className="text-sm font-semibold uppercase tracking-wide text-slate-600/90">
                        {stat.title}
                      </CardTitle>
                    </motion.div>
                    <motion.div
                      className={`flex h-10 w-10 items-center justify-center rounded-xl ${stat.color} shadow-lg shadow-black/5`}
                      whileHover={{
                        rotate: [0, -5, 5, 0],
                        scale: 1.1,
                      }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      <stat.icon className="h-5 w-5 text-white" />
                    </motion.div>
                  </CardHeader>

                  <CardContent className="p-0">
                    {stat.value === undefined ? (
                      <motion.div
                        animate={{ opacity: [0.4, 0.8, 0.4] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        <Skeleton className="h-8 w-24 rounded-lg bg-slate-200/50" />
                      </motion.div>
                    ) : (
                      <motion.div
                        className="bg-gradient-to-br from-slate-900 to-slate-700 bg-clip-text text-2xl font-bold text-transparent"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: index * 0.1 + 0.2 }}
                      >
                        {stat.prefix}
                        {typeof stat.value === "number" ? (
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
          </section>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="rounded-3xl border border-slate-200/60 bg-white shadow-sm"
        >
          <div className="relative overflow-hidden rounded-3xl border border-white/40 bg-white/70 p-8 shadow-2xl backdrop-blur-sm lg:p-6">
            {/* Animated background elements */}
            <div className="absolute right-0 top-0 h-32 w-32 rounded-full bg-gradient-to-br from-blue-400/20 to-purple-400/40 blur-2xl"></div>
            <div className="absolute bottom-0 left-0 h-24 w-24 rounded-full bg-gradient-to-br from-green-400/20 to-teal-400/40 blur-xl"></div>
            <Card className="border-0 bg-transparent shadow-none">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-blue-100 p-2">
                  <Target className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <CardTitle className="text-xl font-bold text-slate-800">
                    Session Management
                  </CardTitle>
                  {sessionData && (
                    <CardDescription className="mt-1 flex flex-wrap items-center gap-2 text-slate-600">
                      <span className="font-medium">Current Session:</span>
                      <span className="font-semibold text-slate-900">
                        {sessionData.sessionName}
                      </span>
                      <span className="mx-1">•</span>
                      <span>
                        {new Date(sessionData.sessionFrom).getFullYear()}–{new Date(sessionData.sessionTo).getFullYear()}
                      </span>
                    </CardDescription>
                  )}
                </div>
              </div>
                  
               <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ staggerChildren: 0.1, delay: 0.4 }}
                >
                  <SessionList />
                </motion.div>
           </Card>
          </div>
        </motion.section>
      </div>
    </div>
  );
}
