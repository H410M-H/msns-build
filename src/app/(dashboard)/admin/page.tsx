import { PageHeader } from "~/components/blocks/nav/PageHeader";
import { WelcomeSection } from "~/components/blocks/dashboard/welcome";
import { ProfileSection } from "~/components/blocks/dashboard/profile";
import { AdminSection } from "~/components/blocks/dashboard/admin";
import { BarChart3, Settings, Calendar, Users, BookOpen, Plus, TrendingUp, Activity } from "lucide-react";
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
  const breadcrumbs = [
    { href: "/admin", label: "Dashboard", current: true },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30">
      <PageHeader breadcrumbs={breadcrumbs} />
      
      {/* Welcome and Profile Sections with improved spacing */}
      <div className="px-4 sm:px-6 lg:px-8 mb-8">
        <WelcomeSection />
        <ProfileSection />
      </div>

      {/* Stats Overview */}
      <section className="mb-10 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6 pb-2 border-b border-slate-200/60">
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Activity className="h-6 w-6 text-blue-600" />
            Institutional Overview
          </h2>
          <span className="text-sm text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
            Updated recently
          </span>
        </div>
        <StatsCards />
      </section>

      {/* Main Content Tabs */}
      <div className="px-4 sm:px-6 lg:px-8 mb-10">
        <Tabs defaultValue="management" className="mb-10">
          <TabsList className="mb-8 bg-slate-100 p-1.5 w-full max-w-md grid grid-cols-3">
            <TabsTrigger 
              value="management" 
              className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-blue-700 transition-all"
            >
              <Settings className="h-4 w-4" />
              Management
            </TabsTrigger>
            <TabsTrigger 
              value="events" 
              className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-blue-700 transition-all"
            >
              <Calendar className="h-4 w-4" />
              Events
            </TabsTrigger>
            <TabsTrigger 
              value="analytics" 
              className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-blue-700 transition-all"
            >
              <BarChart3 className="h-4 w-4" />
              Analytics
            </TabsTrigger>
          </TabsList>

          <TabsContent value="management">
            <AdminSection />
          </TabsContent>

          <TabsContent value="events">
            <div className="mb-8">
              <div className="mb-6 flex items-center justify-between border-b border-slate-200/60 pb-2">
                <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                  <Calendar className="h-6 w-6 text-blue-600" />
                  Upcoming Events
                </h2>
                <Button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white">
                  <Plus className="h-4 w-4" />
                  Add Event
                </Button>
              </div>
              <EventsTable />
            </div>
          </TabsContent>

          <TabsContent value="analytics">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <Card className="border-slate-200/60 overflow-hidden transition-all hover:shadow-md">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-50/50 border-b border-slate-200/60">
                  <CardTitle className="flex items-center gap-2 text-blue-800">
                    <Users className="h-5 w-5" />
                    User Analytics
                  </CardTitle>
                  <CardDescription className="text-slate-600">
                    Overview of user activity and engagement
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="flex flex-col items-center justify-center h-40 rounded-lg bg-gradient-to-br from-blue-100/30 to-blue-50/50 border border-slate-200/40">
                    <div className="flex items-center gap-2 mb-2 text-blue-600">
                      <TrendingUp className="h-5 w-5" />
                      <span className="font-medium">+12% this month</span>
                    </div>
                    <p className="text-slate-500 text-sm">
                      User engagement chart will be displayed here
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-slate-200/60 overflow-hidden transition-all hover:shadow-md">
                <CardHeader className="bg-gradient-to-r from-indigo-50 to-indigo-50/50 border-b border-slate-200/60">
                  <CardTitle className="flex items-center gap-2 text-indigo-800">
                    <BookOpen className="h-5 w-5" />
                    Course Analytics
                  </CardTitle>
                  <CardDescription className="text-slate-600">
                    Overview of course performance and enrollment
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="flex flex-col items-center justify-center h-40 rounded-lg bg-gradient-to-br from-indigo-100/30 to-indigo-50/50 border border-slate-200/40">
                    <div className="flex items-center gap-2 mb-2 text-indigo-600">
                      <TrendingUp className="h-5 w-5" />
                      <span className="font-medium">+8% enrollment</span>
                    </div>
                    <p className="text-slate-500 text-sm">
                      Course performance chart will be displayed here
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Quick Stats Footer - Now uncommented and styled */}
      {/* <div className="mb-10 px-4 sm:px-6 lg:px-8">
        <div className="rounded-xl border border-slate-200/60 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-700">Quick Stats</h3>
            <span className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded">Today</span>
          </div>
          <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
            <div className="text-center p-4 rounded-lg bg-emerald-50/50">
              <div className="text-2xl font-bold text-emerald-600">245</div>
              <div className="mt-1 text-sm text-slate-600">Active Users</div>
            </div>
            <div className="text-center p-4 rounded-lg bg-blue-50/50">
              <div className="text-2xl font-bold text-blue-600">42</div>
              <div className="mt-1 text-sm text-slate-600">New Registrations</div>
            </div>
            <div className="text-center p-4 rounded-lg bg-amber-50/50">
              <div className="text-2xl font-bold text-amber-600">18</div>
              <div className="mt-1 text-sm text-slate-600">Pending Requests</div>
            </div>
            <div className="text-center p-4 rounded-lg bg-rose-50/50">
              <div className="text-2xl font-bold text-rose-600">7</div>
              <div className="mt-1 text-sm text-slate-600">System Alerts</div>
            </div>
          </div>
        </div>
      </div> */}
    </div>
  );
}