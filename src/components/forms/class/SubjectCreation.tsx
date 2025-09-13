"use client";

import { useEffect } from "react";
import { ReloadIcon } from "@radix-ui/react-icons";
import { useForm } from "react-hook-form";
import { Button } from "~/components/ui/button";
import { api } from "~/trpc/react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Label } from "~/components/ui/label";
import { Switch } from "~/components/ui/switch";
import { BookUploader } from "~/components/ui/docUploader";
import { toast } from "~/hooks/use-toast";
import { Skeleton } from "~/components/ui/skeleton";

const formSchema = z.discriminatedUnion("mode", [
  z.object({
    mode: z.literal("create"),
    subjectName: z.string()
      .min(2, "Subject name must be at least 2 characters")
      .max(50, "Subject name cannot exceed 50 characters"),
    book: z.string()
      .max(100, "Book name cannot exceed 100 characters")
      .optional(),
    description: z.string()
      .max(500, "Description cannot exceed 500 characters")
      .optional(),
    employeeId: z.string().min(1, "Teacher is required"),
    sessionId: z.string().min(1, "Session is required"),
  }),
  z.object({
    mode: z.literal("assign"),
    subjectId: z.string().min(1, "Subject is required"),
    employeeId: z.string().min(1, "Teacher is required"),
    sessionId: z.string().min(1, "Session is required"),
  }),
]);

type SubjectFormValues = z.infer<typeof formSchema>;

type SubjectCreationDialogProps = {
  classId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export const SubjectCreationDialog = ({ 
  classId,
  open,
  onOpenChange
}: SubjectCreationDialogProps) => {
  const form = useForm<SubjectFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      mode: "create",
    },
  });

  const utils = api.useUtils();
  const mode = form.watch("mode");

  // Data fetching with error handling
  const {
    data: subjects,
    isLoading: loadingSubjects,
    error: subjectsError,
  } = api.subject.getAllSubjects.useQuery(undefined, {
    enabled: open && mode === "assign",
  });

  const {
    data: teachers,
    isLoading: loadingTeachers,
    error: teachersError,
  } = api.employee.getEmployeesByDesignation.useQuery(
    { designation: "TEACHER" },
    { enabled: open }
  );

  const {
    data: sessions,
    isLoading: loadingSessions,
    error: sessionsError,
  } = api.session.getSessions.useQuery(undefined, { 
    enabled: open,
  });

  // Session error handling
  useEffect(() => {
    if (sessionsError) {
      toast({
        title: "Session Error",
        description: sessionsError.message,
      });
    }
  }, [sessionsError]);

  const createSubject = api.subject.createSubject.useMutation();
  const assignSubject = api.subject.assignSubjectToClass.useMutation();

  const handleSubmit = async (values: SubjectFormValues) => {
    try {
      let successMessage = "";
      
      if (values.mode === "create") {
        const newSubject = await createSubject.mutateAsync({
          subjectName: values.subjectName,
          book: values.book,
          description: values.description,
        });
        
        await assignSubject.mutateAsync({
          classId,
          subjectId: newSubject.subjectId,
          employeeId: values.employeeId,
          sessionId: values.sessionId,
        });
        
        successMessage = `Created and assigned ${values.subjectName} successfully`;
      } else {
        await assignSubject.mutateAsync({
          classId,
          subjectId: values.subjectId,
          employeeId: values.employeeId,
          sessionId: values.sessionId,
        });
        
        successMessage = "Subject assigned successfully";
      }

      await Promise.all([
        utils.subject.getAllSubjects.invalidate(),
        utils.subject.getSubjectsByClass.invalidate({ 
          classId,
          sessionId: values.sessionId
        }),
      ]);

      toast({ title: "Success", description: successMessage });
      form.reset();
      onOpenChange(false);
    } catch (error) {
      console.error("Operation failed:", error);
      const errorMessage = error instanceof Error 
        ? error.message 
        : "An unexpected error occurred";
        
      toast({
        title: "Operation Failed",
        description: errorMessage,
      });
    }
  };

  const renderSelectContent = (
    loading: boolean,
    error: unknown,
    items: Array<{ id: string; name: string }>,
    placeholder: string
  ): React.ReactNode => {
    if (loading) return <Skeleton className="h-8 w-full" />;
    if (error) return <span className="text-destructive">Failed to load {placeholder}</span>;
    if (!items.length) return <span className="text-muted-foreground">No {placeholder} available</span>;

    return items.map((item) => (
      <SelectItem key={item.id} value={item.id}>
        {item.name}
      </SelectItem>
    ));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
  <Button variant="outline" className="min-w-[160px]">
    Manage Subjects  {/* THIS IS THE BUTTON TEXT */}
  </Button>
</DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            Subject Management
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
              <Label className="text-base">Operation Mode:</Label>
              <div className="flex items-center gap-3">
                <Switch
                  checked={mode === "assign"}
                  onCheckedChange={(checked) => {
                    form.reset();
                    form.setValue("mode", checked ? "assign" : "create");
                  }}
                  className="data-[state=checked]:bg-primary"
                />
                <span className="font-medium">
                  {mode === "create" ? "Create New Subject" : "Assign Existing Subject"}
                </span>
              </div>
            </div>

            <div className="grid gap-6">
              {mode === "create" ? (
                <>
                  <FormField
                    control={form.control}
                    name="subjectName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Subject Name *</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            placeholder="Mathematics" 
                            className="h-11"
                          />
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
                        <FormLabel>Course Material</FormLabel>
                        <FormControl>
                          <BookUploader
                            onUploadSuccess={(url) => field.onChange(url)}
                            onRemove={() => field.onChange("")}
                            initialFile={field.value}
                          />
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
                          <Input
                            {...field}
                            placeholder="Course description..."
                            className="h-24"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </>
              ) : (
                <FormField
                  control={form.control}
                  name="subjectId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Select Subject *</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                        disabled={loadingSubjects || !!subjectsError}
                      >
                        <SelectTrigger className="h-11">
                          <SelectValue placeholder="Select subject" />
                        </SelectTrigger>
                        <SelectContent>
                          {renderSelectContent(
                            loadingSubjects,
                            subjectsError,
                            subjects?.map(s => ({ id: s.subjectId, name: s.subjectName })) ?? [],
                            "subjects"
                          )}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <FormField
                control={form.control}
                name="employeeId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Assign Teacher *</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                      disabled={loadingTeachers || !!teachersError}
                    >
                      <SelectTrigger className="h-11">
                        <SelectValue placeholder="Select teacher" />
                      </SelectTrigger>
                      <SelectContent>
                        {renderSelectContent(
                          loadingTeachers,
                          teachersError,
                          teachers?.map(t => ({ id: t.employeeId, name: `${t.employeeName } | ${t.designation}` })) ?? [],
                          "teachers"
                        )}
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
                      value={field.value}
                      disabled={loadingSessions || !!sessionsError}
                    >
                      <SelectTrigger className="h-11">
                        <SelectValue placeholder="Select session" />
                      </SelectTrigger>
                      <SelectContent>
                        {renderSelectContent(
                          loadingSessions,
                          sessionsError,
                          sessions?.map(s => ({ id: s.sessionId, name: s.sessionName })) ?? [],
                          "sessions"
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Button
              type="submit"
              disabled={createSubject.isPending || assignSubject.isPending}
              className="w-full h-12 text-lg"
            >
              {createSubject.isPending || assignSubject.isPending ? (
                <>
                  <ReloadIcon className="mr-2 h-5 w-5 animate-spin" />
                  Processing...
                </>
              ) : mode === "create" ? (
                "Create & Assign Subject"
              ) : (
                "Assign Selected Subject"
              )}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};