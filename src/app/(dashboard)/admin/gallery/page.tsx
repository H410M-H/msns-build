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
    <div className="w-full space-y-6">
      <PageHeader breadcrumbs={breadcrumbs} />

      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
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

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-border dark:bg-card">
        <GalleryUploader canDelete={true} />
      </div>

      <Toaster richColors closeButton position="bottom-right" />
    </div>
  );
}
