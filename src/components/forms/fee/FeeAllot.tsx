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
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { useToast } from "~/hooks/use-toast";
import { api } from "~/trpc/react";

type FeeAllotmentDialogProps = {
  sfcId: string;
  studentClassId: string;
  feeId: string;

  initialDiscount: number;
  initialDiscountPercent: number;
  initialDiscountDescription: string;
  onUpdate: () => void;
  onRemove: () => void;
};

export default function FeeAllotmentDialog({
  sfcId,
  initialDiscount = 0,
  initialDiscountPercent = 0,
  initialDiscountDescription = "",
  onUpdate,
  onRemove,
}: FeeAllotmentDialogProps) {
  const [open, setOpen] = useState(false);
  const [discount, setDiscount] = useState(initialDiscount.toString());
  const [discountbypercent, setDiscountbypercent] = useState(
    initialDiscountPercent.toString(),
  );
  const [discountDescription, setDiscountDescription] = useState(
    initialDiscountDescription,
  );

  const { toast } = useToast();

  const updateFeeAssignment = api.fee.updateFeePayment.useMutation({
    onSuccess: () => {
      toast({
        title: "Fee assignment updated successfully",
        description: "The fee assignment has been updated.",
      });
      setOpen(false);
      onUpdate();
    },
    onError: (error) => {
      toast({
        title: "Error updating fee assignment",
        description: error.message,
      });
    },
  });

  const removeFeeAssignment = api.fee.removeFeeAssignment.useMutation({
    onSuccess: () => {
      toast({
        title: "Fee assignment removed successfully",
        description: "The fee assignment has been removed.",
      });
      setOpen(false);
      onRemove();
    },
    onError: (error: { message?: string }) => {
      toast({
        title: "Error removing fee assignment",
        description: error.message ?? "Unknown error occurred",
      });
    },
  });

  const handleSubmit = () => {
    updateFeeAssignment.mutate({
      feeStudentClassId: sfcId,
      discount: parseFloat(discount),
      discountbypercent: parseFloat(discountbypercent),
      discountDescription: discountDescription,
    });
  };

  const handleRemove = () => {
    removeFeeAssignment.mutate({ feeStudentClassId: sfcId });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Edit Fee Assignment</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Fee Assignment</DialogTitle>
          <DialogDescription>
            Modify the fee assignment details or remove the assignment.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="discount" className="text-right">
              Discount
            </Label>
            <Input
              id="discount"
              type="number"
              value={discount}
              onChange={(e) => setDiscount(e.target.value)}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="discountbypercent" className="text-right">
              Discount %
            </Label>
            <Input
              id="discountbypercent"
              type="number"
              value={discountbypercent}
              onChange={(e) => setDiscountbypercent(e.target.value)}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="discountDescription" className="text-right">
              Description
            </Label>
            <Input
              id="discountDescription"
              value={discountDescription}
              onChange={(e) => setDiscountDescription(e.target.value)}
              className="col-span-3"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="destructive" onClick={handleRemove}>
            Remove Assignment
          </Button>
          <Button type="submit" onClick={handleSubmit}>
            Update Assignment
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
