"use client"

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { Button } from "~/components/ui/button";
import { ExpenseForm, ExpenseFormData } from "~/components/forms/fee/ExpenseForm.tsx";
import { useRouter } from "next/navigation";
import { api } from "~/trpc/react";

export function ExpenseCreationDialog() {
  const router = useRouter();
  const { toast } = useToast();
  const createExpense = api.expenses.createExpense.useMutation({
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
        description: error.message || "Failed to create expense",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (data: ExpenseFormData) => {
    createExpense.mutate(data);
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