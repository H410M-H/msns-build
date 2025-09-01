// File: src/app/(dashboard)/admin/page.tsx
import { redirect } from 'next/navigation';
import { auth } from '~/server/auth';
import EventsCalendar from '~/components/blocks/academic-calender/events-calender';
import { PageHeader } from '~/components/blocks/nav/PageHeader';
import AdminCards from '~/components/cards/AdminCard';
import { StatsCards } from '~/components/cards/StatCard';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '~/components/ui/dialog';
import { Button } from '~/components/ui/button';
import EventsTable from '~/components/tables/EventsTable';
import { SidebarTrigger } from '~/components/ui/sidebar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '~/components/ui/tabs';
import { Bell, Calendar, Users, BookOpen, BarChart3, Settings } from 'lucide-react';

export default async function AdminDashboard() {
  // Check authentication
  const session = await auth();
  
  // Redirect to sign-in if not authenticated
  if (!session || !session.user) {
    redirect('/sign-in');
  }

  const breadcrumbs = [
    { href: "/admin", label: "Dashboard", current: true },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <PageHeader breadcrumbs={breadcrumbs} />
      
      <div className="pt-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
          <div className="flex items-center gap-4">
            <SidebarTrigger className="mb-4" />
            <div>
              <h1 className="text-3xl font-bold text-slate-800">Admin Dashboard</h1>
              <p className="text-slate-600 mt-1">
                Welcome back, {session.user.username}!
              </p>
            </div>
          </div>
          
          <div className="flex gap-3">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  View Calendar
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Academic Calendar</DialogTitle>
                </DialogHeader>
                <EventsCalendar />
              </DialogContent>
            </Dialog>
            
            <Button className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              Notifications
            </Button>
          </div>
        </div>

        {/* Stats Overview */}
        <section className="mb-10">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-slate-800">Institutional Overview</h2>
            <div className="flex items-center text-sm text-slate-500">
              <BarChart3 className="h-4 w-4 mr-2" />
              Last updated: Today
            </div>
          </div>
          <StatsCards />
        </section>

        {/* Main Content Tabs */}
        <Tabs defaultValue="management" className="mb-10">
          <TabsList className="grid w-full grid-cols-3 lg:w-[400px] mb-8">
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
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-slate-800 mb-6 pb-2 border-b border-slate-200">
                Quick Management
              </h2>
              <AdminCards />
            </div>
          </TabsContent>
          
          <TabsContent value="events">
            <div className="mb-8">
              <div className="flex items-center justify-between mb-6 pb-2 border-b border-slate-200">
                <h2 className="text-2xl font-bold text-slate-800">Upcoming Events</h2>
                <Button variant="outline" className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Add Event
                </Button>
              </div>
              <EventsTable />
            </div>
          </TabsContent>
          
          <TabsContent value="analytics">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                  <div className="h-40 flex items-center justify-center bg-slate-100 rounded-lg">
                    <p className="text-slate-500">User engagement chart will be displayed here</p>
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
                  <div className="h-40 flex items-center justify-center bg-slate-100 rounded-lg">
                    <p className="text-slate-500">Course performance chart will be displayed here</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Quick Stats Footer */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 mb-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-emerald-600">245</div>
              <div className="text-sm text-slate-600 mt-1">Active Users</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">42</div>
              <div className="text-sm text-slate-600 mt-1">New Registrations</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-amber-600">18</div>
              <div className="text-sm text-slate-600 mt-1">Pending Requests</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-rose-600">7</div>
              <div className="text-sm text-slate-600 mt-1">System Alerts</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}