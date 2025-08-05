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
import { api } from "~/trpc/react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { useToast } from "~/hooks/use-toast";

const LEVELS = [
  "PLAYGROUP",
  "NURSERY",
  "PREPARATORY",
  "ONE",
  "TWO",
  "THREE",
  "FOUR",
  "FIVE",
  "SIX",
  "SEVEN",
  "PRE NINE",
  "NINE S",
];
interface FeeCreationDialogProps {
  children: React.ReactNode;
}
export function FeeCreationDialog({}: FeeCreationDialogProps) {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    type: "",
    level: "",
    admissionFee: "5000",
    tuitionFee: "",
    examFund: "4000",
    computerLabFund: "",
    studentIdCardFee: "500",
    infoAndCallsFee: "500",
  });

  const createFee = api.fee.createFee.useMutation({
    onSuccess: () => {
      toast({
        title: "Fee structure created successfully",
        description: "The new fee structure has been added to the system.",
      });
      setOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Error creating fee structure",
        description: error.message,
      });
    },
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = () => {
    const numericData = {
      type: formData.type as "MonthlyFee" | "AnnualFee",
      level: formData.level,
      admissionFee: parseFloat(formData.admissionFee),
      tuitionFee: parseFloat(formData.tuitionFee),
      examFund: parseFloat(formData.examFund),
      computerLabFund: parseFloat(formData.computerLabFund ?? "0"),
      studentIdCardFee: parseFloat(formData.studentIdCardFee),
      infoAndCallsFee: parseFloat(formData.infoAndCallsFee),
    };

    createFee.mutate(numericData);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="default">Create Fee Structure</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Create Fee Structure</DialogTitle>
          <DialogDescription>
            Enter the details for the new fee structure. All amounts in Rs.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="level" className="text-right">
              Level
            </Label>
            <Select
              value={formData.level}
              onValueChange={(value) => handleInputChange("level", value)}
            >
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select class level" />
              </SelectTrigger>
              <SelectContent>
                {LEVELS.map((level) => (
                  <SelectItem key={level} value={level}>
                    {level}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="admissionFee" className="text-right">
              Admission Fee
            </Label>
            <Input
              id="admissionFee"
              type="number"
              value={formData.admissionFee}
              onChange={(e) => handleInputChange("admissionFee", e.target.value)}
              className="col-span-3"
              placeholder="Enter admission fee"
            />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="tuitionFee" className="text-right">
              Tuition Fee
            </Label>
            <Input
              id="tuitionFee"
              type="number"
              value={formData.tuitionFee}
              onChange={(e) => handleInputChange("tuitionFee", e.target.value)}
              className="col-span-3"
              placeholder="Enter monthly tuition fee"
            />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="examFund" className="text-right">
              Exam Fund
            </Label>
            <Input
              id="examFund"
              type="number"
              value={formData.examFund}
              onChange={(e) => handleInputChange("examFund", e.target.value)}
              className="col-span-3"
              placeholder="Enter annual exam fund"
            />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="computerLabFund" className="text-right">
              Computer Lab Fund
            </Label>
            <Input
              id="computerLabFund"
              type="number"
              value={formData.computerLabFund}
              onChange={(e) => handleInputChange("computerLabFund", e.target.value)}
              className="col-span-3"
              placeholder="Enter annual computer lab fund (optional)"
            />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="studentIdCardFee" className="text-right">
              ID Card Fee
            </Label>
            <Input
              id="studentIdCardFee"
              type="number"
              value={formData.studentIdCardFee}
              onChange={(e) => handleInputChange("studentIdCardFee", e.target.value)}
              className="col-span-3"
              placeholder="Enter student ID card fee"
            />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="infoAndCallsFee" className="text-right">
              Info & Calls Fee
            </Label>
            <Input
              id="infoAndCallsFee"
              type="number"
              value={formData.infoAndCallsFee}
              onChange={(e) => handleInputChange("infoAndCallsFee", e.target.value)}
              className="col-span-3"
              placeholder="Enter info and calls fee"
            />
          </div>
        </div>
        <DialogFooter>
          <Button 
            type="submit" 
            onClick={handleSubmit}
            disabled={createFee.isPending}
          >
            {createFee.isPending ? "Creating..." : "Create Fee Structure"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

