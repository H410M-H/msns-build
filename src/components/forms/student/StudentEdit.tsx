"use client";

import { useEffect } from "react";
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
// IMPORT FROM NEW SHARED FILE TO AVOID 'FS' ERROR
import { studentSchema } from "~/lib/schemas/student";

type StudentEditFormProps = {
    student: Students;
    onClose: () => void;
};

export function StudentEditDialog({ student, onClose }: StudentEditFormProps) {
    const form = useForm<z.infer<typeof studentSchema>>({
        resolver: zodResolver(studentSchema as z.ZodType<z.infer<typeof studentSchema>>),
        defaultValues: {
            studentName: student.studentName ?? "",
            fatherName: student.fatherName ?? "",
            gender: student.gender ?? "MALE",
            dateOfBirth: student.dateOfBirth ?? "",
            studentCNIC: student.studentCNIC ?? "",
            fatherCNIC: student.fatherCNIC ?? "",
            studentMobile: student.studentMobile ?? "",
            fatherMobile: student.fatherMobile ?? "",
            caste: student.caste ?? "",
            currentAddress: student.currentAddress ?? "",
            permanentAddress: student.permanentAddress ?? "",
            medicalProblem: student.medicalProblem ?? "",
            profilePic: student.profilePic ?? "",
        },
    });

    const updateStudent = api.student.updateStudent.useMutation({
        onSuccess: () => {
            toast({
                title: "Success",
                description: "Student updated successfully",
            });
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
            // Check file size (e.g., limit to 2MB to prevent large payload errors)
            if (file.size > 2 * 1024 * 1024) {
                toast({
                    title: "File too large",
                    description: "Please select an image smaller than 2MB.",
                    variant: "destructive",
                });
                return;
            }

            const reader = new FileReader();
            reader.onloadend = () => {
                const result = reader.result as string;
                form.setValue("profilePic", result);
            };
            reader.readAsDataURL(file);
        }
    };

    const onSubmit = (values: z.infer<typeof studentSchema>) => {
        updateStudent.mutate({
            studentId: student.studentId, 
            studentName: values.studentName,
            fatherName: values.fatherName,
            gender: values.gender,
            dateOfBirth: values.dateOfBirth,
            studentCNIC: values.studentCNIC ?? "",
            fatherCNIC: values.fatherCNIC ?? "",
            studentMobile: values.studentMobile,
            fatherMobile: values.fatherMobile,
            caste: values.caste,
            currentAddress: values.currentAddress,
            permanentAddress: values.permanentAddress,
            medicalProblem: values.medicalProblem ?? "",
            profilePic: values.profilePic ?? ""
        });
    };

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
                            
                            {/* Profile Picture Section */}
                            <div className="flex flex-col items-center gap-4 pb-6 border-b border-emerald-500/10">
                                <div className="relative h-28 w-28 rounded-full overflow-hidden border-2 border-emerald-500/50 bg-slate-800 shadow-lg shadow-emerald-500/10 group">
                                    {form.watch("profilePic") ? (
                                        // eslint-disable-next-line @next/next/no-img-element
                                        <img 
                                            src={form.watch("profilePic")} 
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
                                    <Input 
                                        id="profile-upload"
                                        type="file" 
                                        accept="image/*"
                                        className="hidden" 
                                        onChange={handleFileChange}
                                    />
                                    {form.watch("profilePic") && (
                                         <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                                            onClick={() => form.setValue("profilePic", "")}
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
                                            <Select onValueChange={field.onChange} value={field.value as string}>
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
                                            <FormControl><Input type="date" {...field} className={inputClasses} /></FormControl>
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
                                    disabled={updateStudent.isPending}
                                    className="text-slate-300 hover:text-white hover:bg-white/10"
                                >
                                    Cancel
                                </Button>
                                <Button 
                                    type="submit" 
                                    disabled={updateStudent.isPending}
                                    className="bg-emerald-600 hover:bg-emerald-500 text-white"
                                >
                                    {updateStudent.isPending && (
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    )}
                                    Save Changes
                                </Button>
                            </div>
                        </form>
                    </Form>
                </div>
            </div>
        </div>
    );
}