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
import { Loader2, Upload, Briefcase, User, MapPin } from "lucide-react";
import { api } from "~/trpc/react"; 
import { toast } from "~/hooks/use-toast";
import Image from "next/image";
import { Separator } from "~/components/ui/separator";

// Zod schema (unchanged logic, just cleaned up)
const employeeSchema = z.object({
  employeeName: z.string().min(2, "Name too short").max(100),
  fatherName: z.string().min(2, "Name too short").max(100),
  gender: z.enum(["MALE", "FEMALE", "CUSTOM"]),
  dob: z.string().min(1, "Required"),
  cnic: z.string().regex(/^\d{5}-\d{7}-\d$/, "Invalid CNIC format"),
  maritalStatus: z.enum(["Married", "Unmarried", "Widow", "Divorced"]),
  doj: z.string({ message: "Required" }),
  designation: z.enum(["PRINCIPAL", "ADMIN", "HEAD", "CLERK", "TEACHER", "WORKER"]),
  residentialAddress: z.string().min(5, "Too short"),
  mobileNo: z.string().regex(/^(\+92|0)?3\d{9}$/, "Invalid Mobile No"),
  additionalContact: z.string().optional(),
  education: z.string().min(2, "Required"),
  profilePic: z.string().optional(),
  cv: z.string().optional(),
});

type EmployeeSchema = z.infer<typeof employeeSchema>;

export default function EmployeeCreationDialog() {
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string>("");
  const [uploadedCvUrl, setUploadedCvUrl] = useState<string>("");

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
      toast({ title: "Success", description: "Employee registered successfully" });
      form.reset();
      setUploadedImageUrl("");
      setUploadedCvUrl("");
    },
    onError: (error) => {
      toast({ title: "Error", description: error.message });
    },
  });

  const handleProfilePicUpload = async () => {
    console.log("Profile picture upload placeholder");
  };


  const onSubmit = async (data: EmployeeSchema) => {
    await createEmployee.mutateAsync({
      ...data,
      profilePic: uploadedImageUrl,
      cv: uploadedCvUrl,
    });
  };

  const renderFormField = (name: keyof EmployeeSchema, label: string, type = "text", placeholder = "") => (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem className="w-full">
          <FormLabel className="text-emerald-100/80 text-sm font-medium">{label}</FormLabel>
          <FormControl>
            <Input
              type={type}
              placeholder={placeholder || label}
              className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-emerald-500 focus:ring-emerald-500/20 rounded-xl h-11"
              {...field}
              value={field.value ?? ""}
            />
          </FormControl>
          <FormMessage className="text-red-400 text-xs" />
        </FormItem>
      )}
    />
  );

  return (
    <div className="w-full max-w-5xl mx-auto">
      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ duration: 0.5 }}
      >
        <Card className="border border-white/10 bg-white/5 backdrop-blur-xl shadow-2xl rounded-[2rem] overflow-hidden">
          <CardHeader className="relative h-32 sm:h-40 bg-gradient-to-r from-emerald-900/40 to-cyan-900/40 border-b border-white/10">
            <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20" />
            <div className="relative z-10 flex items-center gap-4 h-full px-6">
              <div className="p-3 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 backdrop-blur-md">
                <Briefcase className="w-8 h-8 text-emerald-400" />
              </div>
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">New Employee Registration</h2>
                <p className="text-emerald-100/60 text-sm mt-1">Create a profile for a new faculty or staff member</p>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-6 sm:p-8">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                {/* Profile Picture */}
                <div className="flex justify-center">
                  <FormField
                    control={form.control}
                    name="profilePic"
                    render={() => (
                      <FormItem>
                        <FormControl>
                          <div className="flex flex-col items-center space-y-4 group">
                            <div className="relative">
                                {uploadedImageUrl ? (
                                <Image src={uploadedImageUrl} alt="Profile" width={120} height={120} className="rounded-full object-cover border-4 border-emerald-500/30" />
                                ) : (
                                <div className="w-32 h-32 rounded-full bg-white/5 border-2 border-dashed border-white/20 flex items-center justify-center group-hover:border-emerald-500/50 transition-colors">
                                    <User className="w-12 h-12 text-white/20 group-hover:text-emerald-400 transition-colors" />
                                </div>
                                )}
                                <div className="absolute bottom-0 right-0 p-2 bg-emerald-600 rounded-full shadow-lg cursor-pointer hover:bg-emerald-500 transition-colors">
                                    <Upload className="w-4 h-4 text-white" />
                                </div>
                            </div>
                            
                            <Input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={handleProfilePicUpload}
                              disabled
                            />
                            <span className="text-xs text-emerald-100/40 font-medium">Upload Profile Photo (Coming Soon)</span>
                          </div>
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>

                <Separator className="bg-white/10" />

                {/* Basic Fields */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {renderFormField("employeeName", "Full Name")}
                  {renderFormField("fatherName", "Father's Name")}
                  {renderFormField("cnic", "CNIC (xxxxx-xxxxxxx-x)")}
                  {renderFormField("dob", "Date of Birth", "date")}
                  {renderFormField("doj", "Date of Joining", "date")}
                  {renderFormField("mobileNo", "Mobile Number")}
                  
                  <FormField
                    control={form.control}
                    name="gender"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-emerald-100/80 text-sm font-medium">Gender</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="bg-white/5 border-white/10 text-white h-11 rounded-xl focus:ring-emerald-500/20">
                              <SelectValue placeholder="Select gender" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="bg-black/90 border-white/10 text-white">
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
                    name="designation"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-emerald-100/80 text-sm font-medium">Designation</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="bg-white/5 border-white/10 text-white h-11 rounded-xl focus:ring-emerald-500/20">
                              <SelectValue placeholder="Select role" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="bg-black/90 border-white/10 text-white">
                            <SelectItem value="PRINCIPAL">Principal</SelectItem>
                            <SelectItem value="ADMIN">Admin</SelectItem>
                            <SelectItem value="TEACHER">Teacher</SelectItem>
                            <SelectItem value="CLERK">Clerk</SelectItem>
                            <SelectItem value="HEAD">Head</SelectItem>
                            <SelectItem value="WORKER">Worker</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  {/* Marital Status Field would go here similar to above */}
                   <FormField
                    control={form.control}
                    name="maritalStatus"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-emerald-100/80 text-sm font-medium">Marital Status</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="bg-white/5 border-white/10 text-white h-11 rounded-xl focus:ring-emerald-500/20">
                              <SelectValue placeholder="Select Status" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="bg-black/90 border-white/10 text-white">
                            <SelectItem value="Married">Married</SelectItem>
                            <SelectItem value="Unmarried">Unmarried</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <Separator className="bg-white/10" />

                {/* Addresses & Contact */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="col-span-1 md:col-span-2">
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                        <MapPin className="w-5 h-5 text-cyan-400" /> Contact Details
                    </h3>
                  </div>
                  {renderFormField("residentialAddress", "Residential Address")}
                  {renderFormField("additionalContact", "Additional Contact (Optional)")}
                </div>

                <Separator className="bg-white/10" />

                {/* Education */}
                <div className="grid grid-cols-1 gap-6">
                  {renderFormField("education", "Highest Education Qualification")}
                  
                  {/* CV Upload Placeholder */}
                  <div className="bg-white/5 border border-white/10 rounded-xl p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-white/5 rounded-lg">
                            <Briefcase className="w-5 h-5 text-emerald-400" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-white">Curriculum Vitae</p>
                            <p className="text-xs text-emerald-100/50">Upload PDF or DOCX</p>
                        </div>
                    </div>
                    <Button variant="outline" disabled className="border-white/10 text-emerald-100/50 hover:bg-white/5">
                        Upload (Disabled)
                    </Button>
                  </div>
                </div>

                <CardFooter className="p-0 pt-4 flex justify-end gap-4">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => form.reset()}
                    className="text-emerald-100/60 hover:text-white hover:bg-white/5"
                  >
                    Reset Form
                  </Button>
                  <Button
                    type="submit"
                    disabled={createEmployee.isPending}
                    className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-lg shadow-emerald-900/20 px-8 py-6 rounded-xl text-base font-semibold transition-all duration-300 hover:scale-[1.02]"
                  >
                    {createEmployee.isPending ? (
                      <div className="flex items-center gap-2">
                        <Loader2 className="w-5 h-5 animate-spin" />
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