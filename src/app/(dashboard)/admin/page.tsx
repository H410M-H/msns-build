// app/dashboard/page.tsx
import { PageHeader } from "~/components/blocks/nav/PageHeader";
import { WelcomeSection } from "~/components/blocks/dashboard/welcome";
import { ProfileSection } from "~/components/blocks/dashboard/profile";
import { AdminSection } from "~/components/blocks/dashboard/admin";
import {
  BarChart3,
  Settings,
  Calendar,
  Users,
  BookOpen,
  Plus,
} from "lucide-react";
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
import { StatsCards } from "~/components/cards/StatCard";

export default async function DashboardPage() {
  const breadcrumbs = [{ href: "/admin", label: "Dashboard", current: true }];

  return (
    <div className="min-h-screen space-x-6 ">
          <PageHeader breadcrumbs={breadcrumbs} />
      <div className="flex-1 p-2 space-y-4 lg:pb-8">
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <WelcomeSection />
            <StatsCards />
          </div>
          <div className="lg:col-span-1">
            <ProfileSection />
          </div>
        </section>

        {/* Institutional Overview */}
        <section className="bg-white rounded-3xl border border-slate-200/60 shadow-sm">
          <div className="relative overflow-hidden rounded-3xl border border-white/40 bg-white/70 p-8 shadow-2xl backdrop-blur-sm lg:p-6">
            <div className="absolute right-0 top-0 h-32 w-32 rounded-full bg-gradient-to-br from-yellow-400/20 to-orange-400/40 blur-2xl"></div>
          {/* Main Tabs */}
          <Tabs defaultValue="management" className="w-full">
            <TabsList className="grid w-full max-w-md grid-cols-3 bg-slate-100 p-1.5 rounded-lg">
              <TabsTrigger
                value="management"
                className="flex items-center gap-2 transition-all data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-blue-700 rounded-md"
              >
                <Settings className="h-4 w-4" />
                Management
              </TabsTrigger>
              <TabsTrigger
                value="events"
                className="flex items-center gap-2 transition-all data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-blue-700 rounded-md"
              >
                <Calendar className="h-4 w-4" />
                Events
              </TabsTrigger>
              <TabsTrigger
                value="analytics"
                className="flex items-center gap-2 transition-all data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-blue-700 rounded-md"
              >
                <BarChart3 className="h-4 w-4" />
                Analytics
              </TabsTrigger>
            </TabsList>

            <div className="mt-6">
              <TabsContent value="management" className="m-0">
                <AdminSection />
              </TabsContent>

              <TabsContent value="events" className="m-0">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-4">
                    <div>
                      <CardTitle className="flex items-center gap-2 text-slate-800">
                        <Calendar className="h-5 w-5 text-blue-600" />
                        Upcoming Events
                      </CardTitle>
                      <CardDescription>Manage and schedule institutional events</CardDescription>
                    </div>
                    <Button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700">
                      <Plus className="h-4 w-4" />
                      Add Event
                    </Button>
                  </CardHeader>
                  <CardContent>
                    <EventsTable />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="analytics" className="m-0">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card className="border-slate-200/60 hover:shadow-md transition-all">
                    <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-50/50 border-b border-slate-200/60">
                      <CardTitle className="flex items-center gap-2 text-blue-800">
                        <Users className="h-5 w-5" />
                        User Analytics
                      </CardTitle>
                      <CardDescription>Overview of user activity and engagement</CardDescription>
                    </CardHeader>
                    {/* <CardContent className="p-6">
                      <div className="flex h-40 flex-col items-center justify-center rounded-lg border border-slate-200/40 bg-gradient-to-br from-blue-100/30 to-blue-50/50">
                        <div className="mb-2 flex items-center gap-2 text-blue-600">
                          <TrendingUp className="h-5 w-5" />
                          <span className="font-medium">+12% this month</span>
                        </div>
                        <p className="text-sm text-slate-500 text-center">
                          User engagement analytics<br />will be displayed here
                        </p>
                      </div>
                    </CardContent> */}
                  </Card>

                  <Card className="border-slate-200/60 hover:shadow-md transition-all">
                    <CardHeader className="bg-gradient-to-r from-indigo-50 to-indigo-50/50 border-b border-slate-200/60">
                      <CardTitle className="flex items-center gap-2 text-indigo-800">
                        <BookOpen className="h-5 w-5" />
                        Course Analytics
                      </CardTitle>
                      <CardDescription>Overview of course performance and enrollment</CardDescription>
                    </CardHeader>
                    {/* <CardContent className="p-6">
                      <div className="flex h-40 flex-col items-center justify-center rounded-lg border border-slate-200/40 bg-gradient-to-br from-indigo-100/30 to-indigo-50/50">
                        <div className="mb-2 flex items-center gap-2 text-indigo-600">
                          <TrendingUp className="h-5 w-5" />
                          <span className="font-medium">+8% enrollment</span>
                        </div>
                        <p className="text-sm text-slate-500 text-center">
                          Course performance metrics<br />will be displayed here
                        </p>
                      </div>
                    </CardContent> */}
                  </Card>
                </div>
              </TabsContent>
            </div>
          </Tabs>
          </div>
        </section>
      </div>
      
    </div>
  );
}