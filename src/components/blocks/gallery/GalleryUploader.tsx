"use client";

import { useState, useCallback, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import Image from "next/image";
import {
  Upload,
  Trash2,
  ImagePlus,
  Loader2,
  Images,
} from "lucide-react";
import { Button } from "~/components/ui/button";
import { Progress } from "~/components/ui/progress";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
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
import { toast } from "sonner";

interface GalleryImage {
  key: string;
  url: string;
  lastModified?: string;
  size?: number;
}

interface UploadResponse {
  key: string;
  url: string;
  filename: string;
  size: number;
  contentType: string;
  error?: string;
}

interface GalleryListResponse {
  images: GalleryImage[];
  error?: string;
}

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ACCEPTED_TYPES = {
  "image/jpeg": [".jpg", ".jpeg"],
  "image/png": [".png"],
  "image/webp": [".webp"],
  "image/gif": [".gif"],
  "image/avif": [".avif"],
};

interface GalleryUploaderProps {
  canDelete?: boolean;
}

export default function GalleryUploader({
  canDelete = true,
}: GalleryUploaderProps) {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadingFiles, setUploadingFiles] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);

  const fetchImages = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/gallery");
      if (!res.ok) throw new Error("Failed to fetch");
      const data = (await res.json()) as GalleryListResponse;
      setImages(data.images ?? []);
    } catch {
      toast.error("Failed to load gallery images");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchImages();
  }, [fetchImages]);

  const handleUpload = useCallback(
    async (files: File[]) => {
      setUploading(true);
      setUploadProgress(0);
      setUploadingFiles(files.map((f) => f.name));

      let completed = 0;
      const total = files.length;

      for (const file of files) {
        try {
          const formData = new FormData();
          formData.append("file", file);

          const res = await fetch("/api/gallery/upload", {
            method: "POST",
            body: formData,
          });

          const data = (await res.json()) as UploadResponse;

          if (!res.ok) {
            toast.error(`Failed to upload ${file.name}: ${data.error}`);
            continue;
          }

          toast.success(`Uploaded ${file.name}`);
          completed++;
          setUploadProgress(Math.round((completed / total) * 100));
        } catch {
          toast.error(`Failed to upload ${file.name}`);
        }
      }

      setUploading(false);
      setUploadingFiles([]);
      setUploadProgress(0);
      await fetchImages();
    },
    [fetchImages]
  );

  const handleDelete = useCallback(
    async (key: string) => {
      try {
        setDeleting(key);
        const res = await fetch(`/api/gallery/${key}`, {
          method: "DELETE",
        });

        if (!res.ok) {
          const data = (await res.json()) as { error: string };
          toast.error(data.error ?? "Failed to delete image");
          return;
        }

        toast.success("Image deleted successfully");
        setImages((prev) => prev.filter((img) => img.key !== key));
      } catch {
        toast.error("Failed to delete image");
      } finally {
        setDeleting(null);
      }
    },
    []
  );

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const validFiles = acceptedFiles.filter((file) => {
        if (file.size > MAX_FILE_SIZE) {
          toast.error(`${file.name} exceeds 10MB limit`);
          return false;
        }
        return true;
      });

      if (validFiles.length > 0) {
        void handleUpload(validFiles);
      }
    },
    [handleUpload]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ACCEPTED_TYPES,
    multiple: true,
    maxSize: MAX_FILE_SIZE,
    disabled: uploading,
  });

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="space-y-8">
      {/* Upload Zone */}
      <Card className="overflow-hidden border-dashed border-2 border-emerald-500/30 bg-gradient-to-br from-emerald-950/20 to-slate-950/20">
        <div
          {...getRootProps()}
          className={`cursor-pointer p-8 md:p-12 text-center transition-all duration-300 ${
            isDragActive
              ? "bg-emerald-500/10 border-emerald-400 scale-[1.01]"
              : "hover:bg-emerald-500/5"
          } ${uploading ? "opacity-50 cursor-not-allowed" : ""}`}
        >
          <input {...getInputProps()} />
          <div className="flex flex-col items-center gap-4">
            <div
              className={`rounded-full p-4 transition-colors ${
                isDragActive
                  ? "bg-emerald-500/20 text-emerald-400"
                  : "bg-slate-800/50 text-slate-400"
              }`}
            >
              {uploading ? (
                <Loader2 className="h-10 w-10 animate-spin" />
              ) : isDragActive ? (
                <ImagePlus className="h-10 w-10" />
              ) : (
                <Upload className="h-10 w-10" />
              )}
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-white">
                {isDragActive
                  ? "Drop images here"
                  : uploading
                    ? "Uploading..."
                    : "Upload Gallery Images"}
              </h3>
              <p className="text-sm text-slate-400 max-w-sm mx-auto">
                {uploading
                  ? `Uploading ${uploadingFiles.length} file(s)...`
                  : "Drag & drop images here or click to browse. Supports JPG, PNG, WebP, GIF, AVIF (max 10MB each)"}
              </p>
            </div>

            {uploading && (
              <div className="w-full max-w-xs space-y-2">
                <Progress value={uploadProgress} className="h-2" />
                <p className="text-xs text-slate-500">{uploadProgress}%</p>
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Gallery Grid */}
      <Card className="border-slate-800 bg-slate-950/50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-emerald-500/10 p-2">
                <Images className="h-5 w-5 text-emerald-400" />
              </div>
              <div>
                <CardTitle className="text-white">
                  Gallery Images
                </CardTitle>
                <CardDescription>
                  {loading
                    ? "Loading..."
                    : `${images.length} image${images.length !== 1 ? "s" : ""} in gallery`}
                </CardDescription>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => void fetchImages()}
              disabled={loading}
              className="border-slate-700 text-slate-300 hover:bg-slate-800"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Refresh"
              )}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-emerald-400" />
            </div>
          ) : images.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="rounded-full bg-slate-800/50 p-4 mb-4">
                <ImagePlus className="h-8 w-8 text-slate-500" />
              </div>
              <h3 className="text-lg font-medium text-slate-300">
                No images yet
              </h3>
              <p className="text-sm text-slate-500 mt-1">
                Upload your first gallery image above
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {images.map((image) => (
                <div
                  key={image.key}
                  className="group relative aspect-square overflow-hidden rounded-xl border border-slate-800 bg-slate-900/50 transition-all duration-300 hover:border-emerald-500/30 hover:shadow-lg hover:shadow-emerald-500/5"
                >
                  <Image
                    src={image.url}
                    alt={image.key.split("/").pop() ?? "Gallery image"}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
                  />

                  {/* Overlay on hover */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                  {/* Image info */}
                  <div className="absolute bottom-0 left-0 right-0 p-2 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                    <p className="text-xs text-white truncate font-medium">
                      {image.key.split("/").pop()}
                    </p>
                    {image.size && (
                      <p className="text-xs text-slate-300">
                        {formatFileSize(image.size)}
                      </p>
                    )}
                  </div>

                  {/* Delete button */}
                  {canDelete && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="destructive"
                          size="icon"
                          className="absolute top-2 right-2 h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-red-500/80 hover:bg-red-600 backdrop-blur-sm"
                          disabled={deleting === image.key}
                        >
                          {deleting === image.key ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <Trash2 className="h-3.5 w-3.5" />
                          )}
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="bg-slate-900 border-slate-800">
                        <AlertDialogHeader>
                          <AlertDialogTitle className="text-white">
                            Delete Image?
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. This image will be
                            permanently removed from the school gallery.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel className="border-slate-700 text-slate-300 hover:bg-slate-800">
                            Cancel
                          </AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => void handleDelete(image.key)}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}

                  {/* Status indicator */}
                  {deleting === image.key && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                      <Loader2 className="h-6 w-6 animate-spin text-white" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
