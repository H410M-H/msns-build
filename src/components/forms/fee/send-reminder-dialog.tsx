"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "~/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "~/components/ui/dialog"
import { Textarea } from "~/components/ui/textarea"
import { Label } from "~/components/ui/label"
import { RadioGroup, RadioGroupItem } from "~/components/ui/radio-group"
import { Send, MessageSquare, Mail, Loader2, CheckCircle } from "lucide-react"
import { toast } from "sonner"

interface SendReminderDialogProps {
  studentName: string
  fatherMobile?: string
  dueAmount: number
  month: number
  year: number
  trigger?: React.ReactNode
}

const monthNames = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
]

export function SendReminderDialog({
  studentName,
  fatherMobile,
  dueAmount,
  month,
  year,
  trigger,
}: SendReminderDialogProps) {
  const [open, setOpen] = useState(false)
  const [method, setMethod] = useState<"sms" | "whatsapp">("sms")
  const [isSending, setIsSending] = useState(false)
  const [sent, setSent] = useState(false)

  const defaultMessage = `Dear Parent,

This is a reminder that the fee payment of Rs. ${dueAmount.toLocaleString()} for ${studentName} for the month of ${monthNames[month - 1]} ${year} is pending.

Please clear the dues at your earliest convenience.

Thank you,
School Administration`

  const [message, setMessage] = useState(defaultMessage)

  const handleSend = async () => {
    if (!fatherMobile) {
      toast.error("No contact number available")
      return
    }

    setIsSending(true)
    await new Promise((resolve) => setTimeout(resolve, 1500))

    setIsSending(false)
    setSent(true)
    toast.success(`Reminder sent via ${method === "sms" ? "SMS" : "WhatsApp"}`)

    setTimeout(() => {
      setOpen(false)
      setSent(false)
    }, 1500)
  }

  const handleWhatsAppOpen = () => {
    if (!fatherMobile) {
      toast.error("No contact number available")
      return
    }

    const encodedMessage = encodeURIComponent(message)
    const phone = fatherMobile.replace(/\D/g, "")
    window.open(`https://wa.me/${phone}?text=${encodedMessage}`, "_blank")
    toast.success("Opening WhatsApp...")
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button variant="ghost" size="sm" className="gap-1 text-orange-600 hover:text-orange-700 hover:bg-orange-50">
            <Send className="h-3 w-3" />
            Remind
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Send Payment Reminder
          </DialogTitle>
          <DialogDescription>
            Send a reminder to the parent of {studentName} for pending fee of Rs. {dueAmount.toLocaleString()}
          </DialogDescription>
        </DialogHeader>

        {sent ? (
          <div className="py-8 text-center">
            <CheckCircle className="h-12 w-12 text-emerald-500 mx-auto mb-3" />
            <p className="text-lg font-medium text-slate-900">Reminder Sent!</p>
            <p className="text-slate-600 text-sm mt-1">The reminder has been sent to {fatherMobile}</p>
          </div>
        ) : (
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Send via</Label>
              <RadioGroup
                value={method}
                onValueChange={(v) => setMethod(v as "sms" | "whatsapp")}
                className="flex gap-4"
              >
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="sms" id="sms" />
                  <Label htmlFor="sms" className="flex items-center gap-1 cursor-pointer">
                    <Mail className="h-4 w-4" />
                    SMS
                  </Label>
                </div>
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="whatsapp" id="whatsapp" />
                  <Label htmlFor="whatsapp" className="flex items-center gap-1 cursor-pointer">
                    <MessageSquare className="h-4 w-4" />
                    WhatsApp
                  </Label>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-2">
              <Label>Contact Number</Label>
              <p className="text-sm font-medium text-slate-900">{fatherMobile ?? "Not available"}</p>
            </div>

            <div className="space-y-2">
              <Label>Message</Label>
              <Textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={6} className="resize-none" />
            </div>
          </div>
        )}

        {!sent && (
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            {method === "whatsapp" ? (
              <Button onClick={handleWhatsAppOpen} className="gap-2 bg-emerald-600 hover:bg-emerald-700">
                <MessageSquare className="h-4 w-4" />
                Open WhatsApp
              </Button>
            ) : (
              <Button onClick={handleSend} disabled={isSending || !fatherMobile} className="gap-2">
                {isSending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    Send SMS
                  </>
                )}
              </Button>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
