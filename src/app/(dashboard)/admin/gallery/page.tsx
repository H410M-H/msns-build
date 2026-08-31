"use client";

import GalleryUploader from "~/components/blocks/gallery/GalleryUploader";
import { PageHeader } from "~/components/blocks/nav/PageHeader";
import { Toaster } from "sonner";

export default function AdminGalleryPage() {
  const breadcrumbs = [
    { href: "/admin", label: "Dashboard" },
    { href: "/admin/gallery", label: "Gallery", current: true },
  ];

  return (
    <div className="flex flex-1 flex-col space-y-4 h-full min-h-0 w-full">
      {/* PageHeader in layout */}

      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end shrink-0">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-foreground sm:text-3xl">
            School Gallery
          </h1>
          <p className="mt-1 max-w-xl text-sm text-muted-foreground dark:text-muted-foreground">
            Upload and manage photos for the school&apos;s website gallery. These images appear on{" "}
            <a
              href="https://msns.edu.pk"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300"
            >
              msns.edu.pk
            </a>
          </p>
        </div>
      </div>

      <div className="flex-1 flex flex-col min-h-0">
        <GalleryUploader canDelete={true} />
      </div>

      <Toaster richColors closeButton position="bottom-right" />
    </div>
  );
}
