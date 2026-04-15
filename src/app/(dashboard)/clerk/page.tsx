"use client";


import { motion } from "framer-motion";
import {
  Users,
  BookOpen,
  Wallet,
} from "lucide-react";

import { PageHeader } from "~/components/blocks/nav/PageHeader";
import { WelcomeSection } from "~/components/blocks/dashboard/welcome";
import { StatsCards } from "~/components/cards/StatCard";
import { RevenueAnalyticsChart } from "~/components/blocks/dashboard/AnalyticsCharts";
import { ActivityFeed } from "~/components/blocks/dashboard/ActivityFeed";
import { BroadcastBoard } from "~/components/blocks/dashboard/BroadcastBoard";
import RegistrationCards from "~/components/cards/RegistrationCard";
import { RevenueCards } from "~/components/cards/RevenueCard";
import SessionCards from "~/components/cards/SessionCard";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";


export default function ClerkDashboard() {
  const breadcrumbs = [{ href: "/clerk", label: "Dashboard", current: true }];

  return (
    <div className="w-full space-y-6">
      <PageHeader breadcrumbs={breadcrumbs} />

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0, duration: 0.4, ease: "easeOut" }}>
        <WelcomeSection />
      </motion.div>

      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.08, duration: 0.4, ease: "easeOut" }}
        className="overflow-hidden rounded-2xl border border-slate-200 bg-white/50 shadow-sm backdrop-blur-xl dark:border-border dark:bg-card"
      >
        <Tabs defaultValue="registration" className="w-full">
          <div className="flex flex-col items-center justify-between gap-4 border-b border-slate-200 bg-slate-50/60 px-4 py-4 dark:border-border dark:bg-black/20 sm:flex-row sm:px-6">
            <h2 className="text-lg font-bold tracking-tight text-slate-800 dark:text-foreground">
              Clerk Operations
            </h2>
            <TabsList className="border border-slate-200 bg-white/70 p-1 shadow-sm dark:border-border dark:bg-card">
              <TabsTrigger
                value="registration"
                className="gap-2 text-xs transition-all data-[state=active]:bg-emerald-600 data-[state=active]:text-white dark:data-[state=active]:text-foreground sm:text-sm"
              >
                <Users className="h-4 w-4" />
                <span className="hidden sm:inline">Registration</span>
              </TabsTrigger>
              <TabsTrigger
                value="revenue"
                className="gap-2 text-xs transition-all data-[state=active]:bg-emerald-600 data-[state=active]:text-white dark:data-[state=active]:text-foreground sm:text-sm"
              >
                <Wallet className="h-4 w-4" />
                <span className="hidden sm:inline">Revenue</span>
              </TabsTrigger>
              <TabsTrigger
                value="session"
                className="gap-2 text-xs transition-all data-[state=active]:bg-emerald-600 data-[state=active]:text-white dark:data-[state=active]:text-foreground sm:text-sm"
              >
                <BookOpen className="h-4 w-4" />
                <span className="hidden sm:inline">Sessions</span>
              </TabsTrigger>
            </TabsList>
          </div>
          <div className="p-4 sm:p-6">
            <TabsContent value="registration" className="mt-0">
              <RegistrationCards />
            </TabsContent>
            <TabsContent value="revenue" className="mt-0">
              <RevenueCards />
            </TabsContent>
            <TabsContent value="session" className="mt-0">
              <SessionCards />
            </TabsContent>
          </div>
        </Tabs>
      </motion.section>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.16, duration: 0.4, ease: "easeOut" }}>
        <StatsCards />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.24, duration: 0.4, ease: "easeOut" }}
        className="grid grid-cols-1 gap-6 lg:grid-cols-3"
      >
        <div className="lg:col-span-2">
          <RevenueAnalyticsChart />
        </div>
        <div className="lg:col-span-1">
          <BroadcastBoard />
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.32, duration: 0.4, ease: "easeOut" }}>
        <ActivityFeed />
      </motion.div>
    </div>
  );
}
