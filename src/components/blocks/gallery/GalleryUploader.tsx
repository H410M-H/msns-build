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
  Home,
  ChevronRight,
  Play,
  Folder,
  Copy,
  MoveRight,
  CheckCircle2,
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "~/components/ui/dialog";

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
  folders?: string[];
  error?: string;
}

interface StagedFile {
  id: string;
  file: File;
  customName: string;
  previewUrl: string;
}

const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_VIDEO_SIZE = 100 * 1024 * 1024; // 100MB
const ACCEPTED_TYPES = {
  "image/jpeg": [".jpg", ".jpeg"],
  "image/png": [".png"],
  "image/webp": [".webp"],
  "image/gif": [".gif"],
  "image/avif": [".avif"],
  "video/mp4": [".mp4"],
  "video/webm": [".webm"],
  "video/ogg": [".ogg"],
  "video/quicktime": [".mov"],
};

interface GalleryUploaderProps {
  canDelete?: boolean;
}

export default function GalleryUploader({
  canDelete = true,
}: GalleryUploaderProps) {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [apiFolders, setApiFolders] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);

  const [stagedFiles, setStagedFiles] = useState<StagedFile[]>([]);
  const [selectedFolder, setSelectedFolder] = useState<string>("root");
  const [newFolderName, setNewFolderName] = useState("");
  const [isNewFolder, setIsNewFolder] = useState(false);

  // New Selection & Action States
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);
  const [actionLoading, setActionLoading] = useState(false);

  const [isFolderDialogOpen, setIsFolderDialogOpen] = useState(false);
  const [newStandaloneFolder, setNewStandaloneFolder] = useState("");

  const [isManageFoldersDialogOpen, setIsManageFoldersDialogOpen] = useState(false);
  const [selectedFolders, setSelectedFolders] = useState<string[]>([]);

  const [isMoveDialogOpen, setIsMoveDialogOpen] = useState(false);
  const [isCopyDialogOpen, setIsCopyDialogOpen] = useState(false);
  const [actionTargetFolder, setActionTargetFolder] = useState("root");
  const [isNewActionFolder, setIsNewActionFolder] = useState(false);
  const [newActionFolderName, setNewActionFolderName] = useState("");

  // Folder Explorer State
  const [currentPath, setCurrentPath] = useState<string>("");

  const fetchImages = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/gallery");
      if (!res.ok) throw new Error("Failed to fetch");
      const data = (await res.json()) as GalleryListResponse;
      setImages(data.images ?? []);
      setApiFolders(data.folders ?? []);
    } catch {
      toast.error("Failed to load gallery items");
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
    const folders = new Set<string>(apiFolders);
    images.forEach((img) => {
      if (img.key.startsWith("gallery/")) {
        const parts = img.key.split("/");
        if (parts.length > 2) {
          folders.add(parts.slice(1, -1).join("/"));
        }
      } else if (img.key.startsWith("videos/")) {
        const parts = img.key.split("/");
        if (parts.length > 1) {
          folders.add(parts.slice(0, -1).join("/"));
        }
      }
    });
    return Array.from(folders).sort();
  }, [images, apiFolders]);

  // Group images by folder for display/management
  const imagesByFolder = useMemo(() => {
    const grouped: Record<string, GalleryImage[]> = { root: [] };

    images.forEach((img) => {
      let folderPath = "";
      if (img.key.startsWith("gallery/")) {
        const parts = img.key.split("/");
        if (parts.length > 2) {
          folderPath = parts.slice(1, -1).join("/");
        }
      } else if (img.key.startsWith("videos/")) {
        const parts = img.key.split("/");
        if (parts.length > 1) {
          folderPath = parts.slice(0, -1).join("/");
        }
      }

      if (folderPath) {
        let arr = grouped[folderPath];
        if (!arr) {
          arr = [];
          grouped[folderPath] = arr;
        }
        arr.push(img);
      } else {
        let arr = grouped.root;
        if (!arr) {
          arr = [];
          grouped.root = arr;
        }
        arr.push(img);
      }
    });
    return grouped;
  }, [images]);

  // Folder Explorer Navigation Calculations
  const currentSubfolders = useMemo(() => {
    const subs = new Set<string>();
    existingFolders.forEach((folder) => {
      if (currentPath === "") {
        const parts = folder.split("/");
        subs.add(parts[0]!);
      } else {
        if (folder.startsWith(currentPath + "/")) {
          const relative = folder.substring(currentPath.length + 1);
          const segment = relative.split("/")[0]!;
          subs.add(currentPath + "/" + segment);
        }
      }
    });
    return Array.from(subs).sort();
  }, [existingFolders, currentPath]);

  const currentFiles = useMemo(() => {
    return images.filter((img) => {
      let imgFolder = "";
      if (img.key.startsWith("gallery/")) {
        const parts = img.key.split("/");
        if (parts.length > 2) {
          imgFolder = parts.slice(1, -1).join("/");
        }
      } else if (img.key.startsWith("videos/")) {
        const parts = img.key.split("/");
        if (parts.length > 1) {
          imgFolder = parts.slice(0, -1).join("/");
        }
      }
      return imgFolder === currentPath;
    });
  }, [images, currentPath]);

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

  const toggleSelection = (key: string) => {
    setSelectedKeys(prev =>
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    );
  };

  const handleCreateFolder = async () => {
    if (!newStandaloneFolder.trim()) return;
    try {
      setActionLoading(true);
      const res = await fetch("/api/gallery/folder", {
        method: "POST",
        body: JSON.stringify({ folderName: newStandaloneFolder.trim() }),
      });
      if (!res.ok) throw new Error("Failed to create folder");
      toast.success("Folder created");
      setIsFolderDialogOpen(false);
      setNewStandaloneFolder("");
      await fetchImages();
    } catch {
      toast.error("Failed to create folder");
    } finally {
      setActionLoading(false);
    }
  };

  const handleBulkAction = async (action: "move" | "copy") => {
    if (selectedKeys.length === 0) return;
    const target = isNewActionFolder ? newActionFolderName.trim() : (actionTargetFolder === "root" ? "" : actionTargetFolder);

    try {
      setActionLoading(true);
      const res = await fetch(`/api/gallery/${action}`, {
        method: "POST",
        body: JSON.stringify({ keys: selectedKeys, targetFolder: target }),
      });
      if (!res.ok) throw new Error(`Failed to ${action}`);
      toast.success(`Items ${action === 'move' ? 'moved' : 'copied'} successfully`);
      if (action === "move") setIsMoveDialogOpen(false);
      else setIsCopyDialogOpen(false);

      setSelectionMode(false);
      setSelectedKeys([]);
      setNewActionFolderName("");
      setIsNewActionFolder(false);
      await fetchImages();
    } catch {
      toast.error(`Failed to ${action} items`);
    } finally {
      setActionLoading(false);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedKeys.length === 0) return;
    if (!confirm(`Are you sure you want to delete ${selectedKeys.length} items?`)) return;
    try {
      setActionLoading(true);
      for (const key of selectedKeys) {
        await fetch(`/api/gallery/${key}`, { method: "DELETE" });
      }
      toast.success("Items deleted");
      setSelectionMode(false);
      setSelectedKeys([]);
      await fetchImages();
    } catch {
      toast.error("Error deleting some items");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteFolders = async () => {
    if (selectedFolders.length === 0) return;
    if (!confirm(`Are you sure you want to delete ${selectedFolders.length} folder(s) and all their contents? This cannot be undone.`)) return;
    try {
      setActionLoading(true);
      const res = await fetch("/api/gallery/folder", {
        method: "DELETE",
        body: JSON.stringify({ folders: selectedFolders }),
      });
      if (!res.ok) throw new Error("Failed to delete folders");
      toast.success("Folders deleted successfully");
      setSelectedFolders([]);
      setIsManageFoldersDialogOpen(false);
      await fetchImages();
    } catch {
      toast.error("Failed to delete folders");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = useCallback(
    async (key: string) => {
      try {
        setDeleting(key);
        const res = await fetch(`/api/gallery/${key}`, {
          method: "DELETE",
        });

        if (!res.ok) {
          const data = (await res.json()) as { error: string };
          toast.error(data.error ?? "Failed to delete item");
          return;
        }

        toast.success("Item deleted successfully");
        setImages((prev) => prev.filter((img) => img.key !== key));
      } catch {
        toast.error("Failed to delete item");
      } finally {
        setDeleting(null);
      }
    },
    []
  );

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const validFiles = acceptedFiles.filter((file) => {
      const isVideo = file.type.startsWith("video/");
      const maxSize = isVideo ? MAX_VIDEO_SIZE : MAX_IMAGE_SIZE;
      if (file.size > maxSize) {
        toast.error(`${file.name} exceeds ${isVideo ? "100MB" : "10MB"} limit`);
        return false;
      }
      return true;
    });

    if (validFiles.length > 0) {
      const newStaged = validFiles.map(file => {
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
    maxSize: MAX_VIDEO_SIZE,
    disabled: uploading,
  });

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const renderFolderOptions = () => {
    return existingFolders.map(f => {
      const parts = f.split('/');
      const depth = parts.length - 1;
      const name = parts[parts.length - 1]!;
      const label = "\u00A0\u00A0".repeat(depth) + name;
      return (
        <SelectItem key={f} value={f}>
          {label}
        </SelectItem>
      );
    });
  };

  const renderBreadcrumbs = () => {
    const parts = currentPath ? currentPath.split("/") : [];
    return (
      <div className="flex flex-wrap items-center gap-1.5 text-sm text-slate-400 mb-6 bg-slate-900/10 p-3 rounded-xl border border-slate-900/60 backdrop-blur-xs">
        <button
          onClick={() => setCurrentPath("")}
          className="flex items-center gap-1 text-slate-400 hover:text-emerald-400 font-medium transition-colors cursor-pointer"
        >
          <Home className="h-4 w-4" />
          <span>Root</span>
        </button>
        {parts.map((part, index) => {
          const pathUpTo = parts.slice(0, index + 1).join("/");
          return (
            <div key={pathUpTo} className="flex items-center gap-1.5">
              <ChevronRight className="h-3.5 w-3.5 text-slate-600 shrink-0" />
              <button
                onClick={() => setCurrentPath(pathUpTo)}
                className="text-slate-200 hover:text-emerald-400 font-medium transition-colors cursor-pointer max-w-[120px] truncate"
              >
                {part}
              </button>
            </div>
          );
        })}
      </div>
    );
  };

  const renderImageCard = (image: GalleryImage) => {
    const filename = image.key.split("/").pop() ?? "file";
    const isVideo = /\.(mp4|webm|ogg|mov)$/i.test(filename) || image.key.startsWith("videos/");

    return (
      <div
        key={image.key}
        onClick={() => selectionMode && toggleSelection(image.key)}
        className={`group relative aspect-square overflow-hidden rounded-xl border transition-all duration-300 ${selectedKeys.includes(image.key)
          ? "border-emerald-500 ring-2 ring-emerald-500/50 shadow-lg shadow-emerald-500/10"
          : "border-slate-800 hover:border-emerald-500/50 hover:shadow-md hover:shadow-emerald-500/5"
          } bg-slate-950/40 backdrop-blur-xs ${selectionMode ? "cursor-pointer" : ""}`}
      >
        {selectionMode && (
          <div className="absolute top-2 left-2 z-10 transition-transform duration-200">
            <div className={`rounded-full border-2 h-6 w-6 flex items-center justify-center ${selectedKeys.includes(image.key) ? 'bg-emerald-500 border-emerald-500' : 'bg-black/60 border-slate-500 hover:border-emerald-400'}`}>
              {selectedKeys.includes(image.key) && <CheckCircle2 className="h-4 w-4 text-white" />}
            </div>
          </div>
        )}

        {isVideo ? (
          <div className="relative w-full h-full bg-slate-900 flex items-center justify-center">
            <video
              src={image.url}
              className="w-full h-full object-cover opacity-70 group-hover:opacity-85 transition-opacity"
              preload="metadata"
              muted
              playsInline
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 p-2.5 group-hover:scale-110 transition-transform duration-300">
                <Play className="h-5 w-5 fill-current" />
              </div>
            </div>
          </div>
        ) : (
          <Image
            src={image.url}
            alt={filename}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
          />
        )}

        {/* Overlay on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Media info */}
        <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
          <p className="text-xs text-white truncate font-semibold drop-shadow-sm">
            {filename}
          </p>
          {image.size && (
            <p className="text-[10px] text-emerald-400 font-medium">
              {formatFileSize(image.size)}
            </p>
          )}
        </div>

        {/* Delete button */}
        {canDelete && !selectionMode && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="destructive"
                size="icon"
                className="absolute top-2 right-2 h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-red-650/90 hover:bg-red-700 backdrop-blur-xs shadow-md"
                disabled={deleting === image.key}
              >
                {deleting === image.key ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Trash2 className="h-3.5 w-3.5" />
                )}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="bg-slate-955 border-slate-800 text-white backdrop-blur-md">
              <AlertDialogHeader>
                <AlertDialogTitle className="text-white">
                  Delete {isVideo ? "Video" : "Image"}?
                </AlertDialogTitle>
                <AlertDialogDescription className="text-slate-400">
                  This action cannot be undone. This {isVideo ? "video" : "image"} will be
                  permanently removed from the school gallery.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="border-slate-800 text-slate-300 hover:bg-slate-900">
                  Cancel
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => void handleDelete(image.key)}
                  className="bg-red-650 hover:bg-red-700"
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}

        {/* Status indicator */}
        {deleting === image.key && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-xs">
            <Loader2 className="h-6 w-6 animate-spin text-emerald-400" />
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-8">
      {/* Upload Zone */}
      <Card className="overflow-hidden border-dashed border-2 border-emerald-500/20 hover:border-emerald-500/40 bg-gradient-to-br from-emerald-950/10 via-slate-900/10 to-slate-950/20 shadow-lg hover:shadow-emerald-500/5 transition-all duration-300">
        <div
          {...getRootProps()}
          className={`cursor-pointer p-8 md:p-12 text-center transition-all duration-300 ${isDragActive
            ? "bg-emerald-500/10 border-emerald-400 scale-[1.01] shadow-emerald-500/10"
            : "hover:bg-emerald-500/[0.03]"
            } ${uploading ? "opacity-50 cursor-not-allowed" : ""}`}
        >
          <input {...getInputProps()} />
          <div className="flex flex-col items-center gap-4">
            <div
              className={`rounded-full p-4 transition-colors ${isDragActive
                ? "bg-emerald-500/20 text-emerald-400"
                : "bg-slate-900/80 text-slate-300 border border-slate-800 shadow-md"
                }`}
            >
              {isDragActive ? (
                <ImagePlus className="h-10 w-10 animate-pulse" />
              ) : (
                <Upload className="h-10 w-10" />
              )}
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-white">
                {isDragActive
                  ? "Drop files here"
                  : "Upload Gallery Media"}
              </h3>
              <p className="text-sm text-slate-400 max-w-sm mx-auto">
                Drag & drop media here or click to browse. Images (max 10MB) & Videos (max 100MB).
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* Staged Files Configuration */}
      {stagedFiles.length > 0 && (
        <Card className="border-slate-800/80 bg-slate-950/45 backdrop-blur-md shadow-xl">
          <CardHeader className="border-b border-slate-800 pb-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <CardTitle className="text-white text-lg flex items-center gap-2">
                  <ImagePlus className="h-5 w-5 text-emerald-400" />
                  Ready to Upload ({stagedFiles.length})
                </CardTitle>
                <CardDescription>
                  Configure names and categorize media before uploading.
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
                    {renderFolderOptions()}
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
                    placeholder="e.g. Sports/Football"
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
                  <div className="relative h-16 w-16 rounded-md overflow-hidden shrink-0 border border-slate-700 bg-slate-900 flex items-center justify-center">
                    {staged.file.type.startsWith("video/") ? (
                      <video src={staged.previewUrl} className="w-full h-full object-cover" preload="metadata" muted playsInline />
                    ) : (
                      <Image src={staged.previewUrl} alt="Preview" fill className="object-cover" />
                    )}
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
      <Card className="border-slate-800/80 bg-slate-950/45 backdrop-blur-md shadow-xl">
        <CardHeader className="border-b border-slate-800/60 pb-5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-emerald-500/10 p-2 border border-emerald-500/20 shadow-inner">
                <Images className="h-5 w-5 text-emerald-400" />
              </div>
              <div>
                <CardTitle className="text-white">
                  Media Gallery
                </CardTitle>
                <CardDescription className="text-slate-400">
                  {loading
                    ? "Loading..."
                    : `${images.length} item${images.length !== 1 ? "s" : ""} in gallery`}
                </CardDescription>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsFolderDialogOpen(true)}
                disabled={loading || selectionMode}
                className="border-slate-850 bg-slate-900/60 text-slate-200 hover:bg-slate-800 hover:text-white"
              >
                <FolderPlus className="h-4 w-4 mr-2 text-emerald-400" /> Create Folder
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsManageFoldersDialogOpen(true)}
                disabled={loading || selectionMode || existingFolders.length === 0}
                className="border-slate-850 bg-slate-900/60 text-slate-200 hover:bg-slate-800 hover:text-white"
              >
                <FolderOpen className="h-4 w-4 mr-2 text-emerald-400" /> Manage Folders
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSelectionMode(!selectionMode);
                  if (selectionMode) setSelectedKeys([]);
                }}
                disabled={loading || images.length === 0}
                className={selectionMode ? "bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-600 shadow-md shadow-emerald-600/10" : "border-slate-855 bg-slate-900/60 text-slate-200 hover:bg-slate-800 hover:text-white"}
              >
                {selectionMode ? "Cancel Selection" : "Select Items"}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => void fetchImages()}
                disabled={loading || selectionMode}
                className="border-slate-850 bg-slate-900/60 text-slate-200 hover:bg-slate-800 hover:text-white"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin text-emerald-400" />
                ) : (
                  "Refresh"
                )}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-emerald-400" />
            </div>
          ) : images.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="rounded-full bg-slate-900 border border-slate-800 p-4 mb-4 shadow-inner">
                <ImagePlus className="h-8 w-8 text-slate-500" />
              </div>
              <h3 className="text-lg font-medium text-slate-300">
                No items yet
              </h3>
              <p className="text-sm text-slate-500 mt-1">
                Upload your first gallery item above
              </p>
            </div>
          ) : (
            <Tabs defaultValue="explorer" className="w-full">
              <TabsList className="mb-6 bg-slate-900/80 border border-slate-800/80 p-1 rounded-xl">
                <TabsTrigger value="explorer" className="data-[state=active]:bg-slate-950 data-[state=active]:text-emerald-400 rounded-lg">
                  <FolderOpen className="mr-2 h-4 w-4" /> Folder Explorer
                </TabsTrigger>
                <TabsTrigger value="all" className="data-[state=active]:bg-slate-950 data-[state=active]:text-emerald-400 rounded-lg">
                  <Images className="mr-2 h-4 w-4" /> All Items
                </TabsTrigger>
              </TabsList>

              <TabsContent value="explorer" className="outline-none mt-0">
                {renderBreadcrumbs()}

                {/* Subfolders list */}
                {currentSubfolders.length > 0 && (
                  <div className="space-y-3 mb-8">
                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Folders</h4>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 animate-in fade-in duration-200">
                      {currentSubfolders.map((folderPath) => {
                        const folderName = folderPath.split("/").pop() ?? folderPath;
                        const itemsCount = images.filter(img => {
                          let imgFolder = "";
                          if (img.key.startsWith("gallery/")) {
                            const parts = img.key.split("/");
                            if (parts.length > 2) imgFolder = parts.slice(1, -1).join("/");
                          } else if (img.key.startsWith("videos/")) {
                            const parts = img.key.split("/");
                            if (parts.length > 1) imgFolder = parts.slice(0, -1).join("/");
                          }
                          return imgFolder === folderPath || imgFolder.startsWith(folderPath + "/");
                        }).length;

                        return (
                          <div
                            key={folderPath}
                            onClick={() => setCurrentPath(folderPath)}
                            className="flex items-center gap-3 p-4 rounded-xl border border-slate-800 bg-slate-900/10 hover:border-emerald-500/50 hover:bg-slate-900/30 cursor-pointer transition-all duration-200 group relative select-none"
                          >
                            <Folder className="h-8 w-8 text-emerald-400 group-hover:scale-105 transition-transform duration-200 shrink-0" />
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-semibold text-slate-200 truncate group-hover:text-white">
                                {folderName}
                              </p>
                              <p className="text-xs text-slate-500">
                                {itemsCount} item{itemsCount !== 1 ? "s" : ""}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Files in this folder */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Files</h4>
                  {currentFiles.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-center bg-slate-900/5 border border-dashed border-slate-800 rounded-xl">
                      <p className="text-slate-500 text-sm">No files in this folder.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                      {currentFiles.map(renderImageCard)}
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="all" className="outline-none mt-0">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {images.map(renderImageCard)}
                </div>
              </TabsContent>
            </Tabs>
          )}
        </CardContent>
      </Card>

      {/* Selection Action Bar */}
      {selectionMode && selectedKeys.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 rounded-full border border-slate-800/60 bg-slate-950/85 backdrop-blur-lg px-6 py-3 shadow-2xl shadow-emerald-950/20 border-emerald-500/10 animate-in slide-in-from-bottom-10">
          <span className="text-white font-semibold mr-4 text-sm tracking-wide">{selectedKeys.length} selected</span>
          <Button size="sm" variant="outline" className="border-slate-800 bg-slate-900/60 text-slate-200 hover:bg-slate-800 rounded-full text-xs" onClick={() => setIsMoveDialogOpen(true)}>
            <MoveRight className="h-3.5 w-3.5 mr-1.5 text-emerald-400" /> Move
          </Button>
          <Button size="sm" variant="outline" className="border-slate-800 bg-slate-900/60 text-slate-200 hover:bg-slate-800 rounded-full text-xs" onClick={() => setIsCopyDialogOpen(true)}>
            <Copy className="h-3.5 w-3.5 mr-1.5 text-emerald-400" /> Copy
          </Button>
          {canDelete && (
            <Button size="sm" variant="destructive" className="rounded-full bg-red-650 hover:bg-red-700 text-xs shadow-md shadow-red-900/10" onClick={() => void handleBulkDelete()} disabled={actionLoading}>
              <Trash2 className="h-3.5 w-3.5 mr-1.5" /> Delete
            </Button>
          )}
        </div>
      )}

      {/* Dialogs */}
      <Dialog open={isFolderDialogOpen} onOpenChange={setIsFolderDialogOpen}>
        <DialogContent className="bg-slate-955 border-slate-800/80 text-white backdrop-blur-xl sm:max-w-md shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-white font-semibold">Create New Folder</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Input
              value={newStandaloneFolder}
              onChange={e => setNewStandaloneFolder(e.target.value)}
              placeholder="e.g. Sports/Football or videos/Events"
              className="bg-slate-900 border-slate-800 text-slate-100 placeholder-slate-500 focus-visible:ring-emerald-500/50 focus-visible:border-emerald-500/30"
            />
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setIsFolderDialogOpen(false)} className="border-slate-800 hover:bg-slate-900 text-slate-350 bg-transparent">Cancel</Button>
            <Button onClick={() => void handleCreateFolder()} disabled={!newStandaloneFolder.trim() || actionLoading} className="bg-emerald-600 hover:bg-emerald-705 shadow-md shadow-emerald-950/20">
              {actionLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <FolderPlus className="h-4 w-4 mr-2" />} Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isManageFoldersDialogOpen} onOpenChange={setIsManageFoldersDialogOpen}>
        <DialogContent className="bg-slate-955 border-slate-800/80 text-white backdrop-blur-xl sm:max-w-md shadow-2xl">
          <DialogHeader><DialogTitle className="text-white font-semibold">Manage Folders</DialogTitle></DialogHeader>
          <div className="py-4 max-h-[60vh] overflow-y-auto space-y-2 pr-1">
            {existingFolders.length === 0 ? (
              <p className="text-slate-500 text-sm text-center py-4">No folders found.</p>
            ) : (
              existingFolders.map(folder => (
                <div key={folder} className="flex items-center gap-3 p-3 rounded-xl border border-slate-900 bg-slate-900/30">
                  <div
                    className={`h-5 w-5 rounded border flex items-center justify-center cursor-pointer transition-colors ${selectedFolders.includes(folder) ? 'bg-emerald-500 border-emerald-500' : 'border-slate-700 hover:border-emerald-400'}`}
                    onClick={() => {
                      setSelectedFolders(prev =>
                        prev.includes(folder) ? prev.filter(f => f !== folder) : [...prev, folder]
                      );
                    }}
                  >
                    {selectedFolders.includes(folder) && <CheckCircle2 className="h-3.5 w-3.5 text-white" />}
                  </div>
                  <FolderOpen className="h-4 w-4 text-emerald-400" />
                  <span className="text-sm font-medium flex-1 text-slate-200">{folder}</span>
                  <span className="text-xs text-slate-500">{imagesByFolder[folder]?.length ?? 0} items</span>
                </div>
              ))
            )}
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setIsManageFoldersDialogOpen(false)} className="border-slate-800 hover:bg-slate-900 text-slate-355 bg-transparent">Cancel</Button>
            <Button onClick={() => void handleDeleteFolders()} disabled={selectedFolders.length === 0 || actionLoading} variant="destructive" className="bg-red-655 hover:bg-red-700">
              {actionLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Trash2 className="h-4 w-4 mr-2" />} Delete Selected
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isMoveDialogOpen} onOpenChange={setIsMoveDialogOpen}>
        <DialogContent className="bg-slate-955 border-slate-800/80 text-white backdrop-blur-xl sm:max-w-md shadow-2xl">
          <DialogHeader><DialogTitle className="text-white font-semibold">Move {selectedKeys.length} items</DialogTitle></DialogHeader>
          <div className="py-4 space-y-4">
            <Select value={isNewActionFolder ? "new_folder" : actionTargetFolder} onValueChange={v => { if (v === "new_folder") setIsNewActionFolder(true); else { setIsNewActionFolder(false); setActionTargetFolder(v); } }}>
              <SelectTrigger className="bg-slate-900 border-slate-800 text-slate-100 focus-visible:ring-emerald-500/50">
                <SelectValue placeholder="Select target folder" />
              </SelectTrigger>
              <SelectContent className="bg-slate-955 border-slate-800 text-white">
                <SelectItem value="root" className="text-slate-300">No Folder (Root)</SelectItem>
                {renderFolderOptions()}
                <SelectItem value="new_folder" className="text-emerald-400 font-semibold">+ Create New Folder</SelectItem>
              </SelectContent>
            </Select>
            {isNewActionFolder && (
              <Input
                value={newActionFolderName}
                onChange={e => setNewActionFolderName(e.target.value)}
                placeholder="e.g. Sports/Football or videos/Events"
                className="bg-slate-900 border-slate-800 text-slate-100 placeholder-slate-500 focus-visible:ring-emerald-500/50 focus-visible:border-emerald-500/30"
              />
            )}
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setIsMoveDialogOpen(false)} className="border-slate-800 hover:bg-slate-900 text-slate-355 bg-transparent">Cancel</Button>
            <Button onClick={() => void handleBulkAction("move")} disabled={actionLoading || (isNewActionFolder && !newActionFolderName.trim())} className="bg-emerald-600 hover:bg-emerald-705">
              {actionLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <MoveRight className="h-4 w-4 mr-2" />} Move
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isCopyDialogOpen} onOpenChange={setIsCopyDialogOpen}>
        <DialogContent className="bg-slate-955 border-slate-800/80 text-white backdrop-blur-xl sm:max-w-md shadow-2xl">
          <DialogHeader><DialogTitle className="text-white font-semibold">Copy {selectedKeys.length} items</DialogTitle></DialogHeader>
          <div className="py-4 space-y-4">
            <Select value={isNewActionFolder ? "new_folder" : actionTargetFolder} onValueChange={v => { if (v === "new_folder") setIsNewActionFolder(true); else { setIsNewActionFolder(false); setActionTargetFolder(v); } }}>
              <SelectTrigger className="bg-slate-900 border-slate-800 text-slate-100 focus-visible:ring-emerald-500/50">
                <SelectValue placeholder="Select target folder" />
              </SelectTrigger>
              <SelectContent className="bg-slate-955 border-slate-800 text-white">
                <SelectItem value="root" className="text-slate-300">No Folder (Root)</SelectItem>
                {renderFolderOptions()}
                <SelectItem value="new_folder" className="text-emerald-400 font-semibold">+ Create New Folder</SelectItem>
              </SelectContent>
            </Select>
            {isNewActionFolder && (
              <Input
                value={newActionFolderName}
                onChange={e => setNewActionFolderName(e.target.value)}
                placeholder="e.g. Sports/Football or videos/Events"
                className="bg-slate-900 border-slate-800 text-slate-100 placeholder-slate-500 focus-visible:ring-emerald-500/50 focus-visible:border-emerald-500/30"
              />
            )}
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setIsCopyDialogOpen(false)} className="border-slate-800 hover:bg-slate-900 text-slate-355 bg-transparent">Cancel</Button>
            <Button onClick={() => void handleBulkAction("copy")} disabled={actionLoading || (isNewActionFolder && !newActionFolderName.trim())} className="bg-emerald-600 hover:bg-emerald-705">
              {actionLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Copy className="h-4 w-4 mr-2" />} Copy
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
