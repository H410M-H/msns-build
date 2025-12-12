"use client"

import {  useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "~/components/ui/button"
import { Input } from "~/components/ui/input"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "~/components/ui/form"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "~/components/ui/dialog"
import { api } from "~/trpc/react"
import { toast } from "~/hooks/use-toast"
import { Loader2 } from "lucide-react"

const editSchema = z.object({
  baseSalary: z.number().min(1, "Base salary must be positive"),
  increment: z.number().min(0, "Increment cannot be negative"),
})

interface EditAssignmentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  assignment: {
    id: string
    baseSalary: number
    increment: number
    employeeName: string
  } | null
  onSuccess: () => void
}

export function EditAssignmentDialog({ open, onOpenChange, assignment, onSuccess }: EditAssignmentDialogProps) {
  const utils = api.useUtils()
  
  const form = useForm<z.infer<typeof editSchema>>({
    resolver: zodResolver(editSchema),
    defaultValues: {
      baseSalary: 0,
      increment: 0,
    },
  })

  useEffect(() => {
    if (assignment) {
      form.reset({
        baseSalary: assignment.baseSalary,
        increment: assignment.increment,
      })
    }
  }, [assignment, form])

  const updateMutation = api.salary.updateSalaryAssignment.useMutation({
    onSuccess: () => {
      toast({ title: "Success", description: "Salary assignment updated successfully" })
      void utils.salary.getSalaries.invalidate()
      onSuccess()
      onOpenChange(false)
    },
    onError: (error) => {
      toast({ title: "Error", description: error.message})
    }
  })

  const onSubmit = (data: z.infer<typeof editSchema>) => {
    if (!assignment) return
    updateMutation.mutate({
      id: assignment.id,
      baseSalary: data.baseSalary,
      increment: data.increment,
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Salary - {assignment?.employeeName}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="baseSalary"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Base Salary (PKR)</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      {...field} 
                      onChange={e => field.onChange(Number(e.target.value))} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="increment"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Increment (PKR)</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      {...field} 
                      onChange={e => field.onChange(Number(e.target.value))} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={updateMutation.isPending}>
                {updateMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Changes
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}