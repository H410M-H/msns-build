"use client";

import { useState } from "react";
import { Activity, UserPlus, CheckCircle2, BookOpen, Loader2, ChevronDown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { api } from "~/trpc/react";
import { formatDistanceToNow } from "date-fns";
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "~/components/ui/collapsible";
import { Button } from "~/components/ui/button";
import { cn } from "~/lib/utils";

const iconMap = {
  student: { icon: UserPlus, color: "bg-blue-500", textClass: "text-blue-500" },
  fee: { icon: CheckCircle2, color: "bg-emerald-500", textClass: "text-emerald-500" },
  diary: { icon: BookOpen, color: "bg-purple-500", textClass: "text-purple-500" },
};

export function ActivityFeed() {
  const [isOpen, setIsOpen] = useState(false);
  const { data: activities = [], isLoading } = api.event.getRecentActivity.useQuery({ limit: 6 });

  return (
    <Card className="card-enhanced">
      <Collapsible open={isOpen} onOpenChange={setIsOpen} className="w-full">
        <CardHeader className="pb-2 pt-3 px-4 flex flex-row justify-between items-center space-y-0">
          <div className="flex items-center gap-2">
            <div className="rounded-md bg-pink-500/10 p-1.5 text-pink-400">
              <Activity className="h-4 w-4" />
            </div>
            <CardTitle className="text-sm font-semibold">Recent Activity</CardTitle>
            <span className="ml-2 text-xs text-muted-foreground hidden sm:inline-block">Live updates</span>
          </div>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <ChevronDown className={cn("h-4 w-4 transition-all duration-200", isOpen ? "rotate-180" : "")} />
              <span className="sr-only">Toggle</span>
            </Button>
          </CollapsibleTrigger>
        </CardHeader>
        <CollapsibleContent>
          <CardContent className="px-4 pb-3">
            {isLoading ? (
              <div className="flex items-center justify-center py-6">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            ) : activities.length === 0 ? (
              <div className="py-6 text-center text-xs text-muted-foreground">No recent activity.</div>
            ) : (
              <div className="space-y-1">
                {activities.map((activity, index) => {
                  const meta = iconMap[activity.type];
                  const Icon = meta.icon;
                  return (
                    <div
                      key={index}
                      className="flex items-center gap-3 rounded-lg border border-transparent px-2 py-1.5 transition-colors hover:border-slate-100 hover:bg-slate-50 dark:hover:border-border dark:hover:bg-white/5"
                    >
                      <div
                        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${meta.color} text-white shadow-sm`}
                      >
                        <Icon className="h-3.5 w-3.5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xs text-slate-700 dark:text-slate-300">
                          {activity.text}
                        </p>
                        <p className={`text-[10px] font-medium ${meta.textClass}`}>
                          {activity.type === "student"
                            ? "Registration"
                            : activity.type === "fee"
                              ? "Fee Payment"
                              : "Class Diary"}
                        </p>
                      </div>
                      <time className="shrink-0 font-mono text-[10px] text-slate-400">
                        {formatDistanceToNow(new Date(activity.time), { addSuffix: true })}
                      </time>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}
