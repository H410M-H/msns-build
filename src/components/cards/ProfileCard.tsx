// File: src/components/cards/ProfileCard.tsx
"use client"

import { Card, CardContent, CardHeader } from "~/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar"
import { Badge } from "~/components/ui/badge"
import { CalendarDays, Mail, Shield, User } from "lucide-react"
import { api } from "~/trpc/react"
import { Skeleton } from "~/components/ui/skeleton"

export default function ProfileCard() {
  const { data: user, isLoading } = api.profile.getProfile.useQuery()

  if (isLoading) {
    return (
        <div className="flex flex-col items-center space-y-4 p-8">
            <Skeleton className="h-24 w-24 rounded-full bg-slate-200 dark:bg-white/10" />
            <Skeleton className="h-8 w-48 bg-slate-200 dark:bg-white/10" />
            <Skeleton className="h-6 w-32 bg-slate-200 dark:bg-white/10" />
            <div className="w-full space-y-3 mt-8">
                <Skeleton className="h-6 w-full bg-slate-200 dark:bg-white/10" />
                <Skeleton className="h-6 w-full bg-slate-200 dark:bg-white/10" />
                <Skeleton className="h-6 w-full bg-slate-200 dark:bg-white/10" />
            </div>
        </div>
    )
  }

  if (!user) return null

  const getAccountTypeStyle = (type: string) => {
    switch (type.toLowerCase()) {
      case "admin":
        return "bg-red-100 text-red-700 border-red-200 dark:bg-red-500/10 dark:text-red-300 dark:border-red-500/30"
      case "principal":
        return "bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-500/10 dark:text-purple-300 dark:border-purple-500/30"
      case "teacher":
        return "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-300 dark:border-blue-500/30"
      case "student":
        return "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:border-emerald-500/30"
      default:
        return "bg-slate-100 text-slate-700 border-slate-200 dark:bg-white/10 dark:text-gray-300 dark:border-white/20"
    }
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(date)
  }

  return (
    <Card className="w-full bg-transparent border-none shadow-none">
      <CardHeader className="text-center pt-0">
        <div className="flex justify-center mb-4">
          <div className="p-1 rounded-full bg-linear-to-br from-emerald-400 to-cyan-400 shadow-lg shadow-emerald-500/20">
            <Avatar className="w-28 h-28 border-4 border-white dark:border-black/50">
              <AvatarImage
                src={`/placeholder-422db.png?height=112&width=112&query=profile picture for ${user.username}`}
                className="object-cover"
              />
              <AvatarFallback className="text-3xl font-bold bg-slate-100 text-slate-700 dark:bg-emerald-950 dark:text-emerald-400">
                {user.username.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </div>
        </div>
        
        <div className="space-y-2">
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            {user.username}
            </h2>
            <Badge variant="outline" className={`px-3 py-1 text-xs uppercase tracking-wider border ${getAccountTypeStyle(user.accountType)}`}>
            <Shield className="w-3 h-3 mr-1.5" />
            {user.accountType}
            </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-3 mt-2">
        {/* Email Row */}
        <div className="group flex items-center gap-3 text-sm p-3 rounded-xl hover:bg-slate-100 dark:hover:bg-white/5 transition-colors border border-transparent hover:border-slate-200 dark:hover:border-white/5">
          <div className="p-2 rounded-lg bg-slate-100 text-emerald-600 dark:bg-white/5 dark:text-emerald-400 group-hover:text-emerald-700 dark:group-hover:text-emerald-300 dark:group-hover:bg-emerald-500/20 transition-colors">
            <Mail className="w-4 h-4" />
          </div>
          <div className="flex flex-col">
            <span className="text-xs text-slate-500 dark:text-white/40 font-medium">Email Address</span>
            <span className="text-slate-900 dark:text-emerald-50 font-medium">{user.email}</span>
          </div>
        </div>

        {/* Account ID Row */}
        <div className="group flex items-center gap-3 text-sm p-3 rounded-xl hover:bg-slate-100 dark:hover:bg-white/5 transition-colors border border-transparent hover:border-slate-200 dark:hover:border-white/5">
          <div className="p-2 rounded-lg bg-slate-100 text-cyan-600 dark:bg-white/5 dark:text-cyan-400 group-hover:text-cyan-700 dark:group-hover:text-cyan-300 dark:group-hover:bg-cyan-500/20 transition-colors">
            <User className="w-4 h-4" />
          </div>
          <div className="flex flex-col">
            <span className="text-xs text-slate-500 dark:text-white/40 font-medium">Account ID</span>
            <span className="text-slate-900 dark:text-cyan-50 font-medium">{user.accountId}</span>
          </div>
        </div>

        {/* Member Since Row */}
        <div className="group flex items-center gap-3 text-sm p-3 rounded-xl hover:bg-slate-100 dark:hover:bg-white/5 transition-colors border border-transparent hover:border-slate-200 dark:hover:border-white/5">
          <div className="p-2 rounded-lg bg-slate-100 text-purple-600 dark:bg-white/5 dark:text-purple-400 group-hover:text-purple-700 dark:group-hover:text-purple-300 dark:group-hover:bg-purple-500/20 transition-colors">
            <CalendarDays className="w-4 h-4" />
          </div>
          <div className="flex flex-col">
            <span className="text-xs text-slate-500 dark:text-white/40 font-medium">Member Since</span>
            <span className="text-slate-900 dark:text-purple-50 font-medium">{formatDate(user.createdAt)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}