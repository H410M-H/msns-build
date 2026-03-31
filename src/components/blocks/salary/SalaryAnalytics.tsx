"use client";

import { useMemo } from "react";
import { api } from "~/trpc/react";
import {
  ResponsiveContainer,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ComposedChart,
  Line,
  type TooltipProps,
} from "recharts";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "~/components/ui/card";
import { Loader2, DollarSign, TrendingUp, Activity } from "lucide-react";

export function SalaryAnalytics({ year }: { year: number }) {
  // Enable polling to fetch updates at runtime (every 5 seconds)
  const { data, isLoading } = api.salary.getMonthlyPayouts.useQuery(
    { year },
    {
      refetchInterval: 5000,
      refetchOnWindowFocus: true,
    },
  );

  // Calculate summary statistics
  const stats = useMemo(() => {
    if (!data) return { total: 0, average: 0, highest: 0 };
    const values = data.map((d) => d.amount);
    const total = values.reduce((a, b) => a + b, 0);
    const average = total / (values.filter((v) => v > 0).length || 1);
    const highest = Math.max(...values, 0);
    return { total, average, highest };
  }, [data]);

  if (isLoading) {
    return (
      <div className="flex h-[400px] w-full animate-pulse flex-col items-center justify-center rounded-xl border border-emerald-500/20 bg-card text-emerald-500">
        <Loader2 className="mb-2 h-8 w-8 animate-spin" />
        <p className="text-sm">Loading analytics...</p>
      </div>
    );
  }

  // Custom Tooltip Component for Glass Theme
  const CustomTooltip = ({
    active,
    payload,
    label,
  }: TooltipProps<number, string>) => {
    if (active && payload?.length) {
      return (
        <div className="rounded-lg border border-emerald-500/20 bg-card p-3 shadow-2xl backdrop-blur-md">
          <p className="mb-1 text-sm font-bold text-foreground">
            {label} {year}
          </p>
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-emerald-500" />
            <p className="text-xs text-foreground">
              Payout:{" "}
              <span className="font-mono font-medium text-emerald-400">
                Rs. {Number(payload[0]?.value).toLocaleString()}
              </span>
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6 duration-700 animate-in fade-in slide-in-from-bottom-4">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card className="border-emerald-500/20 bg-card shadow-lg backdrop-blur-sm">
          <CardContent className="flex items-center gap-4 p-4">
            <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-2.5">
              <DollarSign className="h-5 w-5 text-emerald-400" />
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Total Payout
              </p>
              <p className="text-xl font-bold text-foreground">
                Rs. {stats.total.toLocaleString()}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-emerald-500/20 bg-card shadow-lg backdrop-blur-sm">
          <CardContent className="flex items-center gap-4 p-4">
            <div className="rounded-xl border border-blue-500/20 bg-blue-500/10 p-2.5">
              <TrendingUp className="h-5 w-5 text-blue-400" />
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Avg. Monthly
              </p>
              <p className="text-xl font-bold text-foreground">
                Rs. {Math.round(stats.average).toLocaleString()}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-emerald-500/20 bg-card shadow-lg backdrop-blur-sm">
          <CardContent className="flex items-center gap-4 p-4">
            <div className="rounded-xl border border-purple-500/20 bg-purple-500/10 p-2.5">
              <Activity className="h-5 w-5 text-purple-400" />
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Peak Month
              </p>
              <p className="text-xl font-bold text-foreground">
                Rs. {stats.highest.toLocaleString()}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Chart */}
      <Card className="overflow-hidden border border-emerald-500/20 bg-card shadow-xl backdrop-blur-xl">
        <CardHeader className="border-b border-emerald-500/10 pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-lg text-foreground">
                Monthly Distribution
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground">
                Salary disbursement trends for {year}
              </CardDescription>
            </div>
            <div className="flex animate-pulse items-center gap-2 rounded border border-emerald-500/20 bg-emerald-900/20 px-2 py-1 text-[10px] text-emerald-400">
              <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              Live Updates
            </div>
          </div>
        </CardHeader>
        <CardContent className="h-[350px] w-full p-4 sm:p-6">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              data={data}
              margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#334155"
                vertical={false}
                opacity={0.4}
              />
              <XAxis
                dataKey="month"
                stroke="#94a3b8"
                tick={{ fill: "#94a3b8", fontSize: 12 }}
                axisLine={false}
                tickLine={false}
                dy={10}
              />
              <YAxis
                stroke="#94a3b8"
                tick={{ fill: "#94a3b8", fontSize: 11 }}
                tickFormatter={(value: number) => `Rs. ${value / 1000}k`}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                content={<CustomTooltip />}
                cursor={{ fill: "rgba(255,255,255,0.03)" }}
              />
              <Bar
                dataKey="amount"
                fill="url(#colorAmount)"
                radius={[4, 4, 0, 0]}
                barSize={32}
                animationDuration={1500}
              />
              <Line
                type="monotone"
                dataKey="amount"
                stroke="#34d399"
                strokeWidth={2}
                dot={{ r: 3, fill: "#34d399", strokeWidth: 0 }}
                activeDot={{ r: 5, strokeWidth: 0 }}
                animationDuration={2000}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
