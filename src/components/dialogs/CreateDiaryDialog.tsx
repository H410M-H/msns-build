'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { Button } from "~/components/ui/button";
import { PlusIcon } from "lucide-react";
import { api } from "~/trpc/react";
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

// Define the shape of the subject data
interface Subject {
  id: string;
  teacherId: string | null;
  Subject: {
    subjectName: string;
  };
}

export function CreateDiaryDialog({
  classId,
  refetch,
}: CreateDiaryDialogProps) {
  const [diaryDate, setDiaryDate] = useState<string>(
    new Date().toISOString().split("T")[0] ?? ""
  );
  const [subjectWorks, setSubjectWorks] = useState<SubjectWork[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<string>("");
  const [work, setWork] = useState("");

  const { data: subjectsData } = api.subject.getSubjectsByClass.useQuery({
    classId,
  });
  // Cast the data to the defined interface
  const subjects = subjectsData as Subject[] | undefined;

  const createDiary = api.subjectDiary.createDiary.useMutation();
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
      if (subjectWorks.length === 0) {
        toast.info("Please add at least one subject work.");
        return;
      }
      if (!subjects) {
        toast.error("Subjects are not loaded yet.");
        return;
      }

      await Promise.all(
        subjectWorks.map((sw) => {
          const subject = subjects.find((s) => s.id === sw.subjectId);
          if (!subject) {
            throw new Error(`Could not find subject with id ${sw.subjectId}`);
          }
          if (!subject.teacherId) {
            throw new Error(`Could not find a teacher for the subject.`);
          }
          
          return createDiary.mutateAsync({
            classSubjectId: sw.subjectId,
            teacherId: subject.teacherId,
            date: new Date(diaryDate),
            content: sw.work,
          });
        })
      );

      toast.success("Diary created successfully");
      setSubjectWorks([]);
      refetch();
      router.refresh();
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("An unknown error occurred while creating the diary.");
      }
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
                  {subject.Subject.subjectName}
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
              {subjectWorks.map((sw, index) => {
                const subjectName = subjects?.find(s => s.id === sw.subjectId)?.Subject.subjectName;
                return (
                  <li key={index}>
                    {subjectName}: {sw.work}
                  </li>
                );
              })}
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
