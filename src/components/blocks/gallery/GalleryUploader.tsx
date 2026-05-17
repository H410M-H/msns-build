"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
import { useDropzone } from "react-dropzone";
import Image from "next/image";
import {
  Upload,
  Trash2,
  ImagePlus,
  Loader2,
  Images,
  FolderOpen,
  FolderPlus,
  X,
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
import { Input } from "~/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";

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

interface StagedFile {
  id: string;
  file: File;
  customName: string;
  previewUrl: string;
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
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);

  const [stagedFiles, setStagedFiles] = useState<StagedFile[]>([]);
  const [selectedFolder, setSelectedFolder] = useState<string>("root");
  const [newFolderName, setNewFolderName] = useState("");
  const [isNewFolder, setIsNewFolder] = useState(false);

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

  // Clean up object URLs when component unmounts or staged files change
  useEffect(() => {
    return () => {
      stagedFiles.forEach(f => URL.revokeObjectURL(f.previewUrl));
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const existingFolders = useMemo(() => {
    const folders = new Set<string>();
    images.forEach((img) => {
      // Key format: gallery/folderName/timestamp_filename.ext
      // OR gallery/timestamp_filename.ext
      const parts = img.key.split("/");
      if (parts.length > 2) {
        // "gallery" is index 0, folder is index 1
        folders.add(parts[1]!);
      }
    });
    return Array.from(folders).sort();
  }, [images]);

  // Group images by folder for display
  const imagesByFolder = useMemo(() => {
    const grouped: Record<string, GalleryImage[]> = { root: [] };
    
    images.forEach((img) => {
      const parts = img.key.split("/");
      if (parts.length > 2) {
        const folder = parts[1]!;
        grouped[folder] ??= [];
        grouped[folder].push(img);
      } else {
        grouped.root ??= [];
        grouped.root.push(img);
      }
    });
    return grouped;
  }, [images]);

  const handleUpload = useCallback(async () => {
    if (stagedFiles.length === 0) return;
    
    const targetFolder = isNewFolder ? newFolderName.trim() : (selectedFolder === "root" ? "" : selectedFolder);
    
    setUploading(true);
    setUploadProgress(0);

    let completed = 0;
    const total = stagedFiles.length;

    for (const staged of stagedFiles) {
      try {
        const formData = new FormData();
        formData.append("file", staged.file);
        formData.append("customName", staged.customName);
        if (targetFolder) {
          formData.append("folder", targetFolder);
        }

        const res = await fetch("/api/gallery/upload", {
          method: "POST",
          body: formData,
        });

        const data = (await res.json()) as UploadResponse;

        if (!res.ok) {
          toast.error(`Failed to upload ${staged.customName}: ${data.error}`);
          continue;
        }

        toast.success(`Uploaded ${staged.customName}`);
        completed++;
        setUploadProgress(Math.round((completed / total) * 100));
      } catch {
        toast.error(`Failed to upload ${staged.customName}`);
      }
    }

    setUploading(false);
    setUploadProgress(0);
    setStagedFiles([]);
    setIsNewFolder(false);
    setNewFolderName("");
    await fetchImages();
  }, [stagedFiles, isNewFolder, newFolderName, selectedFolder, fetchImages]);

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

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const validFiles = acceptedFiles.filter((file) => {
      if (file.size > MAX_FILE_SIZE) {
        toast.error(`${file.name} exceeds 10MB limit`);
        return false;
      }
      return true;
    });

    if (validFiles.length > 0) {
      const newStaged = validFiles.map(file => {
        // Remove extension for the default custom name, making it easier to edit
        const nameWithoutExt = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
        return {
          id: Math.random().toString(36).substring(7),
          file,
          customName: nameWithoutExt,
          previewUrl: URL.createObjectURL(file)
        };
      });
      setStagedFiles(prev => [...prev, ...newStaged]);
    }
  }, []);

  const removeStagedFile = (id: string) => {
    setStagedFiles(prev => {
      const filtered = prev.filter(f => f.id !== id);
      const removed = prev.find(f => f.id === id);
      if (removed) URL.revokeObjectURL(removed.previewUrl);
      return filtered;
    });
  };

  const updateStagedFileName = (id: string, newName: string) => {
    setStagedFiles(prev => prev.map(f => f.id === id ? { ...f, customName: newName } : f));
  };

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

  const renderImageCard = (image: GalleryImage) => (
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
  );

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
              {isDragActive ? (
                <ImagePlus className="h-10 w-10" />
              ) : (
                <Upload className="h-10 w-10" />
              )}
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-white">
                {isDragActive
                  ? "Drop images here"
                  : "Upload Gallery Images"}
              </h3>
              <p className="text-sm text-slate-400 max-w-sm mx-auto">
                Drag & drop images here or click to browse. Supports JPG, PNG, WebP, GIF, AVIF (max 10MB each).
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* Staged Files Configuration */}
      {stagedFiles.length > 0 && (
        <Card className="border-slate-800 bg-slate-900/50">
          <CardHeader className="border-b border-slate-800 pb-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <CardTitle className="text-white text-lg flex items-center gap-2">
                  <ImagePlus className="h-5 w-5 text-emerald-400" />
                  Ready to Upload ({stagedFiles.length})
                </CardTitle>
                <CardDescription>
                  Configure names and categorize these images before uploading.
                </CardDescription>
              </div>
              
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setStagedFiles([])}
                  disabled={uploading}
                  className="border-slate-700 text-slate-300 hover:bg-slate-800"
                >
                  Cancel All
                </Button>
                <Button 
                  size="sm" 
                  onClick={() => void handleUpload()}
                  disabled={uploading}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  {uploading ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Uploading...</>
                  ) : (
                    <><Upload className="mr-2 h-4 w-4" /> Upload Files</>
                  )}
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6 space-y-6">
            
            {/* Folder Configuration */}
            <div className="p-4 rounded-xl border border-slate-800 bg-slate-950/50 flex flex-col md:flex-row gap-4 md:items-end">
              <div className="space-y-2 flex-1 max-w-xs">
                <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                  <FolderOpen className="h-4 w-4 text-emerald-400" /> Target Album / Folder
                </label>
                <Select 
                  value={isNewFolder ? "new_folder" : selectedFolder} 
                  onValueChange={(val) => {
                    if (val === "new_folder") setIsNewFolder(true);
                    else {
                      setIsNewFolder(false);
                      setSelectedFolder(val);
                    }
                  }}
                  disabled={uploading}
                >
                  <SelectTrigger className="bg-slate-900 border-slate-700 text-white">
                    <SelectValue placeholder="Select folder" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-900 border-slate-700 text-white">
                    <SelectItem value="root" className="text-slate-300">No Folder (Root)</SelectItem>
                    {existingFolders.map(f => (
                      <SelectItem key={f} value={f}>{f}</SelectItem>
                    ))}
                    <SelectItem value="new_folder" className="text-emerald-400 font-medium">
                      + Create New Folder
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {isNewFolder && (
                <div className="space-y-2 flex-1 max-w-xs">
                  <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                    <FolderPlus className="h-4 w-4 text-emerald-400" /> New Folder Name
                  </label>
                  <Input 
                    placeholder="e.g. Sports Day 2026" 
                    value={newFolderName}
                    onChange={(e) => setNewFolderName(e.target.value)}
                    className="bg-slate-900 border-slate-700 text-white focus-visible:ring-emerald-500"
                    disabled={uploading}
                  />
                </div>
              )}
            </div>

            {uploading && (
              <div className="w-full space-y-2 px-2">
                <div className="flex justify-between text-sm text-slate-400">
                  <span>Uploading files...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <Progress value={uploadProgress} className="h-2" />
              </div>
            )}

            {/* Staged Files List */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {stagedFiles.map((staged) => (
                <div key={staged.id} className="flex gap-3 p-3 rounded-xl border border-slate-800 bg-slate-950/50">
                  <div className="relative h-16 w-16 rounded-md overflow-hidden shrink-0 border border-slate-700">
                    <Image src={staged.previewUrl} alt="Preview" fill className="object-cover" />
                  </div>
                  <div className="flex-1 min-w-0 flex flex-col justify-center space-y-1.5">
                    <Input 
                      value={staged.customName}
                      onChange={(e) => updateStagedFileName(staged.id, e.target.value)}
                      placeholder="File name"
                      className="h-8 bg-slate-900 border-slate-700 text-sm text-white focus-visible:ring-emerald-500"
                      disabled={uploading}
                    />
                    <p className="text-xs text-slate-500 truncate flex items-center gap-2">
                      <span>{formatFileSize(staged.file.size)}</span>
                      <span>·</span>
                      <span className="truncate">{staged.file.name.split('.').pop()?.toUpperCase()}</span>
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeStagedFile(staged.id)}
                    disabled={uploading}
                    className="shrink-0 h-8 w-8 text-slate-500 hover:text-red-400 hover:bg-red-400/10"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>

          </CardContent>
        </Card>
      )}

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
          ) : existingFolders.length > 0 ? (
            <Tabs defaultValue="all" className="w-full">
              <TabsList className="mb-4 bg-slate-900 border-slate-800 flex-wrap h-auto p-1">
                <TabsTrigger value="all" className="data-[state=active]:bg-slate-800 data-[state=active]:text-emerald-400">
                  All Images
                </TabsTrigger>
                <TabsTrigger value="root" className="data-[state=active]:bg-slate-800 data-[state=active]:text-emerald-400">
                  Uncategorized
                </TabsTrigger>
                {existingFolders.map(folder => (
                  <TabsTrigger key={folder} value={folder} className="data-[state=active]:bg-slate-800 data-[state=active]:text-emerald-400">
                    <FolderOpen className="mr-2 h-3.5 w-3.5" />
                    {folder}
                  </TabsTrigger>
                ))}
              </TabsList>

              <TabsContent value="all" className="mt-0 outline-none">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {images.map(renderImageCard)}
                </div>
              </TabsContent>

              <TabsContent value="root" className="mt-0 outline-none">
                {imagesByFolder.root?.length === 0 ? (
                  <p className="text-slate-500 text-sm py-8 text-center">No uncategorized images.</p>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {imagesByFolder.root?.map(renderImageCard)}
                  </div>
                )}
              </TabsContent>

              {existingFolders.map(folder => (
                <TabsContent key={folder} value={folder} className="mt-0 outline-none">
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {imagesByFolder[folder]?.map(renderImageCard)}
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {images.map(renderImageCard)}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
