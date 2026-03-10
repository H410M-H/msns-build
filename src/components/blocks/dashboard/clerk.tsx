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
import { ArrowRight } from "lucide-react";
import {
  Users,
  BookOpen,
  DollarSign,
  Calendar,
  ClipboardList,
  Building,
} from "lucide-react";

const MANAGEMENT_CARDS = [
  {
    title: "Session Management",
    description: "Manage academic sessions, terms, and school years.",
    icon: Calendar,
    href: "/clerk/sessions",
  },
  {
    title: "User Management",
    description: "Manage students, faculty, and other user accounts.",
    icon: Users,
    href: "/clerk/users",
  },
  {
    title: "Revenue Management",
    description: "Manage fees, salaries and other financial transactions.",
    icon: DollarSign,
    href: "/clerk/revenue",
  },
];

export function ClerkSection() {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
      {MANAGEMENT_CARDS.map((card, idx) => {
        const Icon = card.icon;
        return (
          <Card
            key={idx}
            className="group flex transform-gpu flex-col justify-between border-slate-200 bg-white/50 shadow-sm backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:shadow-lg dark:border-border dark:bg-card/50"
          >
            <CardHeader>
              <div className="mb-4 flex items-center justify-center">
                <div className="rounded-full bg-emerald-100/50 p-4 dark:bg-emerald-500/10">
                  <Icon className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
                </div>
              </div>
              <CardTitle className="text-center text-lg font-semibold text-slate-800 dark:text-foreground">
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
                  className="w-full gap-2 border-emerald-200 bg-transparent text-emerald-700 transition-colors group-hover:bg-emerald-50 dark:border-emerald-500/20 dark:text-emerald-300 dark:group-hover:bg-emerald-500/10"
                >
                  Go to {card.title}
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
