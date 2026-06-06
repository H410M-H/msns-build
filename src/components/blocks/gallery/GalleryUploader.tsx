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
  ChevronLeft,
  Play,
  Folder,
  Copy,
  MoveRight,
  CheckCircle2,
  MoreVertical,
  Download,
  Share2,
  Edit2,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import { Button } from "~/components/ui/button";
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
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "~/components/ui/dropdown-menu";

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

interface UploadingItem {
  id: string;
  name: string;
  progress: number;
  previewUrl: string;
  isVideo: boolean;
  status: "uploading" | "completed" | "failed";
  targetFolder: string;
  error?: string;
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
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);

  // Folder Explorer & Tabs State
  const [currentPath, setCurrentPath] = useState<string>("");
  const [activeTab, setActiveTab] = useState<string>("explorer");

  // Upload State
  const [uploadTargetFolder, setUploadTargetFolder] = useState<string>("root");
  const [isNewFolder, setIsNewFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [uploadingItems, setUploadingItems] = useState<UploadingItem[]>([]);

  // Selection & Action States
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);
  const [actionLoading, setActionLoading] = useState(false);

  // Folder Dialogs
  const [isFolderDialogOpen, setIsFolderDialogOpen] = useState(false);
  const [newStandaloneFolder, setNewStandaloneFolder] = useState("");
  const [isManageFoldersDialogOpen, setIsManageFoldersDialogOpen] = useState(false);
  const [selectedFolders, setSelectedFolders] = useState<string[]>([]);

  // Move & Copy Dialogs
  const [isMoveDialogOpen, setIsMoveDialogOpen] = useState(false);
  const [isCopyDialogOpen, setIsCopyDialogOpen] = useState(false);
  const [actionTargetFolder, setActionTargetFolder] = useState("root");
  const [isNewActionFolder, setIsNewActionFolder] = useState(false);
  const [newActionFolderName, setNewActionFolderName] = useState("");

  // Single-Item Action States
  const [activeItem, setActiveItem] = useState<GalleryImage | null>(null);
  const [isRenameDialogOpen, setIsRenameDialogOpen] = useState(false);
  const [renameValue, setRenameValue] = useState("");
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // Lightbox State
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [zoomScale, setZoomScale] = useState(1);

  // Sync uploadTargetFolder with currentPath when currentPath changes
  useEffect(() => {
    setUploadTargetFolder(currentPath === "" ? "root" : currentPath);
  }, [currentPath]);

  // Reset zoom on lightbox item change
  useEffect(() => {
    setZoomScale(1);
  }, [lightboxIndex]);

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

  // Clean up object URLs when uploading items are cleared
  useEffect(() => {
    return () => {
      uploadingItems.forEach(item => {
        if (item.status === "uploading") {
          URL.revokeObjectURL(item.previewUrl);
        }
      });
    };
  }, [uploadingItems]);

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

  const activeFileList = useMemo(() => {
    return activeTab === "explorer" ? currentFiles : images;
  }, [activeTab, currentFiles, images]);

  const activeMedia = lightboxIndex !== null ? activeFileList[lightboxIndex] : null;

  // Next / Prev handlers for lightbox
  const handleNextMedia = useCallback(() => {
    if (lightboxIndex === null || activeFileList.length === 0) return;
    setLightboxIndex((lightboxIndex + 1) % activeFileList.length);
  }, [lightboxIndex, activeFileList]);

  const handlePrevMedia = useCallback(() => {
    if (lightboxIndex === null || activeFileList.length === 0) return;
    setLightboxIndex((lightboxIndex - 1 + activeFileList.length) % activeFileList.length);
  }, [lightboxIndex, activeFileList]);

  // Keyboard navigation for Lightbox
  useEffect(() => {
    if (!isLightboxOpen) return;
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") handleNextMedia();
      else if (e.key === "ArrowLeft") handlePrevMedia();
      else if (e.key === "Escape") {
        setIsLightboxOpen(false);
        setLightboxIndex(null);
      }
    };
    
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isLightboxOpen, handleNextMedia, handlePrevMedia]);

  // Parallel Upload Implementation
  const startUpload = useCallback(async (file: File, folder: string) => {
    const tempId = Math.random().toString(36).substring(7);
    const nameWithoutExt = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
    const isVideo = file.type.startsWith("video/");
    const previewUrl = URL.createObjectURL(file);

    setUploadingItems(prev => [
      ...prev,
      {
        id: tempId,
        name: nameWithoutExt,
        progress: 0,
        previewUrl,
        isVideo,
        status: "uploading",
        targetFolder: folder,
      }
    ]);

    try {
      await new Promise<UploadResponse>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open("POST", "/api/gallery/upload");

        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            const progress = Math.round((event.loaded / event.total) * 100);
            setUploadingItems(prev =>
              prev.map(item => item.id === tempId ? { ...item, progress } : item)
            );
          }
        };

        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              const resObj = JSON.parse(xhr.responseText) as UploadResponse;
              resolve(resObj);
            } catch {
              reject(new Error("Failed to parse server response"));
            }
          } else {
            let errMsg = "Upload failed";
            try {
              const resObj = JSON.parse(xhr.responseText) as { error?: string };
              errMsg = resObj.error ?? errMsg;
            } catch {}
            reject(new Error(errMsg));
          }
        };

        xhr.onerror = () => reject(new Error("Network error during upload"));

        const formData = new FormData();
        formData.append("file", file);
        formData.append("customName", nameWithoutExt);
        if (folder && folder !== "root") {
          formData.append("folder", folder);
        }
        xhr.send(formData);
      });

      // Clear successful upload from items list and refresh gallery
      setUploadingItems(prev => prev.filter(item => item.id !== tempId));
      URL.revokeObjectURL(previewUrl);
      toast.success(`Uploaded ${nameWithoutExt}`);
      await fetchImages();
    } catch (error) {
      setUploadingItems(prev =>
        prev.map(item =>
          item.id === tempId
            ? { ...item, status: "failed", error: (error as Error).message }
            : item
        )
      );
      toast.error(`Failed to upload ${nameWithoutExt}: ${(error as Error).message}`);
    }
  }, [fetchImages]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const targetFolder = isNewFolder ? newFolderName.trim() : (uploadTargetFolder === "root" ? "" : uploadTargetFolder);

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
      validFiles.forEach(file => {
        void startUpload(file, targetFolder);
      });
      setIsNewFolder(false);
      setNewFolderName("");
    }
  }, [startUpload, isNewFolder, newFolderName, uploadTargetFolder]);

  // Single-Item Actions Implementation
  const handleDownload = async (image: GalleryImage) => {
    try {
      const response = await fetch(image.url);
      const blob = await response.blob();
      const filename = image.key.split("/").pop() ?? "download";
      const cleanFilename = filename.replace(/^\d+_/, "");
      
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = cleanFilename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);
      toast.success("Download started");
    } catch {
      toast.error("Failed to download file");
    }
  };

  const handleShare = async (image: GalleryImage) => {
    const shareUrl = window.location.origin + image.url;
    if (navigator.share) {
      try {
        await navigator.share({
          title: image.key.split("/").pop() ?? "Shared Media",
          url: shareUrl,
        });
        toast.success("Shared successfully");
      } catch (err) {
        if ((err as Error).name !== "AbortError") {
          toast.error("Failed to share");
        }
      }
    } else {
      try {
        await navigator.clipboard.writeText(shareUrl);
        toast.success("Link copied to clipboard!");
      } catch {
        toast.error("Failed to copy link");
      }
    }
  };

  const handleRename = async () => {
    if (!activeItem || !renameValue.trim()) return;

    try {
      setActionLoading(true);
      const res = await fetch("/api/gallery/rename", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: activeItem.key, newName: renameValue.trim() }),
      });

      const data = (await res.json()) as { success: boolean; error?: string };
      if (!res.ok) {
        throw new Error(data.error ?? "Failed to rename");
      }

      toast.success("Item renamed successfully");
      setIsRenameDialogOpen(false);
      setActiveItem(null);
      await fetchImages();
    } catch (err) {
      toast.error((err as Error).message || "Failed to rename item");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = useCallback(async (key: string) => {
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
      setIsDeleteDialogOpen(false);
      setActiveItem(null);
    } catch {
      toast.error("Failed to delete item");
    } finally {
      setDeleting(null);
    }
  }, []);

  // Bulk Actions
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
    const keysToAct = activeItem ? [activeItem.key] : selectedKeys;
    if (keysToAct.length === 0) return;
    
    const target = isNewActionFolder ? newActionFolderName.trim() : (actionTargetFolder === "root" ? "" : actionTargetFolder);

    try {
      setActionLoading(true);
      const res = await fetch(`/api/gallery/${action}`, {
        method: "POST",
        body: JSON.stringify({ keys: keysToAct, targetFolder: target }),
      });
      if (!res.ok) throw new Error(`Failed to ${action}`);
      toast.success(`Items ${action === 'move' ? 'moved' : 'copied'} successfully`);
      
      if (action === "move") setIsMoveDialogOpen(false);
      else setIsCopyDialogOpen(false);

      setSelectionMode(false);
      setSelectedKeys([]);
      setNewActionFolderName("");
      setIsNewActionFolder(false);
      setActiveItem(null);
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

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ACCEPTED_TYPES,
    multiple: true,
    maxSize: MAX_VIDEO_SIZE,
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
      <div className="flex flex-wrap items-center gap-1.5 text-sm text-muted-foreground mb-6 bg-muted/30 p-3 rounded-xl border border-border backdrop-blur-xs">
        <button
          onClick={() => setCurrentPath("")}
          className="flex items-center gap-1 text-muted-foreground hover:text-emerald-500 font-medium transition-colors cursor-pointer"
        >
          <Home className="h-4 w-4" />
          <span>Root</span>
        </button>
        {parts.map((part, index) => {
          const pathUpTo = parts.slice(0, index + 1).join("/");
          return (
            <div key={pathUpTo} className="flex items-center gap-1.5">
              <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/50 shrink-0" />
              <button
                onClick={() => setCurrentPath(pathUpTo)}
                className="text-foreground hover:text-emerald-500 font-medium transition-colors cursor-pointer max-w-[120px] truncate"
              >
                {part}
              </button>
            </div>
          );
        })}
      </div>
    );
  };

  const renderUploadingCard = (item: UploadingItem) => {
    return (
      <div
        key={item.id}
        className="group relative aspect-square overflow-hidden rounded-xl border border-emerald-500/30 bg-muted/20 backdrop-blur-xs flex flex-col items-center justify-center p-4 text-center select-none shadow-md shadow-emerald-500/5"
      >
        {item.isVideo ? (
          <video
            src={item.previewUrl}
            className="absolute inset-0 w-full h-full object-cover opacity-20"
            muted
            playsInline
          />
        ) : (
          <Image
            src={item.previewUrl}
            alt={item.name}
            fill
            className="object-cover opacity-20"
            sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
          />
        )}

        <div className="absolute inset-0 bg-background/60 flex flex-col items-center justify-center p-3 gap-2 backdrop-blur-xs">
          {item.status === "failed" ? (
            <>
              <div className="rounded-full bg-destructive/10 text-destructive p-2 border border-destructive/20 animate-pulse">
                <X className="h-4 w-4" />
              </div>
              <p className="text-[10px] text-destructive font-semibold truncate max-w-full">
                Failed
              </p>
              <Button
                size="sm"
                variant="ghost"
                onClick={(e) => {
                  e.stopPropagation();
                  setUploadingItems(prev => prev.filter(x => x.id !== item.id));
                }}
                className="text-[9px] h-6 px-2 text-muted-foreground hover:text-foreground hover:bg-muted"
              >
                Dismiss
              </Button>
            </>
          ) : (
            <>
              <div className="relative h-11 w-11 flex items-center justify-center">
                <svg className="absolute w-full h-full transform -rotate-90">
                  <circle
                    cx="22"
                    cy="22"
                    r="18"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    fill="transparent"
                    className="text-muted/30"
                  />
                  <circle
                    cx="22"
                    cy="22"
                    r="18"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    fill="transparent"
                    strokeDasharray={2 * Math.PI * 18}
                    strokeDashoffset={2 * Math.PI * 18 * (1 - item.progress / 100)}
                    className="text-emerald-500 transition-all duration-300"
                  />
                </svg>
                <span className="text-[9px] font-bold text-foreground">
                  {item.progress}%
                </span>
              </div>
              <p className="text-[10px] text-muted-foreground font-semibold truncate max-w-full">
                {item.name}
              </p>
              <span className="text-[9px] text-emerald-400 font-semibold animate-pulse">
                Uploading...
              </span>
            </>
          )}
        </div>
      </div>
    );
  };

  const renderImageCard = (image: GalleryImage) => {
    const filename = image.key.split("/").pop() ?? "file";
    const cleanFilename = filename.replace(/^\d+_/, "");
    const isVideo = /\.(mp4|webm|ogg|mov)$/i.test(filename) || image.key.startsWith("videos/");

    return (
      <div
        key={image.key}
        onClick={() => {
          if (selectionMode) {
            toggleSelection(image.key);
          } else {
            const idx = activeFileList.findIndex(img => img.key === image.key);
            if (idx !== -1) {
              setLightboxIndex(idx);
              setIsLightboxOpen(true);
            }
          }
        }}
        className={`group relative aspect-square overflow-hidden rounded-xl border transition-all duration-300 ${
          selectedKeys.includes(image.key)
            ? "border-emerald-500 ring-2 ring-emerald-500/50 shadow-lg shadow-emerald-500/10"
            : "border-border hover:border-emerald-500/50 hover:shadow-md hover:shadow-emerald-500/5"
        } bg-card backdrop-blur-xs cursor-pointer`}
      >
        {selectionMode && (
          <div className="absolute top-2 left-2 z-10 transition-transform duration-200">
            <div className={`rounded-full border-2 h-6 w-6 flex items-center justify-center ${selectedKeys.includes(image.key) ? 'bg-emerald-500 border-emerald-500' : 'bg-background/60 border-muted-foreground hover:border-emerald-400'}`}>
              {selectedKeys.includes(image.key) && <CheckCircle2 className="h-4 w-4 text-white" />}
            </div>
          </div>
        )}

        {/* Action Button on each item */}
        {!selectionMode && (
          <div 
            className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity duration-200"
            onClick={(e) => e.stopPropagation()} // Stop propagation so lightbox doesn't open
          >
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="secondary"
                  size="icon"
                  className="h-7 w-7 bg-background/80 hover:bg-background border border-border backdrop-blur-xs shadow-md rounded-lg"
                >
                  <MoreVertical className="h-4 w-4 text-foreground" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-40 bg-card border-border text-foreground backdrop-blur-md"
              >
                <DropdownMenuItem
                  className="cursor-pointer flex items-center gap-2 text-xs"
                  onClick={() => void handleDownload(image)}
                >
                  <Download className="h-3.5 w-3.5 text-emerald-400" />
                  <span>Download</span>
                </DropdownMenuItem>
                
                <DropdownMenuItem
                  className="cursor-pointer flex items-center gap-2 text-xs"
                  onClick={() => void handleShare(image)}
                >
                  <Share2 className="h-3.5 w-3.5 text-emerald-400" />
                  <span>Share</span>
                </DropdownMenuItem>

                <DropdownMenuItem
                  className="cursor-pointer flex items-center gap-2 text-xs"
                  onClick={() => {
                    setActiveItem(image);
                    const nameParts = cleanFilename.split(".");
                    const nameWithoutExt = nameParts.length > 1 ? nameParts.slice(0, -1).join(".") : cleanFilename;
                    setRenameValue(nameWithoutExt);
                    setIsRenameDialogOpen(true);
                  }}
                >
                  <Edit2 className="h-3.5 w-3.5 text-emerald-400" />
                  <span>Rename</span>
                </DropdownMenuItem>

                <DropdownMenuItem
                  className="cursor-pointer flex items-center gap-2 text-xs"
                  onClick={() => {
                    setActiveItem(image);
                    setActionTargetFolder(currentPath || "root");
                    setIsMoveDialogOpen(true);
                  }}
                >
                  <MoveRight className="h-3.5 w-3.5 text-emerald-400" />
                  <span>Move</span>
                </DropdownMenuItem>

                <DropdownMenuItem
                  className="cursor-pointer flex items-center gap-2 text-xs"
                  onClick={() => {
                    setActiveItem(image);
                    setActionTargetFolder(currentPath || "root");
                    setIsCopyDialogOpen(true);
                  }}
                >
                  <Copy className="h-3.5 w-3.5 text-emerald-400" />
                  <span>Copy</span>
                </DropdownMenuItem>

                {canDelete && (
                  <>
                    <DropdownMenuSeparator className="bg-border" />
                    <DropdownMenuItem
                      className="cursor-pointer flex items-center gap-2 text-xs text-destructive focus:text-destructive focus:bg-destructive/10"
                      onClick={() => {
                        setActiveItem(image);
                        setIsDeleteDialogOpen(true);
                      }}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      <span>Delete</span>
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}

        {isVideo ? (
          <div className="relative w-full h-full bg-muted flex items-center justify-center">
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
            alt={cleanFilename}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
          />
        )}

        {/* Overlay on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Media info */}
        <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
          <p className="text-xs text-white truncate font-semibold drop-shadow-sm">
            {cleanFilename}
          </p>
          {image.size && (
            <p className="text-[10px] text-emerald-400 font-medium">
              {formatFileSize(image.size)}
            </p>
          )}
        </div>

        {/* Deleting overlay */}
        {deleting === image.key && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/60 backdrop-blur-xs">
            <Loader2 className="h-6 w-6 animate-spin text-emerald-400" />
          </div>
        )}
      </div>
    );
  };

  const activeUploadingItems = useMemo(() => {
    return uploadingItems.filter(item => item.targetFolder === currentPath);
  }, [uploadingItems, currentPath]);

  return (
    <div className="space-y-8">
      {/* Upload Zone & Folder configuration */}
      <Card className="overflow-hidden border-dashed border-2 border-emerald-500/20 hover:border-emerald-500/40 bg-gradient-to-br from-emerald-500/[0.02] dark:from-emerald-950/10 via-muted/10 to-card/20 shadow-lg hover:shadow-emerald-500/5 transition-all duration-300">
        <div className="p-4 border-b border-border bg-muted/20 flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="flex items-center gap-2">
            <FolderOpen className="h-4 w-4 text-emerald-400" />
            <span className="text-sm font-medium text-muted-foreground">Target Folder:</span>
            <span className="text-sm font-semibold text-foreground bg-muted px-2.5 py-1 rounded-md border border-border">
              {uploadTargetFolder === "root" ? "Root" : uploadTargetFolder}
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            <Select
              value={isNewFolder ? "new_folder" : uploadTargetFolder}
              onValueChange={(val) => {
                if (val === "new_folder") {
                  setIsNewFolder(true);
                } else {
                  setIsNewFolder(false);
                  setUploadTargetFolder(val);
                }
              }}
            >
              <SelectTrigger className="w-[180px] bg-background border-border text-foreground h-9">
                <SelectValue placeholder="Select folder" />
              </SelectTrigger>
              <SelectContent className="bg-card border-border text-foreground">
                <SelectItem value="root" className="text-muted-foreground">Root (No Folder)</SelectItem>
                {renderFolderOptions()}
                <SelectItem value="new_folder" className="text-emerald-500 font-semibold">
                  + Create New Folder
                </SelectItem>
              </SelectContent>
            </Select>

            {isNewFolder && (
              <Input
                placeholder="Folder name"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                className="h-9 w-[180px] bg-background border-border text-foreground focus-visible:ring-emerald-500"
              />
            )}
          </div>
        </div>

        <div
          {...getRootProps()}
          className={`cursor-pointer p-8 md:p-12 text-center transition-all duration-300 ${
            isDragActive
              ? "bg-emerald-500/10 border-emerald-400 scale-[1.01] shadow-emerald-500/10"
              : "hover:bg-emerald-500/[0.03]"
          }`}
        >
          <input {...getInputProps()} />
          <div className="flex flex-col items-center gap-4">
            <div
              className={`rounded-full p-4 transition-colors ${
                isDragActive
                  ? "bg-emerald-500/20 text-emerald-400"
                  : "bg-muted text-muted-foreground border border-border shadow-md"
              }`}
            >
              {isDragActive ? (
                <ImagePlus className="h-10 w-10 animate-pulse text-emerald-400" />
              ) : (
                <Upload className="h-10 w-10 text-muted-foreground" />
              )}
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-foreground">
                {isDragActive ? "Drop files here" : "Upload Gallery Media"}
              </h3>
              <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                Drag & drop media here to start uploading immediately. Images (max 10MB) & Videos (max 100MB).
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* Gallery Grid */}
      <Card className="border-border bg-card/45 backdrop-blur-md shadow-xl">
        <CardHeader className="border-b border-border pb-5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-emerald-500/10 p-2 border border-emerald-500/20 shadow-inner">
                <Images className="h-5 w-5 text-emerald-400" />
              </div>
              <div>
                <CardTitle className="text-foreground">
                  Media Gallery
                </CardTitle>
                <CardDescription className="text-muted-foreground">
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
                className="border-border bg-muted/60 text-foreground hover:bg-accent"
              >
                <FolderPlus className="h-4 w-4 mr-2 text-emerald-400" /> Create Folder
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsManageFoldersDialogOpen(true)}
                disabled={loading || selectionMode || existingFolders.length === 0}
                className="border-border bg-muted/60 text-foreground hover:bg-accent"
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
                className={selectionMode ? "bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-600 shadow-md shadow-emerald-600/10" : "border-border bg-muted/60 text-foreground hover:bg-accent"}
              >
                {selectionMode ? "Cancel Selection" : "Select Items"}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => void fetchImages()}
                disabled={loading || selectionMode}
                className="border-border bg-muted/60 text-foreground hover:bg-accent"
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
          ) : images.length === 0 && uploadingItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="rounded-full bg-muted border border-border p-4 mb-4 shadow-inner">
                <ImagePlus className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium text-muted-foreground">
                No items yet
              </h3>
              <p className="text-sm text-muted-foreground/80 mt-1">
                Upload your first gallery item above
              </p>
            </div>
          ) : (
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="mb-6 bg-muted/80 border border-border p-1 rounded-xl">
                <TabsTrigger value="explorer" className="data-[state=active]:bg-background data-[state=active]:text-emerald-500 rounded-lg">
                  <FolderOpen className="mr-2 h-4 w-4" /> Folder Explorer
                </TabsTrigger>
                <TabsTrigger value="all" className="data-[state=active]:bg-background data-[state=active]:text-emerald-500 rounded-lg">
                  <Images className="mr-2 h-4 w-4" /> All Items
                </TabsTrigger>
              </TabsList>

              <TabsContent value="explorer" className="outline-none mt-0">
                {renderBreadcrumbs()}

                {/* Subfolders list */}
                {currentSubfolders.length > 0 && (
                  <div className="space-y-3 mb-8">
                    <h4 className="text-xs font-bold text-muted-foreground/80 uppercase tracking-wider">Folders</h4>
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
                            className="flex items-center gap-3 p-4 rounded-xl border border-border bg-muted/30 hover:border-emerald-500/50 hover:bg-muted/60 cursor-pointer transition-all duration-200 group relative select-none"
                          >
                            <Folder className="h-8 w-8 text-emerald-400 group-hover:scale-105 transition-transform duration-200 shrink-0" />
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-semibold text-foreground truncate group-hover:text-foreground">
                                {folderName}
                              </p>
                              <p className="text-xs text-muted-foreground/80">
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
                  <h4 className="text-xs font-bold text-muted-foreground/80 uppercase tracking-wider">Files</h4>
                  {currentFiles.length === 0 && activeUploadingItems.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-center bg-muted/10 border border-dashed border-border rounded-xl">
                      <p className="text-muted-foreground text-sm">No files in this folder.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 animate-in fade-in duration-200">
                      {activeUploadingItems.map(renderUploadingCard)}
                      {currentFiles.map(renderImageCard)}
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="all" className="outline-none mt-0">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 animate-in fade-in duration-200">
                  {uploadingItems.map(renderUploadingCard)}
                  {images.map(renderImageCard)}
                </div>
              </TabsContent>
            </Tabs>
          )}
        </CardContent>
      </Card>

      {/* Selection Action Bar */}
      {selectionMode && selectedKeys.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 rounded-full border border-border bg-card/95 backdrop-blur-lg px-6 py-3 shadow-2xl animate-in slide-in-from-bottom-10">
          <span className="text-foreground font-semibold mr-4 text-sm tracking-wide">{selectedKeys.length} selected</span>
          <Button size="sm" variant="outline" className="border-border bg-muted/60 text-foreground hover:bg-accent rounded-full text-xs" onClick={() => setIsMoveDialogOpen(true)}>
            <MoveRight className="h-3.5 w-3.5 mr-1.5 text-emerald-400" /> Move
          </Button>
          <Button size="sm" variant="outline" className="border-border bg-muted/60 text-foreground hover:bg-accent rounded-full text-xs" onClick={() => setIsCopyDialogOpen(true)}>
            <Copy className="h-3.5 w-3.5 mr-1.5 text-emerald-400" /> Copy
          </Button>
          {canDelete && (
            <Button size="sm" variant="destructive" className="rounded-full bg-destructive hover:bg-destructive/90 text-destructive-foreground text-xs shadow-md shadow-red-900/10" onClick={() => void handleBulkDelete()} disabled={actionLoading}>
              <Trash2 className="h-3.5 w-3.5 mr-1.5" /> Delete
            </Button>
          )}
        </div>
      )}

      {/* Folder Explorer Dialogs */}
      <Dialog open={isFolderDialogOpen} onOpenChange={setIsFolderDialogOpen}>
        <DialogContent className="bg-card border-border text-foreground backdrop-blur-xl sm:max-w-md shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-foreground font-semibold">Create New Folder</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Input
              value={newStandaloneFolder}
              onChange={e => setNewStandaloneFolder(e.target.value)}
              placeholder="e.g. Sports/Football or videos/Events"
              className="bg-background border-border text-foreground placeholder-muted-foreground focus-visible:ring-emerald-500/50 focus-visible:border-emerald-500/30"
            />
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setIsFolderDialogOpen(false)} className="border-border hover:bg-accent text-foreground bg-transparent">Cancel</Button>
            <Button onClick={() => void handleCreateFolder()} disabled={!newStandaloneFolder.trim() || actionLoading} className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-md">
              {actionLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <FolderPlus className="h-4 w-4 mr-2" />} Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isManageFoldersDialogOpen} onOpenChange={setIsManageFoldersDialogOpen}>
        <DialogContent className="bg-card border-border text-foreground backdrop-blur-xl sm:max-w-md shadow-2xl">
          <DialogHeader><DialogTitle className="text-foreground font-semibold">Manage Folders</DialogTitle></DialogHeader>
          <div className="py-4 max-h-[60vh] overflow-y-auto space-y-2 pr-1">
            {existingFolders.length === 0 ? (
              <p className="text-muted-foreground text-sm text-center py-4">No folders found.</p>
            ) : (
              existingFolders.map(folder => (
                <div key={folder} className="flex items-center gap-3 p-3 rounded-xl border border-border bg-muted/30">
                  <div
                    className={`h-5 w-5 rounded border flex items-center justify-center cursor-pointer transition-colors ${selectedFolders.includes(folder) ? 'bg-emerald-500 border-emerald-500' : 'border-border hover:border-emerald-400'}`}
                    onClick={() => {
                      setSelectedFolders(prev =>
                        prev.includes(folder) ? prev.filter(f => f !== folder) : [...prev, folder]
                      );
                    }}
                  >
                    {selectedFolders.includes(folder) && <CheckCircle2 className="h-3.5 w-3.5 text-white" />}
                  </div>
                  <FolderOpen className="h-4 w-4 text-emerald-400" />
                  <span className="text-sm font-medium flex-1 text-foreground">{folder}</span>
                  <span className="text-xs text-muted-foreground">{imagesByFolder[folder]?.length ?? 0} items</span>
                </div>
              ))
            )}
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setIsManageFoldersDialogOpen(false)} className="border-border hover:bg-accent text-foreground bg-transparent">Cancel</Button>
            <Button onClick={() => void handleDeleteFolders()} disabled={selectedFolders.length === 0 || actionLoading} variant="destructive" className="bg-destructive hover:bg-destructive/90 text-destructive-foreground">
              {actionLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Trash2 className="h-4 w-4 mr-2" />} Delete Selected
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Move & Copy Dialogs */}
      <Dialog open={isMoveDialogOpen} onOpenChange={(open) => {
        setIsMoveDialogOpen(open);
        if (!open) {
          setActiveItem(null);
          setIsNewActionFolder(false);
          setNewActionFolderName("");
        }
      }}>
        <DialogContent className="bg-card border-border text-foreground backdrop-blur-xl sm:max-w-md shadow-2xl">
          <DialogHeader><DialogTitle className="text-foreground font-semibold">Move {activeItem ? "1 item" : `${selectedKeys.length} items`}</DialogTitle></DialogHeader>
          <div className="py-4 space-y-4">
            <Select value={isNewActionFolder ? "new_folder" : actionTargetFolder} onValueChange={v => { if (v === "new_folder") setIsNewActionFolder(true); else { setIsNewActionFolder(false); setActionTargetFolder(v); } }}>
              <SelectTrigger className="bg-background border-border text-foreground focus-visible:ring-emerald-500/50">
                <SelectValue placeholder="Select target folder" />
              </SelectTrigger>
              <SelectContent className="bg-card border-border text-foreground">
                <SelectItem value="root" className="text-muted-foreground">No Folder (Root)</SelectItem>
                {renderFolderOptions()}
                <SelectItem value="new_folder" className="text-emerald-400 font-semibold">+ Create New Folder</SelectItem>
              </SelectContent>
            </Select>
            {isNewActionFolder && (
              <Input
                value={newActionFolderName}
                onChange={e => setNewActionFolderName(e.target.value)}
                placeholder="e.g. Sports/Football or videos/Events"
                className="bg-background border-border text-foreground placeholder-muted-foreground focus-visible:ring-emerald-500/50 focus-visible:border-emerald-500/30"
              />
            )}
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setIsMoveDialogOpen(false)} className="border-border hover:bg-accent text-foreground bg-transparent">Cancel</Button>
            <Button onClick={() => void handleBulkAction("move")} disabled={actionLoading || (isNewActionFolder && !newActionFolderName.trim())} className="bg-emerald-600 hover:bg-emerald-700 text-white">
              {actionLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <MoveRight className="h-4 w-4 mr-2" />} Move
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isCopyDialogOpen} onOpenChange={(open) => {
        setIsCopyDialogOpen(open);
        if (!open) {
          setActiveItem(null);
          setIsNewActionFolder(false);
          setNewActionFolderName("");
        }
      }}>
        <DialogContent className="bg-card border-border text-foreground backdrop-blur-xl sm:max-w-md shadow-2xl">
          <DialogHeader><DialogTitle className="text-foreground font-semibold">Copy {activeItem ? "1 item" : `${selectedKeys.length} items`}</DialogTitle></DialogHeader>
          <div className="py-4 space-y-4">
            <Select value={isNewActionFolder ? "new_folder" : actionTargetFolder} onValueChange={v => { if (v === "new_folder") setIsNewActionFolder(true); else { setIsNewActionFolder(false); setActionTargetFolder(v); } }}>
              <SelectTrigger className="bg-background border-border text-foreground focus-visible:ring-emerald-500/50">
                <SelectValue placeholder="Select target folder" />
              </SelectTrigger>
              <SelectContent className="bg-card border-border text-foreground">
                <SelectItem value="root" className="text-muted-foreground">No Folder (Root)</SelectItem>
                {renderFolderOptions()}
                <SelectItem value="new_folder" className="text-emerald-400 font-semibold">+ Create New Folder</SelectItem>
              </SelectContent>
            </Select>
            {isNewActionFolder && (
              <Input
                value={newActionFolderName}
                onChange={e => setNewActionFolderName(e.target.value)}
                placeholder="e.g. Sports/Football or videos/Events"
                className="bg-background border-border text-foreground placeholder-muted-foreground focus-visible:ring-emerald-500/50 focus-visible:border-emerald-500/30"
              />
            )}
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setIsCopyDialogOpen(false)} className="border-border hover:bg-accent text-foreground bg-transparent">Cancel</Button>
            <Button onClick={() => void handleBulkAction("copy")} disabled={actionLoading || (isNewActionFolder && !newActionFolderName.trim())} className="bg-emerald-600 hover:bg-emerald-700 text-white">
              {actionLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Copy className="h-4 w-4 mr-2" />} Copy
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Rename Dialog */}
      <Dialog open={isRenameDialogOpen} onOpenChange={(open) => {
        setIsRenameDialogOpen(open);
        if (!open) {
          setActiveItem(null);
          setRenameValue("");
        }
      }}>
        <DialogContent className="bg-card border-border text-foreground backdrop-blur-xl sm:max-w-md shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-foreground font-semibold">Rename Item</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Input
              value={renameValue}
              onChange={e => setRenameValue(e.target.value)}
              placeholder="Enter new name"
              className="bg-background border-border text-foreground placeholder-muted-foreground focus-visible:ring-emerald-500/50 focus-visible:border-emerald-500/30"
              disabled={actionLoading}
            />
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setIsRenameDialogOpen(false)} className="border-border hover:bg-accent text-foreground bg-transparent" disabled={actionLoading}>Cancel</Button>
            <Button onClick={() => void handleRename()} disabled={!renameValue.trim() || actionLoading} className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-md">
              {actionLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null} Rename
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={(open) => {
        setIsDeleteDialogOpen(open);
        if (!open) setActiveItem(null);
      }}>
        <AlertDialogContent className="bg-card border-border text-foreground backdrop-blur-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-foreground">
              Delete {activeItem && (/\.(mp4|webm|ogg|mov)$/i.test(activeItem.key) || activeItem.key.startsWith("videos/")) ? "Video" : "Image"}?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              This action cannot be undone. This item will be
              permanently removed from the school gallery.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-border text-muted-foreground hover:bg-accent">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => activeItem && void handleDelete(activeItem.key)}
              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
              disabled={deleting === activeItem?.key}
            >
              {deleting === activeItem?.key ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Lightbox Media Viewer */}
      {isLightboxOpen && activeMedia && (
        <div className="fixed inset-0 z-50 flex flex-col bg-black/95 backdrop-blur-md text-white select-none animate-in fade-in duration-300">
          
          {/* Header */}
          <div className="flex items-center justify-between p-4 bg-gradient-to-b from-black/80 to-transparent">
            <div className="min-w-0">
              <h3 className="text-sm font-semibold truncate max-w-xs sm:max-w-md md:max-w-lg">
                {activeMedia.key.split("/").pop()?.replace(/^\d+_/, "") ?? "Media"}
              </h3>
              {activeMedia.size && (
                <p className="text-xs text-muted-foreground mt-0.5">
                  {formatFileSize(activeMedia.size)}
                </p>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => void handleDownload(activeMedia)}
                className="h-9 w-9 text-muted-foreground hover:text-white hover:bg-white/10"
                title="Download"
              >
                <Download className="h-5 w-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => void handleShare(activeMedia)}
                className="h-9 w-9 text-muted-foreground hover:text-white hover:bg-white/10"
                title="Share"
              >
                <Share2 className="h-5 w-5" />
              </Button>
              <div className="h-5 w-px bg-white/20 mx-1" />
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  setIsLightboxOpen(false);
                  setLightboxIndex(null);
                }}
                className="h-9 w-9 text-muted-foreground hover:text-white hover:bg-white/10"
                title="Close"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 relative flex items-center justify-center p-4">
            
            {/* Left Navigation Arrow */}
            {activeFileList.length > 1 && (
              <Button
                variant="ghost"
                size="icon"
                onClick={handlePrevMedia}
                className="absolute left-4 z-10 h-12 w-12 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-white shadow-xl hover:scale-105 transition-all duration-200"
              >
                <ChevronLeft className="h-6 w-6" />
              </Button>
            )}

            {/* Media Item Container */}
            <div className="relative max-w-4xl max-h-[80vh] flex items-center justify-center overflow-hidden transition-all duration-300">
              {/\.(mp4|webm|ogg|mov)$/i.test(activeMedia.key) || activeMedia.key.startsWith("videos/") ? (
                <video
                  src={activeMedia.url}
                  className="max-w-full max-h-[80vh] rounded-lg shadow-2xl border border-white/5"
                  controls
                  autoPlay
                  playsInline
                />
              ) : (
                <div className="relative overflow-hidden flex items-center justify-center max-w-full max-h-[80vh]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={activeMedia.url}
                    alt="Lightbox View"
                    style={{ transform: `scale(${zoomScale})` }}
                    className="max-w-full max-h-[80vh] rounded-lg shadow-2xl border border-white/5 object-contain transition-transform duration-200 select-none pointer-events-none"
                  />
                </div>
              )}
            </div>

            {/* Right Navigation Arrow */}
            {activeFileList.length > 1 && (
              <Button
                variant="ghost"
                size="icon"
                onClick={handleNextMedia}
                className="absolute right-4 z-10 h-12 w-12 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-white shadow-xl hover:scale-105 transition-all duration-200"
              >
                <ChevronRight className="h-6 w-6" />
              </Button>
            )}
          </div>

          {/* Footer with zoom controls for images */}
          {!(/\.(mp4|webm|ogg|mov)$/i.test(activeMedia.key) || activeMedia.key.startsWith("videos/")) && (
            <div className="p-4 bg-gradient-to-t from-black/80 to-transparent flex justify-center items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                disabled={zoomScale <= 0.5}
                onClick={() => setZoomScale(prev => Math.max(0.5, prev - 0.25))}
                className="h-8 w-8 text-muted-foreground hover:text-white hover:bg-white/10"
              >
                <ZoomOut className="h-4 w-4" />
              </Button>
              <span className="text-xs font-semibold w-12 text-center text-muted-foreground">
                {Math.round(zoomScale * 100)}%
              </span>
              <Button
                variant="ghost"
                size="icon"
                disabled={zoomScale >= 4}
                onClick={() => setZoomScale(prev => Math.min(4, prev + 0.25))}
                className="h-8 w-8 text-muted-foreground hover:text-white hover:bg-white/10"
              >
                <ZoomIn className="h-4 w-4" />
              </Button>
            </div>
          )}

          {/* Navigation Dot Indicators */}
          {activeFileList.length > 1 && activeFileList.length <= 15 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5 pb-2">
              {activeFileList.map((media, idx) => (
                <div
                  key={media.key}
                  onClick={() => setLightboxIndex(idx)}
                  className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${idx === lightboxIndex ? "w-4 bg-emerald-500" : "w-1.5 bg-white/30 hover:bg-white/50"}`}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
