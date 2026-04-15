"use client";

import { useState } from "react";
import { TrendingUp, Loader2, ChevronDown } from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { api } from "~/trpc/react";
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "~/components/ui/collapsible";
import { Button } from "~/components/ui/button";
import { cn } from "~/lib/utils";

export function RevenueAnalyticsChart() {
  const [isOpen, setIsOpen] = useState(false);
  const { data: activeSession } = api.session.getActiveSession.useQuery();
  const currentYear = new Date().getFullYear();

  const { data: analytics, isLoading } = api.fee.getFeeAnalytics.useQuery(
    {
      sessionId: activeSession?.sessionId ?? "",
      year: currentYear,
    },
    { enabled: !!activeSession?.sessionId }
  );

  // monthlyTrend already has { month, collected, outstanding } for 12 months
  const chartData = analytics?.monthlyTrend ?? [];

  const totalCollected = chartData.reduce((s, m) => s + m.collected, 0);
  const totalOutstanding = chartData.reduce((s, m) => s + m.outstanding, 0);
  const collectionRate = analytics?.summary.collectionRate ?? 0;

  return (
    <Card className="card-enhanced">
      <Collapsible open={isOpen} onOpenChange={setIsOpen} className="w-full">
        <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-4">
          <div className="space-y-1.5">
            <CardTitle>Revenue Analytics</CardTitle>
            <CardDescription>
              {activeSession?.sessionName ?? "Current Session"} · {currentYear} fee collection
            </CardDescription>
          </div>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm" className="w-9 p-0">
              <ChevronDown className={cn("h-4 w-4 transition-all duration-200", isOpen ? "rotate-180" : "")} />
              <span className="sr-only">Toggle</span>
            </Button>
          </CollapsibleTrigger>
        </CardHeader>
        <CollapsibleContent>
          <CardContent>
            {isLoading || !activeSession ? (
              <div className="flex h-[250px] items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <div className="h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={chartData}
                    margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient id="colorCollected" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="colorOutstanding" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.2} />
                    <XAxis
                      dataKey="month"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 11, fill: "#64748b" }}
                      dy={10}
                    />
                    <YAxis hide />
                    <Tooltip
                      formatter={(value: number) => `PKR ${value.toLocaleString()}`}
                      contentStyle={{
                        borderRadius: "8px",
                        border: "none",
                        boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                      }}
                    />
                    <Legend iconType="circle" iconSize={8} />
                    <Area
                      type="monotone"
                      dataKey="collected"
                      name="Collected"
                      stroke="#10b981"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#colorCollected)"
                    />
                    <Area
                      type="monotone"
                      dataKey="outstanding"
                      name="Outstanding"
                      stroke="#f43f5e"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#colorOutstanding)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
          <CardFooter>
            <div className="flex w-full items-start gap-2 text-sm">
              <div className="grid gap-1">
                <div className="flex items-center gap-2 font-medium leading-none text-emerald-600 dark:text-emerald-400">
                  {collectionRate.toFixed(1)}% collection rate this year{" "}
                  <TrendingUp className="h-4 w-4" />
                </div>
                <div className="flex gap-4 leading-none text-muted-foreground text-xs mt-1">
                  <span>Collected: PKR {totalCollected.toLocaleString()}</span>
                  <span>Outstanding: PKR {totalOutstanding.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </CardFooter>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}
