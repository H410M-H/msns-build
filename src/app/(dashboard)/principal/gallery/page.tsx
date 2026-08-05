import GalleryUploader from "~/components/blocks/gallery/GalleryUploader";
import { Toaster } from "sonner";

export const dynamic = "force-dynamic";

export default function PrincipalGalleryPage() {
  return (
    <div className="flex flex-1 flex-col space-y-4 h-full min-h-0 w-full">
      <div className="shrink-0">
        <h1 className="text-3xl font-bold text-foreground tracking-tight">
          School Gallery
        </h1>
        <p className="text-muted-foreground mt-1">
          Upload and manage photos for the school&apos;s website gallery
        </p>
      </div>

      <div className="flex-1 flex flex-col min-h-0">
        <GalleryUploader canDelete={true} />
      </div>
      <Toaster richColors closeButton position="bottom-right" />
    </div>
  );
}
