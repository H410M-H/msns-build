"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card"
import { Button } from "~/components/ui/button"
import { Textarea } from "~/components/ui/textarea"
import { useToast } from "~/hooks/use-toast"
import { Loader2, FileText, Edit3 } from "lucide-react"
import { api } from "~/trpc/react"

export default function ProfileBio() {
  const { data: profile } = api.profile.getProfile.useQuery()
  const [isEditing, setIsEditing] = useState(false)
  const [bio, setBio] = useState(profile?.bio ?? "Add a bio to tell others about yourself...")
  const { toast } = useToast()

  const updateBioMutation = api.profile.updateBio.useMutation()

  const handleSave = async () => {
    try {
      await updateBioMutation.mutateAsync({ bio })

      toast({
        title: "Success",
        description: "Bio updated successfully",
      })

      setIsEditing(false)
    } catch (error) {
      toast({
        title: "Error",
        description: (error as Error).message || "Failed to update bio",
      })
    }
  }

  const handleCancel = () => {
    setIsEditing(false)
    setBio(profile?.bio ?? "Add a bio to tell others about yourself...")
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Bio
          </div>
          {!isEditing && (
            <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
              <Edit3 className="w-4 h-4 mr-2" />
              Edit
            </Button>
          )}
        </CardTitle>
        <CardDescription>Share a bit about yourself with others</CardDescription>
      </CardHeader>

      <CardContent>
        {isEditing ? (
          <div className="space-y-4">
            <Textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell others about yourself..."
              className="min-h-[120px]"
              maxLength={500}
            />
            <div className="text-sm text-muted-foreground text-right">{bio.length}/500 characters</div>
            <div className="flex gap-2">
              <Button onClick={handleSave} disabled={updateBioMutation.isPending}>
                {updateBioMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Bio"
                )}
              </Button>
              <Button variant="outline" onClick={handleCancel} disabled={updateBioMutation.isPending}>
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-muted-foreground italic">{bio}</div>
        )}
      </CardContent>
    </Card>
  )
}

export { ProfileBio }