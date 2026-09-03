import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { Button } from "~/components/ui/button";
import GalleryUploader from "~/components/blocks/gallery/GalleryUploader";
import { Image as ImageIcon, ChevronRight } from "lucide-react";

export const GalleryDialog = () => {
  return (
    <div className="group relative w-full sm:w-auto">
      <Dialog>
        <DialogTrigger asChild>
          <Button
            size="lg"
            className="group relative w-full transform rounded-xl border-2 border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-700 shadow-lg transition-all duration-300 hover:-translate-y-0.5 hover:scale-[1.01] hover:border-gray-300 hover:bg-gray-50 hover:shadow-xl active:scale-95 sm:w-auto sm:rounded-2xl sm:px-6 sm:py-3 sm:text-base sm:shadow-xl sm:hover:-translate-y-1 sm:hover:scale-105 sm:hover:shadow-2xl"
          >
            <div className="flex w-full items-center justify-center">
              <ImageIcon className="mr-2 h-4 w-4 text-emerald-600 group-hover:animate-pulse sm:h-5 sm:w-5" />
              <span>View Gallery</span>
              <ChevronRight className="ml-2 h-3.5 w-3.5 text-gray-400 transition-transform group-hover:translate-x-1 sm:h-4 sm:w-4" />
            </div>
          </Button>
        </DialogTrigger>

        {/* Content Layout: Mobile Full Width, Desktop Centered */}
        <DialogContent className="flex h-[85vh] w-[95vw] max-w-[95vw] flex-col gap-0 overflow-hidden rounded-xl border-0 bg-white/95 p-0 shadow-2xl backdrop-blur-sm sm:h-[90vh] sm:max-w-6xl sm:rounded-3xl">
          {/* Header Section */}
          <DialogHeader className="shrink-0 border-b bg-gradient-to-r from-emerald-50 to-teal-50 p-4 sm:p-6 lg:p-8">
            <DialogTitle className="flex items-center gap-2 text-lg font-bold text-gray-800 sm:gap-3 sm:text-2xl lg:text-3xl">
              <div className="rounded-lg bg-emerald-500 p-1.5 shadow-sm sm:p-2">
                <ImageIcon className="h-5 w-5 text-white sm:h-6 sm:w-6 lg:h-7 lg:w-7" />
              </div>
              <span className="truncate">School Gallery</span>
            </DialogTitle>
          </DialogHeader>

          {/* Scrollable Body Section */}
          <div className="flex-1 overflow-y-auto p-2 sm:p-6 lg:p-8">
            <div className="min-w-full">
              <GalleryUploader canDelete={false} />
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
