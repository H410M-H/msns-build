"use client";

import { Button } from "~/components/ui/button";
import { api } from "~/trpc/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { toast } from "~/hooks/use-toast";
import { ReloadIcon } from "@radix-ui/react-icons";


type SubjectAssignmentDialogProps = {
  classId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const formSchema = z.object({
  subjectId: z.string().min(1, "Subject is required"),
  employeeId: z.string().min(1, "Teacher is required"),
  sessionId: z.string().min(1, "Session is required"),
});

export const SubjectAssignmentDialog = ({ 
  classId,
  open,
  onOpenChange
}: SubjectAssignmentDialogProps) => {  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });

  const utils = api.useUtils();

  // Queries with error handling
  const {
    data: subjects,
    isLoading: loadingSubjects,
    error: subjectsError,
  } = api.subject.getAllSubjects.useQuery();

  const {
    data: teachers,
    isLoading: loadingTeachers,
    error: teachersError,
  } = api.employee.getEmployeesByDesignation.useQuery({
    designation: "TEACHER"
  });

  const {
    data: sessions,
    isLoading: loadingSessions,
    error: sessionsError,
  } = api.session.getSessions.useQuery();

  // Mutation with proper error handling and invalidation
  const assignSubject = api.subject.assignSubjectToClass.useMutation({
    onSuccess: async () => {
      toast({ title: "Success", description: "Subject assigned successfully" });
      form.reset();
      await utils.subject.getSubjectsByClass.invalidate();
      onOpenChange(false);
    },
  });

  const handleSubmit = (values: z.infer<typeof formSchema>) => {
    assignSubject.mutate({
      classId,
      subjectId: values.subjectId,
      employeeId: values.employeeId,
      sessionId: values.sessionId
    });
  };

  return (
<Dialog open={open} onOpenChange={onOpenChange}>      <DialogTrigger asChild>
        <Button variant="outline">Add Subject</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Assign Subject to Class</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="subjectId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Subject</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    value={field.value}
                    disabled={loadingSubjects}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select subject" />
                    </SelectTrigger>
                    <SelectContent>
                      {loadingSubjects && (
                        <div className="p-2 text-center text-sm">
                          Loading subjects...
                        </div>
                      )}
                      {subjectsError && (
                        <div className="p-2 text-center text-sm text-red-500">
                          Failed to load subjects
                        </div>
                      )}
                      {subjects?.map((subject) => (
                        <SelectItem 
                          key={subject.subjectId} 
                          value={subject.subjectId}
                        >
                          {subject.subjectName}
                        </SelectItem>
                      ))}
                      {!loadingSubjects && !subjectsError && subjects?.length === 0 && (
                        <div className="p-2 text-center text-sm text-muted-foreground">
                          No subjects available
                        </div>
                      )}
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
                  <FormLabel>Teacher</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    value={field.value}
                    disabled={loadingTeachers}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select teacher" />
                    </SelectTrigger>
                    <SelectContent>
                      {loadingTeachers && (
                        <div className="p-2 text-center text-sm">
                          Loading teachers...
                        </div>
                      )}
                      {teachersError && (
                        <div className="p-2 text-center text-sm text-red-500">
                          Failed to load teachers
                        </div>
                      )}
                      {teachers?.map((teacher) => (
                        <SelectItem 
                          key={teacher.employeeId} 
                          value={teacher.employeeId}
                        >
                          {teacher.employeeName}
                        </SelectItem>
                      ))}
                      {!loadingTeachers && !teachersError && teachers?.length === 0 && (
                        <div className="p-2 text-center text-sm text-muted-foreground">
                          No teachers available
                        </div>
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
                  <FormLabel>Session</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    value={field.value}
                    disabled={loadingSessions}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select session" />
                    </SelectTrigger>
                    <SelectContent>
                      {loadingSessions && (
                        <div className="p-2 text-center text-sm">
                          Loading sessions...
                        </div>
                      )}
                      {sessionsError && (
                        <div className="p-2 text-center text-sm text-red-500">
                          Failed to load sessions
                        </div>
                      )}
                      {sessions?.map((session) => (
                        <SelectItem 
                          key={session.sessionId} 
                          value={session.sessionId}
                        >
                          {session.sessionName}
                        </SelectItem>
                      ))}
                      {!loadingSessions && !sessionsError && sessions?.length === 0 && (
                        <div className="p-2 text-center text-sm text-muted-foreground">
                          No sessions available
                        </div>
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button 
              type="submit" 
              disabled={assignSubject.isPending}
              className="w-full"
            >
              {assignSubject.isPending ? (
                <>
                  <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />
                  Assigning...
                </>
              ) : (
                "Assign Subject"
              )}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};