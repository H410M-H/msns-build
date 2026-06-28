import { useState } from "react";
import { api } from "~/trpc/react";
import { Trash2Icon } from "lucide-react";
import { useToast } from "~/hooks/use-toast";
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
  onSuccess,
}: SessionDeletionDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();
  const utils = api.useUtils();

  const deleteSessions = api.session.deleteSessionsByIds.useMutation({
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Sessions deleted successfully.",
      });
      setIsOpen(false);
      onSuccess?.();
      void utils.session.getSessions.invalidate();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete sessions",
        variant: "destructive",
      });
    },
  });

  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault();
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
              : `Are you sure you want to delete ${sessionIds.length} sessions? This action cannot be undone.`}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={deleteSessions.isPending}>Cancel</AlertDialogCancel>
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
