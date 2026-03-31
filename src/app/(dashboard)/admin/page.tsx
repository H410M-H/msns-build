"use client";

import { SharedAdminDashboard } from "~/components/blocks/dashboard/SharedAdminDashboard";
import { AdminSection } from "~/components/blocks/dashboard/admin";

export default function DashboardPage() {
  return (
    <SharedAdminDashboard role="admin" ManagementSection={AdminSection} />
  );
}
