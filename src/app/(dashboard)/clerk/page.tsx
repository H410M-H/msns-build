"use client";

import { motion } from "framer-motion";
import {
  DollarSign,
  TrendingUp,
  AlertCircle,
  Clock,
} from "lucide-react";

import { PageHeader } from "~/components/blocks/nav/PageHeader";
import { WelcomeSection } from "~/components/blocks/dashboard/welcome";
import { ClerkSection } from "~/components/blocks/dashboard/clerk";
import { StatsCards } from "~/components/cards/StatCard";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "~/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";

// Financial KPIs for Clerk
const CLERK_KPIS = [
  {
    title: "Daily Collections",
    value: "Rs. 45,000",
    icon: DollarSign,
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
  },
  {
    title: "Pending Payments",
    value: "Rs. 125,000",
    icon: Clock,
    color: "text-orange-400",
    bg: "bg-orange-500/10",
  },
  {
    title: "Default Cases",
    value: "8 students",
    icon: AlertCircle,
    color: "text-red-400",
    bg: "bg-red-500/10",
  },
  {
    title: "Collection Rate",
    value: "92%",
    icon: TrendingUp,
    color: "text-blue-400",
    bg: "bg-blue-500/10",
  },
];

export default function ClerkDashboard() {
  const breadcrumbs = [{ href: "/clerk", label: "Dashboard", current: true }];

  return (
    <div className="w-full space-y-8 px-4 sm:px-6">
      <PageHeader breadcrumbs={breadcrumbs} />

      {/* Urgent Tasks Alert */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Alert className="border-red-500/20 bg-red-500/5 backdrop-blur-sm">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Overdue Payments</AlertTitle>
          <AlertDescription>
            12 students have overdue fees exceeding 30 days. Automatic reminders sent.
          </AlertDescription>
        </Alert>
      </motion.div>

      {/* Top Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        <WelcomeSection />
      </motion.div>

      {/* Financial KPIs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
      >
        {CLERK_KPIS.map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <Card
              key={idx}
              className="border-border bg-card hover:shadow-lg transition-all"
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {kpi.title}
                </CardTitle>
                <div className={`rounded-full p-2 ${kpi.bg}`}>
                  <Icon className={`h-4 w-4 ${kpi.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">
                  {kpi.value}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </motion.div>

      {/* Full Width Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <StatsCards />
      </motion.div>

      {/* Main Content Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <ClerkSection />
      </motion.div>
    </div>
  );
}
