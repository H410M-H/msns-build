// File: src/components/cards/ClassesCard.tsx
"use client";

import Link from "next/link";
import { api } from "~/trpc/react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { Skeleton } from "~/components/ui/skeleton";
import {
  BookOpen,
  Settings,
  UserPlus,
  Banknote,
  AlertCircle,
} from "lucide-react";
import { cn } from "~/lib/utils";

type ClassProps = {
  classId: string;
  grade: string;
  section?: string;
  category: string;
  fee: number;
};

// Helper for consistent currency formatting
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-PK", {
    style: "currency",
    currency: "PKR",
    minimumFractionDigits: 0,
  }).format(amount);
};

export const ClassesCard = () => {
  const { data: classes, isLoading, isError } = api.class.getClasses.useQuery();

  if (isLoading) {
    return <ClassesGridSkeleton />;
  }

  if (isError || !classes) {
    return (
      <div className="flex h-64 w-full flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center dark:border-border dark:bg-card">
        <div className="mb-4 rounded-full bg-red-100 p-4 dark:bg-red-500/10">
          <AlertCircle className="h-8 w-8 text-red-500 dark:text-red-400" />
        </div>
        <p className="font-medium text-slate-700 dark:text-foreground">
          Failed to load classes
        </p>
        <p className="text-sm text-muted-foreground">
          Please check your connection and try again.
        </p>
      </div>
    );
  }

  if (classes.length === 0) {
    return (
      <div className="flex h-64 w-full flex-col items-center justify-center space-y-3 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center dark:border-border dark:bg-card">
        <div className="rounded-full border border-slate-200 bg-white p-4 dark:border-border dark:bg-muted">
          <BookOpen className="h-8 w-8 text-muted-foreground dark:text-muted-foreground" />
        </div>
        <p className="font-medium text-slate-600 dark:text-muted-foreground">
          No classes found
        </p>
        <p className="text-xs text-muted-foreground dark:text-slate-600">
          Create a class to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 duration-500 animate-in fade-in sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {classes.map((classItem: ClassProps) => (
        <Card
          key={classItem.classId}
          className={cn(
            "group relative flex flex-col justify-between overflow-hidden rounded-xl transition-all duration-300",
            // Light Mode
            "border-slate-200 bg-white shadow-sm hover:-translate-y-1 hover:border-emerald-300 hover:shadow-lg",
            // Dark Mode
            "dark:border-border dark:bg-card dark:backdrop-blur-sm dark:hover:border-emerald-500/30 dark:hover:shadow-emerald-900/10",
          )}
        >
          {/* Decorative Gradient Line */}
          <div className="absolute left-0 top-0 h-1 w-full bg-gradient-to-r from-emerald-500 to-teal-500 opacity-0 transition-opacity group-hover:opacity-100" />

          <CardHeader className="px-5 pb-2 pt-5">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <CardTitle className="flex items-center gap-2 text-2xl font-bold tracking-tight text-slate-900 transition-colors group-hover:text-emerald-700 dark:text-foreground dark:group-hover:text-emerald-300">
                  {classItem.grade}
                </CardTitle>
                <p className="text-sm text-muted-foreground dark:text-muted-foreground">
                  Section:{" "}
                  <span className="font-medium text-slate-700 dark:text-foreground">
                    {classItem.section ?? "N/A"}
                  </span>
                </p>
              </div>
              <Badge
                variant="secondary"
                className="border border-slate-200 bg-slate-100 text-[10px] uppercase tracking-wider text-slate-600 transition-colors group-hover:bg-emerald-50 group-hover:text-emerald-700 dark:border-border dark:bg-white/5 dark:text-foreground dark:group-hover:bg-emerald-500/10 dark:group-hover:text-emerald-400"
              >
                {classItem.category}
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="px-5 pb-4">
            <div className="mt-2 flex items-center gap-3 rounded-lg border border-slate-100 bg-slate-50 p-3 dark:border-border dark:bg-black/20">
              <div className="rounded-md bg-emerald-100 p-1.5 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400">
                <Banknote className="h-4 w-4" />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  Monthly Fee
                </p>
                <p className="font-mono font-medium text-slate-700 dark:text-foreground">
                  {formatCurrency(classItem.fee)}
                </p>
              </div>
            </div>
          </CardContent>

          <CardFooter className="grid grid-cols-2 gap-2 px-5 pb-5 pt-0">
            {/* Using asChild to properly nest Link inside Button */}
            <Button
              variant="outline"
              className="h-9 w-full gap-2 border-slate-200 bg-white text-xs text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:border-border dark:bg-white/5 dark:text-foreground dark:hover:bg-white/10 dark:hover:text-foreground"
              asChild
            >
              <Link
                href={`/admin/academics/classwiseDetail/${classItem.classId}`}
              >
                <Settings className="h-3.5 w-3.5" />
                Manage
              </Link>
            </Button>

            <Button
              className="h-9 w-full gap-2 border-0 bg-emerald-600 text-xs text-foreground shadow-md shadow-emerald-200 hover:bg-emerald-700 dark:shadow-emerald-900/20 dark:hover:bg-emerald-500"
              asChild
            >
              <Link
                href={`/admin/academics/classwiseDetail/${classItem.category}`}
              >
                <UserPlus className="h-3.5 w-3.5" />
                Enroll
              </Link>
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
};

const ClassesGridSkeleton = () => {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div
          key={i}
          className="flex h-[200px] flex-col justify-between rounded-xl border border-slate-200 bg-white p-5 dark:border-border dark:bg-card"
        >
          <div className="space-y-4">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <Skeleton className="h-8 w-20 bg-slate-100 dark:bg-white/10" />
                <Skeleton className="h-4 w-12 bg-slate-100 dark:bg-white/5" />
              </div>
              <Skeleton className="h-5 w-16 rounded-full bg-slate-100 dark:bg-white/5" />
            </div>
            <Skeleton className="h-14 w-full rounded-lg bg-slate-50 dark:bg-white/5" />
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2">
            <Skeleton className="h-9 w-full bg-slate-100 dark:bg-white/10" />
            <Skeleton className="h-9 w-full bg-slate-100 dark:bg-white/10" />
          </div>
        </div>
      ))}
    </div>
  );
};
