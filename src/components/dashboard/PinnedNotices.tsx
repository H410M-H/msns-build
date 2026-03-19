"use client";

import { motion } from "framer-motion";
import { Pin, AlertCircle, X, Calendar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { useState } from "react";

interface Notice {
  id: string;
  title: string;
  body: string;
  postedBy: string;
  date: Date;
  priority: "LOW" | "MEDIUM" | "HIGH";
  expiresAt?: Date;
  targetRole?: string;
}

// Static pinned notices (in a full implementation, these would come from a tRPC endpoint)
const SAMPLE_NOTICES: Notice[] = [
  {
    id: "1",
    title: "Annual Examination Schedule",
    body: "Annual exams begin from the 1st week of next month. All teachers must submit marks within 3 days of exam completion.",
    postedBy: "Admin",
    date: new Date(),
    priority: "HIGH",
  },
  {
    id: "2",
    title: "Fee Submission Deadline",
    body: "Last date for fee submission without late charges is the 10th of every month.",
    postedBy: "Clerk",
    date: new Date(),
    priority: "MEDIUM",
  },
];

const priorityStyles = {
  HIGH: "border-red-500/30 bg-red-500/5 text-red-400",
  MEDIUM: "border-amber-500/30 bg-amber-500/5 text-amber-400",
  LOW: "border-blue-500/30 bg-blue-500/5 text-blue-400",
};

export function PinnedNotices() {
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());

  const visible = SAMPLE_NOTICES.filter((n) => !dismissed.has(n.id));

  if (visible.length === 0) return null;

  return (
    <Card className="border-border bg-card">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base font-semibold text-foreground">
          <div className="rounded-lg bg-red-500/10 p-1.5">
            <Pin className="h-4 w-4 text-red-400" />
          </div>
          Pinned Notices
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {visible.map((notice, idx) => (
          <motion.div
            key={notice.id}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ delay: idx * 0.05 }}
            className={`relative rounded-lg border px-4 py-3 ${priorityStyles[notice.priority]}`}
          >
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 top-2 h-5 w-5 text-muted-foreground hover:text-foreground"
              onClick={() =>
                setDismissed((prev) => new Set([...prev, notice.id]))
              }
            >
              <X className="h-3 w-3" />
            </Button>
            <div className="flex items-start gap-2 pr-6">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <div className="space-y-1">
                <p className="text-sm font-semibold text-foreground">
                  {notice.title}
                </p>
                <p className="text-xs leading-relaxed text-muted-foreground">
                  {notice.body}
                </p>
                <div className="flex items-center gap-2 pt-1">
                  <Badge
                    variant="outline"
                    className={`text-[10px] ${priorityStyles[notice.priority]}`}
                  >
                    {notice.priority}
                  </Badge>
                  <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    Posted by {notice.postedBy}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </CardContent>
    </Card>
  );
}
