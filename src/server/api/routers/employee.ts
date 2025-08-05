import { TRPCError } from "@trpc/server"
import { createTRPCRouter, publicProcedure } from "../trpc"
import { z } from "zod"
import { generatePdf } from "~/lib/pdf-reports"
import { userReg } from "~/lib/utils"
import { hash } from "bcrypt"

const employeeSchema = z.object({
  employeeName: z.string().min(2).max(100),
  fatherName: z.string().min(2).max(100),
  gender: z.enum(["MALE", "FEMALE", "CUSTOM"]),
  dob: z.string(),
  cnic: z.string().length(15),
  maritalStatus: z.enum(["Married", "Unmarried", "Widow", "Divorced"]),
  doj: z.string(),
  designation: z.enum(["ADMIN", "PRINCIPAL", "HEAD", "CLERK", "TEACHER", "WORKER"]),
  residentialAddress: z.string(),
  mobileNo: z.string().max(13),
  additionalContact: z.string().max(13).optional(),
  education: z.string().min(2).max(100),
  profilePic: z.string().optional(),
  cv: z.string().optional(),
})

export const EmployeeRouter = createTRPCRouter({
  getEmployees: publicProcedure.query(async ({ ctx }) => {
    try {
      const employees = await ctx.db.employees.findMany()
      return employees
    } catch (error) {
      console.error(error)
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Something went wrong.",
      })
    }
  }),

  getUnAllocateEmployees: publicProcedure.query(async ({ ctx }) => {
    try {
      const employees = await ctx.db.employees.findMany({
        where: {
          isAssign: false
        }
      })
      return employees
    } catch (error) {
      console.error(error)
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: "Something went wrong.",
      })
    }
  }),

  createEmployee: publicProcedure.input(employeeSchema).mutation(async ({ ctx, input }) => {
    try {
      const usersCount = await ctx.db.user.count({
        where: {
          accountType: input.designation as AccountTypeEnum,
        }
      })
      const userInfo = userReg(usersCount, input.designation)
      const newEmployee = await ctx.db.employees.create({
        data: {
          ...input,
          registrationNumber: userInfo.accountId,
          admissionNumber: userInfo.admissionNumber,
        },
      })
      const password = await hash(userInfo.admissionNumber, 10)
      await ctx.db.user.create({
        data: {
          accountId: userInfo.accountId,
          username: userInfo.username,
          email: userInfo.email.toLowerCase(),
          password,
          accountType: input.designation as AccountTypeEnum,
        },
      })
      return newEmployee
    } catch (error) {
      console.error(error)
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Something went wrong",
      })
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
        })
      } catch (error) {
        console.error(error)
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Something went wrong.",
        })
      }
    }),

  getEmployeesByDesignation: publicProcedure
    .input(
      z.object({
        designation: z.enum(["ADMIN", "PRINCIPAL", "HEAD", "CLERK", "TEACHER", "WORKER"]),
      }),
    )
    .query(async ({ ctx, input }) => {
      try {
        return await ctx.db.employees.findMany({
          where: {
            designation: input.designation,
          },
        })
      } catch (error) {
        console.error(error)
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Something went wrong.",
        })
      }
    }),

  generateEmployeeReport: publicProcedure
    .query(async ({ ctx }) => {
      const employees = await ctx.db.employees.findMany();
      const headers = [
        { key: 'employeeId', label: 'Employee ID' },
        { key: 'employeeName', label: 'Employee Name' },
        { key: 'designation', label: 'Designation' },
        { key: 'registrationNumber', label: 'Registration Number' }
      ];

      return {
        pdf: await generatePdf(employees, headers, 'Employee Report')
      };
    }),
})


