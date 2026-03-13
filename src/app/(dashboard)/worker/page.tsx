"use client";

import { motion } from "framer-motion";
import {
  Calendar,
  Clock,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";

import { PageHeader } from "~/components/blocks/nav/PageHeader";
import { WelcomeSection } from "~/components/blocks/dashboard/welcome";
import { ProfileSection } from "~/components/blocks/dashboard/profile";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";

// Sample tasks for worker
const WORKER_TASKS = [
  { id: 1, title: "Cleaning: Room A101", status: "pending", time: "9:00 AM" },
  {
    id: 2,
    title: "Maintenance: Library AC",
    status: "in-progress",
    time: "10:30 AM",
  },
  {
    id: 3,
    title: "Event Setup: Auditorium",
    status: "pending",
    time: "2:00 PM",
  },
];

const WORKER_STATS = [
  {
    title: "Tasks Today",
    value: "3",
    icon: CheckCircle2,
    color: "text-blue-400",
    bg: "bg-blue-500/10",
  },
  {
    title: "Completed",
    value: "1",
    icon: CheckCircle2,
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
  },
  {
    title: "In Progress",
    value: "1",
    icon: Clock,
    color: "text-orange-400",
    bg: "bg-orange-500/10",
  },
  {
    title: "Work Hours",
    value: "8h 30m",
    icon: Clock,
    color: "text-purple-400",
    bg: "bg-purple-500/10",
  },
];

export default function WorkerDashboard() {
  const breadcrumbs = [{ href: "/worker", label: "Dashboard", current: true }];

  return (
    <div className="w-full space-y-8 px-4 sm:px-6">
      <PageHeader breadcrumbs={breadcrumbs} />

      {/* Top Section */}
      <div className="grid w-full grid-cols-1 gap-6 lg:grid-cols-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6 lg:col-span-8"
        >
          <WelcomeSection />

          {/* Task Assignment Alert */}
          <Alert className="border-blue-500/20 bg-blue-500/5">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>New Task Assignment</AlertTitle>
            <AlertDescription>
              You have been assigned new maintenance task in Block B. Check your
              task list for details.
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

      {/* Work Statistics */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
      >
        {WORKER_STATS.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <Card
              key={idx}
              className="border-border bg-card hover:shadow-lg transition-all"
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <div className={`rounded-full p-2 ${stat.bg}`}>
                  <Icon className={`h-4 w-4 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">
                  {stat.value}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </motion.section>

      {/* Main Content */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="w-full overflow-hidden rounded-[2rem] border border-border bg-card shadow-2xl backdrop-blur-xl"
      >
        <Tabs defaultValue="tasks" className="w-full">
          <TabsList className="mb-0 h-auto w-full justify-start gap-2 rounded-none border border-b-0 border-border bg-card p-1 px-6 py-4">
            <TabsTrigger
              value="tasks"
              className="gap-2 transition-all data-[state=active]:bg-emerald-600 data-[state=active]:text-foreground"
            >
              <Calendar className="h-4 w-4" /> My Tasks
            </TabsTrigger>
            <TabsTrigger
              value="schedule"
              className="gap-2 transition-all data-[state=active]:bg-emerald-600 data-[state=active]:text-foreground"
            >
              <Clock className="h-4 w-4" /> Schedule
            </TabsTrigger>
          </TabsList>

          <div className="p-6">
            <TabsContent value="tasks" className="mt-0 space-y-4">
              <div className="space-y-3">
                {WORKER_TASKS.map((task) => (
                  <Card
                    key={task.id}
                    className="border-border hover:shadow-md transition-all"
                  >
                    <CardContent className="flex items-center justify-between p-4">
                      <div className="flex-1">
                        <h3 className="font-medium text-foreground">
                          {task.title}
                        </h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          {task.time}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            task.status === "completed"
                              ? "bg-emerald-500/20 text-emerald-300"
                              : task.status === "in-progress"
                                ? "bg-orange-500/20 text-orange-300"
                                : "bg-slate-500/20 text-slate-300"
                          }`}
                        >
                          {task.status === "completed"
                            ? "Completed"
                            : task.status === "in-progress"
                              ? "In Progress"
                              : "Pending"}
                        </span>
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-border text-foreground hover:bg-white/5"
                        >
                          Details
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="schedule" className="mt-0">
              <Card className="border-0 bg-transparent shadow-none">
                <CardHeader>
                  <CardTitle>Work Schedule</CardTitle>
                  <CardDescription>
                    Your assigned work hours and break times
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="rounded-lg border border-border bg-black/20 p-4">
                      <h4 className="font-medium text-foreground mb-2">
                        Monday - Friday
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        9:00 AM - 5:00 PM (1 hour lunch break)
                      </p>
                    </div>
                    <div className="rounded-lg border border-border bg-black/20 p-4">
                      <h4 className="font-medium text-foreground mb-2">
                        Saturday
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        9:00 AM - 1:00 PM
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </div>
        </Tabs>
      </motion.section>
    </div>
  );
}
