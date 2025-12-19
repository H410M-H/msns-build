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
import { Loader2, Upload, ImagePlus, FileText, CheckCircle } from "lucide-react";
import { api } from "~/trpc/react";
import { toast } from "~/hooks/use-toast";
import Image from "next/image";
import { Separator } from "~/components/ui/separator";

const employeeSchema = z.object({
  employeeName: z.string().min(2, "Name must be at least 2 characters").max(100),
  fatherName: z.string().min(2, "Father's name must be at least 2 characters").max(100),
  gender: z.enum(["MALE", "FEMALE", "CUSTOM"]),
  dob: z.string().min(1, "Date of Birth is required"),
  cnic: z.string().regex(/^\d{5}-\d{7}-\d$/, "Invalid CNIC format (e.g., 12345-1234567-1)"),
  maritalStatus: z.enum(["Married", "Unmarried", "Widow", "Divorced"]),
  doj: z.string().min(1, "Date of Joining is required"),
  designation: z.enum(["PRINCIPAL", "ADMIN", "HEAD", "CLERK", "TEACHER", "WORKER"]),
  residentialAddress: z.string().min(5, "Address too short"),
  mobileNo: z.string().regex(/^(\+92|0)?3\d{9}$/, "Invalid Pakistani mobile number format"),
  additionalContact: z.string().optional(),
  education: z.string().min(2, "Required"),
  profilePic: z.string().optional(),
  cv: z.string().optional(),
});

type EmployeeSchema = z.infer<typeof employeeSchema>;

export default function EmployeeCreationDialog() {
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string>("");
  const [uploadedCvUrl, setUploadedCvUrl] = useState<string>("");
  const [isPicUploading, setIsPicUploading] = useState(false);
  const [isCvUploading, setIsCvUploading] = useState(false);

  const form = useForm<EmployeeSchema>({
    resolver: zodResolver(employeeSchema),
    defaultValues: {
      gender: "MALE",
      maritalStatus: "Unmarried",
      designation: "TEACHER",
    },
  });

  const createEmployee = api.employee.createEmployee.useMutation({
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Employee registered successfully",
      });
      form.reset();
      setUploadedImageUrl("");
      setUploadedCvUrl("");
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

    setIsPicUploading(true);
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
      toast({ title: "Upload Error", description: errorMessage });
    } finally {
      setIsPicUploading(false);
    }
  };

  const handleCvUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    setIsCvUploading(true);
    try {
      const response = await fetch('/api/v1/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('CV Upload failed');
      
      const { url } = await response.json() as { url: string };
      setUploadedCvUrl(url);
      form.setValue("cv", url);
      toast({ title: "Success", description: "CV/Resume uploaded successfully" });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Upload failed";
      toast({ title: "Upload Error", description: errorMessage });
    } finally {
      setIsCvUploading(false);
    }
  };

  const onSubmit = async (data: EmployeeSchema) => {
    try {
      await createEmployee.mutateAsync({
        ...data,
        profilePic: uploadedImageUrl,
        cv: uploadedCvUrl,
      });
    } catch (error) {
      console.error("Error submitting form:", error);
    }
  };

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
    name: keyof EmployeeSchema, 
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
              // Added "uppercase" class for visual feedback
              className="rounded-lg border-green-600 text-slate-900 bg-emerald-100/90 focus:ring-2 focus:ring-blue-500 transition-all duration-200"
              {...field}
              value={field.value ?? ""}
              onChange={(e) => {
                if (isCNIC) {
                  const formatted = formatCNIC(e.target.value);
                  field.onChange(formatted);
                } else {
                  // Forcing Uppercase on the logic level
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
            <h2 className="text-4xl font-extrabold relative z-10 text-white drop-shadow-md">Employee Registration Form</h2>
          </CardHeader>

          <CardContent className="p-8">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                
                {/* --- Profile Picture Section --- */}
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
                              id="pic-upload"
                            />
                            <Button
                              type="button"
                              variant="secondary"
                              onClick={() => document.getElementById("pic-upload")?.click()}
                              className="flex items-center space-x-2 bg-white hover:bg-gray-100 text-gray-800"
                              disabled={isPicUploading}
                            >
                              {isPicUploading ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <Upload className="w-4 h-4" />
                              )}
                              <span>{isPicUploading ? "Uploading..." : "Upload Photo"}</span>
                            </Button>
                          </div>
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>

                <Separator className="bg-white/40" />

                {/* --- Personal Information --- */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {renderFormField("employeeName", "Full Name")}
                  {renderFormField("fatherName", "Father's Name")}
                  {renderFormField("cnic", "CNIC", "text", "xxxxx-xxxxxxx-x", true)}
                  {renderFormField("dob", "Date of Birth", "date")}
                  {renderFormField("mobileNo", "Mobile Number", "tel", "03xxxxxxxxx")}
                  
                  <FormField
                    control={form.control}
                    name="gender"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-md font-medium text-emerald-900">Gender</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="bg-emerald-100/40 border-green-600 text-slate-900">
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
                  
                   <FormField
                    control={form.control}
                    name="maritalStatus"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-md font-medium text-emerald-900">Marital Status</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="bg-emerald-100/40 border-green-600 text-slate-900">
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Unmarried">Unmarried</SelectItem>
                            <SelectItem value="Married">Married</SelectItem>
                            <SelectItem value="Widow">Widow</SelectItem>
                            <SelectItem value="Divorced">Divorced</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage className="text-xs text-red-500 font-medium" />
                      </FormItem>
                    )}
                  />
                </div>

                <Separator className="bg-emerald-900/40" />

                {/* --- Job & Education --- */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                   {renderFormField("doj", "Date of Joining", "date")}
                   
                   <FormField
                    control={form.control}
                    name="designation"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-md font-medium text-emerald-900">Designation</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="bg-emerald-100/40 border-green-600 text-slate-900">
                              <SelectValue placeholder="Select role" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="PRINCIPAL">Principal</SelectItem>
                            <SelectItem value="ADMIN">Admin</SelectItem>
                            <SelectItem value="HEAD">Head</SelectItem>
                            <SelectItem value="TEACHER">Teacher</SelectItem>
                            <SelectItem value="CLERK">Clerk</SelectItem>
                            <SelectItem value="WORKER">Worker</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage className="text-xs text-red-500 font-medium" />
                      </FormItem>
                    )}
                  />

                  {renderFormField("education", "Qualification")}
                </div>

                <Separator className="bg-emerald-900/40" />

                {/* --- Address & CV --- */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {renderFormField("residentialAddress", "Residential Address")}
                  {renderFormField("additionalContact", "Additional Contact (Optional)")}
                  
                  {/* CV Upload Section */}
                  <div className="col-span-1 md:col-span-2 bg-white/40 p-4 rounded-xl border border-white/50">
                     <FormField
                        control={form.control}
                        name="cv"
                        render={() => (
                          <FormItem className="flex items-center justify-between">
                            <div className="flex flex-col">
                                <FormLabel className="text-md font-bold text-emerald-900 flex items-center gap-2">
                                    <FileText className="w-5 h-5" /> 
                                    Curriculum Vitae (CV)
                                </FormLabel>
                                <span className="text-xs text-emerald-900/70">Upload PDF or DOCX format</span>
                                {uploadedCvUrl && (
                                    <span className="text-xs text-green-700 font-bold flex items-center gap-1 mt-1">
                                        <CheckCircle className="w-3 h-3"/> Uploaded Successfully
                                    </span>
                                )}
                            </div>
                            
                            <FormControl>
                              <div className="flex items-center gap-3">
                                <Input
                                  type="file"
                                  accept=".pdf,.doc,.docx"
                                  className="hidden"
                                  onChange={handleCvUpload}
                                  id="cv-upload"
                                />
                                <Button
                                  type="button"
                                  variant="outline"
                                  onClick={() => document.getElementById("cv-upload")?.click()}
                                  disabled={isCvUploading}
                                  className="bg-white/80 hover:bg-white text-emerald-800 border-green-600"
                                >
                                  {isCvUploading ? (
                                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                  ) : (
                                    <Upload className="w-4 h-4 mr-2" />
                                  )}
                                  {uploadedCvUrl ? "Replace CV" : "Upload CV"}
                                </Button>
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                  </div>
                </div>

                <CardFooter className="p-0 pt-6 flex justify-end gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      form.reset();
                      setUploadedImageUrl("");
                      setUploadedCvUrl("");
                    }}
                    className="rounded-lg bg-white/50 hover:bg-white/80 border-0"
                  >
                    Reset Form
                  </Button>
                  <Button
                    type="submit"
                    disabled={createEmployee.isPending || isPicUploading || isCvUploading}
                    className="rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg px-8"
                  >
                    {createEmployee.isPending ? (
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