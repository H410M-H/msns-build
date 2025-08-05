"use client";

import { Button } from "~/components/ui/button";
import { api } from "~/trpc/react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "~/components/ui/alert-dialog";
import { ReloadIcon } from "@radix-ui/react-icons";

export const SubjectDeletionDialog = ({
  csId,
  classId,
}: {
  csId: string;
  classId: string;
  sessionId: string;
}) => {
  const utils = api.useUtils();
  const removeSubject = api.subject.removeSubjectFromClass.useMutation({
    onSuccess: async () => {
      await utils.subject.getSubjectsByClass.invalidate({
        classId,
      });
    },
  });

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="destructive" size="sm">
          Remove
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Confirm Removal</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to remove this subject from the class? This
            action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction asChild>
            <Button
              variant="destructive"
              onClick={() => removeSubject.mutate({
                csId,
                sessionId: ""
              })}
              disabled={removeSubject.isPending}
            >
              {removeSubject.isPending ? (
                <>
                  <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />
                  Removing...
                </>
              ) : (
                "Confirm Remove"
              )}
            </Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};