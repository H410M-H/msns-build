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
  studentCNIC: z.string().regex(/^\d{5}(-)\d{7}(-)\d$/, "Invalid CNIC format"),
  fatherCNIC: z.string().regex(/^\d{5}(-)\d{7}(-)\d$/, "Invalid CNIC format"),
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
  const [isUploading] = useState(false);

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



  const handleProfilePicUpload = async (_e: React.ChangeEvent<HTMLInputElement>) => {
    // const file = e.target.files?.[0];
    // if (!file) return;

    // const formData = new FormData();
    // formData.append('file', file);

    try {
      // const response = await fetch('/api/v1/upload', {
      //   method: 'POST',
      //   body: formData,
      // });

      // if (!response.ok) throw new Error('Upload failed');
      
      // const { url } = await response.json() as { url: string };
      // setUploadedImageUrl(url);
      // form.setValue("profilePic", url);
      console.log("Profile picture uploaded successfully");
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Upload failed";
      toast({
        title: "Upload Error",
        description: errorMessage,
      });
    }
  };



  const onSubmit = async (data: StudentSchema) => {
    try {
      await createStudent.mutateAsync({
        ...data,
        profilePic: "uploadedImageUrl",
      });
    } catch (error) {
      console.error("Error submitting form:", error);
    }
  };

  const renderFormField = (name: keyof StudentSchema, label: string, type = "text", placeholder = "") => (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem className="w-full">
          <FormLabel className="text-sm font-medium text-gray-700">{label}</FormLabel>
          <FormControl>
            <Input
              type={type}
              placeholder={placeholder || label}
              className="rounded-lg border-gray-200 focus:ring-2 focus:ring-blue-500 transition-all duration-200"
              {...field}
              value={field.value ?? ""}
            />
          </FormControl>
          <FormMessage className="text-xs" />
        </FormItem>
      )}
    />
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4 sm:p-6 lg:p-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="max-w-8xl mx-auto">
        <Card className="backdrop-blur-sm bg-white/90 shadow-xl rounded-2xl overflow-hidden border-0">
          <CardHeader className="relative min-h-[100px] items-center">
            <Image
              src="https://res.cloudinary.com/dvvbxrs55/image/upload/v1737374740/hex-one_cihfwh.jpg"
              alt="School building"
              fill
              style={{ objectFit: "cover" }}
              className="relative inset-0 w-full h-full object-fill filter brightness-75"
            />
            <div className="absolute inset-0" />
            <h2 className="text-4xl font-extrabold relative z-10 text-white">Student Registration Form</h2>
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
                              <Image src={uploadedImageUrl} alt="Profile" width={100} height={100} className="rounded-full object-cover" />
                            ) : (
                              <div className="w-28 h-28 rounded-full bg-green-100 flex items-center justify-center">
                                <ImagePlus className="w-12 h-12 text-gray-400" />
                              </div>
                            )}
                            <Input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={handleProfilePicUpload}
                              aria-label="Upload profile picture"
                            />
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() =>
                                document.querySelector<HTMLInputElement>('input[type="file"][accept="image/*"]')!.click()
                              }
                              className="flex items-center space-x-2"
                              disabled
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

                <Separator />

                {/* Basic Information */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {renderFormField("studentName", "Student Name")}
                  {renderFormField("fatherName", "Father's Name")}
                  {renderFormField("studentCNIC", "Student CNIC", "text", "xxxxx-xxxxxxx-x")}
                  {renderFormField("fatherCNIC", "Father CNIC", "text", "xxxxx-xxxxxxx-x")}
                  {renderFormField("dateOfBirth", "Date of Birth", "date")}
                  {renderFormField("studentMobile", "Student Mobile", "tel", "03xx-xxxxxxx")}
                  {renderFormField("fatherMobile", "Father Mobile", "tel", "03xx-xxxxxxx")}
                  {renderFormField("caste", "Caste")}
                  
                  <FormField
                    control={form.control}
                    name="gender"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Gender</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                </div>

                <Separator />

{/* Address & Education */}
<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
  {renderFormField("currentAddress", "Current Address")}
  {renderFormField("permanentAddress", "Permanent Address")}
  {renderFormField("medicalProblem", "Medical Conditions (optional)")}
</div>

                <CardFooter className="p-6 bg-gray-50 flex justify-end gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      form.reset();
                      setUploadedImageUrl("");
                    }}
                    className="rounded-lg"
                  >
                    Reset Form
                  </Button>
                  <Button
                    type="submit"
                    disabled={createStudent.isPending}
                    className="rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 transition-all duration-300"
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