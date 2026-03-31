// File: src/components/tables/ClassList.tsx
"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { api } from "~/trpc/react";
import { cn } from "~/lib/utils";

// --- Components ---
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "~/components/ui/tabs";
import { ScrollArea, ScrollBar } from "~/components/ui/scroll-area";
import { Checkbox } from "~/components/ui/checkbox";
import { Skeleton } from "~/components/ui/skeleton";
import { Badge } from "~/components/ui/badge";
import { ClassCreationDialog } from "../forms/class/ClassCreation";
import { ClassDeletionDialog } from "../forms/class/ClassDeletion";

// --- Icons ---
import {
  Search,
  RefreshCw,
  Users,
  BookOpen,
  Calendar,
  Banknote,
  AlertCircle,
} from "lucide-react";

// --- Types ---
interface ClassItem {
  classId: string;
  grade: string;
  section: string;
  category: string;
  fee: number;
}

const categoryOrder = ["Montessori", "Primary", "Middle", "SSC_I", "SSC_II"];

// Optimized Colors for Light & Dark Themes
const categoryColors: Record<string, string> = {
  Montessori:
    "data-[state=active]:bg-rose-100 data-[state=active]:text-rose-700 hover:text-rose-600 dark:data-[state=active]:bg-rose-500/10 dark:data-[state=active]:text-rose-400 dark:hover:text-rose-300",
  Primary:
    "data-[state=active]:bg-indigo-100 data-[state=active]:text-indigo-700 hover:text-indigo-600 dark:data-[state=active]:bg-indigo-500/10 dark:data-[state=active]:text-indigo-400 dark:hover:text-indigo-300",
  Middle:
    "data-[state=active]:bg-emerald-100 data-[state=active]:text-emerald-700 hover:text-emerald-600 dark:data-[state=active]:bg-emerald-500/10 dark:data-[state=active]:text-emerald-400 dark:hover:text-emerald-300",
  SSC_I:
    "data-[state=active]:bg-amber-100 data-[state=active]:text-amber-700 hover:text-amber-600 dark:data-[state=active]:bg-amber-500/10 dark:data-[state=active]:text-amber-400 dark:hover:text-amber-300",
  SSC_II:
    "data-[state=active]:bg-violet-100 data-[state=active]:text-violet-700 hover:text-violet-600 dark:data-[state=active]:bg-violet-500/10 dark:data-[state=active]:text-violet-400 dark:hover:text-violet-300",
};

const sectionColors: Record<string, string> = {
  ROSE: "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20",
  TULIP:
    "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20",
  DEFAULT:
    "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-500/10 dark:text-muted-foreground dark:border-slate-500/20",
};

export const ClassList = ({ sessionId }: { sessionId: string }) => {
  const [selectedClasses, setSelectedClasses] = useState<Set<string>>(
    new Set(),
  );
  const [searchQuery, setSearchQuery] = useState("");

  const {
    data: classesData,
    isLoading,
    refetch,
    isRefetching,
  } = api.class.getClasses.useQuery();

  const handleRefresh = async () => {
    await refetch();
  };

  const filteredData = useMemo(() => {
    if (!classesData) return [];
    if (!searchQuery) return classesData;
    return classesData.filter(
      (c) =>
        c.grade.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.section.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [classesData, searchQuery]);

  const groupedData = useMemo(() => {
    const grouped: Record<string, ClassItem[]> = {};
    filteredData.forEach((item) => {
      const typedItem = item as unknown as ClassItem;
      grouped[typedItem.category] ??= [];
      grouped[typedItem.category]?.push(typedItem);
    });
    return grouped;
  }, [filteredData]);

  const handleClassSelect = (classId: string) => {
    setSelectedClasses((prev) => {
      const next = new Set(prev);
      if (next.has(classId)) next.delete(classId);
      else next.add(classId);
      return next;
    });
  };

  return (
    <div className="w-full space-y-6">
      {/* Header Section */}
      <div className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white/50 p-4 shadow-sm backdrop-blur-md transition-colors dark:border-border dark:bg-card md:flex-row md:items-center md:justify-between">
        <div className="group relative w-full md:max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-emerald-500" />
          <Input
            placeholder="Search by grade or section..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-10 rounded-lg border-slate-200 bg-white pl-9 text-slate-900 transition-all placeholder:text-muted-foreground focus:border-emerald-500/50 focus:ring-emerald-500/50 dark:border-border dark:bg-card dark:text-foreground dark:placeholder:text-muted-foreground"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            className="gap-2 border-slate-200 bg-white text-slate-600 transition-colors hover:bg-emerald-50 hover:text-emerald-600 dark:border-border dark:bg-card dark:text-foreground dark:hover:bg-emerald-500/10 dark:hover:text-emerald-400"
            disabled={isLoading || isRefetching}
          >
            <RefreshCw
              className={cn(
                "h-4 w-4",
                (isLoading || isRefetching) && "animate-spin",
              )}
            />
            <span className="hidden sm:inline">Refresh</span>
          </Button>

          <ClassDeletionDialog classIds={Array.from(selectedClasses)} />
          <ClassCreationDialog />
        </div>
      </div>

      {/* Tabs Section */}
      <Tabs defaultValue={categoryOrder[0]} className="w-full">
        <div className="sticky top-0 z-10 -mx-4 bg-slate-50/80 px-4 py-2 backdrop-blur-md dark:bg-card md:static md:mx-0 md:bg-transparent md:p-0">
          <ScrollArea className="w-full whitespace-nowrap rounded-lg border border-slate-200 bg-white p-1 dark:border-border dark:bg-card">
            <TabsList className="bg-transparent p-0">
              {categoryOrder.map((category) => (
                <TabsTrigger
                  key={category}
                  value={category}
                  className={cn(
                    "rounded-md px-4 py-2 text-sm font-medium text-muted-foreground transition-all hover:text-slate-900 dark:text-muted-foreground dark:hover:text-foreground",
                    categoryColors[category],
                  )}
                >
                  {category}
                </TabsTrigger>
              ))}
            </TabsList>
            <ScrollBar orientation="horizontal" className="invisible" />
          </ScrollArea>
        </div>

        {categoryOrder.map((category) => (
          <TabsContent
            key={category}
            value={category}
            className="mt-6 min-h-[300px] outline-none"
          >
            {isLoading ? (
              <ClassListSkeleton />
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                <AnimatePresence mode="popLayout">
                  {groupedData[category]?.length ? (
                    groupedData[category]?.map((classItem, index) => (
                      <ClassCard
                        key={classItem.classId}
                        item={classItem}
                        isSelected={selectedClasses.has(classItem.classId)}
                        onSelect={() => handleClassSelect(classItem.classId)}
                        sessionId={sessionId}
                        index={index}
                      />
                    ))
                  ) : (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="col-span-full flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50/50 py-16 text-center text-muted-foreground dark:border-border dark:bg-card dark:text-muted-foreground"
                    >
                      <div className="mb-4 rounded-full border border-slate-200 bg-white p-4 shadow-sm dark:border-border dark:bg-card">
                        <AlertCircle className="h-8 w-8 text-muted-foreground dark:text-slate-600" />
                      </div>
                      <p className="text-lg font-medium text-slate-700 dark:text-foreground">
                        No classes found in {category}
                      </p>
                      <p className="text-sm">
                        Create a new class to get started.
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

// --- Extracted Card Component ---
const ClassCard = ({
  item,
  isSelected,
  onSelect,
  sessionId,
  index,
}: {
  item: ClassItem;
  isSelected: boolean;
  onSelect: () => void;
  sessionId: string;
  index: number;
}) => {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2, delay: index * 0.05 }}
      className={cn(
        "group relative flex flex-col justify-between overflow-hidden rounded-xl border transition-all duration-300",
        // Light Mode
        "border-slate-200 bg-white shadow-sm hover:-translate-y-1 hover:border-emerald-300 hover:shadow-lg",
        // Dark Mode
        "dark:border-border dark:bg-card dark:backdrop-blur-sm dark:hover:border-emerald-500/30 dark:hover:shadow-emerald-900/10",
        // Selection State
        isSelected &&
          "border-emerald-300 bg-emerald-50 ring-1 ring-emerald-500 dark:border-emerald-500/30 dark:bg-emerald-900/10",
      )}
    >
      {/* Decorative Gradient */}
      <div className="absolute left-0 top-0 h-1 w-full bg-gradient-to-r from-emerald-500 to-teal-500 opacity-0 transition-opacity group-hover:opacity-100" />

      {/* Selection Checkbox */}
      <div className="absolute right-4 top-4 z-10">
        <Checkbox
          checked={isSelected}
          onCheckedChange={onSelect}
          className="h-5 w-5 rounded-md border-slate-300 data-[state=checked]:bg-emerald-600 data-[state=checked]:text-foreground dark:border-border"
        />
      </div>

      <div className="space-y-4 p-5">
        {/* Header */}
        <div>
          <h3 className="text-2xl font-bold tracking-tight text-slate-900 transition-colors group-hover:text-emerald-700 dark:text-foreground dark:group-hover:text-emerald-300">
            {item.grade}
          </h3>
          <Badge
            variant="outline"
            className={cn(
              "mt-2 border font-medium",
              sectionColors[item.section] ?? sectionColors.DEFAULT,
            )}
          >
            {item.section}
          </Badge>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-2 gap-3 rounded-lg border border-slate-100 bg-slate-50 p-3 dark:border-border dark:bg-black/20">
          <div className="space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              Monthly Fee
            </span>
            <div className="flex items-center gap-1.5 font-mono font-semibold text-emerald-600 dark:text-emerald-400">
              <Banknote className="h-3.5 w-3.5" />
              <span>{item.fee.toLocaleString()}</span>
            </div>
          </div>
          <div className="space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              Students
            </span>
            <div className="flex items-center gap-1.5 font-medium text-slate-700 dark:text-foreground">
              <Users className="h-3.5 w-3.5 text-muted-foreground dark:text-muted-foreground" />
              <span>--</span>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="mt-auto grid grid-cols-2 gap-2 p-4 pt-0">
        <Button
          asChild
          size="sm"
          variant="outline"
          className="h-8 w-full border-slate-200 bg-slate-50 text-xs text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:border-border dark:bg-white/5 dark:text-foreground dark:hover:bg-white/10 dark:hover:text-foreground"
        >
          <Link
            href={`/admin/sessions/class/?classId=${item.classId}&sessionId=${sessionId}`}
          >
            <BookOpen className="mr-1.5 h-3.5 w-3.5" />
            View
          </Link>
        </Button>
        <Button
          asChild
          size="sm"
          variant="outline"
          className="h-8 w-full border-slate-200 bg-slate-50 text-xs text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:border-border dark:bg-white/5 dark:text-foreground dark:hover:bg-white/10 dark:hover:text-foreground"
        >
          <Link href={`/admin/sessions/timetable/?classId=${item.classId}`}>
            <Calendar className="mr-1.5 h-3.5 w-3.5" />
            Time
          </Link>
        </Button>
        <Button
          asChild
          size="sm"
          className="col-span-2 h-8 w-full border-0 bg-emerald-600 text-xs text-foreground shadow-md shadow-emerald-200 transition-all hover:bg-emerald-700 dark:shadow-emerald-900/20"
        >
          <Link
            href={`/admin/sessions/fee/?classId=${item.classId}&sessionId=${sessionId}`}
          >
            <Banknote className="mr-1.5 h-3.5 w-3.5" />
            Manage Fees
          </Link>
        </Button>
      </div>
    </motion.div>
  );
};

// --- Skeleton Loader ---
const ClassListSkeleton = () => (
  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
    {Array.from({ length: 8 }).map((_, i) => (
      <div
        key={i}
        className="flex h-[280px] flex-col justify-between rounded-xl border border-slate-200 bg-white p-5 dark:border-border dark:bg-card"
      >
        <div className="space-y-3">
          <div className="flex justify-between">
            <Skeleton className="h-8 w-24 bg-slate-100 dark:bg-white/10" />
            <Skeleton className="h-5 w-5 rounded bg-slate-100 dark:bg-white/10" />
          </div>
          <Skeleton className="h-6 w-16 rounded-full bg-slate-100 dark:bg-white/10" />
          <Skeleton className="h-16 w-full rounded-lg bg-slate-50 dark:bg-white/5" />
        </div>
        <div className="grid gap-2">
          <div className="grid grid-cols-2 gap-2">
            <Skeleton className="h-8 w-full bg-slate-100 dark:bg-white/10" />
            <Skeleton className="h-8 w-full bg-slate-100 dark:bg-white/10" />
          </div>
          <Skeleton className="h-8 w-full bg-slate-100 dark:bg-white/10" />
        </div>
      </div>
    ))}
  </div>
);
