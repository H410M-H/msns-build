"use client";

import { motion } from "framer-motion";
import { 
  TrendingUp, 
  AlertCircle,
  Calendar,
} from "lucide-react";

import { PageHeader } from "~/components/blocks/nav/PageHeader";
import { WelcomeSection } from "~/components/blocks/dashboard/welcome";
import { ProfileSection } from "~/components/blocks/dashboard/profile"; // Reusing profile section for consistency
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription
} from "~/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";
import { Button } from "~/components/ui/button";
import { Progress } from "~/components/ui/progress";
import Link from "next/link";

// Mock data - replace with TRPC call later
const ACADEMIC_PROGRESS = [
  { subject: "Mathematics", progress: 85, grade: "A" },
  { subject: "Physics", progress: 78, grade: "B+" },
  { subject: "Computer Science", progress: 92, grade: "A+" },
  { subject: "English", progress: 88, grade: "A" },
];

const UPCOMING_TASKS = [
  { title: "Midterm Exam: Physics", date: "Tomorrow, 9:00 AM", type: "exam" },
  { title: "Assignment: Calculus", date: "Due in 2 days", type: "assignment" },
  { title: "Science Fair Registration", date: "Due on Friday", type: "event" },
];

export default function StudentDashboard() {
  const breadcrumbs = [{ href: "/student", label: "Dashboard", current: true }];

  return (
    <div className="w-full space-y-8 p-6">
      <PageHeader breadcrumbs={breadcrumbs} />

      {/* Top Section: Welcome & Profile */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 w-full">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-8 space-y-6"
        >
           <WelcomeSection />
           
           {/* Fee Alert */}
           <Alert className="border-amber-500/20 bg-amber-500/10 text-amber-200">
             <AlertCircle className="h-4 w-4" />
             <AlertTitle>Outstanding Fees</AlertTitle>
             <AlertDescription className="flex items-center justify-between">
               <span>You have a pending tuition fee balance for February.</span>
               <Link href="/student/fees">
                 <Button variant="outline" size="sm" className="border-amber-500/30 hover:bg-amber-500/20 text-amber-300">
                   View Details
                 </Button>
               </Link>
             </AlertDescription>
           </Alert>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-4"
        >
          <div className="h-full w-full">
            <ProfileSection /> 
          </div>
        </motion.div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Academic Progress */}
        <motion.div
           initial={{ opacity: 0, x: -20 }}
           animate={{ opacity: 1, x: 0 }}
           transition={{ delay: 0.2 }}
        >
          <Card className="h-full border-slate-200 bg-white/50 shadow-sm backdrop-blur-md dark:border-white/5 dark:bg-slate-900/40">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                   <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
                       <TrendingUp className="h-5 w-5" />
                   </div>
                   <CardTitle>Academic Progress</CardTitle>
                </div>
                <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white">View Report</Button>
              </div>
              <CardDescription>Current term performance</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
               {ACADEMIC_PROGRESS.map((item, index) => (
                 <div key={index} className="space-y-2">
                   <div className="flex justify-between text-sm">
                     <span className="text-slate-300">{item.subject}</span>
                     <span className="font-mono text-emerald-400">{item.grade} ({item.progress}%)</span>
                   </div>
                   <Progress value={item.progress} className="h-2 bg-slate-800 text-emerald-500" />
                 </div>
               ))}
            </CardContent>
          </Card>
        </motion.div>

        {/* Upcoming Tasks */}
        <motion.div
           initial={{ opacity: 0, x: 20 }}
           animate={{ opacity: 1, x: 0 }}
           transition={{ delay: 0.3 }}
        >
          <Card className="h-full border-slate-200 bg-white/50 shadow-sm backdrop-blur-md dark:border-white/5 dark:bg-slate-900/40">
            <CardHeader>
               <div className="flex items-center gap-2">
                   <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400">
                       <Calendar className="h-5 w-5" />
                   </div>
                   <CardTitle>Upcoming</CardTitle>
                </div>
              <CardDescription>Exams, assignments, and events</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {UPCOMING_TASKS.map((task, i) => (
                <div key={i} className="flex items-start gap-4 p-3 rounded-lg border border-white/5 bg-black/20 hover:bg-black/30 transition-colors">
                  <div className={`mt-1 h-2 w-2 rounded-full ${
                    task.type === 'exam' ? 'bg-red-400' : 
                    task.type === 'assignment' ? 'bg-amber-400' : 'bg-blue-400'
                  }`} />
                  <div>
                    <h4 className="font-medium text-slate-200 text-sm">{task.title}</h4>
                    <p className="text-xs text-slate-400 mt-1">{task.date}</p>
                  </div>
                </div>
              ))}
              <Button variant="outline" className="w-full mt-2 border-white/5 hover:bg-white/5 text-slate-300">
                 View Full Calendar
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
