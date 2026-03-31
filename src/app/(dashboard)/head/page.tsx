"use client";

import { SharedAdminDashboard } from "~/components/blocks/dashboard/SharedAdminDashboard";
import { ClerkSection } from "~/components/blocks/dashboard/clerk";

export default function HeadDashboard() {
  return (
    <SharedAdminDashboard role="head" ManagementSection={ClerkSection} />
  );
}
