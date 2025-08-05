import * as React from "react"
import { Dialog, DialogContent, DialogTitle } from "~/components/ui/dialog"
import { VisuallyHidden } from "@radix-ui/react-visually-hidden"

interface DialogWithTitleProps {
  children: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  title?: string;
}

export function DialogWithTitle({ children, open, onOpenChange, title = "Dialog Content" }: DialogWithTitleProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <VisuallyHidden asChild>
          <DialogTitle>{title}</DialogTitle>
        </VisuallyHidden>
        {children}
      </DialogContent>
    </Dialog>
  )
}

