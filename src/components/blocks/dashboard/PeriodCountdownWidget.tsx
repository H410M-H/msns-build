"use client";

import { useEffect, useState } from "react";
import { Clock, MapPin, BookOpen, AlertCircle } from "lucide-react";

export const PeriodCountdownWidget = () => {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Demo active timetable slot calculation
  const currentPeriod = {
    periodNumber: 3,
    subject: "Mathematics SSC-I",
    room: "Room 104 (Science Block)",
    startTime: "10:30 AM",
    endTime: "11:15 AM",
    remainingSeconds: Math.max(0, 45 * 60 - ((now.getMinutes() * 60 + now.getSeconds()) % (45 * 60))),
  };

  const minutesLeft = Math.floor(currentPeriod.remainingSeconds / 60);
  const secondsLeft = currentPeriod.remainingSeconds % 60;

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur-md space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-emerald-400" />
          <h3 className="text-base font-bold text-white">Active Period Countdown</h3>
        </div>
        <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
          Period #{currentPeriod.periodNumber}
        </span>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl border border-slate-800 bg-slate-950/60 p-4">
        <div>
          <div className="flex items-center gap-2 text-sm font-bold text-white">
            <BookOpen className="h-4 w-4 text-emerald-400" />
            <span>{currentPeriod.subject}</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
            <MapPin className="h-3.5 w-3.5 text-rose-400" />
            <span>{currentPeriod.room}</span>
          </div>
        </div>

        <div className="text-right">
          <span className="text-2xl font-black text-emerald-400 tracking-tight">
            {String(minutesLeft).padStart(2, "0")}:{String(secondsLeft).padStart(2, "0")}
          </span>
          <p className="text-xs text-slate-400 mt-0.5">Time Remaining</p>
        </div>
      </div>
    </div>
  );
};
