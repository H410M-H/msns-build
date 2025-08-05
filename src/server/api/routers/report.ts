// report.ts
import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";
import { generatePdf } from "~/lib/pdf-reports";
import type { Prisma } from "@prisma/client";

// Strongly typed report schema
const reportTypeSchema = z.enum([
  "students",
  "employees",
  "classes",
  "sessions",
  "fees"
] as const);

type ReportType = z.infer<typeof reportTypeSchema>;

// Type-safe data fetchers
const reportQueries: Record<ReportType, (prisma: Prisma.TransactionClient) => Promise<Array<Record<string, unknown>>>> = {
  students: async (prisma) => prisma.students.findMany({
    select: {
      studentId: true,
      studentName: true,
      registrationNumber: true,
      admissionNumber: true,
      dateOfBirth: true,
      gender: true,
      fatherName: true,
      studentMobile: true,
      isAssign: true
    }
  }),
  employees: async (prisma) => prisma.employees.findMany({
    select: {
      employeeId: true,
      employeeName: true,
      designation: true,
      mobileNo: true,
      doj: true
    }
  }),
  classes: async (prisma) => prisma.grades.findMany({
    select: {
      classId: true,
      grade: true,
      section: true,
      category: true,
      fee: true
    }
  }),
  sessions: async (prisma) => prisma.sessions.findMany({
    select: {
      sessionId: true,
      sessionName: true,
      sessionFrom: true,
      sessionTo: true,
      isActive: true
    }
  }),
  fees: async (prisma) => prisma.fees.findMany({
    select: {
      feeId: true,
      level: true,
      admissionFee: true,
      tuitionFee: true,
      examFund: true,
      computerLabFund: true,
      studentIdCardFee: true,
      infoAndCallsFee: true,
      type: true,
      createdAt: true
    }
  })
};

// Header configurations with explicit key mapping
const reportHeaders: Record<ReportType, Array<{ key: string; label: string }>> = {
  students: [
    { key: "studentId", label: "ID" },
    { key: "studentName", label: "Student Name" },
    { key: "registrationNumber", label: "Reg Number" },
    { key: "admissionNumber", label: "Adm Number" },
    { key: "dateOfBirth", label: "Birth Date" },
    { key: "gender", label: "Gender" },
    { key: "fatherName", label: "Father Name" },
    { key: "studentMobile", label: "Contact" },
    { key: "isAssign", label: "Status" }
  ],
  employees: [
    { key: "employeeId", label: "Employee ID" },
    { key: "employeeName", label: "Name" },
    { key: "designation", label: "Designation" },
    { key: "mobileNo", label: "Contact" },
    { key: "doj", label: "Join Date" }
  ],
  classes: [
    { key: "classId", label: "Class ID" },
    { key: "grade", label: "Grade" },
    { key: "section", label: "Section" },
    { key: "category", label: "Category" },
    { key: "fee", label: "Fee" }
  ],
  sessions: [
    { key: "sessionId", label: "Session ID" },
    { key: "sessionName", label: "Session Name" },
    { key: "sessionFrom", label: "Start Date" },
    { key: "sessionTo", label: "End Date" },
    { key: "isActive", label: "Active" }
  ],
  fees: [
    { key: "feeId", label: "Fee ID" },
    { key: "level", label: "Level" },
    { key: "admissionFee", label: "Admission Fee" },
    { key: "tuitionFee", label: "Tuition Fee" },
    { key: "examFund", label: "Exam Fund" },
    { key: "computerLabFund", label: "Computer Lab Fund" },
    { key: "studentIdCardFee", label: "ID Card Fee" },
    { key: "infoAndCallsFee", label: "Info & Calls Fee" },
    { key: "type", label: "Type" },
    { key: "createdAt", label: "Created Date" }
  ]
};

export const ReportRouter = createTRPCRouter({
  generateReport: publicProcedure
    .input(z.object({ reportType: reportTypeSchema }))
    .mutation(async ({ ctx, input }) => {
      try {
        const { reportType } = input;
        const title = `${reportType.charAt(0).toUpperCase() + reportType.slice(1)} Report`;

        const rawData = await reportQueries[reportType](ctx.db);
        const headers = reportHeaders[reportType];

        // Transform data with type safety
        const transformedData = rawData.map(row => {
          const transformed: Record<string, unknown> = {};
          headers.forEach(({ key }) => {
            transformed[key] = formatPdfValue(row[key]);
          });
          return transformed;
        });

        const pdf = await generatePdf(transformedData, headers, title);
        return { pdf: Buffer.from(pdf).toString("base64") };
      } catch (error) {
        console.error("Report generation failed:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to generate report"
        });
      }
    })
});

// Shared utility function
function formatPdfValue(value: unknown): string {
  if (value === null || value === undefined) return "-";
  if (value instanceof Date) return value.toLocaleDateString();
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (typeof value === "object") return JSON.stringify(value);
  return String();
}