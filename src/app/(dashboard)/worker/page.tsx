"use client";

import { motion } from "framer-motion";
import { Calendar, Loader2 } from "lucide-react";
import { api } from "~/trpc/react";

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
import { BroadcastBoard } from "~/components/blocks/dashboard/BroadcastBoard";
import { format } from "date-fns";

export default function WorkerDashboard() {

  const breadcrumbs = [{ href: "/worker", label: "Dashboard", current: true }];

  const { data: eventsData, isLoading: isEventsLoading } = api.event.getAll.useQuery({ limit: 5 });

  const upcomingEvents = eventsData?.events.slice(0, 3) ?? [];

  return (
    <div className="w-full space-y-8 p-6">
      <PageHeader breadcrumbs={breadcrumbs} />

      {/* Top Section: Welcome & Profile */}
      <div className="grid w-full grid-cols-1 gap-6 lg:grid-cols-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6 lg:col-span-8"
        >
          <WelcomeSection />
          
          <Card className="border-slate-200 bg-white/50 shadow-sm backdrop-blur-md dark:border-border dark:bg-card">
            <CardHeader>
              <div className="flex items-center gap-2">
                <div className="rounded-lg bg-emerald-500/10 p-2 text-emerald-500">
                  <Calendar className="h-5 w-5" />
                </div>
                <CardTitle>Overview</CardTitle>
              </div>
              <CardDescription>Welcome to your employee portal.</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Here you can view the latest school announcements and your profile information. 
                Use the sidebar to navigate to other available sections.
              </p>
            </CardContent>
          </Card>
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
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Upcoming Events */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="h-full border-slate-200 bg-white/50 shadow-sm backdrop-blur-md dark:border-border dark:bg-card">
            <CardHeader>
              <div className="flex items-center gap-2">
                <div className="rounded-lg bg-purple-500/10 p-2 text-purple-400">
                  <Calendar className="h-5 w-5" />
                </div>
                <CardTitle>Upcoming Events</CardTitle>
              </div>
              <CardDescription>School events and notices</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {upcomingEvents.length === 0 && !isEventsLoading ? (
                <div className="text-center py-6 text-sm text-muted-foreground">
                  No upcoming events.
                </div>
              ) : (
                upcomingEvents.map((task) => (
                  <div
                    key={task.id}
                    className="flex items-start gap-4 rounded-lg border border-border bg-black/5 dark:bg-black/20 p-3 transition-colors hover:bg-black/10 dark:hover:bg-black/30"
                  >
                    <div className="mt-1 h-2 w-2 rounded-full bg-blue-400" />
                    <div>
                      <h4 className="text-sm font-medium text-foreground">
                        {task.title}
                      </h4>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {format(new Date(task.startDateTime), "MMM d, yyyy h:mm a")}
                      </p>
                    </div>
                  </div>
                ))
              )}
              {isEventsLoading && <Loader2 className="h-5 w-5 animate-spin text-center mx-auto" />}
            </CardContent>
          </Card>
        </motion.div>

        {/* Broadcast Board */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <BroadcastBoard />
        </motion.div>
      </div>
    </div>
  );
}
