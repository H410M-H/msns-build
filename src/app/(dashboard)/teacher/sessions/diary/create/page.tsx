"use client";

import { useState } from "react";
import { api } from "~/trpc/react";
import { Camera as CameraIcon, Upload, CheckCircle2, BookOpen } from "lucide-react";
import { Button } from "~/components/ui/button";

export default function CreateDiaryEntryPage() {
  const [classSubjectId, setClassSubjectId] = useState("");
  const [content, setContent] = useState("");
  const [photoBase64, setPhotoBase64] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const createDiaryMutation = api.subjectDiary.createDiary.useMutation();

  const handleCapture = async () => {
    const { capturePhoto } = await import("~/lib/mobile/native-service");
    const base64 = await capturePhoto();
    if (base64) {
      setPhotoBase64(base64);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!classSubjectId || !content) {
      alert("Please fill out required fields.");
      return;
    }
    setSubmitting(true);
    try {
      await createDiaryMutation.mutateAsync({
        classSubjectId,
        teacherId: "teacher-demo-id",
        date: new Date(),
        content,
        attachments: photoBase64 ? [`data:image/jpeg;base64,${photoBase64}`] : [],
      });
      alert("Class Diary published successfully!");
      setContent("");
      setPhotoBase64(null);
    } catch (err: any) {
      alert(`Failed to create diary: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto p-4 sm:p-6">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <BookOpen className="h-6 w-6 text-emerald-400" /> Create Class Subject Diary
        </h1>
        <p className="text-sm text-slate-400">Post homework tasks & attach blackboard / worksheet photos</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-md">
        <div>
          <label className="text-xs font-semibold text-slate-400 uppercase">Class Subject ID</label>
          <input
            type="text"
            value={classSubjectId}
            onChange={(e) => setClassSubjectId(e.target.value)}
            placeholder="Enter Class Subject ID"
            className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
            required
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-400 uppercase">Homework & Diary Content</label>
          <textarea
            rows={4}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Type today's lesson homework, assignment deadlines, or diary remarks..."
            className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
            required
          />
        </div>

        {/* Camera capture widget (FR-MOB-19) */}
        <div>
          <label className="text-xs font-semibold text-slate-400 uppercase block mb-2">Blackboard / Worksheet Capture</label>
          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={handleCapture}
              className="border-slate-800 bg-slate-950 text-slate-300 hover:bg-slate-800 hover:text-white text-xs font-medium"
            >
              <CameraIcon className="h-4 w-4 mr-1.5 text-emerald-400" /> Snap Photo with Camera
            </Button>

            {photoBase64 && (
              <span className="flex items-center gap-1 text-xs font-semibold text-emerald-400">
                <CheckCircle2 className="h-4 w-4" /> Compressed Attachment Ready
              </span>
            )}
          </div>
        </div>

        <Button
          type="submit"
          disabled={submitting}
          className="w-full bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold py-3 text-sm mt-4 shadow-lg shadow-emerald-600/20"
        >
          <Upload className="h-4 w-4 mr-2" /> Publish Diary Entry
        </Button>
      </form>
    </div>
  );
}
