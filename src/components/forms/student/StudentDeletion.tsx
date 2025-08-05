"use client";

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
import { Button } from "~/components/ui/button";

export const StudentDeletionDialog = ({ studentIds }: { studentIds: string[] }) => {
    const deleteStudents = api.student.deleteStudentsByIds.useMutation({
        onError: (error) => {
            console.error("Error deleting students:", error.message);
            alert("Failed to delete students. Please try again.");
        },
        onSuccess: () => {
            alert("Students deleted successfully.");
        },
    });

    return (
        <AlertDialog>
            <AlertDialogTrigger asChild>
                <Button variant="destructive" disabled={studentIds.length === 0}>
                    Delete selected
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete the selected
                        student(s) and remove their data from our servers.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction asChild>
                        <Button
                            variant="destructive"
                            onClick={() => {
                                if (!studentIds || studentIds.length === 0) {
                                    alert("No students selected for deletion.");
                                    return;
                                }
                                console.log("Deleting students with IDs:", studentIds);
                                deleteStudents.mutate({ studentIds });
                            }}
                            disabled={deleteStudents.isPending}
                        >
                            {deleteStudents.isPending ? "Deleting..." : "Confirm"}
                        </Button>
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
};

