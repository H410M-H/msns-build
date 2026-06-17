// File: user.ts (unchanged, as no errors reported)
import { TRPCError } from "@trpc/server";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { z } from "zod";
import { generatePdf } from "~/lib/pdf-reports";

import dayjs from "dayjs";
import { hash } from "bcryptjs";
const userSchema = z.object({
  username: z.string().min(2).max(100),
  email: z.string().email(),
  password: z.string().min(6).max(100),
  accountType: z.enum([
    "STUDENT",
    "FACULTY",
    "ADMIN",
    "WORKER",
    "HEAD",
    "PRINCIPAL",
    "CLERK",
    "TEACHER",
    "NONE",
    "ALL",
  ]),
});

export const UserRouter = createTRPCRouter({
  getUsers: protectedProcedure.query(async ({ ctx }) => {
    try {
      const users = await ctx.db.user.findMany({
        select: {
          id: true,
          accountId: true,
          username: true,
          email: true,
          accountType: true,
          createdAt: true,
        },
      });
      return users;
    } catch (error) {
      console.error(error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Something went wrong.",
      });
    }
  }),

  getUserById: protectedProcedure.query(async ({ ctx }) => {
    try {
      const users = await ctx.db.user.findUnique({
        where: { id: ctx.session?.user.id ?? "" },
        select: {
          id: true,
          accountId: true,
          username: true,
          email: true,
          accountType: true,
          createdAt: true,
        },
      });
      return users;
    } catch (error) {
      console.error(error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Something went wrong.",
      });
    }
  }),

  getUnAllocatedUsers: protectedProcedure.query(async ({ ctx }) => {
    try {
      const users = await ctx.db.user.findMany({
        select: {
          id: true,
          accountId: true,
          username: true,
          email: true,
          accountType: true,
          createdAt: true,
        },
      });
      return users;
    } catch (error) {
      console.error(error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Something went wrong.",
      });
    }
  }),

  createUser: protectedProcedure
    .input(userSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        const currentYear = dayjs().year().toString().slice(-2);
        const usersCount = await ctx.db.user.count({
          where: {
            accountType: input.accountType as AccountTypeEnum,
          },
        });
        const password = await hash(input.password, 10);
        await ctx.db.user.create({
          data: {
            accountId: `msn-${input.accountType[0]}-${currentYear}-${usersCount + 1}`,
            username: `msn-${input.accountType}-${currentYear}-${usersCount + 1}`,
            email: `msn-${input.accountType}-${currentYear}-${usersCount + 1}@msns.edu.pk`,
            password,
          },
        });
      } catch (error) {
        console.error(error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Something went wrong",
        });
      }
    }),

  deleteEmployeesByIds: protectedProcedure
    .input(
      z.object({
        employeeIds: z.string().array(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const employeesToDelete = await ctx.db.employees.findMany({
          where: {
            employeeId: {
              in: input.employeeIds,
            },
          },
          select: {
            registrationNumber: true,
          },
        });
        const regNumbers = employeesToDelete.map((e) => e.registrationNumber);

        await ctx.db.$transaction([
          ctx.db.bioMetric.deleteMany({ where: { employeeId: { in: input.employeeIds } } }),
          ctx.db.classSubject.deleteMany({ where: { employeeId: { in: input.employeeIds } } }),
          ctx.db.timetable.deleteMany({ where: { employeeId: { in: input.employeeIds } } }),
          ctx.db.salary.deleteMany({ where: { employeeId: { in: input.employeeIds } } }),
          ctx.db.salaryAssignment.deleteMany({ where: { employeeId: { in: input.employeeIds } } }),
          ctx.db.salaryIncrement.deleteMany({ where: { employeeId: { in: input.employeeIds } } }),
          ctx.db.employeeAttendance.deleteMany({ where: { employeeId: { in: input.employeeIds } } }),
          ctx.db.leaveApplication.deleteMany({ where: { employeeId: { in: input.employeeIds } } }),
          ctx.db.leaveBalance.deleteMany({ where: { employeeId: { in: input.employeeIds } } }),
          ctx.db.bulkSalaryCreationItem.deleteMany({ where: { employeeId: { in: input.employeeIds } } }),
          ctx.db.marks.deleteMany({ where: { uploadedBy: { in: input.employeeIds } } }),
          ctx.db.promotionHistory.deleteMany({ where: { promotedBy: { in: input.employeeIds } } }),
          ctx.db.subjectDiary.deleteMany({ where: { teacherId: { in: input.employeeIds } } }),
          ctx.db.user.deleteMany({ where: { accountId: { in: regNumbers } } }),
          ctx.db.employees.deleteMany({
            where: {
              employeeId: {
                in: input.employeeIds,
              },
            },
          }),
        ]);
      } catch (error) {
        console.error(error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Something went wrong.",
        });
      }
    }),

  getEmployeesByDesignation: protectedProcedure
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
        return await ctx.db.employees.findMany({
          where: {
            designation: input.designation,
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

  generateEmployeeReport: protectedProcedure.query(async ({ ctx }) => {
    const employees = await ctx.db.employees.findMany();
    const headers = [
      { key: "employeeId", label: "Employee ID" },
      { key: "employeeName", label: "Employee Name" },
      { key: "designation", label: "Designation" },
      { key: "registrationNumber", label: "Registration Number" },
    ];

    return {
      pdf: await generatePdf(employees, headers, "Employee Report"),
    };
  }),
});
