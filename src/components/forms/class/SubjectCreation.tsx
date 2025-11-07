"use client"
import { ReloadIcon } from "@radix-ui/react-icons"
import { useForm } from "react-hook-form"
import { Button } from "~/components/ui/button"
import { api } from "~/trpc/react"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "~/components/ui/form"
import { Input } from "~/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "~/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select"
import { Label } from "~/components/ui/label"
import { Switch } from "~/components/ui/switch"
import { Textarea } from "~/components/ui/textarea"
import { toast } from "~/hooks/use-toast"
import { Skeleton } from "~/components/ui/skeleton"

const formSchema = z.discriminatedUnion("mode", [
  z.object({
    mode: z.literal("create"),
    subjectName: z
      .string()
      .min(2, "Subject name must be at least 2 characters")
      .max(50, "Subject name cannot exceed 50 characters"),
    book: z.string().max(100, "Book name cannot exceed 100 characters").optional().or(z.literal("")),
    description: z.string().max(500, "Description cannot exceed 500 characters").optional().or(z.literal("")),
  }),
  z.object({
    mode: z.literal("assign"),
    subjectId: z.string().min(1, "Subject is required"),
    employeeId: z.string().min(1, "Teacher is required"),
    sessionId: z.string().min(1, "Session is required"),
  }),
])

type SubjectFormValues = z.infer<typeof formSchema>

type SubjectCreationDialogProps = {
  classId: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SubjectCreationDialog({ classId, open, onOpenChange }: SubjectCreationDialogProps) {
  const form = useForm<SubjectFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      mode: "create",
    },
  })

  const utils = api.useUtils()
  const mode = form.watch("mode")

  const {
    data: subjects,
    isLoading: loadingSubjects,
    error: subjectsError,
  } = api.subject.getAllSubjects.useQuery(undefined, {
    enabled: open && mode === "assign",
  })

  const {
    data: teachers,
    isLoading: loadingTeachers,
    error: teachersError,
  } = api.employee.getEmployeesByDesignation.useQuery(
    { designation: "TEACHER" },
    { enabled: open && mode === "assign" },
  )

  const {
    data: sessions,
    isLoading: loadingSessions,
    error: sessionsError,
  } = api.session.getSessions.useQuery(undefined, {
    enabled: open && mode === "assign",
  })

  const createSubject = api.subject.createSubject.useMutation()
  const assignSubject = api.subject.assignSubjectToClass.useMutation()

  const handleSubmit = async (values: SubjectFormValues) => {
    try {
      if (values.mode === "create") {
        await createSubject.mutateAsync({
          subjectName: values.subjectName,
          book: values.book ?? undefined,
          description: values.description ?? undefined,
        })

        toast({ title: "Success", description: `Subject "${values.subjectName}" created successfully` })
        form.reset({ mode: "create" })

        await utils.subject.getAllSubjects.invalidate()
      } else {
        await assignSubject.mutateAsync({
          classId,
          subjectId: values.subjectId,
          employeeId: values.employeeId,
          sessionId: values.sessionId,
        })

        toast({ title: "Success", description: "Subject assigned to class successfully" })
        form.reset({ mode: "assign" })

        await utils.subject.getSubjectsByClass.invalidate({ classId })
      }

      onOpenChange(false)
    } catch (error) {
      console.error("Operation failed:", error)
      const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred"

      toast({
        title: "Error",
        description: errorMessage,
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          Manage Subjects
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Subject Management</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
              <Label className="text-base font-medium">Operation Mode</Label>
              <div className="flex items-center gap-3">
                <Switch
                  checked={mode === "assign"}
                  onCheckedChange={(checked) => {
                    form.reset()
                    form.setValue("mode", checked ? "assign" : "create")
                  }}
                  className="data-[state=checked]:bg-primary"
                />
                <span className="font-medium text-sm">{mode === "create" ? "Create New" : "Assign Existing"}</span>
              </div>
            </div>

            <div className="grid gap-4">
              {mode === "create" ? (
                <>
                  <FormField
                    control={form.control}
                    name="subjectName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Subject Name *</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="e.g., Mathematics, English" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="book"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Recommended Book</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="e.g., Oxford Mathematics Grade 9" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea {...field} placeholder="Brief description of the subject..." className="min-h-24" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </>
              ) : (
                <>
                  <FormField
                    control={form.control}
                    name="subjectId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Select Subject *</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value || ""}
                          disabled={loadingSubjects || !!subjectsError}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Choose a subject" />
                          </SelectTrigger>
                          <SelectContent>
                            {loadingSubjects && (
                              <div className="p-2">
                                <Skeleton className="h-6 w-32" />
                              </div>
                            )}
                            {subjectsError && (
                              <div className="p-2 text-sm text-destructive">Failed to load subjects</div>
                            )}
                            {subjects?.map((s) => (
                              <SelectItem key={s.subjectId} value={s.subjectId}>
                                {s.subjectName}
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
                    name="employeeId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Assign Teacher *</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value || ""}
                          disabled={loadingTeachers || !!teachersError}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Choose a teacher" />
                          </SelectTrigger>
                          <SelectContent>
                            {loadingTeachers && (
                              <div className="p-2">
                                <Skeleton className="h-6 w-32" />
                              </div>
                            )}
                            {teachersError && (
                              <div className="p-2 text-sm text-destructive">Failed to load teachers</div>
                            )}
                            {teachers?.map((t) => (
                              <SelectItem key={t.employeeId} value={t.employeeId}>
                                {t.employeeName}
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
                    name="sessionId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Academic Session *</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value || ""}
                          disabled={loadingSessions || !!sessionsError}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Choose a session" />
                          </SelectTrigger>
                          <SelectContent>
                            {loadingSessions && (
                              <div className="p-2">
                                <Skeleton className="h-6 w-32" />
                              </div>
                            )}
                            {sessionsError && (
                              <div className="p-2 text-sm text-destructive">Failed to load sessions</div>
                            )}
                            {sessions?.map((s) => (
                              <SelectItem key={s.sessionId} value={s.sessionId}>
                                {s.sessionName}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </>
              )}
            </div>

            <Button type="submit" disabled={createSubject.isPending || assignSubject.isPending} className="w-full">
              {createSubject.isPending || assignSubject.isPending ? (
                <>
                  <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : mode === "create" ? (
                "Create Subject"
              ) : (
                "Assign Subject to Class"
              )}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
