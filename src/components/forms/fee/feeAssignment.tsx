"use client";

import { useState } from "react";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
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
import { useToast } from "~/hooks/use-toast";
import { api } from "~/trpc/react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { WalletCards } from "lucide-react";
import { type Grades, type Sessions, type Students } from "@prisma/client";

const formSchema = z.object({
  sessionId: z.string().min(1, "Session is required"),
  classId: z.string().min(1, "Class is required"),
  studentId: z.string().min(1, "Student is required"),
  feeId: z.string().min(1, "Fee name is required"),
});


export function FeeAssignmentDialog() {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });

  const feeData = api.fee.getAllFees.useQuery();
  const sessionData = api.session.getSessions.useQuery();
  const classData = api.class.getClasses.useQuery();
  const studentData = api.allotment.getStudentsByClassAndSession.useQuery(
    {
      classId: form.watch("classId"),
      sessionId: form.watch("sessionId")
    },
    {
      enabled: !!form.watch("classId"),
      select: (data: { data: ({ sessionId: string; classId: string; studentId: string; scId: string; } & { Grades: Grades; Sessions: Sessions; Students: Students; })[]; }) => data.data
    }
  );

  const assignFee = api.fee.assignFeeToStudent.useMutation({
    onSuccess: () => {
      toast({
        title: "Fee assigned successfully",
        description: "The fee has been assigned to the student.",
      });
      setOpen(false);
      form.reset();
    },
    onError: (error) => {
      toast({
        title: "Error assigning fee",
        description: error.message,
      });
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    assignFee.mutate({
      feeId: values.feeId,
      classId: values.classId,
      studentId: values.studentId,
      sessionId: values.sessionId,
      discount: 0,
      discountbypercent: 0,
      discountDescription: "",
    });
  };

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

      <DialogContent className="sm:max-w-[80%]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Fee Assignment</DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            Assign fees to students and view existing assignments.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="assign">
          <TabsList className="mt-4">
            <TabsTrigger value="assign">Assign Fee</TabsTrigger>
          </TabsList>

          <TabsContent value="assign">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="sessionId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Session</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                        disabled={sessionData.isLoading}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select session" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {sessionData.data?.map((session) => (
                            <SelectItem
                              key={session.sessionId}
                              value={session.sessionId}
                            >
                              {session.sessionName} ({session.sessionFrom.toLocaleDateString()} - {session.sessionTo.toLocaleDateString()})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="border-t pt-4">
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
                                {classItem.grade}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="border-t pt-4">
                  <FormField
                    control={form.control}
                    name="studentId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Student</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                          disabled={!form.watch("classId") || studentData.isLoading}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select student" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {studentData.data?.map((enrollment) => (
                              <SelectItem
                                key={enrollment.studentId}
                                value={enrollment.studentId}
                              >
                                {enrollment.Students.studentName}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="border-t pt-4">
                  <FormField
                    control={form.control}
                    name="feeId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Fees</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                          disabled={feeData.isLoading}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select fee" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {feeData.data?.map((fee) => (
                              <SelectItem key={fee.feeId} value={fee.feeId}>
                                {fee.level}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <DialogFooter className="pt-6 border-t">
                  <Button type="submit" disabled={assignFee.isPending}>
                    {assignFee.isPending ? "Assigning..." : "Assign Fee"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}