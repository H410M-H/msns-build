"use client";

import { useState, useEffect, type ReactNode } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Check, ChevronsUpDown } from "lucide-react";

import { api } from "~/trpc/react";
import { useToast } from "~/hooks/use-toast";
import { cn } from "~/lib/utils";

import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
// Removed Select imports as we are now using Command/Popover for everything
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "~/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { Label } from "~/components/ui/label";

// Schema
const AllotmentSchema = z.object({
  classId: z.string().cuid(),
  studentId: z.string().cuid(),
  sessionId: z.string().cuid(),
});

type AllotmentSchemaType = z.infer<typeof AllotmentSchema>;

interface AllotmentDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  sessions: { sessionId: string; sessionName: string }[];
  classId: string;
  children?: ReactNode;
}

export default function AllotmentDialog({
  open,
  onOpenChange,
  sessions = [], // Default to empty array to prevent crashes
  classId,
  children,
}: AllotmentDialogProps) {
  // State for the Comboboxes
  const [studentOpen, setStudentOpen] = useState(false);
  const [sessionOpen, setSessionOpen] = useState(false);

  const form = useForm<AllotmentSchemaType>({
    resolver: zodResolver(AllotmentSchema),
    defaultValues: {
      sessionId: "",
      studentId: "",
      classId,
    },
  });

  const utils = api.useUtils();
  const { toast } = useToast();

  // Fetch unallocated students
  const { data: unallocatedStudentsData, isLoading: studentsLoading } =
    api.student.getUnAllocateStudents.useQuery(
      {
        page: 1,
        pageSize: 100,
      },
      {
        enabled: open,
      },
    );

  const allotment = api.allotment.addToClass.useMutation({
    onSuccess: async () => {
      toast({
        title: "Success",
        description: "Student has been successfully allotted to the class.",
      });
      // Reset logic: keep session, clear student
      form.reset({
        sessionId: form.getValues("sessionId"),
        studentId: "",
        classId,
      });
      await utils.student.getUnAllocateStudents.invalidate();
      await utils.allotment.invalidate();
      onOpenChange?.(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to allot student to class.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: AllotmentSchemaType) => {
    allotment.mutate({
      ...data,
      classId,
    });
  };

  const unallocatedStudents =
    unallocatedStudentsData?.data?.map((student) => ({
      studentId: student.studentId,
      studentName: student.studentName,
      fatherName: student.fatherName,
      admissionNumber: student.admissionNumber,
    })) ?? [];

  // Reset form when dialog opens/closes
  useEffect(() => {
    if (!open) {
      form.reset({
        sessionId: "",
        studentId: "",
        classId,
      });
    }
  }, [open, form, classId]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        {children ?? <Button>Allot Student</Button>}
      </DialogTrigger>

      <DialogContent className="overflow-visible sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Allot Student to Class</DialogTitle>
        </DialogHeader>

        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-col gap-4 py-2"
        >
          {/* IMPROVED: Session Dropdown (Combobox) */}
          <div className="flex flex-col space-y-2">
            <Label>Session</Label>
            <Popover open={sessionOpen} onOpenChange={setSessionOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={sessionOpen}
                  className={cn(
                    "w-full justify-between",
                    !form.watch("sessionId") && "text-muted-foreground",
                  )}
                >
                  {form.watch("sessionId")
                    ? sessions.find(
                        (session) =>
                          session.sessionId === form.watch("sessionId"),
                      )?.sessionName
                    : "Select session..."}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[400px] p-0" align="start">
                <Command>
                  <CommandInput placeholder="Search session..." />
                  <CommandList>
                    <CommandEmpty>No session found.</CommandEmpty>
                    <CommandGroup>
                      {sessions.map((session) => (
                        <CommandItem
                          key={session.sessionId}
                          value={session.sessionName}
                          onSelect={() => {
                            form.setValue("sessionId", session.sessionId);
                            setSessionOpen(false);
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              form.watch("sessionId") === session.sessionId
                                ? "opacity-100"
                                : "opacity-0",
                            )}
                          />
                          {session.sessionName}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
            {form.formState.errors.sessionId && (
              <p className="text-sm text-red-500">
                {form.formState.errors.sessionId.message}
              </p>
            )}
          </div>

          {/* Student Searchable Select (Combobox) */}
          <div className="flex flex-col space-y-2">
            <Label>Student</Label>
            <Popover open={studentOpen} onOpenChange={setStudentOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={studentOpen}
                  className={cn(
                    "h-auto min-h-[40px] w-full justify-between",
                    !form.watch("studentId") && "text-muted-foreground",
                  )}
                  disabled={studentsLoading}
                >
                  {form.watch("studentId")
                    ? unallocatedStudents.find(
                        (student) =>
                          student.studentId === form.watch("studentId"),
                      )?.studentName
                    : studentsLoading
                      ? "Loading..."
                      : "Select student..."}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[400px] p-0" align="start">
                <Command>
                  <CommandInput placeholder="Search by name, father, or adm no..." />
                  <CommandList>
                    <CommandEmpty>No student found.</CommandEmpty>
                    <CommandGroup>
                      {unallocatedStudents.map((student) => (
                        <CommandItem
                          key={student.studentId}
                          value={`${student.studentName} ${student.fatherName} ${student.admissionNumber ?? ""}`}
                          onSelect={() => {
                            form.setValue("studentId", student.studentId);
                            setStudentOpen(false);
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4 shrink-0",
                              form.watch("studentId") === student.studentId
                                ? "opacity-100"
                                : "opacity-0",
                            )}
                          />
                          <div className="flex flex-col">
                            <span className="font-medium">
                              {student.studentName}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {student.fatherName &&
                                `S/O ${student.fatherName}`}
                              {student.fatherName &&
                                student.admissionNumber &&
                                " • "}
                              {student.admissionNumber &&
                                `Adm: ${student.admissionNumber}`}
                            </span>
                          </div>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>

            {form.formState.errors.studentId && (
              <p className="text-sm text-red-500">
                {form.formState.errors.studentId.message}
              </p>
            )}
          </div>

          <DialogFooter className="mt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange?.(false)}
              disabled={allotment.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={
                allotment.isPending ||
                !form.watch("sessionId") ||
                !form.watch("studentId")
              }
            >
              {allotment.isPending ? "Allotting..." : "Allot Student"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export { AllotmentDialog };
