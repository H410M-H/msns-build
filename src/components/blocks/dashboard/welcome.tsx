// File: src/components/blocks/dashboard/welcome.tsx
"use client"

import { Sparkles, Mail, User, CalendarDays, Shield } from "lucide-react"
import { CalendarDialog } from "~/components/blocks/dashboard/calendar-dialog"
import { getRoleTheme } from "~/lib/utils"
import { useSession } from "next-auth/react"
import { api } from "~/trpc/react"
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar"
import { Badge } from "~/components/ui/badge"
import { Skeleton } from "~/components/ui/skeleton"

export const WelcomeSection = () => {
  const { data: session } = useSession()
  const { data: userProfile, isLoading } = api.profile.getProfile.useQuery()

  const roleTheme = getRoleTheme(session?.user.accountType ?? "")
  
  const today = new Date()
  const dateOptions: Intl.DateTimeFormatOptions = { weekday: "long", month: "long", day: "numeric" }
  const formattedDate = today.toLocaleDateString("en-US", dateOptions)

  if (isLoading) {
    return (
      <div className="mb-6 lg:mb-8 w-full rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 p-6 sm:p-10 shadow-sm dark:shadow-2xl">
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <Skeleton className="h-24 w-24 rounded-full bg-slate-100 dark:bg-white/10" />
          <div className="space-y-2 flex-1 w-full">
            <Skeleton className="h-8 w-3/4 bg-slate-100 dark:bg-white/10" />
            <Skeleton className="h-4 w-1/2 bg-slate-100 dark:bg-white/10" />
            <div className="flex gap-2 mt-4">
              <Skeleton className="h-8 w-24 bg-slate-100 dark:bg-white/10" />
              <Skeleton className="h-8 w-32 bg-slate-100 dark:bg-white/10" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Fallback to session data if profile fetch fails or is empty
  const user = userProfile ?? {
    username: session?.user.username ?? "User",
    email: session?.user.email ?? "",
    accountId: session?.user.accountId ?? "",
    accountType: session?.user.accountType ?? "NONE",
    createdAt: new Date(),
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(new Date(date))
  }

  return (
    <div className="mb-6 lg:mb-8 w-full max-w-full">
      <div className="relative overflow-hidden rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900/60 p-6 sm:p-8 lg:p-10 shadow-xl shadow-slate-200/60 dark:shadow-none backdrop-blur-xl transition-all duration-300">
        
        {/* Background decorative elements */}
        {/* Light Mode: Very subtle pastel blobs */}
        <div className="absolute right-0 top-0 h-64 w-64 rounded-full bg-emerald-50/80 dark:bg-emerald-500/10 blur-3xl pointer-events-none -translate-y-1/2 translate-x-1/4"></div>
        <div className="absolute left-0 bottom-0 h-48 w-48 rounded-full bg-cyan-50/80 dark:bg-purple-500/5 blur-3xl pointer-events-none translate-y-1/4 -translate-x-1/4"></div>

        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8 relative z-10">
          
          {/* Identity Block */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 w-full lg:w-auto">
            
            {/* Avatar with Role Glow */}
            <div className="relative shrink-0 group">
               <div className={`absolute inset-0 rounded-full bg-gradient-to-br ${roleTheme.gradient} blur-xl opacity-0 dark:opacity-30 group-hover:opacity-20 dark:group-hover:opacity-50 transition-opacity duration-500`}></div>
               <div className={`relative p-1 rounded-full bg-white dark:bg-black/40 border border-slate-100 dark:border-white/10 shadow-lg`}>
                <Avatar className="w-24 h-24 sm:w-28 sm:h-28">
                  <AvatarImage
                    src={`/placeholder-422db.png?height=112&width=112&query=profile picture for ${user.username}`}
                    className="object-cover"
                  />
                  <AvatarFallback className="text-3xl font-bold bg-slate-50 dark:bg-black text-slate-700 dark:text-emerald-400">
                    {user.username?.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </div>
               <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 z-20">
                 <Badge className={`bg-white dark:bg-black/80 backdrop-blur-md border border-slate-200 dark:border-white/10 text-slate-700 dark:text-white text-[10px] sm:text-xs px-3 py-0.5 uppercase tracking-wider shadow-sm hover:bg-slate-50 dark:hover:bg-black/90`}>
                    <Shield className="w-3 h-3 mr-1 text-emerald-600 dark:text-emerald-400 inline-block" />
                    {user.accountType}
                 </Badge>
               </div>
            </div>

            {/* Text Info & Stats */}
            <div className="flex-1 text-center sm:text-left space-y-3 pt-2">
              <div>
                  <div className="flex flex-col sm:flex-row items-center sm:items-end gap-2 sm:gap-3 mb-1">
                    <h1 className="text-3xl sm:text-4xl font-black text-slate-800 dark:text-white leading-tight tracking-tight drop-shadow-sm">
                      Welcome back,
                    </h1>
                    <div className="flex items-center gap-1 mb-2">
                      <Sparkles className="h-5 w-5 animate-pulse text-emerald-500 dark:text-emerald-400" />
                    </div>
                  </div>
                  
                  <h2 className={`text-2xl sm:text-3xl font-bold bg-gradient-to-r ${roleTheme.gradient} bg-clip-text text-transparent truncate max-w-[300px] sm:max-w-md mx-auto sm:mx-0`}>
                    {user.username}!
                  </h2>
                  
                  <div className="flex items-center justify-center sm:justify-start gap-2 text-xs sm:text-sm text-slate-500 dark:text-emerald-100/60 font-medium mt-2">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                    <span>Active Session • {formattedDate}</span>
                  </div>
              </div>

              {/* Merged Profile Details Grid */}
              <div className="flex flex-wrap justify-center sm:justify-start gap-3 mt-4">
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-xs font-medium text-slate-600 dark:text-emerald-100/80 hover:bg-slate-50 dark:hover:bg-white/10 transition-all group cursor-default shadow-sm dark:shadow-none">
                      <Mail className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                      {user.email}
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-xs font-medium text-slate-600 dark:text-emerald-100/80 hover:bg-slate-50 dark:hover:bg-white/10 transition-all group cursor-default shadow-sm dark:shadow-none">
                      <User className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
                      ID: {user.accountId}
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-xs font-medium text-slate-600 dark:text-emerald-100/80 hover:bg-slate-50 dark:hover:bg-white/10 transition-all group cursor-default shadow-sm dark:shadow-none">
                      <CalendarDays className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                      Since {formatDate(new Date(user.createdAt))}
                  </div>
              </div>
            </div>
          </div>

          {/* Action Button */}
          <div className="w-full lg:w-auto flex justify-center lg:justify-end mt-4 lg:mt-0">
             <div className="w-full sm:w-auto shadow-xl shadow-slate-200/50 dark:shadow-emerald-900/20 rounded-lg">
                <CalendarDialog />
             </div>
          </div>
        </div>
      </div>
    </div>
  )
}