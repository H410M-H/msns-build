"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { Button } from "~/components/ui/button";
import { useRouter } from "next/navigation";
import { api } from "~/trpc/react";
import { useToast } from "~/hooks/use-toast";
import {
  ExpenseForm,
  type ExpenseFormData,
} from "~/components/forms/fee/ExpenseForm";

export function ExpenseCreationDialog() {
  const router = useRouter();
  const { toast } = useToast();
  // Ensure api.expense.createExpense is not of type error
  // If your trpc client is typed correctly, this should not be an error type.
  // If it is, check your trpc client import and types.

  const createExpense = (
    api.expense.createExpense as {
      useMutation: typeof api.expense.createExpense.useMutation;
    }
  ).useMutation({
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Expense created successfully",
      });
      router.refresh();
    },
    onError: (error: unknown) => {
      let message = "Failed to create expense";
      if (
        typeof error === "object" &&
        error !== null &&
        "message" in error &&
        typeof (error as { message?: string }).message === "string"
      ) {
        message = (error as { message: string }).message;
      }
      toast({
        title: "Error",
        description: message,
      });
    },
  });

  const handleSubmit = (data: ExpenseFormData) => {
    createExpense.mutate({
      ...data,
      category: data.category as
        | "OTHER"
        | "BISE"
        | "UTILITIES"
        | "SUPPLIES"
        | "MAINTENANCE"
        | "SALARIES"
        | "TRANSPORT"
        | "FOOD"
        | "EQUIPMENT",
    });
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Create Expense</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Expense</DialogTitle>
        </DialogHeader>
        <ExpenseForm
          onSubmit={handleSubmit}
          isLoading={createExpense.isPending}
        />
      </DialogContent>
    </Dialog>
  );
}
