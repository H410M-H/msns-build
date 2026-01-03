"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { api } from "~/trpc/react";
import { 
  Loader2, 
  MapPin, 
  BookUser, 
  Phone, 
  Calendar, 
  RefreshCcw, 
  Fingerprint, 
  Pencil,
  Trash2,
  Search,
  Filter
} from "lucide-react";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { CSVUploadDialog } from "../forms/student/FileInput"; 
import { StudentEditDialog } from "../forms/student/StudentEdit"; 
import Link from "next/link";
import Image from "next/image";
import type { Students } from "@prisma/client";

export default function StudentCredDetails() {
  const [students, setStudents] = useState<Students[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [editingStudent, setEditingStudent] = useState<Students | null>(null);

  const { data, isLoading, isError, refetch } = api.student.getStudents.useQuery();

  useEffect(() => {
    if (data) {
      setStudents(data as unknown as Students[]);
    }
  }, [data]);

  const filteredStudents = students.filter((student) =>
    student.studentName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    student.studentCNIC?.includes(searchQuery)
  );

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.05 },
    },
  };

  // Helper: Check valid image URL
  const isValidImageSrc = (src: string | null | undefined): boolean => {
    if (!src) return false;
    return src.startsWith('http') || src.startsWith('/');
  };

  if (isLoading) {
    return (
      <div className="relative min-h-[50vh] w-screen flex flex-col items-center justify-center gap-3">
         {/* Background for loading state too */}
         <div className="absolute inset-0 z-0 pointer-events-none">
            <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(45,255,196,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(45,255,196,0.05)_1px,transparent_1px)] bg-size-[3rem_3rem]" />
            <div className="absolute inset-0 bg-linear-to-br from-emerald-900/20 via-slate-950/80 to-slate-950" />
        </div>
        <Loader2 className="w-10 h-10 animate-spin text-emerald-500 relative z-10" />
        <p className="text-sm text-emerald-500/80 animate-pulse relative z-10">Loading student directory...</p>
      </div>
    );
  }

  if (isError) {
    return (
        <div className="flex items-center justify-center h-64 border border-red-500/20 bg-red-900/10 rounded-xl m-4 backdrop-blur-xs">
            <p className="text-red-400 font-medium">Failed to load student data. Please try refreshing.</p>
        </div>
    );
  }

  return (
    <div className="relative w-full min-h-screen bg-slate-950">
      
      {/* === GLOBAL GRID BACKGROUND === */}
      <div className="inset-0 z-0 pointer-events-none fixed h-full w-full">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(45,255,196,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(45,255,196,0.05)_1px,transparent_1px)] bg-size-[3rem_3rem] sm:bg-size-[4rem_4rem]" />
        <div className="absolute inset-0 bg-linear-to-br from-emerald-900/20 via-slate-950/80 to-slate-950" />
      </div>

      {/* === CONTENT === */}
      <div className="relative z-10 w-full mx-auto space-y-6 pb-20 p-4 sm:p-6 lg:p-8 max-w-[1920px]">
        
        {/* === Header Controls === */}
        <div className="sticky top-4 z-40 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 bg-slate-900/70 backdrop-blur-xl border border-emerald-500/20 rounded-2xl p-4 shadow-2xl transition-all duration-300">
          
          {/* Search Bar */}
          <div className="relative flex-1 min-w-0 group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-emerald-500/50 group-focus-within:text-emerald-400 transition-colors" />
            <Input
              placeholder="Search by Name, CNIC, or Reg #..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-11 bg-slate-950/40 border-emerald-500/20 text-white placeholder:text-slate-500 focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all rounded-xl w-full hover:bg-slate-950/60"
            />
          </div>

          {/* Action Buttons - Scrollable on mobile */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 lg:pb-0 no-scrollbar">
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              className="h-11 px-4 bg-slate-800/50 border-emerald-500/20 text-emerald-400 hover:bg-emerald-900/30 hover:text-emerald-300 hover:border-emerald-500/50 transition-all rounded-xl backdrop-blur-md"
            >
              <RefreshCcw className="h-4 w-4 mr-2" />
              <span className="whitespace-nowrap">Refresh</span>
            </Button>
            
            <div className="hidden sm:block">
                <CSVUploadDialog />
            </div>
            
            <Button asChild size="sm" className="h-11 px-6 bg-linear-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-lg shadow-emerald-900/20 border-0 rounded-xl transition-all">
              <Link href="/admin/users/student/create">
                <span className="font-semibold tracking-wide whitespace-nowrap">Create New</span>
              </Link>
            </Button>
          </div>
        </div>

        {/* === Results Meta === */}
        <div className="px-2 flex items-center justify-between text-xs text-slate-400 uppercase tracking-wider font-medium">
            <span>Showing <span className="text-emerald-400">{filteredStudents.length}</span> Students</span>
            <div className="flex gap-2 items-center">
                <span className="hidden sm:inline-block">Sort by: Newest</span>
                <Filter className="w-3.5 h-3.5" />
            </div>
        </div>

        {/* === Card Grid === */}
        <AnimatePresence mode="popLayout">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6"
          >
            {filteredStudents.length === 0 ? (
                 <motion.div 
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="col-span-full flex flex-col items-center justify-center py-32 text-slate-500"
                >
                    <div className="h-24 w-24 rounded-full bg-slate-900/50 flex items-center justify-center mb-4 border border-emerald-500/10">
                        <Search className="w-10 h-10 opacity-30 text-emerald-500" />
                    </div>
                    <p className="text-lg">No students found</p>
                    <p className="text-sm opacity-60">Try adjusting your search query</p>
                 </motion.div>
            ) : (
                filteredStudents.map((student) => (
                <motion.div 
                    key={student.studentId} 
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="w-full h-full"
                >
                    <Card className="h-full bg-slate-900/60 backdrop-blur-md border border-emerald-500/10 rounded-2xl shadow-xl hover:shadow-2xl hover:shadow-emerald-900/20 hover:border-emerald-500/30 transition-all duration-300 group overflow-hidden relative">
                    
                    {/* Decorative Elements */}
                    <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-transparent via-emerald-500/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="absolute -top-12 -right-12 w-40 h-40 bg-emerald-500/5 rounded-full blur-3xl group-hover:bg-emerald-500/10 transition-colors pointer-events-none" />

                    <CardContent className="p-5 flex flex-col h-full relative z-10">
                        
                        {/* Header Row: Image & Name */}
                        <div className="flex items-start gap-4 mb-5">
                            {/* Profile Image */}
                            <div className="relative shrink-0">
                                {isValidImageSrc(student.profilePic) ? (
                                    <div className="relative h-16 w-16 sm:h-20 sm:w-20 rounded-2xl overflow-hidden border-2 border-emerald-500/20 shadow-lg group-hover:border-emerald-500/50 transition-colors">
                                        <Image
                                            src={student.profilePic!}
                                            alt={student.studentName}
                                            fill
                                            className="object-cover transition-transform duration-700 group-hover:scale-110"
                                        />
                                    </div>
                                ) : (
                                    <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-2xl bg-slate-800 flex items-center justify-center border-2 border-slate-700 shadow-inner group-hover:border-emerald-500/30 transition-colors">
                                        <span className="text-2xl font-bold text-slate-500 group-hover:text-emerald-400 transition-colors">
                                            {student.studentName.charAt(0)}
                                        </span>
                                    </div>
                                )}
                                {/* Status Indicator */}
                                <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-slate-900 shadow-xs ${student.isAssign ? 'bg-emerald-500 shadow-emerald-500/50' : 'bg-slate-500'}`} />
                            </div>

                            {/* Name & Title */}
                            <div className="flex-1 min-w-0 pt-1 space-y-1">
                                <h2 className="text-lg font-bold text-white leading-tight truncate group-hover:text-emerald-300 transition-colors">
                                    {student.studentName}
                                </h2>
                                <p className="text-sm text-slate-400 truncate">
                                    <span className="opacity-60">Father:</span> {student.fatherName}
                                </p>
                                <div className="flex flex-wrap gap-2 pt-1">
                                    <Badge variant="outline" className="text-[10px] px-2 h-5 border-emerald-500/20 text-emerald-100/70 bg-emerald-500/5">
                                        Reg: {student.registrationNumber || "N/A"}
                                    </Badge>
                                </div>
                            </div>
                        </div>

                        {/* Details Grid */}
                        <div className="grid grid-cols-2 gap-3 text-sm flex-1 content-start mb-4">
                            <div className="col-span-1 flex items-center gap-2 p-2 rounded-lg bg-slate-950/40 border border-slate-800/50 hover:border-emerald-500/20 transition-colors group/item">
                                <BookUser className="w-3.5 h-3.5 text-emerald-500/70 group-hover/item:text-emerald-400" />
                                <span className="text-slate-300 capitalize truncate text-xs sm:text-sm">{student.gender?.toLowerCase() || 'N/A'}</span>
                            </div>
                            <div className="col-span-1 flex items-center gap-2 p-2 rounded-lg bg-slate-950/40 border border-slate-800/50 hover:border-emerald-500/20 transition-colors group/item">
                                <Calendar className="w-3.5 h-3.5 text-emerald-500/70 group-hover/item:text-emerald-400" />
                                <span className="text-slate-300 truncate text-xs sm:text-sm">
                                    {student.dateOfBirth ? new Date(student.dateOfBirth).toLocaleDateString() : 'N/A'}
                                </span>
                            </div>
                            <div className="col-span-2 flex items-center gap-2 p-2 rounded-lg bg-slate-950/40 border border-slate-800/50 hover:border-emerald-500/20 transition-colors group/item">
                                <Fingerprint className="w-3.5 h-3.5 text-emerald-500/70 group-hover/item:text-emerald-400 shrink-0" />
                                <span className="text-slate-300 truncate text-xs sm:text-sm tracking-wide">
                                    {student.studentCNIC || "No CNIC"}
                                </span>
                            </div>
                            <div className="col-span-2 flex items-center gap-2 p-2 rounded-lg bg-slate-950/40 border border-slate-800/50 hover:border-emerald-500/20 transition-colors group/item">
                                <MapPin className="w-3.5 h-3.5 text-emerald-500/70 group-hover/item:text-emerald-400 shrink-0" />
                                <span className="text-slate-300 truncate text-xs sm:text-sm" title={student.currentAddress}>
                                    {student.currentAddress || "No Address"}
                                </span>
                            </div>
                        </div>

                        {/* Footer: Actions */}
                        <div className="mt-auto pt-4 border-t border-emerald-500/10 flex items-center justify-between">
                            <div className="flex items-center gap-2 text-xs text-slate-500">
                                <Phone className="w-3 h-3 text-emerald-500/50" />
                                <span>{student.fatherMobile || "N/A"}</span>
                            </div>

                            <div className="flex gap-2">
                                {/* Edit Button */}
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => setEditingStudent(student)}
                                    className="h-8 w-8 p-0 rounded-lg text-emerald-400 hover:text-white hover:bg-emerald-600/20 bg-emerald-900/10 border border-emerald-500/20 transition-all"
                                >
                                    <Pencil className="w-3.5 h-3.5" />
                                </Button>
                                {/* Delete Button */}
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    className="h-8 w-8 p-0 rounded-lg text-red-400 hover:text-white hover:bg-red-600/20 bg-red-900/10 border border-red-500/20 transition-all"
                                >
                                    <Trash2 className="w-3.5 h-3.5" />
                                </Button>
                            </div>
                        </div>

                    </CardContent>
                    </Card>
                </motion.div>
                ))
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Edit Dialog */}
      {editingStudent && (
        <StudentEditDialog
          student={editingStudent}
          onClose={() => {
            setEditingStudent(null);
            void refetch();
          }}
        />
      )}
    </div>
  );
}