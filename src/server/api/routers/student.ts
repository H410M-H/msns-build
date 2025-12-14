import { TRPCError } from "@trpc/server";
import { createTRPCRouter, publicProcedure } from "../trpc";
import { z } from "zod";
import { generatePdf } from "~/lib/pdf-reports";
import { type Prisma } from "@prisma/client";
import { userReg } from "~/lib/utils";
import { hash } from "bcrypt";
// IMPORT FROM SHARED FILE
import { studentSchema } from "~/lib/schemas/student";

type StudentReportData = {
  studentId: string;
  studentName: string;
  registrationNumber: string;
  admissionNumber: string;
  dateOfBirth: string;
  gender: string;
  fatherName: string;
  studentCNIC: string;
  fatherCNIC: string;
  class: string;
  section: string;
  session: string;
};

export const StudentRouter = createTRPCRouter({
  getStudents: publicProcedure.query(async ({ ctx }) => {
    try {
      const students = await ctx.db.students.findMany({
        orderBy: { createdAt: "desc" },
        select: {
          studentId: true,
          registrationNumber: true,
          studentMobile: true,
          fatherMobile: true,
          admissionNumber: true,
          studentName: true,
          gender: true,
          dateOfBirth: true,
          fatherName: true,
          studentCNIC: true,
          fatherCNIC: true,
          fatherProfession: true,
          bloodGroup: true,
          guardianName: true,
          caste: true,
          currentAddress: true,
          permanentAddress: true,
          medicalProblem: true,
          isAssign: true,
          createdAt: true,
          updatedAt: true,
          profilePic: true,
        },
      });
  
      return students;
    } catch (error) {
      console.error("Error fetching students:", error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to retrieve students",
      });
    }
  }),

  getUnAllocateStudents: publicProcedure
    .input(
      z.object({
        searchTerm: z.string().optional(),
        page: z.number().min(1).default(1),
        pageSize: z.number().min(1).max(100).default(20),
      }),
    )
    .query(async ({ ctx, input }) => {
      try {
        const where: Prisma.StudentsWhereInput = {
          isAssign: false,
          OR: input.searchTerm
            ? [
                { studentName: { contains: input.searchTerm, mode: "insensitive" } },
                { fatherName: { contains: input.searchTerm, mode: "insensitive" } },
                { admissionNumber: { contains: input.searchTerm, mode: "insensitive" } },
              ]
            : undefined,
        };

        const [students, total] = await Promise.all([
          ctx.db.students.findMany({
            where,
            skip: (input.page - 1) * input.pageSize,
            take: input.pageSize,
            orderBy: { createdAt: "desc" },
            select: {
              studentId: true,
              studentName: true,
              admissionNumber: true,
              fatherName: true,
              studentMobile: true,
              createdAt: true,
            },
          }),
          ctx.db.students.count({ where }),
        ]);

        return {
          data: students,
          meta: {
            total,
            page: input.page,
            pageSize: input.pageSize,
            totalPages: Math.ceil(total / input.pageSize),
          },
        };
      } catch (error) {
        console.error("Error fetching unallocated students:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch unassigned students",
        });
      }
    }),

  createStudent: publicProcedure
    .input(studentSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        const usersCount = await ctx.db.user.count({ where: { accountType: "STUDENT" } });
        const userInfo = userReg(usersCount, "STUDENT");
        
        const newStudent = await ctx.db.students.create({
          data: {
            ...input,
            studentId: undefined, // Let DB generate ID
            registrationNumber: userInfo.accountId,
            admissionNumber: userInfo.admissionNumber,
          },
        });

        const password = await hash(userInfo.admissionNumber, 10);
        await ctx.db.user.create({
          data: {
            accountId: userInfo.accountId,
            username: userInfo.username,
            email: userInfo.email.toLowerCase(),
            password,
            accountType: "STUDENT",
          },
        });

        return newStudent;
      } catch (error) {
        console.error("Error creating student:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create student record",
        });
      }
    }),

  getStudentById: publicProcedure
    .input(z.object({ studentId: z.string().cuid() }))
    .query(async ({ ctx, input }) => {
      try {
        const student = await ctx.db.students.findUnique({
          where: { studentId: input.studentId },
          select: {
            studentId: true,
            studentName: true,
            fatherName: true,
            gender: true,
            dateOfBirth: true,
            studentCNIC: true,
            fatherCNIC: true,
            studentMobile: true,
            fatherMobile: true,
            caste: true,
            currentAddress: true,
            permanentAddress: true,
            medicalProblem: true,
            profilePic: true,
            isAssign: true,
          },
        });
        if (!student) throw new TRPCError({ code: "NOT_FOUND" });
        return student;
      } catch (error) {
        console.error("Error fetching student:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch student",
        });
      }
    }),

  updateStudent: publicProcedure
    .input(
      studentSchema
        .omit({ registrationNumber: true, admissionNumber: true, studentId: true })
        .extend({ studentId: z.string().cuid() })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const { studentId, ...data } = input;

        const updatedStudent = await ctx.db.students.update({
          where: { studentId },
          data: {
            ...data,
            updatedAt: new Date(),
          },
        });
        return updatedStudent;
      } catch (error) {
        console.error("Error updating student:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update student",
        });
      }
    }),

  deleteStudentsByIds: publicProcedure
    .input(z.object({ studentIds: z.array(z.string().cuid()) }))
    .mutation(async ({ ctx, input }) => {
      try {
        const result = await ctx.db.students.deleteMany({
          where: { studentId: { in: input.studentIds } },
        });
        return { count: result.count };
      } catch (error) {
        console.error("Error deleting students:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to delete students",
        });
      }
    }),

  generateStudentReport: publicProcedure.query(async ({ ctx }) => {
    try {
      const students = await ctx.db.students.findMany({
        select: {
          studentId: true,
          studentName: true,
          registrationNumber: true,
          admissionNumber: true,
          dateOfBirth: true,
          gender: true,
          fatherName: true,
          studentCNIC: true,
          fatherCNIC: true,
          StudentClass: {
            select: {
              Grades: { select: { grade: true, section: true } },
              Sessions: { select: { sessionName: true } },
            },
          },
        },
      });

      const reportData: StudentReportData[] = students.map((student) => ({
        studentId: student.studentId,
        studentName: student.studentName,
        registrationNumber: student.registrationNumber,
        admissionNumber: student.admissionNumber,
        dateOfBirth: student.dateOfBirth,
        gender: student.gender,
        fatherName: student.fatherName,
        studentCNIC: student.studentCNIC,
        fatherCNIC: student.fatherCNIC,
        class: student.StudentClass[0]?.Grades?.grade ?? "N/A",
        section: student.StudentClass[0]?.Grades?.section ?? "N/A",
        session: student.StudentClass[0]?.Sessions?.sessionName ?? "N/A",
      }));

      const headers = [
        { key: "studentId", label: "Student ID" },
        { key: "studentName", label: "Name" },
        { key: "registrationNumber", label: "Registration #" },
        { key: "admissionNumber", label: "Admission #" },
        { key: "dateOfBirth", label: "Date of Birth" },
        { key: "gender", label: "Gender" },
        { key: "fatherName", label: "Father's Name" },
        { key: "studentCNIC", label: "Student CNIC" },
        { key: "fatherCNIC", label: "Father's CNIC" },
        { key: "class", label: "Class" },
        { key: "section", label: "Section" },
        { key: "session", label: "Session" },
      ];

      const pdfBuffer = await generatePdf(reportData, headers, "Student Directory Report");

      return {
        pdf: Buffer.from(pdfBuffer).toString("base64"),
        filename: `student-report-${Date.now()}.pdf`,
      };
    } catch (error) {
      console.error("Error generating student report:", error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to generate student report",
      });
    }
  }),
});