import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
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
]);

export type ReportType = z.infer<typeof reportTypeSchema>;

// Type-safe data fetchers
const reportQueries: Record<ReportType, (prisma: Prisma.TransactionClient) => Promise<Array<Record<string, unknown>>>> = {
  students: async (prisma) => {
    const data = await prisma.students.findMany({
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
    });
    return data.map(s => ({ ...s, isAssign: s.isAssign ? "Assigned" : "Unassigned" }));
  },
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

// Header configurations
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
    { key: "employeeId", label: "ID" },
    { key: "employeeName", label: "Name" },
    { key: "designation", label: "Designation" },
    { key: "mobileNo", label: "Contact" },
    { key: "doj", label: "Join Date" }
  ],
  classes: [
    { key: "grade", label: "Grade" },
    { key: "section", label: "Section" },
    { key: "category", label: "Category" },
    { key: "fee", label: "Fee" }
  ],
  sessions: [
    { key: "sessionName", label: "Session Name" },
    { key: "sessionFrom", label: "Start Date" },
    { key: "sessionTo", label: "End Date" },
    { key: "isActive", label: "Active" }
  ],
  fees: [
    { key: "level", label: "Level" },
    { key: "type", label: "Type" },
    { key: "admissionFee", label: "Admission" },
    { key: "tuitionFee", label: "Tuition" },
    { key: "examFund", label: "Exam Fund" },
    { key: "infoAndCallsFee", label: "Info/Calls" }
  ]
};

// Utility function to format values for PDF
function formatPdfValue(value: unknown): string {
  if (value === null || value === undefined) return "-";
  if (typeof value === "string") return value;
  if (typeof value === "number") return value.toString();
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (value instanceof Date) return value.toLocaleDateString();
  
  if (typeof value === "object") {
    try {
      return JSON.stringify(value);
    } catch {
      return "[Complex Object]";
    }
  }
  
  // Safely handle symbols or bigints if they slip through, explicitly avoiding object types
  return String(value as string | number | boolean | symbol | bigint); 
}

export const reportRouter = createTRPCRouter({
  generateReport: protectedProcedure
    .input(z.object({ reportType: reportTypeSchema }))
    .mutation(async ({ ctx, input }) => {
      try {
        const { reportType } = input;
        const title = `${reportType.charAt(0).toUpperCase() + reportType.slice(1)} Report`;

        const queryFn = reportQueries[reportType];
        if (!queryFn) {
             throw new TRPCError({ code: "BAD_REQUEST", message: "Invalid report type" });
        }

        const rawData = await queryFn(ctx.db);
        const headers = reportHeaders[reportType];

        if (!rawData || rawData.length === 0) {
             if (rawData.length === 0) {
                 throw new TRPCError({ code: "NOT_FOUND", message: "No data found for report" });
             }
        }

        const transformedData = rawData.map(row => {
          const transformed: Record<string, unknown> = {};
          headers.forEach(({ key }) => {
            transformed[key] = formatPdfValue(row[key]);
          });
          return transformed;
        });

        const pdfBuffer = await generatePdf(transformedData, headers, title);
        
        return { 
            pdf: Buffer.from(pdfBuffer).toString("base64"),
            filename: `${reportType}-report-${Date.now()}.pdf`
        };
      } catch (error) {
        console.error("Report generation failed:", error);
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to generate report"
        });
      }
    })
});