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

const studentSchema = z.object({
  studentName: z.string().min(2, "Name must be at least 2 characters").max(100),
  fatherName: z.string().min(2, "Father's name must be at least 2 characters").max(100),
  gender: z.enum(["MALE", "FEMALE", "CUSTOM"]),
  dateOfBirth: z.string().min(1, "Date of Birth is required"),
  studentCNIC: z.string().regex(/^\d{5}-\d{7}-\d$/, "Invalid CNIC format (e.g., 12345-1234567-1)"),
  fatherCNIC: z.string().regex(/^\d{5}-\d{7}-\d$/, "Invalid CNIC format (e.g., 12345-1234567-1)"),
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
        profilePic: uploadedImageUrl,
      });
    } catch (error) {
      console.error("Error submitting form:", error);
    }
  };

  // Helper to auto-format CNIC
  const formatCNIC = (value: string) => {
    const numbers = value.replace(/\D/g, "");
    
    if (numbers.length <= 5) {
      return numbers;
    } else if (numbers.length <= 12) {
      return `${numbers.slice(0, 5)}-${numbers.slice(5)}`;
    } else {
      return `${numbers.slice(0, 5)}-${numbers.slice(5, 12)}-${numbers.slice(12, 13)}`;
    }
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
          <FormLabel className="text-md font-medium text-emerald-900">{label}</FormLabel>
          <FormControl>
            <Input
              type={type}
              placeholder={placeholder || label}
              // 1. Added "uppercase" class for visual feedback
              className="rounded-lg border-green-600 text-slate-900 bg-white/90 focus:ring-2 focus:ring-blue-500 transition-all duration-200"
              {...field}
              value={field.value ?? ""}
              onChange={(e) => {
                if (isCNIC) {
                  const formatted = formatCNIC(e.target.value);
                  field.onChange(formatted);
                } else {
                  // 2. Force Uppercase in logic
                  field.onChange(e.target.value.toUpperCase());
                }
              }}
              maxLength={isCNIC ? 15 : undefined} 
            />
          </FormControl>
          <FormMessage className="text-xs text-red-500 font-medium" />
        </FormItem>
      )}
    />
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-500 via-yellow-600 to-emerald-700 p-4 sm:p-6 lg:p-8 rounded-lg shadow-lg">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="max-w-8xl mx-auto">
        <Card className="backdrop-blur-sm bg-gray-400/70 shadow-xl rounded-2xl overflow-hidden border-0">
          <CardHeader className="relative min-h-[100px] items-center">
            <Image
              src="https://res.cloudinary.com/dvvbxrs55/image/upload/v1737374740/hex-one_cihfwh.jpg"
              alt="School building"
              fill
              style={{ objectFit: "cover" }}
              className="relative inset-0 w-full h-full object-fill filter brightness-75"
            />
            <div className="absolute inset-0 bg-black/40" />
            <h2 className="text-4xl font-extrabold relative z-10 text-white drop-shadow-md">Student Registration Form</h2>
          </CardHeader>

          <CardContent className="p-8">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                {/* Profile Picture */}
                <div className="flex justify-center">
                  <FormField
                    control={form.control}
                    name="profilePic"
                    render={() => (
                      <FormItem>
                        <FormLabel className="sr-only">Profile Picture</FormLabel>
                        <FormControl>
                          <div className="flex flex-col items-center space-y-4">
                            {uploadedImageUrl ? (
                              <div className="relative h-28 w-28">
                                <Image src={uploadedImageUrl} alt="Profile" fill className="rounded-full object-cover border-4 border-white shadow-md" />
                              </div>
                            ) : (
                              <div className="w-28 h-28 rounded-full bg-white/80 flex items-center justify-center border-4 border-white shadow-md">
                                <ImagePlus className="w-12 h-12 text-gray-400" />
                              </div>
                            )}
                            <Input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={handleProfilePicUpload}
                              aria-label="Upload profile picture"
                              id="pic-upload"
                            />
                            <Button
                              type="button"
                              variant="secondary"
                              onClick={() => document.getElementById("pic-upload")?.click()}
                              className="flex items-center space-x-2 bg-white hover:bg-gray-100 text-gray-800"
                              disabled={isUploading}
                            >
                              {isUploading ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <Upload className="w-4 h-4" />
                              )}
                              <span>{isUploading ? "Uploading..." : "Upload Photo"}</span>
                            </Button>
                          </div>
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>

                <Separator className="bg-white/40" />

                {/* Basic Information */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {renderFormField("studentName", "Student Name")}
                  {renderFormField("fatherName", "Father's Name")}
                  {renderFormField("studentCNIC", "Student CNIC", "text", "xxxxx-xxxxxxx-x", true)}
                  {renderFormField("fatherCNIC", "Father CNIC", "text", "xxxxx-xxxxxxx-x", true)}
                  {renderFormField("dateOfBirth", "Date of Birth", "date")}
                  {renderFormField("studentMobile", "Student Mobile", "tel", "03xx-xxxxxxx")}
                  {renderFormField("fatherMobile", "Father Mobile", "tel", "03xx-xxxxxxx")}
                  {renderFormField("caste", "Caste")}
                  
                  <FormField
                    control={form.control}
                    name="gender"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-md font-medium text-emerald-900">Gender</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="bg-white/90 border-green-600 text-slate-900">
                              <SelectValue placeholder="Select gender" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="MALE">Male</SelectItem>
                            <SelectItem value="FEMALE">Female</SelectItem>
                            <SelectItem value="CUSTOM">Other</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage className="text-xs text-red-500 font-medium" />
                      </FormItem>
                    )}
                  />
                </div>

                <Separator className="bg-white/40" />

                {/* Address & Education */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {renderFormField("currentAddress", "Current Address")}
                  {renderFormField("permanentAddress", "Permanent Address")}
                  {renderFormField("medicalProblem", "Medical Conditions (optional)")}
                </div>

                <CardFooter className="p-0 pt-6 flex justify-end gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      form.reset();
                      setUploadedImageUrl("");
                    }}
                    className="rounded-lg bg-white/50 hover:bg-white/80 border-0"
                  >
                    Reset Form
                  </Button>
                  <Button
                    type="submit"
                    disabled={createStudent.isPending}
                    className="rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg px-8"
                  >
                    {createStudent.isPending ? (
                      <div className="flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Registering...
                      </div>
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
  );
}