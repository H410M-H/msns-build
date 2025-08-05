"use client";

import { useMemo, useState } from "react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "~/components/ui/tabs";
import { api } from "~/trpc/react";
import Link from "next/link";
import { ClassCreationDialog } from "../forms/class/ClassCreation";
import { Search, RefreshCw } from 'lucide-react';
import { Checkbox } from "~/components/ui/checkbox";
import { Skeleton } from "~/components/ui/skeleton";
import { cn } from "~/lib/utils";
import { motion } from "framer-motion";
import { ClassDeletionDialog } from "../forms/class/ClassDeletion";

const categoryOrder = ["Montessori", "Primary", "Middle", "SSC_I", "SSC_II"];
const categoryColors: Record<string, string> = {
  Montessori: "bg-gradient-to-r from-rose-100 to-rose-50 border-rose-200",
  Primary: "bg-gradient-to-r from-indigo-100 to-indigo-50 border-indigo-200",
  Middle: "bg-gradient-to-r from-emerald-100 to-emerald-50 border-emerald-200",
  SSC_I: "bg-gradient-to-r from-amber-100 to-amber-50 border-amber-200",
  SSC_II: "bg-gradient-to-r from-violet-100 to-violet-50 border-violet-200",
};
const sectionColors: Record<string, string> = {
  ROSE: "bg-gradient-to-br from-rose-100 to-rose-200 text-rose-900",
  TULIP: "bg-gradient-to-br from-amber-100 to-amber-200 text-amber-900",
};

export const ClassList = ({ sessionId }: { sessionId: string }) => {
  const [selectedClasses, setSelectedClasses] = useState<Set<string>>(new Set());
  const { data: classesData, isLoading, refetch } = api.class.getClasses.useQuery();

  const handleRefresh = async () => {
    await refetch();
  };

  const groupedData = useMemo(() => {
    const grouped: Record<string, typeof classesData> = {};
    classesData?.forEach((item) => {
      if (!grouped[item.category]) {
        grouped[item.category] = [];
      }
      grouped[item.category]?.push(item);
    });
    return grouped;
  }, [classesData]);

  const handleClassSelect = (classId: string) => {
    setSelectedClasses(prev => new Set(prev.has(classId) 
      ? [...prev].filter(id => id !== classId) 
      : [...prev, classId]));
  };

  return (
    <div className="w-full">
      {/* Header Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 rounded-2xl bg-white/80 backdrop-blur-lg p-6 shadow-lg border border-slate-100/80"
      >
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="relative flex-grow w-full">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
            <Input 
              placeholder="Search classes..." 
              className="pl-11 h-12 text-base border-2 border-slate-200/50 focus:border-blue-300 focus:ring-2 focus:ring-blue-100/50 rounded-xl bg-white/50 backdrop-blur-sm" 
            />
          </div>
          <div className="flex items-center gap-3">
            <Button 
              onClick={handleRefresh} 
              className="gap-2 h-11 px-4 rounded-xl border bg-white/90 hover:bg-white shadow-sm border-slate-200/60 hover:border-slate-300/50 backdrop-blur-sm transition-all"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : 'animate-pulse'}`} /> 
              Refresh
            </Button>
            <ClassDeletionDialog classIds={Array.from(selectedClasses)} />
            <ClassCreationDialog />
          </div>
        </div>
      </motion.div>

      {/* Tabs Section */}
      <Tabs defaultValue={categoryOrder[0]}>
        <TabsList className="mb-6 flex w-full pb-2 gap-1.5 bg-transparent">
          {categoryOrder.map(category => (
            <TabsTrigger 
              key={category} 
              value={category} 
              className={cn(
                "px-4 py-2.5 text-sm font-semibold rounded-xl",
                "border border-slate-200/60 backdrop-blur-sm",
                "transition-all hover:scale-[1.02] hover:shadow-sm",
                "data-[state=active]:border-blue-300 data-[state=active]:bg-blue-50/50",
                categoryColors[category]
              )}
            >
              {category}
            </TabsTrigger>
          ))}
        </TabsList>

        {categoryOrder.map(category => (
          <TabsContent key={category} value={category} className="mt-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {isLoading ? (
                Array(6).fill(0).map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.1 }}
                  >
                    <Skeleton className="h-44 rounded-xl bg-slate-100/50 animate-pulse" />
                  </motion.div>
                ))
              ) : (
                groupedData?.[category]?.map((classItem, index) => (
                  <motion.div
                    key={classItem.classId}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <div className="group relative rounded-xl bg-white/90 backdrop-blur-sm shadow-sm hover:shadow-md border border-slate-100/80 hover:border-blue-100/50 p-5 transition-all duration-300">
                      <div className="flex items-start justify-between mb-4">
                        <Checkbox 
                          checked={selectedClasses.has(classItem.classId)} 
                          onCheckedChange={() => handleClassSelect(classItem.classId)} 
                          className="h-5 w-5 border-2 border-slate-300/80 data-[state=checked]:border-blue-500 mt-1.5 ring-offset-white/50"
                        />
                        <div>
                          <h3 className="text-2xl font-bold text-slate-800">{classItem.grade}</h3>
                          <span className={cn(
                            "inline-block px-3 py-1 rounded-full text-xs font-medium",
                            "backdrop-blur-sm border border-white/20",
                            sectionColors[classItem.section]
                          )}>
                            {classItem.section}
                          </span>
                        </div>
                      </div>
                      <div className="text-sm flex justify-between mb-4">
                        <span className="text-slate-500">Monthly Fee:</span>
                        <span className="font-medium text-emerald-700">
                          {classItem.fee.toFixed(2)} PKR
                        </span>
                      </div>
                      <div className="mt-6 grid gap-2">
                        <Button 
                          asChild 
                          size="sm" 
                          className="w-full rounded-lg bg-gradient-to-r from-blue-100 to-blue-50 text-blue-700 hover:from-blue-200 hover:to-blue-100 border border-blue-200/50 shadow-sm transition-all"
                        >
                          <Link href={`/admin/sessions/class/?classId=${classItem.classId}&sessionId=${sessionId}`}>
                            View Class
                          </Link>
                        </Button>
                        <Button 
                          asChild 
                          size="sm" 
                          className="w-full rounded-lg bg-gradient-to-r from-emerald-100 to-emerald-50 text-emerald-700 hover:from-emerald-200 hover:to-emerald-100 border border-emerald-200/50 shadow-sm transition-all"
                        >
                          <Link href={`/admin/sessions/fee/?classId=${classItem.classId}&sessionId=${sessionId}`}>
                            Fee Details
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};