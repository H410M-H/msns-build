"use client"

import { Button } from "~/components/ui/button"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "~/components/ui/dialog"
import { useForm } from "react-hook-form"
import { api } from "~/trpc/react"
import { zodResolver } from "@hookform/resolvers/zod"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select"
import { Label } from "~/components/ui/label"
import { z } from "zod"
import { toast } from "~/hooks/use-toast"

// Use the exact schema from your AllotmentRouter
const AllotmentSchema = z.object({
  classId: z.string().cuid(),
  studentId: z.string().cuid(),
  sessionId: z.string().cuid(),
})

type AllotmentSchemaType = z.infer<typeof AllotmentSchema>

interface AllotmentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  sessions: { sessionId: string; sessionName: string }[]
  students: { studentId: string; studentName: string }[]
  classId: string
}

export default function AllotmentDialog({ open, onOpenChange, sessions, students, classId }: AllotmentDialogProps) {
  const form = useForm<AllotmentSchemaType>({
    resolver: zodResolver(AllotmentSchema),
    defaultValues: {
      sessionId: "",
      studentId: "",
      classId,
    },
  })

  const utils = api.useUtils()

  const allotment = api.allotment.addToClass.useMutation({
    onSuccess: async () => {
      toast({
        title: "Success",
        description: "Student has been successfully allotted to the class.",
      })
      form.reset()
      await utils.student.getUnAllocateStudents.invalidate()
      await utils.allotment.invalidate()
      onOpenChange(false)
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to allot student to class.",
        })
    },
  })

  const onSubmit = (data: AllotmentSchemaType) => {
    allotment.mutate({
      ...data,
      classId,
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Allot Student to Class</DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="session-select">Session</Label>
            <Select onValueChange={(value) => form.setValue("sessionId", value)} value={form.watch("sessionId")}>
              <SelectTrigger id="session-select">
                <SelectValue placeholder="Select session" />
              </SelectTrigger>
              <SelectContent>
                {sessions.length > 0 ? (
                  sessions.map((session) => (
                    <SelectItem key={session.sessionId} value={session.sessionId}>
                      {session.sessionName}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="" disabled>
                    No sessions available
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
            {form.formState.errors.sessionId && (
              <p className="text-sm text-red-500">{form.formState.errors.sessionId.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="student-select">Student</Label>
            <Select onValueChange={(value) => form.setValue("studentId", value)} value={form.watch("studentId")}>
              <SelectTrigger id="student-select">
                <SelectValue placeholder="Select student" />
              </SelectTrigger>
              <SelectContent>
                {students.length > 0 ? (
                  students.map((student) => (
                    <SelectItem key={student.studentId} value={student.studentId}>
                      {student.studentName}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="" disabled>
                    No students available
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
            {form.formState.errors.studentId && (
              <p className="text-sm text-red-500">{form.formState.errors.studentId.message}</p>
            )}
          </div>

          <DialogFooter className="mt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={allotment.isPending}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={allotment.isPending || !form.watch("sessionId") || !form.watch("studentId")}
            >
              {allotment.isPending ? "Allotting..." : "Allot Student"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// Also export as named export for flexibility
export { AllotmentDialog }
