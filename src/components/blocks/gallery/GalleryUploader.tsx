"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
import Image from "next/image";
import {
  Upload,
  Trash2,
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
  Maximize2,
  Minimize2,
  RefreshCw,
  Plus,
  Menu,
  ArrowLeft,
} from "lucide-react";
import { Button } from "~/components/ui/button";
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

interface ExplorerWindow {
  id: string;
  path: string; // "" = root, "__all_items__" = all, otherwise path like "Sports"
  x: number;
  y: number;
  width: number;
  height: number;
  isMaximized: boolean;
  zIndex: number;
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

  // Multi-window state
  const [windows, setWindows] = useState<ExplorerWindow[]>([
    {
      id: "root-window",
      path: "",
      x: 15,
      y: 15,
      width: 600,
      height: 480,
      isMaximized: false,
      zIndex: 1,
    },
  ]);
  const [nextZIndex, setNextZIndex] = useState(2);
  const [isMobile, setIsMobile] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Inline inputs state
  const [createFolderWindowId, setCreateFolderWindowId] = useState<string | null>(null);
  const [newFolderNameInline, setNewFolderNameInline] = useState("");

  // Upload State
  const [uploadingItems, setUploadingItems] = useState<UploadingItem[]>([]);

  // Selection & Action States
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);
  const [actionLoading, setActionLoading] = useState(false);

  // Manage Folders Dialog
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

  // Single-Folder Delete States
  const [isFolderDeleteDialogOpen, setIsFolderDeleteDialogOpen] = useState(false);
  const [folderToDelete, setFolderToDelete] = useState<string | null>(null);


  // Lightbox State
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [zoomScale, setZoomScale] = useState(1);
  const [lightboxSourceList, setLightboxSourceList] = useState<GalleryImage[]>([]);

  const activeMedia = useMemo(() => {
    return lightboxIndex !== null ? lightboxSourceList[lightboxIndex] ?? null : null;
  }, [lightboxIndex, lightboxSourceList]);

  // Detect mobile screen sizes
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) {
        setSidebarOpen(false);
      } else {
        setSidebarOpen(true);
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

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
      uploadingItems.forEach((item) => {
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

  // Multi-window functions
  const openFolderWindow = useCallback(
    (path: string) => {
      const existing = windows.find((w) => w.path === path);
      if (existing) {
        setWindows((prev) =>
          prev.map((w) =>
            w.id === existing.id ? { ...w, zIndex: nextZIndex } : w
          )
        );
        setNextZIndex((prev) => prev + 1);
        return;
      }

      const offset = (windows.length % 6) * 25;
      const newWindow: ExplorerWindow = {
        id: `window-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        path,
        x: 25 + offset,
        y: 25 + offset,
        width: 600,
        height: 485,
        isMaximized: false,
        zIndex: nextZIndex,
      };

      setWindows((prev) => [...prev, newWindow]);
      setNextZIndex((prev) => prev + 1);
    },
    [windows, nextZIndex]
  );

  const closeWindow = useCallback((windowId: string) => {
    setWindows((prev) => prev.filter((w) => w.id !== windowId));
  }, []);

  const toggleMaximizeWindow = useCallback((windowId: string) => {
    setWindows((prev) =>
      prev.map((w) =>
        w.id === windowId ? { ...w, isMaximized: !w.isMaximized } : w
      )
    );
  }, []);

  const focusWindow = useCallback(
    (windowId: string) => {
      setWindows((prev) =>
        prev.map((w) => (w.id === windowId ? { ...w, zIndex: nextZIndex } : w))
      );
      setNextZIndex((prev) => prev + 1);
    },
    [nextZIndex]
  );

  const navigateWindow = useCallback((windowId: string, newPath: string) => {
    setWindows((prev) =>
      prev.map((w) => (w.id === windowId ? { ...w, path: newPath } : w))
    );
  }, []);

  // Close invalid windows (e.g. if their folder is deleted)
  useEffect(() => {
    if (loading || apiFolders.length === 0) return;
    setWindows((prev) =>
      prev.filter(
        (w) =>
          w.path === "" ||
          w.path === "__all_items__" ||
          existingFolders.includes(w.path)
      )
    );
  }, [existingFolders, loading, apiFolders]);

  // Next / Prev handlers for lightbox
  const handleNextMedia = useCallback(() => {
    if (lightboxIndex === null || lightboxSourceList.length === 0) return;
    setLightboxIndex((lightboxIndex + 1) % lightboxSourceList.length);
  }, [lightboxIndex, lightboxSourceList]);

  const handlePrevMedia = useCallback(() => {
    if (lightboxIndex === null || lightboxSourceList.length === 0) return;
    setLightboxIndex(
      (lightboxIndex - 1 + lightboxSourceList.length) % lightboxSourceList.length
    );
  }, [lightboxIndex, lightboxSourceList]);

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

  const handleOpenLightbox = (image: GalleryImage, sourceList: GalleryImage[]) => {
    const idx = sourceList.findIndex((img) => img.key === image.key);
    if (idx !== -1) {
      setLightboxSourceList(sourceList);
      setLightboxIndex(idx);
      setIsLightboxOpen(true);
    }
  };

  // Parallel Upload Implementation
  const startUpload = useCallback(
    async (file: File, folder: string) => {
      const tempId = Math.random().toString(36).substring(7);
      const nameWithoutExt =
        file.name.substring(0, file.name.lastIndexOf(".")) || file.name;
      const isVideo = file.type.startsWith("video/");
      const previewUrl = URL.createObjectURL(file);

      setUploadingItems((prev) => [
        ...prev,
        {
          id: tempId,
          name: nameWithoutExt,
          progress: 0,
          previewUrl,
          isVideo,
          status: "uploading",
          targetFolder: folder,
        },
      ]);

      try {
        await new Promise<UploadResponse>((resolve, reject) => {
          const xhr = new XMLHttpRequest();
          xhr.open("POST", "/api/gallery/upload");

          xhr.upload.onprogress = (event) => {
            if (event.lengthComputable) {
              const progress = Math.round((event.loaded / event.total) * 100);
              setUploadingItems((prev) =>
                prev.map((item) =>
                  item.id === tempId ? { ...item, progress } : item
                )
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
        setUploadingItems((prev) => prev.filter((item) => item.id !== tempId));
        URL.revokeObjectURL(previewUrl);
        toast.success(`Uploaded ${nameWithoutExt}`);
        await fetchImages();
      } catch (error) {
        setUploadingItems((prev) =>
          prev.map((item) =>
            item.id === tempId
              ? { ...item, status: "failed", error: (error as Error).message }
              : item
          )
        );
        toast.error(
          `Failed to upload ${nameWithoutExt}: ${(error as Error).message}`
        );
      }
    },
    [fetchImages]
  );

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
        setIsDeleteDialogOpen(false);
        setActiveItem(null);
      } catch {
        toast.error("Failed to delete item");
      } finally {
        setDeleting(null);
      }
    },
    []
  );

  // Bulk Actions
  const toggleSelection = (key: string) => {
    setSelectedKeys((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  const handleCreateFolderInPath = async (parentPath: string, name: string) => {
    if (!name.trim()) return;
    const fullFolderName = parentPath
      ? `${parentPath}/${name.trim()}`
      : name.trim();
    try {
      setActionLoading(true);
      const res = await fetch("/api/gallery/folder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ folderName: fullFolderName }),
      });
      if (!res.ok) throw new Error("Failed to create folder");
      toast.success("Folder created");
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

    const target = isNewActionFolder
      ? newActionFolderName.trim()
      : actionTargetFolder === "root"
      ? ""
      : actionTargetFolder;

    try {
      setActionLoading(true);
      const res = await fetch(`/api/gallery/${action}`, {
        method: "POST",
        body: JSON.stringify({ keys: keysToAct, targetFolder: target }),
      });
      if (!res.ok) throw new Error(`Failed to ${action}`);
      toast.success(
        `Items ${action === "move" ? "moved" : "copied"} successfully`
      );

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
    if (
      !confirm(`Are you sure you want to delete ${selectedKeys.length} items?`)
    )
      return;
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
    if (
      !confirm(
        `Are you sure you want to delete ${selectedFolders.length} folder(s) and all their contents? This cannot be undone.`
      )
    )
      return;
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

  const executeFolderDelete = async (folderPath: string) => {
    try {
      setActionLoading(true);
      const res = await fetch("/api/gallery/folder", {
        method: "DELETE",
        body: JSON.stringify({ folders: [folderPath] }),
      });
      if (!res.ok) {
        const data = (await res.json()) as { error?: string };
        throw new Error(data.error ?? "Failed to delete folder");
      }
      toast.success("Folder deleted successfully");

      // Close windows that belong to this folder or its subfolders
      setWindows((prev) =>
        prev.filter(
          (w) => w.path !== folderPath && !w.path.startsWith(folderPath + "/")
        )
      );

      await fetchImages();
    } catch (err) {
      toast.error((err as Error).message || "Failed to delete folder");
    } finally {
      setActionLoading(false);
      setIsFolderDeleteDialogOpen(false);
      setFolderToDelete(null);
    }
  };

  const triggerDeleteFolder = async (folderPath: string) => {
    const isNested = folderPath.includes("/");
    const hasMediaFiles = getFilesCountForPath(folderPath) > 0;

    if (isNested && hasMediaFiles) {
      setFolderToDelete(folderPath);
      setIsFolderDeleteDialogOpen(true);
    } else {
      if (
        confirm(
          `Are you sure you want to delete folder "${folderPath}"? This will delete all its contents.`
        )
      ) {
        await executeFolderDelete(folderPath);
      }
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const renderFolderOptions = () => {
    return existingFolders.map((f) => {
      const parts = f.split("/");
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

  // Drag and Drop files inside explorer windows
  const handleFileDragStart = (
    e: React.DragEvent,
    key: string,
    sourcePath: string
  ) => {
    e.dataTransfer.setData(
      "application/json",
      JSON.stringify({ type: "file", key, sourcePath })
    );
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleFolderDrop = async (e: React.DragEvent, targetFolderPath: string) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const dataStr = e.dataTransfer.getData("application/json");
      if (!dataStr) return;
      const data = JSON.parse(dataStr) as {
        type: string;
        key: string;
        sourcePath: string;
      };
      if (data.type === "file") {
        if (data.sourcePath === targetFolderPath) return;
        setActionLoading(true);
        const res = await fetch("/api/gallery/move", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            keys: [data.key],
            targetFolder: targetFolderPath,
          }),
        });
        if (!res.ok) throw new Error("Failed to move file");
        toast.success("File moved successfully");
        await fetchImages();
      }
    } catch {
      toast.error("Failed to move file");
    } finally {
      setActionLoading(false);
    }
  };

  const handleWindowDrop = async (e: React.DragEvent, windowPath: string) => {
    e.preventDefault();
    e.stopPropagation();
    const dataStr = e.dataTransfer.getData("application/json");
    if (dataStr) {
      try {
        const data = JSON.parse(dataStr) as {
          type: string;
          key: string;
          sourcePath: string;
        };
        if (data.type === "file") {
          if (data.sourcePath === windowPath) return;
          setActionLoading(true);
          const res = await fetch("/api/gallery/move", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              keys: [data.key],
              targetFolder: windowPath,
            }),
          });
          if (!res.ok) throw new Error("Failed to move file");
          toast.success("File moved successfully");
          await fetchImages();
        }
      } catch {
        toast.error("Failed to move file");
      } finally {
        setActionLoading(false);
      }
    } else if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const files = Array.from(e.dataTransfer.files);
      const validFiles = files.filter((file) => {
        const isVideo = file.type.startsWith("video/");
        const maxSize = isVideo ? MAX_VIDEO_SIZE : MAX_IMAGE_SIZE;
        if (file.size > maxSize) {
          toast.error(`${file.name} exceeds ${isVideo ? "100MB" : "10MB"} limit`);
          return false;
        }
        return true;
      });

      if (validFiles.length > 0) {
        validFiles.forEach((file) => {
          void startUpload(file, windowPath);
        });
      }
    }
  };

  // Window drag implementation
  const handleMouseDown = (windowId: string, e: React.MouseEvent) => {
    if (e.button !== 0) return;
    const target = e.target as HTMLElement;
    if (target.closest("button") || target.closest("input")) return;

    focusWindow(windowId);

    const windowItem = windows.find((w) => w.id === windowId);
    if (!windowItem || windowItem.isMaximized) return;

    const startX = e.clientX;
    const startY = e.clientY;
    const initialX = windowItem.x;
    const initialY = windowItem.y;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const dx = moveEvent.clientX - startX;
      const dy = moveEvent.clientY - startY;

      setWindows((prev) =>
        prev.map((w) => {
          if (w.id === windowId) {
            const newX = Math.max(0, initialX + dx);
            const newY = Math.max(0, initialY + dy);
            return { ...w, x: newX, y: newY };
          }
          return w;
        })
      );
    };

    const handleMouseUp = () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  // Subfolders helper
  const getSubfoldersForPath = (path: string) => {
    const subs = new Set<string>();
    existingFolders.forEach((folder) => {
      if (path === "") {
        const parts = folder.split("/");
        subs.add(parts[0]!);
      } else {
        if (folder.startsWith(path + "/")) {
          const relative = folder.substring(path.length + 1);
          const segment = relative.split("/")[0]!;
          subs.add(path + "/" + segment);
        }
      }
    });
    return Array.from(subs).sort();
  };

  // Files helper
  const getFilesForPath = (path: string) => {
    if (path === "__all_items__") return images;

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
      return imgFolder === path;
    });
  };

  // Files count helper
  const getFilesCountForPath = (path: string) => {
    return images.filter((img) => {
      let imgFolder = "";
      if (img.key.startsWith("gallery/")) {
        const parts = img.key.split("/");
        if (parts.length > 2) imgFolder = parts.slice(1, -1).join("/");
      } else if (img.key.startsWith("videos/")) {
        const parts = img.key.split("/");
        if (parts.length > 1) imgFolder = parts.slice(0, -1).join("/");
      }
      return imgFolder === path || imgFolder.startsWith(path + "/");
    }).length;
  };

  const renderUploadingCard = (item: UploadingItem) => {
    return (
      <div
        key={item.id}
        className="group relative aspect-square overflow-hidden rounded-xl border border-emerald-500/30 bg-muted/20 backdrop-blur-xs flex flex-col items-center justify-center p-4 text-center select-none shadow-md"
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
            sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 20vw"
          />
        )}

        <div className="absolute inset-0 bg-background/60 flex flex-col items-center justify-center p-3 gap-2">
          {item.status === "failed" ? (
            <>
              <div className="rounded-full bg-destructive/10 text-destructive p-1.5 border border-destructive/20 animate-pulse">
                <X className="h-3.5 w-3.5" />
              </div>
              <p className="text-[9px] text-destructive font-semibold truncate max-w-full">
                Failed
              </p>
              <Button
                size="sm"
                variant="ghost"
                onClick={(e) => {
                  e.stopPropagation();
                  setUploadingItems((prev) =>
                    prev.filter((x) => x.id !== item.id)
                  );
                }}
                className="text-[9px] h-5 px-1.5 text-muted-foreground"
              >
                Dismiss
              </Button>
            </>
          ) : (
            <>
              <div className="relative h-9 w-9 flex items-center justify-center">
                <svg className="absolute w-full h-full transform -rotate-90">
                  <circle
                    cx="18"
                    cy="18"
                    r="15"
                    stroke="currentColor"
                    strokeWidth="2"
                    fill="transparent"
                    className="text-muted/30"
                  />
                  <circle
                    cx="18"
                    cy="18"
                    r="15"
                    stroke="currentColor"
                    strokeWidth="2"
                    fill="transparent"
                    strokeDasharray={2 * Math.PI * 15}
                    strokeDashoffset={
                      2 * Math.PI * 15 * (1 - item.progress / 100)
                    }
                    className="text-emerald-500 transition-all duration-300"
                  />
                </svg>
                <span className="text-[8px] font-bold text-foreground">
                  {item.progress}%
                </span>
              </div>
              <p className="text-[9px] text-muted-foreground font-semibold truncate max-w-full">
                {item.name}
              </p>
            </>
          )}
        </div>
      </div>
    );
  };

  const renderImageCard = (image: GalleryImage, windowPath: string) => {
    const filename = image.key.split("/").pop() ?? "file";
    const cleanFilename = filename.replace(/^\d+_/, "");
    const isVideo =
      /\.(mp4|webm|ogg|mov)$/i.test(filename) ||
      image.key.startsWith("videos/");

    return (
      <div
        key={image.key}
        draggable
        onDragStart={(e) => handleFileDragStart(e, image.key, windowPath)}
        onClick={() => {
          if (selectionMode) {
            toggleSelection(image.key);
          } else {
            const list = getFilesForPath(windowPath);
            handleOpenLightbox(image, list);
          }
        }}
        className={`group relative aspect-square overflow-hidden rounded-xl border transition-all duration-300 ${
          selectedKeys.includes(image.key)
            ? "border-emerald-500 ring-2 ring-emerald-500/50 shadow-lg"
            : "border-border hover:border-emerald-500/50 hover:shadow-md"
        } bg-card backdrop-blur-xs cursor-pointer`}
      >
        {selectionMode && (
          <div className="absolute top-2 left-2 z-10">
            <div
              className={`rounded-full border h-5 w-5 flex items-center justify-center ${
                selectedKeys.includes(image.key)
                  ? "bg-emerald-500 border-emerald-500"
                  : "bg-background/60 border-muted-foreground"
              }`}
            >
              {selectedKeys.includes(image.key) && (
                <CheckCircle2 className="h-3 w-3 text-white" />
              )}
            </div>
          </div>
        )}

        {/* Action Button on each item */}
        {!selectionMode && (
          <div
            className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="secondary"
                  size="icon"
                  className="h-6 w-6 bg-background/80 border border-border backdrop-blur-xs rounded-md shadow-md"
                >
                  <MoreVertical className="h-3.5 w-3.5 text-foreground" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-36 bg-card border-border text-foreground backdrop-blur-md"
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
                    const nameWithoutExt =
                      nameParts.length > 1
                        ? nameParts.slice(0, -1).join(".")
                        : cleanFilename;
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
                    setActionTargetFolder(windowPath || "root");
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
                    setActionTargetFolder(windowPath || "root");
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
              className="w-full h-full object-cover opacity-70"
              preload="metadata"
              muted
              playsInline
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 p-2 group-hover:scale-110 transition-transform">
                <Play className="h-4 w-4 fill-current" />
              </div>
            </div>
          </div>
        ) : (
          <Image
            src={image.url}
            alt={cleanFilename}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 20vw"
          />
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        <div className="absolute bottom-0 left-0 right-0 p-2 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
          <p className="text-[10px] text-white truncate font-semibold">
            {cleanFilename}
          </p>
          {image.size && (
            <p className="text-[8px] text-emerald-400 font-medium">
              {formatFileSize(image.size)}
            </p>
          )}
        </div>

        {deleting === image.key && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/60">
            <Loader2 className="h-5 w-5 animate-spin text-emerald-400" />
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Workspace Dashboard Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-card border border-border p-4 rounded-2xl shadow-xl backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-emerald-500/10 p-2 border border-emerald-500/20">
            <Images className="h-5 w-5 text-emerald-400" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-foreground">Media Explorer Workspace</h2>
            <p className="text-xs text-muted-foreground">
              {loading
                ? "Syncing items..."
                : `Total: ${images.length} item${images.length !== 1 ? "s" : ""} across ${existingFolders.length} folder${existingFolders.length !== 1 ? "s" : ""}`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isMobile && (
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 text-foreground border-border bg-background"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              <Menu className="h-4 w-4" />
            </Button>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={() => openFolderWindow("")}
            className="border-border bg-background hover:bg-accent text-foreground text-xs"
          >
            <Home className="h-3.5 w-3.5 mr-1 text-emerald-400" /> Open Root Explorer
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => void fetchImages()}
            disabled={loading}
            className="border-border bg-background hover:bg-accent text-foreground text-xs"
          >
            <RefreshCw className="h-3.5 w-3.5 mr-1 text-emerald-400 animate-hover" /> Refresh All
          </Button>
        </div>
      </div>

      {/* Main Workspace Layout */}
      <div className="flex border border-border rounded-2xl overflow-hidden bg-card/45 backdrop-blur-md shadow-2xl relative min-h-[600px]">
        {/* Left Sidebar */}
        {sidebarOpen && (
          <div
            className={`w-60 border-r border-border bg-card/70 backdrop-blur-md flex flex-col shrink-0 z-20 ${
              isMobile ? "absolute inset-y-0 left-0" : "relative"
            }`}
          >
            <div className="p-3 border-b border-border flex items-center justify-between">
              <span className="text-xs font-bold tracking-wider text-muted-foreground uppercase">
                Quick Access
              </span>
              {isMobile && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 text-muted-foreground"
                  onClick={() => setSidebarOpen(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>

            <div className="flex-1 overflow-y-auto p-2.5 space-y-1.5">
              <button
                onClick={() => {
                  openFolderWindow("");
                  if (isMobile) setSidebarOpen(false);
                }}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-left text-xs font-semibold hover:bg-muted/50 text-foreground transition-all group"
              >
                <Home className="h-4 w-4 text-emerald-400 group-hover:scale-105 transition-transform" />
                <span>Root Folder</span>
              </button>

              <button
                onClick={() => {
                  openFolderWindow("__all_items__");
                  if (isMobile) setSidebarOpen(false);
                }}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-left text-xs font-semibold hover:bg-muted/50 text-foreground transition-all group"
              >
                <Images className="h-4 w-4 text-emerald-400 group-hover:scale-105 transition-transform" />
                <span>All Media Items</span>
              </button>

              <div className="h-px bg-border my-2" />

              <span className="block px-3 py-1 text-[10px] font-bold text-muted-foreground/80 uppercase tracking-wider">
                Folders Tree
              </span>
              {existingFolders.length === 0 ? (
                <p className="text-[11px] text-muted-foreground px-3 py-2">
                  No custom folders.
                </p>
              ) : (
                <div className="space-y-0.5">
                  {existingFolders.map((folder) => {
                    const depth = folder.split("/").length - 1;
                    const name = folder.split("/").pop()!;
                    return (
                      <div
                        key={folder}
                        style={{ paddingLeft: `${12 + depth * 8}px` }}
                        className="w-full flex items-center justify-between group rounded-lg text-left text-xs text-foreground/80 hover:text-foreground hover:bg-muted/40 transition-all"
                      >
                        <button
                          onClick={() => {
                            openFolderWindow(folder);
                            if (isMobile) setSidebarOpen(false);
                          }}
                          className="flex-1 flex items-center gap-2 px-2 py-1.5 min-w-0 text-left"
                        >
                          <Folder className="h-3.5 w-3.5 text-emerald-400/80 shrink-0" />
                          <span className="truncate">{name}</span>
                        </button>
                        {canDelete && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              void triggerDeleteFolder(folder);
                            }}
                            className="opacity-0 group-hover:opacity-100 p-1 hover:bg-destructive/10 rounded text-muted-foreground hover:text-destructive transition-all shrink-0 mr-1.5"
                            title="Delete folder"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="p-3 border-t border-border bg-muted/20">
              <Button
                variant="outline"
                size="sm"
                className="w-full text-xs border-border bg-background text-foreground hover:bg-accent"
                onClick={() => setIsManageFoldersDialogOpen(true)}
                disabled={existingFolders.length === 0}
              >
                <FolderOpen className="h-3.5 w-3.5 mr-1 text-emerald-400" /> Manage Folders
              </Button>
            </div>
          </div>
        )}

        {/* Workspace Canvas / Windows Area */}
        <div
          className="flex-1 relative bg-muted/5 min-h-[620px] overflow-hidden p-4"
          onDragOver={handleDragOver}
          onDrop={(e) => handleWindowDrop(e, "")}
        >
          {loading && images.length === 0 ? (
            <div className="absolute inset-0 flex items-center justify-center bg-background/50 backdrop-blur-xs z-50">
              <Loader2 className="h-8 w-8 animate-spin text-emerald-400" />
            </div>
          ) : windows.length === 0 ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6">
              <FolderOpen className="h-12 w-12 text-muted-foreground/60 mb-3" />
              <h3 className="text-base font-semibold text-muted-foreground">Workspace is Empty</h3>
              <p className="text-xs text-muted-foreground/80 mt-1 mb-4">
                Open a folder window from the sidebar or click below to start.
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => openFolderWindow("")}
                className="border-border text-foreground hover:bg-accent"
              >
                <Plus className="h-4 w-4 mr-1.5 text-emerald-400" /> Open Root Folder
              </Button>
            </div>
          ) : (
            <div
              className={`w-full h-full ${
                isMobile ? "flex flex-col gap-4 overflow-y-auto" : "relative"
              }`}
            >
              {windows.map((w) => {
                const windowFiles = getFilesForPath(w.path);
                const windowFolders = getSubfoldersForPath(w.path);
                const hasUploading = uploadingItems.some(
                  (item) => item.targetFolder === w.path
                );

                return (
                  <div
                    key={w.id}
                    style={
                      isMobile
                        ? { zIndex: w.zIndex }
                        : {
                            position: "absolute",
                            left: w.isMaximized ? 0 : `${w.x}px`,
                            top: w.isMaximized ? 0 : `${w.y}px`,
                            width: w.isMaximized ? "100%" : `${w.width}px`,
                            height: w.isMaximized ? "100%" : `${w.height}px`,
                            zIndex: w.zIndex,
                          }
                    }
                    onClick={() => focusWindow(w.id)}
                    className={`flex flex-col bg-card/95 border backdrop-blur-md rounded-2xl shadow-2xl overflow-hidden transition-shadow ${
                      isMobile ? "w-full min-h-[420px] border-border" : ""
                    } ${
                      w.isMaximized ? "rounded-none" : "border-border hover:border-emerald-500/20"
                    } ${
                      w.zIndex === nextZIndex - 1
                        ? "ring-1 ring-emerald-500/20 border-emerald-500/30 shadow-emerald-500/5"
                        : ""
                    }`}
                  >
                    {/* Window Title Bar */}
                    <div
                      onMouseDown={(e) => handleMouseDown(w.id, e)}
                      className="flex items-center justify-between p-2.5 border-b border-border bg-muted/40 cursor-move select-none shrink-0"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <FolderOpen className="h-4 w-4 text-emerald-400 shrink-0" />
                        <span className="text-xs font-semibold text-foreground truncate max-w-[180px] sm:max-w-[280px]">
                          {w.path === ""
                            ? "Root Folder"
                            : w.path === "__all_items__"
                            ? "All Media Items"
                            : w.path}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        {!isMobile && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 text-muted-foreground hover:text-foreground hover:bg-muted rounded-md"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleMaximizeWindow(w.id);
                            }}
                          >
                            {w.isMaximized ? (
                              <Minimize2 className="h-3.5 w-3.5" />
                            ) : (
                              <Maximize2 className="h-3.5 w-3.5" />
                            )}
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-md"
                          onClick={(e) => {
                            e.stopPropagation();
                            closeWindow(w.id);
                          }}
                        >
                          <X className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>

                    {/* Window Toolbar */}
                    <div className="flex flex-wrap items-center justify-between p-2 border-b border-border bg-muted/15 gap-2 shrink-0 select-none">
                      <div className="flex items-center gap-1.5">
                        {/* Back button */}
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-7 w-7 border-border bg-background hover:bg-accent text-foreground disabled:opacity-40"
                          disabled={w.path === "" || w.path === "__all_items__"}
                          onClick={() => {
                            const parts = w.path.split("/");
                            const parent =
                              parts.length > 1
                                ? parts.slice(0, -1).join("/")
                                : "";
                            navigateWindow(w.id, parent);
                          }}
                          title="Back"
                        >
                          <ArrowLeft className="h-3.5 w-3.5" />
                        </Button>

                        {/* Create Folder Inline */}
                        {w.path !== "__all_items__" && (
                          <div className="flex items-center">
                            {createFolderWindowId === w.id ? (
                              <div className="flex items-center gap-1 bg-background p-0.5 rounded-lg border border-border">
                                <Input
                                  value={newFolderNameInline}
                                  onChange={(e) =>
                                    setNewFolderNameInline(e.target.value)
                                  }
                                  placeholder="Folder name"
                                  className="h-6 w-28 text-xs bg-transparent border-0 focus-visible:ring-0 p-1"
                                  autoFocus
                                />
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  className="h-5 w-5 text-emerald-500 hover:text-emerald-600 hover:bg-muted"
                                  onClick={() => {
                                    void handleCreateFolderInPath(
                                      w.path,
                                      newFolderNameInline
                                    );
                                    setCreateFolderWindowId(null);
                                    setNewFolderNameInline("");
                                  }}
                                  disabled={
                                    !newFolderNameInline.trim() || actionLoading
                                  }
                                >
                                  <CheckCircle2 className="h-3.5 w-3.5" />
                                </Button>
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  className="h-5 w-5 text-muted-foreground hover:bg-muted"
                                  onClick={() => {
                                    setCreateFolderWindowId(null);
                                    setNewFolderNameInline("");
                                  }}
                                >
                                  <X className="h-3.5 w-3.5" />
                                </Button>
                              </div>
                            ) : (
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-7 text-xs border-border bg-background hover:bg-accent text-foreground"
                                onClick={() => {
                                  setCreateFolderWindowId(w.id);
                                  setNewFolderNameInline("");
                                }}
                              >
                                <FolderPlus className="h-3.5 w-3.5 mr-1 text-emerald-400" />{" "}
                                New Folder
                              </Button>
                            )}
                          </div>
                        )}

                        {/* Upload Trigger */}
                        {w.path !== "__all_items__" && (
                          <label className="cursor-pointer">
                            <input
                              type="file"
                              multiple
                              className="hidden"
                              accept={Object.keys(ACCEPTED_TYPES).join(",")}
                              onChange={(e) => {
                                if (e.target.files) {
                                  const files = Array.from(e.target.files);
                                  files.forEach((file) => {
                                    void startUpload(file, w.path);
                                  });
                                }
                              }}
                            />
                            <span className="flex items-center justify-center h-7 px-2.5 text-xs font-medium border border-border bg-background hover:bg-accent text-foreground rounded-lg transition-colors gap-1.5">
                              <Upload className="h-3.5 w-3.5 text-emerald-400" />{" "}
                              Upload
                            </span>
                          </label>
                        )}

                        {/* Refresh */}
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-7 w-7 border-border bg-background hover:bg-accent text-foreground"
                          onClick={() => void fetchImages()}
                          title="Refresh Folder"
                        >
                          <RefreshCw className="h-3.5 w-3.5 text-emerald-400" />
                        </Button>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <Button
                          variant="outline"
                          size="sm"
                          className={`h-7 px-2 text-xs ${
                            selectionMode
                              ? "bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-600 shadow-md"
                              : "border-border bg-background text-foreground hover:bg-accent"
                          }`}
                          onClick={() => {
                            setSelectionMode(!selectionMode);
                            if (selectionMode) setSelectedKeys([]);
                          }}
                        >
                          {selectionMode ? "Cancel Select" : "Select"}
                        </Button>
                      </div>
                    </div>

                    {/* Window File Area */}
                    <div
                      onDragOver={handleDragOver}
                      onDrop={(e) => handleWindowDrop(e, w.path)}
                      className="flex-1 overflow-y-auto p-3.5 space-y-4 bg-card/30"
                    >
                      {/* Active Uploads list */}
                      {hasUploading && (
                        <div className="space-y-2">
                          <h4 className="text-[10px] font-bold text-muted-foreground/85 uppercase tracking-wider">
                            Uploading files
                          </h4>
                          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                            {uploadingItems
                              .filter((item) => item.targetFolder === w.path)
                              .map(renderUploadingCard)}
                          </div>
                        </div>
                      )}

                      {/* Subfolders list */}
                      {w.path !== "__all_items__" && windowFolders.length > 0 && (
                        <div className="space-y-2">
                          <h4 className="text-[10px] font-bold text-muted-foreground/85 uppercase tracking-wider">
                            Folders
                          </h4>
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                            {windowFolders.map((subPath) => {
                              const folderName =
                                subPath.split("/").pop() ?? subPath;
                              const count = getFilesCountForPath(subPath);

                              return (
                                <div
                                  key={subPath}
                                  onClick={() => navigateWindow(w.id, subPath)}
                                  onDragOver={handleDragOver}
                                  onDrop={(e) => handleFolderDrop(e, subPath)}
                                  className="flex items-center gap-2.5 p-2.5 rounded-xl border border-border bg-muted/30 hover:border-emerald-500/50 hover:bg-muted/50 cursor-pointer transition-all duration-200 group relative select-none"
                                  title="Double click to open in new window"
                                  onDoubleClick={(e) => {
                                    e.stopPropagation();
                                    openFolderWindow(subPath);
                                  }}
                                >
                                  <Folder className="h-6 w-6 text-emerald-400 group-hover:scale-105 transition-transform shrink-0" />
                                  <div className="min-w-0 flex-1">
                                    <p className="text-xs font-semibold text-foreground truncate">
                                      {folderName}
                                    </p>
                                    <p className="text-[10px] text-muted-foreground">
                                      {count} items
                                    </p>
                                  </div>

                                  <div className="flex items-center gap-0.5 shrink-0">
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        openFolderWindow(subPath);
                                      }}
                                      className="opacity-0 group-hover:opacity-100 p-1 hover:bg-muted rounded text-muted-foreground hover:text-foreground transition-all shrink-0"
                                      title="Open in new window"
                                    >
                                      <Maximize2 className="h-3 w-3" />
                                    </button>
                                    {canDelete && (
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          void triggerDeleteFolder(subPath);
                                        }}
                                        className="opacity-0 group-hover:opacity-100 p-1 hover:bg-destructive/10 rounded text-muted-foreground hover:text-destructive transition-all shrink-0"
                                        title="Delete folder"
                                      >
                                        <Trash2 className="h-3 w-3" />
                                      </button>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* Files list */}
                      <div className="space-y-2">
                        {w.path !== "__all_items__" && (
                          <h4 className="text-[10px] font-bold text-muted-foreground/85 uppercase tracking-wider">
                            Files
                          </h4>
                        )}
                        {windowFiles.length === 0 &&
                        !uploadingItems.some(
                          (item) => item.targetFolder === w.path
                        ) ? (
                          <div className="flex flex-col items-center justify-center py-12 text-center border border-dashed border-border rounded-xl bg-muted/5">
                            <p className="text-muted-foreground text-xs font-medium">
                              No files here. Drag & drop files here to upload.
                            </p>
                          </div>
                        ) : (
                          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
                            {windowFiles.map((image) =>
                              renderImageCard(image, w.path)
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Selection Action Bar */}
      {selectionMode && selectedKeys.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 rounded-full border border-border bg-card/95 backdrop-blur-lg px-6 py-3 shadow-2xl animate-in slide-in-from-bottom-10 select-none">
          <span className="text-foreground font-semibold mr-4 text-sm tracking-wide">
            {selectedKeys.length} selected
          </span>
          <Button
            size="sm"
            variant="outline"
            className="border-border bg-background hover:bg-accent text-foreground rounded-full text-xs"
            onClick={() => {
              setActionTargetFolder("root");
              setIsMoveDialogOpen(true);
            }}
          >
            <MoveRight className="h-3.5 w-3.5 mr-1.5 text-emerald-400" /> Move
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="border-border bg-background hover:bg-accent text-foreground rounded-full text-xs"
            onClick={() => {
              setActionTargetFolder("root");
              setIsCopyDialogOpen(true);
            }}
          >
            <Copy className="h-3.5 w-3.5 mr-1.5 text-emerald-400" /> Copy
          </Button>
          {canDelete && (
            <Button
              size="sm"
              variant="destructive"
              className="rounded-full bg-destructive hover:bg-destructive/90 text-destructive-foreground text-xs shadow-md shadow-red-900/10"
              onClick={() => void handleBulkDelete()}
              disabled={actionLoading}
            >
              <Trash2 className="h-3.5 w-3.5 mr-1.5" /> Delete
            </Button>
          )}
        </div>
      )}

      {/* Dialogs: Manage Folders */}
      <Dialog
        open={isManageFoldersDialogOpen}
        onOpenChange={setIsManageFoldersDialogOpen}
      >
        <DialogContent className="bg-card border-border text-foreground backdrop-blur-xl sm:max-w-md shadow-2xl select-none">
          <DialogHeader>
            <DialogTitle className="text-foreground font-semibold">
              Manage Folders
            </DialogTitle>
          </DialogHeader>
          <div className="py-4 max-h-[50vh] overflow-y-auto space-y-2 pr-1">
            {existingFolders.length === 0 ? (
              <p className="text-muted-foreground text-sm text-center py-4">
                No folders found.
              </p>
            ) : (
              existingFolders.map((folder) => (
                <div
                  key={folder}
                  className="flex items-center gap-3 p-2.5 rounded-xl border border-border bg-muted/30"
                >
                  <div
                    className={`h-5 w-5 rounded border flex items-center justify-center cursor-pointer transition-colors ${
                      selectedFolders.includes(folder)
                        ? "bg-emerald-500 border-emerald-500"
                        : "border-border hover:border-emerald-400"
                    }`}
                    onClick={() => {
                      setSelectedFolders((prev) =>
                        prev.includes(folder)
                          ? prev.filter((f) => f !== folder)
                          : [...prev, folder]
                      );
                    }}
                  >
                    {selectedFolders.includes(folder) && (
                      <CheckCircle2 className="h-3.5 w-3.5 text-white" />
                    )}
                  </div>
                  <FolderOpen className="h-4 w-4 text-emerald-400" />
                  <span className="text-xs font-medium flex-1 text-foreground">
                    {folder}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {imagesByFolder[folder]?.length ?? 0} items
                  </span>
                </div>
              ))
            )}
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setIsManageFoldersDialogOpen(false)}
              className="border-border hover:bg-accent text-foreground bg-transparent"
            >
              Cancel
            </Button>
            <Button
              onClick={() => void handleDeleteFolders()}
              disabled={selectedFolders.length === 0 || actionLoading}
              variant="destructive"
              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
            >
              {actionLoading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Trash2 className="h-4 w-4 mr-2" />
              )}
              Delete Selected
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialogs: Move & Copy */}
      <Dialog
        open={isMoveDialogOpen}
        onOpenChange={(open) => {
          setIsMoveDialogOpen(open);
          if (!open) {
            setActiveItem(null);
            setIsNewActionFolder(false);
            setNewActionFolderName("");
          }
        }}
      >
        <DialogContent className="bg-card border-border text-foreground backdrop-blur-xl sm:max-w-md shadow-2xl select-none">
          <DialogHeader>
            <DialogTitle className="text-foreground font-semibold">
              Move {activeItem ? "1 item" : `${selectedKeys.length} items`}
            </DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <Select
              value={isNewActionFolder ? "new_folder" : actionTargetFolder}
              onValueChange={(v) => {
                if (v === "new_folder") setIsNewActionFolder(true);
                else {
                  setIsNewActionFolder(false);
                  setActionTargetFolder(v);
                }
              }}
            >
              <SelectTrigger className="bg-background border-border text-foreground focus-visible:ring-emerald-500/50">
                <SelectValue placeholder="Select target folder" />
              </SelectTrigger>
              <SelectContent className="bg-card border-border text-foreground">
                <SelectItem value="root" className="text-muted-foreground">
                  No Folder (Root)
                </SelectItem>
                {renderFolderOptions()}
                <SelectItem
                  value="new_folder"
                  className="text-emerald-400 font-semibold"
                >
                  + Create New Folder
                </SelectItem>
              </SelectContent>
            </Select>
            {isNewActionFolder && (
              <Input
                value={newActionFolderName}
                onChange={(e) => setNewActionFolderName(e.target.value)}
                placeholder="e.g. Sports/Football or videos/Events"
                className="bg-background border-border text-foreground placeholder-muted-foreground focus-visible:ring-emerald-500/50 focus-visible:border-emerald-500/30"
              />
            )}
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setIsMoveDialogOpen(false)}
              className="border-border hover:bg-accent text-foreground bg-transparent"
            >
              Cancel
            </Button>
            <Button
              onClick={() => void handleBulkAction("move")}
              disabled={
                actionLoading ||
                (isNewActionFolder && !newActionFolderName.trim())
              }
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              {actionLoading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <MoveRight className="h-4 w-4 mr-2" />
              )}
              Move
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={isCopyDialogOpen}
        onOpenChange={(open) => {
          setIsCopyDialogOpen(open);
          if (!open) {
            setActiveItem(null);
            setIsNewActionFolder(false);
            setNewActionFolderName("");
          }
        }}
      >
        <DialogContent className="bg-card border-border text-foreground backdrop-blur-xl sm:max-w-md shadow-2xl select-none">
          <DialogHeader>
            <DialogTitle className="text-foreground font-semibold">
              Copy {activeItem ? "1 item" : `${selectedKeys.length} items`}
            </DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <Select
              value={isNewActionFolder ? "new_folder" : actionTargetFolder}
              onValueChange={(v) => {
                if (v === "new_folder") setIsNewActionFolder(true);
                else {
                  setIsNewActionFolder(false);
                  setActionTargetFolder(v);
                }
              }}
            >
              <SelectTrigger className="bg-background border-border text-foreground focus-visible:ring-emerald-500/50">
                <SelectValue placeholder="Select target folder" />
              </SelectTrigger>
              <SelectContent className="bg-card border-border text-foreground">
                <SelectItem value="root" className="text-muted-foreground">
                  No Folder (Root)
                </SelectItem>
                {renderFolderOptions()}
                <SelectItem
                  value="new_folder"
                  className="text-emerald-400 font-semibold"
                >
                  + Create New Folder
                </SelectItem>
              </SelectContent>
            </Select>
            {isNewActionFolder && (
              <Input
                value={newActionFolderName}
                onChange={(e) => setNewActionFolderName(e.target.value)}
                placeholder="e.g. Sports/Football or videos/Events"
                className="bg-background border-border text-foreground placeholder-muted-foreground focus-visible:ring-emerald-500/50 focus-visible:border-emerald-500/30"
              />
            )}
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setIsCopyDialogOpen(false)}
              className="border-border hover:bg-accent text-foreground bg-transparent"
            >
              Cancel
            </Button>
            <Button
              onClick={() => void handleBulkAction("copy")}
              disabled={
                actionLoading ||
                (isNewActionFolder && !newActionFolderName.trim())
              }
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              {actionLoading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Copy className="h-4 w-4 mr-2" />
              )}
              Copy
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Rename Dialog */}
      <Dialog
        open={isRenameDialogOpen}
        onOpenChange={(open) => {
          setIsRenameDialogOpen(open);
          if (!open) {
            setActiveItem(null);
            setRenameValue("");
          }
        }}
      >
        <DialogContent className="bg-card border-border text-foreground backdrop-blur-xl sm:max-w-md shadow-2xl select-none">
          <DialogHeader>
            <DialogTitle className="text-foreground font-semibold">
              Rename Item
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Input
              value={renameValue}
              onChange={(e) => setRenameValue(e.target.value)}
              placeholder="Enter new name"
              className="bg-background border-border text-foreground placeholder-muted-foreground focus-visible:ring-emerald-500/50 focus-visible:border-emerald-500/30"
              disabled={actionLoading}
            />
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setIsRenameDialogOpen(false)}
              className="border-border hover:bg-accent text-foreground bg-transparent"
              disabled={actionLoading}
            >
              Cancel
            </Button>
            <Button
              onClick={() => void handleRename()}
              disabled={!renameValue.trim() || actionLoading}
              className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-md"
            >
              {actionLoading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              Rename
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={(open) => {
          setIsDeleteDialogOpen(open);
          if (!open) setActiveItem(null);
        }}
      >
        <AlertDialogContent className="bg-card border-border text-foreground backdrop-blur-md select-none">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-foreground">
              Delete{" "}
              {activeItem &&
              (/\.(mp4|webm|ogg|mov)$/i.test(activeItem.key) ||
                activeItem.key.startsWith("videos/"))
                ? "Video"
                : "Image"}
              ?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              This action cannot be undone. This item will be permanently removed
              from the school gallery.
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

      {/* Folder Delete Confirmation Dialog */}
      <AlertDialog
        open={isFolderDeleteDialogOpen}
        onOpenChange={(open) => {
          setIsFolderDeleteDialogOpen(open);
          if (!open) setFolderToDelete(null);
        }}
      >
        <AlertDialogContent className="bg-card border-border text-foreground backdrop-blur-md select-none">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-foreground">
              Delete Nested Folder &quot;{folderToDelete}&quot;?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground space-y-2">
              <p>
                Warning: The folder is nested and contains media files. Deleting it will permanently remove all subfolders and media files.
              </p>
              <p className="font-semibold text-destructive">
                This action cannot be undone.
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-border text-muted-foreground hover:bg-accent">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => folderToDelete && void executeFolderDelete(folderToDelete)}
              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
              disabled={actionLoading}
            >
              {actionLoading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              Delete Folder
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
                {activeMedia.key
                  .split("/")
                  .pop()
                  ?.replace(/^\d+_/, "") ?? "Media"}
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
                onClick={() =>
                  void handleDownload(activeMedia)
                }
                className="h-9 w-9 text-muted-foreground hover:text-white hover:bg-white/10"
                title="Download"
              >
                <Download className="h-5 w-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() =>
                  void handleShare(activeMedia)
                }
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
            {lightboxSourceList.length > 1 && (
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
              {activeMedia &&
              (/\.(mp4|webm|ogg|mov)$/i.test(activeMedia.key) ||
                activeMedia.key.startsWith("videos/")) ? (
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
            {lightboxSourceList.length > 1 && (
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
          {activeMedia &&
            !(
              /\.(mp4|webm|ogg|mov)$/i.test(activeMedia.key) ||
              activeMedia.key.startsWith("videos/")
            ) && (
              <div className="p-4 bg-gradient-to-t from-black/80 to-transparent flex justify-center items-center gap-4">
                <Button
                  variant="ghost"
                  size="icon"
                  disabled={zoomScale <= 0.5}
                  onClick={() =>
                    setZoomScale((prev) => Math.max(0.5, prev - 0.25))
                  }
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
                  onClick={() =>
                    setZoomScale((prev) => Math.min(4, prev + 0.25))
                  }
                  className="h-8 w-8 text-muted-foreground hover:text-white hover:bg-white/10"
                >
                  <ZoomIn className="h-4 w-4" />
                </Button>
              </div>
            )}

          {/* Navigation Dot Indicators */}
          {lightboxSourceList.length > 1 && lightboxSourceList.length <= 15 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5 pb-2">
              {lightboxSourceList.map((media, idx) => (
                <div
                  key={media.key}
                  onClick={() => setLightboxIndex(idx)}
                  className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                    idx === lightboxIndex
                      ? "w-4 bg-emerald-500"
                      : "w-1.5 bg-white/30 hover:bg-white/50"
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
