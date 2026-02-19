"use client";

import { lazy, Suspense } from "react";
import { motion } from "framer-motion";
import { 
  BarChart3, 
  Calendar, 
  BookOpen, 
  TrendingUp,
  TrendingDown,
  Wallet,
  UserCheck,
  AlertCircle
} from "lucide-react";

import { PageHeader } from "~/components/blocks/nav/PageHeader";
import { WelcomeSection } from "~/components/blocks/dashboard/welcome";
import { ProfileSection } from "~/components/blocks/dashboard/profile";
import { Skeleton } from "~/components/ui/skeleton";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "~/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { Button } from "~/components/ui/button";

// Lazy load heavy components
const EventsTable = lazy(() => import("~/components/tables/EventsTable"));

// Mock Data (Replace with TRPC `getPrincipalStats` later)
const PRINCIPAL_STATS = [
  { 
    title: "Total Revenue", 
    value: "Rs. 2.4M", 
    desc: "+12% from last month", 
    icon: Wallet, 
    color: "text-emerald-400", 
    bg: "bg-emerald-500/10",
    trend: "up"
  },
  { 
    title: "Expenses", 
    value: "Rs. 1.1M", 
    desc: "Within budget", 
    icon: TrendingDown, 
    color: "text-blue-400", 
    bg: "bg-blue-500/10",
    trend: "down" // Good thing for expenses usually
  },
  { 
    title: "Staff Presence", 
    value: "94%", 
    desc: "4 absent today", 
    icon: UserCheck, 
    color: "text-purple-400", 
    bg: "bg-purple-500/10",
    trend: "neutral"
  },
];

export default function PrincipalDashboard() {
  const breadcrumbs = [{ href: "/principal", label: "Dashboard", current: true }];

  return (
    <div className="w-full space-y-8 p-6">
      <PageHeader breadcrumbs={breadcrumbs} />

      {/* Top Section */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 w-full">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-8 space-y-6"
        >
           <WelcomeSection />
           
           {/* Critical Alert Example */}
           <Card className="border-red-500/20 bg-red-500/5 backdrop-blur-sm">
             <CardContent className="p-4 flex items-center gap-4">
               <div className="p-2 rounded-full bg-red-500/10 text-red-400">
                 <AlertCircle className="h-5 w-5" />
               </div>
               <div>
                 <h4 className="font-medium text-red-100">Attention Required</h4>
                 <p className="text-sm text-red-200/70">3 Staff Leave Requests pending approval.</p>
               </div>
               <div className="ml-auto">
                  <Button variant="outline" size="sm" className="border-red-500/20 hover:bg-red-500/10 text-red-300">Review</Button>
               </div>
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

      {/* Stats Overview */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
      >
        {PRINCIPAL_STATS.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <Card key={idx} className="border-slate-200 bg-white/50 shadow-sm backdrop-blur-md dark:border-white/5 dark:bg-slate-900/40">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-slate-200">{stat.title}</CardTitle>
                  <div className={`p-2 rounded-full ${stat.bg}`}>
                    <Icon className={`h-4 w-4 ${stat.color}`} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">{stat.value}</div>
                  <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                    {stat.trend === "up" && <TrendingUp className="h-3 w-3 text-emerald-500" />}
                    {stat.trend === "down" && <TrendingDown className="h-3 w-3 text-blue-500" />}
                    {stat.desc}
                  </p>
                </CardContent>
              </Card>
            );
        })}
      </motion.section>

      {/* Main Content Tabs */}
      <motion.section 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="w-full rounded-[2rem] border border-white/5 bg-slate-900/40 backdrop-blur-xl shadow-2xl overflow-hidden"
      >
        <Tabs defaultValue="overview" className="w-full">
           <TabsList className="bg-slate-950/50 border border-white/5 p-1 mb-0 border-b-0 rounded-none w-full justify-start px-6 py-4 h-auto gap-2">
              <TabsTrigger value="overview" className="gap-2 data-[state=active]:bg-emerald-600 data-[state=active]:text-white transition-all">
                  <BarChart3 className="h-4 w-4" /> Overview
              </TabsTrigger>
              <TabsTrigger value="academic" className="gap-2 data-[state=active]:bg-emerald-600 data-[state=active]:text-white transition-all">
                  <BookOpen className="h-4 w-4" /> Academic
              </TabsTrigger>
              <TabsTrigger value="calendar" className="gap-2 data-[state=active]:bg-emerald-600 data-[state=active]:text-white transition-all">
                  <Calendar className="h-4 w-4" /> Calendar
              </TabsTrigger>
           </TabsList>

           <div className="p-6">
             <TabsContent value="overview" className="mt-0 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <Card className="border-white/5 bg-black/20">
                     <CardHeader>
                       <CardTitle>Fee Collection Goals</CardTitle>
                       <CardDescription>Monthly target vs Actual</CardDescription>
                     </CardHeader>
                     <CardContent className="flex items-center justify-center h-[200px] text-slate-500">
                        {/* Placeholder for Chart */}
                        Chart: 75% of target achieved
                     </CardContent>
                   </Card>
                   <Card className="border-white/5 bg-black/20">
                     <CardHeader>
                       <CardTitle>Expense Breakdown</CardTitle>
                       <CardDescription>By category (Salaries, Maintenance, etc.)</CardDescription>
                     </CardHeader>
                     <CardContent className="flex items-center justify-center h-[200px] text-slate-500">
                        {/* Placeholder for Chart */}
                        Chart: 60% Salaries, 20% Utilities
                     </CardContent>
                   </Card>
                </div>
             </TabsContent>

             <TabsContent value="calendar" className="mt-0">
               <Card className="border-0 bg-transparent shadow-none w-full">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-lg font-medium text-white">Institutional Calendar</h3>
                      <p className="text-sm text-slate-400">Manage school-wide events and holidays</p>
                    </div>
                  </div>
                  <Suspense fallback={<Skeleton className="h-[300px] w-full rounded-xl bg-slate-800/50" />}>
                      <div className="rounded-xl border border-white/5 bg-black/20 overflow-hidden w-full">
                        <EventsTable />
                      </div>
                  </Suspense>
                </Card>
             </TabsContent>
           </div>
        </Tabs>
      </motion.section>
    </div>
  );
}