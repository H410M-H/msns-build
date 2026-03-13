"use client";
import Link from "next/link";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { ArrowRight, TrendingUp, Users, Receipt } from "lucide-react";
import {
  Users as UsersIcon,
  BookOpen,
  DollarSign,
  Calendar,
  ClipboardList,
  Building,
  BarChart3,
  FileText,
} from "lucide-react";
import { Badge } from "~/components/ui/badge";

const MANAGEMENT_CARDS = [
  {
    title: "Fee Collection",
    description: "Track and manage fee payments from students.",
    icon: DollarSign,
    href: "/clerk/revenue/fee",
    color: "emerald",
  },
  {
    title: "Expense Tracking",
    description: "Record and monitor institutional expenses.",
    icon: Receipt,
    href: "/clerk/revenue/expense",
    color: "blue",
  },
  {
    title: "Salary Management",
    description: "Manage employee salaries and disbursements.",
    icon: BarChart3,
    href: "/clerk/revenue/salary",
    color: "purple",
  },
  {
    title: "User Management",
    description: "Manage students, faculty, and accounts.",
    icon: UsersIcon,
    href: "/clerk/users",
    color: "cyan",
  },
  {
    title: "Session Management",
    description: "Manage academic sessions and terms.",
    icon: Calendar,
    href: "/clerk/sessions",
    color: "orange",
  },
  {
    title: "Reports & Analytics",
    description: "View financial reports and statistics.",
    icon: FileText,
    href: "/clerk/reports",
    color: "pink",
  },
];

// Recent transactions mock data
const RECENT_TRANSACTIONS = [
  {
    id: 1,
    student: "Ahmed Hassan",
    amount: "Rs. 5,000",
    type: "fee",
    date: "Today",
    status: "completed",
  },
  {
    id: 2,
    student: "Fatima Khan",
    amount: "Rs. 3,500",
    type: "fee",
    date: "Yesterday",
    status: "completed",
  },
  {
    id: 3,
    student: "Ali Ahmed",
    amount: "Rs. 7,500",
    type: "fee",
    date: "2 days ago",
    status: "pending",
  },
];

const getColorClasses = (color: string) => {
  const colors: Record<string, string> = {
    emerald: "bg-emerald-100/50 dark:bg-emerald-500/10",
    blue: "bg-blue-100/50 dark:bg-blue-500/10",
    purple: "bg-purple-100/50 dark:bg-purple-500/10",
    cyan: "bg-cyan-100/50 dark:bg-cyan-500/10",
    orange: "bg-orange-100/50 dark:bg-orange-500/10",
    pink: "bg-pink-100/50 dark:bg-pink-500/10",
  };
  const iconColors: Record<string, string> = {
    emerald: "text-emerald-600 dark:text-emerald-400",
    blue: "text-blue-600 dark:text-blue-400",
    purple: "text-purple-600 dark:text-purple-400",
    cyan: "text-cyan-600 dark:text-cyan-400",
    orange: "text-orange-600 dark:text-orange-400",
    pink: "text-pink-600 dark:text-pink-400",
  };
  return { bg: colors[color], icon: iconColors[color] };
};

export function ClerkSection() {
  return (
    <div className="space-y-8">
      {/* Management Cards Grid */}
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-4">
          Financial Management Tools
        </h3>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {MANAGEMENT_CARDS.map((card, idx) => {
            const Icon = card.icon;
            const { bg, icon } = getColorClasses(card.color);
            return (
              <Card
                key={idx}
                className="group flex transform-gpu flex-col justify-between border-border bg-card/50 shadow-sm backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
              >
                <CardHeader>
                  <div className="mb-4 flex items-center justify-center">
                    <div className={`rounded-full p-4 ${bg}`}>
                      <Icon className={`h-8 w-8 ${icon}`} />
                    </div>
                  </div>
                  <CardTitle className="text-center text-lg font-semibold text-foreground">
                    {card.title}
                  </CardTitle>
                  <CardDescription className="text-center text-sm text-muted-foreground">
                    {card.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Link href={card.href} passHref>
                    <Button
                      variant="outline"
                      className="w-full gap-2 border-border text-foreground transition-colors hover:bg-white/5"
                    >
                      Access
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-foreground">
              Recent Transactions
            </h3>
            <p className="text-sm text-muted-foreground">
              Latest fee payments and records
            </p>
          </div>
          <Link href="/clerk/revenue/fee">
            <Button variant="outline" size="sm" className="gap-2">
              View All
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>

        <div className="space-y-3">
          {RECENT_TRANSACTIONS.map((transaction) => (
            <Card
              key={transaction.id}
              className="border-border bg-card/50 hover:shadow-md transition-all"
            >
              <CardContent className="p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-start gap-3">
                    <div className="mt-1 rounded-full bg-emerald-500/10 p-2">
                      <Receipt className="h-4 w-4 text-emerald-500" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground">
                        {transaction.student}
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        {transaction.date} • Fee Payment
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="font-semibold text-foreground">
                        {transaction.amount}
                      </p>
                      <Badge
                        variant={
                          transaction.status === "completed"
                            ? "default"
                            : "secondary"
                        }
                        className="mt-1 text-xs"
                      >
                        {transaction.status === "completed"
                          ? "Completed"
                          : "Pending"}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
