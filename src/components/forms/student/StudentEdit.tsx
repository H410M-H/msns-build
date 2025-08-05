"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { type z } from "zod";
import { api } from "~/trpc/react";
import { toast } from "~/hooks/use-toast";
import { Loader2 } from "lucide-react";
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
import { studentSchema } from "~/server/api/routers/student";
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
            });
        },
    });

    useEffect(() => {
        if (student.profilePic) {
            form.setValue("profilePic", student.profilePic);
        }
    }, [student.profilePic, form]);

    const onSubmit = (values: z.infer<typeof studentSchema>) => {
        updateStudent.mutate({
            ...(values as { studentId: string; studentMobile: string; fatherMobile: string; studentName: string; gender: "MALE" | "FEMALE" | "CUSTOM"; dateOfBirth: string; fatherName: string; studentCNIC: string; /* ... 13 more ... */ }),
            fatherCNIC: "",
            caste: "",
            currentAddress: "",
            permanentAddress: ""
        });
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <h2 className="text-2xl font-bold mb-4">Edit Student Details</h2>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Student Name */}
                            <FormField
                                control={form.control}
                                name="studentName"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Student Name</FormLabel>
                                        <FormControl>
                                            <Input {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Father's Name */}
                            <FormField
                                control={form.control}
                                name="fatherName"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Father Name</FormLabel>
                                        <FormControl>
                                            <Input {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Gender Select */}
                            <FormField
                                control={form.control}
                                name="gender"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Gender</FormLabel>
                                        <Select onValueChange={(value: string) => field.onChange(value)} value={(field.value as string) ?? ''}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select gender" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="MALE">Male</SelectItem>
                                                <SelectItem value="FEMALE">Female</SelectItem>
                                                <SelectItem value="CUSTOM">Other</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Date of Birth */}
                            <FormField
                                control={form.control}
                                name="dateOfBirth"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Date of Birth</FormLabel>
                                        <FormControl>
                                            <Input type="date" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Student CNIC */}
                            <FormField
                                control={form.control}
                                name="studentCNIC"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Student CNIC</FormLabel>
                                        <FormControl>
                                            <Input placeholder="XXXXX-XXXXXXX-X" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Father CNIC */}
                            <FormField
                                control={form.control}
                                name="fatherCNIC"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Father CNIC</FormLabel>
                                        <FormControl>
                                            <Input placeholder="XXXXX-XXXXXXX-X" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Student Mobile */}
                            <FormField
                                control={form.control}
                                name="studentMobile"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Student Mobile</FormLabel>
                                        <FormControl>
                                            <Input placeholder="03XX-XXXXXXX" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Father Mobile */}
                            <FormField
                                control={form.control}
                                name="fatherMobile"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Father Mobile</FormLabel>
                                        <FormControl>
                                            <Input placeholder="03XX-XXXXXXX" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Caste */}
                            <FormField
                                control={form.control}
                                name="caste"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Caste</FormLabel>
                                        <FormControl>
                                            <Input {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Current Address */}
                            <FormField
                                control={form.control}
                                name="currentAddress"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Current Address</FormLabel>
                                        <FormControl>
                                            <Input {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Permanent Address */}
                            <FormField
                                control={form.control}
                                name="permanentAddress"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Permanent Address</FormLabel>
                                        <FormControl>
                                            <Input {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Medical Problems */}
                            <FormField
                                control={form.control}
                                name="medicalProblem"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Medical Conditions</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Optional" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="flex justify-end gap-4">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={onClose}
                                disabled={updateStudent.isPending}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" disabled={updateStudent.isPending}>
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
    );
}