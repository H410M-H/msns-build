'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "../ui/button";
import { PlusIcon } from "lucide-react";
import { trpc } from "@/trpc/react";
import { useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface SubjectWork {
  subjectId: string;
  work: string;
}

interface CreateDiaryDialogProps {
  classId: string;
  refetch: () => void;
}

export function CreateDiaryDialog({
  classId,
  refetch,
}: CreateDiaryDialogProps) {
  const [diaryDate, setDiaryDate] = useState<string>(
    new Date().toISOString().split("T")[0] || ""
  );
  const [subjectWorks, setSubjectWorks] = useState<SubjectWork[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<string>("");
  const [work, setWork] = useState("");

  const { data: subjects } = trpc.subject.getSubjectsByClass.useQuery({
    classId,
  });
  const createDiary = trpc.subjectDiary.createSubjectDiary.useMutation();
  const router = useRouter();

  const handleAddSubjectWork = () => {
    if (selectedSubject && work) {
      setSubjectWorks([
        ...subjectWorks,
        { subjectId: selectedSubject, work },
      ]);
      setSelectedSubject("");
      setWork("");
    }
  };

  const handleCreateDiary = async () => {
    try {
      await createDiary.mutateAsync({
        classId,
        date: new Date(diaryDate),
        subjects: subjectWorks,
      });
      toast.success("Diary created successfully");
      refetch();
      router.refresh();
    } catch (error) {
      toast.error("Failed to create diary");
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>
          <PlusIcon className="w-4 h-4 mr-2" />
          Create Diary
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Subject Diary</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <input
            type="date"
            value={diaryDate}
            onChange={(e) => setDiaryDate(e.target.value)}
            className="p-2 border rounded"
          />
          <div className="flex gap-2">
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="p-2 border rounded"
            >
              <option value="">Select Subject</option>
              {subjects?.map((subject) => (
                <option key={subject.id} value={subject.id}>
                  {subject.name}
                </option>
              ))}
            </select>
            <input
              type="text"
              value={work}
              onChange={(e) => setWork(e.target.value)}
              placeholder="Work"
              className="p-2 border rounded"
            />
            <Button onClick={handleAddSubjectWork}>Add</Button>
          </div>
          <div>
            <h3>Subject Works:</h3>
            <ul>
              {subjectWorks.map((sw, index) => (
                <li key={index}>
                  {subjects?.find((s) => s.id === sw.subjectId)?.name}: {sw.work}
                </li>
              ))}
            </ul>
          </div>
          <Button onClick={handleCreateDiary} disabled={createDiary.isPending}>
            {createDiary.isPending ? "Creating..." : "Create"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
