"use client";

import { motion } from "framer-motion";
import {
  AlertTriangle,
  ClipboardCheck,
  DollarSign,
  UserPlus,
  BookOpenCheck,
  ArrowRight,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import Link from "next/link";
import { api } from "~/trpc/react";
import { Skeleton } from "~/components/ui/skeleton";

interface ActionItem {
  id: string;
  label: string;
  description: string;
  href: string;
  count?: number;
  color: string;
  icon: React.ElementType;
}

interface ActionRequiredProps {
  role: "ADMIN" | "CLERK" | "PRINCIPAL" | "HEAD" | "TEACHER" | "STUDENT";
  basePrefix?: string;
}

export function ActionRequired({
  role,
  basePrefix = "/admin",
}: ActionRequiredProps) {
  const { data: students, isLoading: stLoading } =
    api.student.getStudents.useQuery();
  const { data: exams, isLoading: exLoading } =
    api.exam.getAllExams.useQuery();

  const isLoading = stLoading || exLoading;

  const unassignedStudents =
    students?.filter((s) => !s.isAssign).length ?? 0;
  const scheduledExams =
    exams?.filter((e) => e.status === "SCHEDULED").length ?? 0;
  const ongoingExams =
    exams?.filter((e) => e.status === "ONGOING").length ?? 0;

  const adminActions: ActionItem[] = [
    {
      id: "unassigned",
      label: "Unassigned Students",
      description: "Students w/o class enrollment",
      href: `${basePrefix}/users`,
      count: unassignedStudents,
      color: "text-amber-400 border-amber-500/30 bg-amber-500/5",
      icon: UserPlus,
    },
    {
      id: "exams-scheduled",
      label: "Exams Scheduled",
      description: "Awaiting datesheet creation",
      href: `${basePrefix}/exams`,
      count: scheduledExams,
      color: "text-blue-400 border-blue-500/30 bg-blue-500/5",
      icon: ClipboardCheck,
    },
    {
      id: "exams-ongoing",
      label: "Ongoing Exams",
      description: "Marks entry required",
      href: `${basePrefix}/exams`,
      count: ongoingExams,
      color: "text-purple-400 border-purple-500/30 bg-purple-500/5",
      icon: BookOpenCheck,
    },
    {
      id: "fees",
      label: "Fee Management",
      description: "Review outstanding balances",
      href: `${basePrefix}/revenue/fee`,
      color: "text-emerald-400 border-emerald-500/30 bg-emerald-500/5",
      icon: DollarSign,
    },
  ];

  const teacherActions: ActionItem[] = [
    {
      id: "marks",
      label: "Marks Entry Pending",
      description: "Enter marks for ongoing exams",
      href: "/teacher/exams/marks",
      count: ongoingExams,
      color: "text-amber-400 border-amber-500/30 bg-amber-500/5",
      icon: ClipboardCheck,
    },
    {
      id: "attendance",
      label: "Mark Attendance",
      description: "Record today's class attendance",
      href: "/teacher",
      color: "text-blue-400 border-blue-500/30 bg-blue-500/5",
      icon: UserPlus,
    },
  ];

  const studentActions: ActionItem[] = [
    {
      id: "fees",
      label: "Outstanding Fees",
      description: "Check your fee balance",
      href: "/student/grades",
      color: "text-amber-400 border-amber-500/30 bg-amber-500/5",
      icon: DollarSign,
    },
  ];

  const actions =
    role === "TEACHER"
      ? teacherActions
      : role === "STUDENT"
        ? studentActions
        : adminActions;

  const relevant = actions.filter(
    (a) => !a.count === false || a.count === undefined || a.count > 0,
  );

  if (!isLoading && relevant.length === 0) return null;

  return (
    <Card className="border-border bg-card">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base font-semibold text-foreground">
          <div className="rounded-lg bg-amber-500/10 p-1.5">
            <AlertTriangle className="h-4 w-4 text-amber-400" />
          </div>
          Action Required
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {isLoading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-12 w-full bg-muted" />
            ))}
          </div>
        ) : (
          actions.map((action, idx) => {
            if (action.count !== undefined && action.count === 0) return null;
            const Icon = action.icon;
            return (
              <motion.div
                key={action.id}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
              >
                <Link href={action.href}>
                  <div
                    className={`flex items-center justify-between rounded-lg border px-3 py-2.5 transition-all hover:opacity-80 ${action.color}`}
                  >
                    <div className="flex items-center gap-2">
                      <Icon className="h-4 w-4 shrink-0" />
                      <div>
                        <p className="text-xs font-semibold text-foreground">
                          {action.label}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {action.description}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {action.count !== undefined && (
                        <Badge
                          variant="outline"
                          className={`text-xs ${action.color}`}
                        >
                          {action.count}
                        </Badge>
                      )}
                      <ArrowRight className="h-3 w-3 text-muted-foreground" />
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}
