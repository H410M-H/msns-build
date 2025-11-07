"use client"

import { Button } from "~/components/ui/button"
import { api } from "~/trpc/react"
import { ReloadIcon } from "@radix-ui/react-icons"
import { toast } from "~/hooks/use-toast"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "~/components/ui/alert-dialog"

type SubjectDeletionDialogProps = {
  csId: string
  classId: string
  subjectName: string
}

export function SubjectDeletionDialog({ csId, classId, subjectName }: SubjectDeletionDialogProps) {
  const utils = api.useUtils()
  const removeSubject = api.subject.removeSubjectFromClass.useMutation({
    onSuccess: async () => {
      toast({
        title: "Success",
        description: `Subject "${subjectName}" removed from class`,
      })
      await Promise.all([
        utils.subject.getSubjectsByClass.invalidate({ classId }),
        utils.subject.getAllSubjects.invalidate(),
      ])
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to remove subject",
      })
    },
  })

  const handleRemove = () => {
    removeSubject.mutate({
      csId,
    })
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="destructive" size="sm">
          Remove
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Remove Subject</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to remove <strong>{subjectName}</strong> from this class? This action cannot be
            undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction asChild>
            <Button variant="destructive" onClick={handleRemove} disabled={removeSubject.isPending}>
              {removeSubject.isPending ? (
                <>
                  <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />
                  Removing...
                </>
              ) : (
                "Remove Subject"
              )}
            </Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
