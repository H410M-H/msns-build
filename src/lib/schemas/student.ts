import { z } from "zod";

const cnicRegex = /^\d{5}-\d{7}-\d{1}$/;
const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

// Helper: Accepts Regex, Empty String, Null, or Undefined -> Transforms to "" (String)
const optionalCnicSchema = z
  .union([
    z.string().regex(cnicRegex, "Invalid CNIC format"),
    z.string().length(0),
    z.null(),
    z.undefined(),
  ])
  .transform((val) => val ?? "");

export const studentSchema = z.object({
  studentId: z.string().cuid().optional(),

  studentMobile: z.string().min(11, "Invalid mobile number").max(15),
  fatherMobile: z.string().min(11, "Invalid mobile number").max(15),
  studentName: z.string().min(3, "Name too short").max(100),
  gender: z.enum(["MALE", "FEMALE", "CUSTOM"]),
  dateOfBirth: z.string().regex(dateRegex, "Invalid date format (YYYY-MM-DD)"),
  fatherName: z.string().min(3, "Name too short").max(100),

  // Use the helper for optional CNICs
  studentCNIC: optionalCnicSchema,
  fatherCNIC: optionalCnicSchema,

  // Transform nulls/undefined to empty strings for Prisma safety
  fatherProfession: z
    .string()
    .max(100)
    .nullish()
    .transform((v) => v ?? ""),
  bloodGroup: z
    .string()
    .max(3)
    .nullish()
    .transform((v) => v ?? ""),
  guardianName: z
    .string()
    .max(100)
    .nullish()
    .transform((v) => v ?? ""),
  caste: z.string().max(50),
  currentAddress: z.string().min(5, "Address too short").max(200),
  permanentAddress: z.string().min(5, "Address too short").max(500),
  medicalProblem: z
    .string()
    .max(500)
    .nullish()
    .transform((v) => v ?? ""),

  isAssign: z.boolean().default(false),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
  registrationNumber: z.string().optional(),
  admissionNumber: z.string().optional(),
  studentClassId: z.string().cuid().optional(),
  sessionId: z.string().cuid().optional(),
  profilePic: z
    .string()
    .nullish()
    .transform((v) => v ?? ""),
});

// Added this schema for Bulk Import
export const studentCSVSchema = z.object({
  studentName: z.string(),
  fatherName: z.string().optional(),
  dateOfBirth: z.string().optional(),
  dateOfAdmission: z.string().optional(),
  address: z.string().optional(),
  contactNumber: z.string().optional(),
  fatherOccupation: z.string().optional(),
  caste: z.string().optional(),
  registrationNumber: z.string().optional(),
});

export type StudentSchema = z.infer<typeof studentSchema>;
export type StudentCSVSchema = z.infer<typeof studentCSVSchema>;
