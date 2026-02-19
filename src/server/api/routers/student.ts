import { TRPCError } from "@trpc/server";
import { createTRPCRouter, publicProcedure, protectedProcedure } from "../trpc";
import { z } from "zod";
import { generatePdf } from "~/lib/pdf-reports";
import { type Prisma } from "@prisma/client";
import { userReg } from "~/lib/utils";
import { hash } from "bcrypt";
import { studentSchema, studentCSVSchema } from "~/lib/schemas/student";

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


  // Get student profile by User ID (via accountId matching registrationNumber)
  getProfileByUserId: protectedProcedure.query(async ({ ctx }) => {
    try {
      const user = ctx.session.user;
      if (!user.accountId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "User account ID not found",
        });
      }

      const student = await ctx.db.students.findUnique({
        where: { registrationNumber: user.accountId },
        include: {
          StudentClass: {
            include: {
              Grades: true,
              Sessions: true,
              FeeStudentClass: {
                include: {
                  fees: true,
                },
                orderBy: { month: 'desc' },
                take: 1
              },
            },
            orderBy: {
              Sessions: { sessionName: 'desc' }
            },
            take: 1
          },
          ReportCard: {
            where: { status: 'PASSED' },
            orderBy: { generatedAt: 'desc' },
            take: 5
          }
        },
      });

      if (!student) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Student profile not found",
        });
      }

      return student;
    } catch (error) {
      console.error(error);
      if (error instanceof TRPCError) throw error;
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to fetch student profile",
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
            admissionNumber: true,
            registrationNumber: true,
            caste: true,
            currentAddress: true,
            permanentAddress: true,
            medicalProblem: true,
            profilePic: true,
            isAssign: true,
            createdAt: true,
            // Added missing fields to match Prisma Model type
            updatedAt: true,
            fatherProfession: true,
            bloodGroup: true,
            guardianName: true,

            // Include Class Details
            StudentClass: {
              include: {
                Grades: true,
                Sessions: true,
              },
              orderBy: {
                Sessions: {
                  sessionName: 'desc'
                }
              },
              take: 1
            }
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

  bulkCreate: publicProcedure
    .input(z.array(studentCSVSchema))
    .mutation(async ({ ctx, input }) => {
      try {
        let usersCount = await ctx.db.user.count({ where: { accountType: "STUDENT" } });

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const studentsData: any[] = [];
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const usersData: any[] = [];

        const parseDate = (dateStr?: string) => {
          if (!dateStr) return null;
          const d = new Date(dateStr);
          if (!isNaN(d.getTime())) return d;

          const parts = dateStr.split('/');
          if (parts.length === 3) {
            const [day, month, year] = parts;
            const d2 = new Date(`${year}-${month}-${day}`);
            if (!isNaN(d2.getTime())) return d2;
          }
          return null;
        };

        for (const student of input) {
          const userInfo = userReg(usersCount, "STUDENT");
          const password = await hash(userInfo.admissionNumber, 10);
          const dob = parseDate(student.dateOfBirth);
          const admissionDate = parseDate(student.dateOfAdmission) ?? new Date();
          studentsData.push({
            studentName: student.studentName,
            fatherName: student.fatherName ?? "",
            dateOfBirth: dob ? dob.toLocaleDateString() : (student.dateOfBirth ?? ""),
            currentAddress: student.address ?? "",
            studentMobile: student.contactNumber ?? "",
            fatherProfession: student.fatherOccupation ?? "",
            caste: student.caste ?? "none",
            registrationNumber: userInfo.accountId,
            admissionNumber: userInfo.admissionNumber,
            gender: "MALE",
            profilePic: "",
            studentCNIC: "0000-0000000-0",
            fatherCNIC: "0000-0000000-0",
            fatherMobile: "none",
            permanentAddress: "none",
            createdAt: admissionDate,
            updatedAt: new Date(),
          });

          usersData.push({
            accountId: userInfo.accountId,
            username: userInfo.username,
            email: userInfo.email.toLowerCase(),
            password: password,
            accountType: "STUDENT",
          });

          usersCount++;
        }

        const result = await ctx.db.$transaction([
          ctx.db.students.createMany({
            data: studentsData,
            skipDuplicates: true
          }),
          ctx.db.user.createMany({
            data: usersData,
            skipDuplicates: true
          })
        ]);

        return { count: result[0].count };
      } catch (error) {
        console.error("Bulk create error:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to import students",
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