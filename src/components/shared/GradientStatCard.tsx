"use client";

import type React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Skeleton } from "~/components/ui/skeleton";
import { TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "~/lib/utils";

export interface GradientStatCardProps {
  title: string;
  value: number | string;
  icon: React.ComponentType<{ className?: string }> | React.ReactNode;
  trend?: number | null;
  theme?: "blue" | "green" | "orange" | "purple" | "pink" | "amber" | "indigo" | "emerald" | "rose" | "violet";
  isLoading?: boolean;
  formatAsCurrency?: boolean;
  subtitle?: string;
}

export function GradientStatCard({
  title,
  value,
  icon,
  trend,
  theme = "blue",
  isLoading = false,
  formatAsCurrency = false,
  subtitle,
}: GradientStatCardProps) {
  const colorClasses = {
    blue: "bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-500/10 dark:border-blue-500/20 dark:text-blue-300 hover:shadow-blue-500/10",
    green: "bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-500/10 dark:border-emerald-500/20 dark:text-emerald-300 hover:shadow-emerald-500/10",
    emerald: "bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-500/10 dark:border-emerald-500/20 dark:text-emerald-300 hover:shadow-emerald-500/10",
    orange: "bg-orange-50 border-orange-200 text-orange-700 dark:bg-orange-500/10 dark:border-orange-500/20 dark:text-orange-300 hover:shadow-orange-500/10",
    purple: "bg-purple-50 border-purple-200 text-purple-700 dark:bg-purple-500/10 dark:border-purple-500/20 dark:text-purple-300 hover:shadow-purple-500/10",
    pink: "bg-pink-50 border-pink-200 text-pink-700 dark:bg-pink-500/10 dark:border-pink-500/20 dark:text-pink-300 hover:shadow-pink-500/10",
    amber: "bg-amber-50 border-amber-200 text-amber-700 dark:bg-amber-500/10 dark:border-amber-500/20 dark:text-amber-300 hover:shadow-amber-500/10",
    indigo: "bg-indigo-50 border-indigo-200 text-indigo-700 dark:bg-indigo-500/10 dark:border-indigo-500/20 dark:text-indigo-300 hover:shadow-indigo-500/10",
    rose: "bg-rose-50 border-rose-200 text-rose-700 dark:bg-rose-500/10 dark:border-rose-500/20 dark:text-rose-300 hover:shadow-rose-500/10",
    violet: "bg-violet-50 border-violet-200 text-violet-700 dark:bg-violet-500/10 dark:border-violet-500/20 dark:text-violet-300 hover:shadow-violet-500/10",
  };

  const iconColorClasses = {
    blue: "bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400",
    green: "bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400",
    emerald: "bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400",
    orange: "bg-orange-100 text-orange-600 dark:bg-orange-500/20 dark:text-orange-400",
    purple: "bg-purple-100 text-purple-600 dark:bg-purple-500/20 dark:text-purple-400",
    pink: "bg-pink-100 text-pink-600 dark:bg-pink-500/20 dark:text-pink-400",
    amber: "bg-amber-100 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400",
    indigo: "bg-indigo-100 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400",
    rose: "bg-rose-100 text-rose-600 dark:bg-rose-500/20 dark:text-rose-400",
    violet: "bg-violet-100 text-violet-600 dark:bg-violet-500/20 dark:text-violet-400",
  };

  const displayValue = formatAsCurrency && typeof value === 'number'
    ? `Rs. ${value.toLocaleString()}`
    : typeof value === 'number' ? value.toLocaleString() : value;

  return (
    <Card
      className={cn(
        "border transition-all duration-300 hover:-translate-y-1 hover:shadow-lg",
        colorClasses[theme],
      )}
    >
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-bold uppercase tracking-wider opacity-80">
          {title}
        </CardTitle>
        <div className={cn("rounded-lg p-2", iconColorClasses[theme])}>
          {icon && (
            typeof icon === "function" || (typeof icon === "object" && !("props" in icon)) ? (
              (() => {
                const IconComp = icon as React.ComponentType<{ className?: string }>;
                return <IconComp className="h-4 w-4" />;
              })()
            ) : (
              icon
            )
          )}
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-8 w-24 bg-black/5 dark:bg-white/10" />
        ) : (
          <div className="flex flex-col gap-1">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold">
                {displayValue}
              </span>
              {trend !== undefined && trend !== null && (
                <Badge
                  variant={trend >= 0 ? "default" : "destructive"}
                  className={cn(
                    "ml-auto text-xs",
                    trend >= 0
                      ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200 dark:bg-emerald-500/20 dark:text-emerald-400"
                      : "bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-500/20 dark:text-red-400",
                  )}
                >
                  {trend >= 0 ? (
                    <TrendingUp className="mr-1 h-3 w-3" />
                  ) : (
                    <TrendingDown className="mr-1 h-3 w-3" />
                  )}
                  {Math.abs(trend).toFixed(1)}%
                </Badge>
              )}
            </div>
            {subtitle && (
              <p className="text-xs opacity-70 mt-1">{subtitle}</p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
