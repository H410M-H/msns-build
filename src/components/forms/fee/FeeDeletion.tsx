"use client"

import { useState } from "react"
import { Button } from "~/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog"
import { api } from "~/trpc/react"
import { useToast } from "~/hooks/use-toast"

type FeeDeletionDialogProps = {
  feeIds: string[]
  children: React.ReactNode
  onDeleteSuccess: () => void
}

export function FeeDeletionDialog({ feeIds, onDeleteSuccess }: FeeDeletionDialogProps) {
  const [open, setOpen] = useState(false)
  const { toast } = useToast()

  const deleteFees = api.fee.deleteFeesByIds.useMutation({
    onSuccess: () => {
      toast({
        title: "Fees deleted successfully",
        description: "The selected fees have been removed from the system.",
      })
      setOpen(false)
      onDeleteSuccess()
    },
    onError: (error) => {
      toast({
        title: "Error deleting fees",
        description: error.message,
      })
    },
  })

  const handleDelete = () => {
    deleteFees.mutate({ feeIds })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="destructive" disabled={feeIds.length === 0}>
          Delete Selected Fees
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Delete Fees</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete the selected fees? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button 
            variant="destructive" 
            onClick={handleDelete}
            disabled={deleteFees.isPending}
          >
            {deleteFees.isPending ? "Deleting..." : "Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}