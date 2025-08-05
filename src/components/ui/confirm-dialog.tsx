"use client"

import * as React from "react"
import * as Dialog from "@radix-ui/react-dialog"
import { cn } from "~/lib/utils"
import { Button } from "~/components/ui/button"

interface ConfirmDialogProps {
  title: string;
  description?: string;
  onConfirm: () => void;
  confirmText?: string;
  cancelText?: string;
  children?: React.ReactNode;
}

export const ConfirmDialog = React.forwardRef<
  HTMLButtonElement,
  ConfirmDialogProps
>(({ 
  title, 
  description, 
  onConfirm, 
  confirmText = "Confirm", 
  cancelText = "Cancel", 
  children 
}, ref) => {
  return (
    <Dialog.Root>
      <Dialog.Trigger asChild ref={ref}>
        {children ?? <Button variant="outline">Open</Button>}
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        
        <Dialog.Content className={cn(
          "fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200",
          "rounded-lg sm:rounded-lg",
          "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95"
        )}>
          <Dialog.Title className="text-lg font-semibold">
            {title}
          </Dialog.Title>
          
          {description && (
            <Dialog.Description className="text-sm text-muted-foreground">
              {description}
            </Dialog.Description>
          )}

          <div className="flex justify-end gap-2 mt-4">
            <Dialog.Close asChild>
              <Button variant="outline">
                {cancelText}
              </Button>
            </Dialog.Close>
            
            <Dialog.Close asChild>
              <Button 
                variant="destructive"
                onClick={onConfirm}
              >
                {confirmText}
              </Button>
            </Dialog.Close>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
})

ConfirmDialog.displayName = "ConfirmDialog"