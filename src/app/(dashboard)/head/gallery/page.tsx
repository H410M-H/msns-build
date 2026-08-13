import GalleryUploader from "~/components/blocks/gallery/GalleryUploader";
import { Toaster } from "sonner";

export const dynamic = "force-dynamic";

export default function HeadGalleryPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground tracking-tight">
          School Gallery
        </h1>
        <p className="text-muted-foreground mt-1">
          Upload and manage photos for the school&apos;s website gallery
        </p>
      </div>

      <GalleryUploader canDelete={true} />
      <Toaster richColors closeButton position="bottom-right" />
    </div>
  );
}
