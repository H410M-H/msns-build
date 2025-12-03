"use client";

import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { 
  BarChart3, 
  Settings, 
  Calendar, 
  Users, 
  BookOpen, 
  Plus,
} from "lucide-react";

import { PageHeader } from "~/components/blocks/nav/PageHeader";
import { WelcomeSection } from "~/components/blocks/dashboard/welcome";
// Removed ProfileSection import
import { AdminSection } from "~/components/blocks/dashboard/admin";
import { StatsCards } from "~/components/cards/StatCard";
import EventsTable from "~/components/tables/EventsTable";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "~/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { Button } from "~/components/ui/button";

export default function DashboardPage() {
  const breadcrumbs = [{ href: "/admin", label: "Dashboard", current: true }];
  const [isMobile, setIsMobile] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  // Detect mobile for conditional rendering
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  return (
    <div className="relative min-h-screen w-full overflow-x-hidden bg-gradient-to-br from-[#344a3f] via-[#12251b] to-[#02131b]">
      {/* 🎯 OPTIMIZED GRID BACKGROUND (Dark Theme) */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(45,255,196,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(45,255,196,0.05)_1px,transparent_1px)] bg-[size:3rem_3rem] sm:bg-[size:4rem_4rem]" />
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/40 via-black/20 to-black/60" />
      </div>

      {/* 🎯 AMBIENT GLOW EFFECTS (Dark Theme Colors) */}
      {!prefersReducedMotion && !isMobile && (
        <>
          <motion.div
            className="absolute left-[10%] top-[10%] h-[30rem] w-[30rem] rounded-full bg-emerald-500/10 blur-[80px]"
            animate={{
              y: [0, 30, 0],
              opacity: [0.1, 0.2, 0.1],
            }}
            transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute bottom-[10%] right-[10%] h-[25rem] w-[25rem] rounded-full bg-cyan-500/10 blur-[80px]"
            animate={{
              y: [0, -30, 0],
              opacity: [0.1, 0.2, 0.1],
            }}
            transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          />
        </>
      )}

      {/* Main Content Container */}
      <div className="relative z-10 px-4 py-6 sm:px-6 lg:px-8 max-w-[100vw]">
        <PageHeader breadcrumbs={breadcrumbs} />
        
        <div className="flex-1 space-y-6 pt-6 lg:pb-8">
          {/* Top Section: Welcome + Stats (Full Width) */}
          <section className="flex flex-col gap-6 w-full">
             <WelcomeSection />
             <div className="w-full">
               <StatsCards />
             </div>
          </section>

          {/* Institutional Overview Section - Dark Glassmorphism */}
          <section className="bg-black/10 backdrop-blur-xl rounded-[2.5rem] border border-white/45 shadow-2xl relative overflow-hidden">
             {/* Internal Glow */}
             <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-1 bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent blur-sm" />

            <div className="p-4 sm:p-6 lg:p-8">
              
              {/* Main Tabs */}
              <Tabs defaultValue="management" className="w-full">
                {/* Scrollable TabsList */}
                <div className="w-full overflow-x-auto pb-2 sm:pb-0 scrollbar-hide mb-6">
                    <TabsList className="grid w-full min-w-[300px] max-w-md grid-cols-3 bg-white/5 backdrop-blur-md p-1.5 rounded-2xl mx-auto sm:mx-0 border border-white/10">
                    <TabsTrigger
                        value="management"
                        className="flex items-center justify-center gap-2 text-sm font-medium transition-all data-[state=active]:bg-emerald-600 data-[state=active]:text-white data-[state=active]:shadow-lg rounded-xl text-emerald-100/60 hover:text-emerald-100"
                    >
                        <Settings className="h-4 w-4" />
                        Management
                    </TabsTrigger>
                    <TabsTrigger
                        value="events"
                        className="flex items-center justify-center gap-2 text-sm font-medium transition-all data-[state=active]:bg-emerald-600 data-[state=active]:text-white data-[state=active]:shadow-lg rounded-xl text-emerald-100/60 hover:text-emerald-100"
                    >
                        <Calendar className="h-4 w-4" />
                        Events
                    </TabsTrigger>
                    <TabsTrigger
                        value="analytics"
                        className="flex items-center justify-center gap-2 text-sm font-medium transition-all data-[state=active]:bg-emerald-600 data-[state=active]:text-white data-[state=active]:shadow-lg rounded-xl text-emerald-100/60 hover:text-emerald-100"
                    >
                        <BarChart3 className="h-4 w-4" />
                        Analytics
                    </TabsTrigger>
                    </TabsList>
                </div>

                <div className="mt-4 sm:mt-6">
                  <TabsContent value="management" className="m-0 focus-visible:outline-none">
                    <AdminSection />
                  </TabsContent>

                  <TabsContent value="events" className="m-0 focus-visible:outline-none">
                    <Card className="border border-white/10 bg-white/5 backdrop-blur-sm shadow-xl">
                      <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 gap-4 border-b border-white/5">
                        <div>
                          <CardTitle className="flex items-center gap-2 text-white text-lg sm:text-xl">
                            <Calendar className="h-5 w-5 text-emerald-400" />
                            Upcoming Events
                          </CardTitle>
                          <CardDescription className="text-emerald-100/50">Manage and schedule institutional events</CardDescription>
                        </div>
                        <Button className="w-full sm:w-auto flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white transition-all shadow-lg shadow-emerald-900/20 border-0">
                          <Plus className="h-4 w-4" />
                          Add Event
                        </Button>
                      </CardHeader>
                      <CardContent className="p-0 sm:p-6 bg-transparent">
                        <div className="overflow-x-auto w-full pb-2">
                           <div className="min-w-[600px] px-4 sm:px-0 text-white">
                             <EventsTable />
                           </div>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="analytics" className="m-0 focus-visible:outline-none">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                      <Card className="border border-white/10 bg-white/5 backdrop-blur-sm hover:bg-white/10 transition-all group">
                        <CardHeader className="border-b border-white/5 p-4 sm:p-6">
                          <CardTitle className="flex items-center gap-2 text-emerald-400 text-base sm:text-lg group-hover:text-emerald-300 transition-colors">
                            <Users className="h-5 w-5" />
                            User Analytics
                          </CardTitle>
                          <CardDescription className="text-emerald-100/40">Overview of user activity and engagement</CardDescription>
                        </CardHeader>
                        <CardContent className="p-4 sm:p-6">
                          <div className="flex h-32 sm:h-40 flex-col items-center justify-center rounded-2xl border border-dashed border-emerald-500/30 bg-emerald-500/5">
                            <div className="mb-2 flex items-center gap-2 text-emerald-400">
                              <BarChart3 className="h-5 w-5" />
                              <span className="font-medium text-sm sm:text-base">+12% this month</span>
                            </div>
                            <p className="text-xs sm:text-sm text-emerald-100/50 text-center px-2">
                              User engagement analytics<br />will be displayed here
                            </p>
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="border border-white/10 bg-white/5 backdrop-blur-sm hover:bg-white/10 transition-all group">
                        <CardHeader className="border-b border-white/5 p-4 sm:p-6">
                          <CardTitle className="flex items-center gap-2 text-cyan-400 text-base sm:text-lg group-hover:text-cyan-300 transition-colors">
                            <BookOpen className="h-5 w-5" />
                            Course Analytics
                          </CardTitle>
                          <CardDescription className="text-cyan-100/40">Overview of course performance</CardDescription>
                        </CardHeader>
                        <CardContent className="p-4 sm:p-6">
                          <div className="flex h-32 sm:h-40 flex-col items-center justify-center rounded-2xl border border-dashed border-cyan-500/30 bg-cyan-500/5">
                            <div className="mb-2 flex items-center gap-2 text-cyan-400">
                              <BarChart3 className="h-5 w-5" />
                              <span className="font-medium text-sm sm:text-base">+8% enrollment</span>
                            </div>
                            <p className="text-xs sm:text-sm text-cyan-100/50 text-center px-2">
                              Course performance metrics<br />will be displayed here
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </TabsContent>
                </div>
              </Tabs>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}