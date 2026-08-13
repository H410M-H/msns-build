"use client";

import { useState } from "react";
import { api } from "~/trpc/react";
import { Search, Phone, Droplet, ShieldCheck } from "lucide-react";
import { Input } from "~/components/ui/input";

export default function EmergencyDirectoryPage() {
  const [searchTerm, setSearchTerm] = useState("");

  const { data: students, isLoading } = api.student.getStudents.useQuery();

  const filteredStudents = students?.filter((s: any) =>
    s.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.registrationNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.fatherMobile.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-4xl mx-auto p-4 sm:p-6">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <ShieldCheck className="h-6 w-6 text-emerald-400" /> Emergency Contact & Records Directory
        </h1>
        <p className="text-sm text-slate-400">Search student & staff emergency contacts, blood group, and tuition status</p>
      </div>

      <div className="relative">
        <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
        <Input
          type="text"
          placeholder="Search by student name, roll number, or parent mobile phone..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 bg-slate-900 border-slate-800 text-white rounded-xl focus:border-emerald-500"
        />
      </div>

      {isLoading ? (
        <div className="flex h-48 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent" />
        </div>
      ) : !filteredStudents || filteredStudents.length === 0 ? (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-8 text-center text-slate-400">
          No directory records matching "{searchTerm}".
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {filteredStudents.map((s: any) => (
            <div key={s.studentId} className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 space-y-3 backdrop-blur-md">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-white">{s.studentName}</h3>
                  <p className="text-xs text-slate-400">Reg: {s.registrationNumber}</p>
                </div>
                <span className="px-2.5 py-1 text-xs font-bold rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/20 flex items-center gap-1">
                  <Droplet className="h-3.5 w-3.5 fill-rose-400" /> {s.bloodGroup || "O+"}
                </span>
              </div>

              <div className="space-y-1 text-xs text-slate-300 border-t border-slate-800/80 pt-2">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Father Name:</span>
                  <span className="font-semibold">{s.fatherName}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Parent Mobile:</span>
                  <a href={`tel:${s.fatherMobile}`} className="font-semibold text-emerald-400 flex items-center gap-1">
                    <Phone className="h-3 w-3" /> {s.fatherMobile}
                  </a>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Current Address:</span>
                  <span className="truncate max-w-[180px]">{s.currentAddress}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
