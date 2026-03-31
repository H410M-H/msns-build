"use client";

import { lazy, Suspense } from "react";
import { motion } from "framer-motion";
import {
  Calendar,
  GraduationCap,
  Sparkles,
  BookOpen,
} from "lucide-react";

import { PageHeader } from "~/components/blocks/nav/PageHeader";
import { WelcomeSection } from "~/components/blocks/dashboard/welcome";

import { TeacherSection } from "~/components/blocks/dashboard/teacher";
import { Skeleton } from "~/components/ui/skeleton";
import Link from "next/link";

import { Card } from "~/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { Button } from "~/components/ui/button";

const EventsTable = lazy(() => import("~/components/tables/EventsTable"));

import { TeacherSalaryTab } from "~/components/blocks/dashboard/TeacherSalaryTab";
import { Wallet } from "lucide-react";

export default function TeacherDashboard() {
  const breadcrumbs = [{ href: "/teacher", label: "Dashboard", current: true }];

  return (
    <div className="w-full space-y-6">
      <PageHeader breadcrumbs={breadcrumbs} />

      {/* Welcome Banner */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <WelcomeSection />
      </motion.div>



      {/* Main Content Tabs */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="w-full overflow-hidden rounded-[2rem] border border-border bg-card shadow-2xl backdrop-blur-xl"
      >
        <Tabs defaultValue="classes" className="w-full">
          <div className="flex flex-col items-center justify-between gap-4 border-b border-border bg-black/20 px-6 py-4 sm:flex-row">
            <div className="flex items-center gap-2">
              <div className="rounded-lg bg-emerald-500/10 p-2">
                <BookOpen className="h-5 w-5 text-emerald-400" />
              </div>
              <h2 className="text-xl font-semibold tracking-tight text-foreground">
                Academic Overview
              </h2>
            </div>
            <TabsList className="border border-border bg-card p-1">
              <TabsTrigger
                value="classes"
                className="gap-2 transition-all data-[state=active]:bg-emerald-600 data-[state=active]:text-foreground"
              >
                <GraduationCap className="h-4 w-4" />{" "}
                <span className="hidden sm:inline">My Classes</span>
              </TabsTrigger>
              <TabsTrigger
                value="events"
                className="gap-2 transition-all data-[state=active]:bg-emerald-600 data-[state=active]:text-foreground"
              >
                <Calendar className="h-4 w-4" />{" "}
                <span className="hidden sm:inline">Schedule</span>
              </TabsTrigger>
              <TabsTrigger
                value="revenue"
                className="gap-2 transition-all data-[state=active]:bg-emerald-600 data-[state=active]:text-foreground"
              >
                <Wallet className="h-4 w-4" />{" "}
                <span className="hidden sm:inline">My Salary</span>
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="w-full p-4 sm:p-6">
            <TabsContent
              value="classes"
              className="mt-0 w-full space-y-6 focus-visible:outline-none"
            >
              <div className="flex justify-end">
                <Link href="/teacher/exams/marks">
                  <Button className="gap-2 bg-emerald-600 text-foreground hover:bg-emerald-700">
                    <Sparkles className="h-4 w-4" />
                    Enter Exam Marks
                  </Button>
                </Link>
              </div>
              <TeacherSection />
            </TabsContent>

            <TabsContent
              value="events"
              className="mt-0 w-full focus-visible:outline-none"
            >
              <Card className="w-full border-0 bg-transparent shadow-none">
                <div className="mb-6 flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-medium text-foreground">
                      Upcoming Events
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      School calendar and holidays
                    </p>
                  </div>
                </div>
                <Suspense
                  fallback={
                    <Skeleton className="h-[300px] w-full rounded-xl bg-muted" />
                  }
                >
                  <div className="w-full overflow-hidden rounded-xl border border-border bg-black/20">
                    <EventsTable />
                  </div>
                </Suspense>
              </Card>
            </TabsContent>

            <TabsContent
              value="revenue"
              className="mt-0 w-full focus-visible:outline-none"
            >
              <TeacherSalaryTab />
            </TabsContent>
          </div>
        </Tabs>
      </motion.section>
    </div>
  );
}
