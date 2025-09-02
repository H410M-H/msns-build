import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "~/components/ui/dialog";
import { Button } from "~/components/ui/button";
import EventsCalendar from "~/components/blocks/academic-calender/events-calender";
import { Calendar, ChevronRight } from "lucide-react";

export const CalendarDialog=()=> {
  return (
    <div className="group relative">
      <Dialog>
        <DialogTrigger asChild>
          <Button
            size="lg"
            className="group relative transform rounded-2xl border-2 border-gray-200 bg-white px-6 py-3 font-semibold text-gray-700 shadow-xl transition-all duration-300 hover:-translate-y-1 hover:scale-105 hover:border-gray-300 hover:bg-gray-50 hover:shadow-2xl"
          >
            <Calendar className="mr-2 h-5 w-5 group-hover:animate-pulse" />
            View Calendar
            <ChevronRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Button>
        </DialogTrigger>
        <DialogContent className="h-[90vh] max-w-6xl overflow-hidden rounded-3xl border-0 bg-white/95 shadow-2xl backdrop-blur-sm">
          <DialogHeader className="border-b bg-gradient-to-r from-blue-50 to-indigo-50 p-8">
            <DialogTitle className="flex items-center gap-3 text-3xl font-bold text-gray-800">
              <div className="rounded-lg bg-blue-500 p-2">
                <Calendar className="h-7 w-7 text-white" />
              </div>
              Academic Calendar
            </DialogTitle>
          </DialogHeader>
          <div className="overflow-y-auto p-8">
            <EventsCalendar />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}