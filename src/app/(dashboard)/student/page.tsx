"use client";

import { motion } from "framer-motion";
import { TrendingUp, AlertCircle, Calendar, GraduationCap, ArrowRight, Loader2 } from "lucide-react";
import { useSession } from "next-auth/react";
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
import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";
import { Button } from "~/components/ui/button";
import { Progress } from "~/components/ui/progress";
import Link from "next/link";
import { format } from "date-fns";

export default function StudentDashboard() {
  const { data: session } = useSession();
  const breadcrumbs = [{ href: "/student", label: "Dashboard", current: true }];

  const { data: profile, isLoading: isProfileLoading } = api.student.getProfileByUserId.useQuery(
    undefined, 
    { enabled: !!session?.user }
  );

  const { data: eventsData, isLoading: isEventsLoading } = api.event.getAll.useQuery({ limit: 5 });

  if (isProfileLoading) {
     return <div className="flex h-[50vh] items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-blue-500" /></div>;
  }

  const currentClassInfo = profile?.StudentClass?.[0];
  const recentReportCards = profile?.ReportCard ?? [];
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

          {currentClassInfo && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="border-blue-500/20 bg-blue-500/5 shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <div className="space-y-1">
                    <CardTitle className="text-xl text-blue-500">My Class</CardTitle>
                    <CardDescription>
                      Grade {currentClassInfo.Grades.grade} ({currentClassInfo.Grades.section})
                    </CardDescription>
                  </div>
                  <div className="rounded-full bg-blue-500/10 p-3">
                    <GraduationCap className="h-6 w-6 text-blue-500" />
                  </div>
                </CardHeader>
                <CardContent>
                  <Link href={`/student/sessions/class?sessionId=${currentClassInfo.sessionId}&classId=${currentClassInfo.classId}`}>
                    <Button variant="default" className="mt-2 w-full sm:w-auto bg-blue-600 hover:bg-blue-700">
                      View Class Details <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Fee Alert */}
          <Alert className="border-amber-500/20 bg-amber-500/10 text-amber-200">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Fee Status</AlertTitle>
            <AlertDescription className="flex items-center justify-between">
              <span>Ensure your fees are paid for the current session.</span>
              <Link href="/student/fees">
                <Button
                  variant="outline"
                  size="sm"
                  className="border-amber-500/30 text-amber-500 hover:bg-amber-500/20 hover:text-amber-400"
                >
                  View Check
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
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {/* Academic Progress */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="h-full border-slate-200 bg-white/50 shadow-sm backdrop-blur-md dark:border-border dark:bg-card">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="rounded-lg bg-emerald-500/10 p-2 text-emerald-400">
                    <TrendingUp className="h-5 w-5" />
                  </div>
                  <CardTitle>Academic Progress</CardTitle>
                </div>
              </div>
              <CardDescription>Recent Report Cards</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {recentReportCards.length === 0 ? (
                <div className="text-center py-6 text-sm text-muted-foreground">
                  No recent report cards available.
                </div>
              ) : (
                recentReportCards.map((rc, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-foreground">Total Score ({(rc.percentage).toFixed(1)}%)</span>
                      <span className="font-mono text-emerald-500">
                        {rc.totalObtainedMarks} / {rc.totalMaxMarks}
                      </span>
                    </div>
                    <Progress
                      value={rc.percentage}
                      className="h-2 bg-muted text-emerald-500"
                    />
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Upcoming Tasks */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
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
          transition={{ delay: 0.4 }}
        >
          <BroadcastBoard />
        </motion.div>
      </div>
    </div>
  );
}
