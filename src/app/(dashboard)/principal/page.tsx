import EventsCalendar from '~/components/blocks/academic-calender/events-calender';
import { PageHeader } from '~/components/blocks/nav/PageHeader';
import AdminCards from '~/components/cards/AdminCard';
import { StatsCards } from '~/components/cards/StatCard';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '~/components/ui/dialog';
import { Button } from '~/components/ui/button';
import EventsTable from '~/components/tables/EventsTable';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '~/components/ui/tabs';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '~/components/ui/card';
import { BarChart3, Settings, Calendar, Users, BookOpen } from 'lucide-react';

export default async function PrincipalDashboard() {
  const breadcrumbs = [
    { href: '/principal', label: 'Dashboard', current: true },
  ];

  return (
    <>
      <PageHeader breadcrumbs={breadcrumbs} />

      {/* Stats Overview */}
      <section className="mb-10 px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-bold text-slate-800 mb-6 pb-2 border-b border-slate-200">
          Institutional Overview
        </h2>
        <StatsCards />
      </section>

      {/* Main Content Tabs */}
      <Tabs defaultValue="management" className="mb-10 px-4 sm:px-6 lg:px-8">
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
          <AdminCards />
        </TabsContent>

        <TabsContent value="events">
          <div className="mb-8">
            <div className="mb-6 flex items-center justify-between border-b border-slate-200 pb-2">
              <h2 className="text-2xl font-bold text-slate-800">
                Upcoming Events
              </h2>
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
    </>
  );
}