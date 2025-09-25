// File: ProfileCard.tsx (unchanged, as no errors reported)
"use client"

import { Card, CardContent, CardHeader } from "~/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar"
import { Badge } from "~/components/ui/badge"
import { CalendarDays, Mail, Shield } from "lucide-react"
import { api } from "~/trpc/react"


export default function ProfileCard() {
  const { data: user } = api.profile.getProfile.useQuery()

  if (!user) return null

  const getAccountTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case "admin":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
      case "principal":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
      case "teacher":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
      case "student":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
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
    <Card className="w-full max-w-sm mx-auto p-12">
      <CardHeader className="text-center">
        <div className="flex justify-center">
          <Avatar className="w-24 h-24">
            <AvatarImage
              src={`/placeholder-422db.png?height=96&width=96&query=profile picture for ${user.username}`}
            />
            <AvatarFallback className="text-2xl font-semibold">{user.username.charAt(0).toUpperCase()}</AvatarFallback>
          </Avatar>
        </div>
        <h2 className="text-2xl font-bold text-foreground">{user.username}</h2>
        <Badge className={`w-fit mx-auto ${getAccountTypeColor(user.accountType)}`}>
          <Shield className="w-3 h-3 mr-1" />
          {user.accountType}
        </Badge>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="flex items-center gap-3 text-sm">
          <Mail className="w-4 h-4 text-muted-foreground" />
          <span className="text-foreground">{user.email}</span>
        </div>

        <div className="flex items-center gap-3 text-sm">
          <Shield className="w-4 h-4 text-muted-foreground" />
          <span className="text-foreground">ID: {user.accountId}</span>
        </div>

        <div className="flex items-center gap-3 text-sm">
          <CalendarDays className="w-4 h-4 text-muted-foreground" />
          <span className="text-foreground">Joined {formatDate(user.createdAt)}</span>
        </div>
      </CardContent>
    </Card>
  )
}