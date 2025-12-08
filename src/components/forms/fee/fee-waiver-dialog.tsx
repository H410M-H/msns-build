"use client"

import { useState } from "react"
import { Button } from "~/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog"
import { Input } from "~/components/ui/input"
import { Label } from "~/components/ui/label"
import { Textarea } from "~/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select"
import { Badge } from "~/components/ui/badge"
import { useToast } from "~/hooks/use-toast"
import { api } from "~/trpc/react"
import { Award, Percent } from "lucide-react"
import { cn } from "~/lib/utils"

interface FeeWaiverDialogProps {
  sfcId: string
  studentName: string
  baseFee: number
  currentDiscount: number
  currentDiscountPercent: number
  currentDescription: string
  onUpdate: () => void
}

const waiverReasons = [
  { value: "scholarship", label: "Scholarship" },
  { value: "sibling", label: "Sibling Discount" },
  { value: "staff_child", label: "Staff Child" },
  { value: "financial_hardship", label: "Financial Hardship" },
  { value: "merit_based", label: "Merit Based" },
  { value: "sports_quota", label: "Sports Quota" },
  { value: "orphan", label: "Orphan/Special Case" },
  { value: "other", label: "Other" },
]

const discountPresets = [
  { label: "10%", value: 10 },
  { label: "25%", value: 25 },
  { label: "50%", value: 50 },
  { label: "75%", value: 75 },
  { label: "100%", value: 100 },
]

export function FeeWaiverDialog({
  sfcId,
  studentName,
  baseFee,
  currentDiscount,
  currentDiscountPercent,
  currentDescription,
  onUpdate,
}: FeeWaiverDialogProps) {
  const [open, setOpen] = useState(false)
  const [waiverType, setWaiverType] = useState<"percent" | "fixed">("percent")
  const [waiverValue, setWaiverValue] = useState(String(currentDiscountPercent || ""))
  const [reason, setReason] = useState(currentDescription || "")
  const [selectedReason, setSelectedReason] = useState("")
  const { toast } = useToast()

  const updateWaiver = api.fee.updateFeePayment.useMutation({
    onSuccess: () => {
      toast({
        title: "Fee waiver applied",
        description: `Waiver has been applied to ${studentName}'s account.`,
      })
      setOpen(false)
      onUpdate()
    },
    onError: (error) => {
      toast({
        title: "Error applying waiver",
        description: error.message,
      })
    },
  })

  const calculateWaiver = (): { discount: number; discountPercent: number } => {
    const value = Number.parseFloat(waiverValue) || 0
    if (waiverType === "percent") {
      return {
        discount: Math.round((baseFee * value) / 100),
        discountPercent: value,
      }
    }
    return {
      discount: value,
      discountPercent: 0,
    }
  }

  const { discount, discountPercent } = calculateWaiver()

  const handleApply = () => {
    const description = selectedReason
      ? `${waiverReasons.find((r) => r.value === selectedReason)?.label}${reason ? `: ${reason}` : ""}`
      : reason

    updateWaiver.mutate({
      feeStudentClassId: sfcId, // Changed from sfcId to feeStudentClassId
      discount: waiverType === "fixed" ? discount : 0,
      discountbypercent: waiverType === "percent" ? discountPercent : 0,
      discountDescription: description,
    })
  }

  const handleRemoveWaiver = () => {
    updateWaiver.mutate({
      feeStudentClassId: sfcId, // Changed from sfcId to feeStudentClassId
      discount: 0,
      discountbypercent: 0,
      discountDescription: "",
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-1 text-purple-600 hover:text-purple-700 hover:bg-purple-50">
          <Award className="h-4 w-4" />
          Waiver
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Award className="h-5 w-5 text-purple-500" />
            Fee Waiver / Scholarship
          </DialogTitle>
          <DialogDescription>Apply a discount or scholarship to reduce the fee amount.</DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Student Info */}
          <div className="p-3 bg-slate-50 rounded-lg">
            <p className="font-medium text-slate-900">{studentName}</p>
            <div className="flex items-center gap-3 mt-2 text-sm">
              <span className="text-slate-600">Base Fee: Rs. {baseFee.toLocaleString()}</span>
              {(currentDiscount > 0 || currentDiscountPercent > 0) && (
                <Badge className="bg-purple-100 text-purple-700">
                  Current: {currentDiscountPercent > 0 ? `${currentDiscountPercent}%` : `Rs. ${currentDiscount}`}
                </Badge>
              )}
            </div>
            {currentDescription && <p className="text-xs text-purple-600 mt-2">Reason: {currentDescription}</p>}
          </div>

          {/* Waiver Reason */}
          <div>
            <Label>Waiver Reason</Label>
            <Select value={selectedReason} onValueChange={setSelectedReason}>
              <SelectTrigger>
                <SelectValue placeholder="Select reason" />
              </SelectTrigger>
              <SelectContent>
                {waiverReasons.map((r) => (
                  <SelectItem key={r.value} value={r.value}>
                    {r.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Quick Presets */}
          <div>
            <Label className="text-sm text-slate-600 mb-2 block">Quick Select Percentage</Label>
            <div className="flex flex-wrap gap-2">
              {discountPresets.map((preset) => (
                <Button
                  key={preset.value}
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setWaiverType("percent")
                    setWaiverValue(String(preset.value))
                  }}
                  className={cn(
                    "transition-all",
                    waiverType === "percent" && Number(waiverValue) === preset.value
                      ? "bg-purple-100 border-purple-300 text-purple-700"
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
              <Select value={waiverType} onValueChange={(v) => setWaiverType(v as "percent" | "fixed")}>
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
                value={waiverValue}
                onChange={(e) => setWaiverValue(e.target.value)}
                placeholder={waiverType === "percent" ? "e.g., 25" : "e.g., 1000"}
                max={waiverType === "percent" ? 100 : undefined}
              />
            </div>
          </div>

          {/* Additional Notes */}
          <div>
            <Label>Additional Notes (Optional)</Label>
            <Textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Any additional details about this waiver..."
              rows={2}
            />
          </div>

          {/* Calculated Amount */}
          {discount > 0 && (
            <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
              <div className="flex items-center justify-between">
                <span className="text-purple-700 font-medium flex items-center gap-2">
                  <Percent className="h-4 w-4" />
                  Waiver Amount
                </span>
                <span className="text-xl font-bold text-purple-700">Rs. {discount.toLocaleString()}</span>
              </div>
              <p className="text-xs text-purple-600 mt-2">
                Final Fee: Rs. {Math.max(baseFee - discount, 0).toLocaleString()}
              </p>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2">
          {(currentDiscount > 0 || currentDiscountPercent > 0) && (
            <Button variant="destructive" onClick={handleRemoveWaiver} disabled={updateWaiver.isPending}>
              Remove Waiver
            </Button>
          )}
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleApply}
            disabled={discount <= 0 || updateWaiver.isPending}
            className="bg-purple-600 hover:bg-purple-700"
          >
            {updateWaiver.isPending ? "Applying..." : "Apply Waiver"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}