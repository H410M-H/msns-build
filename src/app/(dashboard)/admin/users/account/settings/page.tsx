// Suggested File: src/app/(dashboard)/admin/users/account/settings/page.tsx (based on error reports)
"use client"

import ProfileForm from "~/components/blocks/account-details/ProfileForm"
import ProfileSettings from "~/components/blocks/account-details/ProfileSettings"
import { api } from "~/trpc/react"

export default function SettingsPage() {
  const { data: user, isLoading } = api.profile.getProfile.useQuery()

  if (isLoading) {
    return <div>Loading...</div>
  }

  if (!user) {
    return <div>User not found</div>
  }

  return (
    <div className="space-y-6">
      <ProfileForm user={user} />
      <ProfileSettings user={user} />
    </div>
  )
}