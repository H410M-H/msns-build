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
import {
  ExpenseForm,
  type ExpenseFormData,
} from "~/components/forms/fee/ExpenseForm";
import { useToast } from "~/hooks/use-toast";

export function ExpenseCreationDialog() {
  const router = useRouter();
  const { toast } = useToast();
  const createExpense = api.expense.createExpense.useMutation({
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Expense created successfully",
      });
      router.refresh();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message ?? "Failed to create expense",
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
