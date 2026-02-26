import { TRPCError } from "@trpc/server";
import { createTRPCRouter, publicProcedure, protectedProcedure } from "../trpc";
import { z } from "zod";
import { generatePdf } from "~/lib/pdf-reports";
import { userReg } from "~/lib/utils";
import { hash } from "bcryptjs";

// Define schema locally
const employeeSchema = z.object({
  employeeName: z.string().min(2).max(100),
  fatherName: z.string().min(2).max(100),
  gender: z.enum(["MALE", "FEMALE", "CUSTOM"]),
  dob: z.string(),
  cnic: z.string().min(13).max(15),
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
  mobileNo: z.string().max(13),
  additionalContact: z.string().max(25).optional(),
  education: z.string().min(2).max(100),
  profilePic: z.string().optional(),
  cv: z.string().optional(),
});

type AccountTypeEnum =
  | "ADMIN"
  | "PRINCIPAL"
  | "HEAD"
  | "CLERK"
  | "TEACHER"
  | "WORKER";

export const EmployeeRouter = createTRPCRouter({
  // Get employee profile by User ID (via accountId matching registrationNumber)
  getProfileByUserId: protectedProcedure.query(async ({ ctx }) => {
    try {
      const user = ctx.session.user;
      if (!user.accountId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "User account ID not found",
        });
      }

      const employee = await ctx.db.employees.findUnique({
        where: { registrationNumber: user.accountId },
        include: {
          BioMetric: true,
          ClassSubject: {
            include: {
              Subject: true,
              Grades: true,
            },
          },
        },
      });

      if (!employee) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Employee profile not found",
        });
      }

      return employee;
    } catch (error) {
      console.error(error);
      if (error instanceof TRPCError) throw error;
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to fetch employee profile",
      });
    }
  }),
  getEmployees: publicProcedure.query(async ({ ctx }) => {
    try {
      return await ctx.db.employees.findMany({
        // FIX: Changed from 'createdAt' (which doesn't exist) to 'employeeName'
        orderBy: { employeeName: "asc" },
        include: {
          BioMetric: {
            select: {
              fingerId: true,
            },
          },
        },
      });
    } catch (error) {
      console.error(error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Something went wrong.",
      });
    }
  }),

  getAllEmployeesForTimeTable: publicProcedure.query(async ({ ctx }) => {
    try {
      return await ctx.db.employees.findMany({
        select: {
          employeeId: true,
          employeeName: true,
          designation: true,
          education: true,
        },
      });
    } catch (error) {
      console.error(error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Something went wrong.",
      });
    }
  }),

  getEmployeeById: publicProcedure
    .input(z.object({ employeeId: z.string().cuid() }))
    .query(async ({ ctx, input }) => {
      const employee = await ctx.db.employees.findUnique({
        where: { employeeId: input.employeeId },
      });
      if (!employee) throw new TRPCError({ code: "NOT_FOUND" });
      return employee;
    }),

  getUnAllocateEmployees: publicProcedure.query(async ({ ctx }) => {
    try {
      const employees = await ctx.db.employees.findMany({
        where: {
          isAssign: false,
        },
      });
      return employees;
    } catch (error) {
      console.error(error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Something went wrong.",
      });
    }
  }),

  createEmployee: publicProcedure
    .input(employeeSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        const usersCount = await ctx.db.user.count({
          where: { accountType: input.designation as AccountTypeEnum },
        });

        const userInfo = userReg(usersCount, input.designation);

        const newEmployee = await ctx.db.employees.create({
          data: {
            ...input,
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
            accountType: input.designation as AccountTypeEnum,
          },
        });
        return newEmployee;
      } catch (error) {
        console.error(error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create employee",
        });
      }
    }),

  updateEmployee: publicProcedure
    .input(employeeSchema.extend({ employeeId: z.string().cuid() }))
    .mutation(async ({ ctx, input }) => {
      try {
        const { employeeId, ...data } = input;

        return await ctx.db.employees.update({
          where: { employeeId },
          data: {
            ...data,
          },
        });
      } catch (error) {
        console.error(error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update employee",
        });
      }
    }),

  deleteEmployeesByIds: publicProcedure
    .input(
      z.object({
        employeeIds: z.string().array(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      try {
        await ctx.db.employees.deleteMany({
          where: {
            employeeId: {
              in: input.employeeIds,
            },
          },
        });
      } catch (error) {
        console.error(error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to delete employees.",
        });
      }
    }),

  getEmployeesByDesignation: publicProcedure
    .input(
      z.object({
        designation: z.enum([
          "ADMIN",
          "PRINCIPAL",
          "HEAD",
          "CLERK",
          "TEACHER",
          "WORKER",
        ]),
      }),
    )
    .query(async ({ ctx, input }) => {
      try {
        const employees = await ctx.db.employees.findMany({
          where: {
            designation: input.designation,
          },
        });
        return employees;
      } catch (error) {
        console.error(error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Something went wrong.",
        });
      }
    }),

  generateEmployeeReport: publicProcedure.query(async ({ ctx }) => {
    try {
      const employees = await ctx.db.employees.findMany();
      // Map data to match report requirements
      const reportData = employees.map((emp) => ({
        ...emp,
        additionalContact: emp.additionalContact ?? "N/A",
        profilePic: emp.profilePic ?? "",
      }));

      const headers = [
        { key: "employeeId", label: "Employee ID" },
        { key: "employeeName", label: "Employee Name" },
        { key: "designation", label: "Designation" },
        { key: "registrationNumber", label: "Registration Number" },
        { key: "mobileNo", label: "Mobile" },
      ];

      const pdfBuffer = await generatePdf(
        reportData,
        headers,
        "Employee Report",
      );

      return {
        pdf: Buffer.from(pdfBuffer).toString("base64"),
      };
    } catch (error) {
      console.error(error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to generate report",
      });
    }
  }),
});
