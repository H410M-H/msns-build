"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "~/components/ui/form";
import { Card, CardContent, CardFooter, CardHeader } from "~/components/ui/card";
import { motion } from "framer-motion";
import { Loader2, Upload, ImagePlus } from "lucide-react";
import { api } from "~/trpc/react";
import { toast } from "~/hooks/use-toast";
import Image from "next/image";
import { Separator } from "~/components/ui/separator";

// Helper for optional regex validation
const optionalRegex = (regex: RegExp, message: string) =>
  z.string().optional().refine((val) => !val || regex.test(val), {
    message,
  });

const studentSchema = z.object({
  studentName: z.string().min(2, "Name must be at least 2 characters").max(100),
  fatherName: z.string().min(2, "Father's name must be at least 2 characters").max(100),
  gender: z.enum(["MALE", "FEMALE", "CUSTOM"]),
  dateOfBirth: z.string().min(1, "Date of Birth is required"),
  // Schema allows optional (undefined), but we will convert undefined to "" on submit
  studentCNIC: optionalRegex(/^\d{5}-\d{7}-\d$/, "Invalid CNIC format"),
  fatherCNIC: optionalRegex(/^\d{5}-\d{7}-\d$/, "Invalid CNIC format"),
  
  studentMobile: z.string().regex(/^(\+92|0)?3\d{9}$/, "Invalid Pakistani mobile number format"),
  fatherMobile: z.string().regex(/^(\+92|0)?3\d{9}$/, "Invalid Pakistani mobile number format"),
  caste: z.string().min(1, "Required"),
  currentAddress: z.string().min(5, "Address too short"),
  permanentAddress: z.string().min(5, "Address too short"),
  medicalProblem: z.string().optional(),
  profilePic: z.string().optional(),
});

type StudentSchema = z.infer<typeof studentSchema>;

export default function StudentCreationDialog() {
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string>("");
  const [isUploading, setIsUploading] = useState(false);

  const form = useForm<StudentSchema>({
    resolver: zodResolver(studentSchema),
    defaultValues: {
      gender: "MALE",
      studentCNIC: "",
      fatherCNIC: "",
      medicalProblem: "",
    },
  });

  const createStudent = api.student.createStudent.useMutation({
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Student registered successfully",
      });
      form.reset();
      setUploadedImageUrl("");
    },
    onError: (error: unknown) => {
      const errorMessage = error instanceof Error ? error.message : "An error occurred";
      toast({
        title: "Error",
        description: errorMessage,
      });
    },
  });

  const handleProfilePicUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    setIsUploading(true);
    try {
      const response = await fetch('/api/v1/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Upload failed');
      
      const { url } = await response.json() as { url: string };
      setUploadedImageUrl(url);
      form.setValue("profilePic", url);
      toast({ title: "Success", description: "Profile picture uploaded" });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Upload failed";
      toast({
        title: "Upload Error",
        description: errorMessage,
      });
    } finally {
      setIsUploading(false);
    }
  };

  const onSubmit = async (data: StudentSchema) => {
    try {
      await createStudent.mutateAsync({
        ...data,
        // FIX: Coalesce undefined to empty string because Server expects string
        studentCNIC: data.studentCNIC ?? "",
        fatherCNIC: data.fatherCNIC ?? "",
        profilePic: uploadedImageUrl,
      });
    } catch (error) {
      console.error("Error submitting form:", error);
    }
  };

  const formatCNIC = (value: string) => {
    const numbers = value.replace(/\D/g, "");
    if (numbers.length <= 5) return numbers;
    if (numbers.length <= 12) return `${numbers.slice(0, 5)}-${numbers.slice(5)}`;
    return `${numbers.slice(0, 5)}-${numbers.slice(5, 12)}-${numbers.slice(12, 13)}`;
  };

  const renderFormField = (
    name: keyof StudentSchema, 
    label: string, 
    type = "text", 
    placeholder = "",
    isCNIC = false
  ) => (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem className="w-full">
          <FormLabel className="text-sm font-medium text-emerald-100">{label}</FormLabel>
          <FormControl>
            <Input
              type={type}
              placeholder={placeholder || label}
              className="rounded-lg border-emerald-500/30 bg-slate-950/50 text-white placeholder:text-slate-400 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
              {...field}
              value={field.value ?? ""}
              onChange={(e) => {
                if (isCNIC) {
                  const formatted = formatCNIC(e.target.value);
                  field.onChange(formatted);
                } else {
                  field.onChange(e.target.value.toUpperCase());
                }
              }}
              maxLength={isCNIC ? 15 : undefined} 
            />
          </FormControl>
          <FormMessage className="text-xs text-red-400" />
        </FormItem>
      )}
    />
  );

  return (
    <div className="relative min-h-screen w-full bg-slate-950 overflow-x-hidden selection:bg-emerald-500/30">
      <div className="inset-0 z-0 pointer-events-none fixed">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(45,255,196,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(45,255,196,0.05)_1px,transparent_1px)] bg-[size:3rem_3rem] sm:bg-[size:4rem_4rem]" />
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/40 via-black/20 to-black/60" />
      </div>

      <div className="relative z-10 p-4 sm:p-6 lg:p-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.5 }} 
          className="max-w-7xl mx-auto"
        >
          <Card className="backdrop-blur-xl bg-slate-900/60 border-emerald-500/20 shadow-2xl rounded-2xl overflow-hidden">
            <CardHeader className="relative h-32 sm:h-48 items-center justify-center overflow-hidden border-b border-emerald-500/20 p-0">
              <div className="absolute inset-0">
                 <Image
                  src="https://res.cloudinary.com/dvvbxrs55/image/upload/v1737374740/hex-one_cihfwh.jpg"
                  alt="School building"
                  fill
                  className="object-cover opacity-40 mix-blend-overlay"
                />
                 <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent" />
              </div>
              <h2 className="relative z-10 text-3xl sm:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-200 to-teal-400 drop-shadow-sm text-center px-4">
                Student Registration
              </h2>
            </CardHeader>

            <CardContent className="p-4 sm:p-8">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                  {/* Profile Picture */}
                  <div className="flex justify-center -mt-16 sm:-mt-20 relative z-20 mb-8">
                    <FormField
                      control={form.control}
                      name="profilePic"
                      render={() => (
                        <FormItem>
                          <FormControl>
                            <div className="flex flex-col items-center gap-4 group">
                              <div className="relative h-32 w-32 rounded-full ring-4 ring-emerald-500/30 shadow-2xl overflow-hidden bg-slate-800 transition-transform group-hover:scale-105">
                                {uploadedImageUrl ? (
                                  <Image src={uploadedImageUrl} alt="Profile" fill className="object-cover" />
                                ) : (
                                  <div className="h-full w-full flex items-center justify-center bg-slate-800 text-emerald-500/50">
                                    <ImagePlus className="w-12 h-12" />
                                  </div>
                                )}
                              </div>
                              
                              <Input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                id="pic-upload"
                                onChange={handleProfilePicUpload}
                              />
                              <Button
                                type="button"
                                variant="secondary"
                                size="sm"
                                onClick={() => document.getElementById("pic-upload")?.click()}
                                className="bg-emerald-600 hover:bg-emerald-500 text-white border-0 shadow-lg shadow-emerald-900/20"
                                disabled={isUploading}
                              >
                                {isUploading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Upload className="w-4 h-4 mr-2" />}
                                {isUploading ? "Uploading..." : "Upload Photo"}
                              </Button>
                            </div>
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Basic Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
                    {renderFormField("studentName", "Student Name")}
                    {renderFormField("fatherName", "Father's Name")}
                    
                    <FormField
                      control={form.control}
                      name="gender"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium text-emerald-100">Gender</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className="bg-slate-950/50 border-emerald-500/30 text-white focus:ring-emerald-500">
                                <SelectValue placeholder="Select gender" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="bg-slate-900 border-emerald-500/30 text-white">
                              <SelectItem value="MALE">Male</SelectItem>
                              <SelectItem value="FEMALE">Female</SelectItem>
                              <SelectItem value="CUSTOM">Other</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage className="text-xs text-red-400" />
                        </FormItem>
                      )}
                    />

                    {renderFormField("dateOfBirth", "Date of Birth", "date")}
                    {renderFormField("studentCNIC", "Student CNIC (Optional)", "text", "xxxxx-xxxxxxx-x", true)}
                    {renderFormField("fatherCNIC", "Father CNIC (Optional)", "text", "xxxxx-xxxxxxx-x", true)}
                    {renderFormField("studentMobile", "Student Mobile", "tel", "03xx-xxxxxxx")}
                    {renderFormField("fatherMobile", "Father Mobile", "tel", "03xx-xxxxxxx")}
                    {renderFormField("caste", "Caste")}
                  </div>

                  <Separator className="bg-emerald-500/20" />

                  {/* Address & Education */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
                    {renderFormField("currentAddress", "Current Address")}
                    {renderFormField("permanentAddress", "Permanent Address")}
                    <div className="md:col-span-2">
                        {renderFormField("medicalProblem", "Medical Conditions (Optional)")}
                    </div>
                  </div>

                  <CardFooter className="p-0 pt-6 flex flex-col-reverse sm:flex-row justify-end gap-3">
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => {
                        form.reset();
                        setUploadedImageUrl("");
                      }}
                      className="w-full sm:w-auto text-emerald-200 hover:text-white hover:bg-emerald-500/20"
                    >
                      Reset Form
                    </Button>
                    <Button
                      type="submit"
                      disabled={createStudent.isPending}
                      className="w-full sm:w-auto bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-lg shadow-emerald-900/50"
                    >
                      {createStudent.isPending ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin mr-2" />
                          Registering...
                        </>
                      ) : (
                        "Complete Registration"
                      )}
                    </Button>
                  </CardFooter>
                </form>
              </Form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}