import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "~/components/ui/dialog";
import { Button } from "~/components/ui/button";
import EventsCalendar from "~/components/blocks/academic-calender/events-calender";
import { Calendar, ChevronRight } from "lucide-react";

export const CalendarDialog = () => {
  return (
    <div className="group relative w-full sm:w-auto">
      <Dialog>
        <DialogTrigger asChild>
          <Button
            size="lg"
            className="w-full sm:w-auto group relative transform rounded-xl sm:rounded-2xl border-2 border-gray-200 bg-white px-4 py-3 sm:px-6 sm:py-3 text-sm sm:text-base font-semibold text-gray-700 shadow-lg sm:shadow-xl transition-all duration-300 hover:-translate-y-0.5 sm:hover:-translate-y-1 hover:scale-[1.01] sm:hover:scale-105 hover:border-gray-300 hover:bg-gray-50 hover:shadow-xl sm:hover:shadow-2xl active:scale-95"
          >
            <div className="flex items-center justify-center w-full">
                <Calendar className="mr-2 h-4 w-4 sm:h-5 sm:w-5 group-hover:animate-pulse text-blue-600" />
                <span>View Calendar</span>
                <ChevronRight className="ml-2 h-3.5 w-3.5 sm:h-4 sm:w-4 transition-transform group-hover:translate-x-1 text-gray-400" />
            </div>
          </Button>
        </DialogTrigger>
        
        {/* Optimized Content Layout: Mobile Full Width, Desktop Centered */}
        <DialogContent className="flex flex-col h-[85vh] sm:h-[90vh] w-[95vw] max-w-[95vw] sm:max-w-6xl overflow-hidden rounded-xl sm:rounded-3xl border-0 bg-white/95 shadow-2xl backdrop-blur-xs p-0 gap-0">
          
          {/* Header Section */}
          <DialogHeader className="shrink-0 border-b bg-linear-to-r from-blue-50 to-indigo-50 p-4 sm:p-6 lg:p-8">
            <DialogTitle className="flex items-center gap-2 sm:gap-3 text-lg sm:text-2xl lg:text-3xl font-bold text-gray-800">
              <div className="rounded-lg bg-blue-500 p-1.5 sm:p-2 shadow-xs">
                <Calendar className="h-5 w-5 sm:h-6 sm:w-6 lg:h-7 lg:w-7 text-white" />
              </div>
              <span className="truncate">Academic Calendar</span>
            </DialogTitle>
          </DialogHeader>

          {/* Scrollable Body Section */}
          <div className="flex-1 overflow-y-auto p-2 sm:p-6 lg:p-8">
             {/* Container to prevent calendar squashing */}
            <div className="min-w-full">
                <EventsCalendar />
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}