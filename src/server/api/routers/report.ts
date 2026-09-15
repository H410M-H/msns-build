import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { generatePdf } from "~/lib/pdf-reports";

// Strongly typed report schemas
export const reportTypeSchema = z.enum([
  "students",
  "employees",
  "classes",
  "sessions",
  "fees",
  "timetable",
  "attendance",
  "salary",
  "expenses",
]);

export const reportPeriodSchema = z.enum([
  "all",
  "annual",
  "monthly",
  "weekly",
  "daily",
]);

export type ReportType = z.infer<typeof reportTypeSchema>;
export type ReportPeriod = z.infer<typeof reportPeriodSchema>;

// Utility function to format values for PDF
function formatPdfValue(value: unknown): string {
  if (value === null || value === undefined) return "-";
  if (typeof value === "string") return value;
  if (typeof value === "number") return value.toLocaleString("en-IN");
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (value instanceof Date) return value.toLocaleDateString();

  if (typeof value === "object") {
    try {
      return JSON.stringify(value);
    } catch {
      return "[Object]";
    }
  }

  return String(value as string | number | boolean | symbol | bigint);
}

export const reportRouter = createTRPCRouter({
  getPrincipalStats: protectedProcedure.query(async ({ ctx }) => {
    try {
      // 1. Total Revenue (Fees Collected)
      const fees = await ctx.db.feeStudentClass.findMany({
        where: { tuitionPaid: true },
        include: { fees: true },
      });
      const totalRevenue = fees.reduce(
        (acc, curr) => acc + (curr.fees?.tuitionFee ?? 0),
        0,
      );

      // 2. Total Expenses
      const expenses = await ctx.db.expenses.aggregate({
        _sum: { amount: true },
      });
      const totalExpenses = expenses._sum.amount ?? 0;

      // 3. Staff Attendance (Today)
      const today = new Date().toISOString().split("T")[0];
      const attendance = await ctx.db.employeeAttendance.groupBy({
        by: ["morning"],
        where: { date: today },
        _count: { morning: true },
      });

      const presentCount =
        attendance.find((a) => a.morning === "P")?._count.morning ?? 0;
      const absentCount =
        attendance.find((a) => a.morning === "A")?._count.morning ?? 0;

      return {
        revenue: totalRevenue,
        expenses: totalExpenses,
        attendance: {
          present: presentCount,
          absent: absentCount,
          total: presentCount + absentCount,
        },
      };
    } catch (error) {
      console.error("Error fetching principal stats:", error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to fetch dashboard stats",
      });
    }
  }),

  generateReport: protectedProcedure
    .input(
      z.object({
        reportType: reportTypeSchema,
        period: reportPeriodSchema.optional().default("all"),
        sessionId: z.string().optional(),
        classId: z.string().optional(),
        month: z.number().optional(),
        year: z.number().optional(),
        date: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const { reportType, period = "all" } = input;
        const now = new Date();

        let rawData: Array<Record<string, unknown>> = [];
        let headers: Array<{ key: string; label: string }> = [];

        switch (reportType) {
          case "timetable": {
            headers = [
              { key: "grade", label: "Class" },
              { key: "day", label: "Day" },
              { key: "period", label: "Lecture" },
              { key: "time", label: "Time" },
              { key: "subject", label: "Subject" },
              { key: "teacher", label: "Teacher" },
            ];

            const timetableData = await ctx.db.timetable.findMany({
              where: {
                ...(input.sessionId ? { sessionId: input.sessionId } : {}),
                ...(input.classId ? { classId: input.classId } : {}),
              },
              include: {
                Grades: true,
                Subject: true,
                Employees: true,
              },
              orderBy: [{ dayOfWeek: "asc" }, { lectureNumber: "asc" }],
            });

            rawData = timetableData.map((t) => ({
              grade: `${t.Grades?.grade ?? ""} ${t.Grades?.section ?? ""}`.trim(),
              day: t.dayOfWeek,
              period: `L${t.lectureNumber}`,
              time: `${t.startTime} - ${t.endTime}`,
              subject: t.Subject?.subjectName ?? "Subject",
              teacher: t.Employees?.employeeName ?? "Teacher",
            }));
            break;
          }

          case "attendance": {
            headers = [
              { key: "date", label: "Date" },
              { key: "employeeName", label: "Staff Name" },
              { key: "designation", label: "Designation" },
              { key: "status", label: "Status" },
              { key: "morning", label: "Morning" },
              { key: "afternoon", label: "Afternoon" },
            ];

            let dateFilter: Record<string, unknown> | undefined = undefined;
            if (period === "daily") {
              const todayStr = input.date ?? now.toISOString().split("T")[0]!;
              dateFilter = { equals: todayStr };
            } else if (period === "weekly") {
              const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
                .toISOString()
                .split("T")[0]!;
              dateFilter = { gte: weekAgo };
            } else if (period === "monthly") {
              const targetYear = input.year ?? now.getFullYear();
              const targetMonth = input.month ?? now.getMonth() + 1;
              const prefix = `${targetYear}-${String(targetMonth).padStart(2, "0")}`;
              dateFilter = { startsWith: prefix };
            } else if (period === "annual") {
              const targetYear = input.year ?? now.getFullYear();
              dateFilter = { startsWith: String(targetYear) };
            }

            const attendanceRecords = await ctx.db.employeeAttendance.findMany({
              where: dateFilter ? { date: dateFilter as any } : undefined,
              include: { employee: true },
              orderBy: { date: "desc" },
              take: 500,
            });

            rawData = attendanceRecords.map((a) => ({
              date: a.date,
              employeeName: a.employee?.employeeName ?? "Staff",
              designation: a.employee?.designation ?? "-",
              status:
                a.morning === "P" || a.afternoon === "P"
                  ? "Present"
                  : a.morning === "L"
                    ? "Leave"
                    : "Absent",
              morning: a.morning ?? "-",
              afternoon: a.afternoon ?? "-",
            }));
            break;
          }

          case "salary": {
            headers = [
              { key: "employeeName", label: "Staff Name" },
              { key: "designation", label: "Designation" },
              { key: "period", label: "Month/Year" },
              { key: "amount", label: "Salary Amount" },
              { key: "bonus", label: "Bonus" },
              { key: "deductions", label: "Deductions" },
              { key: "status", label: "Status" },
            ];

            const targetYear = input.year ?? now.getFullYear();
            const salaryWhere: Record<string, unknown> = {};
            if (period === "annual") {
              salaryWhere.year = targetYear;
            } else if (period === "monthly" || input.month) {
              salaryWhere.year = targetYear;
              salaryWhere.month = input.month ?? now.getMonth() + 1;
            }
            if (input.sessionId) {
              salaryWhere.sessionId = input.sessionId;
            }

            const salaries = await ctx.db.salary.findMany({
              where: Object.keys(salaryWhere).length > 0 ? salaryWhere : undefined,
              include: { Employees: true },
              orderBy: [{ year: "desc" }, { month: "desc" }],
              take: 500,
            });

            rawData = salaries.map((s) => ({
              employeeName: s.Employees?.employeeName ?? "Employee",
              designation: s.Employees?.designation ?? "-",
              period: `${s.month}/${s.year}`,
              amount: `Rs. ${s.amount.toLocaleString()}`,
              bonus: `Rs. ${s.bonus.toLocaleString()}`,
              deductions: `Rs. ${s.deductions.toLocaleString()}`,
              status: s.status,
            }));
            break;
          }

          case "fees": {
            headers = [
              { key: "studentName", label: "Student Name" },
              { key: "regNo", label: "Reg #" },
              { key: "grade", label: "Class" },
              { key: "period", label: "Month/Year" },
              { key: "tuitionFee", label: "Tuition" },
              { key: "tuitionPaid", label: "Tuition Status" },
              { key: "discount", label: "Discount" },
            ];

            const feeRecords = await ctx.db.feeStudentClass.findMany({
              where: input.sessionId
                ? { StudentClass: { sessionId: input.sessionId } }
                : undefined,
              include: {
                fees: true,
                StudentClass: {
                  include: {
                    Students: true,
                    Grades: true,
                  },
                },
              },
              take: 500,
            });

            rawData = feeRecords.map((f) => ({
              studentName: f.StudentClass?.Students?.studentName ?? "-",
              regNo: f.StudentClass?.Students?.registrationNumber ?? "-",
              grade: `${f.StudentClass?.Grades?.grade ?? ""} ${f.StudentClass?.Grades?.section ?? ""}`.trim(),
              period: `${f.month}/${f.year}`,
              tuitionFee: `Rs. ${(f.fees?.tuitionFee ?? 0).toLocaleString()}`,
              tuitionPaid: f.tuitionPaid ? "Paid" : "Pending",
              discount: `Rs. ${(f.discount ?? 0).toLocaleString()}`,
            }));
            break;
          }

          case "expenses": {
            headers = [
              { key: "title", label: "Title" },
              { key: "category", label: "Category" },
              { key: "amount", label: "Amount" },
              { key: "date", label: "Date" },
              { key: "description", label: "Notes" },
            ];

            const expenses = await ctx.db.expenses.findMany({
              orderBy: { createdAt: "desc" },
              take: 500,
            });

            rawData = expenses.map((e) => ({
              title: e.title,
              category: e.category,
              amount: `Rs. ${e.amount.toLocaleString()}`,
              date: e.createdAt.toLocaleDateString(),
              description: e.description ?? "-",
            }));
            break;
          }

          case "students": {
            headers = [
              { key: "registrationNumber", label: "Reg #" },
              { key: "studentName", label: "Student Name" },
              { key: "fatherName", label: "Father Name" },
              { key: "gender", label: "Gender" },
              { key: "studentMobile", label: "Contact" },
              { key: "isAssign", label: "Status" },
            ];

            const students = await ctx.db.students.findMany({
              take: 500,
              orderBy: { studentName: "asc" },
            });

            rawData = students.map((s) => ({
              registrationNumber: s.registrationNumber,
              studentName: s.studentName,
              fatherName: s.fatherName ?? "-",
              gender: s.gender,
              studentMobile: s.studentMobile,
              isAssign: s.isAssign ? "Assigned" : "Unassigned",
            }));
            break;
          }

          case "employees": {
            headers = [
              { key: "registrationNumber", label: "Reg #" },
              { key: "employeeName", label: "Name" },
              { key: "designation", label: "Designation" },
              { key: "mobileNo", label: "Contact" },
              { key: "education", label: "Education" },
              { key: "status", label: "Status" },
              { key: "doj", label: "Join Date" },
            ];

            const employees = await ctx.db.employees.findMany({
              orderBy: { employeeName: "asc" },
            });

            rawData = employees.map((e) => ({
              registrationNumber: e.registrationNumber,
              employeeName: e.employeeName,
              designation: e.designation,
              mobileNo: e.mobileNo,
              education: e.education,
              status: e.status ?? "Active",
              doj: e.doj,
            }));
            break;
          }

          case "classes": {
            headers = [
              { key: "grade", label: "Grade" },
              { key: "section", label: "Section" },
              { key: "category", label: "Category" },
              { key: "fee", label: "Monthly Fee" },
            ];

            const grades = await ctx.db.grades.findMany({
              orderBy: { grade: "asc" },
            });

            rawData = grades.map((g) => ({
              grade: g.grade,
              section: g.section,
              category: g.category,
              fee: `Rs. ${g.fee.toLocaleString()}`,
            }));
            break;
          }

          case "sessions": {
            headers = [
              { key: "sessionName", label: "Session Name" },
              { key: "sessionFrom", label: "Start Date" },
              { key: "sessionTo", label: "End Date" },
              { key: "isActive", label: "Active" },
            ];

            const sessions = await ctx.db.sessions.findMany({
              orderBy: { sessionFrom: "desc" },
            });

            rawData = sessions.map((s) => ({
              sessionName: s.sessionName,
              sessionFrom: s.sessionFrom,
              sessionTo: s.sessionTo,
              isActive: s.isActive ? "Yes" : "No",
            }));
            break;
          }
        }

        if (!rawData || rawData.length === 0) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: `No ${reportType} records found for the selected ${period} period.`,
          });
        }

        const transformedData = rawData.map((row) => {
          const transformed: Record<string, unknown> = {};
          headers.forEach(({ key }) => {
            transformed[key] = formatPdfValue(row[key]);
          });
          return transformed;
        });

        const periodTitle = period !== "all" ? ` (${period.toUpperCase()})` : "";
        const title = `${reportType.toUpperCase()}${periodTitle} REPORT`;

        const pdfBuffer = await generatePdf(transformedData, headers, title);

        return {
          pdf: Buffer.from(pdfBuffer).toString("base64"),
          filename: `${reportType}-${period}-report-${Date.now()}.pdf`,
        };
      } catch (error) {
        console.error("Report generation failed:", error);
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: error instanceof Error ? error.message : "Failed to generate report",
        });
      }
    }),
});
