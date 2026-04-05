"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { api } from "~/trpc/react";
import { toast } from "~/hooks/use-toast";
import {
  Loader2,
  X,
  User,
  Briefcase,
  Phone,
  MapPin,
  GraduationCap,
  Calendar,
  CreditCard,
  ShieldCheck,
  Mail,
  AtSign,
} from "lucide-react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Separator } from "~/components/ui/separator";
import type { Employees } from "@prisma/client";

// --- Types ---
type Gender = "MALE" | "FEMALE" | "CUSTOM";
type MaritalStatus = "Married" | "Unmarried" | "Widow" | "Divorced";
type Designation =
  | "ADMIN"
  | "PRINCIPAL"
  | "HEAD"
  | "CLERK"
  | "TEACHER"
  | "WORKER";

// --- Schema ---
const formSchema = z.object({
  employeeName: z.string().min(2),
  fatherName: z.string().min(2),
  gender: z.enum(["MALE", "FEMALE", "CUSTOM"]),
  dob: z.string(),
  cnic: z.string(),
  maritalStatus: z.enum(["Married", "Unmarried", "Widow", "Divorced"]),
  doj: z.string(),
  designation: z.enum([
    "ADMIN",
    "PRINCIPAL",
    "HEAD",
    "CLERK",
    "TEACHER",
    "WORKER",
  ]),
  residentialAddress: z.string(),
  mobileNo: z.string(),
  additionalContact: z.string().optional(),
  education: z.string(),
  username: z.string().min(2).max(100).optional(),
  email: z.string().email().optional().or(z.literal("")),
});

type Props = {
  employee: Employees;
  onClose: () => void;
  initialUsername?: string;
  initialEmail?: string;
};

// --- Section Header ---
function SectionHeader({
  icon: Icon,
  label,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
}) {
  return (
    <div className="flex items-center gap-2 pb-1">
      <div className="flex h-6 w-6 items-center justify-center rounded-md bg-emerald-500/20">
        <Icon className="h-3.5 w-3.5 text-emerald-400" />
      </div>
      <span className="text-xs font-semibold uppercase tracking-widest text-emerald-300/70">
        {label}
      </span>
    </div>
  );
}

// --- Styled FormField Wrapper ---
function ThemedField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <FormItem>
      <FormLabel className="text-xs font-medium text-slate-400">{label}</FormLabel>
      <FormControl>{children}</FormControl>
      <FormMessage className="text-xs text-red-400" />
    </FormItem>
  );
}

const inputCls =
  "border-slate-700 bg-slate-800/70 text-slate-100 placeholder:text-slate-500 focus-visible:border-emerald-500 focus-visible:ring-1 focus-visible:ring-emerald-500/40 h-9";

const selectTriggerCls =
  "border-slate-700 bg-slate-800/70 text-slate-100 focus:ring-emerald-500/40 h-9";

const selectContentCls =
  "border-slate-700 bg-slate-900 text-slate-100";

// --- Main Component ---
export function EmployeeEditDialog({
  employee,
  onClose,
  initialUsername = "",
  initialEmail = "",
}: Props) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      employeeName: employee.employeeName,
      fatherName: employee.fatherName,
      gender: employee.gender as Gender,
      dob: employee.dob,
      cnic: employee.cnic,
      maritalStatus: employee.maritalStatus as MaritalStatus,
      doj: employee.doj,
      designation: employee.designation as Designation,
      residentialAddress: employee.residentialAddress,
      mobileNo: employee.mobileNo,
      additionalContact: employee.additionalContact ?? "",
      education: employee.education,
      username: initialUsername,
      email: initialEmail,
    },
  });

  // Sync when initialUsername/initialEmail arrive (async)
  useEffect(() => {
    if (initialUsername) form.setValue("username", initialUsername);
    if (initialEmail) form.setValue("email", initialEmail);
  }, [initialUsername, initialEmail, form]);

  const updateEmployee = api.employee.updateEmployeeAndUser.useMutation({
    onSuccess: () => {
      toast({
        title: "✅ Saved",
        description: "Employee profile updated successfully.",
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

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    updateEmployee.mutate({
      ...values,
      employeeId: employee.employeeId,
      username: values.username ?? undefined,
      email: values.email ?? undefined,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-md">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-slate-950/80"
        onClick={onClose}
        aria-hidden
      />

      {/* Dialog */}
      <div className="relative z-10 flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-slate-700/70 bg-slate-900 shadow-2xl shadow-black/60">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-700/60 bg-slate-900/95 px-6 py-4 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/15 ring-1 ring-emerald-500/30">
              <Briefcase className="h-4 w-4 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100">Edit Employee</h2>
              <p className="text-xs text-slate-500">{employee.registrationNumber}</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-slate-100"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

              {/* Personal Info */}
              <div className="space-y-3">
                <SectionHeader icon={User} label="Personal Information" />
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="employeeName"
                    render={({ field }) => (
                      <ThemedField label="Full Name">
                        <Input {...field} placeholder="Employee name" className={inputCls} />
                      </ThemedField>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="fatherName"
                    render={({ field }) => (
                      <ThemedField label="Father Name">
                        <Input {...field} placeholder="Father name" className={inputCls} />
                      </ThemedField>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="gender"
                    render={({ field }) => (
                      <ThemedField label="Gender">
                        <Select onValueChange={field.onChange} value={field.value}>
                          <SelectTrigger className={selectTriggerCls}>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className={selectContentCls}>
                            {["MALE", "FEMALE", "CUSTOM"].map((r) => (
                              <SelectItem key={r} value={r} className="hover:bg-slate-800">
                                {r}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </ThemedField>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="maritalStatus"
                    render={({ field }) => (
                      <ThemedField label="Marital Status">
                        <Select onValueChange={field.onChange} value={field.value}>
                          <SelectTrigger className={selectTriggerCls}>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className={selectContentCls}>
                            {["Married", "Unmarried", "Widow", "Divorced"].map((r) => (
                              <SelectItem key={r} value={r} className="hover:bg-slate-800">
                                {r}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </ThemedField>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="dob"
                    render={({ field }) => (
                      <ThemedField label="Date of Birth">
                        <div className="relative">
                          <Calendar className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-500" />
                          <Input type="date" {...field} className={`${inputCls} pl-8`} />
                        </div>
                      </ThemedField>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="cnic"
                    render={({ field }) => (
                      <ThemedField label="CNIC">
                        <div className="relative">
                          <CreditCard className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-500" />
                          <Input {...field} placeholder="XXXXX-XXXXXXX-X" className={`${inputCls} pl-8`} />
                        </div>
                      </ThemedField>
                    )}
                  />
                </div>
              </div>

              <Separator className="bg-slate-700/50" />

              {/* Professional Info */}
              <div className="space-y-3">
                <SectionHeader icon={Briefcase} label="Professional Details" />
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="designation"
                    render={({ field }) => (
                      <ThemedField label="Designation">
                        <Select onValueChange={field.onChange} value={field.value}>
                          <SelectTrigger className={selectTriggerCls}>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className={selectContentCls}>
                            {[
                              "ADMIN",
                              "PRINCIPAL",
                              "HEAD",
                              "CLERK",
                              "TEACHER",
                              "WORKER",
                            ].map((r) => (
                              <SelectItem key={r} value={r} className="hover:bg-slate-800">
                                {r}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </ThemedField>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="education"
                    render={({ field }) => (
                      <ThemedField label="Education">
                        <div className="relative">
                          <GraduationCap className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-500" />
                          <Input {...field} placeholder="Qualification" className={`${inputCls} pl-8`} />
                        </div>
                      </ThemedField>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="doj"
                    render={({ field }) => (
                      <ThemedField label="Date of Joining">
                        <div className="relative">
                          <Calendar className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-500" />
                          <Input type="date" {...field} className={`${inputCls} pl-8`} />
                        </div>
                      </ThemedField>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="mobileNo"
                    render={({ field }) => (
                      <ThemedField label="Mobile No.">
                        <div className="relative">
                          <Phone className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-500" />
                          <Input {...field} placeholder="+92..." className={`${inputCls} pl-8`} />
                        </div>
                      </ThemedField>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="additionalContact"
                    render={({ field }) => (
                      <ThemedField label="Additional Contact (optional)">
                        <div className="relative">
                          <Phone className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-500" />
                          <Input {...field} placeholder="Alternate number" className={`${inputCls} pl-8`} />
                        </div>
                      </ThemedField>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="residentialAddress"
                    render={({ field }) => (
                      <ThemedField label="Residential Address">
                        <div className="relative">
                          <MapPin className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-500" />
                          <Input {...field} placeholder="City, District" className={`${inputCls} pl-8`} />
                        </div>
                      </ThemedField>
                    )}
                  />
                </div>
              </div>

              <Separator className="bg-slate-700/50" />

              {/* Account Section */}
              <div className="space-y-3">
                <SectionHeader icon={ShieldCheck} label="Account Credentials" />
                <div className="rounded-xl border border-emerald-500/10 bg-emerald-950/20 p-3">
                  <p className="mb-3 text-xs text-emerald-300/60">
                    Changes here update the employee&apos;s login credentials. Changing designation
                    will also sync their account type.
                  </p>
                  <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="username"
                      render={({ field }) => (
                        <ThemedField label="Username">
                          <div className="relative">
                            <AtSign className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-emerald-500/60" />
                            <Input
                              {...field}
                              placeholder="login username"
                              className={`${inputCls} pl-8 focus-visible:border-emerald-400`}
                            />
                          </div>
                        </ThemedField>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <ThemedField label="Email Address">
                          <div className="relative">
                            <Mail className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-emerald-500/60" />
                            <Input
                              {...field}
                              type="email"
                              placeholder="user@msns.edu.pk"
                              className={`${inputCls} pl-8 focus-visible:border-emerald-400`}
                            />
                          </div>
                        </ThemedField>
                      )}
                    />
                  </div>
                </div>
              </div>

              {/* Footer Actions */}
              <div className="flex items-center justify-end gap-3 border-t border-slate-700/50 pt-4">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={onClose}
                  className="text-slate-400 hover:bg-slate-800 hover:text-slate-100"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={updateEmployee.isPending}
                  className="gap-2 bg-emerald-600 text-white shadow-md shadow-emerald-900/30 hover:bg-emerald-500 active:scale-95"
                >
                  {updateEmployee.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : null}
                  {updateEmployee.isPending ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
}
