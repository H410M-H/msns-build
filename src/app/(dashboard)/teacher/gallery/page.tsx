import GalleryUploader from "~/components/blocks/gallery/GalleryUploader";
import { Toaster } from "sonner";

export const dynamic = "force-dynamic";

export default function TeacherGalleryPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight">
          School Gallery
        </h1>
        <p className="text-slate-400 mt-1">
          Upload photos for the school&apos;s website gallery. Contribute to capturing school events and activities!
        </p>
      </div>

      <GalleryUploader canDelete={false} />
      <Toaster richColors closeButton position="bottom-right" />
    </div>
  );
}
