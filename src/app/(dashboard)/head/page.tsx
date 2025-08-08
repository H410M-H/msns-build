import EventsCalendar from '~/components/blocks/academic-calender/events-calender'
import { PageHeader } from '~/components/blocks/nav/PageHeader'
import AdminCards from '~/components/cards/AdminCard'
import { StatsCards } from '~/components/cards/StatCard'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '~/components/ui/dialog'
import { Button } from '~/components/ui/button' // Changed import source
import EventsTable from '~/components/tables/EventsTable'

export default async function HeadDashboard() {
  const breadcrumbs = [
    { href: "/head", label: "Dashboard", current: true },
  ]

  return (
    <div className="items-center">
      <PageHeader breadcrumbs={breadcrumbs} />
      <div className="pt-8 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl font-bold tracking-tight">Head Dashboard</h2>
          <Dialog>
            <DialogTrigger asChild>
              {/* Now using your custom Button component */}
              <Button variant="outline">View Calendar</Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Academic Calendar</DialogTitle>
              </DialogHeader>
              <EventsCalendar />
            </DialogContent>
          </Dialog>
        </div>

        {/* Overview Section */}
        <section className="mb-10">
          <h2 className="text-2xl font-bold text-slate-800 mb-6 pb-2 border-b border-slate-100">
            Institutional Overview
          </h2>
          <div className="grid gap-6">
            <StatsCards />
          </div>
        </section>

        {/* Quick Actions Section */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-slate-800 mb-6 pb-2 border-b border-slate-100">
            Quick Management
          </h2>
          <AdminCards />
        </section>
                <section className="mb-8">
          <h2 className="text-2xl font-bold text-slate-800 mb-6 pb-2 border-b border-slate-100">
            Quick Management
          </h2>
          <EventsTable />
        </section>
      </div>
    </div>
  )
}