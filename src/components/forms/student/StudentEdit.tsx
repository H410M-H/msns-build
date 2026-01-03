"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { type z } from "zod";
import { api } from "~/trpc/react";
import { toast } from "~/hooks/use-toast";
import { Loader2, X, Camera, Trash2 } from "lucide-react";
import { Button } from "~/components/ui/button";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import type { Students } from "@prisma/client";
import { studentSchema } from "~/lib/schemas/student";

// --- Types ---
interface UploadResponse {
    url: string;
    error?: string;
}

type StudentEditFormProps = {
    student: Students;
    onClose: () => void;
};

// Helper to safely format dates for input type="date" (YYYY-MM-DD)
const formatDateForInput = (date: string | Date | null | undefined): string => {
    if (!date || date === "none") return "";
    if (date instanceof Date) return date.toISOString().split("T")[0] ?? "";
    return typeof date === "string" ? date.split("T")[0] ?? "" : "";
};

export function StudentEditDialog({ student, onClose }: StudentEditFormProps) {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);

    // FIX: Remove the explicit generic <FormValues> here.
    // Let useForm infer the Input/Output types from the resolver automatically.
    const form = useForm({
        resolver: zodResolver(studentSchema),
        defaultValues: {
            studentName: student.studentName ?? "",
            fatherName: student.fatherName ?? "",
            // Safely cast enum or fallback
            gender: (student.gender as "MALE" | "FEMALE" | "CUSTOM") ?? "MALE",
            dateOfBirth: formatDateForInput(student.dateOfBirth),
            studentCNIC: student.studentCNIC ?? "",
            fatherCNIC: student.fatherCNIC ?? "",
            studentMobile: student.studentMobile ?? "",
            fatherMobile: student.fatherMobile ?? "",
            caste: student.caste ?? "",
            currentAddress: student.currentAddress ?? "",
            permanentAddress: student.permanentAddress ?? "",
            medicalProblem: student.medicalProblem ?? "",
            profilePic: student.profilePic ?? "",
            // Include optional fields to satisfy schema if needed, defaulting to empty strings
            fatherProfession: student.fatherProfession ?? "",
            bloodGroup: student.bloodGroup ?? "",
            guardianName: student.guardianName ?? "",
            isAssign: student.isAssign ?? false,
        },
    });

    const utils = api.useUtils();

    const updateStudent = api.student.updateStudent.useMutation({
        onSuccess: () => {
            toast({
                title: "Success",
                description: "Student updated successfully",
            });
            void utils.student.getStudents.invalidate(); 
            void utils.student.getStudentById.invalidate({ studentId: student.studentId });
            onClose();
        },
        onError: (error) => {
            toast({
                title: "Error",
                description: error.message,
                variant: "destructive",
            });
        },
    });

    useEffect(() => {
        if (student.profilePic) {
            form.setValue("profilePic", student.profilePic);
        }
    }, [student.profilePic, form]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) { 
                toast({ title: "File too large", description: "Max 5MB allowed", variant: "destructive" });
                return;
            }
            
            setSelectedFile(file);

            const reader = new FileReader();
            reader.onloadend = () => {
                form.setValue("profilePic", reader.result as string, { shouldDirty: true }); 
            };
            reader.readAsDataURL(file);
        }
    };

    const uploadFile = async (file: File): Promise<string> => {
        const formData = new FormData();
        formData.append("file", file);

        const response = await fetch("/api/v1/upload", {
            method: "POST",
            body: formData,
        });

        if (!response.ok) throw new Error("File upload failed");
        
        const data = (await response.json()) as UploadResponse;
        return data.url; 
    };

    // Explicitly type values using z.infer so strict typing is maintained in the handler
    const onSubmit = async (values: z.infer<typeof studentSchema>) => {
        try {
            let finalProfilePic = values.profilePic;

            if (selectedFile) {
                setIsUploading(true);
                try {
                    finalProfilePic = await uploadFile(selectedFile);
                } catch (error) {
                    console.error(error);
                    toast({ title: "Upload Failed", description: "Could not upload profile picture.", variant: "destructive" });
                    setIsUploading(false);
                    return;
                }
                setIsUploading(false);
            }

            updateStudent.mutate({
                ...values,
                studentId: student.studentId, // Override to ensure ID is present
                profilePic: finalProfilePic ?? "",
                // Ensure optional fields are handled (transforms in schema usually handle this, but explicit is safe)
                medicalProblem: values.medicalProblem ?? "",
                studentCNIC: values.studentCNIC ?? "",
                fatherCNIC: values.fatherCNIC ?? "",
            });

        } catch (error) {
            setIsUploading(false);
            console.error("Submission error", error);
        }
    };

    const isLoading = isUploading || updateStudent.isPending;
    const inputClasses = "bg-slate-950/50 border-emerald-500/30 text-white placeholder:text-slate-500 focus:border-emerald-500 focus:ring-emerald-500";
    const labelClasses = "text-emerald-100/90";

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-sm">
            <div className="relative bg-slate-900 border border-emerald-500/20 rounded-xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
                
                <div className="flex items-center justify-between px-6 py-4 border-b border-emerald-500/20 bg-slate-900/50">
                    <h2 className="text-xl font-bold text-white">Edit Student Details</h2>
                    <Button variant="ghost" size="icon" onClick={onClose} className="text-slate-400 hover:text-white hover:bg-white/10">
                        <X className="h-5 w-5" />
                    </Button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-emerald-600/20 scrollbar-track-transparent">
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            
                            <div className="flex flex-col items-center gap-4 pb-6 border-b border-emerald-500/10">
                                <div className="relative h-28 w-28 rounded-full overflow-hidden border-2 border-emerald-500/50 bg-slate-800 shadow-lg shadow-emerald-500/10 group">
                                    {form.watch("profilePic") ? (
                                        // eslint-disable-next-line @next/next/no-img-element
                                        <img 
                                            src={form.watch("profilePic") || ""} 
                                            alt="Profile" 
                                            className="h-full w-full object-cover transition-transform group-hover:scale-105" 
                                        />
                                    ) : (
                                        <div className="h-full w-full flex items-center justify-center bg-emerald-900/20 text-emerald-500">
                                            <span className="text-3xl font-bold">{form.getValues("studentName")?.charAt(0).toUpperCase() ?? "S"}</span>
                                        </div>
                                    )}
                                </div>
                                <div className="flex items-center gap-3">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        className="border-emerald-500/30 text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10"
                                        onClick={() => document.getElementById('profile-upload')?.click()}
                                    >
                                        <Camera className="mr-2 h-4 w-4" />
                                        Change Photo
                                    </Button>
                                    
                                    <input 
                                        id="profile-upload"
                                        type="file" 
                                        accept="image/*"
                                        className="hidden"
                                        aria-label="Upload profile picture"
                                        onChange={handleFileChange}
                                    />
                                    
                                    {form.watch("profilePic") && (
                                         <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                                            onClick={() => {
                                                form.setValue("profilePic", "", { shouldDirty: true });
                                                setSelectedFile(null);
                                            }}
                                         >
                                            <Trash2 className="h-4 w-4" />
                                            <span className="sr-only">Remove photo</span>
                                         </Button>
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <FormField
                                    control={form.control}
                                    name="studentName"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className={labelClasses}>Student Name</FormLabel>
                                            <FormControl><Input {...field} className={inputClasses} /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="fatherName"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className={labelClasses}>Father Name</FormLabel>
                                            <FormControl><Input {...field} className={inputClasses} /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="gender"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className={labelClasses}>Gender</FormLabel>
                                            <Select onValueChange={field.onChange} value={field.value}>
                                                <FormControl>
                                                    <SelectTrigger className={inputClasses}>
                                                        <SelectValue placeholder="Select gender" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent className="bg-slate-900 border-emerald-500/30 text-white">
                                                    <SelectItem value="MALE">Male</SelectItem>
                                                    <SelectItem value="FEMALE">Female</SelectItem>
                                                    <SelectItem value="CUSTOM">Other</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="dateOfBirth"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className={labelClasses}>Date of Birth</FormLabel>
                                            <FormControl>
                                                <Input 
                                                    type="date" 
                                                    {...field} 
                                                    value={field.value ?? ""} 
                                                    className={inputClasses} 
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="studentCNIC"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className={labelClasses}>Student CNIC (Optional)</FormLabel>
                                            <FormControl><Input placeholder="XXXXX-XXXXXXX-X" {...field} value={field.value ?? ""} className={inputClasses} /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="fatherCNIC"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className={labelClasses}>Father CNIC (Optional)</FormLabel>
                                            <FormControl><Input placeholder="XXXXX-XXXXXXX-X" {...field} value={field.value ?? ""} className={inputClasses} /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="studentMobile"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className={labelClasses}>Student Mobile</FormLabel>
                                            <FormControl><Input placeholder="03XX-XXXXXXX" {...field} className={inputClasses} /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="fatherMobile"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className={labelClasses}>Father Mobile</FormLabel>
                                            <FormControl><Input placeholder="03XX-XXXXXXX" {...field} className={inputClasses} /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="caste"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className={labelClasses}>Caste</FormLabel>
                                            <FormControl><Input {...field} className={inputClasses} /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="currentAddress"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className={labelClasses}>Current Address</FormLabel>
                                            <FormControl><Input {...field} className={inputClasses} /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="permanentAddress"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className={labelClasses}>Permanent Address</FormLabel>
                                            <FormControl><Input {...field} className={inputClasses} /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="medicalProblem"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className={labelClasses}>Medical Conditions</FormLabel>
                                            <FormControl><Input placeholder="Optional" {...field} value={field.value ?? ""} className={inputClasses} /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <div className="flex justify-end gap-4 pt-4 border-t border-emerald-500/20">
                                <Button
                                    type="button"
                                    variant="ghost"
                                    onClick={onClose}
                                    disabled={isLoading}
                                    className="text-slate-300 hover:text-white hover:bg-white/10"
                                >
                                    Cancel
                                </Button>
                                <Button 
                                    type="submit" 
                                    disabled={isLoading}
                                    className="bg-emerald-600 hover:bg-emerald-500 text-white"
                                >
                                    {isLoading && (
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    )}
                                    {isUploading ? "Uploading..." : "Save Changes"}
                                </Button>
                            </div>
                        </form>
                    </Form>
                </div>
            </div>
        </div>
    );
}