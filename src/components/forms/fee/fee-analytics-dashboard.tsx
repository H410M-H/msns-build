"use client";

import type React from "react";
import { api } from "~/trpc/react";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Skeleton } from "~/components/ui/skeleton";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Percent,
  AlertTriangle,
  Award,
} from "lucide-react";

interface FeeAnalyticsDashboardProps {
  sessionId: string;
  year: number;
}

const COLORS = ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6"];

export function FeeAnalyticsDashboard({
  sessionId,
  year,
}: FeeAnalyticsDashboardProps) {
  const analyticsQuery = api.fee.getFeeAnalytics.useQuery(
    { sessionId, year },
    { enabled: !!sessionId },
  );

  const yearComparisonQuery = api.fee.getYearComparison.useQuery(
    { sessionId, years: [year - 2, year - 1, year] },
    { enabled: !!sessionId },
  );

  const analytics = analyticsQuery.data;
  const yearComparison = yearComparisonQuery.data;

  if (analyticsQuery.isLoading) {
    return (
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {Array(4)
          .fill(0)
          .map((_, i) => (
            <Card key={i} className="bg-white">
              <CardHeader>
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-[300px] w-full" />
              </CardContent>
            </Card>
          ))}
      </div>
    );
  }

  if (!analytics) {
    return (
      <Card className="bg-white">
        <CardContent className="py-12 text-center text-muted-foreground">
          No analytics data available. Select a session to view analytics.
        </CardContent>
      </Card>
    );
  }

  const { summary, monthlyTrend, categoryCollection } = analytics;

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          title="Collection Rate"
          value={`${summary.collectionRate.toFixed(1)}%`}
          icon={Percent}
          trend={summary.collectionRate >= 70 ? "up" : "down"}
          color={summary.collectionRate >= 70 ? "green" : "red"}
        />
        <StatCard
          title="Total Discounts"
          value={`Rs. ${summary.totalDiscounts.toLocaleString()}`}
          icon={Award}
          color="purple"
        />
        <StatCard
          title="Late Fees Collected"
          value={`Rs. ${summary.totalLateFees.toLocaleString()}`}
          icon={AlertTriangle}
          color="orange"
        />
        <StatCard
          title="Outstanding"
          value={`Rs. ${summary.totalOutstanding.toLocaleString()}`}
          icon={DollarSign}
          trend="down"
          color="red"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Monthly Collection Trend */}
        <Card className="bg-white">
          <CardHeader>
            <CardTitle className="text-lg">Monthly Collection Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                  <YAxis
                    tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
                    tick={{ fontSize: 12 }}
                  />
                  <Tooltip
                    formatter={(value: number) =>
                      `Rs. ${value.toLocaleString()}`
                    }
                    contentStyle={{
                      borderRadius: "8px",
                      border: "1px solid #E2E8F0",
                    }}
                  />
                  <Bar
                    dataKey="collected"
                    fill="#10B981"
                    name="Collected"
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar
                    dataKey="outstanding"
                    fill="#F59E0B"
                    name="Outstanding"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Collection by Category */}
        <Card className="bg-white">
          <CardHeader>
            <CardTitle className="text-lg">Collection by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryCollection}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="collected"
                    nameKey="category"
                    label={({ category, percent }) =>
                      `${category} (${(percent * 100).toFixed(0)}%)`
                    }
                  >
                    {categoryCollection.map((_, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number) =>
                      `Rs. ${value.toLocaleString()}`
                    }
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Year-over-Year Comparison */}
        <Card className="bg-white lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">Year-over-Year Comparison</CardTitle>
          </CardHeader>
          <CardContent>
            {yearComparisonQuery.isLoading ? (
              <Skeleton className="h-[300px] w-full" />
            ) : yearComparison?.length ? (
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={yearComparison}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                    <XAxis dataKey="year" tick={{ fontSize: 12 }} />
                    <YAxis
                      tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
                      tick={{ fontSize: 12 }}
                    />
                    <Tooltip
                      formatter={(value: number) =>
                        `Rs. ${value.toLocaleString()}`
                      }
                      contentStyle={{
                        borderRadius: "8px",
                        border: "1px solid #E2E8F0",
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="totalExpected"
                      stroke="#3B82F6"
                      strokeWidth={2}
                      name="Expected"
                      dot={{ fill: "#3B82F6" }}
                    />
                    <Line
                      type="monotone"
                      dataKey="totalCollected"
                      stroke="#10B981"
                      strokeWidth={2}
                      name="Collected"
                      dot={{ fill: "#10B981" }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="py-12 text-center text-muted-foreground">
                No comparison data available
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

interface StatCardProps {
  title: string;
  value: string;
  icon: React.ElementType;
  trend?: "up" | "down";
  color: "green" | "red" | "purple" | "orange";
}

function StatCard({ title, value, icon: Icon, trend, color }: StatCardProps) {
  const colorClasses = {
    green: "bg-emerald-50 text-emerald-600 border-emerald-200",
    red: "bg-red-50 text-red-600 border-red-200",
    purple: "bg-purple-50 text-purple-600 border-purple-200",
    orange: "bg-orange-50 text-orange-600 border-orange-200",
  };

  return (
    <Card className={`border-2 ${colorClasses[color]}`}>
      <CardContent className="pt-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm opacity-80">{title}</p>
            <p className="mt-1 text-xl font-bold">{value}</p>
          </div>
          <div className="flex items-center gap-1">
            {trend === "up" && <TrendingUp className="h-5 w-5" />}
            {trend === "down" && <TrendingDown className="h-5 w-5" />}
            {!trend && <Icon className="h-5 w-5" />}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
