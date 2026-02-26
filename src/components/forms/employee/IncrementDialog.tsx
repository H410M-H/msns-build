"use client";

import { useState } from "react";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { Textarea } from "~/components/ui/textarea";
import { api } from "~/trpc/react";
import { toast } from "~/hooks/use-toast";
import { TrendingUp } from "lucide-react";

const incrementSchema = z.object({
  employeeId: z.string().min(1, "Required"),
  incrementAmount: z.number().positive("Must be positive"),
  reason: z.string().min(1, "Reason required"),
  effectiveDate: z.string(),
});

export function IncrementDialog() {
  const [open, setOpen] = useState(false);
  const utils = api.useUtils();
  const { data: employees } = api.employee.getEmployees.useQuery();

  const form = useForm<z.infer<typeof incrementSchema>>({
    resolver: zodResolver(incrementSchema),
    defaultValues: { effectiveDate: new Date().toISOString().split("T")[0] },
  });

  const incrementMutation = api.salary.addSalaryIncrement.useMutation({
    onSuccess: () => {
      toast({
        title: "Increment Added",
        description: "Employee salary updated.",
      });
      void utils.salary.getAll.invalidate();
      setOpen(false);
      form.reset();
    },
  });

  const onSubmit = (data: z.infer<typeof incrementSchema>) => {
    incrementMutation.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <TrendingUp className="h-4 w-4" /> Add Increment
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Salary Increment</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="employeeId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Employee</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select employee" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {employees?.map((e) => (
                        <SelectItem key={e.employeeId} value={e.employeeId}>
                          {e.employeeName}
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
              name="incrementAmount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount (PKR)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="effectiveDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Effective Date</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Reason</FormLabel>
                  <FormControl>
                    <Textarea {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              type="submit"
              className="w-full"
              disabled={incrementMutation.isPending}
            >
              {incrementMutation.isPending ? "Saving..." : "Apply Increment"}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
