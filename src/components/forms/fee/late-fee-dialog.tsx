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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Badge } from "~/components/ui/badge";
import { useToast } from "~/hooks/use-toast";
import { api } from "~/trpc/react";
import { Clock, Calculator, AlertTriangle } from "lucide-react";
import { cn } from "~/lib/utils";

interface LateFeeDialogProps {
  sfcId: string;
  studentName: string;
  currentLateFee: number;
  baseFee: number;
  dueDate: Date;
  onUpdate: () => void;
}

const lateFeePresets = [
  { label: "5%", value: 5, type: "percent" },
  { label: "10%", value: 10, type: "percent" },
  { label: "15%", value: 15, type: "percent" },
  { label: "Rs. 100", value: 100, type: "fixed" },
  { label: "Rs. 200", value: 200, type: "fixed" },
  { label: "Rs. 500", value: 500, type: "fixed" },
];

export function LateFeeDialog({
  sfcId,
  studentName,
  currentLateFee,
  baseFee,
  dueDate,
  onUpdate,
}: LateFeeDialogProps) {
  const [open, setOpen] = useState(false);
  const [lateFeeType, setLateFeeType] = useState<"percent" | "fixed">(
    "percent",
  );
  const [lateFeeValue, setLateFeeValue] = useState("");
  const { toast } = useToast();

  const applyLateFee = api.fee.applyLateFee.useMutation({
    onSuccess: () => {
      toast({
        title: "Late fee applied",
        description: `Late fee has been applied to ${studentName}'s account.`,
      });
      setOpen(false);
      onUpdate();
    },
    onError: (error) => {
      toast({
        title: "Error applying late fee",
        description: error.message,
      });
    },
  });

  const calculateLateFee = (): number => {
    const value = Number.parseFloat(lateFeeValue) || 0;
    if (lateFeeType === "percent") {
      return Math.round((baseFee * value) / 100);
    }
    return value;
  };

  const calculatedFee = calculateLateFee();

  const handleApply = () => {
    applyLateFee.mutate({
      sfcId,
      lateFeeAmount: calculatedFee,
    });
  };

  const handlePresetClick = (preset: (typeof lateFeePresets)[0]) => {
    setLateFeeType(preset.type as "percent" | "fixed");
    setLateFeeValue(String(preset.value));
  };

  const daysOverdue = Math.floor(
    (new Date().getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24),
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="gap-1 text-orange-600 hover:bg-orange-50 hover:text-orange-700"
        >
          <Clock className="h-4 w-4" />
          Late Fee
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-500" />
            Apply Late Fee
          </DialogTitle>
          <DialogDescription>
            Apply a late fee charge for overdue payment.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Student Info */}
          <div className="rounded-lg bg-slate-50 p-3">
            <p className="font-medium text-slate-900">{studentName}</p>
            <div className="mt-2 flex items-center gap-3 text-sm">
              <span className="text-slate-600">
                Base Fee: Rs. {baseFee.toLocaleString()}
              </span>
              {daysOverdue > 0 && (
                <Badge variant="destructive" className="text-xs">
                  {daysOverdue} days overdue
                </Badge>
              )}
            </div>
            {currentLateFee > 0 && (
              <p className="mt-2 text-sm text-orange-600">
                Current Late Fee: Rs. {currentLateFee.toLocaleString()}
              </p>
            )}
          </div>

          {/* Quick Presets */}
          <div>
            <Label className="mb-2 block text-sm text-slate-600">
              Quick Select
            </Label>
            <div className="grid grid-cols-3 gap-2">
              {lateFeePresets.map((preset) => (
                <Button
                  key={preset.label}
                  variant="outline"
                  size="sm"
                  onClick={() => handlePresetClick(preset)}
                  className={cn(
                    "transition-all",
                    lateFeeType === preset.type &&
                      Number(lateFeeValue) === preset.value
                      ? "border-orange-300 bg-orange-100 text-orange-700"
                      : "",
                  )}
                >
                  {preset.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Custom Input */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Type</Label>
              <Select
                value={lateFeeType}
                onValueChange={(v) => setLateFeeType(v as "percent" | "fixed")}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="percent">Percentage (%)</SelectItem>
                  <SelectItem value="fixed">Fixed Amount (Rs.)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Value</Label>
              <Input
                type="number"
                value={lateFeeValue}
                onChange={(e) => setLateFeeValue(e.target.value)}
                placeholder={
                  lateFeeType === "percent" ? "e.g., 10" : "e.g., 500"
                }
              />
            </div>
          </div>

          {/* Calculated Amount */}
          {calculatedFee > 0 && (
            <div className="rounded-lg border border-orange-200 bg-orange-50 p-4">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 font-medium text-orange-700">
                  <Calculator className="h-4 w-4" />
                  Late Fee Amount
                </span>
                <span className="text-xl font-bold text-orange-700">
                  Rs. {calculatedFee.toLocaleString()}
                </span>
              </div>
              <p className="mt-2 text-xs text-orange-600">
                New Total: Rs. {(baseFee + calculatedFee).toLocaleString()}
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleApply}
            disabled={calculatedFee <= 0 || applyLateFee.isPending}
            className="bg-orange-600 hover:bg-orange-700"
          >
            {applyLateFee.isPending ? "Applying..." : "Apply Late Fee"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
