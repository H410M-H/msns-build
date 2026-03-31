"use client";

import { useState } from "react";
import { Button } from "~/components/ui/button";
import { Textarea } from "~/components/ui/textarea";
import { Loader2, Plus } from "lucide-react";
import { api } from "~/trpc/react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";

export function ClassDiaryForm({ classSubjectId, teacherId }: { classSubjectId: string, teacherId: string }) {
  const [open, setOpen] = useState(false);
  const [content, setContent] = useState("");
  const utils = api.useUtils();

  const createDiary = api.subjectDiary.createDiary.useMutation({
    onSuccess: () => {
      setOpen(false);
      setContent("");
      void utils.subjectDiary.getClassDiaries.invalidate();
      void utils.subjectDiary.getTeacherDiaries.invalidate();
    }
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm">
          <Plus className="h-4 w-4" /> Add Diary
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Subject Diary</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Content / Homework</label>
            <Textarea 
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write the diary content here..."
              rows={5}
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button 
              onClick={() => createDiary.mutate({
                classSubjectId,
                teacherId,
                date: new Date(),
                content
              })}
              disabled={!content.trim() || createDiary.isPending}
            >
              {createDiary.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Save Diary
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
