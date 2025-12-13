"use client";

import { useMemo, useState } from "react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "~/components/ui/tabs";
import { ScrollArea, ScrollBar } from "~/components/ui/scroll-area";
import { api } from "~/trpc/react";
import Link from "next/link";
import { ClassCreationDialog } from "../forms/class/ClassCreation";
import { Search, RefreshCw, Users, BookOpen, Calendar, Banknote, AlertCircle } from "lucide-react";
import { Checkbox } from "~/components/ui/checkbox";
import { Skeleton } from "~/components/ui/skeleton";
import { cn } from "~/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { ClassDeletionDialog } from "../forms/class/ClassDeletion";
import { Badge } from "~/components/ui/badge";

// Define the type to avoid 'any' errors
interface ClassItem {
  classId: string;
  grade: string;
  section: string;
  category: string;
  fee: number;
}

const categoryOrder = ["Montessori", "Primary", "Middle", "SSC_I", "SSC_II"];

const categoryColors: Record<string, string> = {
  Montessori: "data-[state=active]:bg-rose-100 data-[state=active]:text-rose-900",
  Primary: "data-[state=active]:bg-indigo-100 data-[state=active]:text-indigo-900",
  Middle: "data-[state=active]:bg-emerald-100 data-[state=active]:text-emerald-900",
  SSC_I: "data-[state=active]:bg-amber-100 data-[state=active]:text-amber-900",
  SSC_II: "data-[state=active]:bg-violet-100 data-[state=active]:text-violet-900",
};

const sectionColors: Record<string, string> = {
  ROSE: "bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100",
  TULIP: "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100",
};

export const ClassList = ({ sessionId }: { sessionId: string }) => {
  const [selectedClasses, setSelectedClasses] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState("");
  
  const {
    data: classesData,
    isLoading,
    refetch,
    isRefetching
  } = api.class.getClasses.useQuery();

  const handleRefresh = async () => {
    await refetch();
  };

  // Filter data based on search query before grouping
  const filteredData = useMemo(() => {
    if (!classesData) return [];
    if (!searchQuery) return classesData;
    return classesData.filter((c) => 
      c.grade.toLowerCase().includes(searchQuery.toLowerCase()) || 
      c.section.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [classesData, searchQuery]);

  const groupedData = useMemo(() => {
    // Explicitly type the accumulator
    const grouped: Record<string, ClassItem[]> = {};
    filteredData.forEach((item) => {
      // Ensure we treat the item as ClassItem (assuming API returns matching shape)
      const typedItem = item as unknown as ClassItem;
      
      // FIX: Use nullish coalescing assignment (??=)
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
      <div className="flex flex-col gap-4 rounded-xl border bg-card p-4 shadow-sm md:flex-row md:items-center md:justify-between">
        <div className="relative w-full md:max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by grade or section..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-background/50"
          />
        </div>
        
        <div className="flex flex-wrap items-center gap-2">
           <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            className="gap-2"
            disabled={isLoading || isRefetching}
          >
            <RefreshCw className={cn("h-4 w-4", (isLoading || isRefetching) && "animate-spin")} />
            <span className="hidden sm:inline">Refresh</span>
          </Button>
          
          <ClassDeletionDialog classIds={Array.from(selectedClasses)} />
          <ClassCreationDialog />
        </div>
      </div>

      {/* Tabs Section */}
      <Tabs defaultValue={categoryOrder[0]} className="w-full">
        <div className="sticky top-0 z-10 -mx-4 bg-background/95 px-4 py-2 backdrop-blur supports-[backdrop-filter]:bg-background/60 md:static md:mx-0 md:p-0 md:bg-transparent">
          <ScrollArea className="w-full whitespace-nowrap rounded-lg border bg-muted/40 p-1">
            <TabsList className="bg-transparent p-0">
              {categoryOrder.map((category) => (
                <TabsTrigger
                  key={category}
                  value={category}
                  className={cn(
                    "rounded-md px-4 py-2 text-sm font-medium transition-all data-[state=active]:shadow-sm",
                    categoryColors[category]
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
          <TabsContent key={category} value={category} className="mt-6 min-h-[300px]">
             {isLoading ? (
               <ClassListSkeleton />
             ) : (
               <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                 <AnimatePresence mode="popLayout">
                   {/* Check if the category exists and has items */}
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
                       className="col-span-full flex flex-col items-center justify-center py-12 text-center text-muted-foreground"
                     >
                       <div className="mb-4 rounded-full bg-muted p-4">
                         <AlertCircle className="h-8 w-8 text-muted-foreground/50" />
                       </div>
                       <p className="text-lg font-medium">No classes found in {category}</p>
                       <p className="text-sm">Create a new class to get started.</p>
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

// Extracted Card Component for cleaner code
const ClassCard = ({ 
  item, 
  isSelected, 
  onSelect, 
  sessionId, 
  index 
}: { 
  item: ClassItem, // Typed correctly
  isSelected: boolean, 
  onSelect: () => void, 
  sessionId: string,
  index: number 
}) => {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2, delay: index * 0.05 }}
      className={cn(
        "group relative flex flex-col justify-between overflow-hidden rounded-xl border bg-card p-5 shadow-sm transition-all hover:shadow-md",
        isSelected && "ring-2 ring-primary ring-offset-2"
      )}
    >
      {/* Selection Checkbox */}
      <div className="absolute right-4 top-4 z-10">
        <Checkbox
          checked={isSelected}
          onCheckedChange={onSelect}
          className="data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
        />
      </div>

      <div className="space-y-4">
        {/* Header */}
        <div>
          <h3 className="text-2xl font-bold tracking-tight text-foreground">
            {item.grade}
          </h3>
          <Badge 
            variant="outline" 
            className={cn("mt-2 font-medium", sectionColors[item.section] ?? "bg-slate-100")}
          >
            {item.section}
          </Badge>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-2 gap-3 rounded-lg bg-muted/30 p-3">
          <div className="space-y-1">
            <span className="text-xs text-muted-foreground">Monthly Fee</span>
            <div className="flex items-center gap-1.5 font-semibold text-emerald-600">
              <Banknote className="h-3.5 w-3.5" />
              <span>{item.fee.toLocaleString()}</span>
            </div>
          </div>
          {/* Placeholder for student count if available in future */}
          <div className="space-y-1">
            <span className="text-xs text-muted-foreground">Students</span>
            <div className="flex items-center gap-1.5 font-medium text-foreground">
              <Users className="h-3.5 w-3.5 text-muted-foreground" />
              <span>--</span>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="mt-5 grid grid-cols-2 gap-2">
        <Button asChild size="sm" variant="outline" className="w-full text-xs">
          <Link href={`/admin/sessions/class/?classId=${item.classId}&sessionId=${sessionId}`}>
            <BookOpen className="mr-1.5 h-3.5 w-3.5" />
            View
          </Link>
        </Button>
        <Button asChild size="sm" variant="outline" className="w-full text-xs">
          <Link href={`/admin/sessions/timetable/?classId=${item.classId}`}>
            <Calendar className="mr-1.5 h-3.5 w-3.5" />
            Timetable
          </Link>
        </Button>
        <Button asChild size="sm" className="col-span-2 w-full text-xs bg-primary/90 hover:bg-primary">
          <Link href={`/admin/sessions/fee/?classId=${item.classId}&sessionId=${sessionId}`}>
            <Banknote className="mr-1.5 h-3.5 w-3.5" />
            Manage Fees
          </Link>
        </Button>
      </div>
    </motion.div>
  );
};

const ClassListSkeleton = () => (
  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
    {Array.from({ length: 8 }).map((_, i) => (
      <div key={i} className="flex h-[280px] flex-col justify-between rounded-xl border p-5">
        <div className="space-y-3">
          <div className="flex justify-between">
            <Skeleton className="h-8 w-24" />
            <Skeleton className="h-5 w-5 rounded" />
          </div>
          <Skeleton className="h-6 w-16 rounded-full" />
          <Skeleton className="h-16 w-full rounded-lg" />
        </div>
        <div className="grid gap-2">
          <div className="grid grid-cols-2 gap-2">
            <Skeleton className="h-9 w-full" />
            <Skeleton className="h-9 w-full" />
          </div>
          <Skeleton className="h-9 w-full" />
        </div>
      </div>
    ))}
  </div>
);
