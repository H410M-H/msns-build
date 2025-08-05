import { useState } from 'react';
import { api } from "~/trpc/react";
import { Trash2Icon } from "lucide-react";
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
import { Button } from "~/components/ui/button";

interface SessionDeletionDialogProps {
  sessionIds: string[];
  onSuccess?: () => void;
}

export default function SessionDeletionDialog({ 
  sessionIds, 
  onSuccess 
}: SessionDeletionDialogProps) {
  const [isOpen, setIsOpen] = useState(false);

  const deleteSessions = api.session.deleteSessionsByIds.useMutation({
    onSuccess: () => {
      setIsOpen(false);
      onSuccess?.();
    },
  });

  const handleDelete = () => {
    deleteSessions.mutate({ sessionIds });
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogTrigger asChild>
        <Button 
          variant="destructive" 
          disabled={sessionIds.length === 0}
          className="gap-2"
        >
          <Trash2Icon className="h-4 w-4" />
          Delete Selected ({sessionIds.length})
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
          <AlertDialogDescription>
            {sessionIds.length === 1 
              ? "Are you sure you want to delete this session? This action cannot be undone."
              : `Are you sure you want to delete ${sessionIds.length} sessions? This action cannot be undone.`
            }
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction asChild>
            <Button 
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteSessions.isPending}
            >
              {deleteSessions.isPending ? "Deleting..." : "Delete"}
            </Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}