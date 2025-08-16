// File: user.ts (unchanged, as no errors reported)
import { TRPCError } from "@trpc/server"
import { createTRPCRouter, publicProcedure } from "../trpc"
import { z } from "zod"
import { generatePdf } from "~/lib/pdf-reports"

import dayjs from "dayjs"
import { hash } from "bcrypt"
const userSchema = z.object({
    username : z.string().min(2).max(100),
    email : z.string().email(),
    password : z.string().min(6).max(100),
    accountType: z.enum(["STUDENT", "FACULTY", "ADMIN" , "WORKER",  "HEAD", "PRINCIPAL", "CLERK",   "TEACHER",  "NONE", "ALL"]),

})

export const UserRouter = createTRPCRouter({
  getUsers: publicProcedure.query(async ({ ctx }) => {
    try {
      const users = await ctx.db.user.findMany()
      return users      
    } catch (error) {
      console.error(error)
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Something went wrong.",
      })
    }
  }),

  getUserById: publicProcedure.query(async ({ ctx }) => {
    try {
      const users = await ctx.db.user.findUnique({where: {id: ctx.session?.user.id ?? ""}})
            return users      
    } catch (error) {
      console.error(error)
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Something went wrong.",
      })
    }
  }),

  getUnAllocatedUsers: publicProcedure.query(async ({ ctx }) => {
    try {
      const users = await ctx.db.user.findMany({
       
      })
      return users
    } catch (error) {
      console.error(error)
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: "Something went wrong.",
      })
    }
  }),

  createUser: publicProcedure.input(userSchema).mutation(async ({ ctx, input }) => {
    try {
      const currentYear = dayjs().year().toString().slice(-2)
      const usersCount = await ctx.db.user.count({
        where :{
            accountType: input.accountType as AccountTypeEnum,
        }
      })
      const password = await hash(input.password,10)
      await ctx.db.user.create({
        data: {
          accountId:`msn-${input.accountType[0]}-${currentYear}-${usersCount + 1}`,
          username :`msn-${input.accountType}-${currentYear}-${usersCount + 1}`,
          email :`msn-${input.accountType}-${currentYear}-${usersCount + 1}@msns.edu.pk`,
          password
        },
      })
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