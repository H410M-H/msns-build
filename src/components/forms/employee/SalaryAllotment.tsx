"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import {
  Form,
  FormControl,
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
import { api } from "~/trpc/react";
import { toast } from "~/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";

type EmployeeProps = {
  employeeId: string;
  employeeName: string;
  fatherName: string;
};

const salaryAssignmentSchema = z.object({
  employeeId: z.string().min(1, "Employee selection is required"),
  baseSalary: z.number().min(10000, "Base salary must be at least 10,000 PKR"),
  increment: z.number().min(0, "Increment cannot be negative"),
  sessionId: z.string().min(1, "Session selection is required"),
});

export function SalaryAssignmentForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredEmployees, setFilteredEmployees] = useState<EmployeeProps[]>(
    [],
  );
  const [open, setOpen] = useState(false);

  const form = useForm<z.infer<typeof salaryAssignmentSchema>>({
    resolver: zodResolver(salaryAssignmentSchema),
    defaultValues: {
      baseSalary: 10000,
      increment: 0,
    },
  });

  const { data: employees } = api.employee.getEmployees.useQuery();
  const { data: sessions } = api.session.getSessions.useQuery();

  const assignSalary = api.salary.assignSalary.useMutation({
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Salary assigned successfully",
      });
      form.reset();
      setOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "An error occurred",
      });
    },
    onSettled: () => setIsLoading(false),
  });

  useEffect(() => {
    if (employees) {
      setFilteredEmployees(
        employees.filter(
          (employee) =>
            employee.employeeName
              .toLowerCase()
              .includes(searchTerm.toLowerCase()) ||
            employee.fatherName
              .toLowerCase()
              .includes(searchTerm.toLowerCase()),
        ),
      );
    }
  }, [searchTerm, employees]);

  const onSubmit = (data: z.infer<typeof salaryAssignmentSchema>) => {
    setIsLoading(true);
    assignSalary.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="default" className="ml-auto">
          Assign Salary
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-green-900">
            Assign New Salary
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-6 p-2"
          >
            <FormField
              control={form.control}
              name="employeeId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-green-800">
                    Select Employee
                  </FormLabel>
                  <FormControl>
                    <div>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <SelectTrigger className="hover:bg-green-50">
                          <SelectValue placeholder="Select an employee" />
                        </SelectTrigger>
                        <SelectContent>
                          <Input
                            placeholder="Search employees..."
                            onChange={(e) => setSearchTerm(e.target.value)}
                            onClick={(e) => e.stopPropagation()}
                            className="mb-2"
                          />
                          {filteredEmployees?.map((employee) => (
                            <SelectItem
                              key={employee.employeeId}
                              value={employee.employeeId}
                              className="hover:bg-green-50"
                            >
                              {employee.employeeName} | {employee.fatherName}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="baseSalary"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-green-800">
                      Base Salary (PKR)
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                        className="hover:bg-green-50"
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
                    <FormLabel className="text-green-800">
                      Increment (PKR)
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                        className="hover:bg-green-50"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="sessionId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-green-800">
                    Select Session
                  </FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="hover:bg-green-50">
                        <SelectValue placeholder="Select a session" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {sessions?.map((session) => (
                        <SelectItem
                          key={session.sessionId}
                          value={session.sessionId}
                          className="hover:bg-green-50"
                        >
                          {session.sessionName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-green-800 text-foreground hover:bg-green-900"
            >
              {isLoading ? "Assigning..." : "Assign Salary"}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
