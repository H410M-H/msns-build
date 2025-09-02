import { PageHeader } from '~/components/blocks/nav/PageHeader'
import { StatsCards } from '~/components/cards/StatCard'
import { Button } from '~/components/ui/button' // Changed import source
import EventsTable from '~/components/tables/EventsTable'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@radix-ui/react-tabs'
import { Settings, Calendar, BarChart3, Users, BookOpen } from 'lucide-react'
import { ProfileSection } from '~/components/blocks/dashboard/profile'
import { WelcomeSection } from '~/components/blocks/dashboard/welcome'
import { ClerkSection } from '~/components/blocks/dashboard/clerk'

export default async function HeadDashboard() {
  const breadcrumbs = [
    { href: "/head", label: "Dashboard", current: true },
  ]

  return (
    <div className="items-center">
      <PageHeader breadcrumbs={breadcrumbs} />
      <WelcomeSection />
      <ProfileSection />

      {/* Stats Overview */}
          <section className="mb-10 px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-bold text-slate-800 mb-6 pb-2 border-b border-slate-200">
          Institutional Overview
        </h2>
        <StatsCards />
      </section>

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
          <ClerkSection />
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

    </div>
      );
}
