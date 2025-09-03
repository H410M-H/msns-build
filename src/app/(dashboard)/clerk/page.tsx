import { PageHeader } from '~/components/blocks/nav/PageHeader'
import { StatsCards } from '~/components/cards/StatCard'
import { Button } from '~/components/ui/button' // Changed import source
import EventsTable from '~/components/tables/EventsTable'
import { ProfileSection } from '~/components/blocks/dashboard/profile'
import { WelcomeSection } from '~/components/blocks/dashboard/welcome'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '~/components/ui/tabs'
import { Settings, Calendar, BarChart3, Users, BookOpen, Activity } from 'lucide-react'
import { ClerkSection } from '~/components/blocks/dashboard/clerk'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '~/components/ui/card'

export default async function ClerkDashboard() {
  const breadcrumbs = [
    { href: "/clerk", label: "Dashboard", current: true },
  ]

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
    </div>
      );
}
