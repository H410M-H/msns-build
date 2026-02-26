"use client";

import { useCallback, useState } from "react";
import { useDropzone, type Accept } from "react-dropzone";
import { Button } from "~/components/ui/button";
import { Progress } from "~/components/ui/progress";
import { FileText, File, X } from "lucide-react";

interface BookUploaderProps {
  onUploadSuccess: (fileUrl: string) => void;
  onRemove: () => void;
  initialFile?: string;
}

interface CloudinaryUploadResponse {
  secure_url: string;
  error?: {
    message?: string;
  };
}

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const ACCEPTED_FILE_TYPES: Accept = {
  "application/pdf": [".pdf"],
  "application/msword": [".doc"],
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [
    ".docx",
  ],
  "application/vnd.ms-powerpoint": [".ppt"],
  "application/vnd.openxmlformats-officedocument.presentationml.presentation": [
    ".pptx",
  ],
};

export const BookUploader = ({
  onUploadSuccess,
  onRemove,
  initialFile,
}: BookUploaderProps) => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(
    initialFile ?? null,
  );

  const handleUpload = useCallback(
    async (fileToUpload: File) => {
      try {
        setUploading(true);
        setProgress(0);

        const formData = new FormData();
        formData.append("file", fileToUpload);
        formData.append(
          "upload_preset",
          process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!,
        );

        const response = await fetch(
          `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/upload`,
          {
            method: "POST",
            body: formData,
          },
        );

        const data = (await response.json()) as CloudinaryUploadResponse;

        if (!response.ok) {
          throw new Error(data.error?.message ?? "Upload failed");
        }

        setPreviewUrl(data.secure_url);
        onUploadSuccess(data.secure_url);
        setProgress(100);
      } catch (err) {
        console.error("Upload failed:", err);

        let errorMessage = "File upload failed. Please try again.";
        if (err instanceof Error) {
          errorMessage = err.message;
        } else if (
          typeof err === "object" &&
          err !== null &&
          "message" in err
        ) {
          errorMessage = String(err.message);
        }

        setError(errorMessage);
      } finally {
        setUploading(false);
      }
    },
    [onUploadSuccess],
  );

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const handleFile = async () => {
        try {
          const selectedFile = acceptedFiles[0];
          if (!selectedFile) return;

          if (selectedFile.size > MAX_FILE_SIZE) {
            setError("File size exceeds 10MB limit");
            return;
          }

          setFile(selectedFile);
          setError(null);
          await handleUpload(selectedFile);
        } catch (err) {
          console.error("Upload error:", err);

          let errorMessage = "Failed to process file upload";
          if (err instanceof Error) {
            errorMessage = err.message;
          } else if (
            typeof err === "object" &&
            err !== null &&
            "message" in err
          ) {
            errorMessage = String(err.message);
          }

          setError(errorMessage);
        }
      };

      void handleFile();
    },
    [handleUpload],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ACCEPTED_FILE_TYPES,
    multiple: false,
    maxSize: MAX_FILE_SIZE,
  });

  const removeFile = () => {
    setFile(null);
    setPreviewUrl(null);
    onUploadSuccess("");
    onRemove();
  };

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={`cursor-pointer rounded-lg border-2 border-dashed p-8 text-center transition-colors ${isDragActive ? "border-blue-500 bg-blue-50" : "border-gray-300 hover:border-gray-400"} ${error ? "border-red-500 bg-red-50" : ""}`}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center gap-4">
          <File className="h-8 w-8 text-gray-500" />
          <div>
            <p className="font-medium">
              {isDragActive ? "Drop here" : "Drag & drop or click to upload"}
            </p>
            <p className="mt-1 text-sm text-gray-500">
              Supported formats: PDF, DOC, DOCX, PPT, PPTX (max 10MB)
            </p>
          </div>
          {file && (
            <div className="mt-4 flex items-center gap-2">
              <FileText className="h-4 w-4" />
              <span className="text-sm">{file.name}</span>
            </div>
          )}
        </div>
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      {uploading && (
        <div className="space-y-2">
          <Progress value={progress} className="h-2" />
          <p className="text-sm text-gray-500">Uploading... {progress}%</p>
        </div>
      )}

      {previewUrl && (
        <div className="flex items-center justify-between rounded-lg border p-4">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            <a
              href={previewUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              View Uploaded File
            </a>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={removeFile}
            disabled={uploading}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
};
