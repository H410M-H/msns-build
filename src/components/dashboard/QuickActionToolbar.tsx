"use client";

import { useState } from "react";
import {
  UserPlus,
  DollarSign,
  Receipt,
  CheckSquare,
  Calendar,
  X,
  Loader2,
  Zap,
} from "lucide-react";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import Link from "next/link";

interface QuickAction {
  id: string;
  label: string;
  icon: React.ElementType;
  color: string;
  href?: string;
}

interface QuickActionToolbarProps {
  basePrefix?: string;
  role?: "ADMIN" | "CLERK" | "PRINCIPAL" | "HEAD";
}

export function QuickActionToolbar({
  basePrefix = "/admin",
  role = "ADMIN",
}: QuickActionToolbarProps) {
  const actions: QuickAction[] = [
    {
      id: "add-student",
      label: "Add Student",
      icon: UserPlus,
      color:
        "bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border-emerald-500/30",
      href: `${basePrefix}/users/student`,
    },
    {
      id: "record-fee",
      label: "Record Fee",
      icon: DollarSign,
      color:
        "bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 border-blue-500/30",
      href: `${basePrefix}/revenue/fee`,
    },
    {
      id: "record-expense",
      label: "Add Expense",
      icon: Receipt,
      color:
        "bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 border-amber-500/30",
      href: `${basePrefix}/revenue/expense`,
    },
    {
      id: "attendance",
      label: "Attendance",
      icon: CheckSquare,
      color:
        "bg-purple-500/10 text-purple-400 hover:bg-purple-500/20 border-purple-500/30",
      href: `${basePrefix}/sessions`,
    },
    {
      id: "create-event",
      label: "Create Event",
      icon: Calendar,
      color:
        "bg-pink-500/10 text-pink-400 hover:bg-pink-500/20 border-pink-500/30",
      href: `${basePrefix}/sessions`,
    },
  ];

  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        <Zap className="h-3 w-3 text-emerald-400" />
        Quick Actions
      </div>
      {actions.map((action) => {
        const Icon = action.icon;
        return (
          <Link key={action.id} href={action.href ?? "#"}>
            <Button
              variant="outline"
              size="sm"
              className={`h-8 gap-1.5 border text-xs font-medium transition-all ${action.color}`}
            >
              <Icon className="h-3.5 w-3.5" />
              {action.label}
            </Button>
          </Link>
        );
      })}
    </div>
  );
}
