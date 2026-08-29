"use client";

import { PageHeader } from "~/components/blocks/nav/PageHeader";
import EventsCalendar from "~/components/blocks/academic-calender/events-calender";

export default function AdminEventsPage() {
  const breadcrumbs = [
    { href: "/admin", label: "Dashboard" },
    { href: "/admin/events", label: "Events & Calendar", current: true },
  ];

  return (
    <section className="relative w-full">
      <div className="relative z-10 flex min-h-screen w-full flex-col">
        {/* PageHeader in layout */}
        <div className="container mx-auto flex-1 px-4 py-6 sm:px-6 lg:px-8 space-y-6">
          <EventsCalendar />
        </div>
      </div>
    </section>
  );
}
