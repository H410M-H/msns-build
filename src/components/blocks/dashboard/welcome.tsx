// File: src/components/blocks/dashboard/welcome.tsx
"use client";

import { Sparkles, Mail, User, CalendarDays, Shield } from "lucide-react";
import { CalendarDialog } from "~/components/blocks/dashboard/calendar-dialog";
import { getRoleTheme } from "~/lib/utils";
import { useSession } from "next-auth/react";
import { api } from "~/trpc/react";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Badge } from "~/components/ui/badge";
import { Skeleton } from "~/components/ui/skeleton";

export const WelcomeSection = () => {
  const { data: session } = useSession();
  const { data: userProfile, isLoading } = api.profile.getProfile.useQuery();

  const roleTheme = getRoleTheme(session?.user.accountType ?? "");

  const today = new Date();
  const dateOptions: Intl.DateTimeFormatOptions = {
    weekday: "long",
    month: "long",
    day: "numeric",
  };
  const formattedDate = today.toLocaleDateString("en-US", dateOptions);

  if (isLoading) {
    return (
      <div className="mb-6 w-full rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-border dark:bg-white/5 dark:shadow-2xl sm:p-10 lg:mb-8">
        <div className="flex flex-col items-center gap-6 sm:flex-row">
          <Skeleton className="h-24 w-24 rounded-full bg-slate-100 dark:bg-white/10" />
          <div className="w-full flex-1 space-y-2">
            <Skeleton className="h-8 w-3/4 bg-slate-100 dark:bg-white/10" />
            <Skeleton className="h-4 w-1/2 bg-slate-100 dark:bg-white/10" />
            <div className="mt-4 flex gap-2">
              <Skeleton className="h-8 w-24 bg-slate-100 dark:bg-white/10" />
              <Skeleton className="h-8 w-32 bg-slate-100 dark:bg-white/10" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Fallback to session data if profile fetch fails or is empty
  const user = userProfile ?? {
    username: session?.user.username ?? "User",
    email: session?.user.email ?? "",
    accountId: session?.user.accountId ?? "",
    accountType: session?.user.accountType ?? "NONE",
    createdAt: new Date(),
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(new Date(date));
  };

  return (
    <div className="mb-6 w-full max-w-full lg:mb-8">
      <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/60 backdrop-blur-xl transition-all duration-300 dark:border-border dark:bg-card dark:shadow-none sm:p-8 lg:p-10">
        {/* Background decorative elements */}
        {/* Light Mode: Very subtle pastel blobs */}
        <div className="pointer-events-none absolute right-0 top-0 h-64 w-64 -translate-y-1/2 translate-x-1/4 rounded-full bg-emerald-50/80 blur-3xl dark:bg-emerald-500/10"></div>
        <div className="pointer-events-none absolute bottom-0 left-0 h-48 w-48 -translate-x-1/4 translate-y-1/4 rounded-full bg-cyan-50/80 blur-3xl dark:bg-purple-500/5"></div>

        <div className="relative z-10 flex flex-col items-start justify-between gap-8 lg:flex-row lg:items-center">
          {/* Identity Block */}
          <div className="flex w-full flex-col items-center gap-6 sm:flex-row sm:items-start lg:w-auto">
            {/* Avatar with Role Glow */}
            <div className="group relative shrink-0">
              <div
                className={`absolute inset-0 rounded-full bg-gradient-to-br ${roleTheme.gradient} opacity-0 blur-xl transition-opacity duration-500 group-hover:opacity-20 dark:opacity-30 dark:group-hover:opacity-50`}
              ></div>
              <div
                className={`relative rounded-full border border-slate-100 bg-white p-1 shadow-lg dark:border-border dark:bg-black/40`}
              >
                <Avatar className="h-24 w-24 sm:h-28 sm:w-28">
                  <AvatarImage
                    src={`/placeholder-422db.png?height=112&width=112&query=profile picture for ${user.username}`}
                    className="object-cover"
                  />
                  <AvatarFallback className="bg-slate-50 text-3xl font-bold text-slate-700 dark:bg-black dark:text-emerald-400">
                    {user.username?.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </div>
              <div className="absolute -bottom-3 left-1/2 z-20 -translate-x-1/2">
                <Badge
                  className={`border border-slate-200 bg-white px-3 py-0.5 text-[10px] uppercase tracking-wider text-slate-700 shadow-sm backdrop-blur-md hover:bg-slate-50 dark:border-border dark:bg-black/80 dark:text-foreground dark:hover:bg-black/90 sm:text-xs`}
                >
                  <Shield className="mr-1 inline-block h-3 w-3 text-emerald-600 dark:text-emerald-400" />
                  {user.accountType}
                </Badge>
              </div>
            </div>

            {/* Text Info & Stats */}
            <div className="flex-1 space-y-3 pt-2 text-center sm:text-left">
              <div>
                <div className="mb-1 flex flex-col items-center gap-2 sm:flex-row sm:items-end sm:gap-3">
                  <h1 className="text-3xl font-black leading-tight tracking-tight text-slate-800 drop-shadow-sm dark:text-foreground sm:text-4xl">
                    Welcome back,
                  </h1>
                  <div className="mb-2 flex items-center gap-1">
                    <Sparkles className="h-5 w-5 animate-pulse text-emerald-500 dark:text-emerald-400" />
                  </div>
                </div>

                <h2
                  className={`bg-gradient-to-r text-2xl font-bold sm:text-3xl ${roleTheme.gradient} mx-auto max-w-[300px] truncate bg-clip-text text-transparent sm:mx-0 sm:max-w-md`}
                >
                  {user.username}!
                </h2>

                <div className="mt-2 flex items-center justify-center gap-2 text-xs font-medium text-muted-foreground dark:text-emerald-100/60 sm:justify-start sm:text-sm">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-75"></span>
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
                  </span>
                  <span>Active Session • {formattedDate}</span>
                </div>
              </div>

              {/* Merged Profile Details Grid */}
              <div className="mt-4 flex flex-wrap justify-center gap-3 sm:justify-start">
                <div className="group flex cursor-default items-center gap-2 rounded-lg border border-slate-200 bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-600 shadow-sm transition-all hover:bg-slate-50 dark:border-border dark:bg-white/5 dark:text-emerald-100/80 dark:shadow-none dark:hover:bg-white/10">
                  <Mail className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                  {user.email}
                </div>
                <div className="group flex cursor-default items-center gap-2 rounded-lg border border-slate-200 bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-600 shadow-sm transition-all hover:bg-slate-50 dark:border-border dark:bg-white/5 dark:text-emerald-100/80 dark:shadow-none dark:hover:bg-white/10">
                  <User className="h-3.5 w-3.5 text-cyan-600 dark:text-cyan-400" />
                  ID: {user.accountId}
                </div>
                <div className="group flex cursor-default items-center gap-2 rounded-lg border border-slate-200 bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-600 shadow-sm transition-all hover:bg-slate-50 dark:border-border dark:bg-white/5 dark:text-emerald-100/80 dark:shadow-none dark:hover:bg-white/10">
                  <CalendarDays className="h-3.5 w-3.5 text-purple-600 dark:text-purple-400" />
                  Since {formatDate(new Date(user.createdAt))}
                </div>
              </div>
            </div>
          </div>

          {/* Action Button */}
          <div className="mt-4 flex w-full justify-center lg:mt-0 lg:w-auto lg:justify-end">
            <div className="w-full rounded-lg shadow-xl shadow-slate-200/50 dark:shadow-emerald-900/20 sm:w-auto">
              <CalendarDialog />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
