// File: src/components/cards/ProfileCard.tsx
"use client";

import { Card, CardContent, CardHeader } from "~/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Badge } from "~/components/ui/badge";
import { CalendarDays, Mail, Shield, User } from "lucide-react";
import { api } from "~/trpc/react";
import { Skeleton } from "~/components/ui/skeleton";

export default function ProfileCard() {
  const { data: user, isLoading } = api.profile.getProfile.useQuery();

  if (isLoading) {
    return (
      <div className="flex flex-col items-center space-y-4 p-8">
        <Skeleton className="h-24 w-24 rounded-full bg-slate-200 dark:bg-white/10" />
        <Skeleton className="h-8 w-48 bg-slate-200 dark:bg-white/10" />
        <Skeleton className="h-6 w-32 bg-slate-200 dark:bg-white/10" />
        <div className="mt-8 w-full space-y-3">
          <Skeleton className="h-6 w-full bg-slate-200 dark:bg-white/10" />
          <Skeleton className="h-6 w-full bg-slate-200 dark:bg-white/10" />
          <Skeleton className="h-6 w-full bg-slate-200 dark:bg-white/10" />
        </div>
      </div>
    );
  }

  if (!user) return null;

  const getAccountTypeStyle = (type: string) => {
    switch (type.toLowerCase()) {
      case "admin":
        return "bg-red-100 text-red-700 border-red-200 dark:bg-red-500/10 dark:text-red-300 dark:border-red-500/30";
      case "principal":
        return "bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-500/10 dark:text-purple-300 dark:border-purple-500/30";
      case "teacher":
        return "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-300 dark:border-blue-500/30";
      case "student":
        return "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:border-emerald-500/30";
      default:
        return "bg-slate-100 text-slate-700 border-slate-200 dark:bg-white/10 dark:text-gray-300 dark:border-border";
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(date);
  };

  return (
    <Card className="w-full border-none bg-transparent shadow-none">
      <CardHeader className="pt-0 text-center">
        <div className="mb-4 flex justify-center">
          <div className="rounded-full bg-gradient-to-br from-emerald-400 to-cyan-400 p-1 shadow-lg shadow-emerald-500/20">
            <Avatar className="h-28 w-28 border-4 border-white dark:border-black/50">
              <AvatarImage
                src={`/placeholder-422db.png?height=112&width=112&query=profile picture for ${user.username}`}
                className="object-cover"
              />
              <AvatarFallback className="bg-slate-100 text-3xl font-bold text-slate-700 dark:bg-emerald-950 dark:text-emerald-400">
                {user.username.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </div>
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-foreground">
            {user.username}
          </h2>
          <Badge
            variant="outline"
            className={`border px-3 py-1 text-xs uppercase tracking-wider ${getAccountTypeStyle(user.accountType)}`}
          >
            <Shield className="mr-1.5 h-3 w-3" />
            {user.accountType}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="mt-2 space-y-3">
        {/* Email Row */}
        <div className="group flex items-center gap-3 rounded-xl border border-transparent p-3 text-sm transition-colors hover:border-slate-200 hover:bg-slate-100 dark:hover:border-border dark:hover:bg-white/5">
          <div className="rounded-lg bg-slate-100 p-2 text-emerald-600 transition-colors group-hover:text-emerald-700 dark:bg-white/5 dark:text-emerald-400 dark:group-hover:bg-emerald-500/20 dark:group-hover:text-emerald-300">
            <Mail className="h-4 w-4" />
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-medium text-muted-foreground dark:text-foreground/40">
              Email Address
            </span>
            <span className="font-medium text-slate-900 dark:text-emerald-50">
              {user.email}
            </span>
          </div>
        </div>

        {/* Account ID Row */}
        <div className="group flex items-center gap-3 rounded-xl border border-transparent p-3 text-sm transition-colors hover:border-slate-200 hover:bg-slate-100 dark:hover:border-border dark:hover:bg-white/5">
          <div className="rounded-lg bg-slate-100 p-2 text-cyan-600 transition-colors group-hover:text-cyan-700 dark:bg-white/5 dark:text-cyan-400 dark:group-hover:bg-cyan-500/20 dark:group-hover:text-cyan-300">
            <User className="h-4 w-4" />
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-medium text-muted-foreground dark:text-foreground/40">
              Account ID
            </span>
            <span className="font-medium text-slate-900 dark:text-cyan-50">
              {user.accountId}
            </span>
          </div>
        </div>

        {/* Member Since Row */}
        <div className="group flex items-center gap-3 rounded-xl border border-transparent p-3 text-sm transition-colors hover:border-slate-200 hover:bg-slate-100 dark:hover:border-border dark:hover:bg-white/5">
          <div className="rounded-lg bg-slate-100 p-2 text-purple-600 transition-colors group-hover:text-purple-700 dark:bg-white/5 dark:text-purple-400 dark:group-hover:bg-purple-500/20 dark:group-hover:text-purple-300">
            <CalendarDays className="h-4 w-4" />
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-medium text-muted-foreground dark:text-foreground/40">
              Member Since
            </span>
            <span className="font-medium text-slate-900 dark:text-purple-50">
              {formatDate(user.createdAt)}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
