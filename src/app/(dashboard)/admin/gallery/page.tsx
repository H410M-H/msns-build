import GalleryUploader from "~/components/blocks/gallery/GalleryUploader";
import { Toaster } from "sonner";

export const dynamic = "force-dynamic";

export default function AdminGalleryPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground tracking-tight">
          School Gallery
        </h1>
        <p className="text-muted-foreground mt-1">
          Upload and manage photos for the school&apos;s website gallery. These images appear on{" "}
          <a
            href="https://msns.edu.pk"
            target="_blank"
            rel="noopener noreferrer"
            className="text-emerald-400 hover:underline"
          >
            msns.edu.pk
          </a>
        </p>
      </div>

      <GalleryUploader canDelete={true} />
      <Toaster richColors closeButton position="bottom-right" />
    </div>
  );
}
