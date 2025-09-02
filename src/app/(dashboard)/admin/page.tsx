import { PageHeader } from "~/components/blocks/nav/PageHeader";
import { WelcomeSection } from "~/components/blocks/dashboard/welcome";
import { ProfileSection } from "~/components/blocks/dashboard/profile";
import { StatsSection } from "~/components/blocks/dashboard/stat";
import { AdminSection } from "~/components/blocks/dashboard/admin";
import { BarChart3, Settings, Calendar, Users, BookOpen } from "lucide-react";
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

export default async function DashboardPage() {
  const breadcrumbs = [
    { href: "/dashboard", label: "Dashboard", current: true },
  ];

  return (
    <>
      <PageHeader breadcrumbs={breadcrumbs} />
      <WelcomeSection />
      <ProfileSection />

      {/* Stats Overview */}
      <StatsSection />

      {/* Main Content Tabs */}
      <Tabs defaultValue="management" className="mb-10">
        <TabsList className="mb-8 grid w-full grid-cols-3 lg:w-[400px]">
          <TabsTrigger value="management" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Management
          </TabsTrigger>
          <TabsTrigger value="events" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Events
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="management">
          <AdminSection />
        </TabsContent>

        <TabsContent value="events">
          <div className="mb-8">
            <div className="mb-6 flex items-center justify-between border-b border-slate-200 pb-2">
              <h2 className="text-2xl font-bold text-slate-800">
                Upcoming Events
              </h2>
              <Button variant="outline" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Add Event
              </Button>
            </div>
            <EventsTable />
          </div>
        </TabsContent>

        <TabsContent value="analytics">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  User Analytics
                </CardTitle>
                <CardDescription>
                  Overview of user activity and engagement
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex h-40 items-center justify-center rounded-lg bg-slate-100">
                  <p className="text-slate-500">
                    User engagement chart will be displayed here
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Course Analytics
                </CardTitle>
                <CardDescription>
                  Overview of course performance and enrollment
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex h-40 items-center justify-center rounded-lg bg-slate-100">
                  <p className="text-slate-500">
                    Course performance chart will be displayed here
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Quick Stats Footer */}
      {/* <div className="mb-10 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-emerald-600">245</div>
            <div className="mt-1 text-sm text-slate-600">Active Users</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">42</div>
            <div className="mt-1 text-sm text-slate-600">New Registrations</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-amber-600">18</div>
            <div className="mt-1 text-sm text-slate-600">Pending Requests</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-rose-600">7</div>
            <div className="mt-1 text-sm text-slate-600">System Alerts</div>
          </div>
        </div>
      </div> */}
    </>
  );
}
