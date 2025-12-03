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
            <Skeleton className="h-24 w-24 rounded-full bg-white/10" />
            <Skeleton className="h-8 w-48 bg-white/10" />
            <Skeleton className="h-6 w-32 bg-white/10" />
            <div className="w-full space-y-3 mt-8">
                <Skeleton className="h-6 w-full bg-white/10" />
                <Skeleton className="h-6 w-full bg-white/10" />
                <Skeleton className="h-6 w-full bg-white/10" />
            </div>
        </div>
    )
  }

  if (!user) return null

  const getAccountTypeStyle = (type: string) => {
    switch (type.toLowerCase()) {
      case "admin":
        return "bg-gradient-to-r from-red-500/20 to-orange-500/20 text-red-300 border-red-500/30"
      case "principal":
        return "bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-300 border-purple-500/30"
      case "teacher":
        return "bg-gradient-to-r from-blue-500/20 to-cyan-500/20 text-blue-300 border-blue-500/30"
      case "student":
        return "bg-gradient-to-r from-emerald-500/20 to-green-500/20 text-emerald-300 border-emerald-500/30"
      default:
        return "bg-white/10 text-gray-300 border-white/20"
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
    <Card className="w-full bg-transparent border-none shadow-none text-white">
      <CardHeader className="text-center pt-0">
        <div className="flex justify-center mb-4">
          <div className="p-1 rounded-full bg-gradient-to-br from-emerald-400 to-cyan-400 shadow-lg shadow-emerald-500/20">
            <Avatar className="w-28 h-28 border-4 border-black/50">
              <AvatarImage
                src={`/placeholder-422db.png?height=112&width=112&query=profile picture for ${user.username}`}
                className="object-cover"
              />
              <AvatarFallback className="text-3xl font-bold bg-emerald-950 text-emerald-400">
                {user.username.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </div>
        </div>
        
        <div className="space-y-2">
            <h2 className="text-2xl font-bold tracking-tight text-white">
            {user.username}
            </h2>
            <Badge variant="outline" className={`px-3 py-1 text-xs uppercase tracking-wider border ${getAccountTypeStyle(user.accountType)}`}>
            <Shield className="w-3 h-3 mr-1.5" />
            {user.accountType}
            </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-5 mt-2">
        <div className="group flex items-center gap-3 text-sm p-3 rounded-xl hover:bg-white/5 transition-colors border border-transparent hover:border-white/5">
          <div className="p-2 rounded-lg bg-white/5 text-emerald-400 group-hover:text-emerald-300 group-hover:bg-emerald-500/20 transition-colors">
            <Mail className="w-4 h-4" />
          </div>
          <div className="flex flex-col">
            <span className="text-xs text-white/40 font-medium">Email Address</span>
            <span className="text-emerald-50 font-medium">{user.email}</span>
          </div>
        </div>

        <div className="group flex items-center gap-3 text-sm p-3 rounded-xl hover:bg-white/5 transition-colors border border-transparent hover:border-white/5">
          <div className="p-2 rounded-lg bg-white/5 text-cyan-400 group-hover:text-cyan-300 group-hover:bg-cyan-500/20 transition-colors">
            <User className="w-4 h-4" />
          </div>
          <div className="flex flex-col">
            <span className="text-xs text-white/40 font-medium">Account ID</span>
            <span className="text-cyan-50 font-medium">{user.accountId}</span>
          </div>
        </div>

        <div className="group flex items-center gap-3 text-sm p-3 rounded-xl hover:bg-white/5 transition-colors border border-transparent hover:border-white/5">
          <div className="p-2 rounded-lg bg-white/5 text-purple-400 group-hover:text-purple-300 group-hover:bg-purple-500/20 transition-colors">
            <CalendarDays className="w-4 h-4" />
          </div>
          <div className="flex flex-col">
            <span className="text-xs text-white/40 font-medium">Member Since</span>
            <span className="text-purple-50 font-medium">{formatDate(user.createdAt)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}