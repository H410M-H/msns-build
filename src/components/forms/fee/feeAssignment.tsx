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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select"
import { useToast } from "~/hooks/use-toast"
import { api } from "~/trpc/react"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "~/components/ui/form"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { WalletCards, Users, Loader2 } from "lucide-react"
import { Badge } from "~/components/ui/badge"
import { zodResolver } from "@hookform/resolvers/zod"

const formSchema = z.object({
  sessionId: z.string().min(1, "Session is required"),
  classId: z.string().min(1, "Class is required"),
  feeId: z.string().min(1, "Fee structure is required"),
  month: z.string().min(1, "Month is required"),
  year: z.string().min(1, "Year is required"),
})

const months = [
  { value: "1", label: "January" },
  { value: "2", label: "February" },
  { value: "3", label: "March" },
  { value: "4", label: "April" },
  { value: "5", label: "May" },
  { value: "6", label: "June" },
  { value: "7", label: "July" },
  { value: "8", label: "August" },
  { value: "9", label: "September" },
  { value: "10", label: "October" },
  { value: "11", label: "November" },
  { value: "12", label: "December" },
]

const currentYear = new Date().getFullYear()
const years = Array.from({ length: 5 }, (_, i) => ({
  value: String(currentYear - 2 + i),
  label: String(currentYear - 2 + i),
}))

export function FeeAssignmentDialog() {
  const [open, setOpen] = useState(false)
  const { toast } = useToast()
  const utils = api.useUtils()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      month: String(new Date().getMonth() + 1),
      year: String(currentYear),
    },
  })

  const feeData = api.fee.getAllFees.useQuery()
  const sessionData = api.session.getSessions.useQuery()
  const classData = api.class.getClasses.useQuery()

  const studentCountData = api.allotment.getStudentsByClassAndSession.useQuery(
    {
      classId: form.watch("classId"),
      sessionId: form.watch("sessionId"),
    },
    {
      enabled: !!form.watch("classId") && !!form.watch("sessionId"),
    },
  )

  const assignFee = api.fee.assignFeeToClass.useMutation({
    onSuccess: (data) => {
      toast({
        title: "Fee assigned successfully",
        description: `Assigned to ${data.assignedCount} students. ${data.skippedCount > 0 ? `${data.skippedCount} already had fees assigned.` : ""}`,
      })
      void utils.fee.invalidate()
      setOpen(false)
      form.reset()
    },
    onError: (error) => {
      toast({
        title: "Error assigning fee",
        description: error.message,
      })
    },
  })

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    assignFee.mutate({
      feeId: values.feeId,
      classId: values.classId,
      sessionId: values.sessionId,
      month: Number.parseInt(values.month),
      year: Number.parseInt(values.year),
    })
  }

  const studentCount = studentCountData.data?.data?.length ?? 0

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          size="sm"
          className="h-11 px-4 rounded-xl gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white hover:shadow-md"
        >
          <WalletCards className="w-4 h-4" />
          Assign Fee
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Bulk Fee Assignment</DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            Assign monthly fee to all students in a class at once.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            {/* Session Selection */}
            <FormField
              control={form.control}
              name="sessionId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Academic Session</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value} disabled={sessionData.isLoading}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select session" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {sessionData.data?.map((session) => (
                        <SelectItem key={session.sessionId} value={session.sessionId}>
                          {session.sessionName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Class Selection */}
            <FormField
              control={form.control}
              name="classId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Class</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                    disabled={!form.watch("sessionId") || classData.isLoading}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select class" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {classData.data?.map((classItem) => (
                        <SelectItem key={classItem.classId} value={classItem.classId}>
                          {classItem.grade} - {classItem.section}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {form.watch("classId") && form.watch("sessionId") && (
              <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg border border-blue-100">
                <Users className="w-4 h-4 text-blue-600" />
                <span className="text-sm text-blue-800">
                  {studentCountData.isLoading ? (
                    "Loading students..."
                  ) : (
                    <>
                      <strong>{studentCount}</strong> students will be assigned this fee
                    </>
                  )}
                </span>
              </div>
            )}

            {/* Month and Year Selection */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="month"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Month</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select month" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {months.map((month) => (
                          <SelectItem key={month.value} value={month.value}>
                            {month.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="year"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Year</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select year" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {years.map((year) => (
                          <SelectItem key={year.value} value={year.value}>
                            {year.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Fee Structure Selection */}
            <FormField
              control={form.control}
              name="feeId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Fee Structure</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value} disabled={feeData.isLoading}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select fee structure" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {feeData.data?.map((fee) => (
                        <SelectItem key={fee.feeId} value={fee.feeId}>
                          <div className="flex items-center gap-2">
                            <span>{fee.level}</span>
                            <Badge variant="secondary" className="text-xs">
                              Rs. {fee.tuitionFee.toLocaleString()}/mo
                            </Badge>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="pt-4 border-t">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={assignFee.isPending || studentCount === 0} className="gap-2">
                {assignFee.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                {assignFee.isPending ? "Assigning..." : `Assign to ${studentCount} Students`}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
